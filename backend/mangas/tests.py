from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Manga, Chapter
from django.utils import timezone

class MangaApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manga = Manga.objects.create(
            title="Test Manga",
            description="Test Description",
            type="manhwa",
            status="ongoing",
            cover_image="covers/test.jpg"
        )
        self.chapter = Chapter.objects.create(
            manga=self.manga,
            chapter_number="1",
            released_at=timezone.now(),
            pages=["/media/chapters/1/page1.jpg", "/media/chapters/1/page2.jpg"]
        )

    def test_get_manga_list(self):
        """Test retrieving list of mangas"""
        response = self.client.get('/api/mangas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Test Manga")

    def test_get_manga_detail(self):
        """Test retrieving manga details"""
        response = self.client.get(f'/api/mangas/{self.manga.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Manga")
        # Check if chapters are included
        self.assertTrue('chapters' in response.data)
        self.assertEqual(len(response.data['chapters']), 1)

    def test_get_chapter_detail(self):
        """Test retrieving chapter details"""
        response = self.client.get(f'/api/chapters/{self.chapter.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['chapter_number'], "1")
        # Check pages
        self.assertEqual(len(response.data['pages']), 2)
        self.assertEqual(response.data['pages'][0], "/media/chapters/1/page1.jpg")

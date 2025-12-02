from rest_framework import viewsets, filters, generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from .models import Manga, Chapter, Comment, Genre, DailyView, Bookmark, ReadingHistory, Rating
from .serializers import MangaSerializer, MangaDetailSerializer, ChapterDetailSerializer, CommentSerializer, GenreSerializer, UserSerializer, BookmarkSerializer, ReadingHistorySerializer, RatingSerializer
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .permissions import IsOwnerOrAdminOrReadOnly

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReadingHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if history exists for this manga, update it instead of creating new if logic requires
        # But here we use unique_together in model, so we might need to handle update explicitly or rely on frontend to call update
        # For simplicity, let's use update_or_create logic in perform_create or just save (model has unique constraint)
        # Actually, standard ModelViewSet create might fail if unique constraint exists.
        # Let's override create to use update_or_create logic.
        pass
    
    @action(detail=False, methods=['post'])
    def update_history(self, request):
        manga_id = request.data.get('manga')
        chapter_id = request.data.get('chapter')
        
        if not manga_id or not chapter_id:
            return Response({'error': 'manga and chapter are required'}, status=400)
            
        history, created = ReadingHistory.objects.update_or_create(
            user=request.user,
            manga_id=manga_id,
            defaults={'chapter_id': chapter_id}
        )
        
        serializer = self.get_serializer(history)
        return Response(serializer.data)

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Handle file uploads
        instance = serializer.instance
        files = request.FILES.getlist('files_input')
        
        if files:
            page_urls = []
            for f in files:
                # Save file to media
                path = default_storage.save(f'chapters/{instance.manga.id}/{instance.chapter_number}/{f.name}', ContentFile(f.read()))
                url = default_storage.url(path)
                page_urls.append(url)
            
            instance.pages = page_urls
            instance.save()
            
            # Refresh serializer data with updated pages
            serializer = self.get_serializer(instance)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

class MangaViewSet(viewsets.ModelViewSet):
    queryset = Manga.objects.all()
    serializer_class = MangaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        queryset = Manga.objects.all()
        
        # Filter by Featured
        is_featured = self.request.query_params.get('is_featured')
        if is_featured == 'true':
            queryset = queryset.filter(is_featured=True)

        # Filter by Type (e.g., Manhwa, Manhua)
        manga_type = self.request.query_params.get('type')
        if manga_type:
            queryset = queryset.filter(type__iexact=manga_type)

        # Filter by Status (e.g., Ongoing, Completed)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status__iexact=status)

        # Filter by Genre (contains)
        genre = self.request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(genres__name__icontains=genre)
        
        # Ordering
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
            
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment Views (Fail Silently if error occurs to prevent 500)
        try:
            # Increment Total Views
            instance.views += 1
            instance.save()

            # Increment Daily Views
            today = timezone.now().date()
            daily_view, created = DailyView.objects.get_or_create(manga=instance, date=today)
            daily_view.views += 1
            daily_view.save()
        except Exception:
            # Handle race conditions or other errors gracefully
            try:
                today = timezone.now().date()
                daily_view = DailyView.objects.get(manga=instance, date=today)
                daily_view.views += 1
                daily_view.save()
            except Exception:
                pass
        
        serializer = MangaDetailSerializer(instance)
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly]
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticatedOrReadOnly(), IsOwnerOrAdminOrReadOnly()]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['manga', 'chapter']
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user, name=self.request.user.username)
        else:
            serializer.save()

class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        manga_id = request.data.get('manga')
        score = request.data.get('score')
        
        if not manga_id or not score:
            return Response({'error': 'manga and score are required'}, status=400)

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            manga_id=manga_id,
            defaults={'score': score}
        )
        
        serializer = self.get_serializer(rating)
        return Response(serializer.data)

class AnalyticsViewSet(viewsets.ViewSet):
    def list(self, request):
        # 1. Total Stats
        total_mangas = Manga.objects.count()
        total_views = Manga.objects.aggregate(Sum('views'))['views__sum'] or 0
        total_chapters = Chapter.objects.count()
        
        # 2. Daily Views (Last 7 Days)
        today = timezone.now().date()
        last_7_days = today - timedelta(days=6)
        
        daily_stats = (
            DailyView.objects.filter(date__gte=last_7_days)
            .values('date')
            .annotate(total_views=Sum('views'))
            .order_by('date')
        )
        
        # Format for chart (ensure all days are present)
        chart_data = []
        current_date = last_7_days
        stats_dict = {stat['date']: stat['total_views'] for stat in daily_stats}
        
        while current_date <= today:
            chart_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'views': stats_dict.get(current_date, 0)
            })
            current_date += timedelta(days=1)
            
        # 3. Top Mangas (Most Views All Time or Recent)
        # Let's do Top 5 Most Viewed All Time for simplicity, or we can do recent
        top_mangas = Manga.objects.order_by('-views')[:5]
        top_mangas_data = [
            {'id': m.id, 'title': m.title, 'views': m.views, 'cover_image': m.cover_image}
            for m in top_mangas
        ]

        return Response({
            'total_mangas': total_mangas,
            'total_views': total_views,
            'total_chapters': total_chapters,
            'chart_data': chart_data,
            'top_mangas': top_mangas_data
        })

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'delete', 'post'] # Allow POST for actions

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({'error': 'new_password is required'}, status=400)
            
        user.set_password(new_password)
        user.save()
        
        return Response({'status': 'password reset successfully'})

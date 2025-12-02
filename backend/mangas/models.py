from django.db import models

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Manga(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    cover_image_file = models.ImageField(upload_to='covers/', blank=True, null=True)
    banner_image = models.URLField(max_length=500, blank=True)
    banner_image_file = models.ImageField(upload_to='banners/', blank=True, null=True)
    genres = models.ManyToManyField(Genre, blank=True)
    status = models.CharField(max_length=50, default="Ongoing")
    type = models.CharField(max_length=50, default="Manhwa")
    released_year = models.CharField(max_length=4, default="2022")
    author = models.CharField(max_length=255, default="Unknown")
    artist = models.CharField(max_length=255, default="Unknown")
    views = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.cover_image_file:
            self.cover_image = self.cover_image_file.url
        if self.banner_image_file:
            self.banner_image = self.banner_image_file.url
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Chapter(models.Model):
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name='chapters')
    chapter_number = models.CharField(max_length=50)
    released_at = models.DateTimeField(auto_now_add=True)
    pages = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-released_at']

    def __str__(self):
        return f"{self.manga.title} - {self.chapter_number}"

class Comment(models.Model):
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name='comments')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    name = models.CharField(max_length=100, default="Guest")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.name} on {self.manga.title}"

class Rating(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='ratings')
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name='ratings')
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)]) # 1-5 scale
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'manga')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update Manga average rating
        ratings = Rating.objects.filter(manga=self.manga)
        avg_rating = ratings.aggregate(models.Avg('score'))['score__avg']
        self.manga.rating = round(avg_rating, 1)
        self.manga.save()

    def __str__(self):
        return f"{self.user.username} - {self.manga.title} - {self.score}"

class DailyView(models.Model):
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name='daily_views')
    date = models.DateField(auto_now_add=True)
    views = models.IntegerField(default=0)

    class Meta:
        unique_together = ('manga', 'date')

    def __str__(self):
        return f"{self.manga.title} - {self.date} - {self.views}"

class Bookmark(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='bookmarks')
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'manga')

    def __str__(self):
        return f"{self.user.username} - {self.manga.title}"

class ReadingHistory(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='reading_history')
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    last_read_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_read_at']
        unique_together = ('user', 'manga')  # Keep one entry per manga per user (the latest chapter)

    def __str__(self):
        return f"{self.user.username} - {self.manga.title} - {self.chapter.chapter_number}"

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Manga, Chapter, Comment, Genre, Bookmark, ReadingHistory, Rating

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff', 'date_joined')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class BookmarkSerializer(serializers.ModelSerializer):
    manga_title = serializers.ReadOnlyField(source='manga.title')
    manga_cover = serializers.ReadOnlyField(source='manga.cover_image')
    
    class Meta:
        model = Bookmark
        fields = ['id', 'manga', 'manga_title', 'manga_cover', 'created_at']
        read_only_fields = ['user']

class ReadingHistorySerializer(serializers.ModelSerializer):
    manga_title = serializers.ReadOnlyField(source='manga.title')
    manga_cover = serializers.ReadOnlyField(source='manga.cover_image')
    chapter_number = serializers.ReadOnlyField(source='chapter.chapter_number')
    
    class Meta:
        model = ReadingHistory
        fields = ['id', 'manga', 'manga_title', 'manga_cover', 'chapter', 'chapter_number', 'last_read_at']
        read_only_fields = ['user']

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'chapter_number', 'released_at']

class ChapterDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'chapter_number', 'released_at', 'pages', 'manga']

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'manga', 'chapter', 'user', 'user_username', 'user_avatar', 'name', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_user_avatar(self, obj):
        # Placeholder for avatar, or implement if UserProfile has avatar
        return None

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'manga', 'score', 'created_at']
        read_only_fields = ['user']

class MangaSerializer(serializers.ModelSerializer):
    chapters = serializers.SerializerMethodField()
    genres = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Genre.objects.all()
    )

    class Meta:
        model = Manga
        fields = '__all__'

    def get_chapters(self, obj):
        chapters = obj.chapters.all()[:2]
        return ChapterSerializer(chapters, many=True).data

class MangaDetailSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    genres = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Genre.objects.all()
    )

    class Meta:
        model = Manga
        fields = '__all__'

from django.urls import path, include
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'mangas', views.MangaViewSet)
router.register(r'chapters', views.ChapterViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'genres', views.GenreViewSet)
router.register(r'bookmarks', views.BookmarkViewSet, basename='bookmarks')
router.register(r'history', views.ReadingHistoryViewSet, basename='history')
router.register(r'ratings', views.RatingViewSet, basename='ratings')
router.register(r'analytics', views.AnalyticsViewSet, basename='analytics')
router.register(r'admin/users', views.AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
]

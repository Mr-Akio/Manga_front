from django.contrib import admin
from django import forms
from .models import Manga, Chapter, Genre
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

admin.site.register(Genre)

class MultipleFileInput(forms.FileInput):
    def __init__(self, attrs=None):
        super().__init__(attrs)
        self.attrs['multiple'] = 'multiple'

    def value_from_datadict(self, data, files, name):
        if hasattr(files, 'getlist'):
            return files.getlist(name)
        return files.get(name)

class ChapterAdminForm(forms.ModelForm):
    pages_input = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 10, 'cols': 80}),
        required=False,
        help_text="Enter image URLs, one per line."
    )
    files_input = forms.Field(
        widget=MultipleFileInput(),
        required=False,
        help_text="Upload multiple images for pages."
    )

    def clean_files_input(self):
        key = 'files_input'
        if self.prefix:
            key = f'{self.prefix}-{key}'
            
        if hasattr(self.files, 'getlist'):
            files = self.files.getlist(key)
        else:
            files = self.files.get(key)
            if files and not isinstance(files, list):
                files = [files]
        return files

    class Meta:
        model = Chapter
        fields = '__all__'
        exclude = ('pages',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pages:
            self.fields['pages_input'].initial = '\n'.join(self.instance.pages)

    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle URLs input
        pages_text = self.cleaned_data.get('pages_input', '')
        current_pages = [url.strip() for url in pages_text.split('\n') if url.strip()]
        
        # Handle File Uploads
        # We can use cleaned_data here since we processed it in clean_files_input
        # But FileField/Field cleaning might be tricky with multiple files if not standard
        # Let's rely on self.files again to be safe, using the robust logic
        
        key = 'files_input'
        if self.prefix:
            key = f'{self.prefix}-{key}'
        
        if hasattr(self.files, 'getlist'):
            files = self.files.getlist(key)
        else:
            files = self.files.get(key)
            if files and not isinstance(files, list):
                files = [files]
        
        if files:
            for f in files:
                # Skip if empty or not a file
                if not hasattr(f, 'read'):
                    continue
                    
                # Save file to media
                # Ensure chapter number is safe for path
                chapter_num = instance.chapter_number if instance.chapter_number else 'unknown'
                path = default_storage.save(f'chapters/{chapter_num}/{f.name}', ContentFile(f.read()))
                url = default_storage.url(path)
                current_pages.append(url)
        
        instance.pages = current_pages
        
        if commit:
            instance.save()
        return instance

class ChapterInline(admin.StackedInline):
    model = Chapter
    form = ChapterAdminForm
    extra = 1

@admin.register(Manga)
class MangaAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'status', 'views', 'rating', 'created_at')
    search_fields = ('title',)
    list_filter = ('type', 'status', 'is_featured')
    inlines = [ChapterInline]

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    form = ChapterAdminForm
    list_display = ('manga', 'chapter_number', 'released_at')
    list_filter = ('manga',)
    search_fields = ('manga__title', 'chapter_number')

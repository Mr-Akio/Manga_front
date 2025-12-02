@echo off
echo Installing dependencies...
python -m pip install django mysqlclient djangorestframework django-cors-headers
if %errorlevel% neq 0 exit /b %errorlevel%

echo Creating backend directory...
if not exist backend mkdir backend
cd backend

echo Starting Django project...
python -m django startproject manga_project .
if %errorlevel% neq 0 exit /b %errorlevel%

echo Creating mangas app...
python -m django startapp mangas
if %errorlevel% neq 0 exit /b %errorlevel%

echo Done.

@echo off
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin https://github.com/Mr-Akio/Manga_front.git
git remote set-url origin https://github.com/Mr-Akio/Manga_front.git
git push -u origin main
pause

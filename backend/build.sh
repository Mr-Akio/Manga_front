#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# เพิ่มบรรทัดนี้ลงไป (เพื่อสร้าง Admin)
# พอ Deploy เสร็จแล้ว ให้ลบบรรทัดนี้ออกนะครับ
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('mrjo', 'admin@example.com', '062558') if not User.objects.filter(username='mrjo').exists() else None" | python manage.py shell
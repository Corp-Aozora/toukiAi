#!/usr/bin/env bash
# exit on error
set -o errexit

# 既存のRustのパスをPATHに追加
export PATH="/usr/local/cargo/bin:$PATH"


pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py superuser

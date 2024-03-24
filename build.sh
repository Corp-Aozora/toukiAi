#!/usr/bin/env bash
# exit on error
set -o errexit

# Rustのインストール
# Rustupスクリプトをダウンロードして実行
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# 環境変数PATHにRustのパスを追加
# このスクリプト内でのみ有効
export PATH="$HOME/.cargo/bin:$PATH"


pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py superuser

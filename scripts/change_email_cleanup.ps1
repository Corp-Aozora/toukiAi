# PostgreSQLのパス
$pg_path = "C:\\Program Files\\PostgreSQL\\16rc1\\bin\\"

# データベース接続情報
$db_host = "localhost"
$db_port = "5432"
$db_name = "toukiai"
$db_user = "tatsuyasaga"
$db_password = "saga2497"

# SQLコマンド（1日以上経過したメールアドレス変更申請を削除）
$sql_command = @"
DELETE FROM EmailChange WHERE created_at < NOW() - INTERVAL '1 day';
"@

# PGPASSWORD環境変数を設定
$env:PGPASSWORD = $db_password

# SQLコマンドを実行
& "$pg_path\\psql.exe" -h $db_host -p $db_port -d $db_name -U $db_user -c $sql_command

# PGPASSWORD環境変数をクリア
Remove-Item Env:\\PGPASSWORD
# 公開用データベースへの復元スクリプト（full_restore_sql.ps1）

param (
    [string]$psqlPath = "C:\Program Files\PostgreSQL\16rc1\bin\psql.exe",
    [string]$backupFile = "C:\Users\PC_User\AppData\Local\Programs\Python\Python311\toukiAiBackUp\2024-05-05T23_59Z.sql",
    [string]$dbhost = "dpg-corihn7sc6pc73dojung-a.singapore-postgres.render.com",
    [string]$username = "aozorasaga",
    [string]$dbName = "souzokutoukikun_pro"
)

# パスワードを環境変数として設定
$env:PGPASSWORD = "ki3BPE6I0zzZ9zxKyhtFdMEJHo0RmNvW"

# 接続文字列を使って psql コマンドを実行
$connectionString = "host=$dbhost dbname=$dbName user=$username sslmode=require"
& $psqlPath -d $connectionString -f $backupFile

Write-Output "Restoration completed for database: $dbName"

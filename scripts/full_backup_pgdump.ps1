# バックアップを取る

param (
    [string]$pgDumpPath = "C:\Program Files\PostgreSQL\16rc1\bin\pg_dump.exe",
    [string]$backupDir = "C:\Users\PC_User\AppData\Local\Programs\Python\Python311\toukiAiBackUp\",
    [string]$environment = "dev"  # "dev" または "prod"を指定して実行する
)

# PGPASSFILE 環境変数を設定
$env:PGPASSFILE = "C:\Users\PC_User\.pgpass"

# 開発用と公開用の接続情報を定義
$devHost = "dpg-cndci6f79t8c738dmkl0-a.singapore-postgres.render.com"
$devUsername = "souzokutoukikun"
$devDbName = "souzokutoukikun"

$prodHost = "dpg-corihn7sc6pc73dojung-a.singapore-postgres.render.com"
$prodUsername = "aozorasaga"
$prodDbName = "souzokutoukikun_pro"

# 環境に応じて接続情報を選択
if ($environment -eq "dev") {
    $dbHost = $devHost
    $username = $devUsername
    $dbName = $devDbName
    $backupFile = Join-Path -Path $backupDir -ChildPath "dev_full.backup" # ファイル名を指定する
} elseif ($environment -eq "prod") {
    $dbhost = $prodHost
    $username = $prodUsername
    $dbName = $prodDbName
    $backupFile = Join-Path -Path $backupDir -ChildPath "prod_full.backup" # ファイル名を指定する
} else {
    Write-Error "Invalid environment specified: $environment"
    exit 1
}

# pg_dumpコマンドを実行してバックアップ
& $pgDumpPath -h $dbHost -U $username -Fc --blobs $dbName | Out-File -FilePath $backupFile -Encoding ASCII


Write-Output "Backup completed for environment: $environment"
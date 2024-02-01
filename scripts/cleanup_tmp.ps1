# 削除対象のディレクトリを指定
$dir_path = 'C:\Users\PC_User\AppData\Local\Programs\Python\Python311\toukiAi\toukiAi\media\tmp'

# 現在の時間を取得
$now = Get-Date

# ディレクトリ内の全てのファイルに対して処理を行う
Get-ChildItem -Path $dir_path | ForEach-Object {
    # ファイルの最終アクセス時間を取得
    $file_time = $_.LastAccessTime

    # 最終アクセス時間が3日以上前であれば、そのファイルを削除
    if ($now - $file_time).TotalDays -gt 3 {
        Remove-Item $_.FullName
    }
}

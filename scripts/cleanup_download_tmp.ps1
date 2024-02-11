# パスを指定
$Path = "C:\Users\PC_User\AppData\Local\Programs\Python\Python311\toukiAi\toukiAi\media\download_tmp"

# 現在の日時から24時間前の日時を取得
$limit = (Get-Date).AddHours(-24)

# 指定したパス内の各ファイルに対して処理を行う
Get-ChildItem -Path $Path | ForEach-Object {
    # ファイルの作成日時が24時間前よりも前であれば、そのファイルを削除
    if ($_.CreationTime -lt $limit) {
        Remove-Item $_.FullName
    }
}
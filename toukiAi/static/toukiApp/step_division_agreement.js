"use strict";

window.addEventListener("load", ()=>{
    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.addEventListener("click", downloadPDF);
})

function downloadPDF() {
    const doc = new window.jspdf.jsPDF({
        orientation: "portrait", // or "landscape"
        unit: "mm",
        format: "a4"
    });
    // Base64エンコードされたフォントデータ（非常に長い文字列）
    // VFSにフォントデータを追加し、フォントとして使用可能にする
    doc.addFileToVFS('ZenOldMincho-Regular.ttf', zenOldMinchoBase64);
    doc.addFont('ZenOldMincho-Regular.ttf', 'ZenOldMincho', 'normal');

    // フォントを設定
    doc.setFont('ZenOldMincho');

    // 行の最大数
    const maxLinesPerPage = 48;
    // 行の高さ
    const lineHeight = 10; // 変更が必要な場合は調整してください
    let currentLine = 0;

    // print_pageのテキストを取得
    const text = document.getElementById('print_page').innerText;
    
    // テキストを行で分割
    const lines = text.split('\n');

    lines.forEach((line, index) => {
        // 現在のページの行数が最大に達した場合、新しいページを追加
        if (currentLine >= maxLinesPerPage) {
            doc.addPage();
            currentLine = 0; // ラインカウンタをリセット
        }

        // テキストを追加
        doc.text(line, 10, 10 + (currentLine * lineHeight));
        currentLine++;
    });

    // PDFをダウンロード
    doc.save('遺産分割協議証明書.pdf');
}
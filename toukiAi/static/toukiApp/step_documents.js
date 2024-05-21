"use strict";

/**
 * 縮小率を取得する
 * @param {number} viewportWidth 
 * @returns 
 */
function getScaledRate(viewportWidth){
    return viewportWidth > 767? 1:
    viewportWidth > 700? 0.9:
    viewportWidth > 635? 0.8:
    viewportWidth > 555? 0.7:
    viewportWidth > 485? 0.6:
    viewportWidth > 415? 0.5:
    0.4;
}

/**
 * 要素の途中で改ページされるときは、その要素全体を次のページに表示させる
 * @param {number} marginTop 
 * @param {number} marginBottom 
 */
function preventElementSplitOnPageBreak(marginTop, marginBottom) {

    const viewportWidth = window.innerWidth;
    const rate = getScaledRate(viewportWidth);

    const usableHeight = (1271.5 - marginTop - marginBottom) * rate; // A4の高さ（1123）- 上下のマージン

    // 対象の要素（.signature）の位置を取得し、改ページ判断を行う
    const elements = document.querySelectorAll('.print_per_section .signature');
    elements.forEach(el => {

        // 親要素内での相対的な位置を計算
        const parentRect = el.closest('.print_per_section').getBoundingClientRect();
        const childRect = el.getBoundingClientRect();
        const relativeTop = childRect.top - parentRect.top;

        // 署名欄がページをまたぐとき
        if(Math.floor(relativeTop / usableHeight) !== Math.floor((relativeTop + childRect.height) / usableHeight)){
            el.style.pageBreakBefore = 'always'; // 要素の直前で改ページ
        } else {
            el.style.pageBreakBefore = 'auto'; // デフォルトの挙動
        }
    });
};

window.addEventListener("DOMContentLoaded", ()=>{

    class Form{
        constructor(){
            this.backBtn = document.getElementById("backBtn");
            this.backBtnSpinner = document.getElementById("backBtnSpinner");

            this.downloadPdfBtn = document.getElementById("downloadPdfBtn");
            this.downloadPdfBtnSpinner = document.getElementById("downloadPdfBtnSpinner");

            this.printPageWrapper = document.getElementById("print_page_wrapper");
            this.printPerSection = document.getElementsByClassName("print_per_section");
            this.printSectionHr = document.querySelectorAll(".d-lg-flex hr");
        }
    }

    const instance = new Form();
    const {backBtn, backBtnSpinner, downloadPdfBtn, downloadPdfBtnSpinner, printPageWrapper} = instance;

    // ステップ４に戻る
    function backToStepFour(){

        backBtn.disabled = true;
        backBtnSpinner.style.display = "";
        
        const data = { "progress" : parseFloat(progress) };
    
        fetch('step_back', {  // PythonビューのURL
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            mode: "same-origin"
        }).then(response => {
            return response.json();
        }).then(response => {
    
            if (response.status === 'success'){
                window.location.href = 'step_four';
            }else{
                window.location.href = 'step_division_agreement';
            }
        }).catch(e => {
            basicLog("backToStepFour", e, "前のページに戻る処理でエラー発生");
            window.location.href = 'step_division_agreement';
        });
    }

    // 表示サイズに合わせて2通目以降を再配置する
    function relocatePrintArea(){
        
        // 表示画面のwidth
        const viewportWidth = window.innerWidth;
        
        if(viewportWidth > 767)
            return;

        const rate = getScaledRate(viewportWidth);
        const diffRate = 1 - rate;

        let top = 0;
        const relatives = document.getElementsByClassName('print_per_section');
        // 縮小に合わせてtopを変更する
        for(let i = 0, len = relatives.length; i < len; i++){

            const relative = relatives[i];
            const relativeHeight = relative.getBoundingClientRect().height;
            const originalHeight = relativeHeight / rate;
            
            const diff = (originalHeight * diffRate) / 2;
            relative.style.top = `${top - diff}px`;
            top += relativeHeight + 30;
        }

        document.getElementById("print_page_wrapper").style.height = `${top}px`;
    }

    // 印刷範囲をpdfに変換してダウンロードさせる
    function convertHtmlToPdf(){

        // pdfのファイル名またはcssのurlを取得する
        function getFileNameOrCss(isCss = false){

            const dict = {
                "/toukiApp/step_division_agreement": isCss? 
                    "https://corp-aozora.github.io/css_for_pdf/step_division_agreement.css":
                    "遺産分割協議証明書.pdf",
                "/toukiApp/step_POA": isCss? 
                    "https://corp-aozora.github.io/css_for_pdf/step_POA.css":
                    "委任状.pdf",
                "/toukiApp/step_application_form": isCss? 
                    "https://corp-aozora.github.io/css_for_pdf/step_application_form.css":
                    "登記申請書.pdf",
                "/toukiApp/step_diagram": isCss? 
                    "https://corp-aozora.github.io/css_for_pdf/step_diagram.css":
                    "相続関係説明図.pdf",
            }

            const path = window.location.pathname;
            return dict[path];
        }

        // pdf用のcssを設定する
        function addCssForPdf(htmlClone){
            const cssArr = [
                "https://corp-aozora.github.io/css_for_pdf/base.css",
                "https://corp-aozora.github.io/css_for_pdf/header.css",
                "https://corp-aozora.github.io/css_for_pdf/step_documents.css",
                "https://corp-aozora.github.io/css_for_pdf/step_common.css",
            ]
            cssArr.push(getFileNameOrCss(true))

            const head = htmlClone.querySelector('head');

            cssArr.forEach(css => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = css;
                head.appendChild(link);
            });
        }

        const fileName = getFileNameOrCss();
        if(!fileName)
            return;

        downloadPdfBtn.disabled = true;
        downloadPdfBtnSpinner.style.display = "";
        
        const htmlClone = document.documentElement.cloneNode(true);
        addCssForPdf(htmlClone);

        const hiddenEls = htmlClone.querySelectorAll(".modal, .top, .top + hr");
        hiddenEls.forEach(el => {
            el.style.display = "none";
        });
        
        const updatedHtml = htmlClone.outerHTML;
        
        const data = { "html_content": updatedHtml };
        
        fetch('convert_html_to_pdf', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            mode: "same-origin"
        }).then(response => response.json())
        .then(data => {

            downloadPdfBtn.disabled = false;
            downloadPdfBtnSpinner.style.display = "none";
            
            if (data.pdf_url) {
                // PDFをBlobとして取得
                fetch(data.pdf_url)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;
                        downloadLink.download = fileName;
        
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
        
                        // Object URLを解放
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(e => {
                        basicLog("convertHtmlToPdf", e, `PDFのダウンロード中にエラーが発生しました。`);
                        alert("ページを更新した後にクリックしてもエラーになる場合は、恐れ入りますが、お問い合わせをお願いします。");
                    });
            } else {
                basicLog("convertHtmlToPdf", null, `ダウンロードリンクを取得できませんでした。`);
                alert("ページを更新した後にクリックしてもエラーになる場合は、恐れ入りますが、お問い合わせをお願いします。");
            }
        }).catch(e => {
            
            downloadPdfBtn.disabled = false;
            downloadPdfBtnSpinner.style.display = "none";
            basicLog("convertHtmlToPdf", e, `pdfへの変換処理でエラー。`);
            alert("ページを更新した後にクリックしてもエラーになる場合は、恐れ入りますが、お問い合わせをお願いします。");
        })
    }

    // ボタンにイベント設定
    function setEvent(){

        window.addEventListener("resize", ()=>{
            relocatePrintArea();
        })

        backBtn.addEventListener("click", ()=>{
            backToStepFour();
        })

        downloadPdfBtn.addEventListener("click", ()=>{
            convertHtmlToPdf();
        })
    }

    setEvent();

    // 相関図のページは違う再配置方法
    const url = window.location.href;
    if(url.includes("step_diagram"))
        return;

    relocatePrintArea();
})
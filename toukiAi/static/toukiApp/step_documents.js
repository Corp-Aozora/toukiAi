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
            this.printPerSection = document.getElementsByClassName("print_per_section");
            this.printSectionHr = document.querySelectorAll(".d-lg-flex hr");
        }
    }

    const instance = new Form();
    const {backBtn, backBtnSpinner} = instance;

    // ボタンにイベント設定
    function addEventToBtn(){
        backBtn.addEventListener("click", ()=>{
            backToStepFour(instance);
        })
    }

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
    function relocatePrintPage(){
        
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

    if(backBtn)
        addEventToBtn();

    relocatePrintPage();
    
    window.addEventListener("resize", ()=>{
        relocatePrintPage();
    })
})
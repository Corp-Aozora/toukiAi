"use strict";

// 最後にいた会員ページ（作業ページのみ）をセッションに取得する
function storeCurrentLocation(){
    const workPages = [
        "/toukiApp/step_one", 
        "/toukiApp/step_two", 
        "/toukiApp/step_three", 
        "/toukiApp/step_four", 
        "/toukiApp/step_five",
        "/toukiApp/step_six"
    ];

    const currentUrl = window.location.pathname;

    if(workPages.includes(currentUrl))
        sessionStorage.setItem('preUrl', window.location.href);
}

window.addEventListener("load", ()=>{

    // 進捗状況のオフキャンバスを表示するボタンにイベント設定
    function setEventToProgressList(){
        const progress_list_offcanvas = document.getElementById("progress_list_offcanvas");
        if(!progress_list_offcanvas)
            return;
    
        const btns = document.querySelectorAll(".offcanvas-body button");
        const hrefs = ["one", "two", "three", "four", "five", "six", "inquiry"];
        for(let i = 0, len = btns.length; i < len; i++){
            const btn = btns[i];
            btn.addEventListener("click", ()=>{
                window.location.href = `/toukiApp/step_${hrefs[i]}`;
            })
        }
    }

    storeCurrentLocation();
    setEventToProgressList();
})
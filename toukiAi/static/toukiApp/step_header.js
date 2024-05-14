"use strict";

const logout = document.querySelector("#logout");

// 最後にいた会員ページ（作業ページのみ）をセッションに取得する
function storeCurrentLocation(){
    const exclude = [
        "/account/option_select/", 
        "/account/password/change/", 
        "/account/change_email/", 
        "/account/delete_account/", 
        "/account/logout/",
        "/account/bank_transfer/"
    ];

    const currentUrl = window.location.pathname;

    if(!exclude.includes(currentUrl))
        sessionStorage.setItem('preUrl', window.location.href);
}

/**
 * 進捗状況のオフキャンバスを表示するボタンにイベント設定
 * @returns 
 */
function setProgressListOffcanvasBtns(){

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

/**
 * 以下、イベント
 */
window.addEventListener("load", ()=>{

    // 最後にいた会員ページ（作業ページのみ）をセッションに取得する
    storeCurrentLocation();

    // 進捗状況のオフキャンバスを表示するボタンにイベント設定
    setProgressListOffcanvasBtns();


})
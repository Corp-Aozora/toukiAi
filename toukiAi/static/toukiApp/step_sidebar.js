"use strict";

const sidebar = document.getElementById("sidebar");
const btnInquiry = document.getElementById("btnInquiry");

//ロード時
window.addEventListener("load", ()=>{
    //お問い合わせページが開かれたとき、保持している進捗状況情報をサイドバーに反映させる

})

//お問い合わせボタンが押されたとき
btnInquiry.addEventListener("click", ()=>{
    //進捗状況をセッション情報として取得する
    let page = location.pathname.replace(/\/+$/, "").split('/').pop();
    sessionStorage.setItem("page", page);

    //データベースに登録する
})
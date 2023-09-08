"use strict";

let isIntroButton = "isIntroButton";
let isSupportButton = "isSupportButton";
let isChargeButton = "isChargeButton";
let isQAButton = "isQAButton";
let yes = "yes"
const toIntroContentBtn = document.getElementById("toIntroContentBtn");
const toSupportContentBtn = document.getElementById("toSupportContentBtn");
const toChargeContentBtn = document.getElementById("toChargeContentBtn");
const toQAContentBtn = document.getElementById("toQAContentBtn");

/*
    index以外のページにいるときにヘッダーにあるボタンが押されたとき、
    どのボタンが押されたかを取得してindexに移動する
*/
function moveToIndex(pathname, e){
    const indexURL = "/index/"

    // index以外のページのとき
    if(pathname !== indexURL) {

        //押したボタンをセッションに取得させる
        if(e.target.classList.contains("toIntroContent")){
            sessionStorage.setItem(isIntroButton, yes);
        }else if(e.target.classList.contains("toSupportContent")){
            sessionStorage.setItem(isSupportButton, yes);
        }else if(e.target.classList.contains("toChargeContent")){
            sessionStorage.setItem(isChargeButton, yes);
        }else if(e.target.classList.contains("toQAContent")){
            sessionStorage.setItem(isQAButton, yes);
        }
        
        //indexに移動する
        location.href = "/";
    }    
}

/*
    イベント集
*/
toIntroContentBtn.addEventListener("click", (e)=>{
    moveToIndex(location.pathname, e);
})

toSupportContentBtn.addEventListener("click", (e)=>{
    moveToIndex(location.pathname, e);
})

toChargeContentBtn.addEventListener("click", (e)=>{
    moveToIndex(location.pathname, e);
})

toQAContentBtn.addEventListener("click", (e)=>{
    moveToIndex(location.pathname, e);
})
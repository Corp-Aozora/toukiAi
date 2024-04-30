"use strict";

const navToSessionKey = "navToSessionKey";
const navToClass = {
    "toIntro": "intro",
    "toSupport": "support",
    "toCharge" : "charge",
    "toCompare" : "compare",
    "toQA" : "QA",
    "toInquiry" : "inquiry"
}

const toIntroBtn = document.getElementById("toIntroBtn");
const toSupportBtn = document.getElementById("toSupportBtn");
const toChargeBtn = document.getElementById("toChargeBtn");
const toCompareBtn = document.getElementById("toCompareBtn");
const toQABtn = document.getElementById("toQABtn");
const toInquiryBtn = document.getElementById("toInquiryBtn");
const headerBtns = [toIntroBtn, toSupportBtn, toChargeBtn, toCompareBtn, toQABtn, toInquiryBtn];

/*
    index以外のページにいるときにヘッダーにあるボタンが押されたとき、
    どのボタンが押されたかを取得してindexに移動する
*/
function moveToIndex(pathname, e){
    const indexURLs = ["/toukiApp/", "/toukiApp/index"];

    // index以外のページのとき
    if(!indexURLs.includes(pathname)) {
        //押したボタンをセッションに取得させる
        for(let className in navToClass){
            if(e.target.classList.contains(className)){
                sessionStorage.setItem(navToSessionKey, navToClass[className]);
                break;
            }
        }
                
        //indexに移動する
        location.href = "/";
    }    
}

/*
    イベント集
*/
window.addEventListener("load",()=>{
    //各ボタンにイベントを設定する
    for(let i = 0; i < headerBtns.length; i++){
        headerBtns[i].addEventListener("click",(e)=>{
            moveToIndex(location.pathname, e);

            const closeBtn = header.getElementsByClassName("btn-close")[0];
            const event = new Event("click");
            closeBtn.dispatchEvent(event);
        })
    }
})

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
const logoutBtn = document.getElementById("logoutBtn");
const headerBtns = [toIntroBtn, toSupportBtn, toChargeBtn, toCompareBtn, toQABtn, toInquiryBtn, logoutBtn];

const toggler = document.getElementById("toggler");

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
        if(i < headerBtns.length - 1){
            headerBtns[i].addEventListener("click",(e)=>{
                moveToIndex(location.pathname, e);

                const closeBtn = header.getElementsByClassName("btn-close")[0];
                const event = new Event("click");
                closeBtn.dispatchEvent(event);
            })
        }else{
            if(headerBtns[i] !== null){
                headerBtns[i].addEventListener("click",(e)=>{
                    const date1 = new Date();
                    const date2 = date1.getHours() + "時" + 
                                date1.getMinutes() + "分" + 
                                date1.getSeconds() + "秒"
                    sessionStorage.setItem("lastUpdateDate", date2);
                })
            }
        }
    }

    toggler.addEventListener("click",(e)=>{
        //
    })
})

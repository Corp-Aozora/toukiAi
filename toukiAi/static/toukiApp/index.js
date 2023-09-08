"use strict";

const introContent = document.getElementById('introContent');
const supportContent = document.getElementById('supportContent');
const chargeContent = document.getElementById('chargeContent');
const qaContent = document.getElementById('qaContent');
const header = document.getElementById("header");
const toIntroContent = document.getElementsByClassName("toIntroContent");
const toSupportContent = document.getElementsByClassName("toSupportContent");
const toChargeContent = document.getElementsByClassName("toChargeContent");
const toQAContent = document.getElementsByClassName("toQAContent");

/*
    イベント集
*/
window.addEventListener("load", ()=>{
    //ヘッダーのボタンに対象の項目へスクロールするイベントを設定
    addScrollEvent(toIntroContent, introContent);
    addScrollEvent(toSupportContent, supportContent);
    addScrollEvent(toChargeContent, chargeContent);
    addScrollEvent(toQAContent, qaContent);

    //他のページでヘッダーのボタンが押された場合でも対象の項目へスクロールさせる
    if(sessionStorage.getItem(isIntroButton) === yes){
        scrollToTarget(introContent, 0);
    }
    else if(sessionStorage.getItem(isSupportButton) === yes){
        scrollToTarget(supportContent, 0);
    }
    else if(sessionStorage.getItem(isChargeButton) === yes){
        scrollToTarget(chargeContent, 0);
    }
    else if(sessionStorage.getItem(isQAButton) === yes){
        scrollToTarget(qaContent, 0);
    }

    //ログアウトボタンが押されたときモーダルを表示してログアウトが完了したことを知らせる
    if(sessionStorage.getItem("logout") === "true"){
        const logoutModal = new bootstrap.Modal(document.getElementById("logoutModal"));
        const lastUpdateDate = document.getElementById("lastUpdateDate");
        lastUpdateDate.innerHTML = sessionStorage.getItem("lastUpdateDate");
        logoutModal.show();
    }

    //セッション情報を初期化
    sessionStorage.clear();
}) 

/**
 * スクロールイベントを設定する
 * @param {array element} linkFrom
 * @param {element} linkTo
 */
function addScrollEvent(linkFrom, linkTo){
    for(let i = 0; i < linkFrom.length; i++){
        linkFrom[i].addEventListener("click", (e)=>{
            moveToIndex(location.pathname, e);
            scrollToTarget(linkTo, 0);
        })
    }
}
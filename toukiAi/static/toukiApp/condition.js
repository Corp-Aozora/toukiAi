"use strict";

/**
    変数
*/
const checkBoxes = document.getElementsByTagName("input");
const checkBoxesArea = document.getElementsByClassName("input-group-text");
let checkedCount = 0;

/**
    利用できるか判別する処理
    @param {event} e
*/
function showResult(e){
    const signupURL = "/account/signup/";
    const btnSignup = document.getElementById("btnSignup");
    const availableText = document.getElementById("availableText");
    const linkToSignup = document.getElementById("linkToSignup");

    //チェックが入ったとき
    if(e.target.checked){
        //チェックされたボタンのカウントを変更する
        checkedCount += 1;

        //全部にチェックが入ったとき
        if(checkedCount === checkBoxes.length){
            //登録ボタンを有効化、URLを設定、利用できる旨のテキストを表示する
            btnSignup.disabled = false;
            linkToSignup.setAttribute("href", signupURL);
            slideDown(availableText);            
        }
    }else{
        //それ以外のとき
        //チェックされたボタンのカウントを変更する
        checkedCount -= 1;

        //登録ボタンを無効化、URLを削除、利用できる旨のテキストを非表示にする
        btnSignup.disabled = true;
        linkToSignup.removeAttribute("href");
        slideUp(availableText);        
    }
}

/**
    イベント集
*/
window.addEventListener("load", ()=>{
    //チェックボックスにイベントを設定
    for(let i = 0; i < checkBoxes.length; i++){
        checkBoxes[i].addEventListener("change", (e)=>{
            showResult(e);
        })
    }
})
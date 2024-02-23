"use strict";

/**
    変数
*/
const cbs = Array.from(document.getElementsByTagName("input"));

/**
 * 利用できるか判別する処理
 * @param {event} e
*/
function showResult(e){
    const btnSignup = document.getElementById("btnSignup");
    const availableText = document.getElementById("availableText");
    const signupLink = document.getElementById("signupLink");
    const signupURL = "/account/signup/";
    //アカウント登録へボタンの無効化、URLを削除、利用できる旨のテキストを非表示にする
    function disableSignUpBtn(){
        btnSignup.disabled = true;
        signupLink.removeAttribute("href");
        slideUp(availableText);
    }
    //チェックが入ったとき
    if(e.target.checked){
        //全てチェックされたとき
        if(cbs.every(cb => cb.checked)){
            //アカウント登録へボタンを有効化、URLを設定、利用できる旨のテキストを表示する
            btnSignup.disabled = false;
            signupLink.setAttribute("href", signupURL);
            slideDownAndScroll(availableText);        
        }else{
            disableSignUpBtn();
        }
    }else{
        //それ以外のとき
        disableSignUpBtn();
    }
}

/**
 * イベントリスナー
 */
window.addEventListener("load", ()=>{
    //各チェックボックスにイベントを設定
    Array.from(cbs).forEach(checkBox => checkBox.addEventListener("change", showResult));
})
"use strict";

/**
    変数
*/
const checkBoxes = document.getElementsByTagName("input");

/**
 * 利用できるか判別する処理
 * @param {event} e
*/
function showResult(e){
    const btnSignup = document.getElementById("btnSignup");
    const availableText = document.getElementById("availableText");
    const signupLink = document.getElementById("signupLink");
    const signupURL = "/account/signup/";
    let checkedCount = 0;
    //チェックが入ったとき
    if(e.target.checked){
        //チェックされたボタンのカウントを変更する
        checkedCount += 1;

        //全部にチェックが入ったとき
        if(checkedCount === checkBoxes.length){
            //登録ボタンを有効化、URLを設定、利用できる旨のテキストを表示する
            btnSignup.disabled = false;
            signupLink.setAttribute("href", signupURL);
            slideDownAndScroll(availableText);        
        }
    }else{
        //それ以外のとき
        //チェックされたボタンのカウントを変更する
        checkedCount -= 1;

        //登録ボタンを無効化、URLを削除、利用できる旨のテキストを非表示にする
        btnSignup.disabled = true;
        signupLink.removeAttribute("href");
        slideDownAndScroll(availableText);        
    }
}

/**
 * イベントリスナー
 */
window.addEventListener("load", ()=>{
    //各チェックボックスにイベントを設定
    Array.from(checkBoxes).forEach(checkBox => {checkBox.addEventListener("change", showResult)});
})
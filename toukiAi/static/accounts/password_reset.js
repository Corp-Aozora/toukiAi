"use strict";

requiredInputArr = [email];
messageElArr = [emailMessageEl];
messageArr = [emailMessage];

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} input 
 */
function accountResetPassword(input){
    let url = "is_user_email"
  
    fetch(url, {
        method: 'POST',
        body: `email=${input}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    }).then(response => {
        if(response.message === ""){
            url = '/account/password/reset/';
            fetch(url, {
                method: 'POST',
                body: `email=${input}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                    'X-CSRFToken': csrftoken,
                },
                mode: "same-origin"
            }).then(response => {
                return response.json();
            }).catch(error => {
                console.log(error);
            });
        }else{
            location.href = "done/"
        }
    }).catch(error => {
        console.log(error);
    });
}

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} input 
 */
function isValidEmailPattern(input){
    let url = "is_valid_email_pattern"
  
    fetch(url, {
        method: 'POST',
        body: `email=${input}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    }).then(response => {
        if(response.message === ""){
            toggleErrorMessage(true, messageElArr[emailIndex], response.message);
        }else{
            toggleErrorMessage(false, messageElArr[emailIndex], response.message);
            invalidElArr.push(requiredInputArr[emailIndex])
        }
    }).catch(error => {
        console.log(error);
    });
}

/**
 * メールの形式チェック
 */
function emailCheck(){
    //エラー欄の配列を初期化
    invalidElArr.length = 0;

    //カスタムメールアドレスバリデーション
    isValid = isEmail(requiredInputArr[emailIndex].value);

    //メールアドレスの形式が適切なとき
    if(isValid[0]){
        //djangoのメールアドレスバリデーション
        isValidEmailPattern(requiredInputArr[emailIndex].value);
    }else{
        toggleErrorMessage(isValid[0], messageElArr[emailIndex], isValid[1]);
        invalidElArr.push(requiredInputArr[emailIndex]);
    }
}

/**
 * イベント
 */
window.addEventListener("load", ()=>{

    for(let i = 0; i < requiredInputArr.length; i++){
        //フォーカス移動イベント
        requiredInputArr[i].addEventListener("keypress", (e)=>{
            if(e.code === "Enter" || e.code === "NumpadEnter"){
                e.preventDefault();
                submitBtn.focus();
            }
        })

        //各入力欄にバリデーションを設定
        requiredInputArr[i].addEventListener("change",()=>{
            emailCheck();
        })

        //入力中はエラー表示を消す
        requiredInputArr[i].addEventListener("input", ()=>{
            messageElArr[i].style.display = "none";
        })

        //モデルのバリデーションでエラーが出たとき用
        if(errorlist !== null) emailCheck();
    }
})

//フォーム
form.addEventListener("submit", (e)=>{

    emailCheck();
    
    //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
    if(invalidElArr.length > 0){
        invalidElArr[0].focus();
        e.preventDefault();
        return;
    } 

    //メール送信するかどうか判別して次のページへ遷移する
    accountResetPassword(requiredInputArr[emailIndex].value);
})
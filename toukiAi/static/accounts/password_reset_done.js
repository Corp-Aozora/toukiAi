"use strict";

reqInputs = [email];
msgEls = [emailMessageEl];
msgs = [emailMessage];

const resentMessage = document.getElementById("resentMessage");

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} input 
 */
function accountResetPassword(input){
    let url = "is_user_email/"
  
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
        }
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        slideDownAndScroll(resentMessage);
    });
}

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} input 
 */
function isValidEmailPattern(input){
    let url = "is_valid_email_pattern/"
  
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
            toggleErrorMessage(true, msgEls[emailIndex], response.message);
        }else{
            toggleErrorMessage(false, msgEls[emailIndex], response.message);
            invalidEls.push(reqInputs[emailIndex])
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
    invalidEls.length = 0;

    //カスタムメールアドレスバリデーション
    isValid = isEmail(reqInputs[emailIndex].value);

    //メールアドレスの形式が適切なとき
    if(isValid[0]){
        //djangoのメールアドレスバリデーション
        isValidEmailPattern(reqInputs[emailIndex].value);
    }else{
        toggleErrorMessage(isValid[0], msgEls[emailIndex], isValid[1]);
        invalidEls.push(reqInputs[emailIndex]);
    }
}

/**
 * イベント
 */
window.addEventListener("load", ()=>{

    for(let i = 0; i < reqInputs.length; i++){
        //フォーカス移動イベント
        reqInputs[i].addEventListener("keypress", (e)=>{
            if(e.key === "Enter"){
                e.preventDefault();
                submitBtn.focus();
            }
        })

        //各入力欄にバリデーションを設定
        reqInputs[i].addEventListener("change",()=>{
            emailCheck();
        })

        //入力中はエラー表示を消す
        reqInputs[i].addEventListener("input", ()=>{
            msgEls[i].style.display = "none";
        })

        //モデルのバリデーションでエラーが出たとき用
        if(errorlist !== null) emailCheck();
    }

    
    //フォーム
    const form = document.getElementsByTagName("form")[0];
    form.addEventListener("submit", (e)=>{

        e.preventDefault();
        try{
            emailCheck();
            
            //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
            if(invalidEls.length > 0){
                invalidEls[0].focus();
                return;
            } 
        
            //メール送信するかどうか判別して次のページへ遷移する
            accountResetPassword(reqInputs[emailIndex].value);
        }catch(e){
            basicLog("submit", e, "パスワードの再設定処理中にエラー")
        }
    })

})

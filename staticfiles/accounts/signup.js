"use strict";

/**
 * 変数
 */
//入力欄
reqInputs = [email, password1, password2];

//各欄のエラーメッセージを表示する要素のid
msgEls = [emailMessageEl, password1MessageEl, password2MessageEl];

//エラーメッセージ
msgs = [emailMessage, password1Message, password2Message];

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} target 
 */
function isNewEmail(target){
    const url = 'is_new_email';
  
    fetch(url, {
        method: 'POST',
        body: `email=${target}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    }).then(response => {
        if(response.message !== ""){
            toggleErrorMessage(false, msgEls[emailIndex], response.message);
            invalidEls.push(reqInputs[emailIndex]);
        }else{
            toggleErrorMessage(true, msgEls[emailIndex], response.message);
        }
    }).catch(error => {
        console.log(error);
    });
}

/**
 * バリデーションリスト
 * @param {number} index 
 */
function validationList(index){
    //メールアドレス欄
    if(index === emailIndex){
        //カスタムメールアドレスバリデーション
        isValid = isEmail(reqInputs[index].value);
        if(isValid[0] === false){
            toggleErrorMessage(isValid[0], msgEls[index], isValid[1]);
            if(invalidEls.indexOf(reqInputs[index]) === -1) invalidEls.push(reqInputs[index]);
        }else{
            invalidEls = invalidEls.filter(x => x !== reqInputs[index]);
            //重複チェックとdjangoのメールアドレスバリデーション
            isNewEmail(reqInputs[index].value);
        }
    }else{
        //メールアドレス欄以外
        if(index === password1Index) isValid = checkPassword(reqInputs[index].value, reqInputs[index]);
        else if(index === password2Index) isValid = password1.value === password2.value ? true: false;

        //各バリデーションでエラーがあるとき
        toggleErrorMessage(isValid, msgEls[index], msgs[index]);
        
        if(isValid === false){
            if(invalidEls.indexOf(reqInputs[index]) === -1) invalidEls.push(reqInputs[index]);
        }else{
            invalidEls = invalidEls.filter(x => x !== reqInputs[index]);
        }
    }
}

/**
 * イベント
 */
window.addEventListener("load", ()=>{

    for(let i = 0; i < reqInputs.length; i++){
        //フォーカス移動イベント
        reqInputs[i].addEventListener("keypress", (e)=>{
            if(e.code === "Enter" || e.code === "NumpadEnter"){
                e.preventDefault();
                if(e.target === password2){
                    submitBtn.focus();
                }else{
                    reqInputs[i + 1].focus();}
            }
        })

        //モデルのバリデーションでエラーが出たとき用
        if(errorlist !== null) validationList(i);
    }

    //パスワード1が空欄又はエラーメッセージが出ているとき
    if(errorlist !== null){
        togglePassword2();
        if(invalidEls.length > 0) invalidEls[0].focus();
    }
})

//メールアドレス
email.addEventListener("change", (e)=>{
    validationList(emailIndex);
})

//パスワード1
password1.addEventListener("change", (e)=>{
    validationList(password1Index);
    togglePassword2();
})

//パスワード2
password2.addEventListener("change", (e)=>{
    validationList(password2Index);
})

//フォーム
form.addEventListener("submit", (e)=>{

    // 送信前に各入力欄をチェックする
    for(let i = 0; i < reqInputs.length; i++){
        validationList(i);
    }

    //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
    if(invalidEls.length > 0){
        invalidEls[0].focus();
        e.preventDefault();
    } 
})
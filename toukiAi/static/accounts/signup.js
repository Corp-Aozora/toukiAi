"use strict";

/**
 * 変数
 */
//入力欄
requiredInputArr = [email, password1, password2];

//各欄のエラーメッセージを表示する要素のid
messageElArr = [emailMessageEl, password1MessageEl, password2MessageEl];

//エラーメッセージ
messageArr = [emailMessage, password1Message, password2Message];

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
            toggleErrorMessage(false, messageElArr[emailIndex], response.message);
            invalidElArr.push(requiredInputArr[emailIndex]);
        }else{
            toggleErrorMessage(true, messageElArr[emailIndex], response.message);
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
        isValid = isEmail(requiredInputArr[index].value);
        if(isValid[0] === false){
            toggleErrorMessage(isValid[0], messageElArr[index], isValid[1]);
            if(invalidElArr.indexOf(requiredInputArr[index]) === -1) invalidElArr.push(requiredInputArr[index]);
        }else{
            invalidElArr = invalidElArr.filter(x => x !== requiredInputArr[index]);
            //重複チェックとdjangoのメールアドレスバリデーション
            isNewEmail(requiredInputArr[index].value);
        }
    }else{
        //メールアドレス欄以外
        if(index === password1Index) isValid = checkPassword(requiredInputArr[index].value, requiredInputArr[index]);
        else if(index === password2Index) isValid = password1.value === password2.value ? true: false;

        //各バリデーションでエラーがあるとき
        toggleErrorMessage(isValid, messageElArr[index], messageArr[index]);
        
        if(isValid === false){
            if(invalidElArr.indexOf(requiredInputArr[index]) === -1) invalidElArr.push(requiredInputArr[index]);
        }else{
            invalidElArr = invalidElArr.filter(x => x !== requiredInputArr[index]);
        }
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
                if(e.target === password2){
                    submitBtn.focus();
                }else{
                    requiredInputArr[i + 1].focus();}
            }
        })

        //モデルのバリデーションでエラーが出たとき用
        if(errorlist !== null) validationList(i);
    }

    //パスワード1が空欄又はエラーメッセージが出ているとき
    if(errorlist !== null){
        togglePassword2();
        if(invalidElArr.length > 0) invalidElArr[0].focus();
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

//パスワード表示ボタン
passDisplayToggle.addEventListener("click", ()=>{

    if(eye.style.display === hidden){
        password1.type = "password";
        eye.style.display = display;
        eyeSlash.style.display = hidden;
    }else if(eye.style.display !== hidden) {
        password1.type = "text";
        eye.style.display = hidden;
        eyeSlash.style.display = display;
    }
})

//パスワード2
password2.addEventListener("change", (e)=>{
    validationList(password2Index);
})

//フォーム
form.addEventListener("submit", (e)=>{

    // 送信前に各入力欄をチェックする
    for(let i = 0; i < requiredInputArr.length; i++){
        validationList(i);
    }

    //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
    if(invalidElArr.length > 0){
        invalidElArr[0].focus();
        e.preventDefault();
    } 
})
"use strict";

requiredInputArr = [email];
messageElArr = [emailMessageEl];
messageArr = [emailMessage];

const resentMessage = document.getElementById("resentMessage");

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} target 
 */
function accountResetPassword(target){
    let url = "is_user_email"
  
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
        if(response.message === ""){
            toggleErrorMessage(true, messageElArr[emailIndex], response.message);
            url = '/account/password/reset/';
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
            }).catch(error => {
                console.log(error);
            });
        }
    }).catch(error => {
        console.log(error);
    });
}

//メールアドレス
email.addEventListener("change", (e)=>{
    isEmail(e.target.value)[0] ? toggleErrorMessage(true, messageElArr[emailIndex], messageArr[emailIndex]): toggleErrorMessage(false, messageElArr[emailIndex], isEmail(e.target.value)[1]);
})

//メールアドレス欄
email.addEventListener("keypress", (e)=>{
    //フォーカス移動イベント
    if(e.code === "Enter" || e.code === "NumpadEnter"){
        e.preventDefault();
        submitBtn.focus();
    }
})

//メールを再発行するボタン
submitBtn.addEventListener("click", ()=>{
    //メールアドレスの形式チェック
    if(isEmail(requiredInputArr[emailIndex].value)[0]){
        slideDown(resentMessage);
        accountResetPassword(requiredInputArr[emailIndex].value);
    }else{
        toggleErrorMessage(false, messageElArr[emailIndex], messageArr[emailIndex]);
        email.focus();
    }
})

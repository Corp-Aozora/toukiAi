"use strict";

requiredInputArr = [email];
messageElArr = [emailMessageEl];
messageArr = [emailMessage];

const resentMessage = document.getElementById("resentMessage");
/**
 * 重複メールアドレスとdjangoのチェック
 * @param {string} email 
 */
function resendConfimation(email){
    const url = 'resend_confirmation';
  
    fetch(url, {
        method: 'POST',
        body: `email=${email}`,
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

window.addEventListener("load", ()=>{

})

//メールアドレス
email.addEventListener("change", (e)=>{
    isEmail(e.target.value)[0] ? toggleErrorMessage(true, messageElArr[emailIndex], messageArr[emailIndex]): toggleErrorMessage(false, messageElArr[emailIndex], messageArr[emailIndex]);
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

        toggleErrorMessage(true, messageElArr[emailIndex], messageArr[emailIndex]);
        
        //登録されたユーザーか確認して、登録されたユーザーのときはメールを再送する
        resendConfimation(email.value);
    }else{
        toggleErrorMessage(false, messageElArr[emailIndex], messageArr[emailIndex]);
    }
})

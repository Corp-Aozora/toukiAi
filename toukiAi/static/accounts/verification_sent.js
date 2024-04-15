"use strict";

reqInputs = [email];
msgEls = [emailMessageEl];
msgs = [emailMessage];

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

//メールアドレス
email.addEventListener("change", (e)=>{
    isEmail(e.target.value)[0] ? toggleErrorMessage(true, msgEls[emailIndex], msgs[emailIndex]): toggleErrorMessage(false, msgEls[emailIndex], msgs[emailIndex]);
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
    if(isEmail(reqInputs[emailIndex].value)[0]){
        slideDownAndScroll(resentMessage);

        toggleErrorMessage(true, msgEls[emailIndex], msgs[emailIndex]);
        
        //登録されたユーザーか確認して、登録されたユーザーのときはメールを再送する
        resendConfimation(email.value);
    }else{
        toggleErrorMessage(false, msgEls[emailIndex], msgs[emailIndex]);
    }
})

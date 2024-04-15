"use strict";

/**
 * 重複メールアドレスとdjangoのチェック
 * @param {string} email 
 * @param {HTMLElement} errMsgEl 
 */
async function resendConfimation(email, errMsgEl){
    const url = 'resend_confirmation/';
  
    fetch(url, {
        method: 'POST',
        body: `email=${email}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response =>{
        if(response.status === 429){
            alert("リンクの再発行は１時間に５回までです。\n時間をおいてメールを再発行するボタンをクリックしてください。")
            return Promise.reject('Rate limit exceeded');
        }
        return response.json();
    }).then(response =>{
        if(["success", "warning"].includes(response.error_level)){
            toggleErrorMessage((response.message === ""), errMsgEl, response.message);
        }else{
            basicLog("resendConfimation", null, "responseエラー");
            alert(`システムエラー\n${response.message}\nお手数ですが、お問い合わせをお願いします。`);        
        }
    }).catch(e => {
        if (e !== 'Rate limit exceeded'){
            basicLog("resendConfimation", e);
            alert(`${e.message}\nお手数ですが、お問い合わせをお願いします。`);
        }
    });
}

window.addEventListener("load", ()=>{
    const instance = new AccountForm();
    const idxs = {"email": 0};
    const {email, errMsgEls, errMsgs} = instance;
    const resendBtn = instance.form.querySelector("#resendBtn");

    email.addEventListener("change", (e)=>{
        toggleErrorMessage(isEmail(e.target.value)[0], errMsgEls[idxs["email"]], errMsgs[idxs["email"]]);
    })

    email.addEventListener("keydown", (e)=>{
        setEnterKeyFocusNext(e, resendBtn);
    })
    
    resendBtn.addEventListener("click", ()=>{
        const spinner = document.getElementById("submitSpinner");
        const errMsgEl = errMsgEls[idxs["email"]];
        const errMsg = errMsgs[idxs["email"]];

        try{
            resendBtn.disabled = true;
            spinner.style.display = "";

            const result = isEmail(email.value);
            if(result[0]){
                //再送メッセージを表示する
                const resentMessage = document.getElementById("resentMessage");
                slideDownAndScroll(resentMessage);
                //エラーメッセージトグル
                toggleErrorMessage(true, errMsgEl, errMsg);
                //登録されたユーザーか確認して、登録されたユーザーのときはメールを再送する
                resendConfimation(email.value, errMsgEl);
            }else{
                toggleErrorMessage(false, errMsgEl, result[1]);
            }
            restore();
        }catch(error){
            basicLog("submit", error);
            alert(error.message);
            restore();
        }

        function restore(){
            spinner.style.display = "none";
            resendBtn.disabled = false;    
        }
    })
})
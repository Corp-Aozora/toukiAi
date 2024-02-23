"use strict";

reqInputs = [email];
msgEls = [emailMessageEl];
msgs = [emailMessage];

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} val 
 */
function isNewEmail(val){
    const url = 'is_new_email';
    const verifyingEl = `<span id="id_email_verifyingEl" class="verifying emPosition">
                    検証中
                    <div class="spinner-border text-white spinner-border-sm" role="status">
                    </div>
                    </span>`;
    email.insertAdjacentHTML('afterend', verifyingEl);
    submitBtn.disabled = true;

    fetch(url, {
        method: 'POST',
        body: `email=${val}`,
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
    }).finally(()=>{
        document.getElementById("id_email_verifyingEl").remove();
        submitBtn.disabled = false;
        submitBtn.focus();
    });
}

/**
 * メールアドレス☑
 * @param {string} val メールアドレス
 */
function emailCheck(val){
    invalidEls.filter(x => x !== reqInputs[emailIndex]);

    if(isEmail(val)[0]){
        isNewEmail(val)
    }else{
        toggleErrorMessage(false, msgEls[emailIndex], msgs[emailIndex]);
        invalidEls.push(reqInputs[emailIndex]);
    }
}

//ロード
window.addEventListener("load", ()=>{
    //モデルのバリデーションでエラーが出たとき用
    if(errorlist !== null){
        emailCheck(email.value);
        if(invalidEls.length > 0) invalidEls[0].focus();
    }
})

//メールアドレス
email.addEventListener("change", (e)=>{
    emailCheck(e.target.value);
})

email.addEventListener("input", (e)=>{
    msgEls[emailIndex].style.display = "none";
})

email.addEventListener("keypress", (e)=>{
    //フォーカス移動イベント
    if(e.code === "Enter" || e.code === "NumpadEnter"){
        e.preventDefault();
        submitBtn.focus();
    }
})

//送信ボタン
form.addEventListener("submit", ()=>{
    //メールアドレスの形式チェック
    emailCheck(email.value);

    //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
    if(invalidEls.length > 0){
        invalidEls[0].focus();
        e.preventDefault();
    } 
})

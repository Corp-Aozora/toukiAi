email = document.getElementById("id_login")
emailMessageEl = document.getElementById("id_login_messageEl")

reqInputs = [email, password];
msgEls = [emailMessageEl, passwordMessageEl];
msgs = [emailMessage, passwordMessage];

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
        }
    }else{
        //パスワード欄
        isValid = checkPassword(reqInputs[index].value, reqInputs[index]);

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
                if(e.target === password){
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

//パスワード
password.addEventListener("change", (e)=>{
    validationList(passwordIndex);
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
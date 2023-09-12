email = document.getElementById("id_login")
emailMessageEl = document.getElementById("id_login_messageEl")

requiredInputArr = [email, password];
messageElArr = [emailMessageEl, passwordMessageEl];
messageArr = [emailMessage, passwordMessage];

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
        }
    }else{
        //パスワード欄
        isValid = checkPassword(requiredInputArr[index].value, requiredInputArr[index]);

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
                if(e.target === password){
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
    for(let i = 0; i < requiredInputArr.length; i++){
        validationList(i);
    }

    //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
    if(invalidElArr.length > 0){
        invalidElArr[0].focus();
        e.preventDefault();
    } 
})
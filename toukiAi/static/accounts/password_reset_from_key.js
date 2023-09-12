const password1 = document.getElementById("id_password1");
const password2 = document.getElementById("id_password2");
requiredInputArr = [password1, password2];

const submitBtn = document.getElementById("submitBtn");
const form = document.querySelector("form");

const passDisplayToggle = document.getElementById("passDisplayToggle");
const eye = document.getElementById("eye");
const eyeSlash = document.getElementById("eyeSlash");

const password1MessageEl = document.getElementById("id_password1_messageEl");
const password2MessageEl = document.getElementById("id_password2_messageEl");
messageElArr = [password1MessageEl, password2MessageEl];

const password1Message = "半角で英数記号を含む8文字以上を入力してください";
const password2Message = "上記パスワードと一致しません";
messageArr = [password1Message, password2Message];

const password1Index = 0;
const password2Index = 1;

/**
 * パスワード2の入力制御
 */
function togglePassword2(){
    if(password1.value === "" || password1MessageEl.style.display !== "none"){
        password2.setAttribute("maxlength", 0);
        password2.value = "";
    }else{
        password2.removeAttribute("maxlength");
    }
}

/**
 * バリデーションリスト
 * @param {number} index 
 */
function validationList(index){
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
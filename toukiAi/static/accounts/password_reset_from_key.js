const password1 = document.getElementById("id_password1");
const password2 = document.getElementById("id_password2");
reqInputs = [password1, password2];

const form = document.querySelector("form");

const passDisplayToggle = document.getElementById("passDisplayToggle");
const eye = document.getElementById("eye");
const eyeSlash = document.getElementById("eyeSlash");

const password1MessageEl = document.getElementById("id_password1_messageEl");
const password2MessageEl = document.getElementById("id_password2_messageEl");
msgEls = [password1MessageEl, password2MessageEl];

const password1Message = "半角で英数記号を含む8文字以上を入力してください";
const password2Message = "上記パスワードと一致しません";
msgs = [password1Message, password2Message];

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
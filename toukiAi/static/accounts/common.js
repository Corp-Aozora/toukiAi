/**
 * アカウント関連共通で使用する変数
 */
class AccountForm{
    constructor(){
        this.form = document.getElementsByTagName("form")[0];
        this.inputs = Array.from(this.form.getElementsByTagName("input")).slice(1);
        this.login = document.getElementById("id_login");
        this.email = document.getElementById("id_email");
        this.password = document.getElementById("id_password");
        this.password1 = document.getElementById("id_password1");
        this.password2 = document.getElementById("id_password2");
        this.errMsgEls = this.form.getElementsByClassName("errorMessage");
        this.eyeToggleBtn = document.getElementById("eyeToggleBtn");
        this.eye = document.getElementById("eye");
        this.eyeSlash = document.getElementById("eyeSlash");
        this.submitBtn = this.form.querySelector("button[type='submit']");
        this.errMsgs = [
            "メールアドレスの規格と一致しません",
            "半角で英数記号を含む8文字以上を入力してください",
            "パスワードが一致しません"
        ]
    }
}

const email = document.getElementById("id_email") || document.getElementById("id_login");
const oldpassword = document.getElementById("id_oldpassword");
const password1 = document.getElementById("id_password1") || document.getElementById("id_password");
const password2 = document.getElementById("id_password2");

const passDisplayToggle = document.getElementById("passDisplayToggle");
const eye = document.getElementById("eye");
const eyeSlash = document.getElementById("eyeSlash");

const emailMessageEl = document.getElementById("id_email_messageEl") || document.getElementById("id_login_messageEl");
const oldpasswordMessageEl = document.getElementById("id_oldpassword_messageEl");
const password1MessageEl = document.getElementById("id_password1_messageEl") || document.getElementById("id_password_messageEl") ;
const password2MessageEl = document.getElementById("id_password2_messageEl");

const emailMessage = "メールアドレスの規格と一致しません";
const oldpasswordMessage = "登録されているパスワードと一致しません";
const password1Message = "半角で英数記号を含む8文字以上を入力してください";
const password2Message = "上のパスワードと一致しません";

const emailIndex = 0;
const oldpasswordIndex = 0;
const password1Index = 1;
const password2Index = 2;

/**
 * パスワード2の有効化トグル
 */
function togglePassword2(pass1, pass1ErrMsgEl, pass2){
    const isPass1Valid = pass1.value !== "" && window.getComputedStyle(pass1ErrMsgEl).display === "none";
    pass2.value = "";
    pass2.setAttribute("maxlength", isPass1Valid? 30: 0);
}

/**
 * 最初の非表示でない要素のインデックスを見つける
 * @param {HTMLElement[]} els 
 * @returns エラーがある要素のインデックス、エラーがないときは-1
 */
function findInvalidInputIndex(els) {
    return els.findIndex(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none';
    });
}

/**
 * 目隠しボタンイベント
 * @param {*} eye 
 * @param {*} pass1 
 * @param {*} eyeSlash 
 */
function handleEyeToggleClickEvent(eye, pass1, eyeSlash){
    const isHidden = eye.style.display === "none";
    pass1.type = isHidden ? "password" : "text";
    eye.style.display = isHidden ? "block" : "none";
    eyeSlash.style.display = isHidden ? "none" : "block";
}

// window.addEventListener("load", ()=>{
//     //パスワード欄があるとき、パスワードの表示ボタンのトグル機能を追加する
//     if(passDisplayToggle !== null)
//         passDisplayToggle.addEventListener("click", handleEyeToggleClickEvent);
// })
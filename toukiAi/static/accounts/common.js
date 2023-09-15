/**
 * 変数
 */
let email = document.getElementById("id_email");
const password = document.getElementById("id_password");
const password1 = document.getElementById("id_password1");
const password2 = document.getElementById("id_password2");

const passDisplayToggle = document.getElementById("passDisplayToggle");
const eye = document.getElementById("eye");
const eyeSlash = document.getElementById("eyeSlash");
const submitBtn = document.getElementById("submitBtn");
const form = document.querySelector("form");

let emailMessageEl = document.getElementById("id_email_messageEl");
const passwordMessageEl = document.getElementById("id_password_messageEl");
const password1MessageEl = document.getElementById("id_password1_messageEl");
const password2MessageEl = document.getElementById("id_password2_messageEl");

const emailMessage = "メールアドレスの規格と一致しません";
const passwordMessage = "半角で英数記号を含む8文字以上を入力してください";
const password1Message = "半角で英数記号を含む8文字以上を入力してください";
const password2Message = "上のパスワードと一致しません";

const emailIndex = 0;
const passwordIndex = 1;
const password1Index = 1;
const password2Index = 2;

const errorlist = document.querySelector(".errorlist");

/**
 * パスワード2の入力制御
 */
function togglePassword2(){
    //パス１の値が変更されたら常にパス２は初期化する
    password2.value = "";
    //パス１が未入力又はエラー表示されているときは、パス２は入力できないようにする
    if(password1.value === "" || password1MessageEl.style.display !== "none"){
        password2.setAttribute("maxlength", 0);
    }else{
        password2.removeAttribute("maxlength");
    }
}

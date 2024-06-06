"use strict";

/**
 * アカウント共通フォーム
 */
class AccountForm{
    constructor(){
        this.form = document.getElementsByTagName("form")[0];
        this.inputs = Array.from(this.form.getElementsByTagName("input")).slice(1);
        this.login = document.getElementById("id_login");
        this.email = document.getElementById("id_email");
        this.currentEmail = document.getElementById("id_current_email");
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
            "半角で英数記号3種類を含む8文字以上",
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


// 元のページに戻るボタンが押されたとき
function setEventToReturnBtn(){

    const returnBtn = document.getElementById("returnBtn");
    returnBtn.addEventListener("click", ()=>{

        const preUrl = sessionStorage.getItem("preUrl");
        const spinner = document.getElementById("return-spinner");

        try{
            spinner.style.display = "";
            returnBtn.disabled = true;

            window.location.href = preUrl? preUrl: "/toukiApp/redirect_to_progress_page";
        }catch(e){
            spinner.style.display = "none"
            returnBtn.disabled = false;
            basicLog("setEventToReturnBtn", e, "アカウント削除ページの元のページに戻るボタンの処理でエラー");
        }
    })
}

/**
 * メールアドレス検証
 * 
 * 空欄チェック/ スペース削除/ 形式チェック/ 重複チェック
 * @param {HTMLInputElement} input メールアドレスのinput要素
 */
async function validateEmail(input, clientSideOnly=false){
    
    // 重複メールアドレスとdjangoによるメールアドレス形式チェック
    async function isNewEmail(val){
        const functionName = "isNewEmail";
        const url = '/account/is_new_email/';

        //処理中のツールチップを表示する
        toggleVerifyingTooltip(true, input, "検証中");

        try{
            const response = await fetch(url, {
                method: 'POST',
                body: `email=${val}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                    'X-CSRFToken': csrftoken,
                },
                mode: "same-origin"
            })

            return response;
        }catch(e){
            basicLog(functionName, e, `email=${val}`);
            alert("通信エラー 数分空けて再試行しても同じエラーが出る場合は、お問い合わせをお願いします。");
        }finally{
            toggleVerifyingTooltip(false, input);
        }
    }

    // 空欄チェック
    let result = isBlank(input);
    if(typeof result === "string")
        return result;

    // スペース削除
    let val = input.value;
    input.value = trimAllSpace(val);

    // 形式チェック
    val = input.value;
    result = isEmail(val);
    if(!result[0])
        return result[1];

    if(clientSideOnly)
        return true;

    // 重複チェック
    return await isNewEmail(val);
}

/**
 * パスワード1検証
 * @param {HTMLInputElement} input 
 * @returns 
 */
function validatePassword1(input){
    // 空欄チェック
    let result = isBlank(input);
    if(typeof result === "string")
        return result;

    // スペース削除
    let val = input.value;
    input.value = trimAllSpace(val);

    result = checkPassword(input.value, input);

    if(result)
        return true;
    else
        return "半角で英数記号3種類を含む8文字以上";
}

/**
 * パスワード2検証
 * @param {HTMLInputElement} pass1Input 
 * @param {HTMLInputElement} pass2Input 
 * @returns 
 */
function validatePassword2(pass1Input, pass2Input){
    // パス1の値が存在するかチェック
    if(pass1Input.value.length === 0)
        return "先にパスワードを入力してください";

    // パス2と同じ値かチェック
    if(pass1Input.value === pass2Input.value)
        return true;
    else
        return "パスワードと一致しません";
}
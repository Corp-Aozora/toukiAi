"use strict";

/**
 * 全テンプレートで共通の変数
 */
const display = "block";
const hidden = "none";
const smWidth = 575;
const mdWidth = 767;
const lgWidth = 991;
const xlWidth = 1199;
const xxlWidth = 1399;

//bootstrapのツールチップを有効化
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

let requiredInputArr = [];
let checkedRequiredInputArr = [];
let messageElArr = [];
let messageArr = [];
let invalidElArr = [];
let isValid;

const submitBtn = document.getElementById("submitBtn");
const form = document.querySelector("form");
const errorlist = document.querySelector(".errorlist");

/**
 * テキストを強調する
 * @param {element} el 
 */
function emphasizeText(el){
    el.classList.add("text-primary", "border-bottom", "border-primary");
}

/**
 * テキストの強調を削除する
 * @param {element} el 
 */
function removeEmphasizeText(el){
    el.classList.remove("text-primary", "border-bottom", "border-primary");

}

/**
 * 文字列内にある全角を半角へ変換
 * @param {string} str 変換したい文字列
 * @return {string} 変換された文字列を返す
 */
var ZenkakuToHankaku = function(str) {
	return String(str).replace(/[！-～]/g, function(s) {
		return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
	});
};

/**
 * 半角を全角にする
 * @param {string} str 
 * @returns 
 */
function hankakuToZenkaku(str) {
    return str.replace(/[!-~]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
}

/**
 * スライド非表示する
 * @param {element} el 
 * @param {number} duration 
 */
const slideUp = (el, duration = 250) => {
    el.style.height = el.offsetHeight + "px";
    el.offsetHeight;
    el.style.transitionProperty = "height, margin, padding";
    el.style.transitionDuration = duration + "ms";
    el.style.transitionTimingFunction = "ease";
    el.style.overflow = "hidden";
    el.style.height = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
    el.style.marginTop = 0;
    el.style.marginBottom = 0;
    setTimeout(() => {
      el.style.display = "none";
      el.style.removeProperty("height");
      el.style.removeProperty("padding-top");
      el.style.removeProperty("padding-bottom");
      el.style.removeProperty("margin-top");
      el.style.removeProperty("margin-bottom");
      el.style.removeProperty("overflow");
      el.style.removeProperty("transition-duration");
      el.style.removeProperty("transition-property");
      el.style.removeProperty("transition-timing-function");
    }, duration);
};

/**
 * スライド表示する
 * @param {element} el 
 * @param {number} duration 
 */
const slideDown = (el, duration = 250) => {
    el.style.removeProperty("display");
    let display = window.getComputedStyle(el).display;
    if (display === "none") {
        display = "block";
    }
    el.style.display = display;
    let height = el.offsetHeight;
    el.style.overflow = "hidden";
    el.style.height = 0;
    el.style.paddingTop = 0;
    el.style.paddingBottom = 0;
    el.style.marginTop = 0;
    el.style.marginBottom = 0;
    el.offsetHeight;
    el.style.transitionProperty = "height, margin, padding";
    el.style.transitionDuration = duration + "ms";
    el.style.transitionTimingFunction = "ease";
    el.style.height = height + "px";
    el.style.removeProperty("padding-top");
    el.style.removeProperty("padding-bottom");
    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-bottom");
    setTimeout(() => {
        el.style.removeProperty("height");
        el.style.removeProperty("overflow");
        el.style.removeProperty("transition-duration");
        el.style.removeProperty("transition-property");
        el.style.removeProperty("transition-timing-function");
    }, duration);
};

/**
 * 要素のスライドトグル
 * @param {element} el 
 */
function slideToggle(el){
    if(el.style.display === "flex" || el.style.display === "block"){
        slideUp(el);
    }else{
        slideDown(el);
        scrollToTarget(el);
    }
}

/**
 * 要素がページ先頭に来るようにスクロールする
 * @param {element} el 表示対象の要素
 * @param {number} duration スクロールまでの待ち時間
 */
function scrollToTarget(el, duration = 250) {
    let rect = el.getBoundingClientRect();
    const header = document.getElementById("header");
    let gap = header.clientHeight + 40;
    let targetPosition = rect.top + window.scrollY - gap;

    setTimeout(() => {
        scrollTo(0, targetPosition);
    }, duration);
}

/**
 * 複製された要素を削除する
 * @param {string} targetId 
 * @param {number} count
 */
function removeElement(targetId, count){
    let target = document.querySelector(`[id=${targetId}]`);
    slideUp(target);
    count -= 1;
    setTimeout(()=>{
        target.remove();
    }, 250);

    return count;
}

/**
 * 整数チェック
 * @param {input} value 
 * @param {element} el 対象の要素（数字以外があるときは、空文字を入力する。全角数字があるときは半角数字に変換する）
 * @returns {boolean} 整数のときはtrue、違うときはfalse
 */
function isNumber(value, el){
    //入力値がないときは、何もしない
    if(value === ""){
        return false;
    } 

    //全角を半角にする
    const reg = new RegExp(/^[0-9０-９]*$/);
    const result = reg.test(value);
    if(result === false){
        el.value = "";
        return false;
    } 

    el.value = ZenkakuToHankaku(value)
    return true;
}

/**
 * 桁数チェック
 * @param {number} value チェック対象の数字
 * @param {string} type チェックする桁数
 * @return {boolean} 適切なときはtrue、それ以外はfalse
 */
function isDigit(value, type){
    let countDigit;
    //電話番号（10桁又は11桁）
    if(type === "phoneNumber"){
        const validDigit = [10, 11]
        countDigit = String(value).length;

        for(let i = 0; i < validDigit.length; i++){
            if(validDigit[i] === countDigit) return true;
        }

        return false;
    }else{
        return false;
    }
}

/**
 * 電話番号形式チェック
 * @param {string} value 
 * @param {element} el 
 * @returns {boolean} 形式に合致するときはtrue、合致しないときはfalse
 */
function checkPhoneNumber(value, el){
    const result = isNumber(value, el);
    if(result === false) return false;

    return isDigit(el.value, "phoneNumber");
}

/**
 * メールアドレスチェック
 * @param {string} email 
 * @returns {array} 0:チェック結果 1:エラーメッセージ（結果がtrueのときは空文字）
 */
function isEmail(email) {
    // メールアドレス全体で256文字以上になっている
    if (256 <= email.length) return [false, 'メールアドレスが256文字以上になっています'];

    // @がないとき
    if(email.indexOf("@") === -1) return [false, "@が含まれてません"];

    // ローカル部分とドメイン名に分割
    const [local, domain] = email.split('@');

    // @以降がない場合は無効なメールアドレス
    if (!domain) return [false, '@以降が入力されてません'];

    // ローカル部分で、64文字以上になっている
    if (64 <= local.length) return [false, '@より前の部分は、63文字以内にしてください'];

    // ドメイン名が255文字以上の長さになっている
    if (255 <= domain.length) return [false, '@より後の部分は、254文字以内にしてください'];

    // .(ドット)が、ローカル部分で、2つ以上連続している
    if (local.match(/\.{2,}/)) return [false, '.(ドット)は@より前の部分で連続することはできません'];

    // .(ドット)を、ローカル部分の最初と最後(@の直前)に使っている
    if (local.startsWith('.') || local.endsWith('.')) return [false, '.(ドット)は最初又は@の直前に使用できません'];

    // -(ハイフン)が、ローカル部分 or ドメイン部分の先頭または末尾にある
    if (
        local.startsWith('-') ||
        local.endsWith('-') ||
        domain.startsWith('-') ||
        domain.endsWith('-')
    ) return [false, '-(ハイフン)は先頭、末尾または@の前後につけることはできません'];

    // ドメイン名が数字だけで構成されている
    if (domain.match(/^\d+$/)) return [false, '@より後の部分を数字だけにすることはできません'];

    // ユーザー名またはドメイン名に、RFCに定義されていない特殊文字(( ) , : ; < > @ [ ])が含まれている
    if (local.match(/[ (),:;<>@[\]]/) || domain.match(/[ (),:;<>@[\]]/)) return [false, '使用できない特殊文字が含まれています'];

    // すべての条件を満たした場合は有効なメールアドレス
    return [true, ""];
}

/**
 * スペース削除する
 * @param {string} val 
 * @param {element} el
 */
function trimAllSpace(val, el){
    const trimedVal = val.replace(/ |　/g, "");
    el.value = trimedVal;
    return trimedVal;
}

/**
 * 空文字チェック
 * @param {string} value チェック対象の値
 * @param {element} el チェック対象の要素
 * @return 空文字でないときは先頭と末尾の空白を削除した入力値を返す、空文字のときは、falseを返す
 */
function isBlank(value, el){
    const str = value.trim();
    return str.length === 0 ? "入力が必須です": false;
}

/**
 * 改行チェック
 * @param {string} value 
 * @param {element} el 
 * @returns 要素に改行コードを空文字に変換した文字列を入力する
 */
function toSingleLine(value, el){
    el.value = value.replace(/\n|\r/g, "");
}

/**
 * 記号が含まれてないかチェック
 * @param {string} value チェック対象の文字列
 * @param {element} el チェック対象の要素
 * @returns 記号が含まれてないときはtrue、含まれているときはfalse
 */
function isSymbolIncluded(value, el){
    const reg = new RegExp(/^[^!-/:-@[-`{-~！-／：-＠［-｀｛-～、-〜”’・]+$/)
    if(reg.test(value)){
        return true;
    }else{
        el.value = "";
        return false
    }
}

/**
 * 全角入力チェック
 * @param {string} val チェック対象の値 
 * @param {element} el チェック対象の要素
 * @returns 条件に一致しないときはエラーメッセージ、一致するときは、校正した文字列を返す
 */
function isOnlyZenkaku(val, el){
    //スペースを削除
    let str = trimAllSpace(val,el)
    if(str.length == 0) return "入力が必須です";

    //改行チェック
    toSingleLine(str, el);

    //英数記号チェックの結果を返す
    return isAlphaNumSymbolIncluded(str);
}

/**
 * パスワード形式チェック
 */
function checkPassword(value, el){
    //英数記号を含む8字以上か
    const reg = new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!-/:-@[-`{-~])[0-9a-zA-Z!-/:-@[-`{-~]{8,}$/);
    const result = reg.test(value);

    if(result === false){
        el.value = "";
        return false;
    }else{
        return true;
    }
}

/**
 * クッキーを取得する
 * @param {cookie} name 
 * @returns 
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

/**
 * アルファベット、数字、記号が含まているかチェック
 * @param {string} val 
*/
function isAlphaNumSymbolIncluded(val){
    if(/^[^0-9０-９A-ZＡ-Ｚa-zａ-ｚ!-/:-@[-`{-~！-／：-＠［-｀｛-～、-〜”’・]+$/.test(val)){
        return true;
    }else{
        return "英数記号は使用できません";
    };
}

/**
 * エラーメッセージ表示のトグル
 * @param {boolean} isValid 
 * @param {element} el エラーメッセージを表示する要素
 * @param {string} message エラーメッセージ
 */
function toggleErrorMessage(isValid, el, message=""){
    //入力値が適切なとき
    if(isValid){
        //エラーメッセージを隠す
        el.style.display = hidden;
    }else{
        //エラーメッセージを表示する
        el.innerHTML = message;
        el.style.display = display;
    }
}

function removePx(){
    const mainContainer = document.getElementById("mainContainer");
    const clientWidth = document.documentElement.clientWidth;

    if(clientWidth < smWidth){
        mainContainer.classList.add("p-0");
    }else{
        mainContainer.classList.remove("p-0");
    }
}

window.addEventListener("load", ()=>{
    removePx();
})

window.addEventListener("resize", ()=>{
    removePx();
})
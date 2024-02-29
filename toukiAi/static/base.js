"use strict";

/**
 * 全テンプレートで共通の変数
 */
const smWidth = 575;
const mdWidth = 767;
const lgWidth = 991;
const xlWidth = 1199;
const xxlWidth = 1399;
const header = document.getElementById("header");

//bootstrapのツールチップを有効化
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

let reqInputs = [];
let msgEls = [];
let msgs = [];
let invalidEls = [];
let preserveInvalidEls = [];
let isValid;

const submitBtn = document.getElementById("submitBtn");
const form = document.querySelector("form");
const errorlist = document.querySelector(".errorlist");

//定数
const yes = 0;
const no = 1;
const other = 2;
const other2 = 3;

/**
 * テキストを強調する
 * @param {HTMLElement} el 
 */
function emphasizeText(el){
    el.classList.add("text-primary", "border-bottom", "border-primary");
}

/**
 * テキストの強調を削除する
 * @param {HTMLElement} el 
 */
function removeEmphasizeText(el){
    el.classList.remove("text-primary", "border-bottom", "border-primary");
}

/**
 * 文字列内にある全角を半角へ変換
 * @param {string|number} val 変換したい文字列
 * @return {string} 変換された文字列を返す
 */
function ZenkakuToHankaku(val) {
    val = String(val);
	return String(val).replace(/[！-～]/g, function(s) {
		return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
	});
};

/**
 * 半角を全角にする
 * @param {string|number} val 変換する文字列又は数字
 * @returns {string} 全角にした文字列
 */
function hankakuToZenkaku(val) {
    val = String(val);
    return val.replace(/[!-~]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
}

/**
 * スライド非表示する
 * @param {HTMLElement} el 
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
 * @param {HTMLElement} el 
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
 * slideDownの後にscrollToTargetを実行する
 * @param {HTMLElement} el 対象の要素
 */
function slideDownAndScroll(el){
    slideDown(el);
    scrollToTarget(el);
}

/**
 * 要素が表示されているときは、slideUp、非表示のときはslideUpしてスクロールする
 * @param {HTMLElement} el 対象の要素
 */
function slideToggle(el){
    if(window.getComputedStyle(el).display !== 'none') slideUp(el);
    else slideDownAndScroll(el);
}


/**
 * 非表示のとき対象の要素を表示する
 * @param {HTMLElement} el 表示する要素
 */
function slideDownIfHidden(el){
    if(window.getComputedStyle(el).display === "none")
        slideDownAndScroll(el);
}

/**
 * 同じ要素をスライドアップしてスライドダウンするときの表示
 * @param {HTMLElement} el 対象の要素
 * @param {number} time スライドアップが完了する時間間
 */
function slideDownAfterDelay(el, time = 250){
    if(time === null) time = 250;
    setTimeout(() => {
        slideDownAndScroll(el);
    }, time);
}

/**
 * 要素がページ先頭に来るようにスクロールする
 * @param {HTMLElement} el 表示対象の要素
 * @param {number} duration スクロールまでの待ち時間
 */
function scrollToTarget(el, duration = 250) {
    let rect = el.getBoundingClientRect();
    let gap = header.clientHeight + 40;
    let targetPosition = rect.top + window.scrollY - gap;

    setTimeout(() => {
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    }, duration);
}

/**
 * 数字チェック
 * @param {string|number} val チェック対象の値（文字列｜数字）
 * @param {HTMLElement} el 対象の要素（数字以外があるときは、空文字を入力する。全角数字があるときは半角数字に変換する）
 * @returns {boolean} 整数のときはtrue、違うときはfalse
 */
function isNumber(val, el){
    //入力値がないときは、何もしない
    val = String(val);
    if(val === "") return false;

    //全角、半角の数字のみかチェック
    const reg = new RegExp(/^[0-9０-９]*$/);
    const result = reg.test(val);
    if(result === false){
        el.value = "";
        return false;
    } 
    
    //全角を半角にする
    el.value = ZenkakuToHankaku(val)
    return true;
}

/**
 * 整数チェック
 * @param {HTMLElement} el 
 */
function validateIntInput(el){
    //入力値がないときは、何もしない
    let val = el.value;
    if(val === "") return false;

    const regex = /^(?!0\d)(?!0$)\d+$/;

    if(!regex.test(val)){
        el.value = "";
        return "先頭が０でない数字を入力してください"; // 不正な文字を削除
    }
    return true;
}

/**
 * 桁数チェック
 * @param {number} val チェック対象の数字
 * @param {string} type チェックする桁数
 * @return {boolean} 適切なときはtrue、それ以外はfalse
 */
function isDigit(val, type){
    let validDigit;
    let countDigit = String(val).length;
    //電話番号（10桁又は11桁）
    if(type === "phoneNumber"){
        validDigit = [10, 11]
        return validDigit.includes(countDigit);
    }else if(type === "postNumber"){
        //郵便番号（7桁）
        validDigit = 7;
        return (validDigit === countDigit);
    }
}

/**
 * 電話番号形式チェック
 * @param {string} val 
 * @param {HTMLElement} el 
 * @returns {boolean} 形式に合致するときはtrue、合致しないときはfalse
 */
function checkPhoneNumber(val, el){
    const result = isNumber(val, el);
    if(!result) return false;
    return isDigit(el.value, "phoneNumber");
}

/**
 * 郵便番号形式チェック
 * @param {string} val 
 * @param {HTMLElement} el 
 * @returns {boolean} 形式に合致するときはtrue、合致しないときはfalse
 */
function checkPostNumber(val, el){
    const result = isNumber(val, el);
    if(!result) return false;
    return isDigit(el.value, "postNumber");
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
 * @param {HTMLElement} el
 */
function trimAllSpace(val, el){
    const trimedVal = val.replace(/ |　/g, "");
    el.value = trimedVal;
    return trimedVal;
}

/**
 * 空文字チェック
 * @param {HTMLElement} el チェック対象の要素
 * @return 空文字でないときは先頭と末尾の空白を削除した入力値を返す、空文字のときは、falseを返す
 */
function isBlank(el){
    const str = el.value.trim();
    return str.length === 0 ? "入力が必須です": false;
}

/**
 * 改行チェック
 * @param {string} str 
 * @param {HTMLElement} el 
 * @returns 要素に改行コードを空文字に変換した文字列を入力する
 */
function toSingleLine(str, el){
    el.value = str.replace(/\n|\r/g, "");
}

/**
 * 記号が含まれてないかチェック
 * @param {HTMLElement} el チェック対象の要素
 * @returns 記号が含まれてないときはtrue、含まれているときはエラーメッセージ
 */
function isSymbolIncluded(el){
    const reg = new RegExp(/^[^!-/:-@[-`{-~！-／：-＠［-｀｛-～”’・。、￥「」ー]+$/)
    if(reg.test(el.value)){
        return true;
    }else{
        el.value = "";
        return "記号が含まれています"
    }
}

/**
 * 全角入力チェック
 * @param {HTMLElement} el チェック対象の要素
 * @returns 条件に一致しないときはエラーメッセージ、一致するときは、校正した文字列を返す
 */
function isOnlyZenkaku(el){
    const val = el.value;
    //スペースを削除
    let str = trimAllSpace(val, el);
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
    if(/^[^0-9０-９A-ZＡ-Ｚa-zａ-ｚ!-/:-@[-`{-~！-／：-＠［-｀｛-～”’・。、￥「」ー]*$/.test(val)){
        return true;
    }else{
        return "英数記号は使用できません";
    };
}

/**
 * エラーメッセージ表示のトグル
 * @param {boolean} isValid 
 * @param {HTMLElement} el エラーメッセージを表示する要素
 * @param {string} message エラーメッセージ
 */
function toggleErrorMessage(isValid, el, message=""){
    //入力値が適切なとき
    if(isValid){
        //エラーメッセージを隠す
        el.style.display = "none";
    }else{
        //エラーメッセージを表示する
        el.innerHTML = message;
        el.style.display = "block";
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

/**
 * tagName,className,Nameで取得した要素の最後の要素を取得する
 * @param {string} selector セレクタ
 * @param {string} attribute tag、class、nameのいずれか
 * @param {string} target 取得する要素の親要素
 * @returns HTMLCollectionの最後の要素
 */
function getLastElByAttribute(selector, attribute, target = null) {
    let els;
    switch (attribute) {
        case 'tag':
            els = target ? target.getElementsByTagName(selector): document.getElementsByTagName(selector);
            break;
        case 'class':
            els = target ? target.getElementsByClassName(selector): document.getElementsByClassName(selector);
            break;
        case 'name':
            els = target ? target.getElementsByName(selector): document.getElementsByName(selector);
            break;
        default:
            return null;
    }
    return els[els.length - 1];
}

/**
 * 配列の最後の要素を取得する
 * @param {array} arr 
 * @returns 
 */
function getLastElFromArray(arr){
    return arr[arr.length - 1];
}

/**
 * 数字の入力を制限する
 * @param {event} e キーダウンイベント
 */
function disableNumKey(e){
    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
    }
}

/**
 * 半角入力を制限する
 * @param {event} e キーダウンイベント
 */
function disableHankaku(e){
    // 半角文字のキーコードは32から126まで
    if (e.keyCode >= 32 && e.keyCode <= 126) {
        // 半角文字のキーが押された場合、デフォルトの動作をキャンセル
        e.preventDefault();
    }
}

/**
 * イベントリスナー集
 */
window.addEventListener("load", ()=>{
    removePx();
})

window.addEventListener("resize", ()=>{
    removePx();
})

/**
 * エンターキーに次の入力欄にフォーカスする処理を実装する
 * @param {Event} e イベント
 * @param {HTMLElement} el 次にフォーカスする要素
 */
function setEnterKeyFocusNext(e, el){
    //Enterで次の入力欄にフォーカス
    if(e.key === "Enter"){
        e.preventDefault();
        el.focus();
    }
}

/**
 * 年月から日数を取得する
 * @param {number} year 
 * @param {number} month 
 * @returns 日数（num）
 */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * フォーム内にあるinput要素でのEnterを無効化する
 * submitされてしまうのを防ぐため
 */
function disableEnterKeyForInputs(){
    const inputArr = document.getElementsByTagName("input");
    for(let i = 0, len = inputArr.length; i < len; i++){
        inputArr[i].addEventListener("keydown",(e)=>{
            if(e.key === "Enter")
                e.preventDefault();
        })
    }
}

/**
 * コンマを追加する
 * @param {number} num 
 * @returns 
 */
function addCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * コンマを削除する関数
 * @param {string} str 
 * @returns
 */
function removeCommas(str) {
    return str.replace(/,|，/g, "");
}

/**
 * セレクトに追加するオプションタグを生成する
 * @param {string} val 
 * @param {string} text 
 * @returns 
 */
function createOption(val, text){
    const option = document.createElement("option");
    option.value = val;
    option.text = text;
    return option;
}
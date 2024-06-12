"use strict";

// エラーメッセージなどのテンプレ
class MessageTemplates{

    /**
     * 指定された関数名と引数からエラーメッセージを生成する。
     * @param {string} functionName - 関数名
     * @param {object} args - {argName: arg, ...}
     * @returns {string} - 生成されたエラーメッセージ
     */
    static functionNameAndArgs(functionName, args) {

        let result = `${functionName}でエラー\n`;

        // 引数オブジェクトをイテレートして、各引数の名前と値を文字列に追加
        for (const [key, value] of Object.entries(args)) {
            result += `${key}=${value}\n`;
        }

        // 最後の改行を削除
        return result.trim();
    }
}

/**
 * 全テンプレートで共通の変数
 */
const smWidth = 575;
const mdWidth = 767;
const lgWidth = 991;
const xlWidth = 1199;
const xxlWidth = 1399;
let header = document.getElementById("header");

//bootstrapのツールチップを有効化
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

let reqInputs = [];
let msgEls = [];
let msgs = [];
let invalidEls = [];
let preserveInvalidEls = [];
let isValid;

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
    val = val.replace(/　/g, " ");
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
 * ひらがな又はカタカナのみか検証
 * @param {string} str 
 * @returns {boolean}
 */
function isOnlyHiraganaOrKatakana(str) {
    const hiraganaKatakanaRegex = /^[\u3040-\u309F\u30A0-\u30FF]+$/;
    return hiraganaKatakanaRegex.test(str);
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
}

/**
 * スライド非表示する
 * @param {HTMLElement} el 
 * @param {number} duration 
 */
const slideUp = (el, duration = 100, callback = null) => {
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
        el.style.setProperty("display", "none", "important");
        el.style.removeProperty("height");
        el.style.removeProperty("padding-top");
        el.style.removeProperty("padding-bottom");
        el.style.removeProperty("margin-top");
        el.style.removeProperty("margin-bottom");
        el.style.removeProperty("overflow");
        el.style.removeProperty("transition-duration");
        el.style.removeProperty("transition-property");
        el.style.removeProperty("transition-timing-function");
        if (callback && typeof callback === "function") {
            callback();
        }
    }, duration);
};

/**
 * スライド表示する
 * @param {HTMLElement} el 
 * @param {number} duration 
 */
const slideDown = (el, duration = 100) => {
    return new Promise((resolve, reject) => {
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
        el.offsetHeight; // Trigger reflow
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
            resolve(); // Resolve the promise after the animation is complete
        }, duration);
    });
};

/**
 * slideDownの後にscrollToTargetを実行する
 * @param {HTMLElement} el 対象の要素
 */
async function slideDownAndScroll(el, slideDownDuration = 100, scrollToTargetDuration = 100){
    await slideDown(el, slideDownDuration);
    await scrollToTarget(el, scrollToTargetDuration);
}

/**
 * 要素が表示されているときは、slideUp、非表示のときはslideUpしてスクロールする
 * @param {HTMLElement} el 対象の要素
 */
function slideToggle(el){
    if(window.getComputedStyle(el).display !== 'none')
        slideUp(el);
    else
        slideDownAndScroll(el);
}


/**
 * 非表示のとき対象の要素を表示する
 * @param {HTMLElement} el 表示する要素
 */
async function slideDownIfHidden(el, sdDuration = 100, stduration = 100){
    if(window.getComputedStyle(el).display === "none")
        await slideDownAndScroll(el, sdDuration, stduration);
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
function scrollToTarget(el, duration = 100) {
    return new Promise(resolve => {
        let rect = el.getBoundingClientRect();
        let gap = header.clientHeight + 40;
        let targetPosition = rect.top + window.scrollY - gap;

        setTimeout(() => {
            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
            resolve(); // スクロール処理が完了したことを示す
        }, duration);
    });
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
    if(val === "")
        return false;

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
 * @param {HTMLInputElement} input チェック対象の入力
 * @param {string} type チェックする桁数 creditCardNumber, cvv, phoneNumberWithHyphen, phoneNumber, postNumber, propertyNumber
 * @return {boolean} 適切なときはtrue、それ以外はエラーメッセージ
 */
function isDigit(input, type) {
    const countDigit = input.value.length; // 文字列化の必要はない
    switch (type) {
        case "token":
            //一時コード(4桁)
            return [4].includes(countDigit) ? true : "4桁で入力してください";
        case "creditCardNumber":
            //クレジットカード(15または16桁)
            return [14, 15, 16].includes(countDigit) ? true : "14 - 16桁で入力してください";
        case "cvv":
            // cvv（3または4桁）
            return [3, 4].includes(countDigit) ? true : "3,4桁で入力してください";
        case "phoneNumberWithHyphen":
            //電話番号ハイフン有り（12桁又は13桁）
            return [12, 13].includes(countDigit) ? true : "ハイフンありで12,13桁で入力してください";
        case "phoneNumber":
            // 電話番号（10桁または11桁）
            return [10, 11].includes(countDigit) ? true : "ハイフンなしで10,11桁で入力してください";
        case "postNumber":
            // 郵便番号（7桁）
            return countDigit === 7 ? true : "ハイフンなしの7桁で入力してください";
        case "propertyNumber":
            // 不動産番号（13桁）
            return countDigit === 13 ? true : "13桁で入力してください";
        default:
            return "未知のタイプです";
    }
}

/**
 * 電話番号形式チェック（ハイフンの有無両方対応可）
 * @param {HTMLInputElement} input 
 * @param {boolean} isHyphen
 * @returns {boolean} 形式に合致するときはtrue、合致しないときはエラーメッセージ
 */
function checkPhoneNumber(input, isHyphen){
    //元の値を保持する
    const originalVal = input.value;
    let val = originalVal;
    //ハイフンありのとき、ハイフンを除去する
    if(isHyphen){
        const matches = val.match(/[-－ー]/g);
        const count = matches? matches.length: 0;
        if(count !== 2){
            input.value = "";
            return "ハイフンを２つ使用してください";
        }
        val = val.replace(/[-－ー]/g, '');
    }
    //数字チェック
    let result = isNumber(val, input);
    if(!result){
        input.value = "";
        return "数字で入力してください";
    }

    if(isHyphen){
        //ハイフンの前後に１文字以上の存在することをチェック
        const pattern = /^.+[-－ー].+[-－ー].+$/;
        // パターンに一致するかチェック
        if (!pattern.test(originalVal)) {
            return "ハイフンの前後に１字以上の数字を入力してください";
        }
    }

    input.value = hankakuToZenkaku(originalVal);
    result = isDigit(input, isHyphen? "phoneNumberWithHyphen": "phoneNumber");
    if(typeof result === "string"){
        input.value = "";
    }
    return result;
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
function trimAllSpace(val, el = null){
    const trimedVal = val.replace(/[\s\u3000]+/g, "");
    
    if(el)
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
    if(str.length == 0)
        return "入力が必須です";

    //改行チェック
    toSingleLine(str, el);

    //英数記号チェックの結果を返す
    return isAlphaNumSymbolIncluded(str);
}

/**
 * パスワード形式チェック
 * @param {string} value 
 * @param {HTMLElement} el 
 */
function checkPassword(value, el){
    //英数記号を含む8字以上か
    const reg = new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!-\/:-@\[-`{-~])[0-9a-zA-Z!-\/:-@\[-`{-~]{8,}$/);
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
 * アルファベットと記号が含まれているかチェック
 * @param {string} val - 検証する文字列
 * @returns {boolean|string} - いずれかが含まれている場合はエラーメッセージ、そうでない場合はtrue
 */
function validateAlphabetAndSymbols(val) {
    // アルファベットを検出
    const alphabetMatches = val.match(/[A-Za-zＡ-Ｚａ-ｚ]/g);
    if (alphabetMatches) {
        return "アルファベットがあります: " + alphabetMatches.join(", ");
    }

    // 記号を検出
    const symbolMatches = val.match(/[!-/:-@[-`{-~！-／：-＠［-｀｛-～”’・。、￥「」ー]/g);
    if (symbolMatches) {
        return "記号があります: " + symbolMatches.join(", ");
    }

    return true;
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
 * 数字のみの入力に制限する
 * @param {event} e 
 */
function allowOnlyNumber(e){
    const allowedKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];

    // キーが許可されていない場合は入力を無効化
    if (!allowedKeys.includes(e.key)) {
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
    //Enter（numpadのenterを含む）で次の入力欄にフォーカス
    if(e.key === "Enter"){
        e.preventDefault();
        if(el)
            el.focus();
    }
}

/**
 * 年月から日数を取得する
 * @param {string} year 
 * @param {string} month 
 * @returns {number} 日数
 */
function getDaysInMonth(year, month) {
    return new Date(parseInt(year), parseInt(month), 0).getDate();
}

/**
 * フォーム内にあるinput要素でのEnterを無効化する
 * submitされてしまうのを防ぐため
 */
function disableEnterKeyForInputs(){
    const inputs = document.querySelectorAll("input");
    inputs.forEach(x => {
        x.addEventListener("keydown", (e)=>{
            if(e.key === "Enter")
                e.preventDefault();
        });
    });
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
    if(str)
        return str.replace(/,|，/g, "");
    else
        return;
}

/**
 * 全角の通貨（コンマ有り）からintを返す
 * @param {string} str 
 * @returns {number|string}
 */
function zenkakuCurrencyToInt(str){
    if(!str)    
        return;

    const removedComma = removeCommas(str);
    const hankaku = ZenkakuToHankaku(removedComma);
    const num = parseInt(hankaku);

    return num >= 0? num: "";
}

/**
 * intから全角の通貨（コンマ有り）を返す
 * @param {number} num 
 */
function intToZenkakuCurrency(num){
    const str = addCommas(num);
    return hankakuToZenkaku(str);
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

/**
 * アラートを表示する（SweetAlert2）
 * @param {string} title タイトル（太大文字）
 * @param {string} text 説明文
 * @param {string} icon アラートレベル（successやwarning）
 */
function showAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
    });
}

/**
 * 確認ダイアログを表示する（SweetAlert2）
 * @param {string} title タイトル（太大文字）
 * @param {string} text 説明文
 * @param {string} icon アラートレベル（successやwarning）
 */
function showConfirmDialog(title, text, icon){
    return Swal.fire({
        title: title,
        html: text,
        icon: icon,
        showCancelButton: true,
        showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
        },
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK"
    })
}

/**
 * input、selectを全て有効にする
 * ・フォームのsubmit前に使用する
 */
function enableAllInputsAndSelects(){
    Array.from(document.querySelectorAll("fieldset, input, select")).forEach(x => x.disabled = false);
}

/**
 * 基本ログ情報
 * @param {string} functionName 関数名
 * @param {Error} e エラーオブジェクト
 * @param {string} message 開発者メッセージ
 * @param {string} level エラーレベル("info", "warn", "error"(デフォルト)のいずれか)
 */
function basicLog(functionName, e = null, message = null, level = null){
    const msg = `functionName=${functionName}\nmessage=${message}\ne=${e}`;
    if(level === "info")
        console.info(msg);
    else if(level === "warn")
        console.warn(msg);
    else
        console.error(msg);
}

/**
 * 市区町村のバリデーション
 * 
 * 空欄/ 英数字/ 最後の文字が市区町村のいずれかで終了する
 * @param {HTMLInputElement} input 
 */
function validateCity(input){
    
    /**
     * 文字列の最後が市、区、町、村で終わるかどうかをチェックする関数
     * @param {string} val - 検証する住所文字列
     * @returns {boolean} - 文字列が市、区、町、村で終わる場合はtrue、そうでない場合はfalse
     */
    function endsWithCity(val) {

        const pattern = /(市|区|町|村)$/;
        if(pattern.test(val))
            return true;
        
        return "最後が「市区町村」のいずれかになっていません。";
    }

    let result;

    result = isOnlyZenkaku(input);
    if(typeof result === "string")
        return result;

    const val = input.value;
    return endsWithCity(val);
}

/**
 * 町域・番地のバリデーション
 * 
 * 空欄/ 全角にする/ アルファベット・記号があるときアラート表示
 * @param {HTMLInputElement} input 
 */
function validateAreaAddress(input){
    
    const val = input.value;
    let result;

    result = isBlank(input);
    if(typeof result === "string")
        return result;

    result = validateBeforeChomeWord(val);
    if(typeof result === "string")
        return result;

    input.value = hankakuToZenkaku(val);
    const zenkakuVal = input.value;

    result = validateAlphabetAndSymbols(zenkakuVal);
    if(typeof result === "string")
        alert(`お間違いないでしょうか？\n\n${result}\n`);

    return true;
}

/**
 * 「丁目」という文字の1つ前が漢数字であるかどうかをチェックする関数
 * @param {string} val - 検証する文字列
 * @returns {boolean|string} - 条件を満たす場合はtrue、そうでない場合はエラーメッセージ
 */
function validateBeforeChomeWord(val) {

    if(!val.includes("丁目"))
        return true;

    const pattern = /([一二三四五六七八九十])丁目/;

    if (pattern.test(val)) {
        return true;
    } else {
        return "「丁目」の前は漢数字にしてください";
    }
}

/**
 * 先頭と末尾の半角と全角スペースを削除する
 * @param {string} val 
 */
function trimStartAndEndSpace(val){
    return val.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}

/**
 * 値の中に半角または全角のスペースが1つだけあることを検証
 * @param {string} val 
 * @returns 
 */
function hasSingleSpace(val) {
    // 半角スペースまたは全角スペースを正規表現でチェック
    var spaceCount = (val.match(/[ \u3000]/g) || []).length;
    if(spaceCount === 1)
        return true;

    return "スペースを1つ入れてください";
}

/**
 * アルファベットのみか検証
 * @param {string} val 
 * @returns 
 */
function isAlphabetOnly(val){
    const result = /^[A-Za-zＡ-Ｚａ-ｚ]+$/.test(val);
    if(result)
        return true;

    return "アルファベットのみで入力してください";
}

/**
 * targetInputの上部にtextのツールチップをトグルする
 * @param {HTMLInputElement} targetInput 
 * @param {string} text 
 */
function toggleVerifyingTooltip(isDisplay, targetInput, text = null){
    const targetId = targetInput.id;
    if(isDisplay){
        const tooltip = 
        `<div id="${targetId}_verifyingEl" class="verifying emPosition" style="z-index: 100; position: absolute;">
            ${text}
            <div class="spinner-border text-white spinner-border-sm" role="status">
            </div>
        </div>`;
        targetInput.insertAdjacentHTML('afterend', tooltip);
    }else{
        document.getElementById(`${targetId}_verifyingEl`).remove();
    }
}

/**
 * ボタンのイベント開始と終了の表示処理
 * @param {boolean} start 
 * @param {HTMLButtonElement} btn 
 * @param {HTMLElement} spinner 
 */
function toggleProcessing(start, btn, spinner){
    spinner.style.display = start? "": "none";
    btn.disabled = start? true: false;
}
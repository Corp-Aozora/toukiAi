"use strict";

/*
    変数
*/
if (typeof window.linkToProgressArea === 'undefined') {
    window.linkToProgressArea = '新しいヘッダーの値';
}
if (typeof window.header === 'undefined') {
    window.header = '新しいヘッダーの値';
}
let resizeFlg;

/**
 * サイドバーを更新する
 */
function updateSideBar(){
    if(!header)
        return;

    setSideBarTop();
    setSidebarHeight();
}

/**
 *  サイドバーの高さを設定
 */
function setSidebarHeight(){

    if (resizeFlg !== false) {
        clearTimeout(resizeFlg);
    }

    resizeFlg = setTimeout(function(){
    let headerHeight = header.clientHeight;
    let pageHeight = document.documentElement.clientHeight;
    // let mainHeight = document.getElementById("main").clientHeight;
    // let gap = mainHeight - pageHeight;
    let vh = pageHeight - headerHeight - 32;
    
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 300);
}

/*
    サイドバーの高さの位置を設定
*/
function setSideBarTop(){
    let gap = 16
    let top = header.clientHeight + gap;
    document.documentElement.style.setProperty('--top', `${top}px`);
}

/**
 * 引数に渡された１つ又は配列に入った要素の子要素として存在するinput要素を全て初期化する
 * @param {HTMLElement[]|HTMLElement} els 初期化したいinput要素が属する親要素（配列形式じゃなくてもOK）
 */
function iniAllInputs(els){
    if(!Array.isArray(els))
        els = [els];

    for(let i = 0; i < els.length; i++){
        const inputs = els[i].getElementsByTagName('input');
        for(let j = 0; j < inputs.length; j++){
            const input = inputs[j];
            input.disabled = false;
            if(['text', "hidden"].includes(input.type))
                input.value = '';
            else if(input.type === 'radio')
                input.checked = false;
            else if(input.type === 'number')
                input.value = "0";
        }
    }
}

/**
 * 最初の要素以外全て削除する
 * @param {array} els 
 */
function removeAll(els){
    if(!Array.isArray(els))
        els = Array.from(els);

    if(els.length > 0){
        els.forEach((el) => {
            el.parentNode.removeChild(el);
        });
    }
}

/**
 * 最初の要素以外全て削除する
 * @param {HTMLElement[]|HTMLCollection} els 
 */
function removeAllExceptFirst(els){
    for(let i = els.length - 1; i > 0; i--){
        els[i].parentNode.removeChild(els[i]);
    }
}

/**
 * ボタン要素のチェックを全てfalseにする
 * @param {element array} els 配列に格納されたボタン要素
 * @param {num} idxs 初期化するボタン要素のインデックス
 */
function uncheckTargetElements(els, idxs){
    idxs.forEach(idx => els[idx].checked = false);
}

/**
 * 要素を入れ替える（イベントをまとめて削除したいときに使用）
 * @param {element} field 対象の要素の親要素
 * @param {string} selector querySelectoAllのセレクタ
 */
function replaceElements(field, selector){
    let els = field.querySelectorAll(selector);
    els.forEach(oldEl => {
        let newEl = oldEl.cloneNode(true);
        oldEl.parentNode.replaceChild(newEl, oldEl);
    });
}

/**
 * 引数で渡された要素より前にある一番近い特定のタグの要素を返す
 * @param {HTMLElement} el 基準となる要素
 * @param {string} tagName 取得したい要素のタグ名
 * @return 引数で渡された要素より前にある一番近い特定のタグの要素
 */
function getPreElByTag(el, tagName){
    let i = 0;
    while (el && i < 10) {
        el = el.previousElementSibling;
        i++;
        if (el && el.matches(`${tagName}`)) {
            return el;
        }
    }
}

/**
 * 引数で渡された要素より後ろにある特定のタグの一番最初の要素を返す
 * @param {HTMLElement} el 基準となる要素
 * @param {string} tagName 取得したい要素のタグ名
 * @return 引数で渡された要素の後ろにある特定のタグの一番最初の要素
 */
function getNextElByTag(el, tagName){
    let i = 0;
    while (el && i < 10) {
        el = el.nextElementSibling;
        i++;
        if (el && el.matches(`${tagName}`)) {
            return el;
        }
    }
}

/**
 * インプット要素に入力してchangeイベントを発火させる
 * @param {HTMLInputElement|HTMLSelectElement} el 要素
 */
function inputOrCheckAndDispatchChangeEvent(el, text = null){
    if(!el)
        return;

    const tagName = el.tagName.toUpperCase();

    if(tagName === "SELECT"){
        el.value = text;
    }else if(tagName === "INPUT"){
        const type = el.type;
        if(type === "text")
            el.value = text;
        else if(type === "radio")
            el.checked = true;
    }

    el.dispatchEvent(new Event("change"));
}

/**
 * 値が存在するときにイベントを発生させる
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} input 
 * @param {string} event "change", "input"など
 * @returns 
 */
function dispatchEventIfValue(input, event){
    if(!input)
        return;

    const tagName = input.tagName.toUpperCase();
    const hasValue = (tagName === "INPUT" && (input.type === "text" || input.type === "number") && input.value) ||
        (tagName === "INPUT" && (input.type === "checkbox" || input.type === "radio") && input.checked) ||
        (tagName === "SELECT" && input.value) ||
        (tagName === "TEXTAREA" && input.value);

    if(hasValue)
        input.dispatchEvent(new Event(event));
}

/**
 * input要素を初期化する
 * @param {HTMLInputElement} input 
 */
function resetInputValue(input) {
    if (input.type === "text" || input.type === "number") {
        input.value = "";
    } else if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
    }
}

/**
 * input要素とselect要素の値を初期化する
 * @param {(HTMLElement|HTMLElement[])} els 
 */
function iniInputsAndSelectValue(els) {
    // 単一の要素を配列に統一
    if(!Array.isArray(els))
        els = [els];
    
    els.forEach(el => {
        // 一時的にdisabledを解除
        const wasDisabled = el.disabled;
        if(wasDisabled)
            el.disabled = false;

        // タグ名による処理の分岐
        const tagName = el.tagName.toUpperCase(); // 大文字小文字を区別しない比較のため
        if(tagName === "INPUT"){
            resetInputValue(el);
        }else if(tagName === "SELECT"){
            el.value = "";
        }

        // 元のdisabled状態に戻す
        if(wasDisabled)
            el.disabled = true;
    });
}

/**
 * copyFromをクローンして属性を更新してcopyFromの弟要素として挿入する
 * @param {HTMLElement} copyFrom 
 * @param {string} att セレクタ形式で書くこと
 * @param {string} regex リテラル
 * @param {number|string} newIdx 
 */
function copyAndPasteEl(copyFrom, att, regex, newIdx){
    const clone = copyFrom.cloneNode(true);
    //属性更新
    clone.id = clone.id.replace(regex, `$1${newIdx}`);
    const els = clone.querySelectorAll(att);
    els.forEach(el => {
        if(el.id){
            el.id = el.id.replace(regex, `$1${newIdx}`);
        }
        if(el.name){
            el.name = el.name.replace(regex, `$1${newIdx}`);
        }
        if(el.htmlFor)
            el.htmlFor = el.htmlFor.replace(regex, `$1${newIdx}`);
    });
    copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling);
}

/**
 * 最初の文字を大文字にする
 * @param {string} strings 
 * @returns {string}
 */
function upperFirstString(strings){
    return strings.charAt(0).toUpperCase() + strings.slice(1);
}

/**
 * 配列から引数で渡された対象の要素を削除して返す
 * @param {*} targets 
 * @param {*} arr
 * @returns {HTMLElement[]}
 */
function filterArr(targets, arr){
    if(!Array.isArray(targets))
        targets = [targets];
    return arr.filter(x => !targets.includes(x));
}

/**
 * 都道府県の値をチェック
 * @param {string} val 
 * @param {HTMLElement} el 
 * @returns 適正なときtrue、空欄のときfalse
 */
function checkPrefecture(val, el){
    if(val === ""){
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.disabled = true;
        return false;
    }
    return true;
}

/**
 * 選択された都道府県に存在する市区町村を取得する
 * @param {string} val 都道府県欄の値
 * @param {HTMLElement} el 市区町村欄
 * @param {Fieldset} instance インスタンス
 * @returns 
 */
async function getCityData(val, el, instance){
    //未選択のとき、市町村データを全て削除して無効化する
    if(!checkPrefecture(val, el))
        return;
    //エラー要素から都道府県を削除する
    instance.noInputs = instance.noInputs.filter(x => x.id !== el.id);
    //市区町村欄を有効化してフォーカスを移動する
    el.disabled = false;
    //データ取得中ツールチップを表示する
    const verifyingEl = `<div id="${el.id}_verifyingEl" class="verifying emPosition" style="z-index: 100; position: absolute;">
    市区町村データ取得中
    <div class="spinner-border text-white spinner-border-sm" role="status">
    </div>
    </div>`;
    el.insertAdjacentHTML('afterend', verifyingEl);
    //都道府県に紐づく市区町村データを取得して表示できるようにする
    const url = 'get_city';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({"prefecture" : val}),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        if (!response.ok) {
            // HTTPエラーを投げ、それをcatchブロックで捕捉
            throw new Error(
                `関数：getCityDataの${instance.constructor}\n
                詳細：api通信エラー ${response.status}`
            );
        }
        return response.json();
    }).then(response => {
        //エラーメッセージを表示する要素
        const errorMessageEl = document.getElementById(`${el.id}_message`);
        //取得できたとき
        const data = response.data;
        if(data !== ""){
            //市区町村データ
            let option = "";
            //東京都のときは市区町村に区があってもいいようにする
            for(let i = 0, len = data.length; i < len; i++){
                const prefCode = data[i].prefCode;
                const cityName = data[i].cityName;
                if(prefCode !== 13 && cityName.slice(-1) === "区")
                    continue;
                option += `<option value="${cityName}">${cityName}</option>`;
            }
            //市区町村データを表示して、エラーメッセージを非表示にする
            el.innerHTML = option;
            errorMessageEl.style.display = "none";
        }else{
            //取得できなかったときは、エラーメッセージを表示してエラー要素として市区町村要素を取得する
            errorMessageEl.style.display = "block";
            instance.noInputs.push(el);
            throw new Error(                
                `関数：getCityDataの${instance.constructor.name}\n
                詳細：市区町村データを取得できませんでした`
            )
        }
    }).catch(e => {
        throw new Error(
            `関数：getCityDataの${instance.constructor.name}\n
            詳細：${e}`
        );
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
    });
}

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
 */
async function getDecedentCityData(){
    const url = 'get_decedent_city_data';
    const inputs = decedents[0].inputs;
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        if (!response.ok) {
            // HTTPエラーを投げ、それをcatchブロックで捕捉
            throw new Error(`サーバーエラー: ${response.status}`);
        }
        return response.json();
    }).then(response => {
        if(response.city !== ""){
            inputs[DCity].value = response.city;
        }
        if(response.domicileCity !== ""){
            inputs[DDomicileCity].value = response.domicileCity;
        }
    }).catch(e => {
        console.error(`getDecedentCityData：${e}`);
    });
}

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
 * @returns 登記簿上の住所が格納された配列
 */
function getRegistryNameAndAddressCityData(){
    const url = 'get_registry_name_and_address_city_data';
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        return response.citys;
    }).catch(error => {
        console.log(`getRegistryNameAndAddressCityData:エラーが発生\n${error}`);
    });
}

/**
 * 全相続人の住所データを取得する
 * @returns 相続人の住所が格納された配列
 */
function getHeirsCityData(){
    const url = 'get_heirs_city_data';
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        return response.datas;
    }).catch(e => {
        basicLog("getHeirsCityData", e);
    });
}

/**
 * クローンした要素の属性を更新する
 * @param {HTMLElement} clone 複製した要素
 * @param {string} att セレクタ 例"[id],[name],[for]"
 * @param {RegExp} regex 正規表現
 * @param {number} newIdx 新しいインデックス
 */
function updateAttribute(clone, att, regex, newIdx){
    clone.id = clone.id.replace(regex, `$1${newIdx}`);
    const els = clone.querySelectorAll(att);
    els.forEach(el => {
        if(att.includes("[id]") && el.id)
            el.id = el.id.replace(regex, `$1${newIdx}`);
        if(att.includes("[name]") && el.name)
            el.name = el.name.replace(regex, `$1${newIdx}`);
        if(att.includes("[for]") && el.htmlFor)
            el.htmlFor = el.htmlFor.replace(regex, `$1${newIdx}`);
    });       
}

/**
 * 入力欄を全て無効化する
 */
function disableAllInputs() {

    const form = document.getElementsByTagName("form")[0];
    const formElements = form.querySelectorAll('input, textarea, select, button');
    formElements.forEach(el => {
        el.disabled = true;
    });
}

/**
 * progressと一致するページ以外は入力欄を無効化して表示する
 * 
 * @param {number} progress 作業中の番号
 */
function disablePage(progress){

    const path = window.location.pathname;

    if((progress >= 1 && progress < 2 && path !== '/toukiApp/step_one') ||
        (progress >= 2 && progress < 3 && path !== '/toukiApp/step_two') ||
        (progress >= 3 && progress < 4 && path !== '/toukiApp/step_three') ||
        (progress >= 4 && progress < 5 && path !== '/toukiApp/step_four') ||
        (progress >= 5 && progress < 6 && path !== '/toukiApp/step_five')){
        disableAllInputs();
    }
}

/**
 * 前に戻るボタンのイベント
 * @param {number} currentStep 
 */
function handlePreBtnEvent(currentStep){

    const dialogTitle = "ここでの入力内容が初期化されますがよろしいですか？";
    const html = "他のページの入力内容を確認するだけの場合は、進捗状況からご移動ください";
    const icon = "warning";
    const preBtn = document.getElementById("preBtn");
    const spinner = document.getElementById("preBtnSpinner");
    
    // 1つ前のパスを取得する
    function getPrePath(){
        if(currentStep >= 2 && currentStep < 3){
            return "step_one";
        }else if(currentStep >= 3 && currentStep < 4){
            return "step_two";
        }else if(currentStep >= 4 && currentStep < 5){
            return "step_three";
        }else if(currentStep >= 5 && currentStep < 6){
            return "step_four";
        }else if(currentStep >= 6 && currentStep < 7){
            return "step_five";
        }else{
            throw new Error(`getPrePathでエラー\ncurrentStep=${currentStep}`);
        }
    }
    
    const prePath = getPrePath();
    
    // 申請後のページのときは確認モーダル不要
    if(currentStep >= 6){
        toggleProcessing(true, preBtn, spinner);
        window.location.href = prePath;
        return;
    }
    
    showConfirmDialog(dialogTitle, html, icon).then(async(result) =>{
        
        if(!result.isConfirmed)
            return;
        
        toggleProcessing(true, preBtn, spinner);
        
        const progress = currentStep - 0.5;
        const data = { "progress" : progress };
        try{
            const response = await fetch('step_back', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                mode: "same-origin"
            });
            
            const responseData = await response.json();
            if(response.ok)
                window.location.href = prePath;
            else
                throw new Error(responseData.message);
        }catch(e){
            basicLog("handlePreBtnEvent", e, "showConfirmDialog処理中にエラー");
            alert(`システムエラー\n\n再試行しても同じエラーが出る場合は、恐れ入りますが、お問い合わせをお願いします。`);
            toggleProcessing(false, preBtn, spinner);
        }
    })
}

/*
    イベント
*/
window.addEventListener("load", ()=>{
    updateSideBar();
})

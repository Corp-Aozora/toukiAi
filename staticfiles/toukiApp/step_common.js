"use strict";

/*
    変数
*/
let resizeFlg;

/**
 * サイドバーを更新する
 */
function updateSideBar(){
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

function hiddenSidebar(){
    let width = document.documentElement.clientWidth;
    if(width < 975){
        linkToProgressArea.style.display = "block";
        sidebar.classList.remove("d-flex");
        sidebar.style.display = "none";
    }else{
        linkToProgressArea.style.display = "none";
        sidebar.classList.add("d-flex");
        sidebar.style.display = "";
    }
}

function setNavTogglerStyle(){
    let width = document.documentElement.clientWidth;

    //ハンバーガーメニューが表示されたとき
    if(width < 558){

        //進捗状況の要素を修正
        linkToProgressArea.classList.add("mt-2", "fs-5");
        linkToProgressArea.classList.remove("ms-3");
        linkToProgress.classList.add("text-decoration-none", "text-dark", "cursor-pointer")
        linkToProgress.classList.remove("btn", "btn-outline-primary", "p-2");

        linkToProgress.addEventListener("mouseover", ()=>{
            linkToProgress.classList.remove("text-dark");
            emphasizeText(linkToProgress);
        })
        linkToProgress.addEventListener("mouseout", ()=>{
            linkToProgress.classList.add("text-dark");
            removeEmphasizeText(linkToProgress);
        })

        //ログアウトの要素を修正
        logoutArea.classList.add("mt-2", "fs-5");
        logoutArea.classList.remove("my-0", "ms-auto", "me-0");
        logout.classList.add("text-dark")
        logout.classList.remove("btn", "btn-outline-primary", "p-2");

        logout.addEventListener("mouseover", ()=>{
            logout.classList.remove("text-dark");
            emphasizeText(logout);
        })
        logout.addEventListener("mouseout", ()=>{
            logout.classList.add("text-dark");
            removeEmphasizeText(logout);
        })

    }else{

        //進捗状況の要素を修正
        linkToProgressArea.classList.remove("mt-2", "fs-5");
        linkToProgressArea.classList.add("ms-3");
        linkToProgress.classList.remove("text-decoration-none", "text-dark", "cursor-pointer")
        linkToProgress.classList.add("btn", "btn-outline-primary", "p-2");

        
        linkToProgress.removeEventListener("mouseover", ()=>{
            linkToProgress.classList.remove("text-dark");
            emphasizeText(linkToProgress);
        })
        linkToProgress.removeEventListener("mouseout", ()=>{
            linkToProgress.classList.add("text-dark");
            removeEmphasizeText(linkToProgress);

        })
        
        //ログアウトの要素を修正
        logoutArea.classList.remove("mt-2", "fs-5");
        logoutArea.classList.add("my-0", "ms-auto", "me-0");
        logout.classList.remove("text-dark")
        logout.classList.add("btn", "btn-outline-primary", "p-2");

        
        logout.removeEventListener("mouseover", ()=>{
            logout.classList.remove("text-dark");
            emphasizeText(logout);
        })
        logout.removeEventListener("mouseout", ()=>{
            logout.classList.add("text-dark");
            removeEmphasizeText(logout);
        })
    }
}

/**
 * 引数に渡された１つ又は配列に入った要素の子要素として存在するinput要素を全て初期化する
 * @param {HTMLElement[]|HTMLElement} els 初期化したいinput要素が属する親要素（配列形式じゃなくてもOK）
 */
function iniAllInputs(els){
    if(!Array.isArray(els)) els = [els];

    for (let i = 0; i < els.length; i++) {
        const inputs = els[i].getElementsByTagName('input');
        for (let j = 0; j < inputs.length; j++) {
            inputs[j].disabled = false;
            if (inputs[j].type === 'text') inputs[j].value = '';
            else if (inputs[j].type === 'radio') inputs[j].checked = false;
            else if (inputs[j].type === 'number') inputs[j].value = "0";
        }
    }
}

/**
 * 最初の要素以外全て削除する
 * @param {array} els 
 */
function removeAll(els){
    els.forEach((el) => {
        el.parentNode.removeChild(el);
    });
}

/**
 * 最初の要素以外全て削除する
 * @param {HTMLElement[]|HTMLCollection} els 
 */
function removeAllExceptFirst(els){
    for (let i = els.length - 1; i > 0; i--) {
        els[i].parentNode.removeChild(els[i]);
    }
}

/**
 * ボタン要素のチェックを全てfalseにする
 * @param {element array} els 配列に格納されたinput要素
 * @param {num} idxs 初期化するボタン要素のインデックス
 */
function uncheckTargetElements(els, idxs){
    idxs.forEach(idx => {
        els[idx].checked = false;
    });
}

/**
 * 要素を入れ替える（イベントをまとめて削除したいときに使用）
 * @param {element} field 対象の要素の親要素
 * @param {string} tagName 対象の要素
 */
function replaceElements(field, tagName){
    let els = field.getElementsByTagName(tagName);
    for (let i = 0; i < els.length; i++) {
        let oldEl = els[i];
        let newEl = oldEl.cloneNode(true);
        oldEl.parentNode.replaceChild(newEl, oldEl);
    }
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
 * 特定の形式のクラス名を削除する
 * @param {HTMLElement} el 
 * @param {RegExp} pattern 
 * @returns クラスを削除した後の要素
 */
function removeSpecificPatternClass(el, pattern){
    el.classList.forEach(className => {
        if(pattern.test(className))
            el.classList.remove(className);
    });
    return el;
}


/*
    イベント
*/
window.addEventListener("load", ()=>{
    setSidebarHeight();
    setSideBarTop();
    hiddenSidebar();
    setNavTogglerStyle();
})

//画面サイズが変更されたとき
window.addEventListener('resize', () => {
    hiddenSidebar();
    setNavTogglerStyle();
});
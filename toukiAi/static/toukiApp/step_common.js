"use strict";

/*
    変数
*/
let resizeFlg;

const rootPath = "/toukiapp/";
const steps = {
    step1: "service-stepOne",
    step2: "service-stepTwo",
    step3: "service-stepThree",
    step4: "service-stepFour",
    step5: "service-stepFive",
    step6: "service-stepSix",
    step7: "service-inquiry",
};
const stepNumbers = ["One", "Two", "Three", "Four", "Five", "Six"];
const username = document.getElementById("linkToAccount").innerHTML;

/**
 * サイドバーを更新する
 */
function updateSideBar(){
    setSideBarTop();
    setSidebarHeight();
}

/**s
 * 各進捗ボタンのアイコン、リンク、ボタンを設定する
 * @param {number} stepNumber 
 */
function updateStep(stepNumber){

    for(let i = 0; i < stepNumber; i++){
        const arrow = document.getElementById(`step${stepNumbers[i]}Arrow`);
        const done = document.getElementById(`step${stepNumbers[i]}Done`);
        const btn = document.getElementById(`btnStep${stepNumbers[i]}`);
        const link = document.getElementById(`step${stepNumbers[i]}Link`);

        i === stepNumber - 1 ? arrow.style.display = display: done.style.display = display;

        btn.disabled = false;
        link.href = `${rootPath}service-step${stepNumbers[i]}`;
        btn.classList.add("fw-bold");
    }
}

/**
 *  サイドバーの高さを設定
 */
function setSidebarHeight(){

    if (resizeFlg !== false) {
        clearTimeout(resizeFlg);
    }

    resizeFlg = setTimeout(function(){
    let headerHeight = document.getElementById("header").clientHeight;
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
    let top = document.getElementById("header").clientHeight + gap;
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
        //ロゴの要素を修正
        logoArea.classList.remove("navbar-brand");
        logoArea.classList.add("mt-3", "fw-bold", "fs-5");
        logo.innerHTML = "トップページ";

        //ユーザー名の要素を修正
        linkToAccountArea.classList.add("mt-2", "fs-5");
        linkToAccount.innerHTML = "登録情報確認"

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
        //ロゴ要素を元に戻す
        logoArea.classList.add("navbar-brand");
        logoArea.classList.remove("mt-3", "fw-bold", "fs-5");
        logo.innerHTML = "（ロゴ）";

        //ユーザー名の要素を修正
        linkToAccountArea.classList.remove("mt-2", "fs-5");
        linkToAccount.innerHTML = username;

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
 * あるボタンを押したらある要素を表示する
 * @param {button} btn 表示する要素 
 * @param {element} target 表示する要素 
 */
function buttonToElement(btn, target){
    
    //あるボタンが押されたとき
    if(btn.checked){
        //要素を表示する
        if(target.style.display === "none"){
            slideDown(target);
            scrollToTarget(target);
        }
    }else{
        slideUp(target);
    }
}

/**
 * 次へのボタンのトグル
 * @param {boolean} isValid チェック結果
 * @param {element} el チェック対象の要素
 * @param {number} index ボタン要素のインデックス
 */
function toggleNextBtn(isValid, el, index){
    
    //入力値が適切なとき
    if(isValid){

        //配列に取得
        if(invalidElArr.indexOf(el) !== -1)
            invalidElArr.push(el);
    
        //次へのボタンを無効化
        nextBtns[index].disabled = true;
        
    }else{

        //配列から削除
        invalidElArr = invalidElArr.filter(x => x !== el);

        //次へボタンを有効化判別
        if(invalidElArr.length === 0)
            nextBtns[index].disabled = false;
    }
}

/**
 * 入力値チェック後の処理
 * @param {boolean} isValid 入力値のチェック結果
 * @param {element} messageEl エラーメッセージを表示する要素
 * @param {string} message エラーメッセージ
 * @param {element} el チェック対象の要素
 * @param {element} nextBtn 次へボタン
 */
function afterValidation(isValid, messageEl, message, el, nextBtn){

    //入力値が適切なとき
    if(isValid){

        //エラーメッセージを隠す
        messageEl.style.display = hidden;

        //次へボタンを有効化判別
        if(invalidElArr.length === 0)
            nextBtn.disabled = false;        
        
    }else{
        
        //エラーメッセージを表示する
        messageEl.innerHTML = message;
        messageEl.style.display = display;
        
        //配列に取得
        invalidElArr.push(el);
    
        //次へのボタンを無効化
        nextBtn.disabled = true;

        el.value = "";
    }
}

/**
 * ボタン要素のチェックを全てfalseにする
 * @param {element array} 配列に格納されたボタン要素
 */
function uncheckAllElements(elArr){
    elArr.forEach((el)=>{
        el.checked = false;
    });
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
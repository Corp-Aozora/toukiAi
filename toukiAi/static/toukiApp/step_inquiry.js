"use strict";

const progress = document.getElementById("progress");
let column = document.getElementById("column");
const inquiryContent = document.getElementById("inquiryContent");
const beforeSubmitBtn = document.getElementById("beforeSubmitBtn");

const progressIndex = 0;
const columnIndex = 1;
const inquiryContentIndex = 2;
const submitBtnIndex = 3;

const progressField = document.getElementById("progressField");
const columnField = document.getElementById("columnField");
const inquiryContentField = document.getElementById("inquiryContentField");
const beforeSubmitBtnField = document.getElementById("beforeSubmitBtnField");
const fieldArr = [progressField, columnField, inquiryContentField, beforeSubmitBtnField];

const columnPreserve = column.innerHTML;

/**
 * 初期処理
 */
function initialize(){
    //サイドバーを更新
    setSideBarTop();
    setSidebarHeight();
    if(sessionStorage.getItem("page") !== null){
        updateSideBar();
    }
}

/**
 * 項目欄のドロップダウンをセットする
 * @param {event} e 
 */
function setColumnDropDown(e){

    //項目欄の初期値を項目ドロップダウンにセットする
    column.innerHTML = columnPreserve;

    //進捗状況で選択されたインデックスを取得する
    const index = progress.selectedIndex;

    //項目ドロップダウンから選択されたインデックスに該当する配列を取得する
    const str = column.options[index].value;
    const substring = str.substring(2, str.length - 2);
    const replace = substring.split("'").join("");
    const trim = replace.replace(/\s+/g,"");
    const arr = trim.split(",");

    //項目ドロップダウンに選択された進捗状況と一致する項目をセットする
    column.innerHTML = `<option ></option>`
    
    for(let i = 0; i < arr.length; i++){
        column.innerHTML += `<option value="${arr[i]}">${arr[i]}</option>`
    }
}

/**
 * 次の入力欄の有効化判別
 * @param {event} e イベント
 * @param {element} nextField 次の入力フィールド
 * @return {bool} 判別結果を返す
 */
function setNextInput(e, nextField){
    if(e.target.value === ""){
        nextField.disabled = true;
        return false;
    }else{
        nextField.disabled = false;
        return true;
    } 
}

/**
 * 値が変更されたフィールド以外を無効化する
 * @param {number} index 値が変更された要素のインデックス
 */
function setField(index){
    for(let i = index + 1; i < fieldArr.length; i++){
        fieldArr[i].disabled = true;
    }
}


function checkInquiryContent(e){

}

/*
    イベント
*/
window.addEventListener("load", ()=>{
    initialize();
})

//進捗状況ドロップダウンの値が変更されたとき
progress.addEventListener("change",(e)=>{
    //進捗状況以外を無効化
    setField(progressIndex);

    //進捗状況の選択チェック
    let isValid = setNextInput(e, columnField);
    //空欄のときは項目ドロップダウンの先頭（空白）を選択状態にして以降の処理を中止する
    if(isValid === false){
        column.selectedIndex = 0;
        return;
    }

    //項目欄をセットする
    setColumnDropDown(e);
})

//項目ドロップダウンの値が変更されたとき
column.addEventListener("change", (e)=>{
    //お問い合わせ内容欄をセットする
    setNextInput(e, inquiryContentField);
})

//お問い合わせ内容の値が入力されたとき
inquiryContent.addEventListener("input", (e)=>{
    //送信ボタンを有効化する
    setNextInput(e, beforeSubmitBtnField);
})

beforeSubmitBtn.addEventListener("click", ()=>{
    //お問い合わせ内容を表示して確認する
    
    //OKが押されたたら内容を送信する
    //お問い合わせが完了したことを表示する

})
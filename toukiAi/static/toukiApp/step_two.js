"use strict";

/*
    変数
*/
let realEstateInfoUploader = document.getElementById("realEstateInfoUploader");
let trash = document.getElementById("trash");

/**
 * 初期化
 */
function initialize(){
    updateSideBar();
}

/*
    イベント
*/
window.addEventListener("load", ()=>{
    initialize();
})

window.addEventListener('resize', () => {
    setSidebarHeight();
});

//登記情報アップロードのエリア上からマウスが外れたとき
realEstateInfoUploader.addEventListener("mouseout", ()=>{
    removeEmphasizeText(realEstateInfoUploader);
    removeBorderPrimarySubtleClass(realEstateInfoUploader);
})

trash.addEventListener("mouseover", ()=>{
    emphasizeText(trash);
})

trash.addEventListener("mouseout", ()=>{
    removeEmphasizeText(trash);
})
"use strict";

/**
 * イベント
 */
// 最初の画面表示後の処理
window.addEventListener("load", async ()=>{
    try{
        updateSideBar(); // サイドバーの設定
        setDecedentEvent(); // 被相続人欄にイベントを設定する
        await loadData(); // データをロードする

        disablePage(progress); // progressに応じたページの無効化

        setFormSubmitEvent();
    }catch(e){
        basicLog("load", e);
    }
})
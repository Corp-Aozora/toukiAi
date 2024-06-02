"use strict";

/**
 * 判定結果を表示する
 */
function showResult(){
    const modalEl = document.getElementById("legal_heirs_check_result_modal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * イベント
 */
// 最初の画面表示後の処理
window.addEventListener("load", async ()=>{
    try{
        // 判定結果を表示する
        if(result_for_modal.length > 0)
            showResult();

        updateSideBar(); // サイドバーの設定
        setDecedentEvent(); // 被相続人欄にイベントを設定する
        await loadData(); // データをロードする

        setFormSubmitEvent();
    }catch(e){
        basicLog("load", e);
    }
})
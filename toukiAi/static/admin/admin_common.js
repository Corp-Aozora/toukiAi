"use strict";

/**
 * submitボタンが連打されないようにするイベント設定
 */
function setPreventMashingSubmitEvent(form){
    form.addEventListener('submit', ()=> {
        // 全てのサブミットボタンを取得
        const submitButtons = form.querySelectorAll('input[type=submit]');
        // サブミット時に全ボタンを無効化
        submitButtons.forEach(button => {
            button.disabled = true;
        });
    });
}
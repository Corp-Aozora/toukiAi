"use strict";

/**
 * ４．に戻るボタンのイベント設定処理
 * ・progressを４．５にする
 * ・前のページに遷移する処理中はスピナーを表示する
 * ・処理が成功したときは前のページに戻る
 * ・エラーのときはこのページに留まる
 */
function handlePreBtnClickEvent(event){

    const dialogTitle = "ここでの入力が一部破棄されますがよろしいですか？";
    const html = "前のページの内容を確認するだけの場合は、画面左側にある進捗状況から確認したい項目をクリックしてください";
    const icon = "warning";

    showConfirmDialog(dialogTitle, html, icon).then((result) =>{

        // ダイアログで確認ボタンが押されたとき、前のページに戻る処理を実行する
        if(result.isConfirmed){

            document.getElementById("spinner").style.display = "";
            event.target.disabled = true;
            
            const data = { "progress" : 4.5 };

            fetch('step_back', {  // PythonビューのURL
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                mode: "same-origin"
            }).then(response => {
                return response.json();
            }).then(response => {

                if (response.status === 'success'){
                    window.location.href = 'step_four';
                }else if(response.status === "error"){
                    window.location.href = 'step_five';
                }
            }).catch(e => {
                basicLog("showConfirmDialog", e, "前のページに戻る処理の実行中にエラー");
                window.location.href = 'step_five';
            });
        }
    })
}

/**
 * フォーム検証
 * @param {HTMLInputElement} inputs 
 */
function isFormValid(inputs){
    submitBtn.disabled = !inputs.every(x => x.checked);
}

/**
 * inputにchangeイベントを設定する
 */
function setInputChangeEvent(){

    //csrfトークンのinputがあるためクラス名で全inputを取得
    const inputs = Array.from(document.getElementsByClassName("form-check-input")); 
    for(let i = 0, len = inputs.length; i < len; i++){

        const input = inputs[i];
        input.addEventListener("change", ()=>{
            isFormValid(inputs);
        })
    }
}

/**
 * 戻るボタンにイベント設定
 */
function setPreBtnClickEvent(){

    const preBtn = document.getElementById("preBtn");
    preBtn.addEventListener("click", (e)=>{
        handlePreBtnClickEvent(e);
    })
}

/*
 *  ロード
 *  全てのチェックボックスにイベント設定/ 戻ってきたとき、全てチェックされている状態にする
*/
window.addEventListener("load", ()=>{ 

    updateSideBar();
    setInputChangeEvent();
    setPreBtnClickEvent();

    //先のステップから戻ってきたときは、全てチェックされている状態にする
    if(progress >= 5.5)
        inputs.forEach(x => x.checked = true);

    disablePage(progress); // progressに応じたページの無効化
})

/**
 * ブラウザのサイズを変更したときサイドバーの表示を更新する
 */
window.addEventListener('resize', () => {
    setSidebarHeight();
});
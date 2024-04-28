"use strict";

function initialize(){
    updateSideBar();
}


/**
 * ２．に戻るボタンのイベント設定処理
 * ・progressを２．５にする
 * ・前のページに遷移する処理中はスピナーを表示する
 * ・処理が成功したときは前のページに戻る
 * ・エラーのときはこのページに留まる
 */
function handlePreBtnEvent(){
    const dialogTitle = "ここでの入力内容が一部初期化されますがよろしいですか？";
    const html = "内容を確認するだけの場合は、画面左側にある進捗状況から確認したい項目をクリックしてください";
    const icon = "warning";
    showConfirmDialog(dialogTitle, html, icon).then((result) =>{
        if(result.isConfirmed){
            document.getElementById("spinner").style.display = "";
            preBtn.disabled = true;
            const data = { "progress" : 3.5 };
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
                    window.location.href = 'step_three';
                }else if(response.status === "error"){
                    window.location.href = 'step_four';
                }
            }).catch(error => {
                console.error('Error:', error);
                window.location.href = 'step_four';
            });
        }
    })
}

function checkAndToggleSubmitBtn(inputs){
    if(inputs.every(x => x.checked)){
        submitBtn.disabled = false;
        return
    }

    submitBtn.disabled = true;
}

/*
    イベント
*/
window.addEventListener("load", ()=>{ 
    initialize();

    //csrfトークンのinputがあるためクラス名で全inputを取得
    const inputs = Array.from(document.getElementsByClassName("form-check-input")); 
    for(let i = 0, len = inputs.length; i < len; i++){
        inputs[i].addEventListener("change", ()=>{
            checkAndToggleSubmitBtn(inputs);
        })
    }

    //先のステップから戻ってきたときは、全てチェックされている状態にする
    if(progress >= 4.5){
        inputs.forEach(x => x.checked = true);
        submitBtn.disabled = false;
    }

    disablePage(progress); // progressに応じたページの無効化

})

window.addEventListener('resize', () => {
    setSidebarHeight();
});

/*
 * ３．に戻るボタンのクリックイベント
 */
preBtn.addEventListener("click", ()=>{
    handlePreBtnEvent();
})


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

/*
    イベント
*/
window.addEventListener("load", ()=>{ 
    initialize();
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
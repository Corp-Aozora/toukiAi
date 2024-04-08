"use strict";

function initialize(){
    updateSideBar();
}


/**
 * ４．に戻るボタンのイベント設定処理
 * ・progressを４．５にする
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
            }).catch(error => {
                console.error('Error:', error);
                window.location.href = 'step_five';
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
    ロード時全てのチェックボックスにイベント設定と先の戻ってきたときは、全てチェックされている状態にする
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
    if(progress >= 5.5)
        inputs.forEach(x => x.checked = true);
})

/**
 * ブラウザのサイズを変更したときサイドバーの表示を更新する
 */
window.addEventListener('resize', () => {
    setSidebarHeight();
});

/*
 * ４．に戻るボタンのクリックイベント
 */
preBtn.addEventListener("click", ()=>{
    handlePreBtnEvent();
})


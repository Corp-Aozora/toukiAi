// 初期表示時にメッセージ関連のモーダルを表示する処理
window.addEventListener("load", ()=>{
    const modals = document.getElementsByClassName("message_modal");
    if(modals.length > 0){
        for(let i = 0; i < modals.length; i++){
            const modal = modals[i];
            if(modal.classList.contains("modal-warning"))
                scrollToTarget(document.getElementsByTagName("form")[0]);

            const instance = new bootstrap.Modal(modal);
            instance.show();
        }
    }
})
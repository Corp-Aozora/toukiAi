"use strict";

window.addEventListener("load", ()=>{

    class Form{
        constructor(){
            this.preBtn = document.getElementById("preBtn");
            this.preBtnSpinner = document.getElementById("preBtnSpinner");

            this.setEvent();

        }

        setEvent(){
            this.preBtn.addEventListener("click", ()=>{
                this.backToPreProgress();
            })
        }

        backToPreProgress(){

            this.preBtnSpinner.style.display = "";
            this.preBtn.disabled = true;
            
            const data = { "progress" : 5.5 };
    
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
                    window.location.href = 'step_five';
                }else if(response.status === "error"){
                    window.location.href = 'step_six';
                }
            }).catch(e => {
                basicLog("backToPreProgress", e, "前のページに戻る処理の実行中にエラー");
                window.location.href = 'step_six';
            });
        }
    }

    new Form();

    // 進捗状況の更新
    updateSideBar();
})
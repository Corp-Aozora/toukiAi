"use strict";

window.addEventListener("load", ()=>{ 

    class Form{
        constructor(){
            this.form = document.getElementsByTagName("form")[0];
            this.inputs = document.querySelectorAll('input:not([type="hidden"])');
            this.preBtn = document.getElementById("preBtn");
            this.preBtnSpinner = document.getElementById("preBtnSpinner")
            this.submitBtn = document.getElementById("submitBtn");
            this.submitSpinner = document.getElementById("submitSpinner");
    
            this.setEvent();
            this.restoreForm();
        }
    
        // イベント設定
        setEvent(){
            
            const {inputs, preBtn, submitBtn} = this;

            // click
            function handleClick(){
                preBtn.addEventListener("click", ()=>{
                    handlePreBtnEvent(progress);
                })
            }

            // change
            function handleChange(){
                
                // フォーム検証
                function isFormValid(){
                    submitBtn.disabled = !Array.from(inputs).every(x => x.checked);
                }

                for(let i = 0, len = inputs.length; i < len; i++){
                    inputs[i].addEventListener("change", ()=>{
                        isFormValid();
                    })
                }
            }
    
            handleClick();
            handleChange();
        }

        // 入力状況を復元
        restoreForm(){

            const {inputs, submitBtn} = this;

            if(progress >= 5.5){
                Array.from(inputs).forEach(x => x.checked = true);
                submitBtn.disabled = false;
            }
        }
    }
    
    const form = new Form();
    updateSideBar();
    disablePage(progress);
})

// 画面のリサイズ
window.addEventListener('resize', () => {
    setSidebarHeight();
});
"use strict";

window.addEventListener("load", ()=>{ 

    class Form{

        constructor(){
            this.inputs = document.querySelectorAll('input:not([type="hidden"])');
            this.preBtn = document.getElementById("preBtn");
            this.submitBtn = document.getElementById("submitBtn");

            this.setEvent();
            this.restoreForm();
        }

        // イベント設定
        setEvent(){

            const {inputs, preBtn, submitBtn} = this

            // change
            function handleChange(){
                
                // submitのボタンの有効化判定
                function toggleSubmitBtn(){
                    submitBtn.disabled = !Array.from(inputs).every(x => x.checked);
                }

                for(let i = 0, len = inputs.length; i < len; i++){
                    inputs[i].addEventListener("change", ()=> toggleSubmitBtn());
                }
            }

            // click
            function handleClick(){
                preBtn.addEventListener("click", ()=> handlePreBtnEvent(progress));
            }
            
            handleChange();
            handleClick();
        }

        // 入力状況を復元する
        restoreForm(){
            const {inputs, submitBtn} = this

            //先のステップから戻ってきたときは、全てチェックされている状態にする
            if(progress >= 4.5){
                inputs.forEach(x => x.checked = true);
                submitBtn.disabled = false;
            }
        }
    }

    // フォームインスタンスを生成
    const form = new Form();
    // サイドバーを更新
    updateSideBar();
    // progressに応じたページの無効化
    disablePage(progress); 
})

window.addEventListener('resize', () => {
    setSidebarHeight();
});
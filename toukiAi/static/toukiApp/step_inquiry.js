"use strict";

class InquiryForm{
    constructor(el){
        this.inputs = el.querySelectorAll("select, textarea");
        for(let i = 0, len = this.inputs.length; i < len; i++){
            const input = this.inputs[i];
            input.addEventListener("change", (e)=>{
                const val = e.target.value;
                const nextEl = this.inputs[i + 1];
                if(i === 0)
                    InquiryForm.categoryChangeEvent(val, nextEl);
                else if(i === 1)
                    InquiryForm.subjectChangeEvent(val, nextEl);
            })

            if(i === 2){
                input.addEventListener("input", (e)=>{
                    showModalBtn.disabled = e.target.value.length > 0? false: true;
                })
            }
        }      
    }

    static inputIdxs = {
        "category": 0,
        "subject": 1,
        "content": 2,
    }

    static subjectIdxs = {
        0: 14,
        1: 8,
        2: 8,
        3: 5,
        4: 7,
        5: 3,
    }

    static getLastKey(dict) {
        const keys = Object.keys(dict);
        const lastKey = keys[keys.length - 1];
        return lastKey;
    }

    static categoryChangeEvent(val, nextEl){
        if(!val || parseInt(this.getLastKey(this.subjectIdxs)) < parseInt(val)){
            iniAndDispatchChangeEvent(nextEl);
            return;
        }


        for(let i = 0, len = nextEl.options.length; i < len; i++){
            const option = nextEl.options[i];
            if(option.value.startsWith(`${val}_`))
                option.hidden = false;
            else
                option.hidden = true;
        }

        nextEl.disabled = false;
    }

    static subjectChangeEvent(val, nextEl){
        if(!val){
            iniAndDispatchChangeEvent(nextEl);
            return;
        }

        nextEl.disabled = false;
    }
}


/**
 * 初期化処理
 */
function initialize(){
    updateSideBar();
    disableEnterKeyForInputs();
}

function iniAndDispatchChangeEvent(el){
    el.value = "";
    el.disabled = true;
    el.dispatchEvent(new Event("change"));
}

/*
    イベント
*/
window.addEventListener("load", ()=>{
    initialize();

    const showModalBtn = document.getElementById("showModalBtn");
    const formInstance = new InquiryForm(form);
    // 進捗状況に応じて選択肢を変更する
    const fixedProgress = progress < 1? 1: progress;
    const selectElement = formInstance.inputs[InquiryForm.inputIdxs["category"]];
    // 後ろから検索を開始
    for (let i = selectElement.options.length - 1; i >= 0; i--) {
        // オプションの value を "_" で分割
        const option = selectElement.options[i].value;
        if (parseInt(option, 10) === fixedProgress) {
            // 条件に一致した場合、この要素から後ろのすべてのオプションを削除
            while (selectElement.options.length > i) {
                selectElement.remove(i);
            }
            break; // ループを抜ける
        }
    }

    showModalBtn.addEventListener("click", ()=>{
        const modal = document.getElementById("confirmModal");
        const modalBody = modal.querySelector(".modal-body");
        modalBody.innerHTML = formInstance.inputs[InquiryForm.inputIdxs.content].value.replace(/\n/g, '<br>');
    })
})

/**
 * 送信イベント
 */

form.addEventListener("submit", (event)=>{
    // 送信前に入力チェック
    const spinner = document.getElementById("submitSpinner");
    try{    
        //複数回submitされないようにする
        submitBtn.disabled = true;
        spinner.style.display = "";
        // categoryの値がとsubjectの先頭の数字と一致するものがあるか判別する
    }catch(e){
        console.error(`submit\n詳細：${e}`);
        event.preventDefault();
        spinner.style.display = "none";
    }
})
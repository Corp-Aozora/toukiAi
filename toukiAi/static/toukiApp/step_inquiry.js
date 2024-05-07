"use strict";

class InquiryForm{
    constructor(){
        this.form = document.getElementsByTagName("form")[0];
        this.inputs = this.form.querySelectorAll("select, textarea");
        this.showModalBtn = document.getElementById("showModalBtn");
        this.submitBtn = document.getElementById("submitBtn");

        for(let i = 0, len = this.inputs.length; i < len; i++){

            const input = this.inputs[i];

            // changeイベント設定
            input.addEventListener("change", (e)=>{

                const val = e.target.value;
                const nextEl = this.inputs[i + 1];

                if(i === 0)
                    InquiryForm.handleCategoryChangeEvent(val, nextEl);
                else if(i === 1)
                    InquiryForm.handleSubjectChangeEvent(val, nextEl);
            })

            // inputイベント設定
            if(i === 2){
                input.addEventListener("input", (e)=>{
                    showModalBtn.disabled = e.target.value.length > 0? false: true;
                })
            }
        }
        
        this.showModalBtn.addEventListener("click", this.handleShowModalBtnClickEvent.bind(this));
    }

    // 入力欄のインデックス
    static inputIdxs = {
        "category": 0,
        "subject": 1,
        "content": 2,
    }

    // 進捗がkey、各進捗に対する項目の数がvalue
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

    /**
     * 進捗状況のchangeイベント
     * @param {string} val 
     * @param {HTMLElement} nextEl 
     * @returns 
     */
    static handleCategoryChangeEvent(val, nextEl){
        
        // 進捗が変わったとき、項目の選択肢を変更する
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

    /**
     * 項目のchangeイベント
     * @param {string} val 
     * @param {HTMLElement} nextEl 
     * @returns 
     */
    static handleSubjectChangeEvent(val, nextEl){

        // 初期値（----）が選択されたとき、次の要素を初期化してchangeイベントを発生させる
        if(!val){
            iniAndDispatchChangeEvent(nextEl);
            return;
        }

        nextEl.disabled = false;
    }

    

    // （送信前の）送信ボタンのクリックイベント
    handleShowModalBtnClickEvent(){
        const modal = document.getElementById("confirmModal");
        const modalBody = modal.querySelector(".modal-body");
        modalBody.innerHTML = this.inputs[InquiryForm.inputIdxs.content].value.replace(/\n/g, '<br>');
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

/**
 * 送信ボタンにイベント設定
 * @param {InquiryForm} instance 
 */
function setSubmitEvent(instance){
    
    const {form, submitBtn} = instance;
    form.addEventListener("submit", (event)=>{
        // 送信前に入力チェック
        const spinner = document.getElementById("submitSpinner");
        try{    
            //複数回submitされないようにする
            submitBtn.disabled = true;
            spinner.style.display = "";
            // categoryの値がとsubjectの先頭の数字と一致するものがあるか判別する
        }catch(error){
            console.error(`submit\n詳細：${error}`);
            event.preventDefault();
            spinner.style.display = "none";
        }
    })
}

/*
    イベント
*/
window.addEventListener("load", ()=>{
    initialize();

    const formInstance = new InquiryForm();

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

    setSubmitEvent(formInstance);
})


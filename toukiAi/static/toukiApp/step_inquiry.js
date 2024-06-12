"use strict";

window.addEventListener("load", ()=>{

    class InquiryForm{
        constructor(){
            // 要素
            this.form = document.getElementsByTagName("form")[0];
            this.inputs = this.form.querySelectorAll("select, textarea");
            [
                this.category,
                this.subject,
                this.content
            ] = this.inputs
            this.confirmModal = document.getElementById("confirm_modal");
            this.showModalBtn = document.getElementById("showModalBtn");
            this.submitBtn = document.getElementById("submitBtn");
            this.submitSpinner = document.getElementById("submitSpinner");
    
            // イベント設定
            this.setEvent();
    
            // 初期値に基づくイベントを発生させる
            this.restoreForm();
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
        
        // イベント設定
        setEvent(){
    
            const {
                form, confirmModal, showModalBtn, submitBtn, submitSpinner,
                inputs, category, subject, content
            } = this;
    
            // input
            function handleInput(){
                [content].forEach(x => {
                    x.addEventListener("input", ()=>{
                        showModalBtn.disabled = trimAllSpace(x.value).length === 0;
                    })
                })
            }
    
            // submit
            function handleSubmit(){
    
                // 空欄チェック
                function validateBlank(){
                    for(let i = 0, len = inputs.length; i < len; i++){
                        const input = inputs[i]
                        const val = input.value;
                        if(!val){
                            input.focus();
                            throw new Error("空欄があります");
                        }
                    }
                }
                
                // メイン
                form.addEventListener("submit", (event)=>{
                    try{
                        toggleProcessing(true, submitBtn, submitSpinner);
    
                        validateBlank();
                    }catch(error){
                        const message = `category=${category.value}\nsubject=${subject.value}\ncontent=${content.value}`;
                        basicLog("submit", error, message, "warn");
    
                        toggleProcessing(false, submitBtn, submitSpinner);
                        event.preventDefault();
                    }
                })
            }
    
            // change
            function handleChange(input, inputIdx){
    
                const nextInput = inputs[inputIdx + 1];
    
                // 入力欄を初期化
                function iniAndDispatchChangeEvent(targetInput){
                    targetInput.value = "";
                    targetInput.disabled = true;
                    targetInput.dispatchEvent(new Event("change"));
                }
    
                // 次の要素にフォーカス
                function setNextInput(){
                    nextInput.disabled = false;
                    nextInput.focus();
                }
    
                // 進捗状況
                function handleCategory(val){
                    // 進捗が変わったとき、項目の選択肢を変更する
                    if(!val || parseInt(InquiryForm.getLastKey(InquiryForm.subjectIdxs)) < parseInt(val)){
                        iniAndDispatchChangeEvent(nextInput);
                        return;
                    }
    
                    for(let i = 0, len = nextInput.options.length; i < len; i++){
                        const option = nextInput.options[i];
                        const isSubject = option.value.startsWith(`${val}_`);
                        option.hidden = !isSubject;
                    }
                        
                    setNextInput();
                }
    
                // 項目
                function handleSubject(val){
                    // 初期値（----）が選択されたとき、次の要素を初期化してchangeイベントを発生させる
                    if(!val){
                        iniAndDispatchChangeEvent(nextInput);
                        return;
                    }
                        
                    setNextInput();
                }
    
                // メイン
                input.addEventListener("change", ()=>{
                    const val = input.value;
    
                    if(input === category)
                        handleCategory(val);
                    else if(input === subject)
                        handleSubject(val);
                })
            }
    
            // click
            function handleClick(){
                
                // （送信前の）送信ボタンのクリックイベント
                function handleShowModalBtn(){
                    const modalBody = confirmModal.querySelector(".modal-body");
                    const categoryText = category.options[category.selectedIndex].text;
                    const subjectText = subject.options[subject.selectedIndex].text;
                    const contentText = content.value.replace(/\n/g, '<br>');
                    modalBody.innerHTML = `
                            <div class="fw-bold text-center">
                                <p>
                                    <span class="bg-secondary-subtle rounded-3 px-2">
                                        進捗状況
                                    </span>
                                </p>
                                <p>
                                    ${categoryText}
                                </p>
                            </div>
                            <div class="fw-bold text-center">
                                <p>
                                    <span class="bg-secondary-subtle rounded-3 px-2">
                                        項目
                                    </span>
                                </p>
                                <p>
                                    ${subjectText}
                                </p>
                            </div>
                            <div>
                                <p class="fw-bold text-center">
                                    <span class="bg-secondary-subtle rounded-3 px-2">
                                        質問
                                    </span>
                                </p>
                                <p class="mx-sm-5 text-indent">
                                    ${contentText}
                                </p>
                            </div>
                        `
                }
    
                // メイン
                [showModalBtn].forEach(x => {
                    x.addEventListener("click", ()=>{
                        if(x === showModalBtn)
                            handleShowModalBtn();
                    })
                })
            }
    
            // メイン
            for(let i = 0, len = inputs.length; i < len; i++){
                const input = inputs[i];
                
                if([0, 1].includes(i))
                    handleChange(input, i);
                else if(i === 2)
                    handleInput(input);
            }
    
            handleClick();
            handleSubmit();
        }
    
        // 初期値に基づくイベントを発生させる
        restoreForm(){
            for(let i = 0, len = this.inputs.length; i < len; i++){
                const input = this.inputs[i];
                try{
                    dispatchEventIfValue(input, "change");
                }catch(e){
                    basicLog("restorForm", e, `i=${i}\ninput=${input}`);
                }
            }
        }
    }

    const formInstance = new InquiryForm();

    // 進捗状況に応じて選択肢を変更する
    function adjustCategoryToProgress(){
        const fixedProgress = progress < 1? 1: progress;
        const category = formInstance.category;
        // 後ろから検索を開始
        for (let i = category.options.length - 1; i >= 0; i--) {
            const option = category.options[i].value;
            if (parseInt(option) === fixedProgress) {
                // 条件に一致した場合、この要素から後ろのすべてのオプションを削除
                while (category.options.length > i) {
                    category.remove(i);
                }
                break; // ループを抜ける
            }
        }
    }

    updateSideBar();
    disableEnterKeyForInputs();
    adjustCategoryToProgress();
})


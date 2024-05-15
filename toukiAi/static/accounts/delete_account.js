"use strict";

/**
 * メールアドレス検証
 * ・カスタム検証、django検証、重複検証
 * @param {string} email メールアドレス
 * @param {HTMLElement} errMsgEl 
 */
function emailValidation(email, errMsgEl){
    const result = isEmail(email);
    toggleErrorMessage(result[0], errMsgEl, result[1]);
}

/**
 * バリデーションリスト
 * @param {AccountForm} instance 
 * @param {number} index 
 * @param {Object<string, number>} idxs 
 */
function validationList(instance, index, idxs){
    const input = instance.inputs[index];
    const val = input.value;
    const errMsgEl = instance.errMsgEls[index];
    const errMsg = instance.errMsgs[index];

    if(index === idxs["email"]){
        emailValidation(val, errMsgEl);
    }else{
        isValid = checkPassword(val, input);
        toggleErrorMessage(isValid, errMsgEl, errMsg);
    }
}

/**
 * keydownイベント
 * @param {Event} e 
 * @param {HTMLInputElement} nextInput
 * @param {HTMLButtonElement} submitBtn
 */
function handleKeydownEvent(e, nextInput, submitBtn){
    setEnterKeyFocusNext(e, nextInput? nextInput: submitBtn);
}

/**
 * changeイベント
 * @param {AccountForm} instance 
 * @param {number} index 
 * @param {Object<string, number>} idxs 
 */
function handleChangeEvent(instance, index, idxs){
    validationList(instance, index, idxs);
}

/**
 * イベント設定
 * @param {AccountForm} instance
 * @param {Object<string, number>} idxs 
 */
function setEventToInputs(instance, idxs){
    const {inputs, form} = instance;
    const confirmBtn = form.querySelector("#confirm-btn");
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];
        
        input.addEventListener("keydown", (e)=>{
            handleKeydownEvent(e, inputs[i + 1], confirmBtn);
        })

        input.addEventListener("change", ()=>{
            handleChangeEvent(instance, i, idxs);
        })
    }
}

/**
 * 
 * @param {AccountForm} instance 
 * @param {Object<string, number>} idxs 
 */
function setEventToConfirmBtn(instance, idxs){
    const {form, inputs, errMsgEls} = instance;
    const confirmBtn = form.querySelector("#confirm-btn");

    confirmBtn.addEventListener("click", ()=>{
        try{
            // 送信前に各入力欄をチェックする
            for(let i = 0, len = inputs.length; i < len; i++){
                validationList(instance, i, idxs);
            }

            const errIndex = findInvalidInputIndex(Array.from(errMsgEls));
            if(errIndex !== -1){
                inputs[errIndex].focus();
                return;
            }

            const modalEl = document.getElementById("delete_account_confirm_modal");
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }catch(e){
            basicLog("confirmBtn", e);
            alert(e.message);
        }   
    })
}

/**
 * 
 * @param {AccountForm} instance 
 * @param {Object<string, number>} idxs 
 */
function setEventToSubmit(instance, idxs){
    const spinner = document.getElementById("submitSpinner");
    const {form, inputs, errMsgEls, submitBtn} = instance;

    form.addEventListener("submit", (event)=>{
        try{
            submitBtn.disabled = true;
            spinner.style.display = "";

            // 送信前に各入力欄をチェックする
            for(let i = 0, len = inputs.length; i < len; i++){
                validationList(instance, i, idxs);
            }

            const errIndex = findInvalidInputIndex(Array.from(errMsgEls));
            if(errIndex !== -1){
                inputs[errIndex].focus();
                restore(event);
            }

        }catch(error){
            basicLog("submit", error);
            alert(error.message);
            restore(event);
        }   
    })

    function restore(e){
        e.preventDefault();
        spinner.style.display = "none";
        submitBtn.disabled = false;    
    }
}

/**
 * ロード時の処理
 */
window.addEventListener("load", ()=>{
    const instance = new AccountForm();
    instance.inputs = instance.form.querySelectorAll("#id_email, #id_password");
    const idxs = {
        "email": 0,
        "password": 1,
    }

    // 入力欄にイベントを設定する
    setEventToInputs(instance , idxs);
    // 元に戻るボタンにイベントを設定する
    setEventToReturnBtn();
    // 確認ボタンにイベントを設定する
    setEventToConfirmBtn(instance, idxs);
    // 送信ボタンにイベント設定する
    setEventToSubmit(instance, idxs);
})
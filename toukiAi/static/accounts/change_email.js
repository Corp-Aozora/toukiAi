"use strict";

/**
 * メールアドレス検証
 * ・カスタム検証、django検証、重複検証
 * @param {string} email メールアドレス
 * @param {HTMLElement} errMsgEl 
 */
async function emailValidation(email, errMsgEl){
    const result = isEmail(email);
    if(result[0] === false){
        toggleErrorMessage(result[0], errMsgEl, result[1]);
    }else{
        const response = await isNewEmail(email);
        const message = response.message;
        if(response.status === 200)
            toggleErrorMessage((message === ""), errMsgEl, message);
        else
            alert(`通信エラー\n\n${message}`);
    }
}

/**
 * バリデーションリスト
 * @param {AccountForm} instance 
 * @param {number} index 
 * @param {Object<string, number>} idxs 
 */
function validationList(instance, index, idxs){
    const {inputs, errMsgEls, errMsgs} = instance;
    const input = inputs[index];
    const val = input.value;
    const errMsgEl = errMsgEls[index];

    if(index === idxs["email"]){
        emailValidation(val, errMsgEl);
    }else if(index === idxs["currentEmail"]){
        const result = isEmail(val);
        toggleErrorMessage(result, errMsgEl, errMsgs[0]);
    }else{
        const result = checkPassword(val, input);
        toggleErrorMessage(result, errMsgEl, errMsgs[1]);
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

    const {inputs, submitBtn} = instance;

    for(let i = 0, len = inputs.length; i < len; i++){

        const input = inputs[i];
        
        input.addEventListener("keydown", (e)=>{
            handleKeydownEvent(e, inputs[i + 1], submitBtn);
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
function setEventToSubmit(instance, idxs){
    const spinner = document.getElementById("submitSpinner");
    const {inputs, errMsgEls, submitBtn, form} = instance;

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
 * 目隠しトグルボタンにイベントを設定
 * @param {AccountForm} instance 
 */
function setEventToEyeToggleBtn(instance){
    const {eye, password, eyeSlash} = instance;
    instance.eyeToggleBtn.addEventListener("click", ()=>{
        handleEyeToggleClickEvent(eye, password, eyeSlash);
    })
}

/**
 * ロード時の処理
 */
window.addEventListener("load", ()=>{
    const instance = new AccountForm();
    instance.inputs = [instance.email, instance.currentEmail, instance.password];
    const idxs = {
        email: 0,
        currentEmail: 1,
        password: 2,
    }

    // 入力欄にイベントを設定する
    setEventToInputs(instance , idxs);
    // 目隠しボタンにイベントを設定する
    setEventToEyeToggleBtn(instance);
    // 元のページに戻るボタン
    setEventToReturnBtn();
    // 送信ボタンにイベント設定する
    setEventToSubmit(instance, idxs);
})
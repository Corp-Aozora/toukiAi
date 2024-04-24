"use strict";

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
    const errMsg = errMsgs[index];

    if(index === idxs["password1"])
        isValid = checkPassword(val, input);
    else
        isValid = inputs[idxs["password1"]].value === input.value;

    //各バリデーションでエラーがあるとき
    toggleErrorMessage(isValid, errMsgEl, errMsg);
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
    if(index === idxs["password1"])
        togglePassword2(instance.inputs[idxs["password1"]], instance.errMsgEls[idxs["password1"]], instance.inputs[idxs["password2"]]);
}

/**
 * 入力欄にイベント設定
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
 * 送信ボタンにイベント設定
 * @param {AccountForm} instance 
 * @param {Object<string, number>} idxs 
 */
function setEventToSubmit(instance, idxs){
    const spinner = document.getElementById("submitSpinner");
    const {inputs, errMsgEls, submitBtn} = instance;

    instance.form.addEventListener("submit", (event)=>{
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
    const {eye, password1, eyeSlash} = instance;
    instance.eyeToggleBtn.addEventListener("click", ()=>{
        handleEyeToggleClickEvent(eye, password1, eyeSlash);
    })
}

/**
 * ロード時の処理
 */
window.addEventListener("load", ()=>{
    const instance = new AccountForm();
    instance.errMsgs = instance.errMsgs.slice(1);
    const idxs = {
        "password1": 0,
        "password2": 1,
    }

    // 入力欄にイベントを設定する
    setEventToInputs(instance , idxs);
    // 目隠しボタンにイベントを設定する
    setEventToEyeToggleBtn(instance);
    // 送信ボタンにイベント設定する
    setEventToSubmit(instance, idxs);
})
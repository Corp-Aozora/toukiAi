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
    
    if(index === idxs["oldPassword"] || index === idxs["password1"])
        isValid = checkPassword(val, input);
    else
        isValid = inputs[idxs["password1"]].value === input.value;

    //各バリデーションでエラーがあるとき
    const errMsgEl = errMsgEls[index];
    const msg = index === idxs["password2"]? errMsgs[2]: errMsgs[1];
    toggleErrorMessage(isValid, errMsgEl, msg);
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
    const {eye, password1, eyeSlash} = instance;
    instance.eyeToggleBtn.addEventListener("click", ()=>{
        handleEyeToggleClickEvent(eye, password1, eyeSlash);
    })
}

// 元のページに戻るボタンが押されたとき
function setEventToReturnBtn(){

    const returnBtn = document.getElementById("returnBtn");
    returnBtn.addEventListener("click", ()=>{

        const preUrl = sessionStorage.getItem("preUrl");
        const spinner = document.getElementById("return-spinner");

        try{
            spinner.style.display = "";
            returnBtn.disabled = true;

            window.location.href = preUrl? preUrl: "/toukiApp/redirect_to_progress_page";
        }catch(e){
            spinner.style.display = "none"
            returnBtn.disabled = false;
            basicLog("setEventToReturnBtn", e, "アカウント削除ページの元のページに戻るボタンの処理でエラー");
        }
    })
}

/**
 * ロード時の処理
 */
window.addEventListener("load", ()=>{
    const instance = new AccountForm();
    const idxs = {
        "oldPassword": 0,
        "password1": 1,
        "password2": 2,
    }

    // 入力欄にイベントを設定する
    setEventToInputs(instance , idxs);
    // 目隠しボタンにイベントを設定する
    setEventToEyeToggleBtn(instance);
    // 元のページに戻るボタン
    setEventToReturnBtn()
    // 送信ボタンにイベント設定する
    setEventToSubmit(instance, idxs);
})
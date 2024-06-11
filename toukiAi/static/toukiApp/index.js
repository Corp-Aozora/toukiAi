"use strict";

//ナビスクロール関連
const idEls = {
    intro : document.getElementById('intro'),
    support : document.getElementById('support'),
    charge : document.getElementById('charge'),
    compare : document.getElementById('compare'),
    QA : document.getElementById('QA'),
    inquiry : document.getElementById('inquiry')
}
const classEls = {
    intro : document.getElementsByClassName("toIntro"),
    support : document.getElementsByClassName("toSupport"),
    charge : document.getElementsByClassName("toCharge"),
    compare : document.getElementsByClassName("toCompare"),
    QA : document.getElementsByClassName("toQA"),
    inquiry : document.getElementsByClassName("toInquiry")
}

//お問い合わせ関連
class Inquiry{
    constructor(){
        this.form = document.getElementsByTagName("form")[0];
        this.inputs = Array.from(this.form.querySelectorAll("input, select, textarea")).slice(1);
        this.mailAddress = this.inputs[Inquiry.idxs["mailAddress"]];
        this.subject = this.inputs[Inquiry.idxs["subject"]];
        this.content = this.inputs[Inquiry.idxs["content"]];
        this.submitBtn = document.getElementById("submitBtn");
        this.errMsgEls = this.form.getElementsByClassName("errorMessage");

    }

    static idxs = {
        "mailAddress": 0,
        "subject": 1,
        "content": 2
    }
}
const idxs = Inquiry.idxs;

/**
 * スクロールイベントを設定する
 * @param {HTMLElement[]} from
 * @param {HTMLElement} to
 */
function addScrollEvent(from, to){
    for(let i = 0; i < from.length; i++){
        from[i].addEventListener("click", ()=>{
            scrollToTarget(to, 0);
        })
    }
}

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} email 
 * @param {HTMLElement} errMsgEl 
 */
async function isDjangoEmail(email, errMsgEl){
    const url = 'is_email';
  
    try{
        fetch(url, {
            method: 'POST',
            body: `email=${email}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'X-CSRFToken': csrftoken,
            },
            mode: "same-origin"
        }).then(response => {
            return response.json();
        }).then(response => {
            if(response.message !== ""){
                toggleErrorMessage(false, errMsgEl, "メールアドレスが規格に一致しません");
            }else{
                toggleErrorMessage(true, errMsgEl, "");
            }
        }).catch(e => {
            basicLog("isDjangoEmail", e, "responseエラー");
        });
    }catch(e){
        basicLog("isDjangoEmail", e, "tryエラー");
    }
}

/**
 * メールアドレス検証
 * @param {HTMLInputElement} input 
 * @param {HTMLElement} errMsgEl 
 */
async function mailAddressValidation(input, errMsgEl){
    const val = input.value;
    const result = isEmail(val);
    if(result[0] === false){
        toggleErrorMessage(result[0], errMsgEl, result[1]);
    }else{
        await isDjangoEmail(val, errMsgEl);
    }    
}

/**
 * 件名検証
 * @param {HTMLTextAreaElement} input 
 * @param {HTMLElement} errMsgEl 
 */
function subjectValidation(input, errMsgEl){
    const val = input.value;
    const options = Array.from(input.options);
    const result = val !== "" && options.some(x => x.value === val);
    toggleErrorMessage(result, errMsgEl, "どれか１つ選択してください");
}

/**
 * 質問検証
 * @param {HTMLTextAreaElement} input 
 * @param {HTMLElement} errMsgEl 
 */
function contentValidation(input, errMsgEl){
    const result = input.value.length > 1;
    toggleErrorMessage(result, errMsgEl, "２文字以上入力してください");
}


/**
 * バリデーションリスト
 * @param {Inquiry} instance 入力要素
 * @param {number} index 入力要素のインデックス
 */
async function validationList(instance, index){
    //検証対象関連の要素
    const input = instance.inputs[index];
    const errMsgEl = instance.errMsgEls[index];

    //メールアドレス
    if(index === idxs["mailAddress"]){
        await mailAddressValidation(input, errMsgEl);
    }else if(index === idxs["subject"]){
        // 件名
        subjectValidation(input, errMsgEl);
    }else if(index === idxs["content"]){
        // 質問
        contentValidation(input, errMsgEl)
    }else{
        basicLog("validationList", null, "想定しないインデックスです");
    }
}

/*
    イベント集
*/
window.addEventListener("load", ()=>{

    // 対象のエリアにスクロールする
    function  navToTargetSection(){
        const targetID = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetID);
        if(targetElement){
            scrollToTarget(targetElement, 0);
        }
    }

    // メニュー内にあるお問い合わせにイベント設定
    function setEventToInquiryLink(){
        const inquiryLink = document.querySelector(".inquiry-link");
        inquiryLink.addEventListener("click", ()=>{
            const offcanvasMenus = document.getElementById('offcanvasMenus');
            const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasMenus);
            offcanvasInstance.hide();
        })
    }

    navToTargetSection();

    setEventToInquiryLink();

    // 対象の項目へスクロールするイベントを設定
    for(let key in idEls){
        addScrollEvent(classEls[key], idEls[key]);
    }
    
    const inquiry = new Inquiry();
    const inputs = inquiry.inputs;
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];

        if(i !== len - 1){
            input.addEventListener("keydown", (e)=>{
                setEnterKeyFocusNext(e, inputs[i + 1]);
            })
        }else{
            input.addEventListener("input", (e)=>{
                contentValidation(e.target, inquiry.errMsgEls[i]);
            })
        }

        input.addEventListener("change",()=>{
            validationList(inquiry, i);
        })
    }

    //送信ボタン（本送信前）
    const showConfirmModalBtn = document.getElementById("showConfirmModalBtn");
    showConfirmModalBtn.addEventListener("click", ()=>{
        handleShowConfirmModalBtnEvent(inquiry);
    })

    //送信ボタン
    inquiry.form.addEventListener("submit", (e)=>{
        handleSubmitEvent(e, inquiry);
    });
}) 

/**
 * 送信ボタンイベント
 * @param {event} event 
 * @param {Inquiry} instance 
 */
function handleSubmitEvent(event, instance){
    const spinner = document.getElementById("submitSpinner");

    try{
        instance.submitBtn.disabled = true;
        spinner.style.display = "";
    }catch(error){
        basicLog("submit", error);
        event.preventDefault();
        spinner.style.display = "none";
    }    
}

/**
 * 確認モーダル表示ボタンのイベント
 * @param {Inquiry} instance 
 */
function handleShowConfirmModalBtnEvent(instance){
    const {inputs, errMsgEls} = instance;

    for(let i = 0; i < inputs.length; i++){
        validationList(instance, i);
    }
    
    const errIndex = findInvalidInputIndex(Array.from(errMsgEls));
    if(errIndex === -1){
        showConfirmModal(instance);
    }else{
        inputs[errIndex].focus();
    }
}

/**
 * 確認モーダルの表示
 * @param {Inquiry} instance 
 */
function showConfirmModal(instance){
    updateModalText("modalMailAddress", instance.mailAddress.value);
    updateModalText("modalSubject", instance.subject.value);
    updateModalText("modalContent", instance.content.value);
    
    const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
    confirmModal.show();

    function updateModalText(id, text){
        const el = document.getElementById(id);
        if(el){
            el.innerText = text;
        }else{
            basicLog("updateModalText", null, "想定しない要素のidが渡されました");
        }
    }
}

/**
 * 最初の非表示でない要素のインデックスを見つける
 * @param {HTMLElement[]} els 
 * @returns エラーがある要素のインデックス、エラーがないときは-1
 */
function findInvalidInputIndex(els) {
    return els.findIndex(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none';
    });
}
"use strict";

const introContent = document.getElementById('introContent');
const supportContent = document.getElementById('supportContent');
const chargeContent = document.getElementById('chargeContent');
const compareContent = document.getElementById('compareContent');
const qaContent = document.getElementById('qaContent');
const inquiryContent = document.getElementById('inquiryContent');
const header = document.getElementById("header");
const toIntroContent = document.getElementsByClassName("toIntroContent");
const toSupportContent = document.getElementsByClassName("toSupportContent");
const toChargeContent = document.getElementsByClassName("toChargeContent");
const toCompareContent = document.getElementsByClassName("toCompareContent");
const toQAContent = document.getElementsByClassName("toQAContent");
const toInquiryContent = document.getElementsByClassName("toInquiryContent");

const createdBy = document.getElementById("id_created_by");
const subject = document.getElementById("id_subject");
const opts = subject.options;
const subjectList = Array.from(opts).map(option => option.value);
const content = document.getElementById("id_content");
requiredInputArr = [createdBy, subject, content];
const createdByIndex = 0;
const subjectIndex = 1;
const contentIndex = 2;

const createdByMessageEl = document.getElementById("id_created_by_messageEl");
const subjectMessageEl = document.getElementById("id_subject_messageEl");
const contentMessageEl = document.getElementById("id_content_messageEl");
messageElArr = [createdByMessageEl, subjectMessageEl, contentMessageEl];

const createdByMessage = "メールアドレスの規格に一致しません"
const subjectMessage = "どれか１つ選択してください"
const contentMessage = "お問い合わせ内容をご入力ください"
messageArr = [createdByMessage, subjectMessage, contentMessage];

const beforeSubmitBtn = document.getElementById("beforeSubmitBtn");
const submitBtn = document.getElementById("submitBtn");


/**
 * スクロールイベントを設定する
 * @param {array element} linkFrom
 * @param {element} linkTo
 */
function addScrollEvent(linkFrom, linkTo){
    for(let i = 0; i < linkFrom.length; i++){
        linkFrom[i].addEventListener("click", (e)=>{
            moveToIndex(location.pathname, e);
            scrollToTarget(linkTo, 0);
        })
    }
}

/**
 * 重複メールアドレスとdjangoによるメールアドレス形式チェック
 * @param {string} email 
 */
function isDjangoEmail(email){
    const url = 'is_email';
  
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
            toggleErrorMessage(false, messageElArr[createdByIndex], response.message);
            invalidElArr.push(requiredInputArr[createdByIndex]);
        }else{
            toggleErrorMessage(true, messageElArr[createdByIndex], response.message);
        }
    }).catch(error => {
        console.log(error);
    });
}

/**
 * バリデーションリスト
 * バリデーションした後の処理も含む
 * @param {number} index 入力要素のインデックス
 */
function validationList(index){
    //メールアドレス欄
    if(index === createdByIndex){
        //カスタムメールアドレスバリデーション
        isValid = isEmail(requiredInputArr[index].value);
        if(isValid[0] === false){
            toggleErrorMessage(isValid[0], messageElArr[index], isValid[1]);
            if(invalidElArr.indexOf(requiredInputArr[index]) === -1) invalidElArr.push(requiredInputArr[index]);
        }else{
            invalidElArr = invalidElArr.filter(x => x !== requiredInputArr[index]);
            //djangoのメールアドレスバリデーション
            isDjangoEmail(requiredInputArr[index].value);
        }
    }else{
        //件名
        if(index === subjectIndex) isValid = requiredInputArr[index].value !== "" && subjectList.indexOf(requiredInputArr[index].value) !== -1 ? true: false;
        else if(index === contentIndex) isValid = requiredInputArr[index].value !== "";

        //各バリデーションでエラーがあるとき
        toggleErrorMessage(isValid, messageElArr[index], messageArr[index]);
        
        if(isValid === false){
            if(invalidElArr.indexOf(requiredInputArr[index]) === -1) invalidElArr.push(requiredInputArr[index]);
        }else{
            invalidElArr = invalidElArr.filter(x => x !== requiredInputArr[index]);
        }
    }
}

/*
    イベント集
*/
window.addEventListener("load", ()=>{
    //ヘッダーのボタンに対象の項目へスクロールするイベントを設定
    addScrollEvent(toIntroContent, introContent);
    addScrollEvent(toSupportContent, supportContent);
    addScrollEvent(toChargeContent, chargeContent);
    addScrollEvent(toCompareContent, compareContent);
    addScrollEvent(toQAContent, qaContent);
    addScrollEvent(toInquiryContent, inquiryContent);

    //他のページでヘッダーのボタンが押された場合でも対象の項目へスクロールさせる
    if(sessionStorage.getItem(isIntroButton) === yes){
        scrollToTarget(introContent, 0);
    }
    else if(sessionStorage.getItem(isSupportButton) === yes){
        scrollToTarget(supportContent, 0);
    }
    else if(sessionStorage.getItem(isChargeButton) === yes){
        scrollToTarget(chargeContent, 0);
    }
    else if(sessionStorage.getItem(isQAButton) === yes){
        scrollToTarget(qaContent, 0);
    }else if(sessionStorage.getItem(isCompareButton) === yes){
        scrollToTarget(compareContent, 0);
    }else if(sessionStorage.getItem(isInquiryButton) === yes){
        scrollToTarget(inquiryContent, 0);
    }

    //ログアウトされたとき完了したことを知らせる
    const logoutModal = new bootstrap.Modal(document.getElementById("logoutModal"));
    if(logoutModal !== null){
        const lastUpdateDate = document.getElementById("lastUpdateDate");
        lastUpdateDate.innerHTML = sessionStorage.getItem("lastUpdateDate");
        logoutModal.show();
    }

    const inquryInfoModal = new bootstrap.Modal(document.getElementById("inquryInfoModal"));
    if(inquryInfoModal !== null )inquryInfoModal.show();

    const inquiryErrorModal = new bootstrap.Modal(document.getElementById("inquiryErrorModal"));
    if(inquiryErrorModal !== null ){
        inquiryErrorModal.show();
        scrollToTarget(inquiryContent);
    }
    
    //セッション情報を初期化
    sessionStorage.clear();

    for(let i = 0; i < requiredInputArr.length - 1 ; i++){
        //フォーカス移動イベント
        requiredInputArr[i].addEventListener("keypress", (e)=>{
            if(e.code === "Enter" || e.code === "NumpadEnter"){
                e.preventDefault();
                requiredInputArr[i + 1].focus();
            }
        })
    }
}) 

//メールアドレス欄
createdBy.addEventListener("change", ()=>{
    //メール形式チェック
    validationList(createdByIndex);
})

//件名欄
subject.addEventListener("change", ()=>{
    //空欄チェック
    validationList(subjectIndex);
})

//お問い合わせ内容欄
content.addEventListener("change", ()=>{
    //空欄チェック
    validationList(contentIndex);
})

//送信ボタン（本送信前）
beforeSubmitBtn.addEventListener("click", (e)=>{
    for(let i = 0; i < requiredInputArr.length; i++){
        validationList(i);
    }

    if(invalidElArr.length > 0){
        invalidElArr[0].focus();
        e.preventDefault();
    }else{
        const submitModal = new bootstrap.Modal(document.getElementById("submitModal"));
        const modalCreatedBy = document.getElementById("modalCreatedBy");
        const modalContent = document.getElementById("modalContent");

        modalCreatedBy.innerText = createdBy.value;
        modalContent.innerText = content.value;
        submitModal.show();
    }
})

//送信ボタン（本送信）
beforeSubmitBtn.addEventListener("click", (e)=>{
    for(let i = 0; i < requiredInputArr.length; i++){
        validationList(i);
    }

    if(invalidElArr.length > 0){
        submitModal.hide();
        invalidElArr[0].focus();
        e.preventDefault();
    }
})
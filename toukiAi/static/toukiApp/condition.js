"use strict";

/**
    変数
*/
class Form{
    constructor(){
        this.form = document.getElementsByTagName("form")[0];
        this.cbs = Array.from(this.form.getElementsByTagName("input")).slice(1);
        this.submitBtn = this.form.querySelector("button[type='submit']");
        this.availableText = this.form.querySelector("#availableText");
    }
}

/**
 * 利用できるか判別する処理
 * @param {event} e
 * @param {Form} instance
*/
function showResult(e, instance){
    //アカウント登録へボタンと利用できる旨のテキストのトグル
    async function toggleSubmitBtn(isValid){
        instance.submitBtn.disabled = !isValid;
        isValid? await slideDownAndScroll(instance.availableText, 100, 150): slideUp(instance.availableText);
    }
    
    toggleSubmitBtn(e.target.checked? instance.cbs.every(x => x.checked): false);
}

/**
 * イベントリスナー
 */
window.addEventListener("load", ()=>{
    const instance = new Form();
    //各チェックボックスにイベントを設定
    instance.cbs.forEach(x => x.addEventListener("change", _.debounce((e)=>{
        showResult(e, instance);
    }, 300)))

    //送信時イベントを設定
    instance.form.addEventListener("submit", (e)=>{
        handleSubmitEvent(e, instance);
    })
})

/**
 * 送信ボタンイベント
 * @param {event} event 
 * @param {Inquiry} instance 
 */
function handleSubmitEvent(event, instance){
    const spinner = document.getElementById("submitSpinner");

    try{
        if(!instance.cbs.every(x => x.checked)){
            alert("全てにチェックが入らないとシステムの利用条件を満たさないためアカウント登録できません。");
            event.preventDefault();
            spinner.style.display = "none";
            return;
        }

        instance.submitBtn.disabled = true;
        spinner.style.display = "";
    }catch(error){
        basicLog("submit", error);
        event.preventDefault();
        spinner.style.display = "none";
    }    
}


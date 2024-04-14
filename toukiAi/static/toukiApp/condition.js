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
    function toggleSubmitBtn(isValid){
        instance.submitBtn.disabled = !isValid;
        isValid? slideDownAndScroll(instance.availableText): slideUp(instance.availableText);
    }
    
    toggleSubmitBtn(e.target.checked? instance.cbs.every(x => x.checked): false);
}

/**
 * 相関図のモーダルのサイズ調整
 */
function adjustModalScale() {
    const modal = document.querySelector('.modal');
    let screenWidth = window.innerWidth;
    let scale = screenWidth / 820; // 820px が基準サイズ
  
    // スケールが1未満の場合のみ適用、それ以上は1（100%）に固定
    scale = scale < 1 ? scale : 1;
  
    modal.style.transform = `scale(${scale})`;
    modal.style.transformOrigin = 'top center';
}

/**
 * イベントリスナー
 */
window.addEventListener("load", ()=>{
    const instance = new Form();
    //各チェックボックスにイベントを設定
    instance.cbs.forEach(x => x.addEventListener("change", (e)=>{
        showResult(e, instance);
    }))
    //相関図モーダルのサイズ調整
    adjustModalScale();
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

/**
 * 画面サイズが変更されたとき
 */
window.addEventListener("resize", adjustModalScale)


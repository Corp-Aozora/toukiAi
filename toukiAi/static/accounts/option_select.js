"use strict"

// オプションセクション
class OptionSection{
    constructor(sectionId){
        try{
            this.section = document.getElementById(sectionId);
            this.cb = this.section.getElementsByClassName("proxy-checkbox")[0];
            this.supplement = this.section.getElementsByClassName("supplement")[0];
            this.navBtn = this.supplement.getElementsByTagName("button")[0];
        }catch(e){
            basicLog(`${sectionId}`, e, "インスタンスの生成に失敗");
        }
    }
}

// 合計額セクション
class ChargeSection{

    constructor(){
        try{
            this.section = document.getElementById("charge-section");
            this.noOption = this.section.getElementsByClassName("no-option")[0];
            this.optionDetailWrapper = this.section.getElementsByClassName("option-detail-wrapper")[0];
            this.details = this.optionDetailWrapper.getElementsByTagName("li");
            [
                this.basic,
                this.option1,
                this.option2
            ] = this.details;

            this.prices = this.optionDetailWrapper.getElementsByClassName("price");
            [
                this.basicPrice,
                this.option1Price,
                this.option2Price
            ] = this.prices;

            this.basicPriceStr = this.basicPrice.textContent.trim();
            this.option1PriceStr = this.option1Price.textContent.trim();
            this.option2PriceStr = this.option2Price.textContent.trim();

            this.basicPriceInt = ChargeSection.getIntPrice(this.basicPriceStr);
            this.option1PriceInt = ChargeSection.getIntPrice(this.option1PriceStr);
            this.option2PriceInt = ChargeSection.getIntPrice(this.option2PriceStr); 

            this.totalPrice = this.section.getElementsByClassName("total-price")[0];
            this.totalPriceInt = 0;
        }catch(e){
            basicLog("ChargeSection", e, "インスタンスの生成に失敗");
        }
    }

    // 表示されている価格をintにして返す
    static getIntPrice(str){
        // 全角数字を半角数字に変換
        const normalizedStr = str.replace(/[０-９]/g, s => ZenkakuToHankaku(s));
        // 非数字を削除
        const numbers = normalizedStr.replace(/[^0-9]/g, '');
        return parseInt(numbers);
    }

    // 金額を再計算して表示を変更する
    sumPrice(int, isAdd){
        isAdd? this.totalPriceInt += int: this.totalPriceInt -= int;
        const addComma = this.totalPriceInt.toLocaleString();
        const toZenkaku = hankakuToZenkaku(addComma);
        this.totalPrice.textContent = toZenkaku;
    }
}

// 入力事項セクション
class FormSection{

    constructor(){
        try{
            this.section = document.getElementById("form-section");
            this.form = this.section.getElementsByTagName("form")[0];
            this.fieldset = this.section.getElementsByTagName("fieldset")[0];
            this.inputs = this.fieldset.getElementsByTagName("input");
            [
                this.name,
                this.payer,
                this.address,
                this.phoneNumber,
                this.basic,
                this.option1,
                this.option2,
                this.isPhoneRequired,
            ] = this.inputs
            this.returnBtn = document.getElementById("returnBtn");
            this.returnSpinner = document.getElementById("return-spinner");
            this.submitBtn = document.getElementById("submitBtn");
            this.submitSpinner = document.getElementById("submitSpinner");
        }catch(e){
            basicLog("FormSection", e, "インスタンスの生成に失敗");
        }
    }
}

class Ids{
    static fieldset = {
        basic: "basic-section",
        option1: "option1-section",
        option2: "option2-section",
        charge: "charge-section",
        form: "form-section",
    }
}

// 有料版のチェックボックスのイベント
class BasicCbEvent{
    // チェックされたとき
    static checked(instances){
        const [basic, option1, option2, charge, form] = instances;

        // 入力案内文を表示する
        slideDown(basic.supplement);
    
        // 司法書士紹介のチェックボックスを無効化
        const option2Cb = option2.cb;
        option2Cb.checked = false;
        option2Cb.disabled = true;
    
        // 合計額の明細を表示/ 合計額を計算/ オプションが選択されてませんを非表示
        charge.noOption.style.display = "none";
        charge.basic.style.display = "block";
        charge.sumPrice(charge.basicPriceInt, true);
    
        // 入力事項の表示/ 住所は非表示/ 支払いへボタンを有効化
        slideDown(form.fieldset);
        if(option1.cb.checked === false)
            form.address.disabled = true;
        form.submitBtn.disabled = false;
    }

    // 解除されたとき
    static unchecked(instances){
        const [basic, option1, option2, charge, form] = instances;

        // 入力案内文を非表示にする
        slideUp(basic.supplement);

        // 司法書士紹介のチェックボックスを有効化
        if(option1.cb.checked === false){
            const option2Cb = option2.cb;
            option2Cb.checked = false;
            option2Cb.disabled = false;
        }

        // 合計額の明細から非表示にする/ 合計額を計算/ オプションが選択されてませんを表示
        charge.basic.style.display = "none";
        charge.sumPrice(charge.basicPriceInt, false);
        if(!option1.cb.checked && !option2.cb.checked)
            charge.noOption.style.display = "block";

        // 入力事項の非表示/ 支払いボタンの無効化
        form.address.disabled = false;
        if(!option1.cb.checked && !option2.cb.checked){
            slideUp(form.fieldset);
            form.submitBtn.disabled = true;
        }
    }
}

function handleBasicSectionEvent(instances){
    const [basic, option1, option2, charge, form] = instances;

    basic.cb.addEventListener("change", (e)=>{

        if(e.target.checked){
            BasicCbEvent.checked(instances);
        }else{
            BasicCbEvent.unchecked(instances);
        }
    })

    basic.navBtn.addEventListener("click",()=>{
        scrollToTarget(form.fieldset);
    })
}

/**
 * イベント設定
 * @param {*} instances 
 */
function setEventHandler(instances){
    // 有料版
    handleBasicSectionEvent(instances);
    // オプション１

    // オプション２

    // 合計額

    // 入力フォーム
}

window.addEventListener("load", ()=>{
    const basic = new OptionSection(Ids.fieldset.basic);
    const option1 = new OptionSection(Ids.fieldset.option1);
    const option2 = new OptionSection(Ids.fieldset.option2);
    const charge = new ChargeSection();
    const form = new FormSection();

    const instances = [basic, option1, option2, charge, form];

    // イベント設定
    setEventHandler(instances);
})
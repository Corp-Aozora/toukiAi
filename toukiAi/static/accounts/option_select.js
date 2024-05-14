"use strict"

// エラーメッセージ
class ErrorLogger{
    static createInstance(id, e){
        throw new Error `${id}のインスタンス生成でエラー\n${e.message}`
    }

    static invalidArgs(functionName, ...args){
        let msg = `${functionName}でエラー\n引数が不適切です\n`
        args.forEach(x =>{
            for (const [key, value] of Object.entries(x)) {
                msg += `${key}=${value}\n`;
            }
        })
        throw new Error(msg);
    }
}

// オプションセクション
class OptionSection{
    constructor(sectionId){
        try{
            this.section = document.getElementById(sectionId);
            this.cb = this.section.getElementsByClassName("cb")[0];
            this.supplement = this.section.getElementsByClassName("supplement")[0];
            this.navBtn = this.supplement.getElementsByTagName("button")[0];
        }catch(e){
            ErrorLogger.createInstance(sectionId, e);
        }
    }
}

// 合計額セクション
class ChargeSection{

    constructor(){
        const id = "charge-section";
        try{
            this.section = document.getElementById(id);
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

            this.totalPrice = this.section.querySelector("input");
        }catch(e){
            ErrorLogger.createInstance(id, e);
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
    sumPrice(int, isAdd, isOption2){
        let currentTotalPrice = zenkakuCurrencyToInt(this.totalPrice.value);

        if(isOption2)
            isAdd? currentTotalPrice += (int - parseInt(paid)): currentTotalPrice -= (int - parseInt(paid));
        else
            isAdd? currentTotalPrice += int: currentTotalPrice -= int;

        const result = intToZenkakuCurrency(currentTotalPrice);
        this.totalPrice.value = result;
    }
}

// 入力事項セクション
class FormSection{

    constructor(){
        const id = "form-section";
        try{
            this.section = document.getElementById(id);
            this.form = document.getElementsByTagName("form")[0];
            this.fieldset = this.section.getElementsByTagName("fieldset")[0];
            this.Qs = this.fieldset.getElementsByClassName("Q");
            [   
                this.nameQ,
                this.payerQ,
                this.addressQ,
                this.phoneNumberQ,
            ] = this.Qs;

            this.errMsgEls = this.fieldset.getElementsByClassName("errorMessage");
            [
                this.nameErrMsgEl,
                this.payerErrMsgEl,
                this.addressErrMsgEl,
                this.phoneNumberErrMsgEl,
            ] = this.errMsgEls

            this.inputs = this.fieldset.getElementsByTagName("input");
            [
                this.name,
                this.payer,
                this.address,
                this.phoneNumber,
            ] = this.inputs

            this.returnBtn = document.getElementById("returnBtn");
            this.returnSpinner = document.getElementById("return-spinner");
            this.submitBtn = document.getElementById("submitBtn");
            this.submitSpinner = document.getElementById("submitSpinner");
        }catch(e){
            ErrorLogger.createInstance(id, e);
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

// 共通使用する関数
class CommonEvent{
    // 入力案内文の表示トグル
    static toggleSupplement(isChecked, el){
        isChecked? slideDown(el): slideUp(el);
    }

    // チェックボックストグル
    static toggleCbs(isChecked, basicCb, option1Cb, option2Cb){
        
        if(isChecked){
            // 有料版またはオプション１にチェックされているとき、オプション２は無効化
            if(basicCb.checked || option1Cb.checked){
                option2Cb.checked = false;
                option2Cb.disabled = true;
            }else{
                // オプション２がチェックされているとき、有料またはオプション１を無効化
                basicCb.checked = false;
                basicCb.disabled = true;

                option1Cb.checked = false;
                option1Cb.disabled = true;
            }
        }else{
            // 全てチェックされていないとき、全てを有効化
            if(!basicCb.checked && !option1Cb.checked && !option2Cb.checked){
                basicCb.disabled = false;
                option1Cb.disabled = false;
                option2Cb.disabled = false;
            }else if(!basicCb.checked && !option1Cb.checked)
                // 有料版またはオプション１がチェックされていないとき、オプション２を有効化
                option2Cb.disabled = false;
            else if(!option2Cb.checked){
                // オプション２がチェックされていないとき、有料版またはオプション１を有効化
                basicCb.disabled = false;
                option1Cb.disabled = false;
            }
        }
    }

    // 合計額のトグル
    static toggleChargeSection(isChecked, charge, targetEl, targetPrice, isOption2=false){

        // 合計額を更新する（charge.noOptionの非表示の関係で先に処理する必要がある）
        charge.sumPrice(targetPrice, isChecked, isOption2);

        if(isChecked){
            charge.noOption.style.display = "none";
            targetEl.style.display = "block";
        }else{
            if(charge.totalPrice.value === "０")
                charge.noOption.style.display = "block";

            targetEl.style.display = "none";
        }

    }
    
    // 入力欄のトグル
    static toggleFormSection(isChecked, form, basicCb, option1Cb, option2Cb){
        const {fieldset, addressQ, submitBtn, address, addressErrMsgEl} = form;

        // 有料版のみのチェックのとき、住所欄を非表示にする/ 住所欄を初期化する
        const isOnlyBasicCbChecked = basicCb.checked && !option1Cb.checked && !option2Cb.checked;
        if(isOnlyBasicCbChecked){
            addressQ.style.display = "none";
            address.value = "";
            addressErrMsgEl.style.display = "none";
        }else{
            addressQ.style.display = "";
        }

        if(isChecked){
            slideDown(fieldset);
            submitBtn.disabled = false;
        }else{
            const isAllUnchecked = !basicCb.checked && !option1Cb.checked && !option2Cb.checked;
            if(isAllUnchecked){
                slideUp(fieldset);
                submitBtn.disabled = true;
            }
        }
    }
}

/**
 * 有料版のチェックボックスのイベント
 */
class BasicCbEvent{

    // changeイベント
    static change(isChecked, instances){
        const [basic, option1, option2, charge, form] = instances;
        // 入力案内文のトグル
        CommonEvent.toggleSupplement(isChecked, basic.supplement);
        // チェックボックスのトグル
        CommonEvent.toggleCbs(isChecked, basic.cb, option1.cb, option2.cb);
        // 合計額セクションのトグル
        CommonEvent.toggleChargeSection(isChecked, charge, charge.basic, charge.basicPriceInt);
        // 入力事項セクションのトグル
        CommonEvent.toggleFormSection(isChecked, form, basic.cb, option1.cb, option2.cb);
    }
}

/**
 * 有料版セクションのイベント設定
 * @param {[]} instances 
 */
function handleBasicSectionEvent(instances){
    const [basic, option1, option2, charge, form] = instances;

    basic.cb.addEventListener("change", (e)=>{
        BasicCbEvent.change(e.target.checked, instances);
    })

    basic.navBtn.addEventListener("click",()=>{
        scrollToTarget(form.fieldset);
    })
}

/**
 * オプション１のチェックボックスのイベント
 */
class Option1CbEvent{

    // changeイベント
    static change(isChecked, instances){
        const [basic, option1, option2, charge, form] = instances;
        // 入力案内文のトグル
        CommonEvent.toggleSupplement(isChecked, option1.supplement);
        // チェックボックスのトグル
        CommonEvent.toggleCbs(isChecked, basic.cb, option1.cb, option2.cb);
        // 合計額セクションのトグル
        CommonEvent.toggleChargeSection(isChecked, charge, charge.option1, charge.option1PriceInt);
        // 入力事項セクションのトグル
        CommonEvent.toggleFormSection(isChecked, form, basic.cb, option1.cb, option2.cb);
    }
}

/**
 * オプション１セクションのイベント設定
 * @param {[]} instances 
 */
function handleOption1SectionEvent(instances){
    const [basic, option1, option2, charge, form] = instances;

    option1.cb.addEventListener("change", (e)=>{
        Option1CbEvent.change(e.target.checked, instances);
    })

    option1.navBtn.addEventListener("click",()=>{
        scrollToTarget(form.fieldset);
    })
}

/**
 * オプション２のチェックボックスのイベント
 */
class Option2CbEvent{

    // changeイベント
    static change(isChecked, instances){
        const [basic, option1, option2, charge, form] = instances;
        // 入力案内文のトグル
        CommonEvent.toggleSupplement(isChecked, option2.supplement);
        // チェックボックスのトグル
        CommonEvent.toggleCbs(isChecked, basic.cb, option1.cb, option2.cb);
        // 合計額セクションのトグル
        CommonEvent.toggleChargeSection(isChecked, charge, charge.option2, charge.option2PriceInt, true);
        // 入力事項セクションのトグル
        CommonEvent.toggleFormSection(isChecked, form, basic.cb, option1.cb, option2.cb);
    }
}

/**
 * オプション２のイベント設定
 * @param {*} instances 
 */
function handleOption2SectionEvent(instances){
    const [basic, option1, option2, charge, form] = instances;

    option2.cb.addEventListener("change", (e)=>{
        Option2CbEvent.change(e.target.checked, instances);
    })

    option2.navBtn.addEventListener("click",()=>{
        scrollToTarget(form.fieldset);
    })
}

class FormSectionInputEvent{
    // エラーメッセージ表示トグル
    static toggleErrMsgEl(result, el, input){
        // エラーがあるとき、メッセージを表示して値を初期化
        if(typeof result === "string"){
            el.style.display = "block";
            el.textContent = result;
            input.value = "";
        }else if(typeof result === "boolean" && result){
            // エラーがないとき、エラー表示を初期化
            el.style.display = "none";
            el.textContent = "";
        }else{
            ErrorLogger.invalidArgs("FormSectionInputEvent.toggleErrMsgEl", {result: result}, {el: el}, {input: input});
        }
    }

    // 支払名義人のバリデーション
    static handlePayerValidation(input){
        // 空欄チェック
        let result = isBlank(input);

        if(typeof result === "boolean"){
            // 余白削除/ カタカナのみ確認/ カタカナに変換
            const val = input.value.trim();
            if(!isOnlyHiraganaOrKatakana(val)){
                input.value = "";
                return "ひらがな又はカタカナで入力してください"
            }

            input.value = hiraganaToKatakana(val);
            result = true;
        }
        
        return result;
    }

    // changeイベント
    static change(form, input, idx){

        const [name, payer, address, phoneNumber] = form.inputs;
        const {errMsgEls} = form;
        let result;

        // 氏名
        if(input === name){
            // 全角確認
            result = isOnlyZenkaku(input);
        }else if(input === payer){
            // 支払名義人
            // カタカナチェック、カタカナ変換
            result = this.handlePayerValidation(input);
        }else if(input === address){
            // 住所
            // 空欄チェック
            result = isBlank(input);
            result = typeof result === "boolean"? true: result;
        }else if(input === phoneNumber){
            // 電話番号
            // 数字のみかつ１１桁以内
            result = checkPhoneNumber(input, false);
        }

        // 検証後のエラーメッセージ表示処理
        this.toggleErrMsgEl(result, errMsgEls[idx], input);
    }   

    // keydownイベント
    static keydown(e, form, input){
        const {name, payer, address, phoneNumber, submitBtn, addressQ} = form;
        // 氏名
        if(input === name){
            disableNumKey(e);
            setEnterKeyFocusNext(e, payer);
        }else if(input === payer){
            // 支払名義人
            disableNumKey(e);
            setEnterKeyFocusNext(e, addressQ.style.display === ""? address: phoneNumber);
        }else if(input === address){
            // 住所
            setEnterKeyFocusNext(e, phoneNumber);
        }else if(input === phoneNumber){
            // 電話番号
            setEnterKeyFocusNext(e, submitBtn);
        }
    }
}

/**
 * 送信イベント
 */
class FormSectionSubmitEvent{

    // オプションが１つは選択されていることを確認
    static isOptionSelected(basicCb, option1Cb, option2Cb){
        // いずれかチェックされているときはtrueを返す
        if(basicCb.checked || option1Cb.checked || option2Cb.checked)
            return true;

        return false;
    }

    // 全入力欄の空欄チェック
    static blankValidation(inputs, address, addressQ){

        for(let i = 0, len = inputs.length; i < len; i++){
            const input = inputs[i];

            if(input === address && window.getComputedStyle(addressQ).display === "none")
                continue;

            if(input.type === "text" && !input.value.trim()){
                input.focus();
                return false;
            }
        }

        return true;
    }

    // メイン処理
    static submit(event, instances){
        const [basic, option1, option2, charge, form] = instances;
        const basicCb = basic.cb;
        const option1Cb = option1.cb;
        const option2Cb = option2.cb;
        const {errMsgEls, submitBtn, submitSpinner, inputs, addressQ, address} = form;
    
        try{
            // 送信ボタンを無効化/ スピナーを表示/ 入力欄を有効化
            beforeStartProcess();

            // オプションが１つは選択されていることを確認
            if(!this.isOptionSelected(basicCb, option1Cb, option2Cb)){
                cancelProcess("どれか１つオプションを選択してください。");
                return;
            }

            // 空欄チェック
            if(!this.blankValidation(inputs, address, addressQ)){
                cancelProcess("未入力の欄があります。");
                return;
            }

            // エラーメッセージが表示されているものを取得
            const errIndex = findInvalidInputIndex(Array.from(errMsgEls));
            if(errIndex !== -1){
                cancelProcess("適切に入力されていない欄があります。");
                inputs[errIndex].focus();
                return;
            }

        }catch(error){
            basicLog("submit", error);
            cancelProcess(error.message);
        }   
        
        function beforeStartProcess(){
            submitBtn.disabled = true;
            submitSpinner.style.display = "";
            charge.totalPrice.disabled = false;
        }

        // 処理を中止する
        function cancelProcess(msg){
            submitSpinner.style.display = "none";
            submitBtn.disabled = false;    
            charge.totalPrice.disabled = true;
            alert(msg);
            event.preventDefault();
        }
    }
}

// 入力欄のイベント設定
function handleFormSectionEvent(instances){
    const [basic, option1, option2, charge, form] = instances;
    const {inputs} = form;

    // 入力欄にイベント設定
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];
        input.addEventListener("change", ()=>{
            FormSectionInputEvent.change(form, input, i);
        })
        input.addEventListener("keydown", (e)=>{
            FormSectionInputEvent.keydown(e, form, input);
        })
    }
    
    // 元のページに戻るボタン
    setEventToReturnBtn();

    // 支払いページへボタン
    form.form.addEventListener("submit", (e)=>{
        FormSectionSubmitEvent.submit(e, instances);
    });
}

/**
 * イベント設定
 * @param {*} instances 
 */
function setEventHandler(instances){
    const [basic, option1, option2, charge, form] = instances;

    // 有料版
    if(window.getComputedStyle(basic.section).display !== "none")
        handleBasicSectionEvent(instances);

    // オプション１
    if(window.getComputedStyle(option1.section).display !== "none")
        handleOption1SectionEvent(instances);

    // オプション２
    handleOption2SectionEvent(instances);

    // 入力フォーム
    handleFormSectionEvent(instances);
}

/**
 * エラー表示部分にスクロールする
 */
function scrollToFormErrors(){
    const field = document.getElementById("form-errors");
    if(window.getComputedStyle(field).display === "block")
        scrollToTarget(field);
}

/**
 * 入力状況を復元する
 * @param {[]} instances 
 */
function restoreForm(instances){
    const [basic, option1, option2, charge, form] = instances;
    const targetInputs = [basic.cb, option1.cb, option2.cb];

    charge.totalPrice.value = 0;

    targetInputs.forEach(x => {
        if(x.checked)
            x.dispatchEvent(new Event("change"));
    })

}

window.addEventListener("load", ()=>{
    try{
        const basic = new OptionSection(Ids.fieldset.basic);
        const option1 = new OptionSection(Ids.fieldset.option1);
        const option2 = new OptionSection(Ids.fieldset.option2);
        const charge = new ChargeSection();
        const form = new FormSection();
    
        const instances = [basic, option1, option2, charge, form];
    
        // イベント設定
        setEventHandler(instances);

        // エラーがあるとき、エラー表示欄にスクロールする
        scrollToFormErrors();

        // 初期値に基づくイベント発生
        restoreForm(instances);
    }catch(e){
        basicLog("load", e);
    }
})
"use strict"

const isUser = document.getElementById("id_email")? false: true;

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

            if(isUser){
                [   
                    this.paymentQ,
                    this.payerQ,
                    this.cardNumberQ,
                    this.expiryMonthQ,
                    this.expiryYearQ,
                    this.cvvQ,
                    this.cardHolderNameQ,
                    this.termsAgreementQ,
                ] = this.Qs;
            }else{
                [   
                    this.emailQ,
                    this.nameQ,
                    this.addressQ,
                    this.phoneNumberQ,
                    this.password1Q,
                    this.password2Q,
                    this.paymentQ,
                    this.payerQ,
                    this.cardNumberQ,
                    this.expiryMonthQ,
                    this.expiryYearQ,
                    this.cvvQ,
                    this.cardHolderNameQ,
                    this.termsAgreementQ,
                    this.tokenQ,
                ] = this.Qs;
            }
            this.cardInfoQsArr = [
                this.cardNumberQ,
                this.expiryMonthQ,
                this.expiryYearQ,
                this.cvvQ,
                this.cardHolderNameQ,
            ]
            this.errMsgEls = this.fieldset.getElementsByClassName("errorMessage");
            if(isUser){
                [
                    this.paymentErrMsgEl,
                    this.payerErrMsgEl,
                    this.cardNumberErrMsgEl,
                    this.expiryMonthErrMsgEl,
                    this.expiryYearErrMsgEl,
                    this.cvvErrMsgEl,
                    this.cardHolderNameErrMsgEl,
                    this.termsAgreementErrMsgEl,
                ] = this.errMsgEls
            }else{
                [
                    this.emailErrMsgEl,
                    this.nameErrMsgEl,
                    this.addressErrMsgEl,
                    this.phoneNumberErrMsgEl,
                    this.password1ErrMsgEl,
                    this.password2ErrMsgEl,
                    this.paymentErrMsgEl,
                    this.payerErrMsgEl,
                    this.cardNumberErrMsgEl,
                    this.expiryMonthErrMsgEl,
                    this.expiryYearErrMsgEl,
                    this.cvvErrMsgEl,
                    this.cardHolderNameErrMsgEl,
                    this.termsAgreementErrMsgEl,
                    this.tokenErrMsgEl,
                ] = this.errMsgEls
            }

            this.inputs = this.fieldset.getElementsByTagName("input");
            if(isUser){
                [
                    this.paymentCard,
                    this.paymentBank,
                    this.payer,
                    this.cardNumber,
                    this.expiryMonth,
                    this.expiryYear,
                    this.cvv,
                    this.cardHolderName,
                    this.termsAgreement,
                ] = this.inputs
            }else{
                [
                    this.email,
                    this.name,
                    this.address,
                    this.phoneNumber,
                    this.password1,
                    this.password2,
                    this.paymentCard,
                    this.paymentBank,
                    this.payer,
                    this.cardNumber,
                    this.expiryMonth,
                    this.expiryYear,
                    this.cvv,
                    this.cardHolderName,
                    this.termsAgreement,
                    this.token,
                ] = this.inputs
            }

            if(!isUser){
                this.verifyEmailBtn = document.getElementById("verify-email-btn");
                this.veryfyEmailSpinnerBtn = document.getElementById("verify-email-btn-spinner");
            }
            this.submitBtn = document.getElementById("submitBtn");
            this.submitSpinner = document.getElementById("submitSpinner");
            this.standByMessageEl = document.getElementsByClassName("stand-by-message")[0];
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
        const {fieldset, submitBtn} = form;

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
        form.fieldset.querySelector("input").focus();
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
        form.fieldset.querySelector("input").focus();
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
        form.fieldset.querySelector("input").focus();
    })
}

/**
 * 入力欄のイベント
 */
class FormSectionInputEvent{

    /**
     * changeイベント
     */
    static async change(form, input, inputIdx){
        let name, address, email, phoneNumber, password1, password2, token, verifyEmailBtn;
        if(!isUser){
            ({name, address, email, phoneNumber, password1, password2, token, verifyEmailBtn} = form)
        }

        const {
            paymentCard, paymentBank, payer, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName, termsAgreement,
            cardInfoQsArr, payerQ,
            errMsgEls,
            payerErrMsgEl,
            submitBtn
        } = form;

        // 支払方法
        function handlePayment(isCard){
            try{
                const cardInfoDisplay = isCard? "flex": "none";
                const payerDisplay = isCard? "none": "flex";
    
                // カードのとき、支払名義人を初期化・非表示にする
                payerQ.style.display = payerDisplay;
                payerErrMsgEl.style.display = "none";
                payer.value = "";
    
                // カードのとき、カード情報を表示する
                for(let i = 0, len = cardInfoQsArr.length; i < len; i++){
                    const q = cardInfoQsArr[i];
                    q.style.display = cardInfoDisplay;
    
                    if(!isCard){
                        q.querySelector("input").value = "";
                        q.querySelector(".errorMessage").style.display = "none";
                    }
                }
                
                if(isCard)
                    cardNumber.focus();
                else
                    payer.focus();
            }catch(e){
                basicLog("handlePayment", e, `isCard=${isCard}`);
            }
        }

        // 支払名義人のバリデーション
        function handlePayer(){
            try{
                // 空欄チェック
                let result = isBlank(payer);
                if(typeof result === "string")
                    return result;
    
                // カタカナのみ確認/ カタカナに変換
                const val = payer.value;
                if(!isOnlyHiraganaOrKatakana(val)){
                    payer.value = "";
                    return "ひらがな又はカタカナで入力してください"
                }
    
                payer.value = hiraganaToKatakana(val);
                
                return true;
            }catch(e){
                basicLog("handlePayer", e, `payer=${payer}`);
            }
        }

        // 住所
        function handleAddress(inProcessInput){
            result = isBlank(inProcessInput);
            if(typeof result === "string")
                return result;

            inProcessInput.value = hankakuToZenkaku(inProcessInput.value)
            return true;
        }

        // 数字のみの入力欄イベント
        function handleNumInputs(numInput){

            // 共通処理
            function common(inProcessInput){
                try{
                    // 空欄
                    let result = isBlank(inProcessInput);
                    if(typeof result === "string")
                        return result;
    
                    // スペース削除
                    const val = trimAllSpace(inProcessInput.value, inProcessInput);
    
                    // 数字チェックかつ半角変換
                    result = isNumber(val, inProcessInput);
                    if(!result)
                        return "数字のみで入力してください";
                }catch(e){
                    basicLog("handleNumInputsのcommon", e, `inProcessInput=${inProcessInput}`);
                }
            }

            // カード番号
            function handleCardNumber(inProcessInput){
                try{
                    // 14 - 16桁
                    let result = isDigit(inProcessInput, "creditCardNumber");
                    if(typeof result === "string")
                        return result;
    
                    // スペースを付与
                    inProcessInput.value = inProcessInput.value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    return true;
                }catch(e){
                    basicLog("handleCardNumber", e, `inProcessInput=${inProcessInput}`);
                }
            }

            // 有効期限(月)
            function handleExpiryMonth(inProcessInput){
                try{
                    // 1~12の間
                    const val = parseInt(inProcessInput.value);
                    if(!(1 <= val && val <= 12))
                        return "1から12までの間で入力してください"
    
                    // 1桁のときは頭に0を付与する
                    if(val < 10)
                        inProcessInput.value = `0${val}`;
    
                    return true;
                }catch(e){
                    basicLog("handleExpiryMonth", e, `inProcessInput=${inProcessInput}`);
                }
            }

            // 有効期限(年)
            function handleExpiryYear(inProcessInput){
                try{
                    const val = parseInt(inProcessInput.value);
                    const currentYear = new Date().getFullYear();
                    const lastTwoDigits = currentYear % 100;
                    const maxYear = lastTwoDigits + 10;
    
                    // 10年以内
                    if(!(lastTwoDigits <= val && val <= maxYear))
                        return "現在から10年以内で入力してください";
    
                    return true;
                }catch(e){
                    basicLog("handleExpiryYear", e, `inProcessInput=${inProcessInput}`);
                }
            }

            // CVV
            function handleCvv(inProcessInput){
                try{
                    let result = isDigit(inProcessInput, "cvv");
                    if(typeof result === "string")
                        return result;
    
                    return true;
                }catch(e){
                    basicLog("handleCvv", e, `inProcessInput=${inProcessInput}`);
                }
            }

            // 一時コード
            function handleToken(inProcessInput){
                try{
                    let result = isDigit(inProcessInput, "token");
                    if(typeof result === "string")
                        return result;
    
                    return true;
                }catch(e){
                    basicLog("handleToken", e, `inProcessInput=${inProcessInput}`);
                }
            }

            /**
             * メイン処理
             */
            let result = common(numInput);
            if(typeof result === "string")
                return result;

            if(numInput === cardNumber)
                return handleCardNumber(numInput);
            else if(numInput === expiryMonth)
                return handleExpiryMonth(numInput);
            else if(numInput === expiryYear)
                return handleExpiryYear(numInput);
            else if(numInput === cvv)
                return handleCvv(numInput);
            else if(numInput === token)
                return handleToken(numInput);
        }

        // カード名義人
        function handleCardHolderName(){
            try{
                // 空欄
                let result = isBlank(cardHolderName);
                if(typeof result === "string")
                    return result;
    
                // 先頭と末尾のスペース削除
                let val = trimStartAndEndSpace(cardHolderName.value);
    
                // 半角または全角のスペースを1つ含んでいるかをチェックする正規表現
                result = hasSingleSpace(val);
                if(typeof result === "string")
                    return result;
    
                // アルファベットのみ
                const x = trimAllSpace(val);
                result = isAlphabetOnly(x);
                if(typeof result === "string")
                    return result;
    
                // 半角, 大文字に変換
                cardHolderName.value = ZenkakuToHankaku(val).toUpperCase();
    
                return true;
            }catch(e){
                basicLog("handleCardHolderName", e, `cardHolderName=${cardHolderName}`);
            }
        }

        // メールアドレス検証
        async function handleEmail(input){
            const response = await validateEmail(input);
            
            if(response.status === 200)
                return true;

            if(typeof response === "string")
                return response;

            if(response.status === 409)
                return "会員の方は先にログインをお願いします";
            
            const data = await response.json();
            return data.message;
        }

        // エラーメッセージ表示トグル
        function toggleErrMsgEl(result){
            // 支払方法欄に2つinputがあるためカードcheckbox以降のinputIdxを - 1している
            const idx = isUser? inputIdx - 1: 
                inputIdx > 6? inputIdx -1: inputIdx
            const el = errMsgEls[idx];

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
                ErrorLogger.invalidArgs("FormSectionInputEvent.toggleErrMsgEl", {result: result, el: el, input: input});
            }

            // パスワード1のchangeイベントのとき、常に確認用の値を初期化する
            if(input === password1)
                password2.value = "";
        }

        // 規約に同意
        function handleTermsAgreement(){
            if(isUser && input.checked)
                submitBtn.focus();
            else if(!isUser && input.checked)
                verifyEmailBtn.focus();
        }

        let result;

        switch(input){
            // 支払い方法
            case paymentCard:
            case paymentBank:
                const isCard = input === paymentCard? true: false;
                handlePayment(isCard);
                return;
            // 氏名 = 全角確認
            case name:
                result = isOnlyZenkaku(input);
                break;
            // 支払名義人 = カタカナチェック、カタカナ変換
            case payer:
                result = handlePayer();
                break;
            // 住所 = 空欄チェック, 半角を全角に変換
            case address:
                result = handleAddress(input);
                break;
            // メールアドレス = 形式チェックと既存のチェック
            case email:
                result = await handleEmail(input);
                break;
            // パスワード1
            case password1:
                result = validatePassword1(input);
                break;
            // 確認用
            case password2:
                result = validatePassword2(password1, input);
                break;
            // 電話番号 = 数字のみかつ10または11桁
            case phoneNumber:
                result = checkPhoneNumber(input, false);
                break;
            // カード番号 = 数字のみかつ15,16桁, 4桁ごとに半角スペース
            case cardNumber:
                result = handleNumInputs(input);
                break;
            // 有効期限(月) = 数字のみかつ2桁, 1桁のときは先頭に0を付与
            case expiryMonth:
                result = handleNumInputs(input);
                break;
            // 有効期限(年) = 数字のみかつ2桁, 現在から10年以内
            case expiryYear:
                result = handleNumInputs(input);
                break;
            // cvv = 数字のみかつ3または4桁
            case cvv:
                result = handleNumInputs(input);
                break;
            // カード名義人 = 半角のアルファベットのみ、スペースがある
            case cardHolderName:
                result = handleCardHolderName();
                break;
            // 利用規約に同意 = 次の要素にフォーカス
            case termsAgreement:
                handleTermsAgreement();
                return;
            case token:
                result = handleNumInputs(input);
                break;
        }

        // 検証後のエラーメッセージ表示処理
        toggleErrMsgEl(result);
    }   

    /**
     * keydownイベント
     */
    static keydown(e, form, input, inputIdx){
        let name, address, email, phoneNumber, password1, password2, token, addressQ;
        if(!isUser){
            ({name, address, email, phoneNumber, password1, password2, token, addressQ} = form)
        }
        const {
            inputs,
            paymentCard, paymentBank, payer, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName, termsAgreement,
            payerQ, cardNumberQ,
            submitBtn
        } = form;

        // フォーカス対象の次の要素を取得する
        function getNextTargetEl(){

            // 氏名欄で住所欄が非表示のときメールアドレス欄を返す
            if(input === name && window.getComputedStyle(addressQ).display === "none"){
                return phoneNumber
            }else if(input === payer){
                // 支払名義人欄のとき利用規約の同意ボタンを返す
                return termsAgreement;
            }else if(input === token){
                // 一時コードのとき申込むボタン
                return submitBtn;
            }else{
                // その他は次のインデックスの要素を返す
                return inputs[inputIdx + 1];
            }
        }

        // ラジオボタン、チェックボックス以外
        if(!["radio", "checkbox"].includes(input.type))
            setEnterKeyFocusNext(e, getNextTargetEl());

        // 氏名, 支払名義人, カード名義人は数字不可
        if([name, payer, cardHolderName].includes(input)){
            disableNumKey(e);
        }else if([phoneNumber, cardNumber, expiryMonth, expiryYear, cvv, token].includes(input)){
            // 電話番号, カード番号, 有効期限(月), 有効期限(年), cvvは数字のみ可
            allowOnlyNumber(e);
        }
    }
}

/**
 * 送信イベント
 */
class FormSectionSubmitEvent{
    
    // メイン処理
    static async submit(event, instances){
        
        const [basic, option1, option2, charge, form, cardInfoError, emailVerificationToken] = instances;
        const {
            errMsgEls,
            submitBtn, submitSpinner,
            inputs,
            paymentCard, payer, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName,
            payerQ, cardNumberQ,
            standByMessageEl
        } = form;

        // オプションが１つは選択されていることを確認
        function isOptionSelected(){

            const isBasic = basic.cb.checked;
            const isOption1 = option1.cb.checked;
            const isOption2 = option2.cb.checked;

            // いずれかチェックされているときはtrueを返す
            return [isBasic, isOption1, isOption2].some(x => x);
        }

        // 全入力欄の空欄チェック
        function blankValidation(){
    
            for(let i = 0, len = inputs.length; i < len; i++){
                const input = inputs[i];
    
                if((input === payer && window.getComputedStyle(payerQ).display === "none")){
                    input.value = "";
                    continue;
                }

                if(input === cardNumber && window.getComputedStyle(cardNumberQ).display === "none")
                    return true;
    
                if(["text", "email", "number", "password"].includes(input.type) && trimAllSpace(input.value).length === 0){
                    input.focus();
                    return false;
                }
            }
    
            return true;
        }

        // 処理を中止する
        function toggleProcess(isCardPaymentStart, msg = null){
            const isCancel = msg? true: false;

            submitBtn.disabled = !isCancel;    
            submitSpinner.style.display = isCancel? "none": "";
            charge.totalPrice.disabled = isCancel;
            
            if(isCardPaymentStart && !isCancel)
                slideDown(standByMessageEl);

            if(isCancel){
                alert(msg);
                slideUp(standByMessageEl);
                event.preventDefault();
            }
        }

        // カード決済実行
        async function handleCardExec(registedData){
            
            const api_key = fincodePublicKey;
            // Fincodeインスタンスを生成
            let fincode = Fincode(api_key);

            const card_no = cardNumber.value.replace(/ /g, "");
            const expire = `${expiryYear.value}${expiryMonth.value}`;
            const holder_name = cardHolderName.value;
            const security_code = cvv.value;

            // 決済実行に必要なデータを宣言
            const transaction = {
              // オーダーID
              id: registedData.id,
              // 決済種別
              pay_type: registedData.pay_type,
              // 取引ID
              access_id: registedData.access_id,
              // 支払い方法(一括)
              method: "1",
              // カード番号
              card_no : card_no,
              // 有効期限 yymm形式
              expire : expire,
              // カード名義人
              holder_name: holder_name,
              // セキュリティコード
              security_code: security_code,
            };

            // 決済実行をリトライ機能付きで実行
            const retries = 3;
            const delay = 1000;

            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    return await execPayment(fincode, transaction);
                } catch (e) {
                    if (attempt < retries - 1) {
                        console.warn(`リトライ${attempt + 1}回目に失敗、${delay}ms後に再試行します。`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        return { message: e.message };
                    }
                }
            }
        }
        
        async function execPayment(fincode, transaction) {
            return new Promise((resolve, reject) => {
                fincode.payments(transaction,
                    async function(status, response) {
                        const res = await response;
                        if (status === 200) {
                            resolve({ message: "", paymentData: res });
                        }else{
                            // エラーセッションに登録
                            cardInfoError.set();

                            let messages = res.errors.map(x => x.error_message).join('\n');
                            resolve({ message: messages });
                        }
                    },
                    function() {
                        // 通信エラー処理
                        reject(new Error("カード決済時に通信エラーが発生しました。\n時間を空けて再試行しても同じエラーが発生する場合は、恐れ入りますがお問い合わせをお願いします。"));
                    }
                );
            });
        }

        // カード決済情報登録
        async function handleCardPayment(){
            const formData = new FormData(form.form);
            const url = "card_regist"
            const retryCount = 3;
            const delay = 1000;

            for(let attempt = 0; attempt < retryCount; attempt++){
                try{
                    const registRes = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRFToken': csrftoken,
                        },
                        mode: "same-origin"
                    })
    
                    if(registRes.ok){
                        const registedData = (await registRes.json()).data;
                        const execRes = await handleCardExec(registedData);
                        if(execRes.message === "")
                            return {message: "", paymentData: execRes, formData: formData};
                        else
                            return {message: execRes.message}
                    }else{
                        // エラーセッションに登録
                        cardInfoError.set(); 

                        // エラーメッセージを返す
                        let message = (await registRes.json()).message;
                        message = message.replace(/\|/g, '\n ');
                        return {message: message};
                    }
                }catch(e){
                    if(attempt < retryCount - 1){
                        console.warn(`通信エラー、${delay}ミリ秒後に再試行します。(試行回数=${attempt + 1}/${retryCount})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }else{
                        return {message: "通信エラーが発生しました。\n時間を空けて再試行しても同じエラーが発生する場合は、恐れ入りますがお問い合わせをお願いします。"};
                    }
                }
            }
        }

        // カード決済後のデータ登録処理
        async function afterCardPay(paymentData, formData){
            formData.forEach((value, key) =>{
                paymentData[key] = value;
            });

            const url = "card_payment/after_card_pay";
            const retryCount = 3;
            const delay = 1000;

            for(let attempt = 0; attempt < retryCount; attempt++){
                try{;
                    paymentData.attempt = attempt

                    const response = await fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(paymentData),
                        headers: {
                            'X-CSRFToken': csrftoken,
                            'Content-Type': 'application/json'
                        },
                        mode: "same-origin"
                    })

                    const data = await response.json();
                    if(data.message === ""){
                        window.location.href = data.next_path
                        return {message: ""}
                    }else{
                        return ({message: "受付に失敗\n\n決済完了後にエラーが発生したため対応を開始しました。\n対応が完了しましたらメールでご報告いたしますので、大変恐れ入りますがサービス開始まで少々お待ちください。"});
                    }
                }catch(e){
                    if(attempt < retryCount - 1){
                        console.warn(`通信エラー、${delay}ミリ秒後に再試行します。(試行回数=${attempt + 1}/${retryCount})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }else{
                        return {message: `通信エラー\n決済完了後にエラーが発生しました。大変恐れ入りますが弊社までお問い合わせをお願いします。\n${companyMailAddress}`};
                    }
                }
            }
        }

        /**
         * メイン
         */
        try{
            const isCardPaymentStart = paymentCard.checked;
            
            // カード情報の連続リクエストエラーチェック
            if(isCardPaymentStart){
                const result = cardInfoError.isValid();
                if(typeof result === "string")
                    throw new Error(result);
            }

            // オプションが１つは選択されていることを確認
            if(!isOptionSelected()){
                throw new Error("どれか１つオプションを選択してください。");
            }

            // 空欄チェック
            if(!blankValidation())
                throw new Error("未入力の欄があります。");

            // エラーメッセージが表示されているものを取得
            const errIndex = findInvalidInputIndex(Array.from(errMsgEls));
            if(errIndex !== -1){
                inputs[errIndex + 1].focus();
                throw new Error("適切に入力されていない欄があります。");
            }

            // 送信ボタンを無効化/ スピナーを表示/ 入力欄を有効化
            toggleProcess(isCardPaymentStart);

            // カード決済のとき
            if(isCardPaymentStart){
                event.preventDefault();
                
                const paymentResult = await handleCardPayment();
                // 決済成功
                if(paymentResult.message === ""){
                    const result = await afterCardPay(paymentResult.paymentData, paymentResult.formData);
                    if(result.message !== "")
                        throw new Error(result.message);

                    cardInfoError.clear();
                }else{
                    throw new Error(`受付に失敗\n\n${paymentResult.message}`)
                }   
            }

            emailVerificationToken.clear();
        }catch(error){
            toggleProcess(false, error.message);
            basicLog("submit", error);
        }   
    }
}

/**
 * メールアドレスを認証ボタンイベント
 */
class VerifyEmailBtnEvent{

    // クリックイベント
    static async click(emailInput, emailErrMsgEl, formInstance, emailVerificationTokenInstance){
        const functionName = "VerifyEmailBtnEvent > click";
        const val = emailInput.value;

        // メールアドレス検証
        async function checkEmail(){
            await new Promise((resolve)=>{
                emailInput.dispatchEvent(new Event("change"));
                setTimeout(resolve, 0);
            })

            if(window.getComputedStyle(emailErrMsgEl).display === "none"){
                return true;
            }else{
                await scrollToTarget(emailErrMsgEl);
                return false;
            }
        }

        // 認証リンクを送信
        async function sendVerificationMail(){
            const url = "/account/send_verification_mail";
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({ email: val }),
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                },
                mode: "same-origin"
            })

            return response;
        }

        try{
            let result = await checkEmail();
            if(!result)
                return;
    
            result = emailVerificationTokenInstance.isValid();
            if(typeof result === "string"){
                alert(result);
                return;
            }

            const response = await sendVerificationMail();
            if(response.ok){
                emailVerificationTokenInstance.set();
                alert(`${val} にメールを送信しました。\n\n受信したメールの内容のご確認をお願いします。`);
                formInstance.token.focus();
                return;
            }
            
            const data = await response.json();
            const message = data.message;
            alert(message);
            emailInput.focus();
        }catch(e){
            basicLog(functionName, e, `email=${val}`);
            alert("通信エラー\n\n数分空けて再試行しても同じエラーになる場合は、恐れ入りますが、お問い合わせをお願いします。");
        }   
    }
}

// 入力欄のイベント設定
function handleFormSectionEvent(instances){
    const [basic, option1, option2, charge, form, cardInfoError, emailVerificationToken] = instances;
    const {inputs, email, emailErrMsgEl} = form;

    // 入力欄にイベント設定
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];
        input.addEventListener("change", ()=>{
            FormSectionInputEvent.change(form, input, i);
        })
        input.addEventListener("keydown", (e)=>{
            FormSectionInputEvent.keydown(e, form, input, i);
        })
    }

    if(!isUser){
        form.verifyEmailBtn.addEventListener("click", ()=>{
            VerifyEmailBtnEvent.click(email, emailErrMsgEl, form, emailVerificationToken);
        })
    }

    // submitボタン
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

window.addEventListener("DOMContentLoaded", ()=>{

    // 使用するインスタンスの生成
    function createInstances(){
        const basic = new OptionSection(Ids.fieldset.basic);
        const option1 = new OptionSection(Ids.fieldset.option1);
        const option2 = new OptionSection(Ids.fieldset.option2);
        const charge = new ChargeSection();
        const form = new FormSection();
        const cardInfoError = new CardInfoError();
        const emailVerificationToken = new EmailVerificationToken();

        return [basic, option1, option2, charge, form, cardInfoError, emailVerificationToken]
    }

    /**
     * フォームエラーが発生して再表示するときに入力状況を復元する処理
     * @param {[]} instances 
     */
    function restoreForm(instances){
        const [basic, option1, option2, charge, form] = instances;
        
        // 合計額を初期化
        charge.totalPrice.value = 0;
        
        // オプションの選択状況を再現
        const optionsCheckboxes = [basic.cb, option1.cb, option2.cb];
        optionsCheckboxes.forEach(x => {
            if(x.checked)
                x.dispatchEvent(new Event("change"));
        })

        // 銀行振込のときは、銀行振込用の表示にする(初期表示はクレジットカード用)
        if(form.paymentBank.checked){
            Array.from(form.cardInfoQsArr).forEach(x => x.style.display = "none");
            form.payerQ.style.display = "flex";
        }
    }

    /**
     * エラー表示部分にスクロールする
     */
    function scrollToFormErrors(){
        const wrapper = document.getElementsByClassName("form-error-wrapper")[0];
        if(wrapper)
            scrollToTarget(wrapper, 0);
    }
    
    try{
        const instances = createInstances();
    
        // inputでenterによるsubmitを阻止
        disableEnterKeyForInputs();
        
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
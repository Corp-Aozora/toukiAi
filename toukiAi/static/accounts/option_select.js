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
                this.paymentQ,
                this.nameQ,
                this.payerQ,
                this.addressQ,
                this.phoneNumberQ,
                this.cardNumberQ,
                this.expiryMonthQ,
                this.expiryYearQ,
                this.cvvQ,
                this.cardHolderNameQ,
            ] = this.Qs;

            this.errMsgEls = this.fieldset.getElementsByClassName("errorMessage");
            [
                this.paymentErrMsgEl,
                this.nameErrMsgEl,
                this.payerErrMsgEl,
                this.addressErrMsgEl,
                this.phoneNumberErrMsgEl,
                this.cardNumberErrMsgEl,
                this.expiryMonthErrMsgEl,
                this.expiryYearErrMsgEl,
                this.cvvErrMsgEl,
                this.cardHolderNameErrMsgEl,
            ] = this.errMsgEls

            this.inputs = this.fieldset.getElementsByTagName("input");
            [
                this.paymentCard,
                this.paymentBank,
                this.name,
                this.payer,
                this.address,
                this.phoneNumber,
                this.cardNumber,
                this.expiryMonth,
                this.expiryYear,
                this.cvv,
                this.cardHolderName,
            ] = this.inputs

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
        form.name.focus();
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
        form.name.focus();
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
        form.name.focus();
    })
}

/**
 * 入力欄のイベント
 */
class FormSectionInputEvent{

    // changeイベント
    static change(form, input, inputIdx){

        const {
            paymentCard, paymentBank, name, payer, address, phoneNumber, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName,
            Qs, 
            payerQ,
            errMsgEls,
            payerErrMsgEl,
        } = form;

        // 支払方法
        function handlePayment(isCard){
            try{
                const QsArr = Array.from(Qs);
                const startIdx = QsArr.findIndex(element => element.classList.contains('card-info-start'));
                const cardInfoDisplay = isCard? "flex": "none";
                const payerDisplay = isCard? "none": "flex";
    
                // カードのとき、支払名義人を初期化・非表示にする
                payerQ.style.display = payerDisplay;
                payerErrMsgEl.style.display = "none";
                payer.value = "";
    
                // カードのとき、カード情報を表示する
                for(let i = startIdx; i < Qs.length; i++){
                    const q = Qs[i];
                    q.style.display = cardInfoDisplay;
    
                    if(!isCard){
                        q.querySelector("input").value = "";
                        q.querySelector(".errorMessage").style.display = "none";
                    }
                }
    
                name.focus();
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
            return result;
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

        // エラーメッセージ表示トグル
        function toggleErrMsgEl(result){
            const el = errMsgEls[inputIdx - 1];

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
        }

        let result;

        // 支払い方法
        if([paymentCard, paymentBank].includes(input)){
            const isCard = input === paymentCard? true: false;
            handlePayment(isCard);
            return;
        }else if(input === name){
            // 氏名 = 全角確認
            result = isOnlyZenkaku(input);
        }else if(input === payer){
            // 支払名義人 = カタカナチェック、カタカナ変換
            result = handlePayer();
        }else if(input === address){
            // 住所 = 空欄チェック, 半角を全角に変換
            result = handleAddress(input);
        }else if(input === phoneNumber){
            // 電話番号 = 数字のみかつ10または11桁
            result = checkPhoneNumber(input, false);
        }else if(input === cardNumber){
            // カード番号 = 数字のみかつ15,16桁, 4桁ごとに半角スペース
            result = handleNumInputs(input);
        }else if(input === expiryMonth){
            // 有効期限(月) = 数字のみかつ2桁, 1桁のときは先頭に0を付与
            result = handleNumInputs(input);
        }else if(input === expiryYear){
            // 有効期限(年) = 数字のみかつ2桁, 現在から10年以内
            result = handleNumInputs(input);
        }else if(input === cvv){
            // cvv = 数字のみかつ3または4桁
            result = handleNumInputs(input);
        }else if(input === cardHolderName){
            // カード名義人 = 半角のアルファベットのみ、スペースがある
            result = handleCardHolderName();
        }

        // 検証後のエラーメッセージ表示処理(支払方法欄に2つinputがあるためidx - 1にしている)
        toggleErrMsgEl(result, input);
    }   

    // keydownイベント
    static keydown(e, form, input, inputIdx){
        const {
            inputs,
            paymentCard, paymentBank, name, payer, address, phoneNumber, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName,
            payerQ, addressQ, cardNumberQ,
            submitBtn
        } = form;

        // フォーカス対象の次の要素を取得する
        function getNextTargetEl(){

            // 氏名欄で支払名義人が非表示のとき住所欄を返す
            if(input === name && window.getComputedStyle(payerQ).display === "none"){
                // 住所欄が非表示のとき電話番号欄を返す
                if(window.getComputedStyle(addressQ).display === "none")
                    return phoneNumber;
                else
                    return address
            }else if(input === phoneNumber && window.getComputedStyle(cardNumberQ).display === "none" ||
                input === cardHolderName){
                // 電話番号欄でカード番号が非表示のとき、またはカード名義人欄のときsubmitボタンを返す
                return submitBtn;
            }else{
                // その他は次のインデックスの要素を返す
                return inputs[inputIdx + 1];
            }
        }

        // ラジオボタン以外
        if(input !== paymentCard && input !== paymentBank)
            setEnterKeyFocusNext(e, getNextTargetEl());

        // 氏名, 支払名義人は数字不可
        if([name, payer].includes(input)){
            disableNumKey(e);
        }else if([phoneNumber, cardNumber, expiryMonth, expiryYear, cvv].includes(input)){
            // 電話番号, カード番号, 有効期限(月), 有効期限(年), cvvは数字以外不可
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
        
        const [basic, option1, option2, charge, form, cardInfoError] = instances;
        const {
            errMsgEls,
            submitBtn, submitSpinner,
            inputs,
            paymentCard, payer, address, cardNumber, expiryMonth, expiryYear, cvv, cardHolderName,
            payerQ, addressQ, cardNumberQ,
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
    
                if((input === payer && window.getComputedStyle(payerQ).display === "none")||
                    (input === address && window.getComputedStyle(addressQ).display === "none")){
                    input.value = "";
                    continue;
                }

                if(input === cardNumber && window.getComputedStyle(cardNumberQ).display === "none")
                    return true;
    
                if(input.type === "text" && trimAllSpace(input.value).length === 0){
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
                            
                    }else if(registRes.status === 401){
                        // 会員ではないとき
                        window.location.href("/account/login/")
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

            // 送信ボタンを無効化/ スピナーを表示/ 入力欄を有効化
            toggleProcess(isCardPaymentStart);

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

            // カード決済のとき
            if(isCardPaymentStart){
                event.preventDefault();
                
                const paymentResult = await handleCardPayment();
                // 決済成功
                if(paymentResult.message === ""){
                    const result = await afterCardPay(paymentResult.paymentData, paymentResult.formData);
                    if(result.message !== "")
                        throw new Error(result.message);
                }else{
                    throw new Error(`受付に失敗\n\n${paymentResult.message}`)
                }   
            }
        }catch(error){
            toggleProcess(false, error.message);
            basicLog("submit", error);
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
            FormSectionInputEvent.keydown(e, form, input, i);
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

/**
 * エラー表示部分にスクロールする
 */
function scrollToFormErrors(){
    const wrapper = document.getElementsByClassName("form-error-wrapper")[0];
    if(wrapper)
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
        const cardInfoError = new CardInfoError();
    
        const instances = [basic, option1, option2, charge, form, cardInfoError];
    
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
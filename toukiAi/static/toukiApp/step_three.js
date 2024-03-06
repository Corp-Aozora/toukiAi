"use strict";

class Fieldset{
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        this.fieldset = document.getElementById(fieldsetId);
        this.Qs = Array.from(this.fieldset.getElementsByClassName("Q"));
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
        this.errMsgEls = Array.from(this.fieldset.getElementsByClassName("errorMessage"));
        this.noInputs = Array.from(this.fieldset.getElementsByTagName("input"));
    }
}

//被相続人欄
const decedents = [];
class Decedent extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        name: 0,
        deathYear: 1,
        deathMonth: 2,
        deathDate: 3,
        birthYear: 4,
        birthMonth: 5,
        birthDate: 6,
        prefecture: 7,
        city: 8,
        address: 9,
        bldg: 10,
        domicilePrefecture: 11,
        domicileCity: 12,
        domicileAddress: 13,
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => 
            i !== Decedent.idxs.name &&
            i !== Decedent.idxs.deathYear &&
            i != Decedent.idxs.deathMonth &&
            i !== Decedent.idxs.birthYear &&
            i !== Decedent.idxs.birthMonth &&
            i !== Decedent.idxs.prefecture &&
            i !== Decedent.idxs.city &&
            i !== Decedent.idxs.domicilePrefecture &&
            i !== Decedent.idxs.domicileCity &&
            i !== Decedent.idxs.bldg
        );
        decedents.push(this);
    }
}
const decedent = new Decedent("id_decedent-0-fieldset");

//登記簿上の氏名住所
const registryNameAndAddresses = [];
class RegistryNameAndAddress extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        name: 0,
        prefecture: 1,
        city: 2,
        address: 3,
        bldg: 4,
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => i !== RegistryNameAndAddress.idxs.bldg
        );
        registryNameAndAddresses.push(this);
    }
}
const registryNameAndAddress = new RegistryNameAndAddress("id_registry_name_and_address-0-fieldset");

const addRegistryAddressButton = document.getElementById("addRegistryAddressButton");
const removeRegistryAddressButton = document.getElementById("removeRegistryAddressButton");

//配偶者又は尊属
const heirs = [];
class SpouseOrAscendant extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        name: 0,
        deathYear: 1,
        deathMonth: 2,
        deathDate: 3,
        birthYear: 4,
        birthMonth: 5,
        birthDate: 6,
        isAcquire: [7, 8],
        prefecture: 9,
        city: 10,
        address: 11,
        bldg: 12,
        isRefuse: 13,
        isJapan: 14,
        objectId: 15,
        idAndContentType: 16
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        const heirsDeathDateStyle = window.getComputedStyle(this.fieldset.getElementsByClassName("heirsDeathDateDiv")[0]);
        if(heirsDeathDateStyle.display === "none"){
            this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                (_, i) =>
                i !== SpouseOrAscendant.idxs.name &&
                i !== SpouseOrAscendant.idxs.deathYear &&
                i !== SpouseOrAscendant.idxs.deathMonth &&
                i !== SpouseOrAscendant.idxs.deathDate &&
                i !== SpouseOrAscendant.idxs.bldg &&
                i !== SpouseOrAscendant.idxs.prefecture &&
                i !== SpouseOrAscendant.idxs.city &&
                i !== SpouseOrAscendant.idxs.address &&
                i !== SpouseOrAscendant.idxs.isRefuse &&
                i !== SpouseOrAscendant.idxs.isJapan &&
                i !== SpouseOrAscendant.idxs.objectId &&
                i !== SpouseOrAscendant.idxs.idAndContentType
            );
        }else{
            this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                (_, i) =>
                i !== SpouseOrAscendant.idxs.name &&
                i !== SpouseOrAscendant.idxs.isAcquire[yes] &&
                i !== SpouseOrAscendant.idxs.isAcquire[no] &&
                i !== SpouseOrAscendant.idxs.bldg &&
                i !== SpouseOrAscendant.idxs.prefecture &&
                i !== SpouseOrAscendant.idxs.city &&
                i !== SpouseOrAscendant.idxs.address &&
                i !== SpouseOrAscendant.idxs.isRefuse &&
                i !== SpouseOrAscendant.idxs.isJapan &&
                i !== SpouseOrAscendant.idxs.objectId &&
                i !== SpouseOrAscendant.idxs.idAndContentType
            );
        }
        if(this.inputs[SpouseOrAscendant.idxs.prefecture].parentElement.style.display === "none"){
            this.inputs[SpouseOrAscendant.idxs.address].placeholder = "アメリカ合衆国ニューヨーク州ニューヨーク市";
            this.inputs[SpouseOrAscendant.idxs.bldg].placeholder = "３４ストリートダブリュ２０";
        }
        heirs.push(this);
    }
}

class DescendantOrCollateral extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        name: 0,
        deathYear: 1,
        deathMonth: 2,
        deathDate: 3,
        birthYear: 4,
        birthMonth: 5,
        birthDate: 6,
        isAcquire: [7, 8],
        prefecture: 9,
        city: 10,
        address: 11,
        bldg: 12,
        otherParentsName: 13,
        isRefuse: 14,
        isJapan: 15,
        isAdult: 16,
        objectId1: 17,
        idAndContentType: 18
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        const heirsDeathDateStyle = window.getComputedStyle(this.fieldset.getElementsByClassName("heirsDeathDateDiv")[0]);
        const otherParentDivStyle = window.getComputedStyle(this.fieldset.getElementsByClassName("otherParentDiv")[0]);
        if(heirsDeathDateStyle.display === "none"){
            if(otherParentDivStyle.display !== "none"){
                this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                    (_, i) =>
                    i !== DescendantOrCollateral.idxs.name &&
                    i !== DescendantOrCollateral.idxs.deathYear &&
                    i !== DescendantOrCollateral.idxs.deathMonth &&
                    i !== DescendantOrCollateral.idxs.deathDate &&
                    i !== DescendantOrCollateral.idxs.bldg &&
                    i !== DescendantOrCollateral.idxs.prefecture &&
                    i !== DescendantOrCollateral.idxs.city &&
                    i !== DescendantOrCollateral.idxs.address &&
                    i !== DescendantOrCollateral.idxs.isRefuse &&
                    i !== DescendantOrCollateral.idxs.isJapan &&
                    i !== DescendantOrCollateral.idxs.isAdult &&
                    i !== DescendantOrCollateral.idxs.objectId1 &&
                    i !== DescendantOrCollateral.idxs.idAndContentType
                    );
            }else{
                this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                    (_, i) =>
                    i !== DescendantOrCollateral.idxs.name &&
                    i !== DescendantOrCollateral.idxs.deathYear &&
                    i !== DescendantOrCollateral.idxs.deathMonth &&
                    i !== DescendantOrCollateral.idxs.deathDate &&
                    i !== DescendantOrCollateral.idxs.bldg &&
                    i !== DescendantOrCollateral.idxs.prefecture &&
                    i !== DescendantOrCollateral.idxs.city &&
                    i !== DescendantOrCollateral.idxs.address &&
                    i !== DescendantOrCollateral.idxs.otherParentsName &&
                    i !== DescendantOrCollateral.idxs.isRefuse &&
                    i !== DescendantOrCollateral.idxs.isJapan &&
                    i !== DescendantOrCollateral.idxs.isAdult &&
                    i !== DescendantOrCollateral.idxs.objectId1 &&
                    i !== DescendantOrCollateral.idxs.idAndContentType
                );
            }
        }else{
            if(otherParentDivStyle.display !== "none"){
                this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                    (_, i) =>
                    i !== DescendantOrCollateral.idxs.name &&
                    i !== DescendantOrCollateral.idxs.isAcquire[yes] &&
                    i !== DescendantOrCollateral.idxs.isAcquire[no] &&
                    i !== DescendantOrCollateral.idxs.bldg &&
                    i !== DescendantOrCollateral.idxs.prefecture &&
                    i !== DescendantOrCollateral.idxs.city &&
                    i !== DescendantOrCollateral.idxs.address &&
                    i !== DescendantOrCollateral.idxs.isRefuse &&
                    i !== DescendantOrCollateral.idxs.isJapan &&
                    i !== DescendantOrCollateral.idxs.isAdult &&
                    i !== DescendantOrCollateral.idxs.objectId1 &&
                    i !== DescendantOrCollateral.idxs.idAndContentType
                    );
            }else{
                this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                    (_, i) =>
                    i !== DescendantOrCollateral.idxs.name &&
                    i !== DescendantOrCollateral.idxs.isAcquire[yes] &&
                    i !== DescendantOrCollateral.idxs.isAcquire[no] &&
                    i !== DescendantOrCollateral.idxs.bldg &&
                    i !== DescendantOrCollateral.idxs.prefecture &&
                    i !== DescendantOrCollateral.idxs.city &&
                    i !== DescendantOrCollateral.idxs.address &&
                    i !== DescendantOrCollateral.idxs.otherParentsName &&
                    i !== DescendantOrCollateral.idxs.isRefuse &&
                    i !== DescendantOrCollateral.idxs.isJapan &&
                    i !== DescendantOrCollateral.idxs.isAdult &&
                    i !== DescendantOrCollateral.idxs.objectId1 &&
                    i !== DescendantOrCollateral.idxs.idAndContentType
                );
            }
        }
        if(this.inputs[DescendantOrCollateral.idxs.prefecture].parentElement.style.display === "none"){
            this.inputs[DescendantOrCollateral.idxs.address].placeholder = "アメリカ合衆国ニューヨーク州ニューヨーク市";
            this.inputs[DescendantOrCollateral.idxs.bldg].placeholder = "３４ストリートダブリュ２０";
        }
        heirs.push(this);
    }
}

const heirsCorrectBtn = document.getElementById("heirsCorrectBtn");
const heirsOkBtn = document.getElementById("heirsOkBtn");

//遺産分割の方法
const typeOfDivisions = [];
class TypeOfDivision extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        typeOfDivision:{form: 0, input:[0, 1]},
        propertyAllocation:{form: 1, input:[2, 3]},
        contentType1:{form: 2, input:4},
        objectId1:{form: 3, input:5},
        cashAllocation:{form: 4, input:[6, 7, 8]},
        allCashAcquirer:{form: 5, input:9},
        contentType2:{form: 6, input:10},
        objectId2:{form: 7, input:11}
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => TypeOfDivision.idxs.typeOfDivision.input.includes(i)
        );
        typeOfDivisions.push(this);
    }
}

//不動産の数
const numberOfProperties = [];
class NumberOfProperties extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        land: 0,
        house: 1,
        bldg: 2,
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.decreaseBtn = Array.from(this.fieldset.getElementsByClassName("decreaseBtn"));
        this.increaseBtn = Array.from(this.fieldset.getElementsByClassName("increaseBtn"));
        numberOfProperties.push(this);
    }
}

//土地情報
const lands = [];
class Land extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        number:{form: 0, input: 0},
        address:{form: 1, input: 1},
        landNumber:{form: 2, input: [2,3,4]},
        purparty:{form: 3, input: [5,6,7,8]},
        office:{form: 4, input: 9},
        price:{form: 5, input: 10},
        isExchange:{form:6, input: [11, 12]},
        index:{form:7, input:13},
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input")).filter(
            (_, i) =>
            i !== Land.idxs.landNumber.input[other] &&
            i !== Land.idxs.landNumber.input[no] &&
            i !== Land.idxs.purparty.input[yes] &&
            i !== Land.idxs.purparty.input[other2] &&
            i !== Land.idxs.index.input
        );
        lands.push(this);
        this.tempLandAcquirers = [];
        this.tempLandCashAcquirers = [];
        this.landAcquirers = [];
        this.landCashAcquirers = [];
    }

    addTempLandAcquirer(acquirer){
        this.tempLandAcquirers.push(acquirer);
    }
    addTempLandCashAcquirer(acquirer){
        this.tempLandCashAcquirers.push(acquirer);
    }
    addLandAcquirer(acquirer){
        this.landAcquirers.push(acquirer);
    }
    addLandCashAcquirer(acquirer){
        this.landCashAcquirers.push(acquirer);
    }
}

//不動産取得者又は金銭取得者の仮フォーム
class TempAcquirer extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        acquirer:{form:0, input:0},
        percentage:{form:1, input:[1, 2]},
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId, instance){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.belongsTo = instance;
    }
}

class Acquirer{
    //入力欄のインデックス
    static idxs = {
        contentType2: 0,
        objectId2: 1,
        percentage: 2,
        target: 3,
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        this.fieldset = document.getElementById(fieldsetId);
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
    }
}

//金銭取得者を追加するボタンと削除ボタン
//前の土地に戻るボタンと次の土地へ進むボタン
const landCorrectBtn = document.getElementById("landCorrectBtn");
const landOkBtn = document.getElementById("landOkBtn");

//修正するボタンと次の項目へボタン
const correctBtn = document.getElementById("correctBtn");
const okBtn = document.getElementById("okBtn");
const statusText = document.getElementById("statusText");
//２を修正するボタンと４へ進むボタン
const preBtn = document.getElementById("preBtn");

/**
 * インスタンスの属性値を変数化する
 * @param {Fieldset} instance 
 * @returns 
 */
function fieldDataToVariable(instance){
    return{
        fieldset : instance.fieldset,
        Qs : instance.Qs,
        inputs : instance.inputs,
        errMsgEls : instance.errMsgEls,
        noInputs : instance.noInputs
    }
}

/**
 * 都道府県の値をチェック
 * @param {string} val 
 * @param {HTMLElement} el 
 * @returns 適正なときtrue、空欄のときfalse
 */
function checkPrefecture(val, el){
    if(val === ""){
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.disabled = true;
        return false;
    }
    return true;
}

/**
 * 次の項目へ進むボタンなど進む関連ボタンの有効化判別処理
 * @param {Fieldset} instance チェック対象のインスタンス
 */
function isActivateOkBtn(instance){
    const instanceVerified = instance.noInputs.length === 0;
    //被相続人情報のとき、被相続人と登記簿上の氏名・住所の両方のエラー要素がないとき次の項目へボタンを有効化する
    if(instance instanceof Decedent || instance instanceof RegistryNameAndAddress){
        okBtn.disabled = decedents.concat(registryNameAndAddresses).some(x => x.noInputs.length !== 0);
    }else if(instance instanceof SpouseOrAscendant || instance instanceof DescendantOrCollateral){
        //相続人情報のとき、最後の相続人でエラー要素がないとき次の項目へボタンを有効化する/他の相続人のエラー要素がないときは次の人へボタンを無効化する
        if(getLastElFromArray(heirs) === instance && instanceVerified)
            okBtn.disabled = false;
        else if(instanceVerified)
            heirsOkBtn.disabled = false;
    }else if(instance instanceof Land || instance instanceof TempAcquirer){
        /**
         * 取得割合の検証
         * @param {TempAcquirer} tempAcquirers 
         * @returns 
         */
        function isHundredPercent(tempAcquirers){
            //土地取得者仮フォームの検証で法定相続のとき又は金銭取得者仮フォームの検証で法定相続のとき、trueを返す(取得割合の検証不要)
            const fieldsetId = tempAcquirers[0].fieldset.id;
            const TODInputs = typeOfDivisions[0].inputs;
            const TODIdxs = TypeOfDivision.idxs;
            if(fieldsetId.includes("temp_land_acquirer-") && TODInputs[TODIdxs.propertyAllocation.input[yes]].checked ||
            fieldsetId.includes("temp_land_cash_acquirer") && TODInputs[TODIdxs.cashAllocation.input[no]].checked)
                return true;
            //法定相続ではないとき、対象の全仮フォームをチェックして取得割合を取得する
            const percentageIdxs = TempAcquirer.idxs.percentage.input;
            let percentage = 0;
            tempAcquirers.forEach(x =>{
                const inputs = x.inputs;
                percentage += parseInt(ZenkakuToHankaku(inputs[percentageIdxs[no]].value)) / parseInt(ZenkakuToHankaku(inputs[percentageIdxs[yes]].value));
            })
            //取得割合が１を超えるとき、分子を空欄にしてエラーメッセージを表示する
            if(percentage > 1){
                const top = instance.inputs[percentageIdxs[no]];
                top.value = "";
                const msg = "取得割合の合計は１になるように入力してください";
                afterValidation("false", instance.errMsgEls[TempAcquirer.idxs.percentage.form], msg, top, instance);
                return false;
            }else if(percentage === 1){
                //１のときtrueを返す
                return true;
            }else{
                //１未満のときfalseを返す
                return false;
            }
        }
        /**
         * 土地情報の検証
         * @param {Land} land 
         */
        function verifyLandSection(land){
            const landVerified = land.noInputs.length === 0;
            const TLAs = land.tempLandAcquirers;
            const TLAsPurpartyVerified = isHundredPercent(TLAs);
            const TLAVerified = getLastElFromArray(TLAs).noInputs.length === 0;
            const TLCAs = land.tempLandCashAcquirers;
            const TLCAsPurpartyVerified = land.inputs[Land.idxs.isExchange.input[yes]].checked ? isHundredPercent(TLCAs): true;
            const TLCAVerified = getLastElFromArray(TLCAs).noInputs.length === 0;
            //最後の土地情報、かつ土地のエラーなし、かつ土地取得者仮フォームと金銭取得者仮フォームのエラーと取得割合が１分の１になっているとき
            if(getLastElFromArray(lands) === land && landVerified && TLAVerified && TLAsPurpartyVerified && TLCAVerified && TLCAsPurpartyVerified){
                //次の土地へボタンを無効化する、次の項目へボタンを有効化する
                landOkBtn.disabled = true;
                okBtn.disabled = false;
            }else if(landVerified && TLAVerified && TLAsPurpartyVerified && TLCAVerified && TLCAsPurpartyVerified){
                //土地のエラーなし、かつ土地取得者仮フォームと金銭取得者仮フォームのエラーと取得割合が１分の１になっているとき、次の土地へボタンを有効化する
                landOkBtn.disabled = false;
            }else{
                //検証が通らないインスタンスがあるとき、次の土地へボタンと次の項目へボタンを無効化する
                landOkBtn.disabled = true;
                okBtn.disabled = true;
            }
            //仮取得者のフォームエラーなし、かつ取得割合が１分の１ではないとき、不動産取得者の追加ボタンを有効化する
            const isTLAsAllSelected = TLAs[0].inputs[TempAcquirer.idxs.acquirer.input].options.length - 1 === TLAs.length;
            const TLAAddBtn = getLastElFromArray(TLAs).fieldset.nextElementSibling.getElementsByClassName("addTempLandAcquirerBtn")[0];
            TLAAddBtn.disabled = TLAVerified && !TLAsPurpartyVerified && !isTLAsAllSelected ? false: true;
            const isTLCAsAllSelected = TLCAs[0].inputs[TempAcquirer.idxs.acquirer.input].options.length - 1 === TLCAs.length;
            const TLCAAddBtn = getLastElFromArray(TLCAs).fieldset.nextElementSibling.getElementsByClassName("addTempLandCashAcquirerBtn")[0];
            TLCAAddBtn.disabled = TLCAVerified && !TLCAsPurpartyVerified && !isTLCAsAllSelected ? false: true;
        }
        //土地情報を検証して各ボタンの有効化判別
        verifyLandSection(instance instanceof Land ? instance: instance.belongsTo);
    }else{
        //その他の欄のとき、インスタンスの検証が通れば次の項目へボタンを有効化する
        if(instanceVerified)
            okBtn.disabled = false;
    }
}

/**
 * 選択された都道府県に存在する市区町村を取得する
 * @param {string} val 都道府県欄の値
 * @param {HTMLElement} el 市区町村欄
 * @param {Fieldset} instance インスタンス
 * @returns 
 */
async function getCityData(val, el, instance){
    //未選択のとき、市町村データを全て削除して無効化する
    if(!checkPrefecture(val, el))
        return;
    //エラー要素から都道府県を削除する
    instance.noInputs = instance.noInputs.filter(x => x.id !== el.id);
    //市区町村欄を有効化してフォーカスを移動する
    el.disabled = false;
    //データ取得中ツールチップを表示する
    const verifyingEl = `<div id="${el.id}_verifyingEl" class="verifying emPosition" style="z-index: 100; position: absolute;">
    市区町村データ取得中
    <div class="spinner-border text-white spinner-border-sm" role="status">
    </div>
    </div>`;
    el.insertAdjacentHTML('afterend', verifyingEl);
    //都道府県に紐づく市区町村データを取得して表示できるようにする
    const url = 'get_city';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({"prefecture" : val}),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    }).then(response => {
        //エラーメッセージを表示する要素
        const errorMessageEl = document.getElementById(`${el.id}_message`);
        //取得できたとき
        if(response.city !== ""){
            //市区町村データ
            let option = "";
            //東京都以外の区は表示しない
            for(let i = 0, len = response.city.length; i < len; i++){
                if(response.city[i]["id"].slice(0, 2) !== "13" && response.city[i]["name"].slice(-1) === "区") continue;
                option += `<option value="${response.city[i]["name"]}">${response.city[i]["name"]}</option>`;
            }
            //市区町村データを表示して、エラーメッセージを非表示にする
            el.innerHTML = option;
            errorMessageEl.style.display = "none";
        }else{
            //取得できなかったときは、エラーメッセージを表示してエラー要素として市区町村要素を取得する
            errorMessageEl.style.display = "block";
            instance.noInputs.push(el);
        }
    }).catch(error => {
        console.log("getCityDataの処理でエラーが発生しました");
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        isActivateOkBtn(instance);
    });
}

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
 */
function getDecedentCityData(){
    const url = 'get_decedent_city_data';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        if(response.city !== ""){
            decedent.inputs[Decedent.idxs.city].value = response.city;
        }
        if(response.domicileCity !== ""){
            decedent.inputs[Decedent.idxs.domicileCity].value = response.domicileCity;
        }
    }).catch(error => {
        console.log("getDecedentCityDataの処理でエラーが発生しました");
        console.log(error);
    }).finally(()=>{
    });
}

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
 * @returns 登記簿上の住所が格納された配列
 */
function getRegistryNameAndAddressCityData(){
    const url = 'get_registry_name_and_address_city_data';
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        return response.citys;
    }).catch(error => {
        console.log("getRegistryNameAndAddressCityDataの処理でエラーが発生しました");
        console.log(error);
    });
}

/**
 * 全相続人の住所データを取得する
 * @returns 相続人の住所が格納された配列
 */
function getHeirsCityData(){
    const url = 'get_heirs_city_data';
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        return response.datas;
    }).catch(error => {
        console.log("getHeirsCityDataの処理でエラーが発生しました");
        console.log(error);
    });
}

/**
 * 相続人情報のデータを復元する
 */
async function loadHeirsData(){
    const heirsCityDatas = await getHeirsCityData();
    //各相続人のインスタンスをループ処理
    for(const heir of heirs){
        //各インプット要素の入力状況に応じてエラー要素を削除する
        const inputs = heir.inputs;
        const idxs = heir.constructor.idxs;
        for(let i = 0, len = inputs.length; i < len; i++){
            //隠しインプット以降の処理は不要
            if(i === idxs.isRefuse)
                break;

            //不動産を取得するラジオボタン欄のとき
            if(idxs.isAcquire.includes(i)){
                if(inputs[i].checked)
                    inputs[i].dispatchEvent(new Event("change"));
            }else if(i === idxs.city){
                const cityData = heirsCityDatas.find(x => String(x[0]) + "_" + x[1] === inputs[idxs.idAndContentType].value);
                //市区町村欄のとき
                if(cityData){
                    inputs[i].value = cityData[2];
                }
            }else{
                //それ以外の欄のとき、値があればエラー要素から削除する
                if(inputs[i].value !== "")
                    heir.noInputs = heir.noInputs.filter(x => x !== inputs[i]);
                if(i === idxs.prefecture)
                    await getCityData(inputs[i].value, inputs[i + 1], heir);
            }
        }
        //該当の相続人のデータを反映後にボタンの有効判別
        isActivateOkBtn(heir);
        if(okBtn.disabled === false)
            handleOkBtnEvent();
        if(heirsOkBtn.disabled === false)
            handleHeirsOkBtnEvent();
    }
}

/**
 * ユーザーのデータを取得する
 */
async function loadData(){
    //被相続人データを反映
    let idxs = Decedent.idxs;
    for(let i = 0, len = decedent.inputs.length; i < len; i++){
        const input = decedent.inputs[i];
        //データがあるとき
        if(input.value !== ""){
            //エラー要素から削除する
            decedent.noInputs = decedent.noInputs.filter(x => x.id !== input.id)
            //都道府県のとき、市区町村データを取得する
            if([idxs.prefecture, idxs.domicilePrefecture].includes(i))
                await getCityData(input.value, decedent.inputs[i + 1], decedent);
            else if([idxs.city, idxs.domicileCity].includes(i))
                getDecedentCityData();
        }
    }

    //登記簿上の氏名住所のデータを反映する
    const RNAACount = document.getElementsByClassName("registryNameAndAddressFieldset").length;
    //フォーム分のインスタンスを生成する（１つはすでに生成されているため1からスタート）
    for(let i = 1; i < RNAACount; i++){
        new RegistryNameAndAddress(`id_registry_name_and_address-${i}-fieldset`);
    }
    //市区町村データ以外を反映させる
    idxs = RegistryNameAndAddress.idxs;
    for(let i = 0; i < RNAACount; i++){
        const instance = registryNameAndAddresses[i];
        for(let j = 0, len = instance.inputs.length; j < len; j++){
            const input = instance.inputs[j];
            if(input.value != ""){
                //都道府県のとき、市区町村データを取得する
                if(j === idxs.prefecture)
                    await getCityData(input.value, instance.inputs[idxs.city], instance);
                //入力データがあるとき、エラー要素から削除する
                instance.noInputs = instance.noInputs.filter(x => x.id !== input.id)
            }
        }
    }
    //市区町村データを反映させる
    getRegistryNameAndAddressCityData().then(citys => {
        if(citys.length > 0){
            for(let i = 0, len = citys.length; i < len; i++){
                registryNameAndAddresses[i].inputs[idxs.city].value = citys[i];
            }
        }
    })
    //全て入力されているとき、相続人情報欄を表示する
    const isDecedentSectionVerified = !decedents.concat(registryNameAndAddresses).some(x => x.noInputs.length !== 0);
    if(isDecedentSectionVerified)
        handleOkBtnEvent();
    else
        return;

    //相続人情報を反映する
    await loadHeirsData();

    //遺産分割方法を反映する
    //不動産の数を反映する
    //土地情報を反映する
    //建物情報を反映する
    //区分建物情報を反映する
    //申請情報を反映する
}

/**
 * 初期表示時の処理
 * 
 */
async function initialize(){
    //サイドバーを更新
    updateSideBar();
    //入力状況に合わせた表示にする
    await loadData();
    //最初は被相続人の氏名にフォーカスする
    decedent.inputs[Decedent.idxs.name].focus();
    //全input要素にenterを押したことによるPOSTが実行されないようにする
    disableEnterKeyForInputs();
    //被相続人のinputにイベントを設定
    setDecedentEvent();
    //登記簿上の氏名住所のinputにイベントを設定
    setRegistryNameAndAddressEvent(registryNameAndAddresses[0]);
}

/**
 * 日付要素を更新する
 * @param {string} id 
 * @param {number} days
 */
function updateDate(id, days){
    const select = document.getElementById(id);
    const selectedValue = select.value;
    select.innerHTML = "";
    
    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.text = "---------";
    select.appendChild(firstOption);

    let valueExist = false;

    for (let i = 1; i <= days; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.text = i;
      if (i == selectedValue) {
        option.selected = true;
        valueExist = true;
      }
      select.appendChild(option);
    }

    // 選択中だったdaysが存在しない場合、valueが1のものを選択状態にする。ただし、"---------"が選択中の場合はそのままにする
    if (!valueExist && days > 0 && selectedValue !== "") {
        select.children[1].selected = true;
    }
}

/**
 * 死亡年月日が生年月日より先になってないかチェック
 * @param {Fieldset} instance 
 */
function checkBirthAndDeathDate(instance){
    let birth_year;
    let birth_month;
    let birth_date;
    let death_year;
    let death_month;
    let death_date;
    //生年月日と死亡年月日が入力されているか確認
    for(let i = 0, len = instance.inputs.length; i < len; i++){
        if(instance.inputs[i].id.includes("birth") || instance.inputs[i].id.includes("death")){
            if(!instance.inputs[i].value)
                return;
        }

        if(instance.inputs[i].id.includes("birth_year")){
            birth_year = instance.inputs[i].value.substring(0, 4);
        }else if(instance.inputs[i].id.includes("birth_month")){
            birth_month = instance.inputs[i].value;
        }else if(instance.inputs[i].id.includes("birth_date")){
            birth_date = instance.inputs[i].value;
        }else if(instance.inputs[i].id.includes("death_year")){
            death_year = instance.inputs[i].value.substring(0, 4);
        }else if(instance.inputs[i].id.includes("death_month")){
            death_month = instance.inputs[i].value;
        }else if(instance.inputs[i].id.includes("death_date")){
            death_date = instance.inputs[i].value;
        }
    } 
    //入力されているとき生年月日と死亡年月日が逆転してないか確認する
    if(birth_year && death_year){
        if(birth_year > death_year){
            return false;
        }else if(birth_year == death_year){
            if(birth_month && death_month){
                if(birth_month > death_month){
                    return false;
                }else if(birth_month == death_month){
                    if(birth_date && death_date){
                        if(birth_date > death_date){
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

/**
 * 生年月日チェック
 */
function checkBirthDate(instance){
    //配偶者、尊属又は卑属、兄弟姉妹で成人か不明なとき
    if(instance.constructor.name === "SpouseOrAscendant" ||
        (instance.constructor.name === "DescendantOrCollateral" && instance.inputs[DescendantOrCollateral.idxs.isAdult] === null)){
        return
    }
    let year;
    let month;
    let date;
    for(let i = 0, len = instance.inputs.length; i < len; i++){
        const input = instance.inputs[i];
        if(input.id.includes("birth_year")){
            if(input.value)
                year = input.value.substring(0, 4);
            else
                return;
        }else if(input.id.includes("birth_month")){
            if(input.value)
                month = input.value;
            else
                return;
        }else if(input.id.includes("birth_date")){
            if(input.value)
                date = input.value;
            else
                return;
        }
    }

    if(instance.constructor.name === "DescendantOrCollateral"){
        let today = new Date();
        let birthDate = new Date(year, month - 1, date);
        let age = today.getFullYear() - birthDate.getFullYear();
        let m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        //成人チェック
        if(instance.inputs[DescendantOrCollateral.idxs.isAdult].value === "True"){
            if(age < 20)
                return "１．では成人と入力されてました。<br>未成年である場合は、必要書類が変わることがあるため、先に１．の入力を修正してください。";
        }
        //未成年チェック
        if(instance.inputs[DescendantOrCollateral.idxs.isAdult].value === "False"){
            if(age >= 20)
                return "１．では未成年と入力されてました。<br>成人である場合は、必要書類が変わることがあるため、先に１．の入力を修正してください。";
        }

    }
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {elemet} el チェック対象の要素
 */
function decedentValidation(el){
    const inputs = decedent.inputs;
    const idxs = Decedent.idxs;
    const dateErrMsg = "死亡年月日は生年月日より後の日付にしてください";
    //氏名のときは全角チェック
    if(el === inputs[idxs.name]){
        return isOnlyZenkaku(el);
    }else if([inputs[idxs.deathYear], inputs[idxs.deathMonth]].includes(el)){
        //死亡年月欄のとき、日数を更新して死亡年月日と生年月日の矛盾チェック
        const days = getDaysInMonth(Number(inputs[idxs.deathYear].value.slice(0,4)), Number(inputs[idxs.deathMonth].value));
        updateDate("id_decedent-death_date", days);
        if(checkBirthAndDeathDate(decedent) === false)
            return dateErrMsg;
    }else if([inputs[idxs.birthYear], inputs[idxs.birthMonth]].includes(el)){
        //生年月欄のとき、日数を更新して死亡年月日と生年月日の矛盾チェック
        const days = getDaysInMonth(Number(inputs[idxs.birthYear].value.slice(0,4)), Number(inputs[idxs.birthMonth].value));
        updateDate("id_decedent-birth_date", days);
        if(checkBirthAndDeathDate(decedent) === false)
            return dateErrMsg;
    }else if([inputs[idxs.deathDate], inputs[idxs.birthDate]].includes(el)){
        //死亡日欄又は生日欄のとき、死亡年月日と生年月日の矛盾チェック
        if(checkBirthAndDeathDate(decedent) === false)
            return dateErrMsg;
    }

    //空欄チェック
    const blankCheck = isBlank(el);
    return blankCheck !== false ? blankCheck: true;
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {number} idx 要素のインデックス
 * @param {elemet} el チェック対象の要素
 */
function registryNameAndAddressValidation(idx, el){
    const idxs = RegistryNameAndAddress.idxs;
    //氏名のときは全角チェック
    if(idx === idxs.name){
        return isOnlyZenkaku(el);
    }else if([idxs.prefecture, idxs.city].includes(idx)){
        //都道府県又は市区町村のとき、空欄チェック
        return isBlank(el);
    }
    //空欄チェック
    const blankCheck = isBlank(el);
    return blankCheck !== false ? blankCheck: true;
}

/**
 * エラー配列に対象のエラー要素がないとき追加する
 * @param {Fieldset} instance 対象のインスタンス
 * @param {HTMLElement} el 対象のエラー要素
 */
function pushInvalidEl(instance, el){
    if(!instance.noInputs.some(input => input.id === el.id)){
        instance.noInputs.push(el);
        if(instance instanceof SpouseOrAscendant || instance instanceof DescendantOrCollateral)
            heirsOkBtn.disabled = true;
        else if(instance instanceof Land)
            landOkBtn.disabled = true;
        okBtn.disabled = true;
    }
}

/**
 * 全角入力欄のinputイベントハンドラー
 * @param {Fieldset} instance 対象の人
 * @param {HTMLElement} el 全角入力欄
 */
function handleFullWidthInput(instance, el){
    //全角チェック
    isValid = isOnlyZenkaku(el)
    //全角のとき
    if(typeof isValid === "boolean"){
        //エラー要素から削除
        instance.noInputs = instance.noInputs.filter(x => x.id !== el.id);
        //被相続人欄又は登記簿上の氏名と住所欄のとき
        isActivateOkBtn(instance);
    }else{
        //全角ではないとき、エラー要素を追加して次の項目へボタンを無効化する
        pushInvalidEl(instance, el);
    }
}

/**
 * チェック結果に応じて処理を分岐する
 * @param {boolean|string} isValid チェック結果
 * @param {HTMLElement} errMsgEl エラーメッセージを表示する要素
 * @param {boolean|string} message エラーメッセージ
 * @param {HTMLElement} el チェック対象の要素
 * @param {Fieldset} instance 対象のインスタンス
 */
function afterValidation(isValid, errMsgEl, message, el, instance){
    //エラー要素から削除
    instance.noInputs = instance.noInputs.filter(x => x.id !== el.id);
    //チェック結果がtrueのとき
    if(typeof isValid === "boolean"){
        //エラーメッセージを隠す
        errMsgEl.style.display = "none";
        //次の項目へ進むボタンの有効化判別
        isActivateOkBtn(instance);
    }else{
        //エラーメッセージを表示する
        errMsgEl.innerHTML = message;
        errMsgEl.style.display = "block";
        //建物名、地番の枝番以外の要素のとき
        if(!el.id.includes("bldg") && !el.id.includes("land_number_bottom")){
            //配列に取得
            instance.noInputs.push(el);
            //相続人情報のとき
            if(instance instanceof SpouseOrAscendant || instance instanceof DescendantOrCollateral){
                heirsOkBtn.disabled = true;
            }else if(instance instanceof Land || instance instanceof TempAcquirer){
                //土地又は取得者仮フォームのインスタンスのとき
                landOkBtn.disabled = true;
                if(instance instanceof TempAcquirer){
                    if(instance.fieldset.id.includes("temp_land_acquirer"))
                        instance.fieldset.nextElementSibling.getElementsByClassName("addTempLandAcquirerBtn")[0].disabled = true;
                    else
                        instance.fieldset.nextElementSibling.getElementsByClassName("addTempLandCashAcquirerBtn")[0].disabled = true;
                }
            }
            //次へのボタンを無効化
            okBtn.disabled = true;
        }
        el.value = "";
    }
}

/**
 * 被相続人欄にイベントを設定する
 */
function setDecedentEvent(){
    const inputs = decedent.inputs;
    const idxs = Decedent.idxs;
    //被相続人欄のinputにイベントを設定
    for(let i = 0, len = inputs.length; i < len; i++){
        //氏名欄のとき
        if(i === idxs.name){
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, inputs[i + 1]);
                //数字を無効化
                disableNumKey(e);
            })
            //inputイベント
            inputs[i].addEventListener("input", (e)=>{
                //全角チェック
                handleFullWidthInput(decedent, inputs[i]);
            })
        }else if([idxs.address, idxs.bldg].includes(i)){
            //住所の町域・番地又は住所の建物名のとき
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, inputs[i + 1]);
            })
        }else if(i === idxs.domicileAddress){
            //本籍の町域・番地のとき
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, registryNameAndAddress.inputs[RegistryNameAndAddress.idxs.name]);
            })
        }

        //全入力欄にchangeイベントを設定する
        inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = decedentValidation(el);
            //チェック結果に応じて処理を分岐
            afterValidation(isValid, decedent.errMsgEls[i], isValid, el, decedent);
            //建物名のエラーメッセージを非表示にする
            if(i !== idxs.bldg)
                decedent.errMsgEls[idxs.bldg].style.display = "none";
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if([idxs.prefecture, idxs.domicilePrefecture].includes(i)){
                const val = el.value;
                await getCityData(val, inputs[i + 1], decedent);
            }
        })
    }
}

/**
 * 登記簿上の氏名住所にイベントを設定する
 * @param {RegistryNameAndAddress} instance
 */
function setRegistryNameAndAddressEvent(instance){
    const inputs = instance.inputs;
    const idxs = RegistryNameAndAddress.idxs;
    //登記簿上の氏名住所のインスタンスの各インプット要素に対して処理
    for(let i = 0, len = inputs.length; i < len; i++){
        if(i === idxs.name){
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, inputs[i + 1]);
                //数字を無効化
                disableNumKey(e);
            })
            //inputイベント
            inputs[i].addEventListener("input", (e)=>{
                //入力文字によって
                handleFullWidthInput(instance, inputs[i]);
                if(registryNameAndAddresses.length > 9)
                    addRegistryAddressButton.disabled = true;
                else
                    addRegistryAddressButton.disabled = instance.noInputs.length === 0 ? false: true;
                okBtn.disabled = decedents.concat(registryNameAndAddresses).some(item => item.noInputs.length !== 0);
            })
        }

        //全入力欄にchangeイベントを設定する
        inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = registryNameAndAddressValidation(i, el);
            //チェック結果に応じて処理を分岐
            afterValidation(isValid, instance.errMsgEls[i], isValid, el, instance);
            //建物名のエラーメッセージを非表示にする
            if(i !== idxs.bldg)
                instance.errMsgEls[idxs.bldg].style.display = "none";
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if(i === idxs.prefecture){
                await getCityData(el.value, inputs[i + 1], instance);
            }
            if(registryNameAndAddresses.length > 9)
                addRegistryAddressButton.disabled = true;
            else
                addRegistryAddressButton.disabled = instance.noInputs.length === 0 ? false: true;
        })
    }
}

/**
 * クローンした要素の属性を更新する
 * @param {HTMLElement} clone 複製した要素
 * @param {string} att セレクタ 例"[id],[name],[for]"
 * @param {RegExp} regex 正規表現
 * @param {number} newIdx 新しいインデックス
 */
function updateAttribute(clone, att, regex, newIdx){
    clone.id = copyFrom.id.replace(regex, `$1${newIdx}`);
    const els = clone.querySelectorAll(att);
    els.forEach(el => {
        if(el.id)
            el.id = el.id.replace(regex, `$1${count}`);
        if(el.name)
            el.name = el.name.replace(regex, `$1${count}`);
        if(el.htmlFor)
            el.htmlFor = el.htmlFor.replace(regex, `$1${count}`);
    });       
}

/**
 * 登記簿上の氏名住所の追加ボタンのイベント設定処理
 */
function handleAddRegistryAddressButtonEvent(){
    //最後の登記上の氏名住所欄をコピーする
    const fieldsets = document.getElementsByClassName("registryNameAndAddressFieldset")
    const count = fieldsets.length;
    document.getElementById("id_registry_name_and_address-TOTAL_FORMS").value = String(count + 1);
    const copyFrom = getLastElFromArray(fieldsets);
    const clone = copyFrom.cloneNode(true);
    //コピー元のフィールドの建物名のエラー表示を非表示にする
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RegistryNameAndAddress.idxs.bldg].style.display = "none";
    //属性を更新する
    clone.querySelector("div").textContent = `（${hankakuToZenkaku(registryNameAndAddresses.length + 1)}）`
    const regex = /(registry_name_and_address-)\d+/;
    const att = "[id],[name],[for],span.cityEmPosition";
    updateAttribute(clone, att, regex, count);    
    //最後の要素の後にペーストする
    slideDown(copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling));
    //コピー元を無効化する
    copyFrom.disabled = true;
    //インスタンスを生成して初期化
    const newInstance = new RegistryNameAndAddress(clone.id);
    for(let i = 0, len = newInstance.inputs.length; i < len; i++){
        newInstance.inputs[i].value = "";
        if(i === RegistryNameAndAddress.idxs.city)
            newInstance.inputs[i].disabled = true;
    }
    //生成した要素にイベントを設定
    setRegistryNameAndAddressEvent(newInstance);
    //削除ボタンを有効化する
    removeRegistryAddressButton.disabled = false;
    //追加ボタンを無効化する
    addRegistryAddressButton.disabled = true;
    //次の項目へボタンを無効化する
    okBtn.disabled = true;
}

/**
 * 増減するフォームの削除ボタンに対する処理を設定する処理
 * @param {string} className 
 * @param {Fieldset[]} arr 
 * @param {HTMLButtonElement} addBtn 
 * @param {HTMLButtonElement} removeBtn 
 */
function handleRemoveRegistryAddressButton(className, arr, addBtn, removeBtn){
    //最後の要素を削除する
    const fieldsets = document.getElementsByClassName(className);
    const lastFieldset = getLastElFromArray(fieldsets);
    lastFieldset.remove();
    if(className === "registryNameAndAddressFieldset")
        document.getElementById("id_registry_name_and_address-TOTAL_FORMS").value = String(fieldsets.length - 1);
    arr.pop();
    getLastElFromArray(fieldsets).disabled = false;
    addBtn.disabled = false;
    //要素が１つになるとき、削除ボタンを無効化する
    if(fieldsets.length === 1)
        removeBtn.disabled = true;
    //次の項目へボタンの有効化判別処理
    okBtn.disabled = decedents.concat(registryNameAndAddresses).some(item => item.noInputs.length !== 0);
}

/**
 * 相続人情報のバリデーション
 * @param {HTMLElement} el 
 * @param {Fieldset} instance
 */
function heirsValidation(el, instance){
    const inputs = instance.inputs;
    const Sidxs = SpouseOrAscendant.idxs;
    const Didxs = DescendantOrCollateral.idxs;
    const dateErrMsg = "死亡年月日は生年月日より後の日付にしてください";
    //氏名又は前配偶者・異父母の氏名のとき、全角チェックの結果を返す
    if([inputs[Sidxs.name], inputs[Didxs.otherParentsName]].includes(el)){
        return isOnlyZenkaku(el);
    }else if([inputs[Sidxs.deathYear], inputs[Sidxs.deathMonth]].includes(el)){
        //死亡年月欄のとき、日数の更新と死亡年月日と生年月日の先後チェック
        const days = getDaysInMonth(Number(inputs[Sidxs.deathYear].value.slice(0,4)), Number(inputs[Sidxs.deathMonth].value));
        updateDate(inputs[Sidxs.deathDate].id, days);
        if(checkBirthAndDeathDate(instance) === false)
            return dateErrMsg;
    }else if([inputs[Sidxs.birthYear], inputs[Sidxs.birthMonth]].includes(el)){
        //生年月欄のとき、日数の更新と死亡年月日と生年月日の先後チェック
        const days = getDaysInMonth(Number(inputs[Sidxs.birthYear].value.slice(0,4)), Number(inputs[Sidxs.birthMonth].value));
        updateDate(inputs[Sidxs.birthDate].id, days);
        if(checkBirthAndDeathDate(instance) === false)
            return dateErrMsg;
        const result = checkBirthDate(instance);
        if(typeof result === "string")
            return result;
    }else if([inputs[Sidxs.deathDate], inputs[Sidxs.birthDate]].includes(el)){
        //死亡日又は生日のとき、死亡年月日と生年月日の矛盾チェック
        if(checkBirthAndDeathDate(instance) === false)
            return dateErrMsg;
        const result = checkBirthDate(instance);
        if(typeof result === "string")
            return result;
    }else if(el === inputs[Sidxs.isAcquire[yes]]){
        //不動産取得が「はい」のとき
        //不動産を取得する人がいない旨のエラーメッセージを非表示にする
        document.getElementById("statusArea").getElementsByClassName("errorMessage")[0].style.display = "none";
        //住所入力欄を表示して、住所欄をエラー要素に追加してtrueを返す
        slideDownAndScroll(instance.fieldset.getElementsByClassName("heirsAddressDiv")[0]);
        if(inputs[Didxs.prefecture].parentElement.style.display === "none")
            instance.noInputs = instance.noInputs.concat([inputs[Sidxs.address], inputs[Sidxs.bldg]]);
        else
            instance.noInputs = instance.noInputs.concat([inputs[Sidxs.prefecture], inputs[Sidxs.city], inputs[Sidxs.address]])
        return true;
    }else if(el === inputs[Sidxs.isAcquire[no]]){
        //不動産取得が「いいえ」のとき、住所欄を非表示・初期化にして、住所欄をエラー要素から削除してtrueを返す
        slideUp(instance.fieldset.getElementsByClassName("heirsAddressDiv")[0]);
        const addressInputs = [inputs[Sidxs.prefecture], inputs[Sidxs.city], inputs[Sidxs.address], inputs[Sidxs.bldg]];
        addressInputs.forEach(x => instance.noInputs = instance.noInputs.filter(item => item !== x));
        addressInputs.forEach(x => x.value = "");
        return true;
    }

    //空欄チェック
    const blankCheck = isBlank(el);
    return blankCheck !== false ? blankCheck: true;
}

/**
 * 相続人共通のイベントを設定
 * @param {Fieldset} instance //相続人のインスタンス
 */
function setHeirsEvent(instance){
    const inputs = instance.inputs;
    const SIdxs = SpouseOrAscendant.idxs;
    const DIdxs = DescendantOrCollateral.idxs;
    //インスタンスのinputにイベントを設定
    for(let i = 0, len = inputs.length; i < len; i++){
        //相続放棄、日本在住、成人情報はイベント設定不要
        if((instance instanceof SpouseOrAscendant && i === SIdxs.isRefuse) ||
        (instance instanceof DescendantOrCollateral && i === DIdxs.isRefuse))
            return;
        //氏名欄又は前配偶者又は異父母の氏名欄のとき
        if([SIdxs.name, DIdxs.otherParentsName].includes(i)){
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                if(i === SIdxs.name){
                    //enterで死亡年欄又は生年（次の入力欄）にフォーカス移動するイベントを設定する
                    if(instance.fieldset.getElementsByClassName("heirsDeathDateDiv")[0].style.display === "none")
                        setEnterKeyFocusNext(e, inputs[i + 4]);
                    else
                        setEnterKeyFocusNext(e, inputs[i + 1]);
                }
                //数字を無効化
                disableNumKey(e);
            })
            //inputイベント
            inputs[i].addEventListener("input", (e)=>{
                //入力文字によって
                handleFullWidthInput(instance, inputs[i]);
            })
        }else if(i === SIdxs.address || i === SIdxs.bldg){
            //住所の町域・番地又は住所の建物名のとき
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで次の入力欄にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, inputs[i + 1]);
            })
        }

        //全入力欄にchangeイベントを設定する
        inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得して各要素別のイベント設定又はバリデーションを行う
            const el = e.target;
            isValid = heirsValidation(el, instance);
            //不動産取得のラジオボタンではないとき
            if(i !== SIdxs.isAcquire[yes] && i !== SIdxs.isAcquire[no]){
                //チェック結果に応じて処理を分岐
                afterValidation(isValid, instance.errMsgEls[i], isValid, el, instance);
                //建物名のエラーメッセージを非表示にする
                if(i !== SIdxs.bldg)
                    //建物名のエラーメッセージを非表示にする
                    instance.errMsgEls[SIdxs.bldg].style.display = "none";
                if(i === SIdxs.prefecture){
                    //住所の都道府県のとき、市町村データを取得する
                    const val = el.value;
                    await getCityData(val, inputs[i + 1], instance);
                }
            }else{
                //不動産取得のラジオボタンのとき
                //エラー要素から削除
                instance.noInputs = instance.noInputs.filter(x => x.id !== inputs[SIdxs.isAcquire[yes]].id && x.id !== inputs[SIdxs.isAcquire[no]].id);
                //エラー要素がない、かつ、最後の相続人のとき次の項目へボタンを有効化する、次の人へボタンを無効化する
                if(instance.noInputs.length === 0 && getLastElFromArray(heirs) === instance){
                    okBtn.disabled = false;
                }else if(instance.noInputs.length === 0){
                    heirsOkBtn.disabled = false;
                }else{
                    heirsOkBtn.disabled = true;
                    okBtn.disabled = true;
                }
            }
        })
    }
}

/**
 * 相続人情報の前の人を修正するボタンのイベント設定処理
 */
function handleHeirsCorrectEvent(){
    //全相続人のインスタンスを最後の要素からループ処理
    for(let i = heirs.length - 1; 0 < i; i--){
        //インスタンスのフィールドセットが表示されているとき
        if(heirs[i].fieldset.style.display !== "none"){
            //該当のフィールドセットを非表示する
            slideUp(heirs[i].fieldset);
            //前の人のフィールドセットを有効化する
            heirs[i - 1].fieldset.disabled = false;
            //最後の人を表示するときは次の人へ進むボタンを無効化する
            if(i === 1)
                heirsCorrectBtn.disabled = true;
            //前の人を修正するボタンが無効化されているときは、有効化する
            heirsOkBtn.disabled = false;
            okBtn.disabled = true;

            return;
        }
    }
}

/**
 * 相続人情報の次の人へ進むボタンのイベント設定処理
 */
function handleHeirsOkBtnEvent(){
    //全相続人のインスタンスをループ処理
    for(let i = 0, len = heirs.length; i < len; i++){
        //インスタンスのフィールドセットが非表示のとき
        if(heirs[i].fieldset.style.display === "none"){
            //該当のフィールドセットを表示して氏名にフォーカス
            slideDownAndScroll(heirs[i].fieldset);
            heirs[i].fieldset.querySelector("input").focus();
            //前の人のフィールドセットを無効化する
            heirs[i - 1].fieldset.disabled = true;
            //最後の人を表示するときは次の人へ進むボタンを無効化する
            if(i === len - 1){
                heirsOkBtn.disabled = true;
                okBtn.disabled = heirs[i].noInputs.length === 0 ? false: true;
            }else{
                //表示する人のnoInputsの要素数が0のときは次の人へ進むボタンを有効化する
                heirsOkBtn.disabled = heirs[i].noInputs.length === 0 ? false: true;
            }

            //前の人を修正するボタンが無効化されているときは、有効化する
            heirsCorrectBtn.disabled = false;

            break;
        }
    }
}

/**
 * 一つ前のセクションに戻る
 */
function handleCorrectBtnEvent(){
    //全セクションタグを取得して最後の要素からループ処理
    const sections = document.getElementsByTagName("section");
    const heirsSectionIdx = 1;
    const typeOfDivisionSectionIdx = 2;
    for (let i = sections.length - 1; i >= 0; i--) {
        //表示されているとき
        if (window.getComputedStyle(sections[i]).display !== 'none') {
            /**
             * ・このセクションをスライドアップ
             * ・前のセクション内にある全フィールドセットを有効化
             * ・次の項目へ進むボタンを有効化
             * ・このセクションが相続人情報のとき前の項目を修正するボタンを無効化
             * ・このセクションが最後のセクションのとき４．へ進むボタンを無効化
             * ・ループを中止する
             */
            slideUp(sections[i]);
            const fieldsets = sections[i - 1].getElementsByTagName("fieldset");
            Array.from(fieldsets).forEach(x => x.disabled = false);
            okBtn.disabled = false;
            const preNum = sections[i - 1].querySelector("h5").textContent.trim().substring(0, 1);
            statusText.textContent = `現在${preNum}／５項目`;
            //被相続人情報に戻るとき、不動産取得者がいない旨のエラーメッセージを非表示にする、前の項目を修正するボタンを無効化する
            if(i === heirsSectionIdx){  
                okBtn.nextElementSibling.style.display = "none";
                correctBtn.disabled = true;
                addRegistryAddressButton.disabled = false;
            }
            //区分建物情報に戻るとき、４．進むボタンを無効化する
            if(i === sections.length - 1)
                submitBtn.disabled = true;
            //相続人情報に戻るとき、かつ相続人（故人を含む）が複数人いるとき
            if(i === typeOfDivisionSectionIdx && heirs.length > 1){
                heirsCorrectBtn.disabled = false;
                heirs.forEach(x =>{
                    if(x != getLastElFromArray(heirs)){
                        x.fieldset.disabled = true;
                    }
                })
            }
            break;
        }
    }
}

/**
 * 次の項目へ進むボタンのイベント設定処理の共通処理部分
 * @param {HTMLElement} nextSection 
 * @param {HTMLElement} preSection 
 * @param {number} index 
 */
function handleOkBtnEventCommon(nextSection, preSection, index){
    //スライドダウンする
    slideDownAndScroll(nextSection);
    //前のセクション内にあるフィールドセットを無効化する
    const preSectionFieldsets = Array.from(preSection.children).filter(child => child.tagName === 'FIELDSET');
    preSectionFieldsets.forEach(x => x.disabled = true);
    //ステータスを更新
    statusText.textContent = `現在${hankakuToZenkaku(index)}／５項目`;
}

/**
 * 死亡した子の相続人のフィールドセットの並び替えをする
 * @param {HTMLElement} section 
 */
function sortChildHeirsFieldset(section){
    // childSpouseFieldsetとgrandChildFieldsetの要素を取得
    let childSpouseFieldsets = Array.from(section.getElementsByClassName('childSpouseFieldset'));
    let grandChildFieldsets = Array.from(section.getElementsByClassName('grandChildFieldset'));

    // それぞれのフィールドセットのobject_idまたはobject_id1の値を取得して配列に格納
    childSpouseFieldsets = childSpouseFieldsets.map(fieldset => ({
        element: fieldset,
        id: parseInt(fieldset.querySelector('input[name*="object_id"]').value, 10),
        type: 'childSpouse'
    }));
    grandChildFieldsets = grandChildFieldsets.map(fieldset => ({
        element: fieldset,
        id: parseInt(fieldset.querySelector('input[name*="object_id1"]').value, 10),
        type: 'grandChild'
    }));

    // 2つの配列を結合
    let combined = childSpouseFieldsets.concat(grandChildFieldsets);

    // idでソート（若い順）。idが同じ場合はchildSpouseFieldsetを先にする
    combined.sort((a, b) => {
        if (a.id !== b.id) {
            return a.id - b.id;  // 若い順にソート
        } else {
            return a.type === 'childSpouse' ? -1 : 1;  // 同じidの場合はchildSpouseFieldsetを先に
        }
    });

    // ソートした結果に基づいてDOMを更新
    const toggleBtn = document.getElementById('heirsSectionToggleBtn');
    combined.forEach(x => {
        section.insertBefore(x.element, toggleBtn);
    });
}

/**
 * 相続人のインスタンスを生成する
 * @param {HTMLElement} fieldset 
 */
function createHeirsInstance(fieldset){
    const id = fieldset.id;
    //被相続人の配偶者のとき
    if(id.includes("decedent_spouse")){
        new SpouseOrAscendant("id_decedent_spouse-fieldset");
    }else if(id.includes("id_child-")){
        //子のとき
        const count = heirs.filter(item => item instanceof DescendantOrCollateral).length;
        new DescendantOrCollateral(`id_child-${count}-fieldset`);
    }else if(id.includes("id_child_spouse-")){
        //子の配偶者のとき
        const count = heirs.filter(item => item instanceof SpouseOrAscendant && item.fieldset.id.includes("id_child_spouse-")).length;
        new SpouseOrAscendant(`id_child_spouse-${count}-fieldset`);
    }else if(id.includes("id_grand_child-")){
        //孫のとき
        const count = heirs.filter(item => item instanceof DescendantOrCollateral && item.fieldset.id.includes("id_grand_child-")).length;
        new DescendantOrCollateral(`id_grand_child-${count}-fieldset`);
    }else if(id.includes("id_ascendant-")){
        //尊属のとき
        const count = heirs.filter(item => item instanceof SpouseOrAscendant && item.fieldset.id.includes("id_ascendant-")).length;
        new SpouseOrAscendant(`id_ascendant-${count}-fieldset`);
    }else if(id.includes("id_collateral-")){
        //兄弟姉妹のとき
        const count = heirs.filter(item => item instanceof DescendantOrCollateral && item.fieldset.id.includes("id_collateral-")).length;
        new DescendantOrCollateral(`id_collateral-${count}-fieldset`);
    }
}

/**
 * 相続人情報セクションを表示する処理
 */
function setHeirsSection(){
    const section = document.getElementById("heirs-section");
    //エラーメッセージを非表示にする
    decedent.errMsgEls[Decedent.idxs.bldg].style.display = "none";
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RegistryNameAndAddress.idxs.bldg].style.display = "none";
    //初めて相続人情報に進んだとき
    if(heirs.length === 0){
        //氏名にフォーカス
        section.querySelector("input").focus();
        //子の配偶者と孫のフィールドセットを並び替え
        sortChildHeirsFieldset(section);
        //全フィールドセットを取得してループ処理
        const fieldsets = section.getElementsByTagName("fieldset");
        for(let i = 0, len = fieldsets.length; i < len; i++){
            //相続人インスタンス生成
            createHeirsInstance(fieldsets[i]);
            //イベント設定
            setHeirsEvent(heirs[i]);
            //最初の人以外は非表示にする
            if(i > 0) fieldsets[i].style.display = "none";
        }
        //フォームセットのトータルフォームの値を更新する
        document.getElementById("id_child-TOTAL_FORMS").value = section.getElementsByClassName("childFieldset").length;
        document.getElementById("id_child_spouse-TOTAL_FORMS").value = section.getElementsByClassName("childSpouseFieldset").length;
        document.getElementById("id_grand_child-TOTAL_FORMS").value = section.getElementsByClassName("grandChildFieldset").length;
        document.getElementById("id_ascendant-TOTAL_FORMS").value = section.getElementsByClassName("ascendantFieldset").length;
        document.getElementById("id_collateral-TOTAL_FORMS").value = section.getElementsByClassName("collateralFieldset").length;
        //次の項目へボタンを無効化する
        okBtn.disabled = true;
    }else{
        //次の項目へボタンの有効化判別
        okBtn.disabled = getLastElFromArray(heirs).noInputs.length === 0 ? false: true;
    }
}

/**
 * 相続人情報セクションをチェックする
 */
function checkHeirsSection(){
    //全相続人のインスタンスに対してループ処理
    for(let i = 0, len = heirs.length; i < len; i++){
        //不動産を取得する人がいるときは、処理を中止
        if(heirs[i].constructor.name === "SpouseOrAscendant"){
            if(heirs[i].inputs[SpouseOrAscendant.idxs.isAcquire[yes]].checked){
                return true;
            }
        }else if(heirs[i].constructor.name === "DescendantOrCollateral"){
            if(heirs[i].inputs[DescendantOrCollateral.idxs.isAcquire[yes]].checked){
                return true;
            }
        }
    }
    //不動産を取得する人がいないとき、その旨エラーメッセージを表示する
    const errEl = document.getElementById("statusArea").getElementsByClassName("errorMessage")[0];
    errEl.style.display = "";
    errEl.innerHTML = "不動産を取得する人がいないため先に進めません。<br>一人以上が不動産を取得する必要があります。"
    return false;
}

/**
 * 金銭を全て取得する人の選択肢に全相続人を追加する
 * @param {TypeOfDivision} instance 
 */
function addAllHeirsToCashAcquirerSelect(instance){
    //金銭の全取得者セレクトタグ
    const allCashAcquirer = instance.inputs[TypeOfDivision.idxs.allCashAcquirer.input];
    //全相続人に対してループ処理
    heirs.forEach(x => {
        //不動産取得について「する」又は「しない」のいずれかが選択されているとき（相続人のとき）
        if(SpouseOrAscendant.idxs.isAcquire.some(idx => x.inputs[idx].checked)){
            if(x instanceof SpouseOrAscendant)
                allCashAcquirer.add(createOption(x.inputs[SpouseOrAscendant.idxs.idAndContentType].value, x.inputs[SpouseOrAscendant.idxs.name].value));
            else
                allCashAcquirer.add(createOption(x.inputs[DescendantOrCollateral.idxs.idAndContentType].value, x.inputs[DescendantOrCollateral.idxs.name].value));
        }
    })
}


/**
 * 遺産分割の方法セクションのchangeインベントを設定する
 * @param {TypeOfDivision} instance 
 * @param {number} i 
 */
function TypeOfDivisionChangeEventHandler(instance, i){
    const idxs = TypeOfDivision.idxs;
    const {inputs, Qs, noInputs} = fieldDataToVariable(instance);
    const cashAllocationQ = Qs[idxs.cashAllocation.form];
    const cashAllocationInputIdxs = idxs.cashAllocation.input;
    const allCashAcquirerQ = Qs[idxs.allCashAcquirer.form];
    const allCashAcquirerInputIdx = idxs.allCashAcquirer.input;
    const allCashAcquirerInput = inputs[allCashAcquirerInputIdx];
    
    //金銭取得者欄と金銭全取得者欄を非表示にして初期化する
    function iniCashRelatedQs(){
        //金銭取得方法欄が表示されているとき、非表示にして初期化
        if(cashAllocationQ.style.display !== "none"){
            slideUp(cashAllocationQ);
            uncheckTargetElements(inputs, cashAllocationInputIdxs);
        }else{
            //表示されてないときは、処理を終了
            return;
        }
        //金銭全取得者欄が表示されているとき、非表示にして初期化
        if(allCashAcquirerQ.style.display !== "none"){
            slideUp(allCashAcquirerQ);
            allCashAcquirerInput.value = "";
        }else{
            return;
        }
    }
    //次の項目へ進むボタンを有効化する処理
    function activateOkBtn(){
        noInputs.length = 0;
        isActivateOkBtn(instance);
    }
    //遺産分割の方法のとき
    const typeOfDivisionInputIdxs = idxs.typeOfDivision.input;
    const propertyAllocationInputIdxs = idxs.propertyAllocation.input;
    const propertyAllocationFormIdx = idxs.propertyAllocation.form;
    const isPropertyAcquirerAlone = inputs[idxs.contentType1.input].value !== "";
    const isPropertyAcquirerFree = inputs[propertyAllocationInputIdxs[no]].checked;
    const propertyAllocationQ = Qs[propertyAllocationFormIdx];
    const propertyAllocationInputYes = inputs[propertyAllocationInputIdxs[yes]];
    const cashAllocationInputYes = inputs[cashAllocationInputIdxs[yes]];
    const contentType2Input = inputs[idxs.contentType2.input];
    const objectId2Input = inputs[idxs.objectId2.input];
    if(typeOfDivisionInputIdxs.includes(i)){
        //通常のとき
        if(i === typeOfDivisionInputIdxs[yes]){
            //不動産取得者が１人又は２人以上で全員未満のとき
            if(isPropertyAcquirerAlone || isPropertyAcquirerFree){
                activateOkBtn();
            }else{
                //全相続人が不動産取得者のとき
                //不動産取得者欄を表示する
                slideDownIfHidden(propertyAllocationQ);
                //すでに不動産取得者欄が入力されているとき
                if(propertyAllocationInputIdxs.some(x => inputs[x].checked))
                    activateOkBtn();
                else
                    //未入力のときは、エラー要素を追加して次の項目へ進むボタンを無効化する
                    pushInvalidEl(instance, propertyAllocationInputYes);
            }   
            //金銭取得方法欄が表示されているとき、非表示にして初期化
            iniCashRelatedQs();
        }else{
            //不動産取得者が１人又は２人以上で全員未満のとき
            if(isPropertyAcquirerAlone || isPropertyAcquirerFree){
                //金銭取得方法欄を表示して、エラー要素を追加する
                slideDownIfHidden(cashAllocationQ);
                pushInvalidEl(instance, cashAllocationInputYes);
            }else{
                //全相続人が不動産取得者のとき、不動産取得欄を表示して、エラー要素を追加する
                slideDownIfHidden(propertyAllocationQ);
                //すでに不動産取得者欄が入力されているとき、金銭取得者欄を表示してエラー要素を追加して次の項目へ進むボタンを無効化する
                if(propertyAllocationInputIdxs.some(x => inputs[x].checked)){
                    slideDownIfHidden(cashAllocationQ);
                    pushInvalidEl(instance, cashAllocationInputYes);
                }else{
                    //未入力のときは、エラー要素を追加して次の項目へ進むボタンを無効化する
                    pushInvalidEl(instance, propertyAllocationInputYes);
                }
            }
        }
    }else if(propertyAllocationInputIdxs.includes(i)){
        //不動産の分配方法のとき
        //通常分割のとき、エラー要素を削除して次の項目へボタンを有効化する
        if(inputs[typeOfDivisionInputIdxs[yes]].checked){
            activateOkBtn();
        }else if(inputs[typeOfDivisionInputIdxs[no]].checked){
            //換価分割のとき、金銭の分配方法欄を表示してエラー要素に追加
            slideDownIfHidden(cashAllocationQ); 
            if([yes, no, other].every(x => !inputs[cashAllocationInputIdxs[x]].checked)){
                pushInvalidEl(instance, cashAllocationInputYes);
            }
        }
    }else if(cashAllocationInputIdxs.includes(i)){
        //金銭の分配方法のとき
        //一人が取得するとき、全取得欄を表示してエラー要素を追加する
        if(i === cashAllocationInputIdxs[yes]){
            slideDownAndScroll(allCashAcquirerQ);
            pushInvalidEl(instance, allCashAcquirerInput);
        }else{
            //法定相続又はその他のとき、全取得欄を非表示にして初期化、エラー要素を削除して次の項目へボタンを有効化する
            if(allCashAcquirerQ.style.display !== "none"){
                slideUp(allCashAcquirerQ);
                allCashAcquirerInput.value = "";
                contentType2Input.value = "";
                objectId2Input.value = "";
            }
            activateOkBtn();
        }
    }else if(i === allCashAcquirerInputIdx){
        //全金銭の取得者のとき、取得車が選択されたら次へ進むボタンを有効化、されなかったら無効化
        if(inputs[i].value !== ""){
            const parts = allCashAcquirerInput.value.split("_");
            //隠し不動産前取得者inputに値を代入する
            objectId2Input.value = parts[0];
            contentType2Input.value = parts[1];
            activateOkBtn();
        }else{
            pushInvalidEl(instance, inputs[i])
        }
    }
}

/**
 * 遺産分割方法セクションのイベントなど設定
 */
function setTypeOfDivisionSection(){
    const TIdxs = TypeOfDivision.idxs;
    const SIdxs = SpouseOrAscendant.idxs;

    //不動産の全取得者のidとcontent_typeを取得して遺産分割方法インスタンスに代入する
    function getAllPropertyAcquirer(instance){
        const acquirers = heirs.filter(heir => heir.inputs[SIdxs.isAcquire[yes]].checked);
        const parts = acquirers[0] instanceof SpouseOrAscendant ?
            acquirers[0].inputs[SIdxs.idAndContentType].value.split("_"):
            acquirers[0].inputs[DescendantOrCollateral.idxs.idAndContentType].value.split("_");
        instance.inputs[TIdxs.objectId1.input].value = parts[0];
        instance.inputs[TIdxs.contentType1.input].value = parts[1];
    }
    //初めて遺産分割方法セクションを表示するとき
    if(typeOfDivisions.length === 0){
        //インスタンス生成
        const instance = new TypeOfDivision("id_type_of_division-0-fieldset");
        const inputs = instance.inputs;
        //不動産取得者（SpouseOrAscendant.idxs.isAcquireとDescendantOrCollateral.idxs.isAcquireは同じインデックス）
        const acquirers = heirs.filter(heir => heir.inputs[SIdxs.isAcquire[yes]].checked);
        //不動産を取得しない相続人
        const notAcquirers = heirs.filter(heir => heir.inputs[SIdxs.isAcquire[no]].checked);
        //不動産取得者が一人のとき、content_type1とobject_id1に値を代入する
        if(acquirers.length === 1)
            getAllPropertyAcquirer(instance);
        //全員が不動産取得者ではないとき、不動産取得者欄のその他にチェックを入れる
        else if(notAcquirers.length > 0)
            inputs[TIdxs.propertyAllocation.input[no]].checked = true;
        //金銭取得者をselectに追加する
        addAllHeirsToCashAcquirerSelect(instance);
        //イベントを設定
        for(let i = 0, len = inputs.length; i < len; i++){
            inputs[i].addEventListener("change", ()=>{
                TypeOfDivisionChangeEventHandler(instance, i);
            })
        }
        //次の項目へ進むボタンを無効化する
        okBtn.disabled = true;
    }else{
        let newPattern;
        if(heirs.filter(heir => heir.inputs[SIdxs.isAcquire[yes]].checked).length === 1)
            newPattern = yes;
        else if(heirs.some(heir => heir.inputs[SIdxs.isAcquire[no]].checked))
            newPattern = no;
        else
            newPattern = other;
        
        let oldPattern;
        if(typeOfDivisions[0].inputs[TIdxs.contentType1.input].value !== "")
            oldPattern = yes;
        else if(typeOfDivisions[0].Qs[TIdxs.propertyAllocation.form].style.display === "none")
            oldPattern = no;
        else
            oldPattern = other
        
        //不動産取得者の数に変更があるとき
        if(newPattern !== oldPattern){
            //インスタンスの初期化処理
            //質問欄の表示を遺産分割の方法のみにする
            typeOfDivisions[0].Qs.forEach(x => {
                if(x !== typeOfDivisions[0].Qs[TIdxs.typeOfDivision.form])
                    x.style.display = "none";
            })
            //inputとselectの初期化
            typeOfDivisions[0].inputs.forEach(x => {
                if(x.type === "radio")
                    x.checked = false;
                else
                    x.value = "";
            })
            //不動産取得者が一人になったとき
            if(newPattern === yes)
                getAllPropertyAcquirer(typeOfDivisions[0]);
            //不動産取得者が二人以上、全員未満になったとき
            else if(newPattern === no)
                typeOfDivisions[0].inputs[TIdxs.propertyAllocation.input[no]].checked = true;
        }else{
            //変更がないとき
            if(newPattern === yes)
                getAllPropertyAcquirer(typeOfDivisions[0]);
        }

        //入力状況に応じて次の項目へ進むボタンを有効化又は無効化する
        okBtn.disabled = typeOfDivisions[0].noInputs.length === 0 ? false: true;
    }
}

/**
 * 不動産の数の制限チェック（各欄２０個まで）
 * @param {Fieldset} instance  インスタンス
 * @param {number} i インプット要素の番号
 */
function countCheck(instance, i){
    const val = instance.inputs[i].value;
    const el = instance.inputs[i];
    isValid = isNumber(val, el) ? true: "false"; //整数チェック
    let msg = "";

    //整数のとき
    if(typeof isValid === "boolean"){
        //２０個以下チェック
        const intVal = parseInt(val);
        if(intVal > 20){
            isValid = "false";
            msg = "上限は２０までです";
        }
    }else{
        msg = "数字で入力してください";
    }
    afterValidation(isValid, instance.errMsgEls[i], msg, el, instance);
    okBtn.disabled = instance.noInputs.length !== 3 ? false: true;
}

/**
 * プラスボタンとマイナスボタンの有効化トグル
 * @param {HTMLElement} plusBtn 加算ボタン
 * @param {HTMLElement} minusBtn  原産ボタン
 * @param {number} val 増減後の値
 * @param {number} min 設定する最小値
 * @param {number} max 設定する最大値
 */
function toggleCountBtn(plusBtn, minusBtn, val, min, max){
    minusBtn.disabled = val > min ? false: true;
    plusBtn.disabled = val > max ? true: false;
}

/**
 * 数字入力欄のキーダウンイベント
 * @param {Event} e キーダウンイベント
 */
function handleNumInputKeyDown(e){
    if(!/\d|Backspace|Delete|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight/.test(e.key)){
        //数字又はバックスペースとデリート以外は使用不可
        e.preventDefault()
    }
}

/**
 * 子の人数を１増加させる
 * @param {boolean} isIncrease 増加フラグ
 * @param {Fieldset} instance  カウント欄を持つ人
 * @param {number} i  ボタンのインデックス
 * @param {number} limitCount 上限値又は下限値
 */
function increaseOrDecreaseCount(isIncrease, instance, i, limitCount){
    const countInput = instance.inputs[i];
    let val = parseInt(countInput.value) || 0;
    if((isIncrease && val < limitCount) || (!isIncrease && val > limitCount))
        val += isIncrease ? 1 : -1;
    countInput.value = val;
}

/**
 * 増減ボタンのイベントハンドラー
 * @param {boolean} isIncrease 増加ボタンフラグ
 * @param {Fieldset} instance  カウント欄を持つ人
 * @param {number} i  ボタンのインデックス
 * @param {HTMLElement} plusBtn プラスボタン
 * @param {HTMLElement} minusBtn マイナスボタン
 * @param {number} minCount 設定の最小値
 * @param {number} maxCount 設定の最大値
 */
function handleIncreaseOrDecreaseBtnEvent(isIncrease, instance, i, plusBtn, minusBtn, minCount, maxCount){
    increaseOrDecreaseCount(isIncrease, instance, i, (isIncrease ? maxCount : minCount));
    countCheck(instance, i);
    toggleCountBtn(plusBtn, minusBtn, instance.inputs[i].value, minCount, maxCount);
}

/**
 * 不動産の数のセクションのイベントをセットする
 */
function setNumberOfPropertiesSection(){
    if(numberOfProperties.length === 0){
        const instance = new NumberOfProperties("id_number_of_properties-0-fieldset");
        const min = 0;
        const max = 20;
        for(let i = 0, len = instance.inputs.length; i < len; i++){
            instance.inputs[i].addEventListener("change", ()=>{
                countCheck(instance, i);
                toggleCountBtn(instance.increaseBtn[i], instance.decreaseBtn[i], parseInt(instance.inputs[i].value), min, max);
            })
            instance.inputs[i].addEventListener("keydown",(e)=>{
                handleNumInputKeyDown(e);
                setEnterKeyFocusNext(e, (i < len - 1) ? instance.inputs[i + 1]: okBtn);
            })
            instance.inputs[i].addEventListener("input", (e)=>{
                //３文字以上入力不可
                e.target.value = e.target.value.slice(0,2);
            })
        }

        for(let i = 0, len = instance.decreaseBtn.length; i < len; i++){
            instance.decreaseBtn[i].addEventListener("click",()=>{
                handleIncreaseOrDecreaseBtnEvent(false, instance, i, instance.increaseBtn[i], instance.decreaseBtn[i], min, max);
            })
        }

        for(let i = 0, len = instance.increaseBtn.length; i < len; i++){
            instance.increaseBtn[i].addEventListener("click",()=>{
                handleIncreaseOrDecreaseBtnEvent(true, instance, i, instance.increaseBtn[i], instance.decreaseBtn[i], min, max);
            })
        }
    }else{

    }
}

/**
 * 土地取得者のインスタンスを追加する
 * @param {Land} num 
 * @param {number} num 
 */
function addLandAcquirerInstance(instance, num){
    instance.addTempLandAcquirer(new TempAcquirer(`id_land_${num}_temp_land_acquirer-0-fieldset`, instance));
    instance.addTempLandCashAcquirer(new TempAcquirer(`id_land_${num}_temp_land_cash_acquirer-0-fieldset`, instance));
    instance.tempLandCashAcquirers[0].noInputs.length = 0
    instance.addLandAcquirer(new Acquirer(`id_land_acquirer-${num}-fieldset`));
    instance.landAcquirers[0].inputs[Acquirer.idxs.target].value = instance.inputs[Land.idxs.index.input].value;
    instance.addLandCashAcquirer(new Acquirer(`id_land_cash_acquirer-${num}-fieldset`));
    instance.landCashAcquirers[0].inputs[Acquirer.idxs.target].value = instance.inputs[Land.idxs.index.input].value;
}

/**
 * 土地取得者、土地金銭取得者のhiddenInputを複製するための処理
 * @param {string} id 
 * @param {number} idx 
 */
function cloneLandAcquirerHiddenInput(id, idx){
    const copyFrom = document.getElementById(id);
    const clone = copyFrom.cloneNode(true);
    clone.id = clone.id.replace(/\d+/, idx);
    const els = clone.querySelectorAll('[id],[name]');
    els.forEach(x => {
        if (x.id) {
            x.id = x.id.replace(/(acquirer-)\d+/, `$1${idx}`);
        }
        if (x.name) {
            x.name = x.name.replace(/(acquirer-)\d+/, `$1${idx}`);
        }
    });
    copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling);
}

/**
 * 土地情報のバリデーション
 * @param {HTMLCollection} inputs 対象のインスタンスの全input要素
 * @param {number} idx チェック対象のinput要素のインデックス
 */
function landValidation(inputs, idx){
    const input = inputs[idx];
    const idxs = Land.idxs;
    //不動産番号のとき、空欄、整数、１３桁チェック
    if(idx === idxs.number.input){
        const result = isBlank(input);
        if(result !== false)
            return result;
        if(!isNumber(input.value, input))
            return "数字で入力してください";
        if(input.value.length !== 13)
            return "１３桁の数字で入力してください";
    }else if([idxs.address.input, idxs.office.input].includes(idx)){
        //所在地、法務局のとき、空欄チェック
        const result = isBlank(input);
        if(result !== false)
            return result;
    }else if([idxs.landNumber.input[yes], idxs.landNumber.input[no], idxs.purparty.input[no], idxs.purparty.input[other], idxs.price.input].includes(idx)){
        //地番、所有権・持分、評価額のとき空欄チェック、整数チェック
        let result = false;
        //地番の枝番は空欄チェック不要
        if(idx !== idxs.landNumber.input[no])
            result = isBlank(input);

        if(result !== false)
            return result;
        
        //評価額のとき、コンマを削除する
        if(idx === idxs.price.input)
        input.value = removeCommas(input.value);
    
        //数字のみチェック
        if(!isNumber(input.value, input))
            return "数字のみで入力してください";
        
        //先頭が０にならないようにする
        result = validateIntInput(input);

        if(typeof result === "string")
            return result;

        //所有権・持分のときかつ分母分子両方入力されているとき
        const bottom = ZenkakuToHankaku(inputs[idxs.purparty.input[no]].value);
        const top = ZenkakuToHankaku(inputs[idxs.purparty.input[other]].value);
        if([idxs.purparty.input[no], idxs.purparty.input[other]].includes(idx) && top !== "" && bottom !== ""){
            if(parseInt(bottom) < parseInt(top)){
                return "分子は分母以下の数字にしてください";
            }
        }
    }

    return true;
}

/**
 * 土地情報欄のイベントを設定する
 */
function setLandEvent(){
    const idxs = Land.idxs;
    const numberInputIdx = idxs.number.input;
    const addressInputIdx = idxs.address.input;
    const landNumberInputIdxs = idxs.landNumber.input;
    const purpartyInputIdxs = idxs.purparty.input;
    const officeInputIdx = idxs.office.input;
    const isExchangeInputIdxs = idxs.isExchange.input;

    //各土地インスタンスに対してループ処理
    for(let i = 0, len = lands.length; i < len; i++){
        const inputs = lands[i].inputs;
        for(let j = 0, len2 = inputs.length; j < len2; j++){
            //隠しinputとindex以外のとき
            if(![landNumberInputIdxs[other], purpartyInputIdxs[other2], idxs.index.input].includes(j)){
                //キーダウンイベント
                inputs[j].addEventListener("keydown", (e)=>{
                    //隠しinputが次にある要素のときは、+2にして隠しinputを飛ばす
                    setEnterKeyFocusNext(e, (![landNumberInputIdxs[no], purpartyInputIdxs[other]].includes(j) ? inputs[j + 1]: inputs[j + 2]));
                    //所在地、所有者CBと換価確認以外の欄は数字のみの入力に制限する
                    if(![addressInputIdx, purpartyInputIdxs[yes], isExchangeInputIdxs[yes], isExchangeInputIdxs[no]].includes(j))
                        handleNumInputKeyDown(e);
                })
            } 

            //changeイベントの内容
            const changeEventHandler = (inputIdx, formIdx) => {
                inputs[inputIdx].addEventListener("change", () => {
                    //地番の枝番に対するエラーを非表示にする
                    lands[i].errMsgEls[idxs.landNumber.form].style.display = "none";
                    //所有者CBのとき
                    if(inputIdx === purpartyInputIdxs[yes]){
                        if(inputs[inputIdx].checked){
                            inputs[purpartyInputIdxs[no]].value = "１";
                            inputs[purpartyInputIdxs[no]].disabled = true;
                            inputs[purpartyInputIdxs[other]].value = "１";
                            inputs[purpartyInputIdxs[other]].disabled = true;
                            inputs[purpartyInputIdxs[other2]].value = "１分の１";
                            lands[i].noInputs = lands[i].noInputs.filter(x => x !== inputs[purpartyInputIdxs[no]] && x !== inputs[purpartyInputIdxs[other]]);
                            isActivateOkBtn(lands[i])
                        }else{
                            inputs[purpartyInputIdxs[no]].value = "";
                            inputs[purpartyInputIdxs[no]].disabled = false;
                            inputs[purpartyInputIdxs[other]].value = "";
                            inputs[purpartyInputIdxs[other]].disabled = false;
                            inputs[purpartyInputIdxs[other2]].value = "分の";
                            pushInvalidEl(lands[i], inputs[purpartyInputIdxs[no]]);
                            pushInvalidEl(lands[i], inputs[purpartyInputIdxs[other]]);
                        }
                        return;
                    }
                    //換価確認のラジオボタンのとき
                    if(isExchangeInputIdxs.includes(inputIdx)){
                        lands[i].noInputs = lands[i].noInputs.filter(x => x !== inputs[isExchangeInputIdxs[yes]] && x !== inputs[isExchangeInputIdxs[no]]);
                        //換価するとき
                        if(inputIdx === isExchangeInputIdxs[yes]){
                            //金銭取得者の欄を表示してエラー要素から換価する、しない両方のinputを削除する
                            slideDownAndScroll(lands[i].tempLandCashAcquirers[0].fieldset.parentNode);
                            lands[i].tempLandCashAcquirers[0].noInputs = Array.from(lands[i].tempLandCashAcquirers[0].fieldset.querySelectorAll("input, select"));
                        }else{
                            //換価しないとき
                            //金銭取得者の欄を非表示にして初期化する、インスタンスも最初の１のみにする
                            slideUp(lands[i].tempLandCashAcquirers[0].fieldset.parentNode);

                            for(let k = 0, len = lands[i].tempLandCashAcquirers.length; k < len; k++){
                                if(k === 0){
                                    lands[i].tempLandCashAcquirers[k].inputs[TempAcquirer.idxs.acquirer.input].value = "";
                                    lands[i].tempLandCashAcquirers[k].inputs[TempAcquirer.idxs.percentage.input[yes]].checked = false;
                                    lands[i].tempLandCashAcquirers[k].inputs[TempAcquirer.idxs.percentage.input[no]].checked = false;
                                    lands[i].tempLandCashAcquirers[k].noInputs.length = 0;
                                }else{
                                    lands[i].tempLandCashAcquirers[k].fieldset.remove();
                                }
                            }
                            lands[i].tempLandCashAcquirers.length = 1;
                        }
                        isActivateOkBtn(lands[i]);
                        return;
                    }

                    const result = landValidation(inputs, inputIdx);
                    afterValidation(result, lands[i].errMsgEls[formIdx], result, inputs[inputIdx], lands[i]);
                    if(result && inputIdx !== idxs.price.input){
                        inputs[inputIdx].value = hankakuToZenkaku(inputs[inputIdx].value);
                    }
                    //不動産番号のとき
                    if(inputIdx === numberInputIdx){
                        //１３桁入力されているとき
                        if(result){
                            const officeCode = ZenkakuToHankaku(inputs[numberInputIdx].value.slice(0, 4));
                        }

                    }else if([landNumberInputIdxs[yes], landNumberInputIdxs[no]].includes(inputIdx)){
                        //地番のとき
                        const regex = inputIdx === landNumberInputIdxs[yes] ? /.*(?=番)/ : /(?<=番).*/;
                        inputs[landNumberInputIdxs[other]].value = inputs[landNumberInputIdxs[other]].value.replace(regex, "");
                        if(inputIdx === landNumberInputIdxs[yes])
                            inputs[landNumberInputIdxs[other]].value = inputs[inputIdx].value + inputs[landNumberInputIdxs[other]].value;
                        else
                            inputs[landNumberInputIdxs[other]].value += inputs[inputIdx].value;
                    }else if([purpartyInputIdxs[no], purpartyInputIdxs[other]].includes(inputIdx)){
                        //所有権・持分のとき
                        const regex = inputIdx === purpartyInputIdxs[no] ? /.*(?=分の)/ : /(?<=分の).*/;
                        inputs[purpartyInputIdxs[other2]].value = inputs[purpartyInputIdxs[other2]].value.replace(regex, "");
                        if(inputIdx === purpartyInputIdxs[no])
                            inputs[purpartyInputIdxs[other2]].value = inputs[inputIdx].value + inputs[purpartyInputIdxs[other2]].value;
                        else
                            inputs[purpartyInputIdxs[other2]].value += inputs[inputIdx].value;
                    }else if(inputIdx === idxs.price.input){
                        //評価額のとき、半角にしてコンマを追加して全角に戻す
                        const hankaku = ZenkakuToHankaku(inputs[inputIdx].value);
                        inputs[inputIdx].value = hankakuToZenkaku(addCommas(hankaku));
                    }
                });
            }

            //各入力欄にchangeイベントを設定する
            if(j === idxs.number.input)
                changeEventHandler(j, idxs.number.form);
            else if(j === addressInputIdx)
                changeEventHandler(j, idxs.address.form);
            else if([landNumberInputIdxs[yes], landNumberInputIdxs[no]].includes(j))
                changeEventHandler(j, idxs.landNumber.form);
            else if(j === officeInputIdx)
                changeEventHandler(j, idxs.office.form);
            else if([purpartyInputIdxs[yes], purpartyInputIdxs[no], purpartyInputIdxs[other]].includes(j))
                changeEventHandler(j, idxs.purparty.form);
            else if(j === idxs.price.input)
                changeEventHandler(j, idxs.price.form);
            else if(isExchangeInputIdxs.includes(j))
                changeEventHandler(j, idxs.isExchange.form);  
        }
    }
}

/**
 * 相続人の法定相続分を算出して返す
 * @param {[SpouseOrAscendant|DescendantOrCollateral]} candidates 法定相続人
 * @param {SpouseOrAscendant|DescendantOrCollateral} heir 算出する対象の相続人
 * @returns
 */
function getLegalPercentage(candidates, heir){
    //分母の数字を受け取って相続分表記に変えて返す関数
    function returnPercentage(bottom, top = null){
        if(top)
            return hankakuToZenkaku(bottom) + "分の" + hankakuToZenkaku(top);
        else
            return hankakuToZenkaku(bottom) + "分の１";
    } 
    //相続人が配偶者のとき
    if(heir.fieldset.id.includes("id_decedent_spouse-")){
        //直系卑属がいるとき
        if(candidates.some(x => x.fieldset.id.includes("id_child-") || x.fieldset.id.includes("id_child_spouse-") || x.fieldset.id.includes("id_grand_child-")))
            return returnPercentage(2);
        //直系尊属がいるとき
        else if(candidates.some(x => x.fieldset.id.includes("id_ascendant-")))
            return returnPercentage(3, 2);
        //兄弟姉妹がいるとき
        else if(candidates.some(x => x.fieldset.id.includes("id_collateral-")))
            return returnPercentage(4, 3);
        //配偶者のみのとき
        else
            return returnPercentage(1)
    }else{
        //相続人が配偶者以外のとき
        //相続人の中に配偶者がいるかの結果を取得
        const isDecedentSpouse = candidates.some(x => x.fieldset.id.includes("id_decedent_spouse-"));
        //相続人が子又は子の配偶者又は子の子（孫）のとき
        if(heir.fieldset.id.includes("id_child-") || heir.fieldset.id.includes("id_child_spouse-") || heir.fieldset.id.includes("id_grand_child-")){
            //生きている子と相続人がいる死亡している子の数を取得する
            const aliveChildsCount = candidates.filter(x => x.fieldset.id.includes('id_child-')).length;
            const childHeirs = candidates.filter(x => x.fieldset.id.includes("id_child_spouse-") || x.fieldset.id.includes("id_grand_child-"));
            const deadChilds = [];
            const ids = new Map();
            childHeirs.forEach(x => {
                const id = x instanceof SpouseOrAscendant ? x.objectId : x.objectId1;
                if (!ids.has(id)) {
                    deadChilds.push(x);
                    ids.set(id, true); // IDを追跡済みとしてマーク
                }
            });
            const deadChildsCount = deadChilds.length;
            const heirChildCount = aliveChildsCount + deadChildsCount;
            //相続人が子のとき/配偶者の有無で取得割合が変わる
            if(heir.fieldset.id.includes("id_child-")){
                return returnPercentage(isDecedentSpouse? heirChildCount * 2: heirChildCount);
            }else if(heir.fieldset.id.includes("id_child_spouse-")){
                //相続人が子の配偶者のとき
                //子の配偶者と同じobjectId1を持つ子の子を数える
                const grandChildCount = candidates.filter(x => x instanceof DescendantOrCollateral && x.inputs[DescendantOrCollateral.idxs.objectId1].value === heir.inputs[SpouseOrAscendant.idxs.objectId].value).length;
                //配偶者の有無と孫の有無で取得割合が変わる
                if(isDecedentSpouse)
                    return returnPercentage(grandChildCount > 0? heirChildCount * 2 * 2: heirChildCount * 2);
                else
                    return returnPercentage(grandChildCount > 0? heirChildCount * 2: heirChildCount);
            }else if(heir.fieldset.id.includes("id_grand_child-")){
                //相続人が孫のとき
                //子の配偶者の有無と同じobjectId1を持つ孫の数を取得する
                const isChildSpouse = candidates.some(x => x instanceof SpouseOrAscendant && x.inputs[SpouseOrAscendant.idxs.objectId].value === heir.inputs[DescendantOrCollateral.idxs.objectId1].value);
                const grandChildCount = candidates.filter(x => x instanceof DescendantOrCollateral && x.inputs[DescendantOrCollateral.idxs.objectId1].value === heir.inputs[DescendantOrCollateral.idxs.objectId1].value).length;
                //配偶者の有無と子の配偶者の有無で取得割合が変わる
                if(isDecedentSpouse)
                    return returnPercentage(isChildSpouse? heirChildCount * 2 * 2 * grandChildCount: heirChildCount * 2 * grandChildCount);
                else
                    return returnPercentage(isChildSpouse? heirChildCount * 2 * grandChildCount: heirChildCount * grandChildCount);
            }
        }else if(heir.fieldset.id.includes("id_ascendant-")){
            //相続人が尊属のとき
            const ascendantsCount = candidates.filter(x => x.fieldset.id.includes("id_ascendant-")).length;
            //配偶者がいるとき
            if(isDecedentSpouse){
                if(ascendantsCount === 1){
                    return returnPercentage(3);
                }else{
                    //相続人が父母のいずれかのとき
                    if(heir.inputs[SpouseOrAscendant.idxs.objectId].value === decedentId){
                        return returnPercentage(6);
                    }else{
                        //相続人が祖父母のとき
                        const isGrandSpouse = candidates.some(x => x.fieldset.id.includes("id_ascendant-") &&
                            x.inputs[SpouseOrAscendant.idxs.objectId].value === heir.inputs[SpouseOrAscendant.idxs.objectId].value);
                        //相続人の中に別系統の尊属がいるとき
                        if(candidates.some(x => x.inputs[SpouseOrAscendant.idxs.objectId].value === decedentId || x.inputs[SpouseOrAscendant.idxs.objectId].value !== heir.inputs[SpouseOrAscendant.idxs.objectId].value)){
                            //同じ系統の祖父母がいるとき
                            return returnPercentage(isGrandSpouse? 12: 6);
                        }else{
                            //別系統の尊属がいないとき
                            //同じ系統の祖父母がいるとき
                            return returnPercentage(isGrandSpouse? 6: 3);
                        }
                    }
                }
            }else{
                if(ascendantsCount === 1){
                    return returnPercentage(1);
                }else{
                    //相続人が父母のいずれかのとき
                    if(heir.inputs[SpouseOrAscendant.idxs.objectId].value === decedentId){
                        return returnPercentage(2);
                    }else{
                        //相続人が祖父母のとき
                        const isGrandSpouse = candidates.some(x => x.fieldset.id.includes("id_ascendant-") &&
                            x.inputs[SpouseOrAscendant.idxs.objectId].value === heir.inputs[SpouseOrAscendant.idxs.objectId].value);
                        //相続人の中に別系統の尊属がいるとき
                        if(candidates.some(x => x.inputs[SpouseOrAscendant.idxs.objectId].value === decedentId || x.inputs[SpouseOrAscendant.idxs.objectId].value !== heir.inputs[SpouseOrAscendant.idxs.objectId].value)){
                            //同じ系統の祖父母がいるとき
                            return returnPercentage(isGrandSpouse? 4: 2);
                        }else{
                            //別系統の尊属がいないとき
                            //同じ系統の祖父母がいるとき
                            return returnPercentage(isGrandSpouse? 2: 1);
                    }
                    }
                }
            }
        }else if(heir.fieldset.id.includes("id_collateral-")){
            //相続人が兄弟姉妹のとき
            const wholeCollateralCount = candidates.filter(x => x.fieldset.id.includes("id_collateral-") && x.fieldset.getElementsByClassName("otherParentDiv")[0].style.display === "none").length;
            const halfCollateralCount = candidates.filter(x => x.fieldset.id.includes("id_collateral-") && x.fieldset.getElementsByClassName("otherParentDiv")[0].style.display === "").length;
            const collateralCount = wholeCollateralCount + halfCollateralCount;
            //配偶者がいるとき
            if(isDecedentSpouse){
                //全血又は半血のみのとき、兄弟姉妹の数で按分する
                if((wholeCollateralCount > 0 && halfCollateralCount === 0) || (wholeCollateralCount === 0 && halfCollateralCount > 0)){
                    return returnPercentage(collateralCount * 4);
                }else{
                    //全血と半血が相続人になるとき
                    const bottom = (wholeCollateralCount * 2 + halfCollateralCount) * 4;
                    const isHeirWhole = heir.fieldset.getElementsByClassName("otherParentDiv")[0].style.display === "none";
                    //相続人が全血か半血かで取得割合が変わる
                    return returnPercentage(bottom, isHeirWhole? 2: 1);
                }
            }else{
                //配偶者がいないとき
                //全血又は半血のみのとき、兄弟姉妹の数で按分する
                if((wholeCollateralCount > 0 && halfCollateralCount === 0) || (wholeCollateralCount === 0 && halfCollateralCount > 0)){
                    return returnPercentage(collateralCount);
                }else{
                    //全血と半血が相続人になるとき
                    const bottom = (wholeCollateralCount * 2 + halfCollateralCount);
                    const isHeirWhole = heir.fieldset.getElementsByClassName("otherParentDiv")[0].style.display === "none";
                    //相続人が全血か半血かで取得割合が変わる
                    return returnPercentage(bottom, isHeirWhole? 2: 1);
                }
            }
        }else{
            //該当がないとき
            return false;
        }
    }    
}

/**
 * 候補者optionをselectに追加 
 * @param {TempAcquirer} tempAcquires 
 * @param {SpouseOrAscendant|DescendantOrCollateral} candidates 
 */
function addOption(tempAcquires, candidates){
    tempAcquires.forEach(x =>{
        const select = x.inputs[TempAcquirer.idxs.acquirer.input];
        const option = document.createElement("option");
        option.text = "選択してください";
        option.value = "";
        select.add(option);
        candidates.forEach(x =>{
            const inputs = x.inputs;
            const idxs = x.constructor.idxs;
            const option = document.createElement("option");
            option.text = inputs[idxs.name].value;
            option.value = inputs[idxs.idAndContentType].value;
            select.add(option);
        });
    });
}

/**
 * 取得者候補をselectタグのoptionに追加する
 */
function addAcquirerCandidate(){
    //土地候補者（不動産を取得するで「はい」がチェックされた人）、金銭取得者（相続人全員）を格納した配列
    const tempLandAcquirerCandidates = [];
    const tempLandCashAcquirerCandidates = [];
    heirs.forEach(x =>{
        const idxs = x.constructor.idxs.isAcquire;
        const inputs = x.inputs;
        if(inputs[idxs[yes]].checked || inputs[idxs[no]].checked){
            tempLandCashAcquirerCandidates.push(x);
            if(inputs[idxs[yes]].checked)
                tempLandAcquirerCandidates.push(x);
        }
    })

    lands.forEach(x =>{
        addOption(x.tempLandAcquirers, tempLandAcquirerCandidates);
        addOption(x.tempLandCashAcquirers, tempLandCashAcquirerCandidates);
    })

    //遺産分割方法の全取得者欄が入力されているとき
    if(typeOfDivisions[0].inputs[TypeOfDivision.idxs.contentType1.input].value !== ""){
        //土地欄全てに対してループ処理
        lands.forEach(x => {
            //隠し取得者欄全てに対してループ処理
            x.landAcquirers.forEach(y => {
                //候補者欄はその人を入力して、割合に１/１を入力する
                y.inputs[Acquirer.idxs.contentType2].value = typeOfDivisions[0].inputs[TypeOfDivision.idxs.contentType1.input].value;
                y.inputs[Acquirer.idxs.objectId2].value = typeOfDivisions[0].inputs[TypeOfDivision.idxs.objectId1.input].value;
                y.inputs[Acquirer.idxs.percentage].value = "１分の１";
            })
            //仮取得者フォームのエラー要素を削除する
            x.tempLandAcquirers.forEach(y => y.noInputs.length = 0)
        })
        //全ての不動産取得者欄を非表示にする
        const tempLandAcquirerWrappers = Array.from(document.getElementById("land-section").getElementsByClassName("tempLandAcquirerWrapper"));
        tempLandAcquirerWrappers.forEach(x => x.style.display = "none");
    }else if(typeOfDivisions[0].inputs[TypeOfDivision.idxs.propertyAllocation.input[yes]].checked){
        //取得者が法定相続のとき
        //取得者欄のフォーム数を更新する
        const landAcquirerTotalForm = document.getElementById("id_land_acquirer-TOTAL_FORMS");
        landAcquirerTotalForm.value = String(tempLandAcquirerCandidates.length * lands.length);
        //不動産取得者欄を全て非表示にする
        const TLAWrapper = Array.from(document.getElementsByClassName("tempLandAcquirerWrapper"));
        TLAWrapper.forEach(x => x.style.display = "none");
        //土地欄全てに対してループ処理
        for(let i = 0, len1 = lands.length; i < len1; i++){
            //初期配置しているフォームのidとnameの属性値を更新する
            for(let j = 0; j < 1; j++){
                if(i > 0){
                    //idとnameを属性を更新する
                    const regex = /(acquirer-)\d+/;
                    const newIdx = i * tempLandAcquirerCandidates.length;
                    lands[i].landAcquirers[j].fieldset.id = lands[i].landAcquirers[j].fieldset.id.replace(regex, `$1${newIdx}`);
                    const att = "[id],[name]";
                    const els = lands[i].landAcquirers[j].fieldset.querySelectorAll(att);
                    els.forEach(el => {
                        if(el.id){
                            el.id = el.id.replace(regex, `$1${newIdx}`);
                        }
                        if(el.name){
                            el.name = el.name.replace(regex, `$1${newIdx}`);
                        }
                    });                    
                }
            }
        }
        for(let i = 0, len1 = lands.length; i < len1; i++){
            for(let j = 0, len2 = tempLandAcquirerCandidates.length; j < len2; j++){
                const idAndContentType = tempLandAcquirerCandidates[j].inputs[tempLandAcquirerCandidates[j].constructor.idxs.idAndContentType].value;
                const parts = idAndContentType.split("_");
                if(j === 0){
                    lands[i].landAcquirers[j].inputs[Acquirer.idxs.contentType2].value = parts[1];
                    lands[i].landAcquirers[j].inputs[Acquirer.idxs.objectId2].value = parts[0];
                    lands[i].landAcquirers[j].inputs[Acquirer.idxs.percentage].value = getLegalPercentage(tempLandAcquirerCandidates, tempLandAcquirerCandidates[j]);
                }else{
                    const copyFrom = lands[i].landAcquirers[j - 1].fieldset;
                    const att = "[id],[name]";
                    const regex = /(acquirer-)\d+/;
                    const newIdx = parseInt(copyFrom.id.match(/acquirer-(\d+)/)[1]) + 1;
                    copyAndPasteEl(copyFrom, att, regex, newIdx);  
                    //法定相続人分の隠し取得者インスタンスを生成する
                    const newId = copyFrom.id.replace(regex, `$1${newIdx}`);
                    const newLandAcquirer = new Acquirer(newId);
                    newLandAcquirer.inputs[Acquirer.idxs.contentType2].value = parts[1];
                    newLandAcquirer.inputs[Acquirer.idxs.objectId2].value = parts[0];
                    newLandAcquirer.inputs[Acquirer.idxs.percentage].value = getLegalPercentage(tempLandAcquirerCandidates, tempLandAcquirerCandidates[j]);
                    lands[i].addLandAcquirer(newLandAcquirer);
                }
            }
            //エラー要素を削除する
            lands[i].tempLandAcquirers[0].noInputs.length = 0;
        }
    }
}

/**
 * 土地取得者の仮フォームのバリデーション
 * @param {HTMLCollection} inputs
 * @param {number} idx 
 */
function tempLandValidation(inputs, idx){
    const input = inputs[idx];
    let result = isBlank(input);
    if(result !== false)
        return result;

    const percentageIdxs = TempAcquirer.idxs.percentage.input;
    if(percentageIdxs.includes(idx)){
        if(!isNumber(input.value, input))
            return "数字で入力してください";

        //先頭が０にならないようにする
        result = validateIntInput(input);

        if(typeof result === "string")
            return result;

        //所有権・持分のときかつ分母分子両方入力されているとき
        const bottom = ZenkakuToHankaku(inputs[percentageIdxs[yes]].value);
        const top = ZenkakuToHankaku(inputs[percentageIdxs[no]].value);
        if(top !== "" && bottom !== ""){
            if(parseInt(bottom) < parseInt(top)){
                return "分子は分母以下の数字にしてください";
            }
        }
    }
    return true;
}

/**
 * 土地取得者の仮フォームに対するイベント設定
 */
function setLandTempAcquiresEvent(){
    const TIdxs = TempAcquirer.idxs;
    const AIdxs = Acquirer.idxs;
    const addBtn = document.getElementById("land-section").getElementsByClassName("addTempLandAcquirerBtn")[0];
    //各土地に対してループ処理
    lands.forEach(x =>{
        //土地取得者仮フォーム
        const tempLandAcquirer = x.tempLandAcquirers[0];
        const tempLandAcquirerInputs = tempLandAcquirer.inputs;
        //金銭取得者仮フォーム
        const tempLandCashAcquirer = x.tempLandCashAcquirers[0];
        const tempLandCashAcquirerInputs = tempLandCashAcquirer.inputs;
        //土地取得者仮フォームと金銭取得者仮フォームは、同一のフォーム形式のためイベント設定
        for(let i = 0, len = tempLandAcquirerInputs.length; i < len; i++){
            const TPercentageInputIdxs = TIdxs.percentage.input;
            //取得割合のとき
            if(TPercentageInputIdxs.includes(i)){
                function keyDownHandler(e, inputs){
                    handleNumInputKeyDown(e);
                    setEnterKeyFocusNext(e, (TPercentageInputIdxs[yes] ? inputs[i + 1]: addBtn));
                }
                //keydownイベント、数字のみの入力制限とフォーカス移動処理
                tempLandAcquirerInputs[i].addEventListener("keydown", (e)=> keyDownHandler(e, tempLandAcquirerInputs));
                tempLandCashAcquirerInputs[i].addEventListener("keydown", (e)=> keyDownHandler(e, tempLandCashAcquirerInputs));
            }
            //全インプットに対してchangeイベントを設定
            function changeEventHandler(acquirer, tempAcquirer){
                const acquirerInputs = acquirer.inputs;
                const tempAcquirerInputs = tempAcquirer.inputs;
                const result = tempLandValidation(tempAcquirerInputs, i);
                //取得者のとき、hidden取得者に転記する
                if(i === TIdxs.acquirer.input){
                    afterValidation(result, tempAcquirer.errMsgEls[TIdxs.acquirer.form], result, tempAcquirerInputs[i], tempAcquirer);
                    const parts = tempAcquirerInputs[i].value.split("_");
                    acquirerInputs[AIdxs.contentType2].value = parts[1] ? parts[1]: "";
                    acquirerInputs[AIdxs.objectId2].value = parts[0];
                }else if(TPercentageInputIdxs.includes(i)){
                    //取得割合のとき、hidden取得者に転記する
                    afterValidation(result, tempAcquirer.errMsgEls[TIdxs.percentage.form], result, tempAcquirerInputs[i], tempAcquirer);
                    tempAcquirerInputs[i].value = hankakuToZenkaku(tempAcquirerInputs[i].value);
                    const regex = i === TPercentageInputIdxs[yes] ? /.*(?=分の)/ : /(?<=分の).*/;
                    acquirerInputs[AIdxs.percentage].value = acquirerInputs[AIdxs.percentage].value.replace(regex, "");
                    if(i === TPercentageInputIdxs[yes])
                        acquirerInputs[AIdxs.percentage].value = tempAcquirerInputs[i].value + acquirerInputs[AIdxs.percentage].value;
                    else
                        acquirerInputs[AIdxs.percentage].value += tempAcquirerInputs[i].value;
                }
            }
            tempLandAcquirerInputs[i].addEventListener("change", ()=>changeEventHandler(x.landAcquirers[0], tempLandAcquirer));
            tempLandCashAcquirerInputs[i].addEventListener("change", ()=>changeEventHandler(x.landCashAcquirers[0], tempLandCashAcquirer));
        }
    })
}

/**
 * 取得者仮フォームの追加ボタンのイベント設定
 */
function setAddTempAcquirerBtnEvent(){
    const landSection = document.getElementById("land-section");
    const addTempLandAcquirerBtns = landSection.getElementsByClassName("addTempLandAcquirerBtn");
    const removeTempLandAcquirerBtns = landSection.getElementsByClassName("removeTempLandAcquirerBtn");
    const addTempLandCashAcquirerBtns = landSection.getElementsByClassName("addTempLandCashAcquirerBtn");
    const removeTempLandCashAcquirerBtns = landSection.getElementsByClassName("removeTempLandCashAcquirerBtn");
    const TIdxs = TempAcquirer.idxs;
    const TPercentageInputIdxs = TIdxs.percentage.input;
    const AIdxs = Acquirer.idxs;
    for(let i = 0, len = addTempLandAcquirerBtns.length; i < len; i++){
        addTempLandAcquirerBtns[i].addEventListener("click", ()=>{
            //仮フォームを追加
            const land = lands[i];
            const tempLandAcquirers = land.tempLandAcquirers;
            const newIdx = tempLandAcquirers.length;
            const copyFrom = tempLandAcquirers[newIdx - 1].fieldset;
            const att = '[id],[name],[for]';
            const regex = /(acquirer-)\d+/;
            copyAndPasteEl(copyFrom, att, regex, newIdx);
            //仮フォームのインスタンスを追加
            const newId = copyFrom.id.replace(regex, `$1${newIdx}`);
            const newTempLandAcquirer = new TempAcquirer(newId, land);
            newTempLandAcquirer.inputs.forEach(x => x.value = "");
            land.addTempLandAcquirer(newTempLandAcquirer);
            //取得者のフォームを追加
            const landAcquirerTotalForm = document.getElementById("id_land_acquirer-TOTAL_FORMS");
            const newIdx2 = parseInt(landAcquirerTotalForm.value);
            const copyFrom2 = document.getElementById(`id_land_acquirer-${newIdx2 - 1}-fieldset`);
            const att2 = "[id],[name]";
            copyAndPasteEl(copyFrom2, att2, regex, newIdx2);
            landAcquirerTotalForm.value = String(newIdx2 + 1);
            //取得者のインスタンスを追加
            const newId2 = copyFrom2.id.replace(regex, `$1${newIdx2}`);
            const newLandAcquirer = new Acquirer(newId2);
            const newLandAcquirerInputs = newLandAcquirer.inputs;
            for(let j = 0, len = newLandAcquirerInputs.length; j < len; j++){
                if(j === AIdxs.percentage)
                    newLandAcquirerInputs[j].value = "分の"
                else if(j === AIdxs.target)
                    newLandAcquirerInputs[j].value = land.inputs[Land.idxs.index.input].value;
                else
                    newLandAcquirerInputs[j].value = "";
            }
            land.addLandAcquirer(newLandAcquirer);
            //すでに選択された取得者は取得者候補から削除する
            const nowTempLandAcquirer = getLastElFromArray(land.tempLandAcquirers);
            const selectedHeir = nowTempLandAcquirer.inputs[TIdxs.acquirer.input].value;
            const acquirersInput = newTempLandAcquirer.inputs[TIdxs.acquirer.input];
            for (let i = acquirersInput.options.length - 1; i >= 0; i--) {
                if (acquirersInput.options[i].value === selectedHeir) {
                    acquirersInput.remove(i);
                    break;
                }
            }
            //最後の１人の欄を追加するとき、その一人を選択状態にして取得割合を自動で入力して無効化してボタンの有効化判別をする
            if(acquirersInput.options.length === 2){
                acquirersInput.value = acquirersInput.options[1].value;
                let totalFraction = new Fraction(0);
                for(let i = 0, len = land.tempLandAcquirers.length; i < len; i++){
                    if(i === len - 1)
                        break;
                    const inputs = land.tempLandAcquirers[i].inputs;
                    const numerator = parseInt(ZenkakuToHankaku(inputs[TIdxs.percentage.input[no]].value));
                    const denominator = parseInt(ZenkakuToHankaku(inputs[TIdxs.percentage.input[yes]].value));
                    const currentFraction = new Fraction(numerator, denominator);
                    totalFraction = totalFraction.add(currentFraction);
                }
                let resultNumerator = 1 - totalFraction.n * (1 / totalFraction.d);
                let resultDenominator = 1;
                if (resultNumerator !== 1) {
                    // totalFractionが1より小さい場合（例: 3/4）、1から引いた結果を計算
                    resultNumerator = totalFraction.d - totalFraction.n;
                    resultDenominator = totalFraction.d;
                }
                newTempLandAcquirer.inputs[TIdxs.percentage.input[yes]].value = hankakuToZenkaku(String(resultDenominator));
                newTempLandAcquirer.inputs[TIdxs.percentage.input[no]].value = hankakuToZenkaku(String(resultNumerator));
                newTempLandAcquirer.fieldset.disabled = true;
                newTempLandAcquirer.noInputs.length = 0;
                //取得者欄へ転記
                const parts = acquirersInput.value.split("_");
                newLandAcquirer.inputs[AIdxs.contentType2].value = parts[1];
                newLandAcquirer.inputs[AIdxs.objectId2].value = parts[0];
                newLandAcquirer.inputs[AIdxs.percentage].value = newTempLandAcquirer.inputs[TIdxs.percentage.input[yes]].value + "分の" + newTempLandAcquirer.inputs[TIdxs.percentage.input[no]].value;
                //次の土地へボタンの有効化判別
                isActivateOkBtn(land);
            }
            //仮フォームにイベント設定
            for(let j = 0, len = newTempLandAcquirer.inputs.length; j < len; j++){
                if(TPercentageInputIdxs.includes(j)){
                    newTempLandAcquirer.inputs[j].addEventListener("keydown", (e)=>{
                        handleNumInputKeyDown(e);
                        setEnterKeyFocusNext(e, (TPercentageInputIdxs[yes] ? newTempLandAcquirer.inputs[j + 1]: addTempLandAcquirerBtns[i + 1]))
                    })
                }
                newTempLandAcquirer.inputs[j].addEventListener("change", ()=>{
                    const acquirerInputs = newLandAcquirerInputs;
                    const tempAcquirerInputs = newTempLandAcquirer.inputs;
                    const result = tempLandValidation(tempAcquirerInputs, j);
                    //取得者のとき、hidden取得者に転記する
                    if(j === TIdxs.acquirer.input){
                        afterValidation(result, newTempLandAcquirer.errMsgEls[TIdxs.acquirer.form], result, tempAcquirerInputs[j], newTempLandAcquirer);
                        const parts = tempAcquirerInputs[j].value.split("_");
                        acquirerInputs[AIdxs.contentType2].value = parts[0];
                        acquirerInputs[AIdxs.objectId2].value = parts[1] ? parts[1]: "";
                    }else if(TPercentageInputIdxs.includes(j)){
                        //取得割合のとき、合計が１以下になっているかをチェックしてhidden取得者に転記する
                        afterValidation(result, newTempLandAcquirer.errMsgEls[TIdxs.percentage.form], result, tempAcquirerInputs[j], newTempLandAcquirer);
                        tempAcquirerInputs[j].value = hankakuToZenkaku(tempAcquirerInputs[j].value);
                        const regex = j === TPercentageInputIdxs[yes] ? /.*(?=分の)/ : /(?<=分の).*/;
                        acquirerInputs[AIdxs.percentage].value = acquirerInputs[AIdxs.percentage].value.replace(regex, "");
                        if(j === TPercentageInputIdxs[yes])
                            acquirerInputs[AIdxs.percentage].value = tempAcquirerInputs[j].value + acquirerInputs[AIdxs.percentage].value;
                        else
                            acquirerInputs[AIdxs.percentage].value += tempAcquirerInputs[j].value;
                    }
                })
            }
            copyFrom.disabled = true;
            addTempLandAcquirerBtns[i].disabled = true;
            removeTempLandAcquirerBtns[i].disabled = false;
        })
        addTempLandCashAcquirerBtns[i].addEventListener("click", ()=>{

        })
    }
}

/**
 * フィールドセットとインスタンスを削除する
 * @param {TempAcquirer|Acquirer} instances 削除対象のインスタンスが含まれている配列
 */
function removeLastFieldsetAndLastInstance(instances){
    const lastFieldset = getLastElFromArray(instances).fieldset;
    slideUp(lastFieldset, 250, function(){
        lastFieldset.parentNode.removeChild(lastFieldset);
        instances.pop();
    });
}

/**
 * 不動産取得者の削除ボタンにイベントを設定
 */
function setRemoveTempAcquirerBtnEvent(){
    const landSection = document.getElementById("land-section");
    const addTLABtns = Array.from(landSection.getElementsByClassName("addTempLandAcquirerBtn"));
    const removeTLABtns = Array.from(landSection.getElementsByClassName("removeTempLandAcquirerBtn"));
    const addTLCABtns = Array.from(landSection.getElementsByClassName("addTempLandCashAcquirerBtn"));
    const removeTLCABtns = Array.from(landSection.getElementsByClassName("removeTempLandCashAcquirerBtn"));
    const LATotalForms = document.getElementById("id_land_acquirer-TOTAL_FORMS");
    //不動産取得者を削除するボタンに対してループ処理
    for(let i = 0, len = removeTLABtns.length; i < len; i++){
        const TLAs = lands[i].tempLandAcquirers;
        //各ボタンにクリックイベントを設定する
        removeTLABtns[i].addEventListener("click", ()=>{
            //仮フォームが１つになったときは削除ボタンを無効化する
            if(TLAs.length === 2)
                removeTLABtns[i].disabled = true;
            //追加ボタンを有効化する
            addTLABtns[i].disabled = false;
            //前の仮フォームを有効化する
            TLAs[TLAs.length - 2].fieldset.disabled = false;
            //最後の不動産取得者の仮フォームとインスタンスを削除する
            removeLastFieldsetAndLastInstance(TLAs);
            //最後の不動産取得者の隠しフォームとインスタンスを削除する
            removeLastFieldsetAndLastInstance(lands[i].landAcquirers);
            //フォームの数を１減算する
            LATotalForms.value = parseInt(LATotalForms.value) - 1;
        })
    }
}

/**
 * 次の土地へ進むボタンにイベント設定
 */
function setLandOkBtnEvent(){
    const landWrappers = document.getElementsByClassName("landWrapper");
    landOkBtn.addEventListener("click", ()=>{
        //土地情報をループ処理（最後の要素から参照する）
        for(let i = landWrappers.length - 1; 0 <= i; i--){
            //土地情報が表示されているとき
            if(landWrappers[i].style.display !== "none"){
                //表示されている最後の土地情報が最後の土地情報ではないとき
                if(i !== lands.length - 1){
                    //現在の土地情報を無効化する
                    const fieldsets = Array.from(landWrappers[i].getElementsByTagName("fieldset"));
                    fieldsets.forEach(x => x.disabled = true)
                    //次の土地情報を有効化する
                    slideDownAndScroll(landWrappers[i + 1]);
                    isActivateOkBtn(lands[i + 1]);
                    landCorrectBtn.disabled = false;
                    return;
                }else{
                    //最後の土地が表示されているときに押されてしまった場合、何も処理をしない
                    return;
                }
            }
        }
    })
}

/**
 * 前の土地を修正するボタンにイベント設定
 */
function setLandCorrectBtnEvent(){
    const landWrappers = document.getElementsByClassName("landWrapper");
    landCorrectBtn.addEventListener("click", ()=>{
        for(let i = landWrappers.length - 1; 0 <= i; i--){
            //１つ目の土地情報で修正するボタンが有効になってしまっているとき用
            if(i === 0)
                return;
            //１つ目の土地情報に戻るとき、修正ボタンを無効化する
            if(i === 1)
                landCorrectBtn.disabled = true;
            //表示されている土地情報のとき
            if(landWrappers[i].style.display !== "none"){
                //現在表示されている土地情報を非表示にする/一つ前の土地情報を有効化する/次の土地へボタンを有効化する
                slideUp(landWrappers[i]);
                const fieldsets = Array.from(landWrappers[i - 1].getElementsByTagName("fieldset"));
                fieldsets.forEach(x => x.disabled = false);
                landOkBtn.disabled = false;
                return;
            }
        }
    })
}

/**
 * 土地情報欄のイベントなど設定
 */
function setLandSection(){
    //不動産の数で入力された数分の土地のフォーム、hidden不動産取得者、hidden金銭取得者を生成する
    const count = numberOfProperties[0].inputs[NumberOfProperties.idxs.land].value;
    //初めて土地情報を入力するとき
    if(lands.length === 0){
        //インスタンスを生成する
        const land = new Land("id_land-0-fieldset");
        addLandAcquirerInstance(land, 0);
        //土地の数が２以上のとき
        if(count > 1){
            //土地情報の複製
            for(let i = 1; i < count; i++){
                const copyFrom = document.getElementById(`id_land-${i - 1}-wrapper`);
                const clone = copyFrom.cloneNode(true);
                //１つ目のフォームのみ表示
                clone.style.setProperty("display", "none", "important");
                //複製した土地情報の属性値を変更
                clone.id = clone.id.replace(/\d+/, i);
                clone.firstElementChild.textContent = `（${hankakuToZenkaku(String(i + 1))}）`;
                const els = clone.querySelectorAll('[id],[for],[name]');
                els.forEach(x => {
                    if (x.id) {
                        x.id = x.id.replace(/(land[_-])\d+/, `$1${i}`);
                        if(x.id === `id_land-${i}-index`)
                            x.value = `${i}`;
                    }
                    if (x.htmlFor) {
                        x.htmlFor = x.htmlFor.replace(/(land[_-])\d+/, `$1${i}`);
                    }
                    if (x.name) {
                        x.name = x.name.replace(/(land[_-])\d+/, `$1${i}`);
                    }
                });
                copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling);
                const newLand = new Land(`id_land-${i}-fieldset`);
                //土地取得者、金銭取得者のhiddenInputを複製する
                cloneLandAcquirerHiddenInput(`id_land_acquirer-${i - 1}-fieldset`, i);
                cloneLandAcquirerHiddenInput(`id_land_cash_acquirer-${i - 1}-fieldset`, i);
                //土地情報インスタンスに取得者関連インスタンスを紐付ける                
                addLandAcquirerInstance(newLand, i);
            }
            document.getElementById("id_land-TOTAL_FORMS").value = count;
            document.getElementById("id_land_acquirer-TOTAL_FORMS").value = count;
            document.getElementById("id_land_cash_acquirer-TOTAL_FORMS").value = count;
        }
        //取得者候補を追加する
        addAcquirerCandidate();
        //土地情報の各入力欄のイベントを設定
        setLandEvent();
        //通常分割のとき、換価確認欄を非表示にして「しない」にチェックを入れる
        if(typeOfDivisions[0].inputs[TypeOfDivision.idxs.typeOfDivision.input[yes]].checked){
            const isExchangeIdxs = Land.idxs.isExchange;
            const exchangeNoIdx = isExchangeIdxs.input[no];
            lands.forEach(x => {
                const exchangeNoInput = x.inputs[exchangeNoIdx];
                x.Qs[isExchangeIdxs.form].style.display = "none";
                exchangeNoInput.checked = true;
                exchangeNoInput.dispatchEvent(new Event("change"));
            })
        }
        //土地又は金銭取得者の仮フォームの各入力欄のイベントを設定
        setLandTempAcquiresEvent();
        //取得者仮フォームを追加ボタンのイベント設定
        setAddTempAcquirerBtnEvent();
        //不動産取得者を削除ボタンのイベント設定
        setRemoveTempAcquirerBtnEvent();
        //次の土地へ進むボタンのイベント設定
        setLandOkBtnEvent();
        //前の土地を修正するボタンのイベント設定
        setLandCorrectBtnEvent();
    }else{
        //土地情報を入力したことがあるとき
    }
}

/**
 * 次の項目へ進むボタンのイベント設定処理
 */
function handleOkBtnEvent(){
    //全セクションタグに対してループ処理
    const sections = document.getElementsByTagName("section");
    for(let i = 0, len = sections.length; i < len; i++){
        //非表示のセクションのとき
        if (window.getComputedStyle(sections[i]).display === 'none') {
            //共通処理
            
            //相続人情報のとき、相続人情報セクションを表示してループを中止
            if(sections[i].id === "heirs-section"){
                handleOkBtnEventCommon(sections[i], sections[i - 1], 2);
                setHeirsSection();
                break;
            }else if(sections[i].id === "type-of-division-section"){
                if(checkHeirsSection() === false){
                    return;
                };
                heirsCorrectBtn.disabled = true;
                handleOkBtnEventCommon(sections[i], sections[i - 1], 3);
                setTypeOfDivisionSection();
                break;
            }else if(sections[i].id === "number-of-properties-section"){
                handleOkBtnEventCommon(sections[i], sections[i - 1], 4);
                setNumberOfPropertiesSection();
                break;
            }else if(sections[i].id === "land-section"){
                handleOkBtnEventCommon(sections[i], sections[i - 1], 4);
                setLandSection();
                break;
            }
        }
    }
    //修正ボタンを有効化
    correctBtn.disabled = false;
}

/**
 * ２．に戻るボタンのイベント設定処理
 * ・progressを２．５にする
 * ・前のページに遷移する処理中はスピナーを表示する
 * ・処理が成功したときは前のページに戻る
 * ・エラーのときはこのページに留まる
 */
function handlePreBtnEvent(){
    document.getElementById("spinner").style.display = "";
    preBtn.disabled = true;
    const data = { "progress" : 2.5 };
    fetch('step_back', {  // PythonビューのURL
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    }).then(response => {
        if (response.status === 'success'){
            window.location.href = 'step_two';
        }else if(response.status === "error"){
            window.location.href = 'step_three';
        }
    }).catch(error => {
        console.error('Error:', error);
        window.location.href = 'step_three';

    });
}

/**
 * 
 * 以下、イベントリスナー
 * 
 */
window.addEventListener("load", ()=>{
    initialize();
})

/**
 * 画面のサイズを変更したとき
 */
window.addEventListener('resize', () => {
    setSidebarHeight();
});

/**
 * 登記上の氏名と住所を追加ボタンのクリックイベント
 */
addRegistryAddressButton.addEventListener("click", ()=>{
    handleAddRegistryAddressButtonEvent();
})

/**
 * 登記上の氏名と住所を削除ボタンのクリックイベント
 */
removeRegistryAddressButton.addEventListener("click", ()=>{
    handleRemoveRegistryAddressButton("registryNameAndAddressFieldset", registryNameAndAddresses, addRegistryAddressButton, removeRegistryAddressButton);
})

/**
 * 相続人情報の前の人に戻るボタン
 * ・前の相続人の表示処理
 */
heirsCorrectBtn.addEventListener("click", ()=>{
    handleHeirsCorrectEvent();
})

/**
 * 相続人情報の次の人に進むボタン
 * ・次の相続人の表示処理
 */
heirsOkBtn.addEventListener("click", ()=>{
    handleHeirsOkBtnEvent();
})

/**
 * 前の項目を修正するボタンのクリックイベント
 * ・一つ前のセクションに戻る処理
 */
correctBtn.addEventListener("click", ()=>{
    handleCorrectBtnEvent();
})

/**
 * 次の項目へ進むボタンのクリックイベント
 */
okBtn.addEventListener("click", ()=>{
    handleOkBtnEvent();
})

/*
 * 前に戻るボタンのクリックイベント
 */
preBtn.addEventListener("click", ()=>{
    handlePreBtnEvent();
})

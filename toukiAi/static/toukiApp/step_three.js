"use strict";

const sections = document.getElementsByTagName("section");

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
const RIdxs = RegistryNameAndAddress.idxs;
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
const {typeOfDivision: TODTypeOfDivision,
    propertyAllocation: TODPropertyAllocation,
    contentType1: TODContentType1,
    objectId1: TODObjectId1,
    cashAllocation: TODCashAllocation,
    allCashAcquirer: TODAllCashAcquirer,
    contentType2: TODContentType2,
    objectId2: TODObjectId2
} = TypeOfDivision.idxs;


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
const {land: NOPLand,
    house: NOPHouse,
    bldg: NOPBldg
} = NumberOfProperties.idxs;

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
        this.tempAcquirers = [];
        this.tempCashAcquirers = [];
        this.acquirers = [];
        this.cashAcquirers = [];
    }

    addTempAcquirer(acquirer){
        this.tempAcquirers.push(acquirer);
    }
    addTempCashAcquirer(acquirer){
        this.tempCashAcquirers.push(acquirer);
    }
    addAcquirer(acquirer){
        this.acquirers.push(acquirer);
    }
    addCashAcquirer(acquirer){
        this.cashAcquirers.push(acquirer);
    }
}
const {number: LNumber, 
    address: LAddress, 
    landNumber: LLandNumber, 
    purparty: LPurparty, 
    office: LOffice, 
    price: LPrice, 
    isExchange: LIsExchange,
    index: LIndex
} = Land.idxs;

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
const {acquirer: TAAcquirer,
    percentage: TAPercentage
} = TempAcquirer.idxs;

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
const {contentType2: AContentType,
    objectId2: AObjectId,
    percentage: APercentage,
    target: ATarget
} = Acquirer.idxs;

//土地情報欄のボタン
const landSection = document.getElementById("land-section");
const removeTLABtns = landSection.getElementsByClassName("removeTempLandAcquirerBtn");
const addTLABtns = landSection.getElementsByClassName("addTempLandAcquirerBtn");
const removeTLCABtns = landSection.getElementsByClassName("removeTempLandCashAcquirerBtn");
const addTLCABtns = landSection.getElementsByClassName("addTempLandCashAcquirerBtn");
//前の土地に戻るボタンと次の土地へ進むボタン
const landCorrectBtn = document.getElementById("landCorrectBtn");
const landOkBtn = document.getElementById("landOkBtn");

//建物情報
const houses = [];
class House extends Fieldset{
    //入力欄のインデックス
    static idxs = {
        number:{form: 0, input: 0},
        address:{form: 1, input: 1},
        houseNumber:{form: 2, input: [2,3,4]},
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
            i !== House.idxs.houseNumber.input[other] &&
            i !== House.idxs.houseNumber.input[no] &&
            i !== House.idxs.purparty.input[yes] &&
            i !== House.idxs.purparty.input[other2] &&
            i !== House.idxs.index.input
        );
        houses.push(this);
        this.tempAcquirers = [];
        this.tempCashAcquirers = [];
        this.acquirers = [];
        this.cashAcquirers = [];
    }

    addTempAcquirer(acquirer){
        this.tempAcquirers.push(acquirer);
    }
    addTempCashAcquirer(acquirer){
        this.tempCashAcquirers.push(acquirer);
    }
    addAcquirer(acquirer){
        this.acquirers.push(acquirer);
    }
    addCashAcquirer(acquirer){
        this.cashAcquirers.push(acquirer);
    }
}
const {number: HNumber, 
    address: HAddress, 
    houseNumber: HHouseNumber, 
    purparty: HPurparty, 
    office: HOffice, 
    price: HPrice, 
    isExchange: HIsExchange,
    index: HIndex
} = House.idxs;

//建物情報欄のボタン
const houseSection = document.getElementById("house-section");
const removeTHABtns = houseSection.getElementsByClassName("removeTempHouseAcquirerBtn");
const addTHABtns = houseSection.getElementsByClassName("addTempHouseAcquirerBtn");
const removeTHCABtns = houseSection.getElementsByClassName("removeTempHouseCashAcquirerBtn");
const addTHCABtns = houseSection.getElementsByClassName("addTempHouseCashAcquirerBtn");
//前の建物に戻るボタンと次の建物へ進むボタン
const houseCorrectBtn = document.getElementById("houseCorrectBtn");
const houseOkBtn = document.getElementById("houseOkBtn");


//修正するボタンと次の項目へボタン
const correctBtn = document.getElementById("correctBtn");
const okBtn = document.getElementById("okBtn");
const statusText = document.getElementById("statusText");
//２を修正するボタンと４へ進むボタン
const preBtn = document.getElementById("preBtn");

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
    const isInstanceVerified = instance.noInputs.length === 0;
    //被相続人情報のとき、被相続人と登記簿上の氏名・住所の両方のエラー要素がないとき次の項目へボタンを有効化する
    if(instance instanceof Decedent || instance instanceof RegistryNameAndAddress){
        const isDecedentSectionVerified = !decedents.concat(registryNameAndAddresses).some(x => x.noInputs.length !== 0);
        okBtn.disabled = !isDecedentSectionVerified;
    }else if(instance instanceof SpouseOrAscendant || instance instanceof DescendantOrCollateral){
        //相続人情報のとき、最後の相続人でエラー要素がないとき次の項目へボタンを有効化する/他の相続人のエラー要素がないときは次の人へボタンを有効化する
        const isLastHeir = getLastElFromArray(heirs) === instance;
        const isLastHeirVerified = isLastHeir && isInstanceVerified;
        if(isLastHeirVerified)
            okBtn.disabled = false;
        else if(isInstanceVerified)
            heirsOkBtn.disabled = false;
    }else if(instance instanceof Land || instance instanceof House || instance instanceof TempAcquirer){
        //不動産情報を検証して各ボタンの有効化判別
        verifyPropertySection(instance instanceof Land || instance instanceof House ? instance: instance.belongsTo);
    }else{
        //その他の欄のとき、インスタンスの検証が通れば次の項目へボタンを有効化する
        if(isInstanceVerified)
            okBtn.disabled = false;
    }

    /**
         * 取得割合の検証
         * @param {TempAcquirer} TAs 
         * @returns {boolean} 検証結果
         */
    function isHundredPercent(temps){
        //土地取得者又は金銭取得者が１人又は法定相続のとき、trueを返す(取得割合の検証不要)
        const temp = temps[0];
        const prefix = getPropertyPrefix(temp.belongsTo);
        const fieldsetId = temp.fieldset.id;
        const TODInputs = typeOfDivisions[0].inputs;
        const isLAAutoInputted = fieldsetId.includes(`temp_${prefix}_acquirer-`) && (TODInputs[TODPropertyAllocation.input[yes]].checked || TODInputs[TODObjectId1.input].value !== "");
        const isLCALegalAutoInputted = fieldsetId.includes(`temp_${prefix}_cash_acquirer`) && (TODInputs[TODCashAllocation.input[no]].checked || TODInputs[TODObjectId2.input].value !== "");
        if(isLAAutoInputted || isLCALegalAutoInputted)
            return true;

        //法定相続ではないとき、対象の全仮フォームをチェックして取得割合を取得する
        const percentageIdxs = TAPercentage.input;
        let totalFraction = new Fraction(0);
        temps.forEach(x =>{
            const inputs = x.inputs;
            const bottom = parseInt(ZenkakuToHankaku(inputs[percentageIdxs[yes]].value), 10);
            const top = parseInt(ZenkakuToHankaku(inputs[percentageIdxs[no]].value), 10);
            if(bottom && top)
                totalFraction = totalFraction.add(new Fraction(top, bottom));
        })

        //取得割合が１を超えるとき、分子を空欄にしてエラーメッセージを表示する
        if(totalFraction.compare(1) > 0){
            const top = instance.inputs[percentageIdxs[no]];
            top.value = "";
            const msg = "取得割合の合計は１になるように入力してください";
            afterValidation("false", instance.errMsgEls[TAPercentage.form], msg, top, instance);
            return false;
        }else
            return totalFraction.equals(1);
    }

    /**
     * 土地情報の検証
     * @param {Land|House} instance 
     */
    function verifyPropertySection(instance){
        const prefix = upperFirstString(getPropertyPrefix(instance));
        const instances = prefix === "Land"? lands: (prefix === "House"? houses: houses);
        const propertyOkBtn = prefix === "Land"? landOkBtn: (prefix === "House"? houseOkBtn: houseOkBtn);
        const propertyVerified = instance.noInputs.length === 0;
        const TAs = instance.tempAcquirers;
        const TAsPurpartyVerified = isHundredPercent(TAs);
        const TAVerified = getLastElFromArray(TAs).noInputs.length === 0;
        const TCAs = instance.tempCashAcquirers;
        const TCAsPurpartyVerified = instance.inputs[LIsExchange.input[yes]].checked ? isHundredPercent(TCAs): true;
        const TCAVerified = getLastElFromArray(TCAs).noInputs.length === 0;
        const isFormsVerified = propertyVerified && TAVerified && TAsPurpartyVerified && TCAVerified && TCAsPurpartyVerified;
        const isLastFormsVerified = getLastElFromArray(instances) === instance && isFormsVerified;
        //最後の不動産欄の検証が通ったとき
        if(isLastFormsVerified){
            //次の土地へボタンを無効化する、次の項目へボタンを有効化する
            propertyOkBtn.disabled = true;
            okBtn.disabled = false;
        }else if(isFormsVerified){
            //最後以外の不動産欄の検証が通ったとき
            propertyOkBtn.disabled = false;
        }else{
            //検証が通らないインスタンスがあるとき、次の土地へボタンと次の項目へボタンを無効化する
            propertyOkBtn.disabled = true;
            okBtn.disabled = true;
        }
        //仮取得者のフォームエラーなし、かつ取得割合が１分の１ではないとき、かつ候補者が残っているとき不動産取得者の追加ボタンを有効化する
        const isTAsAllSelected = TAs[0].inputs[TAAcquirer.input].options.length - 1 === TAs.length;
        const TAAddBtn = getLastElFromArray(TAs).fieldset.nextElementSibling.getElementsByClassName(`addTemp${prefix}AcquirerBtn`)[0];
        TAAddBtn.disabled = TAVerified && !TAsPurpartyVerified && !isTAsAllSelected ? false: true;
        const isTCAsAllSelected = TCAs[0].inputs[TAAcquirer.input].options.length - 1 === TCAs.length;
        const TCAAddBtn = getLastElFromArray(TCAs).fieldset.nextElementSibling.getElementsByClassName(`addTemp${prefix}CashAcquirerBtn`)[0];
        TCAAddBtn.disabled = TCAVerified && !TCAsPurpartyVerified && !isTCAsAllSelected ? false: true;
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
    for(let i = 0; i < RNAACount; i++){
        const instance = registryNameAndAddresses[i];
        for(let j = 0, len = instance.inputs.length; j < len; j++){
            const input = instance.inputs[j];
            if(input.value != ""){
                //都道府県のとき、市区町村データを取得する
                if(j === RIdxs.prefecture)
                    await getCityData(input.value, instance.inputs[RIdxs.city], instance);
                //入力データがあるとき、エラー要素から削除する
                instance.noInputs = instance.noInputs.filter(x => x.id !== input.id)
            }
        }
    }
    //市区町村データを反映させる
    getRegistryNameAndAddressCityData().then(citys => {
        if(citys.length > 0){
            for(let i = 0, len = citys.length; i < len; i++){
                registryNameAndAddresses[i].inputs[RIdxs.city].value = citys[i];
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
    //氏名のときは全角チェック
    if(idx === RIdxs.name){
        return isOnlyZenkaku(el);
    }else if([RIdxs.prefecture, RIdxs.city].includes(idx)){
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
    if(!instance.noInputs.some(x => x.id === el.id)){
        instance.noInputs.push(el);
        if(instance instanceof SpouseOrAscendant || instance instanceof DescendantOrCollateral)
            heirsOkBtn.disabled = true;
        else if(instance instanceof Land || instance instanceof House || instance instanceof TempAcquirer){
            const prefix = "belongsTo" in instance? getPropertyPrefix(instance.belongsTo): getPropertyPrefix(instance);
            //次の不動産へボタンの無効化
            if(prefix === "land"){
                landOkBtn.disabled = true;
            }else if(prefix === "house"){
                houseOkBtn.disabled = true;
            }else{
                throw new Error("pushInvalidEl：想定しない型が渡されました")
            }
            if(instance instanceof TempAcquirer){
                const fixedPrefix = upperFirstString(prefix);
                if(instance.fieldset.id.includes(`temp_${prefix}_acquirer`))
                    instance.fieldset.nextElementSibling.getElementsByClassName(`addTemp${fixedPrefix}AcquirerBtn`)[0].disabled = true;
                else
                    instance.fieldset.nextElementSibling.getElementsByClassName(`addTemp${fixedPrefix}CashAcquirerBtn`)[0].disabled = true;
            }
        }
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
        if(!el.id.includes("bldg") && !el.id.includes("land_number_bottom") && !el.id.includes("house_number_bottom"))
            pushInvalidEl(instance, el);

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
                setEnterKeyFocusNext(e, registryNameAndAddress.inputs[RIdxs.name]);
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
    //登記簿上の氏名住所のインスタンスの各インプット要素に対して処理
    for(let i = 0, len = inputs.length; i < len; i++){
        if(i === RIdxs.name){
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
            if(i !== RIdxs.bldg)
                instance.errMsgEls[RIdxs.bldg].style.display = "none";
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if(i === RIdxs.prefecture){
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
    clone.id = clone.id.replace(regex, `$1${newIdx}`);
    const els = clone.querySelectorAll(att);
    els.forEach(el => {
        if(att.includes("[id]") && el.id)
            el.id = el.id.replace(regex, `$1${newIdx}`);
        if(att.includes("[name]") && el.name)
            el.name = el.name.replace(regex, `$1${newIdx}`);
        if(att.includes("[for]") && el.htmlFor)
            el.htmlFor = el.htmlFor.replace(regex, `$1${newIdx}`);
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
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RIdxs.bldg].style.display = "none";
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
        if(i === RIdxs.city)
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
        instance.inputs[Sidxs.city].disabled = true;
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
    for (let i = sections.length - 1; i >= 0; i--) {
        //表示されているとき
        const isDisplayedSection = window.getComputedStyle(sections[i]).display !== 'none';
        if(isDisplayedSection){
            //表示されている最後のセクションをスライドアップする
            slideUp(sections[i]);
            //使用された直前のセクションを取得する
            let preSection;
            if(sections[i].id === "application-section"){
                if(parseInt(typeOfDivisions[0].inputs[NOPBldg].value) > 0){
                    preSection = sections[i - 1];
                }else if(parseInt(typeOfDivisions[0].inputs[NOPHouse].value) > 0){
                    preSection = document.getElementById("house-section");
                }else{
                    preSection = landSection;
                }
            }else{
                preSection = sections[i - 1];
            }
            const fieldsets = Array.from(preSection.getElementsByTagName("fieldset"));
            fieldsets.forEach(x => x.disabled = false);
            okBtn.disabled = false;
            const preSectionNumbering = preSection.querySelector("h5").textContent.trim().substring(0, 1);
            statusText.textContent = `現在${preSectionNumbering}／５項目`;
            //被相続人情報に戻るとき、不動産取得者がいない旨のエラーメッセージを非表示にする、前の項目を修正するボタンを無効化する
            if(preSection.id === "decedent-section"){  
                okBtn.nextElementSibling.style.display = "none";
                correctBtn.disabled = true;
                addRegistryAddressButton.disabled = false;
            }else if(preSection.id === "heirs-section" && heirs.length > 1){
                //相続人情報に戻るとき、かつ相続人（故人を含む）が複数人いるとき
                heirsCorrectBtn.disabled = false;
                const lastInstance = getLastElFromArray(heirs);
                heirs.forEach(x =>{
                    if(x != lastInstance){
                        x.fieldset.disabled = true;
                    }
                })
                scrollToTarget(lastInstance.fieldset);
                break;
            }else if(preSection.id === "land-section" && lands.length > 1){
                //土地情報、最後の要素にスクロールする
                landCorrectBtn.disabled = false;
                const lastInstance = getLastElFromArray(lands);
                lands.forEach(x =>{
                    if(x != lastInstance){
                        x.fieldset.disabled = true;
                        x.tempAcquirers.forEach(y => y.fieldset.disabled = true);
                        x.tempCashAcquirers.forEach(y => y.fieldset.disabled = true);
                    }
                })
                //土地取得者の仮フォームのラッパーが表示されている、かつ２以上のフォームがあるとき削除ボタンを有効化する
                if(lastInstance.tempAcquirers[0].fieldset.parentElement.style.display !== "none" && lastInstance.tempAcquirers.length > 1){
                    getLastElFromArray(removeTLABtns).disabled = true;
                }
                //金銭取得者の仮フォームのラッパーが表示されている、かつ２以上のフォームがあるとき削除ボタンを有効化する
                if(lastInstance.tempCashAcquirers[0].fieldset.parentElement.style.display !== "none" && lastInstance.tempCashAcquirers.length > 1){
                    const removeTLCABtns = preSection.getElementsByClassName("removeTempLandCashAcquirerBtn");
                    getLastElFromArray(removeTLCABtns).disabled = true;
                }
                scrollToTarget(lastInstance.fieldset);
                break;
            }else if(preSection.id === "house-section"){
                //建物情報に戻るとき
                // scrollToTarget(getLastElFromArray(lands).fieldset);
                break;
            }else if(preSection.id === "bldg-section"){
                //区分建物情報に戻るとき、４．進むボタンを無効化する
                // scrollToTarget(getLastElFromArray(lands).fieldset);
                submitBtn.disabled = true;
                break;
            }
            scrollToTarget(sections[i - 1]);
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
function handleOkBtnEventCommon(section, preSection, index){
    slideDown(section);
    //前のセクション内にあるフィールドセットを無効化する
    const fieldsets = Array.from(preSection.getElementsByTagName("fieldset"));
    fieldsets.forEach(x => x.disabled = true);
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
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RIdxs.bldg].style.display = "none";
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
            if(i > 0)
                fieldsets[i].style.display = "none";
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
    const target = heirs.filter(x => !x.fieldset.disabled)[0].fieldset;
    scrollToTarget(target);
}

/**
 * 相続人情報セクションをチェックする
 * ・不動産を取得する人がいるか
 */
function checkHeirsSection(){
    //全相続人のインスタンスに対してループ処理
    for(let i = 0, len = heirs.length; i < len; i++){
        //不動産を取得する人がいるときは、処理を中止
        const heir = heirs[i];
        if(heir.inputs[heir.constructor.idxs.isAcquire[yes]].checked)
            return true;
    }
    //不動産を取得する人がいないとき、その旨エラーメッセージを表示する
    const errEl = document.getElementById("statusArea").getElementsByClassName("errorMessage")[0];
    errEl.style.display = "";
    errEl.innerHTML = "不動産を取得する人がいないため先に進めません。<br>一人以上が不動産を取得する必要があります。"
    return false;
}

/**
 * selectに法定相続人全員を追加する
 * ・第２引数をfalseにすると１つ目のoptionはvalue空白の「選択してください」を追加しない
 * @param {HTMLSelectElement} select 
 * @param {boolean} includePrompt 「選択してください」を含めるかどうか
 */
function addAllLegalHeirsToSelect(select, includePrompt = true){
    select.options.length = 0;
    const candidates = getAllLegalHeirs();
    if(includePrompt)
        select.add(createOption("", "選択してください"));
    candidates.forEach(x => {
        const idxs = x.constructor.idxs;
        const inputs = x.inputs;
        select.add(createOption(inputs[idxs.idAndContentType].value, inputs[idxs.name].value));
    })
}

/**
 * 遺産分割の方法セクションのchangeインベントを設定する
 * @param {TypeOfDivision} instance 
 * @param {number} i 
 */
function TODChangeEventHandler(instance, i){
    const {inputs, Qs, noInputs} = instance;
    const cashAllocationQ = Qs[TODCashAllocation.form];
    const cashAllocationInputIdxs = TODCashAllocation.input;
    const allCashAcquirerQ = Qs[TODAllCashAcquirer.form];
    const allCashAcquirerInputIdx = TODAllCashAcquirer.input;
    const allCashAcquirerInput = inputs[allCashAcquirerInputIdx];
    const typeOfDivisionInputIdxs = TODTypeOfDivision.input;
    const {input: propertyAllocationInputIdxs, form: propertyAllocationFormIdx} = TODPropertyAllocation;
    const isPropertyAcquirerAlone = inputs[TODContentType1.input].value !== "";
    const isPropertyAcquirerFree = inputs[propertyAllocationInputIdxs[no]].checked;
    const propertyAllocationQ = Qs[propertyAllocationFormIdx];
    const propertyAllocationInputYes = inputs[propertyAllocationInputIdxs[yes]];
    const cashAllocationInputYes = inputs[cashAllocationInputIdxs[yes]];
    const contentType2Input = inputs[TODContentType2.input];
    const objectId2Input = inputs[TODObjectId2.input];
    //遺産分割の方法のとき
    if(typeOfDivisionInputIdxs.includes(i)){
        const isPropertyAllocationDecided = (isPropertyAcquirerAlone || isPropertyAcquirerFree);
        //通常のとき
        if(i === typeOfDivisionInputIdxs[yes]){
            handleNormalDivision(isPropertyAllocationDecided);
        }else{
            //不動産取得者が１人又は２人以上で全員未満のとき
            if(isPropertyAllocationDecided){
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

    //通常分割のときの処理
    function handleNormalDivision(isPropertyAllocationDecided){
        //不動産の取得方法が決まっているとき
        if(isPropertyAllocationDecided){
            activateOkBtn();
        }else{
            //決まってないとき
            //不動産取得者欄を表示する
            slideDownIfHidden(propertyAllocationQ);
            //すでに取得方法がチェックされているとき、次へボタンを有効化する
            if(propertyAllocationInputIdxs.some(x => inputs[x].checked))
                activateOkBtn();
            else
                //未入力のときは、エラー要素を追加して次の項目へ進むボタンを無効化する
                pushInvalidEl(instance, propertyAllocationInputYes);
        }   
        //金銭取得方法欄が表示されているとき、非表示にして初期化
        iniCashRelatedQs();
    }

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
        }
    }
    //次の項目へ進むボタンを有効化する処理
    function activateOkBtn(){
        noInputs.length = 0;
        isActivateOkBtn(instance);
    }
}

/**
 * 遺産分割方法セクションのイベントなど設定
 */
function setTypeOfDivisionSection(){
    //不動産取得者
    const acquirers = heirs.filter(heir => heir.inputs[heir.constructor.idxs.isAcquire[yes]].checked);
    const isAcquireAlone = acquirers.length === 1;
    //不動産を取得しない相続人
    const notAcquirers = heirs.filter(heir => heir.inputs[heir.constructor.idxs.isAcquire[no]].checked);
    const isNotAcquirers = notAcquirers.length > 0;
    //初回の遺産分割方法セクションを表示するとき
    if(typeOfDivisions.length === 0){
        //インスタンス生成
        const instance = new TypeOfDivision("id_type_of_division-0-fieldset");
        const inputs = instance.inputs;
        //不動産取得者が一人のとき、content_type1とobject_id1に値を代入する
        if(isAcquireAlone)
            inputAllAcquirer(instance, acquirers[0]);
        //全員が不動産取得者ではないとき、不動産取得者欄のその他にチェックを入れる
        else if(isNotAcquirers)
            inputs[TODPropertyAllocation.input[no]].checked = true;
        //金銭取得者をselectに追加する
        addAllLegalHeirsToSelect(instance.inputs[TODAllCashAcquirer.input]);
        //イベントを設定
        for(let i = 0, len = inputs.length; i < len; i++){
            inputs[i].addEventListener("change", ()=>{
                TODChangeEventHandler(instance, i);
            })
        }
        //次の項目へ進むボタンを無効化する
        okBtn.disabled = true;
    }else{
        let newPattern = isAcquireAlone ? yes : (isNotAcquirers ? no : other);
        const instance = typeOfDivisions[0]
        const {inputs, Qs} = instance;
        const wasAlone = inputs[TODContentType1.input].value !== "";
        const wasNotAcquirers = inputs[TODPropertyAllocation.input[no]].checked;
        const wasLegalInheritance = inputs[TODPropertyAllocation.input[yes]].checked;
        let oldPattern = wasAlone ? yes: (wasNotAcquirers ? no: (wasLegalInheritance ? other: other2));
        //不動産取得者の数に変更があるとき
        if(newPattern !== oldPattern){
            //インスタンスの初期化処理
            //質問欄の表示を遺産分割の方法のみにする
            Qs.forEach(x => {
                if(x !== Qs[TODTypeOfDivision.form])
                    x.style.display = "none";
            })
            //inputとselectの初期化
            inputs.forEach(x => {
                if(x.type === "radio")
                    x.checked = false;
                else
                    x.value = "";
            })
            pushInvalidEl(instance, inputs[TODTypeOfDivision.input[yes]]);
            //不動産取得者が一人になったとき
            if(newPattern === yes)
                inputAllAcquirer(instance, acquirers[0]);
            //不動産取得者が二人以上、全員未満になったとき
            else if(newPattern === no)
                inputs[TODPropertyAllocation.input[no]].checked = true;
        }else{
            //変更がないとき
            if(newPattern === yes)
                inputAllAcquirer(instance, acquirers[0]);
        }

        //入力状況に応じて次の項目へ進むボタンを有効化又は無効化する
        okBtn.disabled = instance.noInputs.length === 0 ? false: true;
    }

    //不動産の全取得者のidとcontent_typeを取得して遺産分割方法インスタンスに代入する
    function inputAllAcquirer(instance, acquirer){
        const parts = acquirer.inputs[acquirer.constructor.idxs.idAndContentType].value.split("_");
        const inputs = instance.inputs;
        inputs[TODObjectId1.input].value = parts[0];
        inputs[TODContentType1.input].value = parts[1];
    }
    scrollToTarget(typeOfDivisions[0].fieldset);
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
    const isAny = numberOfProperties[0].inputs.some(x => parseInt(x.value) > 0);
    okBtn.disabled = isAny ? false: true;
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
        okBtn.disabled = true;
    }
    scrollToTarget(typeOfDivisions[0].fieldset);
}

/**
 * 土地インスタンスをよく使用する変数に分解する
 * @param {Land|House} instance 
 * @returns 
 */
function propertyDataToVariable(instance){
    return{
        property: instance,
        fieldset: instance.fieldset,
        Qs: instance.Qs,
        inputs: instance.inputs,
        errMsgEls: instance.errMsgEls,
        noInputs: instance.noInputs,
        TAs: instance.tempAcquirers,
        TAWrapper: instance.fieldset.nextElementSibling,
        TCAs: instance.tempCashAcquirers,
        TCAWrapper: instance.fieldset.nextElementSibling.nextElementSibling,
        As: instance.acquirers,
        CAs: instance.cashAcquirers,
        propertyWrapper: instance.fieldset.parentElement.parentElement
    }
}

/**
 * 重複入力チェック
 * @param {Fieldset[]} instances
 * @param {number} inputIdx 
 * @returns 
 */
function isDuplicateInput(instances, inputIdx){
    // lands 配列から各要素の特定の入力値を取得
    const targets = instances.filter(x => x.inputs[inputIdx].value !== "").map(x => hankakuToZenkaku(x.inputs[inputIdx].value));
    // Setを使用してユニークな値のみを保持
    const uniques = new Set(targets);
    // ユニークな値の数と元のリストのサイズを比較
    if(uniques.size !== targets.length)
        return "すでに入力された不動産番号です";
    return true;
}

/**
 * 不動産番号の検証
 * 空欄/整数/１３桁/重複
 * @param {HTMLElement} input 
 */
function propertyNumberValidation(input){
    let result = isBlank(input);
    if(result !== false)
        return result;
    if(!isNumber(input.value, input))
        return "数字で入力してください";
    result = isDigit(input, "propertyNumber");
    if(typeof result === "string")
        return result;
    result = isDuplicateInput(lands, LNumber.input);
    if(typeof result === "string"){
        input.value = "";
        return result;
    }
    return true;
}

/**
 * 地番又は家屋番号の枝番の検証
 * 空欄のときなにもしない/整数
 * @param {HTMLElement} input 
 * @returns 
 */
function branchNumberValidation(input){
    const inputVal = input.value;
    if(inputVal == "")
        return true;
    if(!isNumber(inputVal, input))
        return "数字のみで入力してください";
    const result = validateIntInput(input);
    return typeof result === "string" ? result: true;
}

/**
 * 土地情報のバリデーション
 * ※※※インデックスは不動産共通のため仮に土地のものを使用している※※※
 * @param {HTMLCollection} inputs 対象のインスタンスの全input要素
 * @param {number} idx チェック対象のinput要素のインデックス
 */
function propertyValidation(inputs, idx){
    const input = inputs[idx];
    //不動産番号のとき、空欄、整数、１３桁、重複
    if(idx === LNumber.input){
        return propertyNumberValidation(input);
    }else if([LAddress.input, LOffice.input].includes(idx)){
        //所在地、法務局のとき、空欄チェック
        const result = isBlank(input);
        return (result !== false) ? result: true;
    }else if(idx === LLandNumber.input[no]){
        //地番・家屋番号の枝番のとき、（空欄のときは何もしない）整数
        return branchNumberValidation(input);
    }else if([LLandNumber.input[yes], LPurparty.input[no], LPurparty.input[other], LPrice.input].includes(idx)){
        //地番・家屋番号の主番、所有権・持分、評価額のとき、共通：空欄、整数
        let result = isBlank(input);
        if(result !== false)
            return result;
        //評価額のとき、コンマを削除する
        if(idx === LPrice.input)
            input.value = removeCommas(input.value);
        if(!isNumber(input.value, input))
            return "数字のみで入力してください";
        result = validateIntInput(input);
        if(typeof result === "string")
            return result;
        //所有権割合の分子が分母を超えてないかチェック
        const isPurpartyInput = [LPurparty.input[no], LPurparty.input[other]].includes(idx);
        const bottomVal = inputs[LPurparty.input[no]].value;
        const topVal = inputs[LPurparty.input[other]].value;
        if(isPurpartyInput && bottomVal !== "" && topVal !== ""){
            const bottom = parseInt(ZenkakuToHankaku(bottomVal));
            const top = parseInt(ZenkakuToHankaku(topVal));
            if(bottom < top)
                return "分子は分母以下の数字にしてください";
        }
    }

    return true;
}

/**
 * 法務局データを取得する
 * @param {string} officeCode 半角４桁の数字の文字列
 * @param {HTMLInputElement} el 
 * @param {Land|House} el 
 */
async function getOfficeData(officeCode, el, instance){
    instance.noInputs = instance.noInputs.filter(x => x.id !== el.id);
    //データ取得中ツールチップを表示する
    const verifyingEl = `<div id="${el.id}_verifyingEl" class="verifying emPosition" style="z-index: 100; position: absolute;">
    法務局データ取得中
    <div class="spinner-border text-white spinner-border-sm" role="status">
    </div>
    </div>`;
    el.insertAdjacentHTML('afterend', verifyingEl);
    //都道府県に紐づく市区町村データを取得して表示できるようにする
    const url = 'get_office';
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify({"officeCode" : officeCode}),
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
        el.disabled = false;
        if(response.office !== ""){
            //法務局名を入力してエラーメッセージを非表示にする
            el.value = response.office
            el.disabled = true;
            errorMessageEl.style.display = "none";
        }else{
            //取得できなかったときは、エラーメッセージを表示してエラー要素として市区町村要素を取得する
            el.value = "";
            errorMessageEl.style.display = "block";
            instance.noInputs.push(el);
        }
        el.disabled = true;
    }).catch(error => {
        console.log(`getOfficeDataの処理でエラーが発生しました：${error}`);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        isActivateOkBtn(instance);
    });
}

/**
 * 法定相続人全員を返す
 * @returns 法定相続人全員を格納した配列
 */
function getAllLegalHeirs() {
    return heirs.filter(x => {
        const idxs = x.constructor.idxs.isAcquire;
        const inputs = x.inputs;
        return inputs[idxs[yes]].checked || inputs[idxs[no]].checked;
    });
}

/**
 * 取得候補者全員を返す
 * @returns 取得候補者全員を格納した配列
 */
function getAllcandidates(){
    return heirs.filter(x => {
        const idxs = x.constructor.idxs.isAcquire;
        const inputs = x.inputs;
        return inputs[idxs[yes]].checked
    })
}

/**
 * 土地欄のキーダウンイベント設定
 * @param {event} e 
 * @param {HTMLInputElement[]} inputs 
 * @param {number} idx 
 */
function handlePropertyKeydownEvent(e, inputs, idx){
    //隠しinputが次にある要素のときは、+2にして隠しinputを飛ばす
    const isNextDisplayedInput = ![LLandNumber.input[no], LPurparty.input[other]].includes(idx);
    const isPurpartyOtherInput = idx === LPurparty.input[other];
    setEnterKeyFocusNext(e, (isNextDisplayedInput ? inputs[idx + 1]: (isPurpartyOtherInput ? inputs[idx + 3]: inputs[idx + 2])));
    //所在地、所有者CBと換価確認以外の欄は数字のみの入力に制限する
    const isNumberOnlyInputs = ![LAddress.input, LPurparty.input[yes], LIsExchange.input[yes], LIsExchange.input[no]].includes(idx);
    if(isNumberOnlyInputs)
        handleNumInputKeyDown(e);
}

/**
 * 所有者CBのイベント設定
 * @param {Land|House} instance 
 */
function handlePurpartyCbChangeEvent(instance){
    const inputs = instance.inputs;
    const idxs = LPurparty.input;
    const noInput = inputs[idxs[no]];
    const otherInput = inputs[idxs[other]];
    const isChecked = inputs[idxs[yes]].checked;
    isChecked ? purpartyCbWhenChecked(instance, noInput, otherInput): purpartyCbWhenUnChecked(instance, noInput, otherInput);
}

/**
 * 所有者チェックボックスのチェックが外れた時、初期化してエラー要素の追加と次へボタンの無効化
 * @param {Land|House} instance 
 * @param {HTMLElement[]} noInput 
 * @param {HTMLInputElement} otherInput 
 */
function purpartyCbWhenUnChecked(instance, noInput, otherInput){
    inputPurparty(instance, noInput, otherInput, false);
    pushInvalidEl(instance, noInput);
    pushInvalidEl(instance, otherInput);
}

/**
 * 所有者チェックボックスにチェックされたとき、１分の１を入力して無効化して次へボタンの有効化判別
 * @param {Land|House} instance 
 * @param {HTMLElement[]} noInput 
 * @param {HTMLInputElement} otherInput 
 */
function purpartyCbWhenChecked(instance, noInput, otherInput){
    inputPurparty(instance, noInput, otherInput, true);
    instance.noInputs = instance.noInputs.filter(x => x !== noInput && x !== otherInput);
    isActivateOkBtn(instance);
}

/**
 * チェック又はチェックを外したことによる取得割合欄の入力
 * @param {Land|Land} instance 
 * @param {HTMLInputElement} noInput 
 * @param {HTMLInputElement} otherInput 
 * @param {boolean} boolean 
 */
function inputPurparty(instance, noInput, otherInput, boolean){
    const val = boolean ? "１": "";
    inputAndToggleDisable(noInput, val, boolean);
    inputAndToggleDisable(otherInput, val, boolean);
    instance.inputs[LPurparty.input[other2]].value = val + "分の" + val;
}

/**
 * 入力と有効化又は無効化
 * @param {HTMLInputElement} input 
 * @param {string} val 
 * @param {boolean} toggle 
 */
function inputAndToggleDisable(input, val, toggle){
    input.value = val;
    input.disabled = toggle;
}

/**
 * 
 * @param {Land} instance 
 */
function isExchangeChecked(instance){
    const TCA = instance.tempCashAcquirers[0];
    const TODInputs = typeOfDivisions[0].inputs;
    const aloneHeirContentType = TODInputs[TODContentType2.input].value;
    const isAloneAcquirer = aloneHeirContentType !== "";
    const isLegalInheritance = TODInputs[TODCashAllocation.input[no]].checked;
    //一人のみが取得するとき
    if(isAloneAcquirer){
        inputTAWhenAcquirerAlone(TCA);
    }else if(isLegalInheritance){
        //法定相続のとき
        createLegalInheritanceTAFieldset(true, instance);
    }else{
        //その他のとき金銭取得者の欄を表示してエラー要素を追加する
        slideDownAndScroll(TCA.fieldset.parentElement);
        TCA.noInputs = Array.from(TCA.fieldset.querySelectorAll("input, select"));
    }
}

/**
 * 換価しないボタンがチェックされたとき
 * @param {TempAcquirer[]} TCAs 
 */
function isNotExchangeChecked(TCAs){
    //金銭取得者仮フォームを非表示にしてフォーム数とインスタンスを１つにする
    slideUp(TCAs[0].fieldset.parentNode);
    for(let i = TCAs.length - 1; i >= 0; i--){
        const TCA = TCAs[i];
        const fieldset = TCA.fieldset;
        if(i === 0){
            TCA.inputs.forEach(x  => x.value = "");
            fieldset.disabled = false;
            TCA.noInputs.length = 0;
        }else{
            fieldset.remove();
        }
    }
    TCAs.length = 1;
}

/**
 * 土地情報欄のイベントを設定する
 * @param {Land|House[]} instances 
 * @param {number} [startIdx=0] イベント設定する開始対象の土地のインデックス
 */
function setPropertyEvent(instances, startIdx = 0){
    //不動産共通のインデックスのため仮に土地のインデックスを使用している
    const numberInputIdx = LNumber.input;
    const addressInputIdx = LAddress.input;
    const landNumberInputIdxs = LLandNumber.input;
    const purpartyInputIdxs = LPurparty.input;
    const officeInputIdx = LOffice.input;
    const isExchangeInputIdxs = LIsExchange.input;

    //各土地インスタンスに対してループ処理
    for(let i = startIdx, len = instances.length; i < len; i++){
        const instance = instances[i];
        const inputs = instance.inputs;
        for(let j = 0, len2 = inputs.length; j < len2; j++){
            //隠しinputとindex以外のとき
            const isDisplayedInputs = ![landNumberInputIdxs[other], purpartyInputIdxs[other2], LIndex.input].includes(j);
            if(isDisplayedInputs){
                //キーダウンイベント
                inputs[j].addEventListener("keydown", (e)=>{
                    handlePropertyKeydownEvent(e, inputs, j);
                })
            } 

            //換価確認ボタンイベント
            function handleIsExchangeChangeEvent(inputIdx){
                //エラー要素から換価する、しない両方のinputを削除する
                instance.noInputs = instance.noInputs.filter(x => x !== inputs[isExchangeInputIdxs[yes]] && x !== inputs[isExchangeInputIdxs[no]]);
                //換価するとき
                if(inputIdx === isExchangeInputIdxs[yes]){
                    isExchangeChecked(instance);
                }else{
                    //金銭取得者仮フォームを非表示にしてフォーム数とインスタンスを１つにする
                    isNotExchangeChecked(instance.tempCashAcquirers)
                }
                isActivateOkBtn(instance);
            }

            //changeイベント共通
            const handleChangeEvent = (inputIdx, formIdx) => {
                inputs[inputIdx].addEventListener("change", () => {
                    //地番の枝番に対するエラーを非表示にする
                    instance.errMsgEls[LLandNumber.form].style.display = "none";
                    //所有者CBのとき
                    if(inputIdx === purpartyInputIdxs[yes]){
                        handlePurpartyCbChangeEvent(instance);
                        return;
                    }else if(isExchangeInputIdxs.includes(inputIdx)){
                        //換価確認ラジオボタンのとき
                        handleIsExchangeChangeEvent(inputIdx);
                        return;
                    }
                    //所有者CB、換価確認ラジオボタン以外のとき
                    const result = propertyValidation(inputs, inputIdx);
                    afterValidation(result, instance.errMsgEls[formIdx], result, inputs[inputIdx], instance);
                    if(result && inputIdx !== LPrice.input)
                        inputs[inputIdx].value = hankakuToZenkaku(inputs[inputIdx].value);

                    //不動産番号のとき
                    if(inputIdx === numberInputIdx){
                        //１３桁入力されているとき
                        if(typeof result === "boolean"){
                            const officeCode = ZenkakuToHankaku(inputs[numberInputIdx].value.slice(0, 4));
                            getOfficeData(officeCode, inputs[officeInputIdx], instance)
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
                    }else if(inputIdx === LPrice.input){
                        //評価額のとき、半角にしてコンマを追加して全角に戻す
                        const hankaku = ZenkakuToHankaku(inputs[inputIdx].value);
                        inputs[inputIdx].value = hankakuToZenkaku(addCommas(hankaku));
                    }
                });
            }

            //各入力欄にchangeイベントを設定する
            if(j === LNumber.input)
                handleChangeEvent(j, LNumber.form);
            else if(j === addressInputIdx)
                handleChangeEvent(j, LAddress.form);
            else if([landNumberInputIdxs[yes], landNumberInputIdxs[no]].includes(j))
                handleChangeEvent(j, LLandNumber.form);
            else if(j === officeInputIdx)
                handleChangeEvent(j, LOffice.form);
            else if([purpartyInputIdxs[yes], purpartyInputIdxs[no], purpartyInputIdxs[other]].includes(j))
                handleChangeEvent(j, LPurparty.form);
            else if(j === LPrice.input)
                handleChangeEvent(j, LPrice.form);
            else if(isExchangeInputIdxs.includes(j))
                handleChangeEvent(j, LIsExchange.form);  
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
function addAcquirerCandidate(tempAcquires, candidates){
    tempAcquires.forEach(x =>{
        const select = x.inputs[TAAcquirer.input];
        select.add(createOption("", "選択してください"));
        candidates.forEach(x =>{
            const inputs = x.inputs;
            const idxs = x.constructor.idxs;
            const optionText = inputs[idxs.name].value;
            const optionVal = inputs[idxs.idAndContentType].value;
            select.add(createOption(optionVal, optionText));
        });
    });
}

/**
 * １人が不動産を全て相続するとき、隠し不動産取得者欄に入力と不動産取得者仮フォームの非表示
 * @param {TempAcquirer} TA 
 */
function inputTAWhenAcquirerAlone(TA){
    const TODInputs = typeOfDivisions[0].inputs;
    const TODContentType1Val = TODInputs[TODContentType1.input].value;
    const TODObject1Val = TODInputs[TODObjectId1.input].value;
    const idAndContentType = TODObject1Val + "_" + TODContentType1Val;
    inputTA(TA, idAndContentType, "１", "１");    
    TA.noInputs.length = 0;
    TA.fieldset.parentElement.style.display = "none";
}

/**
 * 取得者候補をselectタグのoptionに追加する
 * @param {Land|House} instances lands, housesのいずれか
 */
function getAndAddAcquirerCandidate(instances){
    //土地候補者（不動産を取得するで「はい」がチェックされた人）、金銭取得者（相続人全員）を格納した配列
    const TACandidates = [];
    const TCACandidates = [];
    heirs.forEach(x =>{
        const idxs = x.constructor.idxs.isAcquire;
        const inputs = x.inputs;
        if(inputs[idxs[yes]].checked || inputs[idxs[no]].checked){
            TCACandidates.push(x);
            if(inputs[idxs[yes]].checked)
                TACandidates.push(x);
        }
    })

    instances.forEach(x =>{
        addAcquirerCandidate(x.tempAcquirers, TACandidates);
        addAcquirerCandidate(x.tempCashAcquirers, TCACandidates);
    })
}

/**
 * 土地取得者の仮フォームのバリデーション
 * @param {HTMLCollection} inputs
 * @param {number} idx 
 */
function tempPropertyValidation(inputs, idx){
    const input = inputs[idx];
    let result = isBlank(input);
    if(result !== false)
        return result;

    const percentageIdxs = TAPercentage.input;
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
 * @param {Land|House[]} instances
 * @param {number} [startIdx=0] イベントを設定を開始する不動産のインデックス
 */
function setPropertyTAsEvent(instances, startIdx = 0){
    const addBtn = instances[0] instanceof Land? addTLABtns[0]: (instances[0] instanceof House? addTHABtns[0]: addTHABtns[0]);
    //各土地に対してループ処理
    for(let i = startIdx, len = instances.length; i < len; i++){
        const instance = instances[i];
        //土地取得者仮フォーム
        const TA = instance.tempAcquirers[0];
        const TAInputs = TA.inputs;
        //金銭取得者仮フォーム
        const TCA = instance.tempCashAcquirers[0];
        const TCAInputs = TCA.inputs;
        //土地取得者仮フォームと金銭取得者仮フォームは、同一のフォーム形式のためイベント設定
        for(let j = 0, len = TAInputs.length; j < len; j++){
            const TAPercentageInputIdxs = TAPercentage.input;
            //取得割合のとき
            if(TAPercentageInputIdxs.includes(j)){
                //keydownイベントを設定（数字のみの入力制限とフォーカス移動処理）
                TAInputs[j].addEventListener("keydown", (e)=> keyDownHandler(e, TAInputs));
                TCAInputs[j].addEventListener("keydown", (e)=> keyDownHandler(e, TCAInputs));
                function keyDownHandler(e, inputs){
                    handleNumInputKeyDown(e);
                    setEnterKeyFocusNext(e, (TAPercentageInputIdxs[yes] ? inputs[j + 1]: addBtn));
                }
            }
            //全インプットに対してchangeイベントを設定
            TAInputs[j].addEventListener("change", ()=>changeEventHandler(TA));
            TCAInputs[j].addEventListener("change", ()=>changeEventHandler(TCA));
            function changeEventHandler(TA){
                const TAInputs = TA.inputs;
                const result = tempPropertyValidation(TAInputs, j);
                //取得者のとき
                if(j === TAAcquirer.input){
                    afterValidation(result, TA.errMsgEls[TAAcquirer.form], result, TAInputs[j], TA);
                }else if(TAPercentageInputIdxs.includes(j)){
                    //取得割合のとき
                    afterValidation(result, TA.errMsgEls[TAPercentage.form], result, TAInputs[j], TA);
                    TAInputs[j].value = hankakuToZenkaku(TAInputs[j].value);
                }
            }
        }
    }
}

/**
 * 特定のoptionをselect要素から削除する
 * @param {HTMLSelectElement} select 
 * @param {string} target 
 * @returns 
 */
function removeOptionFromSelect(select, target){
    for (let i = select.options.length - 1; i >= 0; i--) {
        if (select.options[i].value === target) {
            select.remove(i);
            return;
        }
    }
}

/**
 * 取得者仮フォームの追加ボタンのイベント設定
 */
function setAddTABtnsEvent(instances, startIdx = 0){
    const TAcquirerInputIdx = TAAcquirer.input;
    const TAPercentageInputIdxs = TAPercentage.input;
    const addTABtns = instances[0] instanceof Land? addTLABtns: (instances[0] instanceof House? addTHABtns: addTHABtns);
    const addTCABtns = instances[0] instanceof Land? addTLCABtns: (instances[0] instanceof House? addTHCABtns: addTHCABtns);
    const removeTABtns = instances[0] instanceof Land? removeTLABtns: (instances[0] instanceof House? removeTHABtns: removeTHABtns);
    const removeTCABtns = instances[0] instanceof Land? removeTLCABtns: (instances[0] instanceof House? removeTHCABtns: removeTHCABtns);
    //土地の数と追加ボタンの数は同じ
    for(let i = startIdx, len = addTABtns.length; i < len; i++){
        const {property, TAs, TCAs} = propertyDataToVariable(instances[i]);
        addTABtns[i].addEventListener("click", ()=>{
            //追加する仮フォームの生成
            addTAFieldsetAndInstance(false, property, TAs);
            inputTAWhenLastAcquirer(TAs);
            const lastTA = getLastElFromArray(TAs);
            const lastTAInputs = lastTA.inputs;
            //仮フォームにイベント設定
            for(let j = 0, len = lastTAInputs.length; j < len; j++){
                if(TAPercentageInputIdxs.includes(j)){
                    lastTAInputs[j].addEventListener("keydown", (e)=>{
                        keyDownEventHandler(e, j, [lastTAInputs[j + 1], addTABtns[i + 1]]);
                    })
                }
                lastTAInputs[j].addEventListener("change", ()=>{
                    changeEventHandler(j, lastTA);
                })
            }
            setForNextTAFieldset(lastTA, addTABtns[i], removeTABtns[i]);
        })
        addTCABtns[i].addEventListener("click", ()=>{
            addTAFieldsetAndInstance(true, property, TCAs);
            inputTAWhenLastAcquirer(TCAs);
            const lastTCA = getLastElFromArray(TCAs);
            const lastTCAInputs = lastTCA.inputs;
            //仮フォームにイベント設定
            for(let j = 0, len = lastTCAInputs.length; j < len; j++){
                if(TAPercentageInputIdxs.includes(j)){
                    lastTCAInputs[j].addEventListener("keydown", (e)=>{
                        keyDownEventHandler(e, j, [lastTCAInputs[j + 1], addTCABtns[i + 1]]);
                    })
                }
                lastTCAInputs[j].addEventListener("change", ()=>{
                    changeEventHandler(j, lastTCA);
                })
            }
            setForNextTAFieldset(lastTCA, addTCABtns[i], removeTCABtns[i]);
        })
    }

    function setForNextTAFieldset(TA, addBtn, removeBtn){
        TA.fieldset.previousElementSibling.disabled = true;
        addBtn.disabled = true;
        removeBtn.disabled = false;
    }

    /**
     * 追加する仮フォームを生成する
     * @param {boolean} isCash 
     * @param {Land|House} instance
     * @param {TempAcquirer[]} TAs 
     */
    //仮フォームを追加
    function addTAFieldsetAndInstance(isCash, instance, TAs){
        const newIdx = TAs.length;
        const copyFrom = TAs[newIdx - 1].fieldset;
        const regex = /(acquirer-)\d+/;
        const att = '[id],[name],[for]';
        copyAndPasteEl(copyFrom, att, regex, newIdx);
        //仮フォームのインスタンスを追加
        const currentTA = getLastElFromArray(TAs);
        const newId = copyFrom.id.replace(regex, `$1${newIdx}`);
        const newTA = new TempAcquirer(newId, instance);
        const newTAInputs = newTA.inputs;
        newTAInputs.forEach(x => x.value = "");
        isCash ? instance.addTempCashAcquirer(newTA): instance.addTempAcquirer(newTA);
        //すでに選択された取得者は取得者候補から削除する
        const selectedHeir = currentTA.inputs[TAcquirerInputIdx].value;
        const newTAAcquirersInput = newTAInputs[TAcquirerInputIdx];
        removeOptionFromSelect(newTAAcquirersInput, selectedHeir);
        slideDown(newTA.fieldset);
        scrollToTarget(newTA.fieldset);
    }

    /**
     * 取得者の選択肢が１人になったとき、取得者と取得割合を自動で入力する
     * @param {TempAcquirer} TAs 
     */
    function inputTAWhenLastAcquirer(TAs){
        const lastTA = getLastElFromArray(TAs);
        const lastTAInputs = lastTA.inputs;
        const lastTAAcquirerInput = lastTAInputs[TAcquirerInputIdx];
        //最後の１人の欄を追加するとき、その一人を選択状態にして取得割合を自動で入力して無効化してボタンの有効化判別をする
        if(lastTAAcquirerInput.options.length === 2){
            lastTAAcquirerInput.value = lastTAAcquirerInput.options[1].value;
            const totalFraction = getCurrentTotalFraction(TAs);
            let resultNumerator = 1 - totalFraction.n * (1 / totalFraction.d);
            let resultDenominator = 1;
            if (resultNumerator !== 1) {
                // totalFractionが1より小さい場合（例: 3/4）、1から引いた結果を計算
                resultNumerator = totalFraction.d - totalFraction.n;
                resultDenominator = totalFraction.d;
            }
            lastTAInputs[TAPercentageInputIdxs[yes]].value = hankakuToZenkaku(String(resultDenominator));
            lastTAInputs[TAPercentageInputIdxs[no]].value = hankakuToZenkaku(String(resultNumerator));
            lastTA.fieldset.disabled = true;
            lastTA.noInputs.length = 0;
            //次の土地へボタンの有効化判別
            isActivateOkBtn(lastTA.belongsTo);
        }
    }

    function getCurrentTotalFraction(instances){
        let totalFraction = new Fraction(0);
        for(let i = 0, len = instances.length; i < len; i++){
            if(i === len - 1)
                break;
            const inputs = instances[i].inputs;
            const numerator = parseInt(ZenkakuToHankaku(inputs[TAPercentageInputIdxs[no]].value));
            const denominator = parseInt(ZenkakuToHankaku(inputs[TAPercentageInputIdxs[yes]].value));
            const currentFraction = new Fraction(numerator, denominator);
            totalFraction = totalFraction.add(currentFraction);
        }
        return totalFraction;
    }

    //keydownイベント設定
    function keyDownEventHandler(e, inputIdx, nextEls){
        handleNumInputKeyDown(e);
        setEnterKeyFocusNext(e, (inputIdx === TAPercentageInputIdxs[yes] ? nextEls[yes]: nextEls[no]));
    }
    //changeイベント設定
    function changeEventHandler(inputIdx, TAInstance){
        const TAInputs = TAInstance.inputs;
        const result = tempPropertyValidation(TAInputs, inputIdx);
        //取得者のとき、hidden取得者に転記する
        if(inputIdx === TAcquirerInputIdx){
            afterValidation(result, TAInstance.errMsgEls[TAAcquirer.form], result, TAInputs[TAcquirerInputIdx], TAInstance);
        }else if(TAPercentageInputIdxs.includes(inputIdx)){
            //取得割合のとき、合計が１以下になっているかをチェックしてhidden取得者に転記する
            afterValidation(result, TAInstance.errMsgEls[TAPercentage.form], result, TAInputs[inputIdx], TAInstance);
            TAInputs[inputIdx].value = hankakuToZenkaku(TAInputs[inputIdx].value);
        }
    }
}

/**
 * フィールドセットとインスタンスを削除する
 * @param {TempAcquirer|Acquirer} instances 削除対象のインスタンスが含まれている配列
 */
function removeLastFieldsetAndLastInstance(instances) {
    return new Promise((resolve, reject) => {
        const lastFieldset = getLastElFromArray(instances).fieldset;
        slideUp(lastFieldset, 250, function() {
            lastFieldset.parentNode.removeChild(lastFieldset);
            instances.pop();
            resolve(); // 処理が完了したことを示す
        });
    });
}

/**
 * 取得者の削除ボタンのイベント設定
 * @param {TempAcquirer} TAs 
 * @param {HTMLButtonElement} removeBtn 
 * @param {HTMLButtonElement} addBtn 
 */
function handleRemoveTABtn(TAs, removeBtn, addBtn){
    //仮フォームが１つになったときは削除ボタンを無効化する
    if(TAs.length === 2)
        removeBtn.disabled = true;
    //追加ボタンを有効化する
    addBtn.disabled = false;
    //前の仮フォームを有効化する
    TAs[TAs.length - 2].fieldset.disabled = false;
    //最後の不動産取得者の仮フォームとインスタンスを削除する
    removeLastFieldsetAndLastInstance(TAs)
        .then(() => isActivateOkBtn(getLastElFromArray(TAs)))
        .catch(e => console.error('handleRemoveTABtnでエラーが発生しました', e));
}

/**
 * 不動産取得者の削除ボタンにイベントを設定
 * @param {Land|House} instances 
 * @param {number} [startIdx=0] 
 */
function setRemoveTABtnsEvent(instances, startIdx = 0){
    //不動産取得者を削除するボタンに対してループ処理
    const instance = instances[0];
    const addTABtns = instance instanceof Land? addTLABtns: (instance instanceof House? addTHABtns: addTHABtns);
    const addTCABtns = instance instanceof Land? addTLCABtns: (instance instanceof House? addTHCABtns: addTHCABtns);
    const removeTABtns = instance instanceof Land? removeTLABtns: (instance instanceof House? removeTHABtns: removeTHABtns);
    const removeTCABtns = instance instanceof Land? removeTLCABtns: (instance instanceof House? removeTHCABtns: removeTHCABtns);
    for(let i = startIdx, len = removeTABtns.length; i < len; i++){
        const {TAs, TCAs} = propertyDataToVariable(instances[i]);
        removeTABtns[i].addEventListener("click", ()=>{
            handleRemoveTABtn(TAs, removeTABtns[i], addTABtns[i]);
        })
        removeTCABtns[i].addEventListener("click", ()=>{
            handleRemoveTABtn(TCAs, removeTCABtns[i], addTCABtns[i]);
        })
    }
}

/**
 * querySelectorAllで取得した全ての要素を無効化する
 * @param {string} selector querySelectorAllのセレクタ
 * @param {HTMLElement} target querySelectorAllの対象
 */
function disableEveryEls(selector, target = null){
    const targets = Array.from(target ? target.querySelectorAll(selector): document.querySelectorAll(selector));
    targets.forEach(x => x.disabled = true);
}

/**
 * 不動産のクラス名（小文字）を取得する
 * @param {Land|House} instance
 * @returns {string} "land", "house", "bldg"
 */
function getPropertyPrefix(instance){
    return instance instanceof Land? "land": (instance instanceof House? "house": "house");
}

/**
 * 次の土地へ進むボタンにイベント設定
 * @param {Land|House} instances 
 */
function setPropertyOkBtnEvent(instances){
    const instance = instances[0];
    const prefix = getPropertyPrefix(instance);
    const okBtn =  instance instanceof Land? landOkBtn: (instance instanceof House? houseOkBtn: houseOkBtn);
    const wrappers = document.getElementsByClassName(`${prefix}Wrapper`);
    okBtn.addEventListener("click", ()=>{
        //土地情報をループ処理（最後の要素から参照する）
        for(let i = wrappers.length - 1; 0 <= i; i--){
            //土地情報が表示されているとき
            const wrapper = wrappers[i];
            if(wrapper.style.display !== "none"){
                //表示されている最後の土地情報が最後の土地情報ではないとき
                if(i !== instances.length - 1){
                    //現在の土地情報を無効化する
                    disableEveryEls("fieldset, button", wrapper);
                    //次の土地情報を有効化する
                    const nexIdx = i + 1;
                    enablePropertyWrapper(instances, nexIdx);
                    slideDownAndScroll(wrappers[i + 1]);
                    //最初のinput要素にフォーカスする
                    instances[nexIdx].fieldset.querySelector("input").focus();
                    return;
                }else{
                    //最後の土地が表示されているときに押されてしまった場合、何も処理をしない
                    throw new Error("setPropertyOkBtnEvent：想定しない操作が行われました");
                }
            }
        }
    })
}

/**
 * 前の土地を修正するボタンにイベント設定
 * @param {Land|House} instances 
 */
function setPropertyCorrectBtnEvent(instances){
    const prefix = getPropertyPrefix(instances[0])
    const wrappers = document.getElementsByClassName(`${prefix}Wrapper`);
    const correctBtn = prefix === "land"? landCorrectBtn: (prefix === "house"? houseCorrectBtn: houseCorrectBtn);
    correctBtn.addEventListener("click", ()=>{
        for(let i = wrappers.length - 1; 0 <= i; i--){
            const preWrapper = wrappers[i - 1];
            //１つ目の土地情報で修正するボタンが有効になってしまっているとき用
            if(i === 0)
                throw new Error("setPropertyCorrectBtnEvent：想定しない操作が行われました");
            //１つ目の土地情報に戻るとき、修正ボタンを無効化する
            if(i === 1)
                correctBtn.disabled = true;
            const wrapper = wrappers[i];
            //表示されている土地情報のとき
            if(wrapper.style.display !== "none"){
                //現在表示されている欄を非表示にして前の欄を有効化してスクロールする
                slideUp(wrapper);
                enablePropertyWrapper(instances, i - 1);
                scrollToTarget(preWrapper);
                break;
            }
        }
    })
}

/**
 * クラス名から取得した要素を最初の要素以外削除する
 * @param {string} className 
 * @param {HTMLElement|null} [target=null] 
 */
function removeElsExceptFirstByClassName(className, target = null){
    const els = target ? target.getElementsByClassName(className): document.getElementsByClassName(className);
    if(els.length > 1){
        for(let i = els.length - 1; i > 0; i--){
            els[i].remove();
        }
    }
}

/**
 * 仮フォームに入力
 * @param {TempAcquirer} TA 
 * @param {string} acquirer id_contentType
 * @param {string} purpartyBottom 
 * @param {string} purpartyTop 
 */
function inputTA(TA, acquirer, purpartyBottom, purpartyTop){
    const inputs = TA.inputs;
    inputs[TAAcquirer.input].value = acquirer;
    inputs[TAPercentage.input[yes]].value = purpartyBottom;
    inputs[TAPercentage.input[no]].value = purpartyTop;
}

/**
 * 法定相続用の仮フォーム生成
 * @param {boolean} isCash 
 * @param {Land|House} instance 
 */
function createLegalInheritanceTAFieldset(isCash, instance){
    const candidates = getAllLegalHeirs();
    for(let i = 0, len = candidates.length; i < len; i++){
        const TAs = isCash ? instance.tempCashAcquirers: instance.tempAcquirers;
        const candidate = candidates[i];
        const idAndContentType = candidate.inputs[candidate.constructor.idxs.idAndContentType].value;
        const purparty = getLegalPercentage(candidates, candidate);
        const parts = purparty.split("分の");
        if(i > 0){
            const copyFrom = TAs[i - 1].fieldset;
            const att = "[id],[name],[for]";
            const regex = /(acquirer-)\d+/;
            copyAndPasteEl(copyFrom, att, regex, i);  
            const newId = copyFrom.id.replace(regex, `$1${i}`);
            const newTA = new TempAcquirer(newId, instance);
            isCash ? instance.addTempCashAcquirer(newTA): instance.addTempAcquirer(newTA);
        }
        const TA = TAs[i];
        inputTA(TA, idAndContentType, parts[0], parts[1]);
        TA.noInputs.length = 0;
    }
    const TAWrapper = isCash ? instance.tempCashAcquirers[0].fieldset.parentElement: instance.tempAcquirers[0].fieldset.parentElement;
    TAWrapper.style.setProperty('display', 'none', 'important');
}

/**
 * 対象の不動産欄のフォームとボタンの有効化判別
 * ・不動産フォームと仮フォームの有効化
 * ・仮フォームの削除ボタンの有効化判別
 * ・前の不動産を修正するボタンの有効化判別
 * ・仮フォームの追加と次の不動産へ進む、次の項目へ進むボタンの有効化判別
 * @param {Land|House[]} instances 
 * @param {number} idx 不動産のインデックス
 */
function enablePropertyWrapper(instances, idx){
    const {property, fieldset, TAs, TCAs} = propertyDataToVariable(instances[idx]);
    const removeTABtns = property instanceof Land? removeTLABtns: (property instanceof House? removeTHABtns: removeTHABtns);
    const removeTCABtns = property instanceof Land? removeTLCABtns: (property instanceof House? removeTHCABtns: removeTHCABtns);
    const correctBtn = property instanceof Land? landCorrectBtn: (property instanceof House? houseCorrectBtn: houseCorrectBtn);
    fieldset.disabled = false;
    getLastElFromArray(TAs).fieldset.disabled = false;
    getLastElFromArray(TCAs).fieldset.disabled = false;
    removeTABtns[idx].disabled = TAs.length > 1? false: true;
    removeTCABtns[idx].disabled = TCAs.length > 1? false: true;
    correctBtn.disabled = idx > 0? false: true;
    isActivateOkBtn(property);
}

/**
 * 土地情報の削除とインスタンスの削除
 */
function removeLandWrappers(newCount){
    const landWrappers = landSection.getElementsByClassName("landWrapper");
    for(let i = landWrappers.length - 1; newCount <= i; i--){
        landWrappers[i].remove();
        lands.pop()
    }
}

/**
 * 遺産分割方法の変更に合わせて土地情報の表示状態を変更する
 * @param {SpouseOrAscendant|DescendantOrCollateral[]} newCandidates
 */
function iniLandSectionByTypeOfDivisionChange(newCandidates){
    for(let i = 0, len = lands.length; i < len; i++){
        const {property, fieldset, TAs, TAWrapper, TCAs, propertyWrapper} = propertyDataToVariable(lands[i]);
        //全て有効化
        fieldset.disabled = false;
        resetTA(TAs, newCandidates);
        getLastElFromArray(TCAs).fieldset.disabled = false;
        //不動産取得者仮フォーム全てを表示状態にする
        TAWrapper.style.display = "block";
        //２つ目以降の土地情報ラッパーは非表示
        if(i === 0){
            propertyWrapper.style.display = "block";
            removeTLABtns[i].disabled = true;
            addTLABtns[i].disabled = true;
            removeTLCABtns[i].disabled = TCAs.length > 1? false: true;
            isActivateOkBtn(property);
        }else{
            propertyWrapper.style.setProperty('display', 'none', 'important');
        }
    }
}

/**
 * 前回の取得候補者と今回の取得候補者が同じか判別する
 * @param {SpouseOrAscendant|DescendantOrCollateral[]} newCandidates 
 * @param {SpouseOrAscendant|DescendantOrCollateral[]} oldCandidates 
 * @returns 
 */
function isCandidatesNoChange(newCandidates, oldCandidates){
    for (let i = 0, len = newCandidates.length; i < len; i++) {
        const newCandidate = newCandidates[i];
        const compareVal = newCandidate.inputs[newCandidate.constructor.idxs.idAndContentType].value;
        const isMatch = oldCandidates.some(x => compareVal === x.value);
        if (!isMatch) {
            return false;
        }
    }
    return true;
}

/**
 * 土地を単独で取得するときの処理
 * @param {Land[]} instances 
 */
function handlePropertyAcquirerAloneDivision(instances, allLegalHeirs){
    instances.forEach(x => {
        const TAs = x.tempAcquirers; 
        resetTA(TAs, allLegalHeirs)
        inputTAWhenAcquirerAlone(TAs[0]);
    });
}

/**
 * 不動産取得の仮フォームと選択肢を初期化する
 * @param {TempAcquirer} TAs 
 * @param {SpouseOrAscendant|DescendantOrCollateral} candidates 
 */
function resetTA(TAs, candidates){
    iniTA(TAs);
    addAcquirerCandidate(TAs, candidates);
}

/**
 * 不動産取得の仮フォームを初期化する
 * @param {TempAcquirer} TAs 
 */
function iniTA(TAs){
    const acquireIdx = TAAcquirer.input;
    const percentageIdxs = TAPercentage.input;
    for(let i = TAs.length - 1; 0 <= i; i--){
        const TA = TAs[i];
        const TAFieldset = TA.fieldset;
        if(i === 0){
            TAFieldset.disabled = false;
            const TAInputs = TA.inputs;
            TAInputs.forEach(x => x.value = "");
            TAInputs[acquireIdx].options.length = 0;
            pushInvalidEl(TA, TAInputs[acquireIdx]);
            pushInvalidEl(TA, TAInputs[percentageIdxs[yes]]);
            pushInvalidEl(TA, TAInputs[percentageIdxs[no]]);
        }else{
            TAFieldset.remove();
            TAs.pop();
        }
    }
}

/**
 * 土地フィールドセットを追加するときで不動産が法定相続のときのインスタンス追加処理
 * @param {Land} land 
 * @param {number} landIdx 
 */
function addLandTAInstanceByLegalInheritance(land, landIdx){
    //不動産が法定相続のとき、仮取得者インスタンスを(不動産取得者 - 1)追加する
    const count = getAllLegalHeirs().length;
    for(let i = 1; i < count; i++){
        land.addTempAcquirer(new TempAcquirer(`id_land_${landIdx}_temp_land_acquirer-${i}-fieldset`, land));
    }
}

function copyAcquirerValues(sourceTAs, targetTAs) {
    sourceTAs.forEach((x, index) => {
        const val = x.inputs[TAAcquirer.input].value;
        targetTAs[index].inputs[TAAcquirer.input].value = val;
    });
}

//２回目以降の土地情報の複製
function addLandFormNotFirstTime(index){
    //最後の土地情報をコピーする
    const TODInputs = typeOfDivisions[0].inputs;
    const TODPropertyAllocationInputIdxs = TODPropertyAllocation.input;
    const isFreeDivision = TODInputs[TODPropertyAllocationInputIdxs[no]].checked;
    clonePropertyFieldset("land", index, isFreeDivision);
    //インスタンスを生成
    const newLand = createNewPropertyInstance("land", index);
    const isLegalInheritance = TODInputs[TODPropertyAllocationInputIdxs[yes]].checked;
    //不動産が法定相続のとき、仮取得者インスタンスを(不動産取得者 - 1)追加する
    if(isLegalInheritance){addLandTAInstanceByLegalInheritance(newLand, index);}
    //土地情報と金銭取得者の仮フォームの値を初期化する
    const newLandInputs = newLand.inputs;
    iniInputsAndSelectValue(newLandInputs);
    newLand.tempCashAcquirers.forEach(x => iniInputsAndSelectValue(x.inputs));
    //不動産取得がその他のとき、仮フォームの値を初期化する
    if(isFreeDivision){
        newLand.tempAcquirers.forEach(x => iniInputsAndSelectValue(x.inputs))
    }else{
        //不動産の取得が法定相続又は単独のとき、select要素に値を代入する（複製するときになぜか値が初期化される）
        const lastIndex = lands.length - 1; // 最後のインデックス
        const preLastIndex = lastIndex - 1; // 最後から2番目のインデックス
        const sourceTAs = lands[preLastIndex].tempAcquirers;
        const targetTAs = lands[lastIndex].tempAcquirers;
        copyAcquirerValues(sourceTAs, targetTAs);
        //エラー要素を削除する
        newLand.tempAcquirers.forEach(x => x.noInputs.length = 0);
    }
    //所有者欄を有効化する
    const LPurpartyInputIdxs = LPurparty.input;
    newLandInputs[LPurpartyInputIdxs[no]].disabled = false;
    newLandInputs[LPurpartyInputIdxs[other]].disabled = false;
}

/**
 * 初回の不動産欄の複製処理（欄の複製とインスタンス生成）
 * @param {string} prefix 
 * @param {number} count 
 */
function addPropertyFormFirstTime(prefix, count){
    for(let i = 1; i < count; i++){
        clonePropertyFieldset(prefix, i, false);
        createNewPropertyInstance(prefix, i);
    }
}

/**
 * 不動産欄を複製する
 * @param {string} prefix "land", "house", "bldg"のいずれか
 * @param {number} idx 不動産のインデックス
 * @param {boolean} isFreeDivision 遺産分割の分配方法がその他フラグ
 */
function clonePropertyFieldset(prefix, idx, isFreeDivision){
    const copyFrom = document.getElementById(`id_${prefix}-${idx - 1}-wrapper`);
    const clone = copyFrom.cloneNode(true);
    //仮フォームを１つにする
    const fixedPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    if(isFreeDivision)
        removeElsExceptFirstByClassName(`temp${fixedPrefix}AcquirerFieldset`, clone);
    removeElsExceptFirstByClassName(`temp${fixedPrefix}CashAcquirerFieldset`, clone);
    //クローンした要素は非表示
    clone.style.setProperty("display", "none", "important");
    //複製した土地情報の属性値を変更
    const newBranchNum = `（${hankakuToZenkaku(String(idx + 1))}）`;
    clone.firstElementChild.textContent = newBranchNum;
    clone.id = clone.id.replace(/\d+/, idx);
    const els = clone.querySelectorAll('[id],[for],[name]');
    const regex = prefix === "land"? /(land[_-])\d+/: (prefix === "house"? /(house[_-])\d+/: /(bldg[_-])\d+/);
    els.forEach(x => {
        if(x.id){
            x.id = x.id.replace(regex, `$1${idx}`);
            if(x.id === `id_${prefix}-${idx}-index`)
                x.value = `${idx}`;
            else if(x.id.includes("purparty") || x.id.includes("acquirer-0-fieldset"))
                x.disabled = false;
        }
        if(x.htmlFor)
            x.htmlFor = x.htmlFor.replace(regex, `$1${idx}`);
        if(x.name)
            x.name = x.name.replace(regex, `$1${idx}`);
    });
    copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling);
}

function hiddenIsExchange(land){
    const input = land.inputs[LIsExchange.input[no]];
    land.Qs[LIsExchange.form].style.display = "none";
    input.checked = true;
    input.dispatchEvent(new Event("change"));
}

/**
 * 新たな不動産インスタンスを生成して返す
 * @param {string} prefix "land", "house", "bldg"のいずれか
 * @param {number} idx インスタンスのインデックス
 * @returns
 */
function createNewPropertyInstance(prefix, idx){
    let instance;
    if(prefix === "land"){
        instance = new Land(`id_${prefix}-${idx}-fieldset`);
    }else if(prefix === "house"){
        instance = new House(`id_${prefix}-${idx}-fieldset`);
    }else{
        throw new Error("createNewPropertyInstance：想定されていないクラスのインスタンスが渡されました");
    }
    // TempAcquirerの追加処理を一般化
    function addTempAcquirerTypes(){
        instance.addTempAcquirer(new TempAcquirer(`id_${prefix}_${idx}_temp_${prefix}_acquirer-0-fieldset`, instance));
        instance.addTempCashAcquirer(new TempAcquirer(`id_${prefix}_${idx}_temp_${prefix}_cash_acquirer-0-fieldset`, instance));
        instance.tempCashAcquirers[0].noInputs.length = 0;
    }
    // 汎用関数を使用して、TempAcquirerを追加
    addTempAcquirerTypes();
    return instance;
}

/**
 * 土地情報欄のイベントなど設定
 */
function setLandSection(){
    const TAAcquirerInputIdx = TAAcquirer.input;
    const TODInputs = typeOfDivisions[0].inputs;
    //不動産の数で入力された数分の土地のフォーム、hidden不動産取得者、hidden金銭取得者を生成する
    const newCount = parseInt(numberOfProperties[0].inputs[NOPLand].value);
    const prefix = "land";
    //初めて土地情報を入力するとき
    if(lands.length === 0){
        //インスタンスを生成する
        createNewPropertyInstance(prefix, 0);
        //土地の数が２以上のとき、土地情報を複製する
        if(newCount > 1)
            addPropertyFormFirstTime(prefix, newCount);
        //取得者候補を追加する
        getAndAddAcquirerCandidate(lands);
        const isAcquirerAlone = TODInputs[TODContentType1.input].value !== "";
        const isLegalInheritance = TODInputs[TODPropertyAllocation.input[yes]].checked;
        //遺産分割方法の不動産の全取得者欄が入力されているときは、自動入力する
        if(isAcquirerAlone){
            lands.forEach(x => x.tempAcquirers.forEach(y => inputTAWhenAcquirerAlone(y)));
        }else if(isLegalInheritance){
            //不動産の取得者が法定相続のとき
            lands.forEach(x => createLegalInheritanceTAFieldset(false, x));
        }
        //土地情報の各入力欄のイベントを設定
        setPropertyEvent(lands);
        //通常分割のとき、換価確認欄を非表示にして「しない」にチェックを入れる
        const isNormalDivision = TODInputs[TODTypeOfDivision.input[yes]].checked;
        if(isNormalDivision)
            lands.forEach(x => hiddenIsExchange(x));
        //土地又は金銭取得者の仮フォームの各入力欄のイベントを設定
        setPropertyTAsEvent(lands);
        //取得者仮フォームを追加ボタンのイベント設定
        setAddTABtnsEvent(lands);
        //不動産取得者を削除ボタンのイベント設定
        setRemoveTABtnsEvent(lands);
        //次の土地へ進むボタンのイベント設定
        setPropertyOkBtnEvent(lands);
        //前の土地を修正するボタンのイベント設定
        setPropertyCorrectBtnEvent(lands);
    }else{
        //土地情報を入力したことがあるとき
        const oldCount = lands.length;
        //土地の数が減ったとき
        if(newCount < oldCount)
            removeLandWrappers(newCount);

        const land = lands[0];
        const isCashFreeDivision = TODInputs[TODCashAllocation.input[other]].checked; //今回の遺産分割方法確認
        const allLegalHeirs = getAllLegalHeirs();
        //換価のとき
        const isExchangeYes = TODInputs[TODTypeOfDivision.input[no]].checked;
        if(isExchangeYes){
            //通常から換価に変更されたとき、換価確認のいいえにチェックが入ってるのを解除して表示状態にして最初の欄のみの表示にする
            const isNormalToExchange = land.inputs[LIsExchange.input[no]].checked && land.Qs[LIsExchange.form].style.display === "none";
            if(isNormalToExchange){
                lands.forEach((x, idx) => {
                    x.inputs[LIsExchange.input[no]].checked = false;
                    x.Qs[LIsExchange.form].style.display = "";
                    pushInvalidEl(x, x.inputs[LIsExchange.input[yes]]);
                    if(idx > 0)
                        x.fieldset.parentElement.parentElement.style.setProperty("display", "none", "important");
                })
            }else{
                //前回も換価だったとき、金銭の分配方法の変更に応じて修正する
                let isInitialize = false;
                for(let i = 0, len = lands.length; i < len; i++){
                    const {property, propertyWrapper, TCAs} = propertyDataToVariable(lands[i]);
                    const isExchangeInputYes = property.inputs[LIsExchange.input[yes]];
                    const isExchange = isExchangeInputYes.checked;
                    //金銭の遺産分割方法がその他のとき
                    if(isCashFreeDivision){
                        const TLACWrapper = TCAs[0].fieldset.parentElement;
                        const wasAloneOrLegalInheritance = isExchange && TLACWrapper.style.display === "none";
                        //前回１人又は法定相続だったときで初回のとき
                        if((wasAloneOrLegalInheritance && !isInitialize) || wasAloneOrLegalInheritance){
                            TLACWrapper.style.display = "block";
                            resetTA(TCAs, allLegalHeirs);
                            enablePropertyWrapper(lands, i);
                            if(!isInitialize){
                                slideDownAndScroll(propertyWrapper);
                                isInitialize = true;
                            }else{
                                propertyWrapper.style.setProperty('display', 'none', 'important');
                            }
                        }else if(isInitialize){
                            //初回以降の処理
                            property.fieldset.disabled = false;
                            getLastElFromArray(property.tempAcquirers).fieldset.disabled = false;
                            propertyWrapper.style.setProperty('display', 'none', 'important');
                        }
                    }else if(isExchange){
                        //金銭の遺産分割方法が１人又は法定相続のとき
                        resetTA(TCAs, allLegalHeirs);
                        isExchangeInputYes.dispatchEvent(new Event("change"));
                    }                
                }
            }
        }else{
            //通常のとき
            //換価チェック欄を初期化・非表示にする
            lands.forEach(x => {
                resetTA(x.tempCashAcquirers, allLegalHeirs);
                hiddenIsExchange(x);
            })
        }

        const wasTLAHidden = land.fieldset.nextElementSibling.style.display === "none"; //前回の遺産分割方法確認
        const isLandAloneDivision = TODInputs[TODContentType1.input].value !== ""; //今回の遺産分割方法確認
        const isLandFreeDivision = TODInputs[TODPropertyAllocation.input[no]].checked; //今回の遺産分割方法確認
        //遺産分割方法が１人のとき
        if(isLandAloneDivision){
            handlePropertyAcquirerAloneDivision(lands, allLegalHeirs);
        }else if(isLandFreeDivision){
            //遺産分割方法がその他のとき
            const newCandidates = getAllcandidates();
            //単独又は法定相続だったのとき
            if(wasTLAHidden){
                iniLandSectionByTypeOfDivisionChange(newCandidates);
            }else{
                //その他だったのとき
                const oldCandidates = Array.from(land.tempAcquirers[0].inputs[TAAcquirerInputIdx].options).slice(1);
                const isAllLegalHeirs = newCandidates.length === allLegalHeirs.length;
                const isSameLength = newCandidates.length === oldCandidates.length;
                //同じ人数かつ同じ要素（全員が取得車の場合を除く）のときは何も処理をしない
                if(!isAllLegalHeirs && isSameLength){
                    if(!isCandidatesNoChange(newCandidates, oldCandidates))
                        iniLandSectionByTypeOfDivisionChange(newCandidates);
                }else if(!isSameLength){
                    iniLandSectionByTypeOfDivisionChange(newCandidates);
                }
            }
        }else{
            //遺産分割方法が法定相続のとき
            lands.forEach(x => {
                resetTA(x.tempAcquirers, allLegalHeirs);
                createLegalInheritanceTAFieldset(false, x);
            });
        }

        //土地の数が増えたとき
        if(newCount > oldCount){
            for(let i = oldCount; i < newCount; i++){
                //最後の土地情報を複製する
                addLandFormNotFirstTime(i);
            }
            //土地、仮フォーム、ボタンにイベントを設定する
            setPropertyEvent(lands, oldCount);
            const isNormalDivision = TODInputs[TODTypeOfDivision.input[yes]].checked;
            if(isNormalDivision)
                lands.forEach(x => hiddenIsExchange(x));
            setPropertyTAsEvent(lands, oldCount);
            setAddTABtnsEvent(lands, oldCount);
            setRemoveTABtnsEvent(lands, oldCount);
        }
    }
    //最後に表示されている土地情報を有効化する
    enableAndDisplayTargetPropertyWrapper(lands);
}

/**
 * アラートを表示する（SweetAlert2）
 * @param {string} title タイトル（太大文字）
 * @param {string} text 説明文
 * @param {string} icon アラートレベル（successやwarning）
 */
function showAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
    });
}

/**
 * 土地情報欄のチェック
 */
async function checkLandSection(){
    try{
        //遺産分割方法で換価分割が押されていた、かつ換価分割対象の不動産がないとき
        const TOD = typeOfDivisions[0];
        const TODInputs = TOD.inputs;
        const isExchageSelected = TODInputs[TODTypeOfDivision.input[no]].checked;
        const isSomeLandsToExchange = lands.some(x => x.inputs[LIsExchange.input[yes]].checked);
        //アラート表示と遺産分割方法を通常に変更する
        if(isExchageSelected && !isSomeLandsToExchange)
            await alertAndChangeToNormal();
        //遺産分割の不動産の分配方法でその他が選択されているとき
        const isFreeDivision = TODInputs[TODPropertyAllocation.input[no]].checked;
        if(isFreeDivision)
            //不動産取得にチェックが入っている法定相続人がいるが取得者になっていないとき、アラートを表示させてその人を取得しないに変更する
            await alertAndChangeIsAcquire();
        
        async function alertAndChangeToNormal(){
            try{
                await showAlert("確認", "遺産分割の方法で「換価分割」が選択されてましたが、換価する土地が選択されていないため遺産分割の方法を「通常」に変更しました", "warning");
                const fieldset = TOD.fieldset;
                const input = TODInputs[TODTypeOfDivision.input[yes]];
                fixInput(fieldset, input);
            }catch(e){
                throw {type: "a", message: e.message};
            }
        }
    
        async function alertAndChangeIsAcquire(){
            try{
                const candidates = getAllcandidates();
                const acquirers = [];
                lands.forEach(x => {
                    x.tempAcquirers.forEach(y => {
                        const match = candidates.find(z => z.inputs[z.constructor.idxs.idAndContentType].value === y.inputs[TAAcquirer.input].value);
                        if(match && !acquirers.includes(match)) {
                            acquirers.push(match);
                        }
                    })
                })
                if (candidates.length !== acquirers.length) {
                    await showAlert("確認", "不動産取得者に選択されなかった相続人は、相続人情報の「不動産を取得しますか？」を「いいえ」に変更されました", "warning")
                    const targets = candidates.filter(x => !acquirers.some(y => y.inputs[y.constructor.idxs.idAndContentType].value === x.inputs[x.constructor.idxs.idAndContentType].value));
                    if(targets){
                        targets.forEach(x => {
                            const fieldset = x.fieldset;
                            const input = x.inputs[x.constructor.idxs.isAcquire[no]];
                            fixInput(fieldset, input);
                        })
                        //相続人が一人になったとき
                        const candidates = getAllcandidates();
                        if(candidates.length === 1){
                            //遺産分割方法の分配方法を非表示にする、チェックを初期化する
                            TOD.Qs[TODPropertyAllocation.form].style.setProperty('display', 'none', 'important');
                            TODPropertyAllocation.input.forEach(x => TODInputs[x].checked = false);
                            //objectId1とcontentType1を取得する
                            const aloneAcquirer = candidates[0];
                            const parts = aloneAcquirer.inputs[aloneAcquirer.constructor.idxs.idAndContentType].value.split("_");
                            TODInputs[TODObjectId1.input].value = parts[0];
                            TODInputs[TODContentType1.input].value = parts[1];
                            //不動産取得者のラッパーを全て非表示にする
                            lands.forEach(x => x.fieldset.nextElementSibling.style.setProperty("display", "none", "important"));
                        }
                    }
                }
            }catch(e){
                throw {type: "b", message: e.message};
            }
        }
    }catch(e){
        if(e.type === "a")
            console.error("alertAndChangeToNormalでエラーが発生しました：", e.message);
        else if(e.type === "b")
            console.error("alertAndChangeIsAcquireでエラーが発生しました：", e.message);
        else
            console.error("checkLandSectionでエラーが発生しました：", e.message);
    }
}

/**
 * ユーザーの入力を訂正する
 * @param {HTMLFieldSetElement} fieldset 
 * @param {HTMLInputElement} input 
 */
function fixInput(fieldset, input){
    fieldset.disabled = false;
    input.checked = true;
    input.dispatchEvent(new Event("change"));
    fieldset.disabled = true;
}

/**
 * 仮フォームの値を隠しフォームに転記
 * @param {Land} land 
 * @param {TempAcquirer} temp 
 * @param {Acquirer} Acquirer 
 */
function copyToLandHiddenForm(land, temp, Acquirer){
    const tempInputs = temp.inputs;
    const parts = tempInputs[TAAcquirer.input].value.split("_");
    const percentage = tempInputs[TAPercentage.input[yes]].value + "分の" + tempInputs[TAPercentage.input[no]].value;
    const index = land.inputs[LIndex.input].value;
    Acquirer.inputs[AObjectId].value = parts[0];
    Acquirer.inputs[AContentType].value = parts[1];
    Acquirer.inputs[APercentage].value = percentage;
    Acquirer.inputs[ATarget].value = index;
}

/**
 * 土地取得者の隠し取得者フォームとインスタンスを初期化する
 */
function iniLandAcquirers(){
    //フィールドセットを１つにする
    removeElsExceptFirstByClassName("landAcquirerFieldset", document.getElementById("id_land_acquirer_wrapper"));
    removeElsExceptFirstByClassName("landCashAcquirerFieldset", document.getElementById("id_land_cash_acquirer_wrapper"));
    //インスタンスを全て削除する
    lands.forEach(x => {
        x.acquirers.length = 0;
        x.cashAcquirers.length = 0;
    });
}

/**
 * 土地情報の取得者仮フォームを隠しフォームに転記する
 */
function SynchronizeLandHiddenForm(){
    //隠しフォームを初期化する
    iniLandAcquirers();
    //仮フォームからデータを取得する
    let TAsCount = 0;
    let TCAsCount = 0;
    lands.forEach(x => {
        x.tempAcquirers.forEach((y, idx) => {
            if(TAsCount === 0){
                //インスタンス生成、転記
                x.addAcquirer(new Acquirer(`id_land_acquirer-${0}-fieldset`));
                copyToLandHiddenForm(x, y, x.acquirers[0]);
            }else{
                //フィールドセットをコピー、属性を更新、ペースト、インスタンス生成、転記
                const AWrapper = document.getElementById("id_land_acquirer_wrapper");
                const copyFrom = getLastElFromArray(AWrapper.getElementsByClassName("landAcquirerFieldset"));
                const att = "[id],[name]"
                const regex = /(acquirer-)\d+/;
                const newIdx = TAsCount + 1;
                copyAndPasteEl(copyFrom, att, regex, newIdx);
                x.addAcquirer(new Acquirer(`id_land_acquirer-${newIdx}-fieldset`));
                copyToLandHiddenForm(x, y, x.acquirers[idx]);
            }
            TAsCount += 1;
        });
        x.tempCashAcquirers.forEach((y, idx) => {
            if(TCAsCount === 0){
                x.addCashAcquirer(new Acquirer(`id_land_cash_acquirer-${0}-fieldset`));
                copyToLandHiddenForm(x, y, x.cashAcquirers[0]);
            }else{
                const CAWrapper = document.getElementById("id_land_cash_acquirer_wrapper");
                const copyFrom = getLastElFromArray(CAWrapper.getElementsByClassName("landCashAcquirerFieldset"));
                const att = "[id],[name]"
                const regex = /(acquirer-)\d+/;
                const newIdx = TCAsCount + 1;
                copyAndPasteEl(copyFrom, att, regex, newIdx);
                x.addCashAcquirer(new Acquirer(`id_land_cash_acquirer-${newIdx}-fieldset`));
                copyToLandHiddenForm(x, y, x.cashAcquirers[idx]);
            }
            TCAsCount += 1;
        });
    })
    //フォームセットの数を更新する
    document.getElementById("id_land_acquirer-TOTAL_FORMS").value = TAsCount;
    document.getElementById("id_land_cash_acquirer-TOTAL_FORMS").value = TCAsCount;
}

/**
 * 被相続人セクションの次の項目へ進むボタンのイベント設定
 * @param {HTMLElement} section 
 * @param {HTMLElement} preSection 
 */
function handleDecedentSectionOkBtn(section, preSection){
    const nextSectionIdx = 2;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);
    setHeirsSection();
}

/**
 * 相続人セクションの次の項目へ進むボタンのイベント設定
 * @param {HTMLElement} section 
 * @param {HTMLElement} preSection 
 * @returns 
 */
function handleHeirsSectionOkBtn(section, preSection){
    if(checkHeirsSection() === false)
        return;
    const nextSectionIdx = 3;
    heirsCorrectBtn.disabled = true;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);
    setTypeOfDivisionSection();
}

/**
 * 遺産分割の方法セクションの次の項目へ進むボタンのイベント設定
 * @param {HTMLElement} section 
 * @param {HTMLElement} preSection 
 */
function handleTODSectionOkBtn(section, preSection){
    const nextSectionIdx = 4;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);
    setNumberOfPropertiesSection();
}

/**
 * 不動産の数セクションの次の項目へ進むボタンのイベント設定
 * @param {HTMLElement} section 
 * @param {HTMLElement} preSection 
 */
function handleNOPSectionOkBtn(section, preSection){
    const nextSectionIdx = 4;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);
    if(section.id === "land-section")
        setLandSection();
    else if(section.id === "house-section")
        setHouseSection();
    else if(section.id === "bldg-section")
        setBldgSection();
    else
        console.log("handleNOPSectionOkBtn：想定されていないセクションが指定されました")
}

/**
 * 土地情報セクションの次の項目へ進むボタンのイベント設定
 * @param {HTMLElement} section 
 * @param {HTMLElement} preSection 
 */
function handleLandSectionOkBtn(section, preSection){
    const nextSectionIdx = ["house-section", "bldg-section"].includes(section.id)? 4: 5;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);
    //最後の土地欄のボタンを無効化
    landCorrectBtn.disabled = true;
    getLastElFromArray(removeTLABtns).disabled = true;
    getLastElFromArray(removeTLCABtns).disabled = true;
    //入力に齟齬があるときのアラートと入力修正処理
    checkLandSection();
    //土地情報の仮フォームデータを隠しフォームに転記する処理
    SynchronizeLandHiddenForm();
    if(section.id === "house-section")
        setHouseSection();
    else if(section.id === "bldg-section")
        setBldgSection ();
    else if(section.id === "application-section")
        setApplicationSection();
    else
        console.log("handleLandSectionOkBtn：想定されていないセクションが指定されました")
}

/**
 * 建物情報欄を設定
 */
function setHouseSection(){
    //最後のフォームに移動するように設定が必要
    const TAAcquirerInputIdx = TAAcquirer.input;
    const TODInputs = typeOfDivisions[0].inputs;
    //不動産の数で入力された数分の建物のフォーム、hidden不動産取得者、hidden金銭取得者を生成する
    const newCount = parseInt(numberOfProperties[0].inputs[NOPHouse].value);
    const prefix = "house";
    //初めて建物情報を入力するとき
    if(houses.length === 0){
        //インスタンスを生成する
        createNewPropertyInstance(prefix, 0);
        //建物の数が２以上のとき、建物情報を複製する
        if(newCount > 1)
            addPropertyFormFirstTime(prefix, newCount);
        //取得者候補を追加する
        getAndAddAcquirerCandidate(houses);
        const isAcquirerAlone = TODInputs[TODContentType1.input].value !== "";
        const isLegalInheritance = TODInputs[TODPropertyAllocation.input[yes]].checked;
        //遺産分割方法の不動産の全取得者欄が入力されているときは、自動入力する
        if(isAcquirerAlone){
            houses.forEach(x => x.tempAcquirers.forEach(y => inputTAWhenAcquirerAlone(y)));
        }else if(isLegalInheritance){
            //不動産の取得者が法定相続のとき
            houses.forEach(x => createLegalInheritanceTAFieldset(false, x));
        }
        //建物情報の各入力欄のイベントを設定
        setPropertyEvent(houses);
        //通常分割のとき、換価確認欄を非表示にして「しない」にチェックを入れる
        const isNormalDivision = TODInputs[TODTypeOfDivision.input[yes]].checked;
        if(isNormalDivision)
            houses.forEach(x => hiddenIsExchange(x));
        //建物又は金銭取得者の仮フォームの各入力欄のイベントを設定
        setPropertyTAsEvent(houses);
        //取得者仮フォームを追加ボタンのイベント設定
        setAddTABtnsEvent(houses);
        //不動産取得者を削除ボタンのイベント設定
        setRemoveTABtnsEvent(houses);
        //次の建物へ進むボタンのイベント設定
        setPropertyOkBtnEvent(houses);
        //前の建物を修正するボタンのイベント設定
        setPropertyCorrectBtnEvent(houses);
    }
    //最後に表示されている建物情報を有効化する
    enableAndDisplayTargetPropertyWrapper(houses);
}

/**
 * 最後に表示されている不動産情報を有効化する
 * @param {Land|House} instances 
 */
function enableAndDisplayTargetPropertyWrapper(instances){
    for(let i = instances.length - 1; i >= 0; i --){
        const wrapper = instances[i].fieldset.parentElement.parentElement;
        if(wrapper.style.display !== "none"){
            enablePropertyWrapper(instances, i);
            slideDownAndScroll(wrapper);
            break;
        }
    }
}

function setBldgSection(){
    //最後のフォームに移動するように設定が必要


}

function setApplicationSection(){

}

/**
 * 次の項目へ進むボタンのイベント設定処理
 */
function handleOkBtnEvent(){
    //全セクションタグに対してループ処理
    for(let i = 0, len = sections.length; i < len; i++){
        const section = sections[i];
        //非表示のセクションのとき
        if (window.getComputedStyle(section).display === 'none') {
            const preSection = sections[i - 1];
            //相続人情報のとき、相続人情報セクションを表示してループを中止
            if(section.id === "heirs-section"){
                handleDecedentSectionOkBtn(section, preSection);
                break;
            }else if(section.id === "type-of-division-section"){
                handleHeirsSectionOkBtn(section, preSection);
                break;
            }else if(section.id === "number-of-properties-section"){
                handleTODSectionOkBtn(section, preSection);
                break;
            }else if(section.id === "land-section"){
                const isNoLand = numberOfProperties[0].inputs[NOPLand].value === "0";
                if(isNoLand){
                    //土地が０のとき次のループへ
                    continue;
                }else{
                    handleNOPSectionOkBtn(section, preSection);
                    break;
                }
            }else if(section.id === "house-section"){
                const isNoLand = numberOfProperties[0].inputs[NOPLand].value === "0";
                const isNoHouse = numberOfProperties[0].inputs[NOPHouse].value === "0";
                if(isNoHouse){
                    //建物の数が０のとき次のループへ
                    continue;
                }else if(isNoLand){
                    //不動産の数からのとき
                    handleNOPSectionOkBtn(section, sections[i - 2]);
                }else{
                    //土地からのとき
                    handleLandSectionOkBtn(section, preSection);
                }
                break;
            }else if(section.id === "bldg-section"){
                const isNoBldg = numberOfProperties[0].inputs[NOPBldg].value === "0";
                const isNoHouse = numberOfProperties[0].inputs[NOPHouse].value === "0";
                const isNoLand = numberOfProperties[0].inputs[NOPLand].value === "0";
                //区分建物が０のとき次のループへ
                if(isNoBldg){   
                    continue;
                }else if(isNoLand && isNoHouse){
                    //不動産の数からのとき
                }else if(isNoHouse){
                    //土地からのとき
                    handleLandSectionOkBtn(section, sections[i - 2]);
                }else{
                    //建物からのとき
                    handleLandSectionOkBtn(section, preSection);
                }
                break;
            }else if(section.id === "application-section"){
                const isNoHouse = numberOfProperties[0].inputs[NOPHouse].value === "0";
                const isNoBldg = numberOfProperties[0].inputs[NOPBldg].value === "0";
                //土地からの時
                if(isNoHouse && isNoBldg){
                    handleLandSectionOkBtn(section, sections[i - 3]);
                }else if(isNoBldg){
                    //建物からの時

                }else{
                    //区分建物の時
                }
                scrollToTarget(section);
                break;
            }else{
                console.log("handleOkBtnEvent:想定されていないセクション移動がありました");
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
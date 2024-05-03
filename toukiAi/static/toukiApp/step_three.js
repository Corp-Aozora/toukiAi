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

    //フィールドセット内のデータを取得する
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => 
            i === Decedent.idxs.deathDate ||
            i === Decedent.idxs.birthYear ||
            i === Decedent.idxs.birthMonth ||
            i === Decedent.idxs.birthDate ||
            i === Decedent.idxs.address ||
            i === Decedent.idxs.domicileAddress
        );
        decedents.push(this);
    }

    //input要素のインデックス
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
        user: 14
    }

    //被相続人情報セクション
    static section = document.getElementById("decedent-section");
}
const decedent = new Decedent("id_decedent-0-fieldset");
const {
    name: DName,
    deathYear: DDeathYear,
    deathMonth: DDeathMonth,
    deathDate: DDeathDate,
    birthYear: DBirthYear,
    birthMonth: DBirthMonth,
    birthDate: DBirthDate,
    prefecture: DPrefecture,
    city: DCity,
    address: DAddress,
    bldg: DBldg,
    domicilePrefecture: DDomicilePrefecture,
    domicileCity: DDomicileCity,
    domicileAddress: DDomicileAddress,
    user: DUser
} = Decedent.idxs;

//登記簿上の氏名住所
const registryNameAndAddresses = [];
class RegistryNameAndAddress extends Fieldset{

    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => i !== RegistryNameAndAddress.idxs.bldg &&
                i !== RegistryNameAndAddress.idxs.decedent &&
                i !== RegistryNameAndAddress.idxs.id
        );
        registryNameAndAddresses.push(this);
    }

    static idxs = {
        name: 0,
        prefecture: 1,
        city: 2,
        address: 3,
        bldg: 4,
        decedent: 5,
        id: 6,
    }

    static addBtn = document.getElementById("addRegistryAddressButton");
    static removeBtn = document.getElementById("removeRegistryAddressButton");
}
const {
    name: RName,
    prefecture: RPrefecture,
    city: RCity,
    address: RAddress,
    bldg: RBldg,
    decedent: RDecedent,
    id: RId,
} = RegistryNameAndAddress.idxs;
const registryNameAndAddress = new RegistryNameAndAddress("id_registry_name_and_address-0-fieldset");

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
        idAndContentType: 16,
        decedent: 17,
        contentType: 18,
        id: 19
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        const deathDateDivStyle = window.getComputedStyle(this.fieldset.getElementsByClassName("heirsDeathDateDiv")[0]);

        // 生存しているとき
        if(deathDateDivStyle.display === "none"){

            // 生年月日は必須
            this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter((_, i) =>
                i === SpouseOrAscendant.idxs.birthYear ||
                i === SpouseOrAscendant.idxs.birthMonth ||
                i === SpouseOrAscendant.idxs.birthDate
            );

            // 相続放棄していないときは不動産取得の事項をエラー要素に追加する
            if(this.inputs[SpouseOrAscendant.idxs.isRefuse].value === "false"){
                this.noInputs = this.noInputs.concat(
                    Array.from(this.fieldset.querySelectorAll("input, select")).filter((_, i) =>
                        i === SpouseOrAscendant.idxs.isAcquire[yes] ||
                        i === SpouseOrAscendant.idxs.isAcquire[no]
                    )
                );
            }
        }else{
            this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                (_, i) =>
                i === SpouseOrAscendant.idxs.deathYear ||
                i === SpouseOrAscendant.idxs.deathMonth ||
                i === SpouseOrAscendant.idxs.deathDate ||
                i === SpouseOrAscendant.idxs.birthYear ||
                i === SpouseOrAscendant.idxs.birthMonth ||
                i === SpouseOrAscendant.idxs.birthDate
            );
        }
        if(this.inputs[SpouseOrAscendant.idxs.prefecture].parentElement.style.display === "none"){
            this.inputs[SpouseOrAscendant.idxs.address].placeholder = "アメリカ合衆国ニューヨーク州ニューヨーク市";
            this.inputs[SpouseOrAscendant.idxs.bldg].placeholder = "３４ストリートダブリュ２０";
        }
        heirs.push(this);
    }

    static section = document.getElementById("heirs-section");
    static correctBtn = document.getElementById("heirsCorrectBtn");
    static okBtn = document.getElementById("heirsOkBtn");
}

const {
    name: SOAName,
    deathYear: SOADeathYear,
    deathMonth: SOADeathMonth,
    deathDate: SOADeathDate,
    birthYear: SOABirthYear,
    birthMonth: SOABirthMonth,
    birthDate: SOABirthDate,
    isAcquire: SOAIsAcquire,
    prefecture: SOAPrefecture,
    city: SOACity,
    address: SOAAddress,
    bldg: SOABldg,
    isRefuse: SOAIsRefuse,
    isJapan: SOAIsJapan,
    objectId: SOAObjectId,
    idAndContentType: SOAIdAndContentType,
    decedent: SOADecedent,
    contentType: SOAContentType,
    id: SOAId
} = SpouseOrAscendant.idxs;

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
        idAndContentType: 18,
        decedent: 19,
        contentType1: 20,
        contentType2: 21,
        objectId2: 22,
        id: 23
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        const deathDateDivStyle = window.getComputedStyle(this.fieldset.getElementsByClassName("heirsDeathDateDiv")[0]);
        const otherParentDivStyle = window.getComputedStyle(this.fieldset.getElementsByClassName("otherParentDiv")[0]);

        // 生存しているとき
        if(deathDateDivStyle.display === "none"){

            // 生年月日は必須
            this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                (_, i) =>
                i === DescendantOrCollateral.idxs.birthYear ||
                i === DescendantOrCollateral.idxs.birthMonth ||
                i === DescendantOrCollateral.idxs.birthDate 
            );

            // 相続放棄していないとき
            if(this.inputs[DescendantOrCollateral.idxs.isRefuse].value === "false"){
                this.noInputs = this.noInputs.concat(
                    Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                        (_, i) =>
                        i === DescendantOrCollateral.idxs.isAcquire[yes] ||
                        i === DescendantOrCollateral.idxs.isAcquire[no]
                    )
                );
            }

            // 連れ子、半血のとき
            if(otherParentDivStyle.display !== "none"){
                this.noInputs = this.noInputs.concat(
                    Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                        (_, i) =>
                        i === DescendantOrCollateral.idxs.otherParentsName
                    )
                );
            }
        }else{
            if(otherParentDivStyle.display !== "none"){
                this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                    (_, i) =>
                    i === DescendantOrCollateral.idxs.deathYear ||
                    i === DescendantOrCollateral.idxs.deathMonth ||
                    i === DescendantOrCollateral.idxs.deathDate ||
                    i === DescendantOrCollateral.idxs.birthYear ||
                    i === DescendantOrCollateral.idxs.birthMonth ||
                    i === DescendantOrCollateral.idxs.birthDate ||
                    i === DescendantOrCollateral.idxs.otherParentsName                    
                    );
            }else{
                this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                    (_, i) =>
                    i === DescendantOrCollateral.idxs.deathYear ||
                    i === DescendantOrCollateral.idxs.deathMonth ||
                    i === DescendantOrCollateral.idxs.deathDate ||
                    i === DescendantOrCollateral.idxs.birthYear ||
                    i === DescendantOrCollateral.idxs.birthMonth ||
                    i === DescendantOrCollateral.idxs.birthDate
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
const {
    name: DOCName,
    deathYear: DOCDeathYear,
    deathMonth: DOCDeathMonth,
    deathDate: DOCDeathDate,
    birthYear: DOCBirthYear,
    birthMonth: DOCBirthMonth,
    birthDate: DOCBirthDate,
    isAcquire: DOCIsAcquire,
    prefecture: DOCPrefecture,
    city: DOCCity,
    address: DOCAddress,
    bldg: DOCBldg,
    otherParentsName: DOCOtherParentsName,
    isRefuse: DOCIsRefuse,
    isJapan: DOCIsJapan,
    isAdult: DOCIsAdult,
    objectId1: DOCObjectId1,
    idAndContentType: DOCIdAndContentType,
    decedent: DOCDecedent,
    contentType1: DOCContentType1,
    contentType2: DOCContentType2,
    objectId2: DOCObjectId2,
    id: DOCId
} = DescendantOrCollateral.idxs;

//遺産分割の方法
const typeOfDivisions = [];
class TypeOfDivision extends Fieldset{

    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => TypeOfDivision.idxs.typeOfDivision.input.includes(i)
        );
        this.idx = TypeOfDivision.idxs;
        this.typeOfDivisionInputIdxs = this.idx.typeOfDivision.input;
        this.contentType1InputIdx = this.idx.contentType1.input;
        this.objectId1InputIdx = this.idx.objectId1.input;
        this.propertyAllocationInputIdxs = this.idx.propertyAllocation.input;
        this.cashAllocationInputIdxs = this.idx.cashAllocation.input;
        this.contentType2InputIdx = this.idx.contentType2.input;
        this.objectId2InputIdx = this.idx.objectId2.input;
        this.decedentInputIdx = this.idx.decedent.input;
        typeOfDivisions.push(this);
    }

    static idxs = {
        typeOfDivision:{form: 0, input:[0, 1]},
        propertyAllocation:{form: 1, input:[2, 3]},
        contentType1:{form: 2, input:4},
        objectId1:{form: 3, input:5},
        cashAllocation:{form: 4, input:[6, 7, 8]},
        allCashAcquirer:{form: 5, input:9},
        contentType2:{form: 6, input:10},
        objectId2:{form: 7, input:11},
        decedent:{form: 8, input:12}
    }

    static section = document.getElementById("type-of-division-section");

    //通常分割か判別する
    isNormalDivision(){
        return this.inputs[this.typeOfDivisionInputIdxs[yes]].checked;
    }
    //換価分割か判別する
    isExchangeDivision(){
        return this.inputs[this.typeOfDivisionInputIdxs[no]].checked;
    }
    //不動産の取得者が１人か判別する
    isPropertyAcquirerAlone(){
        return this.inputs[this.contentType1InputIdx].value !== "" && 
            this.inputs[this.objectId1InputIdx].value !== "";
    }
    //不動産が法定相続か判別する
    isPropertyLegalInheritance(){
        return this.inputs[this.propertyAllocationInputIdxs[yes]].checked;
    }
    //不動産の分割方法がその他か判別する
    isPropertyFreeAllocation(){
        return this.inputs[this.propertyAllocationInputIdxs[no]].checked;
    }
    //金銭が単独取得か判別する
    isCashAcquirerAlone(){
        return this.inputs[this.contentType2InputIdx].value !== "" &&
            this.inputs[this.objectId2InputIdx].value !== "";
    }
    //金銭が法定相続か判別する
    isCashLegalInheritance(){
        return this.inputs[this.cashAllocationInputIdxs[no]].checked;
    }
}
const {typeOfDivision: TODTypeOfDivision,
    propertyAllocation: TODPropertyAllocation,
    contentType1: TODContentType1,
    objectId1: TODObjectId1,
    cashAllocation: TODCashAllocation,
    allCashAcquirer: TODAllCashAcquirer,
    contentType2: TODContentType2,
    objectId2: TODObjectId2,
    decedent: TODDecedent
} = TypeOfDivision.idxs;

//不動産の数
const numberOfProperties = [];
class NumberOfProperties extends Fieldset{
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input")).filter(
            (_, i) => i !== NumberOfProperties.idxs.decedent
        );
        this.decreaseBtn = Array.from(this.fieldset.getElementsByClassName("decreaseBtn"));
        this.increaseBtn = Array.from(this.fieldset.getElementsByClassName("increaseBtn"));
        this.idxs = NumberOfProperties.idxs;
        this.landIdx = this.idxs.land;
        this.houseIdx = this.idxs.house;
        this.bldgIdx = this.idxs.bldg;
        this.decedentIdx = this.idxs.decedent;
        numberOfProperties.push(this);
    }
    //入力欄のインデックス
    static idxs = {
        land: 0,
        house: 1,
        bldg: 2,
        decedent: 3,
    }
    static section = document.getElementById("number-of-properties-section");


    // プロパティのカウントを取得する共通のメソッド
    getCount(type, isNum = false) {
        const idx = NumberOfProperties.idxs[type];
        if (typeof idx === 'undefined') {
            throw new Error('getCount：typeに想定しない値が渡されました');
        }
        const val = this.inputs[idx].value;
        return isNum ? parseInt(val, 10) || 0 : val; // NaNを0に変換
    }

    getLandCount(isNum) {
        return this.getCount('land', isNum);
    }

    getHouseCount(isNum) {
        return this.getCount('house', isNum);
    }

    getBldgCount(isNum) {
        return this.getCount('bldg', isNum);
    }
}
const {land: NOPLand,
    house: NOPHouse,
    bldg: NOPBldg,
    decedent: NOPDecedent
} = NumberOfProperties.idxs;

//土地情報
const lands = [];
class Land extends Fieldset{

    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input")).filter(
            (_, i) =>
            i !== Land.idxs.landNumber.input[other] &&
            i !== Land.idxs.landNumber.input[no] &&
            i !== Land.idxs.purparty.input[yes] &&
            i !== Land.idxs.purparty.input[other2] &&
            i !== Land.idxs.index.input &&
            i !== Land.idxs.id.input &&
            i !== Land.idxs.decedent.input &&
            i !== Land.idxs.register.input &&
            i !== Land.idxs.id.input 
        );
        lands.push(this);
        this.tempAcquirers = [];
        this.tempCashAcquirers = [];
        this.acquirers = [];
        this.cashAcquirers = [];
    }

    static idxs = {
        number:{form: 0, input: 0},
        address:{form: 1, input: 1},
        landNumber:{form: 2, input: [2,3,4]},
        purparty:{form: 3, input: [5,6,7,8]},
        office:{form: 4, input: 9},
        price:{form: 5, input: 10},
        isExchange:{form:6, input: [11, 12]},
        index:{form:7, input:13},
        id:{form:8, input:14},
        decedent:{form:9, input:15},
        register:{form:10, input:16}
    }

    static section = document.getElementById("land-section");

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
    index: LIndex,
    id: LId,
    decedent: LDecedent,
    register: LRegister
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
        contentType1: 4,
        objectId1: 5,
        decedent: 6
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        this.fieldset = document.getElementById(fieldsetId);
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
    }
}
const {contentType2: AContentType2,
    objectId2: AObjectId2,
    percentage: APercentage,
    target: ATarget,
    contentType1: AContentType1,
    objectId1: AObjectId1,
    decedent: ADecedent
} = Acquirer.idxs;

//土地情報欄のボタン
const removeTLABtns = Land.section.getElementsByClassName("removeTempLandAcquirerBtn");
const addTLABtns = Land.section.getElementsByClassName("addTempLandAcquirerBtn");
const removeTLCABtns = Land.section.getElementsByClassName("removeTempLandCashAcquirerBtn");
const addTLCABtns = Land.section.getElementsByClassName("addTempLandCashAcquirerBtn");
//前の土地に戻るボタンと次の土地へ進むボタン
const landCorrectBtn = document.getElementById("landCorrectBtn");
const landOkBtn = document.getElementById("landOkBtn");

//建物情報
const houses = [];
class House extends Fieldset{
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input")).filter(
            (_, i) =>
            i !== House.idxs.houseNumber.input[other] &&
            i !== House.idxs.houseNumber.input[no] &&
            i !== House.idxs.purparty.input[yes] &&
            i !== House.idxs.purparty.input[other2] &&
            i !== House.idxs.index.input &&
            i !== House.idxs.id.input &&
            i !== House.idxs.decedent.input &&
            i !== House.idxs.register.input
        );
        houses.push(this);
        this.tempAcquirers = [];
        this.tempCashAcquirers = [];
        this.acquirers = [];
        this.cashAcquirers = [];
    }

    static idxs = {
        number:{form: 0, input: 0},
        address:{form: 1, input: 1},
        houseNumber:{form: 2, input: [2,3,4]},
        purparty:{form: 3, input: [5,6,7,8]},
        office:{form: 4, input: 9},
        price:{form: 5, input: 10},
        isExchange:{form:6, input: [11, 12]},
        index:{form:7, input:13},
        id:{form:8, input:14},
        decedent:{form:9, input:15},
        register:{form:10, input:16},
    }

    static section = document.getElementById("house-section");

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
    index: HIndex,
    id: HId,
    decedent: HDecedent,
    register: HRegister
} = House.idxs;

//建物情報欄のボタン
const removeTHABtns = House.section.getElementsByClassName("removeTempHouseAcquirerBtn");
const addTHABtns = House.section.getElementsByClassName("addTempHouseAcquirerBtn");
const removeTHCABtns = House.section.getElementsByClassName("removeTempHouseCashAcquirerBtn");
const addTHCABtns = House.section.getElementsByClassName("addTempHouseCashAcquirerBtn");
//前の建物に戻るボタンと次の建物へ進むボタン
const houseCorrectBtn = document.getElementById("houseCorrectBtn");
const houseOkBtn = document.getElementById("houseOkBtn");

//区分建物情報
const bldgs = [];
class Bldg extends Fieldset{
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input")).filter(
            (_, i) =>
            i !== Bldg.idxs.bldgNumber.input[other] &&
            i !== Bldg.idxs.bldgNumber.input[no] &&
            i !== Bldg.idxs.purparty.input[yes] &&
            i !== Bldg.idxs.purparty.input[other2] &&
            i !== Bldg.idxs.index.input &&
            i !== Bldg.idxs.id.input &&
            i !== Bldg.idxs.decedent.input &&
            i !== Bldg.idxs.register.input
        );
        bldgs.push(this);
        this.sites = [];
        this.tempAcquirers = [];
        this.tempCashAcquirers = [];
        this.acquirers = [];
        this.cashAcquirers = [];
    }

    static idxs = {
        number:{form: 0, input: 0},
        address:{form: 1, input: 1},
        bldgNumber:{form: 2, input: 2},
        purparty:{form: 3, input: [3, 4, 5, 6]},
        office:{form: 4, input: 7},
        price:{form: 5, input: 8},
        isExchange:{form:6, input: [9, 10]},
        index:{form:7, input: 11},
        id:{form:8, input: 12},
        decedent:{form:9, input: 13},
        register:{form:10, input: 14},
    }

    static section = document.getElementById("bldg-section");

    addSite(site){
        this.sites.push(site);
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
const {number: BNumber, 
    address: BAddress, 
    bldgNumber: BBldgNumber, 
    purparty: BPurparty, 
    office: BOffice, 
    price: BPrice, 
    isExchange: BIsExchange,
    index: BIndex,
    id: BId,
    decedent: BDecedent,
    register: BRegister
} = Bldg.idxs;

//敷地権情報
const sites = [];
class Site extends Fieldset{
    static idxs = {
        number:{form: 0, input: 0},
        addressAndLandNumber:{form: 1, input: 1},
        type:{form: 2, input: 2},
        purparty:{form: 3, input: [3, 4, 5]},
        price:{form: 4, input: 6},
        target:{form: 5, input: 7},
        bldg:{form: 6, input: 8},
        decedent:{form: 7, input: 9},
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId, instance){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"))
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) =>
            i !== Site.idxs.number.input &&
            i !== Site.idxs.purparty.input[yes] &&
            i !== Site.idxs.target.input &&
            i !== Site.idxs.bldg.input &&
            i !== Site.idxs.decedent.input
        );
        this.belongsTo = instance;
        sites.push(this);
    }
}
const {number: SNumber, 
    addressAndLandNumber: SAddressAndLandNumber, 
    type: SType, 
    purparty: SPurparty, 
    price: SPrice, 
    target: STarget,
    bldg: SBldg,
    decedent: SDecedent
} = Site.idxs;

//区分建物情報欄のボタン
const removeSiteBtns = Bldg.section.getElementsByClassName("removeSiteBtn");
const addSiteBtns = Bldg.section.getElementsByClassName("addSiteBtn");
const removeTBABtns = Bldg.section.getElementsByClassName("removeTempBldgAcquirerBtn");
const addTBABtns = Bldg.section.getElementsByClassName("addTempBldgAcquirerBtn");
const removeTBCABtns = Bldg.section.getElementsByClassName("removeTempBldgCashAcquirerBtn");
const addTBCABtns = Bldg.section.getElementsByClassName("addTempBldgCashAcquirerBtn");
//前の区分建物に戻るボタンと次の区分建物へ進むボタン
const bldgCorrectBtn = document.getElementById("bldgCorrectBtn");
const bldgOkBtn = document.getElementById("bldgOkBtn");

const applications = [];
class Application extends Fieldset{
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) =>
            i !== Application.idxs.applicantPhoneNumber.input &&
            i !== Application.idxs.name.input &&
            i !== Application.idxs.address.input &&
            i !== Application.idxs.phoneNumber.input &&
            i !== Application.idxs.isReturn.input[yes] &&
            i !== Application.idxs.isReturn.input[no] &&
            i !== Application.idxs.isMail.input[yes] &&
            i !== Application.idxs.isMail.input[no] &&
            i !== Application.idxs.objectId.input &&
            i !== Application.idxs.contentType.input &&
            i !== Application.idxs.decedent.input
        );
        applications.push(this);
    }

    static idxs = {
        applicant:{form: 0, input: 0},
        isAgent:{form: 1, input: [1, 2]},
        applicantPhoneNumber:{form: 2, input: 3},
        name:{form: 3, input: 4},
        address:{form: 4, input: 5},
        phoneNumber:{form: 5, input: 6},
        isReturn:{form: 6, input: [7, 8]},
        isMail:{form: 7, input: [9, 10]},
        objectId:{form: 8, input: 11},
        contentType:{form: 9, input: 12},
        decedent:{form: 10, input: 13},
    }

    static section = document.getElementById("application-section");
}
const {applicant: aApplicant, 
    isAgent: aIsAgent, 
    applicantPhoneNumber: aApplicantPhoneNumber, 
    name: aName, 
    address: aAddress, 
    phoneNumber: aPhoneNumber, 
    isReturn: aIsReturn, 
    isMail: aIsMail,
    objectId: aObjectId,
    contentType: aContentType,
    decedent: aDecedent
} = Application.idxs;

//修正するボタンと次の項目へボタン
const correctBtn = document.getElementById("correctBtn");
const okBtn = document.getElementById("okBtn");
const statusText = document.getElementById("statusText");
//２を修正するボタンと４へ進むボタン
const preBtn = document.getElementById("preBtn");



/**
 * 分数を加算する処理
 * @param {string} bottom 
 * @param {string} top 
 * @param {Fraction} totalFraction 
 */
function sumTotalFraction(bottom, top, totalFraction){
    const b = parseInt(ZenkakuToHankaku(bottom), 10);
    const t = parseInt(ZenkakuToHankaku(top), 10);
    if(b && t)
        totalFraction = totalFraction.add(new Fraction(t, b));
    return totalFraction;
}

/**
 * インスタンスのデータから分数の合計を取得する処理
 * @param {TempAcquirer} instances 
 * @param {number} bottomIdx 
 * @param {number} topIdx 
 * @returns 
 */
function getTotalFraction(instances, bottomIdx, topIdx){
    let totalFraction = new Fraction(0);
    instances.forEach(x => {
        const inputs = x.inputs;
        totalFraction = sumTotalFraction(inputs[bottomIdx].value, inputs[topIdx].value, totalFraction);
    })
    return totalFraction;
}

/**
 * インスタンスが引数に渡された配列に格納されたクラスのいずれかに該当するか判別する
 */
function isClassMatched(instance, classes){
   return classes.some(x => instance instanceof x);
}

/**
 * 次の項目へ進むボタンなど進む関連ボタンの有効化判別処理
 * @param {Fieldset} instance チェック対象のインスタンス
 */
function isActivateOkBtn(instance){

    //対象のインスタンスのエラー要素の数をチェック
    const isInstanceVerified = instance.noInputs.length === 0;

    //被相続人情報のとき
    if(isClassMatched(instance, [Decedent, RegistryNameAndAddress])){
        //被相続人と登記簿上の氏名・住所の両方のエラー要素がないとき次の項目へボタンを有効化する
        const isDecedentSectionVerified = decedents.concat(registryNameAndAddresses).every(x => x.noInputs.length === 0);
        okBtn.disabled = !isDecedentSectionVerified;
    }else if(isClassMatched(instance, [SpouseOrAscendant, DescendantOrCollateral])){
        //相続人情報のとき
        const isLastHeir = getLastElFromArray(heirs) === instance;
        //最後の相続人でエラー要素がないとき、次の項目へボタンを有効化する
        if(isLastHeir){
            okBtn.disabled = !isInstanceVerified;
        }else{
            //他の相続人でエラー要素がないとき、次の人へボタンを有効化する
            SpouseOrAscendant.okBtn.disabled = !isInstanceVerified;
        }
    }else if(isClassMatched(instance, [Land, House, Bldg, Site, TempAcquirer])){
        //不動産情報のとき
        //インスタンス自身と仮フォームのデータもチェックする、区分建物の場合は敷地権も
        const isParentInstance = isClassMatched(instance, [Land, House, Bldg]);
        verifyPropertySection(isParentInstance? instance: instance.belongsTo);
    }else if(instance instanceof Application){
        //申請情報
        document.getElementById("submitBtn").disabled = isInstanceVerified? false: true;
    }else{
        //その他
        okBtn.disabled = isInstanceVerified? false: true;
    }

    /**
     * 単独相続か法定相続か判別する
     * @param {TempAcquirer} TA 
     * @returns {boolean}
     */
    function isAloneOrLegalInheritance(TA){
        const prefix = getPropertyPrefix(TA.belongsTo);
        const fieldsetId = TA.fieldset.id;
        const TOD = typeOfDivisions[0];
        const isLAAutoInputted = fieldsetId.includes(`temp_${prefix}_acquirer-`) &&
            (TOD.isPropertyLegalInheritance() || TOD.isPropertyAcquirerAlone());
        const isLCALegalAutoInputted = fieldsetId.includes(`temp_${prefix}_cash_acquirer`) &&
            (TOD.isCashLegalInheritance() || TOD.isCashAcquirerAlone());
        return (isLAAutoInputted || isLCALegalAutoInputted);
    }
    /**
     * 取得割合の検証
     * @param {TempAcquirer} TAs 
     * @returns {boolean} 検証結果
     */
    function isHundredPercent(temps){
        //土地取得者又は金銭取得者が１人又は法定相続のとき、trueを返す(取得割合の検証不要)
        if(isAloneOrLegalInheritance(temps[0]))
            return true;
        //法定相続ではないとき、対象の全仮フォームをチェックして取得割合を取得する
        const percentageIdxs = TAPercentage.input;
        const totalFraction = getTotalFraction(temps, percentageIdxs[yes], percentageIdxs[no]);
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
     * 不動産情報の検証
     * @param {Land|House|Bldg} instance 
     */
    function verifyPropertySection(instance){
        const instanceInputs = instance.inputs;
        const prefix = upperFirstString(getPropertyPrefix(instance));
        const instances = getPropertyInstancesFromPrefix(prefix);
        const propertyOkBtn = prefix === "Land"? landOkBtn: (prefix === "House"? houseOkBtn: bldgOkBtn);
        const propertyVerified = instance.noInputs.length === 0;
        const TAs = instance.tempAcquirers;
        const TAsPurpartyVerified = isHundredPercent(TAs);
        const TAVerified = getLastElFromArray(TAs).noInputs.length === 0;
        const TCAs = instance.tempCashAcquirers;
        const isExchangeChecked = prefix === "Bldg"? instanceInputs[BIsExchange.input[yes]].checked: instanceInputs[LIsExchange.input[yes]].checked;
        const TCAsPurpartyVerified = isExchangeChecked ? isHundredPercent(TCAs): true;
        const TCAVerified = getLastElFromArray(TCAs).noInputs.length === 0;
        //区分建物のとき敷地のチェックも必要
        const sites = prefix === "Bldg"? instance.sites: null;
        const sitesVerified = sites? getLastElFromArray(sites).noInputs.length === 0: null;
        const isFormsVerified = sites?
            propertyVerified && TAVerified && TAsPurpartyVerified && TCAVerified && TCAsPurpartyVerified && sitesVerified:
            propertyVerified && TAVerified && TAsPurpartyVerified && TCAVerified && TCAsPurpartyVerified;
        const isLastFormsVerified = getLastElFromArray(instances) === instance && isFormsVerified;
        //最後の不動産欄の検証が通ったとき
        if(isLastFormsVerified){
            //次の不動産へボタンを無効化する、次の項目へボタンを有効化する
            propertyOkBtn.disabled = true;
            okBtn.disabled = false;
        }else if(isFormsVerified){
            //最後以外の不動産欄の検証が通ったとき
            propertyOkBtn.disabled = false;
            okBtn.disabled = true;
        }else{
            //検証が通らないインスタンスがあるとき、次の不動産へボタンと次の項目へボタンを無効化する
            propertyOkBtn.disabled = true;
            okBtn.disabled = true;
        }
        //仮取得者のフォームエラーなし、かつ取得割合が１分の１ではないとき、かつ候補者が残っているとき不動産取得者の追加ボタンを有効化する
        toggleTAAddButton(TAs, TAVerified, TAsPurpartyVerified, false);
        toggleTAAddButton(TCAs, TCAVerified, TCAsPurpartyVerified, true);
        //敷地権のエラーがない場合、追加ボタンを有効にする
        if(sites){
            const addSiteBtn = getLastElFromArray(sites).fieldset.parentElement.getElementsByClassName(`addSiteBtn`)[0];
            addSiteBtn.disabled = sitesVerified? false: true;
        }

        //仮フォームの追加ボタンの有効判別
        function toggleTAAddButton(temps, verified, purpartyVerified, isCash = false) {
            const isAllSelected = temps[0].inputs[TAAcquirer.input].options.length - 1 === temps.length;
            const addBtn = getLastElFromArray(temps).fieldset.nextElementSibling.getElementsByClassName(`addTemp${prefix}${isCash? "Cash": ""}AcquirerBtn`)[0];
            addBtn.disabled = verified && !purpartyVerified && !isAllSelected ? false : true;
        }
    }

}

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
 */
async function getDecedentCityData(){
    const url = 'get_decedent_city_data';
    const inputs = decedents[0].inputs;
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        if (!response.ok) {
            // HTTPエラーを投げ、それをcatchブロックで捕捉
            throw new Error(`サーバーエラー: ${response.status}`);
        }
        return response.json();
    }).then(response => {
        if(response.city !== ""){
            inputs[DCity].value = response.city;
        }
        if(response.domicileCity !== ""){
            inputs[DDomicileCity].value = response.domicileCity;
        }
    }).catch(e => {
        console.error(`getDecedentCityData：${e}`);
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
        console.log(`getRegistryNameAndAddressCityData:エラーが発生\n${error}`);
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
    }).catch(e => {
        basicLog("getHeirsCityData", e);
    });
}

/**
 * 相続人情報のデータを復元する
 */
async function loadHeirsData(){
    try{
        const heirsCityDatas = await getHeirsCityData();
        //各相続人のインスタンスをループ処理
        for(const heir of heirs){

            const inputs = heir.inputs;
            const idxs = heir.constructor.idxs;
            //各インプット要素の入力状況に応じてエラー要素を削除する
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
            if(SpouseOrAscendant.okBtn.disabled === false)
                handleHeirsOkBtnEvent();            
        }
    }catch(e){
        basicLog("loadHeirsData", e);
    }
}

/**
 * 遺産分割方法のデータを復元する
 */
function loadTODData(){
    if(typeOfDivisions.length <= 0)
        throw new Error("loadTODData：インスタンスが生成されてません。");

    const instance = typeOfDivisions[0];
    const inputs = instance.inputs;

    restoreAloneCashAcquirer(); //単独金銭取得者データの復元

    //入力状態に応じてイベントを発生させる
    const noEventIdx = [TODContentType1.input, TODObjectId1.input, TODContentType2.input, TODObjectId2.input, TODDecedent.input];
    for(let i = 0, len = inputs.length; i < len; i++){
        //隠しインプットはイベント不要
        if(noEventIdx.includes(i))
            continue;
    
        const input = inputs[i];
        const tagName = input.tagName.toUpperCase();
        if(tagName === "INPUT"){
            if(input.type === "radio"){
                if(input.checked){
                    input.dispatchEvent(new Event("change"));
                }
            }else{
                throw new Error("loadTODData：想定されてないinputが存在します");
            }
        }else if(tagName === "SELECT"){
            if(input.value !== ""){
                input.dispatchEvent(new Event("change"));
            }
        }else{
            throw new Error("loadTODData：想定されてないhtml要素が存在します");
        }
    }
    isActivateOkBtn(instance);

    //金銭取得者のデータを復元する
    function restoreAloneCashAcquirer(){
        //１人が取得するにチェックが入っている、かつcontent_type2とobject_id2の値が存在するとき
        const isAcquirerAlone = inputs[TODCashAllocation.input[yes]].checked;
        const contentType2 = inputs[TODContentType2.input].value;
        const objectId2 = inputs[TODObjectId2.input].value;
        if(isAcquirerAlone && contentType2 && objectId2){
            //取得者を選択状態にする
            const acquirer = objectId2 + "_" + contentType2;
            inputs[TODAllCashAcquirer.input].value = acquirer;
        }else if(!isAcquirerAlone && contentType2 && objectId2){
            throw new Error("loadTODData：不正なデータが登録されてます");
        }
    }
}

/**
 * 不動産の数の欄を復元する
 */
function loadNOPData(){
    const instance = numberOfProperties[0], inputs = instance.inputs;
    if(numberOfProperties.length > 0){
        for(let i = 0, len = inputs.length; i < len; i++){
            //隠しinputは処理不要
            if(i === NOPDecedent)
                break;
            const input = inputs[i];
            //０以上のデータが反映されているとき、changeイベントを発火する
            if(parseInt(input.value) > 0){
                input.dispatchEvent(new Event("change"));
            }
        }
        //不動産に１以上の入力があるとき、マイナスボタンを有効化する
        const landCount = instance.getLandCount(true), houseCount = instance.getHouseCount(true), bldgCount = instance.getBldgCount(true);
        const min = 0, max = 20;
        const increaseBtn = instance.increaseBtn, decreaseBtn = instance.decreaseBtn;
        toggleCountBtn(increaseBtn[NOPLand], decreaseBtn[NOPLand], landCount, min, max);
        toggleCountBtn(increaseBtn[NOPHouse], decreaseBtn[NOPHouse], houseCount, min, max);
        toggleCountBtn(increaseBtn[NOPBldg], decreaseBtn[NOPBldg], bldgCount, min, max);

    }else{
        throw new Error("loadNOPData：インスタンスが生成されてません。");
    }

}

/**
 * 不動産欄の入力状況を再現する
 * @param {string} prefix 
 * @param {HTMLInputElement[]} inputs 
 */
async function reproducePropertyInputStatus(prefix, inputs){
    const functionName = "reproducePropertyInputStatus";

    try{
        const purpartyInputIdxs = prefix === "bldg"? BPurparty.input: LPurparty.input;
        const indexInputIdx = prefix === "bldg"? BIndex.input: LIndex.input;
        
        //不動産のinputのイベントを発火させる
        for(let i = 0, len = inputs.length; i < len; i++){

            //隠しデータ以降は処理不要
            if(i === indexInputIdx)
                break;

            //所有権チェックボックスと所有権隠しinputはスキップする
            if([purpartyInputIdxs[yes], purpartyInputIdxs[other2]].includes(i))
                continue;

            const input = inputs[i];
            //入力されている欄はイベントを発火する
            if(input.type === "text" && input.value || input.type === "radio" && input.checked)
                input.dispatchEvent(new Event("change"));
        }
    }catch(e){
        basicThrowError(functionName, e);
    }
}

/**
 * 対象の区分建物の敷地権の入力状況を再現する
 * @param {Bldg} instance 
 */
function reproduceSiteInputsStatus(instance){
    try{
        //敷地のイベントを発火
        const sites = instance.sites;
        for(let i = 0, len = sites.length; i < len; i++){
            const site = sites[i], inputs = site.inputs;
            for(let j = 0, len2 = inputs.length; j < len2; j++){
                if(j === SPurparty.input[yes])
                    continue;
                const input = inputs[j];
                if(input.value){
                    input.dispatchEvent(new Event("change"));
                }
            }
            //最後の敷地権以外でエラー要素が存在するとき、エラー表示する
            if(i !== len - 1 && site.noInputs.length !== 0)
            basicThrowError("loadBldgData", `${bldgs.indexOf(instance)}番目の区分建物の${i}番目の敷地権のデータに未入力があります`)
        }
    }catch(e){
        basicThrowError("loadBldgData", e);
    }
}

/**
 * 基本的なエラーオブジェクト
 * @param {string} functionName 
 * @param {Error|string} e 
 */
function basicThrowError(functionName, e = ""){
    throw new Error(`エラー発生箇所：${functionName}\n詳細：${e}`);
}

/**
 * 仮取得者フォームの入力状況を再現する
 * @param {boolean} isCash 
 * @param {Land|House|Bldg} instance 
 */
function reproduceTempInputsStatus(isCash, prefix, instance){
    const functionName = "reproduceTempInputsStatus";
    const {cashAcquirers, acquirers: propertyAcquirers, fieldset, tempCashAcquirers, tempAcquirers: tempPropertyAcquires} = instance;

    try{
        const As = isCash? cashAcquirers: propertyAcquirers;
        const TAs = isCash? tempCashAcquirers: tempPropertyAcquires;
        const fixedPrefix = upperFirstString(prefix);
        const addTempBtnClassName = isCash? `addTemp${fixedPrefix}CashAcquirerBtn`: `addTemp${fixedPrefix}AcquirerBtn`;
        const addTempBtn = fieldset.parentElement.getElementsByClassName(addTempBtnClassName)[0];

        //取得者がいないときは処理を中止（金銭取得者用）
        if(As.length === 0)
            return;
    
        // 取得者のインスタンスに対してループ
        for(let i = 0, len = As.length; i < len; i++){
            const inputs = As[i].inputs;
            const tempInputs = getLastElFromArray(TAs).inputs;

            inputTAAndDispatchChangeEvent(tempInputs, inputs);
    
            //フォーム追加操作
            if(addTempBtn.disabled === false){

                addTempBtn.dispatchEvent(new Event("click"));

            }else if(i !== len - 1 && addTempBtn.disabled){

                basicThrowError(functionName, `${fieldset.id}の${i}番目の${isCash? "金銭": "不動産"}取得者のデータに未入力があります`)
            }
        }
    }catch(e){
        basicThrowError(functionName, e);
    }

    function inputTAAndDispatchChangeEvent(TInputs, AInputs){
        inputOrCheckAndDispatchChangeEvent(TInputs[TAAcquirer.input], AInputs[AObjectId2].value + "_" + AInputs[AContentType2].value);
        const [b, t] = AInputs[APercentage].value.split("分の");
        inputOrCheckAndDispatchChangeEvent(TInputs[TAPercentage.input[yes]], b);
        inputOrCheckAndDispatchChangeEvent(TInputs[TAPercentage.input[no]], t);
    }
}

/**
 * 不動産情報のデータを復元する
 */
async function loadPropertyData(prefix){
    const functionName = "loadPropertyData";

    try{
        const instances = getPropertyInstancesFromPrefix(prefix);
        const propertyOkBtn = prefix === "land"? landOkBtn:
            prefix === "house"? houseOkBtn:
            bldgOkBtn;
        //各不動産に対してループ処理
        for(let i = 0, len = instances.length; i < len; i++){
            const instance = instances[i];
            const {inputs, constructor} = instance;

            //不動産欄の入力状況を再現する
            await reproducePropertyInputStatus(prefix, inputs);
    
            //最後の不動産以外でエラー要素が存在するときエラー表示する
            if(i !== len && instance.noInputs.length !== 0)
                throw new Error(`${functionName}：${i}番目の${prefix}のデータが未入力にあります`);
    
            //敷地権欄の入力状況を再現する
            if(prefix === "bldg")
                reproduceSiteInputsStatus(instance);
    
            const TOD = typeOfDivisions[0];
            // 不動産が法定相続のとき以外は、不動産の仮フォームを復元する
            if(!TOD.isPropertyLegalInheritance()){
                reproduceTempInputsStatus(false, prefix, instance);    
            }

            // 換価する不動産かつ、法定相続のときは、金銭の仮フォームを復元する
            if(inputs[constructor.idxs.isExchange.input[yes]].checked && !TOD.isCashLegalInheritance()){
                reproduceTempInputsStatus(true, prefix, instance);    
            }
    
            //ボタン操作
            isActivateOkBtn(instance);
            if(propertyOkBtn.disabled === false){
                propertyOkBtn.dispatchEvent(new Event("click"));
            }
        }
    }catch(e){
        basicThrowError(functionName, e);
    }
}

/**
 * 被相続人のデータを復元
 */
async function loadDecedentData(){
    try{
        const inputs = decedent.inputs;
        for(let i = 0, len = inputs.length; i < len; i++){
            const input = inputs[i];
            //データがあるとき
            if(input.value !== ""){
                //エラー要素から削除する
                decedent.noInputs = decedent.noInputs.filter(x => x.id !== input.id)
                //都道府県のとき、市区町村データを取得する
                if([DPrefecture, DDomicilePrefecture].includes(i))
                    await getCityData(input.value, inputs[i + 1], decedent);
                else if([DCity, DDomicileCity].includes(i))
                    await getDecedentCityData();
            }
        }
    }catch(e){
        throw new Error(`loadDecedentData：被相続人のデータ復元に失敗\n詳細：${e}`);
    }    
}

/**
 * 登記簿上の氏名住所データの復元
 */
async function loadRegistryNameAndAddressData(){
    try{
        //登記簿上の氏名住所のデータを反映する
        const RNAACount = document.getElementsByClassName("registryNameAndAddressFieldset").length;
        //フォーム分のインスタンスを生成する（１つはすでに生成されているため1からスタート）
        for(let i = 1; i < RNAACount; i++){
            new RegistryNameAndAddress(`id_registry_name_and_address-${i}-fieldset`);
        }
        setRegistryNameAndAddressEvent(1);
        //市区町村データ以外を反映させる
        for(let i = 0; i < RNAACount; i++){
            const instance = registryNameAndAddresses[i];
            const inputs = instance.inputs;
            for(let j = 0, len = inputs.length; j < len; j++){
                const input = inputs[j];
                if(input.value != ""){
                    //都道府県のとき、市区町村データを取得する
                    if(j === RPrefecture){
                        await getCityData(input.value, inputs[RCity], instance);
                    }
                    //入力データがあるとき、エラー要素から削除する
                    instance.noInputs = instance.noInputs.filter(x => x.id !== input.id)
                }
            }
        }
        //市区町村データを反映させる
        getRegistryNameAndAddressCityData().then(citys => {
            if(citys.length === 0)
                return;
            for(let i = 0, len = citys.length; i < len; i++){
                registryNameAndAddresses[i].inputs[RCity].value = citys[i];
            }
        })
    }catch(e){
        throw new Error(`loadRegistryNameAndAddressData：登記簿上の氏名住所のデータ復元に失敗\n詳細：${e}`);
    }
}

/**
 * 申請情報の復元
 */
function loadApplicationData(){
    //申請者を復元してボタン操作
    const application = applications[0], inputs = application.inputs;
    const applicant = inputs[aObjectId.input].value + "_" + inputs[aContentType.input].value;
    inputs[aApplicant.input].value = applicant;
    for(let i = 0, len = inputs.length; i < len; i++){
        if(i === aObjectId)
            break;
        dispatchEventIfValue(inputs[i], "change");
    }
    isActivateOkBtn(application);
}

/**
 * ユーザーのデータを取得する
 */
async function loadData(){
    try{
        //被相続人データを反映
        await loadDecedentData();

        //登記簿上の氏名住所データを反映
        await loadRegistryNameAndAddressData();
        isActivateOkBtn(decedents[0]);
        const result = await handleAfterDataLoaded(SpouseOrAscendant.section);

        if(!result)
            return;
        
        //相続人情報を反映する
        await loadHeirsData();
        if(okBtn.disabled){
            const target = heirs.filter(x => !x.fieldset.disabled)[0].fieldset;
            scrollToTarget(target);
            return;
        }
        await handleOkBtnEvent();
        await scrollToTarget(TypeOfDivision.section);
        
        //遺産分割方法を反映する
        loadTODData();
        await handleAfterDataLoaded(NumberOfProperties.section)
    
        //不動産の数を反映する
        loadNOPData();
        const NOP = numberOfProperties[0];
        const isLand = NOP.getLandCount(true) > 0;
        const isHouse = NOP.getHouseCount(true) > 0;
        const isBldg = NOP.getBldgCount(true) > 0;
        await handleAfterDataLoaded(isLand? Land.section: isHouse? House.section: Bldg.section);
        
        //土地情報を反映する
        if(NOP.getLandCount(true) > 0 && lands[0].inputs[LId.input].value){
            await loadPropertyData("land");
            await handleAfterDataLoaded(isHouse? House.section: isBldg? Bldg.section: Application.section);
        }
        //建物情報を反映する
        if(NOP.getHouseCount(true) > 0 && houses[0].inputs[HId.input].value){
            await loadPropertyData("house");
            await handleAfterDataLoaded(isBldg? Bldg.section: Application.section);
        }
        //区分建物情報を反映する
        if(NOP.getBldgCount(true) > 0 && bldgs[0].inputs[BId.input].value){
            await loadPropertyData("bldg");
            await handleAfterDataLoaded(Application.section);

        }
        //申請情報を反映する
        loadApplicationData();
    }catch(e){
        basicLog("loadData", e, "")
    }

    async function handleAfterDataLoaded(section = null){
        if(okBtn.disabled){
            await scrollToTarget(section);
            return false;
        }

        await handleOkBtnEvent();

        if(section)
            await scrollToTarget(section);

        return true;
    }
}

/**
 * フォームの再配置
 */
function relocateForms(){
    //敷地権のフォームを再配置
    const siteFieldsets = Bldg.section.getElementsByClassName("siteFieldset");
    const bldgFieldsets = Bldg.section.getElementsByClassName("bldgFieldset");
    //区分建物に対してループ処理
    for(let i = 0, len1 = bldgFieldsets.length; i < len1; i++){
        const bldgFieldset = bldgFieldsets[i];
        const bldgId = bldgFieldset.querySelector('[name*="bldg_id"]').value;
        const siteWrapper = bldgFieldset.nextElementSibling;
        //敷地に対してループ処理
        for(let j = 0, len2 = siteFieldsets.length; j < len2; j++){
            const siteFieldset = siteFieldsets[j];
            const siteBldgId = siteFieldset.querySelector('[name*="bldg"]').value;
            const targetDiv = getLastElFromArray(bldgFieldset.nextElementSibling.querySelectorAll("div"));
            //bldgのidが一致するとき
            if(bldgId === siteBldgId){
                //そのbldgのfieldsetの次の要素（siteWrapper）の子要素の最後にsiteFieldsetを配置する
                siteWrapper.insertBefore(siteFieldset, targetDiv);
            }
        }
    }
}

/**
 * 登記簿上の氏名住所のフィールドセットの設定
 * ・最初のフォームのみに対する設定
 */
async function setRegistryNameAndAddressFieldset(){
    //入力欄にイベントを設定
    await setRegistryNameAndAddressEvent(0);
    //追加ボタンのクリックイベント
    RegistryNameAndAddress.addBtn.addEventListener("click", handleAddRegistryAddressButtonEvent);
    //削除ボタンのクリックイベント
    RegistryNameAndAddress.removeBtn.addEventListener("click", handleRemoveRegistryAddressButton);
}

/**
 * 初期表示時の処理
 * 
 */
async function initialize(){
    //サイドバーを更新
    updateSideBar();
    //フォームを再配置する
    relocateForms();
    //入力状況に合わせた表示にする
    await loadData();
    //被相続人のinputにイベントを設定
    setDecedentEvent();
    //登記簿上の氏名住所の設定
    await setRegistryNameAndAddressFieldset();
    //全input要素にenterを押したことによるPOSTが実行されないようにする
    disableEnterKeyForInputs();
    //最初は被相続人の氏名にフォーカスする
    decedent.inputs[DName].focus();
}

/**
 * 日付要素を更新する
 * ・最初の選択肢に---------を追加する
 * @param {HTMLSelectElement} select 
 * @param {number} days
 */
function updateDate(select, days){
    const selectedValue = select.value;
    select.options.length = 0;
    select.appendChild(createOption("", "---------"));

    let valueExist = false;

    for (let i = 1; i <= days; i++) {
      const option = createOption(String(i), String(i));

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
 * @param {string} deathYear 
 * @param {string} deathMonth 
 * @param {string} deathDate 
 * @param {string} birthYear 
 * @param {string} birthMonth 
 * @param {string} birthDate 
 * @returns {boolean} 死亡年月日が生年月日以後である場合にtrue、そうでなければfalse
 */
function checkBirthAndDeathDate(deathYear, deathMonth, deathDate, birthYear, birthMonth, birthDate){
    //死亡年が入力されているとき
    if(deathYear){
        // JavaScriptのDate月は0から始まるため、1を引く
        const birth = new Date(birthYear, birthMonth - 1, birthDate);
        const death = new Date(deathYear, deathMonth - 1, deathDate);
    
        // 死亡日が生年月日以後かどうかを比較
        return death >= birth;
    }
}

/**
 * 年齢を取得する
 * ・ユーザーが使用しているタイムゾーンに依存する
 * @param {*} year 
 * @param {*} month 
 * @param {*} date 
 * @returns 
 */
function getAge(year, month, date){
    let today = new Date();
    let birthDate = new Date(year, month - 1, date);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * 生年月日チェック
 * ・ステップ１で成人確認に回答があったデータに基づいて入力チェック
 * @param {SpouseOrAscendant|DescendantOrCollateral} instance 
 */
function isMatchBirthdateWithIsAdult(instance){

    //配偶者、尊属又は卑属、兄弟姉妹で成人か不明なときはチェック不要
    const inputs = instance.inputs;
    const isTarget = instance instanceof DescendantOrCollateral && inputs[DOCIsAdult].value !== "";
    if(!isTarget)
        return;

    const year = inputs[SOABirthYear].value.substring(0, 4);
    const month = inputs[SOABirthMonth].value;
    const date = inputs[SOABirthDate].value;
    const age = getAge(year, month, date);
    const isDataAdult = inputs[DOCIsAdult].value === "true"? true: false; // データ上の成人フラグ

    // 成人についてのデータ整合チェック
    if(isDataAdult){
        if(age < 18){
            return "１．基本データ入力では成人と入力されてます。<br>未成年が正しい場合、本システムでは対応できないためお問い合わせをお願いします。";
        }
    }else{
        if(age >= 18)
            return "１．基本データ入力では未成年と入力されてます。<br>成人が正しい場合、必要書類が変わることがあるため、先に１．の入力を修正して必要書類を再確認してください。";
    }
}

/**
 * 日付が今日以前か判別する
 * @param {string} year 
 * @param {string} month 
 * @param {string} date 
 */
function isPastDate(year, month, date){
    // JavaScriptのDateオブジェクトは月を0から数えるため、monthから1を引く
    var specifiedDate = new Date(year, month - 1, date);
    // 今日の日付のDateオブジェクトを作成し、時刻は0時0分0秒に設定
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // 指定された日付が今日より前かどうかを判別
    return specifiedDate < today;
}

/**
 * 年月日のバリデーション
 * ・年月に応じた日付の更新
 * ・死亡日が今日以前かチェック
 * ・死亡日が生年月日より後であることをチェック
 * @param {Decedent|DescendantOrCollateral|SpouseOrAscendant} instance 
 * @param {boolean} isDeath 
 * @returns エラーメッセージ
 */
function commonDateValidation(instance, isDeath){
    const inputs = instance.inputs;
    const {deathYear: DYIdx, deathMonth:DMIdx, deathDate:DDIdx, birthYear:BYIdx, birthMonth:BMIdx, birthDate:BDIdx} = 
        instance instanceof Decedent? Decedent.idxs: 
        instance instanceof DescendantOrCollateral? DescendantOrCollateral.idxs:
        SpouseOrAscendant.idxs;
    const deathYear = inputs[DYIdx].value.slice(0,4);
    const deathMonth = inputs[DMIdx].value;
    const deathDate = inputs[DDIdx].value;
    const birthYear = inputs[BYIdx].value.slice(0,4);
    const birthMonth = inputs[BMIdx].value;
    const birthDate = inputs[BDIdx].value;
    
    return isDeath? validation(deathYear, deathMonth, deathDate): validation(birthYear, birthMonth, birthDate);

    function validation(year, month, date){

        const days = getDaysInMonth(year, month);

        if(days)
            updateDate(inputs[DDIdx], days);

        if(isPastDate(year, month, date) === false)
            return "今日以前の日付にしてください";     

        if(checkBirthAndDeathDate(deathYear, deathMonth, deathDate, birthYear, birthMonth, birthDate) === false)
            return "死亡年月日は生年月日より後の日付にしてください";
    }
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {number} idx チェック対象の要素
 */
function decedentValidation(idx){
    //建物名・号室はバリデーションなし
    if(idx === DBldg)
        return true;

    const input = decedent.inputs[idx];
    //建物名・号室以外すべてに対して空欄チェック
    let result = isBlank(input);
    if(typeof result === "string")
        return result;

    //氏名のときは全角チェック
    if(idx === DName){
        result = isOnlyZenkaku(input);
    }else if([DDeathYear, DDeathMonth, DDeathDate].includes(idx)){
        //死亡年月日欄のとき
        result = commonDateValidation(decedent, true);
    }else if([DBirthYear, DBirthMonth, DBirthDate].includes(idx)){
        //生年月日欄のとき
        result = commonDateValidation(decedent, false);
    }

    //エラーのとき、エラーメッセージを返す
    if(typeof result === "string")
        return result;
    return true;
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {number} idx 要素のインデックス
 * @param {elemet} el チェック対象の要素
 */
function registryNameAndAddressValidation(idx, el){
    //建物名・号室はチェック不要
    if(idx === RBldg)
        return true;

    //氏名のときは全角チェック
    if(idx === RName){
        return isOnlyZenkaku(el);
    }else if([RPrefecture, RCity].includes(idx)){
        //都道府県又は市区町村のとき、空欄チェック
        return isBlank(el);
    }
    //空欄チェック
    const blankCheck = isBlank(el);
    return blankCheck !== false ? blankCheck: true;
}

/**
 * エラー配列に対象のエラー要素を追加してボタンの無効化処理を行う
 * @param {Fieldset} instance 対象のインスタンス
 * @param {HTMLElement} el 対象のエラー要素
 */
function pushInvalidEl(instance, el){
    //エラー配列に対象のエラー要素がないとき
    if(!instance.noInputs.some(x => x.id === el.id)){
        //エラー要素に追加
        instance.noInputs.push(el);

        //次の項目へボタンを無効化
        okBtn.disabled = true;

        //相続人情報のとき、次の相続人へボタンも無効化する
        const isHeirsType = isClassMatched(instance, [SpouseOrAscendant, DescendantOrCollateral]);
        const isPropertyType = isClassMatched(instance, [Land, House, Bldg, Site, TempAcquirer]);
        if(isHeirsType){
            //次の相続人へを無効化
            SpouseOrAscendant.okBtn.disabled = true;
        }else if(isPropertyType){
            //不動産関連のとき
            const prefix = "belongsTo" in instance? getPropertyPrefix(instance.belongsTo): getPropertyPrefix(instance);
            const propertyOkBtn = prefix === "land"? landOkBtn: (prefix === "house"? houseOkBtn: bldgOkBtn);
            //次の不動産へボタンを無効化
            propertyOkBtn.disabled = true;
            //仮フォームのとき、仮フォームの追加ボタンも無効化する
            if(instance instanceof TempAcquirer){
                instance.fieldset.parentElement.getElementsByClassName("btn")[1].disabled = true;
            }else if(instance instanceof Site){
                //敷地のとき、敷地の追加ボタンも無効化する
                instance.fieldset.parentElement.getElementsByClassName("addSiteBtn")[0].disabled = true;
            }
        }else if(instance instanceof Application){
            //申請情報のとき、４．へボタンも無効化する
            document.getElementById("submitBtn").disabled = true;
        }
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
        //建物名、地番の枝番以外の要素のとき（建物名、枝番はバリデーションはあるが、エラー要素には追加しない）
        const optionalInputs = ["-bldg", "land_number_bottom", "house_number_bottom"];
        if(!optionalInputs.includes(el.id))
            pushInvalidEl(instance, el);

        el.value = "";
    }
}

/**
 * 被相続人欄にイベントを設定する
 */
function setDecedentEvent(){
    const inputs = decedent.inputs;
    //被相続人欄のinputにイベントを設定
    for(let i = 0, len = inputs.length; i < len; i++){
        if(i === DUser)
            break;
        //氏名欄のとき
        if(i === DName){
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
        }else if([DAddress, DBldg].includes(i)){
            //住所の町域・番地又は住所の建物名のとき
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, inputs[i + 1]);
            })
        }else if(i === DDomicileAddress){
            //本籍の町域・番地のとき
            //キーダウンイベント
            inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, registryNameAndAddresses[0].inputs[RName]);
            })
        }

        //全入力欄にchangeイベントを設定する
        inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = decedentValidation(i);
            //チェック結果に応じて処理を分岐
            afterValidation(isValid, decedent.errMsgEls[i], isValid, el, decedent);
            //建物名のエラーメッセージを非表示にする
            if(i !== DBldg)
                decedent.errMsgEls[DBldg].style.display = "none";
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if([DPrefecture, DDomicilePrefecture].includes(i)){
                const val = el.value;
                await getCityData(val, inputs[i + 1], decedent);
            }
        })
    }
}

/**
 * 登記簿上の氏名と住所を追加ボタンの操作
 * @param {RegistryNameAndAddress} instance 
 */
function toggleRegistryNameAndAddressAddBtn(instance){
    const isOverLimit = registryNameAndAddresses.length > 9;
    const isInstanceVerified = instance.noInputs.length === 0;
    RegistryNameAndAddress.addBtn.disabled = isOverLimit? true: (isInstanceVerified? false: true);
}

/**
 * 登記簿上の氏名住所にイベントを設定する
 * @param {number} startIdx イベント設定を開始するインスタンスのインデックス
 */
async function setRegistryNameAndAddressEvent(startIdx){
    for(let i = startIdx, len = registryNameAndAddresses.length; i < len; i++){
        const instance = registryNameAndAddresses[i];
        const inputs = instance.inputs;
        for(let j = 0, len = inputs.length; j < len; j++){
            const input = inputs[j];
            //被相続人以降はイベント不要
            if(j === RDecedent)
                break;
            //氏名
            if(j === RName){
                //keydownイベント
                input.addEventListener("keydown",(e)=>{
                    //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                    setEnterKeyFocusNext(e, inputs[j + 1]);
                    //半角で数字入力を無効化
                    disableNumKey(e);
                })
    
                //inputイベント
                input.addEventListener("input", (e)=>{
                    //全角かつ日本語のみチェック
                    handleFullWidthInput(instance, input);
                    toggleRegistryNameAndAddressAddBtn(instance);
                    okBtn.disabled = decedents.concat(registryNameAndAddresses).some(x => x.noInputs.length !== 0);
                })
            }
            //町域・番地
            if(j === RAddress){
                //キーダウンイベント
                input.addEventListener("keydown",(e)=>{
                    //enterで建物名・号室にフォーカス移動する
                    setEnterKeyFocusNext(e, inputs[j + 1]);
                })            
            }
            //hiddenInput以外の欄にchangeイベントを設定する
            input.addEventListener("change", async (e)=>{
                //入力値のチェック結果を取得
                const el = e.target;
                isValid = registryNameAndAddressValidation(j, el);
                //チェック結果に応じて処理を分岐
                afterValidation(isValid, instance.errMsgEls[j], isValid, el, instance);
                //建物名のエラーメッセージを非表示にする
                if(j !== RBldg){
                    instance.errMsgEls[RBldg].style.display = "none";
                }
                //住所又は本籍地のの都道府県のとき、市町村データを取得する
                if(j === RPrefecture){
                    await getCityData(el.value, inputs[j + 1], instance);
                }
                toggleRegistryNameAndAddressAddBtn(instance);
            })
        }
    }
}

/**
 * 登記簿上の氏名住所の追加ボタンのイベント設定処理
 */
function handleAddRegistryAddressButtonEvent(){
    //最後の登記上の氏名住所欄をコピーする
    const count = registryNameAndAddresses.length;
    document.getElementById("id_registry_name_and_address-TOTAL_FORMS").value = String(count + 1);
    const copyFrom = getLastElFromArray(registryNameAndAddresses).fieldset;
    const clone = copyFrom.cloneNode(true);
    //コピー元のフィールドの建物名のエラー表示を非表示にする
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RBldg].style.display = "none";
    //属性を更新する
    clone.querySelector("div").textContent = `（${hankakuToZenkaku(registryNameAndAddresses.length + 1)}）`
    const regex = /(registry_name_and_address-)\d+/;
    const att = "[id],[name],[for],span.cityEmPosition";
    updateAttribute(clone, att, regex, count);    
    //最後の要素の後にペーストする
    slideDownAndScroll(copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling));
    //コピー元を無効化する
    copyFrom.disabled = true;
    //インスタンスを生成してdecedent以外を初期化
    const newInstance = new RegistryNameAndAddress(clone.id);
    for(let i = 0, len = newInstance.inputs.length; i < len; i++){
        if(i !== RDecedent)
            newInstance.inputs[i].value = "";
        if(i === RCity)
            newInstance.inputs[i].disabled = true;
    }
    //生成した要素にイベントを設定
    setRegistryNameAndAddressEvent(registryNameAndAddresses.length - 1);
    //削除ボタンを有効化する
    RegistryNameAndAddress.removeBtn.disabled = false;
    //追加ボタンを無効化する
    RegistryNameAndAddress.addBtn.disabled = true;
    //次の項目へボタンを無効化する
    okBtn.disabled = true;
}

/**
 * 増減するフォームの削除ボタンに対する処理を設定する処理
 */
function handleRemoveRegistryAddressButton(){
    //最後の要素を削除する
    const fieldsets = document.getElementsByClassName("registryNameAndAddressFieldset");
    getLastElFromArray(fieldsets).remove();
    registryNameAndAddresses.pop();
    document.getElementById("id_registry_name_and_address-TOTAL_FORMS").value = String(registryNameAndAddresses.length);
    getLastElFromArray(fieldsets).disabled = false;
    RegistryNameAndAddress.addBtn.disabled = false;
    //要素が１つになるとき、削除ボタンを無効化する
    if(fieldsets.length === 1)
        RegistryNameAndAddress.removeBtn.disabled = true;
    //次の項目へボタンの有効化判別処理
    isActivateOkBtn(getLastElFromArray(registryNameAndAddresses));
}

/**
 * 未成年のとき、アラートを表示する
 * @param {SpouseOrAscendant} instance
 */
function alertIfMinor(instance){
    const inputs = instance.inputs;
    const year = inputs[SOABirthYear].value.substring(0, 4);
    const month = inputs[SOABirthMonth].value;
    const date = inputs[SOABirthDate].value;

    if(getAge(year, month, date) < 18)
        alert("確認\n現在未成年ですが間違いないでしょうか？");
}

/**
 * 相続人の生年月日チェック
 * @param {SpouseOrAscendant|DescendantOrCollateral} instance 
 */
function handleHeirsBirthDateValidation(instance){

    let result = true;
    result = commonDateValidation(instance, false);

    if(typeof result === "string")
        return result;

    result = isMatchBirthdateWithIsAdult(instance);
    if(typeof result === "string")
        return result;

    //配偶者又は尊属のとき、未成年の場合アラート表示する
    if(instance instanceof SpouseOrAscendant)
        alertIfMinor(instance);

    return result;
}

/**
 * 相続人情報のバリデーション
 * バリデーションで使用する各続柄のインデックスは建物名・号室まで同じ（卑属と傍系は追加でotherParentsNameがあるだけ）
 * @param {number} idx
 * @param {Fieldset} instance
 */
function heirsValidation(idx, instance){
    const inputs = instance.inputs;
    const input = inputs[idx];
    let result;
    //氏名又は前配偶者・異父母の氏名のとき、全角チェックの結果を返す
    if([SOAName, DOCOtherParentsName].includes(idx)){
        return isOnlyZenkaku(input);
    }else if([SOADeathYear, SOADeathMonth, SOADeathDate].includes(idx)){
        //死亡年月欄のとき
        result = commonDateValidation(instance, true);
    }else if([SOABirthYear, SOABirthMonth, SOABirthDate].includes(idx)){
        //生年月欄のとき
        result = handleHeirsBirthDateValidation(instance);
    }else if(idx === SOAIsAcquire[yes]){
        //不動産取得が「はい」のとき
        //不動産を取得する人がいない旨のエラーメッセージを非表示にする
        document.getElementById("statusArea").getElementsByClassName("errorMessage")[0].style.display = "none";
        //住所入力欄を表示して、住所欄をエラー要素に追加してtrueを返す
        slideDownAndScroll(instance.fieldset.getElementsByClassName("heirsAddressDiv")[0]);
        if(inputs[SOAPrefecture].parentElement.style.display === "none")
            instance.noInputs = instance.noInputs.concat([inputs[SOAAddress], inputs[SOABldg]]);
        else
            instance.noInputs = instance.noInputs.concat([inputs[SOAPrefecture], inputs[SOACity], inputs[SOAAddress]])
        return true;
    }else if(idx === SOAIsAcquire[no]){
        //不動産取得が「いいえ」のとき、住所欄を非表示・初期化にして、住所欄をエラー要素から削除してtrueを返す
        slideUp(instance.fieldset.getElementsByClassName("heirsAddressDiv")[0]);
        const addressInputs = [inputs[SOAPrefecture], inputs[SOACity], inputs[SOAAddress], inputs[SOABldg]];
        addressInputs.forEach(x => instance.noInputs = instance.noInputs.filter(item => item !== x));
        addressInputs.forEach(x => x.value = "");
        instance.inputs[SOACity].disabled = true;
        return true;
    }

    if(typeof result === "string")
        return result;
    //空欄チェック
    const blankCheck = isBlank(input);
    return blankCheck !== false ? blankCheck: true;
}

/**
 * 相続人共通のイベントを設定
 * @param {Fieldset} instance //相続人のインスタンス
 */
function setHeirsEvent(instance){

    const {inputs, fieldset, errMsgEls} = instance;
    //インスタンスのinputにイベントを設定
    for(let i = 0, len = inputs.length; i < len; i++){

        const input = inputs[i];

        //hiddenInputはイベント設定不要
        if((instance instanceof SpouseOrAscendant && i === SOAIsRefuse) ||
        (instance instanceof DescendantOrCollateral && i === DOCIsRefuse))
            return;

        //氏名欄又は前配偶者又は異父母の氏名欄のとき
        if([SOAName, DOCOtherParentsName].includes(i)){

            //keydownイベントを設定
            input.addEventListener("keydown",(e)=>{

                //enterキーのイベント
                if(i === SOAName){
                    if(fieldset.getElementsByClassName("heirsDeathDateDiv")[0].style.display === "none")
                        setEnterKeyFocusNext(e, inputs[i + 4]);
                    else
                        setEnterKeyFocusNext(e, inputs[i + 1]);
                }

                //数字を無効化
                disableNumKey(e);
            })

            //inputイベントを設定
            input.addEventListener("input", ()=>{
                //入力文字によって
                handleFullWidthInput(instance, input);
            })

        }else if(i === SOAAddress || i === SOABldg){
            //住所の町域・番地又は住所の建物名のとき

            //keydownを設定
            input.addEventListener("keydown",(e)=>{
                //enterキーイベント
                setEnterKeyFocusNext(e, inputs[i + 1]);
            })
        }

        //全入力欄にchangeイベントを設定する
        input.addEventListener("change", async (e)=>{

            //入力値のチェック結果を取得して各要素別のイベント設定又はバリデーションを行う
            const el = e.target;
            isValid = heirsValidation(i, instance);

            //不動産取得のラジオボタンのとき
            if(i === SOAIsAcquire[yes] || i === SOAIsAcquire[no]){
                //エラー要素から削除
                instance.noInputs = instance.noInputs.filter(x => x.id !== inputs[SOAIsAcquire[yes]].id && x.id !== inputs[SOAIsAcquire[no]].id);
                //エラー要素がない、かつ、最後の相続人のとき次の項目へボタンを有効化する、次の人へボタンを無効化する
                if(instance.noInputs.length === 0 && getLastElFromArray(heirs) === instance){
                    okBtn.disabled = false;
                }else if(instance.noInputs.length === 0){
                    SpouseOrAscendant.okBtn.disabled = false;
                }else{
                    SpouseOrAscendant.okBtn.disabled = true;
                    okBtn.disabled = true;
                }
            }else{
                //チェック結果に応じて処理を分岐
                afterValidation(isValid, errMsgEls[i], isValid, el, instance);
                //建物名のエラーメッセージを非表示にする
                if(i !== SOABldg)
                    //建物名のエラーメッセージを非表示にする
                    errMsgEls[SOABldg].style.display = "none";
                if(i === SOAPrefecture){
                    //住所の都道府県のとき、市町村データを取得する
                    const val = el.value;
                    await getCityData(val, inputs[i + 1], instance);
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
                SpouseOrAscendant.correctBtn.disabled = true;
            //前の人を修正するボタンが無効化されているときは、有効化する
            SpouseOrAscendant.okBtn.disabled = false;
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
                SpouseOrAscendant.okBtn.disabled = true;
                okBtn.disabled = heirs[i].noInputs.length === 0 ? false: true;
            }else{
                //表示する人のnoInputsの要素数が0のときは次の人へ進むボタンを有効化する
                SpouseOrAscendant.okBtn.disabled = heirs[i].noInputs.length === 0 ? false: true;
            }

            //前の人を修正するボタンが無効化されているときは、有効化する
            SpouseOrAscendant.correctBtn.disabled = false;

            break;
        }
    }
}

/**
 * 不動産のセクションに戻るとき処理
 * @param {Land|House} instances 
 */
function handleCorrectPropertyProcess(instances){
    const prefix = getPropertyPrefix(instances[0]);
    const section = getPropertySectionFromPrefix(prefix);
    if(instances.length > 0)
        disableEveryEls("fieldset", section);
    enableAndDisplayTargetPropertyWrapper(instances);
    scrollToTarget(getLastElFromArray(instances).fieldset);
}

/**
 * 一つ前のセクションに戻る
 */
function handleCorrectBtnEvent(){
    //全セクションタグを取得して最後の要素からループ処理
    for (let i = sections.length - 1; i >= 0; i--) {
        //表示されているとき
        const section = sections[i];
        const isDisplayedSection = window.getComputedStyle(section).display !== 'none';
        if(isDisplayedSection){
            //表示されている最後のセクションをスライドアップする
            slideUp(section);
            //使用された直前のセクションを取得する
            let preSection;
            const changeableSections = ["application-section", "house-section", "bldg-section"];
            if(changeableSections.includes(section.id)){
                if(numberOfProperties.length <= 0)
                    throw new Error("handleCorrectBtnEvent：不動産の数が入力されてません");
                const NOP = numberOfProperties[0];
                const isLand = NOP.getLandCount(true) > 0
                const isHouse = NOP.getHouseCount(true) > 0
                const isBldg = NOP.getBldgCount(true) > 0

                switch (section.id){
                    case "application-section":
                        preSection = isBldg? sections[i - 1]: (isHouse? sections[i - 2]: sections[i - 3]);
                    break;
                case "house-section":
                    preSection = isLand? sections[i - 1]: sections[i - 2];
                    break;
                case "bldg-section":
                    preSection = isHouse? sections[i - 1]: (isLand? sections[i - 2]: sections[i - 3]);
                    break;
                default:
                    break;
                }
            }else{
                preSection = sections[i - 1];
            }   
            const fieldsets = Array.from(preSection.getElementsByTagName("fieldset"));
            fieldsets.forEach(x => x.disabled = false);
            okBtn.disabled = false;
            document.getElementById("submitBtn").disabled = true;
            const preSectionNumbering = preSection.querySelector("h5").textContent.trim().substring(0, 1);
            statusText.textContent = `現在${preSectionNumbering}／５項目`;
            //被相続人情報に戻るとき、不動産取得者がいない旨のエラーメッセージを非表示にする、前の項目を修正するボタンを無効化する
            if(preSection.id === "decedent-section"){  
                okBtn.nextElementSibling.style.display = "none";
                correctBtn.disabled = true;
                RegistryNameAndAddress.addBtn.disabled = false;
            }else if(preSection.id === "heirs-section" && heirs.length > 1){
                //相続人情報に戻るとき、かつ相続人（故人を含む）が複数人いるとき
                SpouseOrAscendant.correctBtn.disabled = false;
                const lastInstance = getLastElFromArray(heirs);
                heirs.forEach(x =>{
                    if(x != lastInstance){
                        x.fieldset.disabled = true;
                    }
                })
                scrollToTarget(lastInstance.fieldset);
                break;
            }else if(preSection.id === "land-section"){
                //土地情報、最後の要素にスクロールする
                handleCorrectPropertyProcess(lands);
                break;
            }else if(preSection.id === "house-section"){
                //建物情報に戻るとき
                handleCorrectPropertyProcess(houses);
                break;
            }else if(preSection.id === "bldg-section"){
                //区分建物情報に戻るとき
                handleCorrectPropertyProcess(bldgs);
                break;
            }
            scrollToTarget(preSection);
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
    const fieldsets = Array.from(preSection.querySelectorAll("fieldset"));
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

    // ソートした子の相続人を最後の子のフィールドセットの後ろに配置する
    const startingPoint = document.getElementById('id_child_spouse-TOTAL_FORMS');
    combined.forEach(x => {
        section.insertBefore(x.element, startingPoint);
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
    const section = SpouseOrAscendant.section;
    //エラーメッセージを非表示にする
    decedent.errMsgEls[DBldg].style.display = "none";
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RBldg].style.display = "none";
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
    errEl.innerHTML = "不動産を取得する人がいません。<br>不動産を取得する人を１人以上選択してください。"
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
    const isPropertyAcquirerFree = inputs[propertyAllocationInputIdxs[no]].checked;
    const propertyAllocationQ = Qs[propertyAllocationFormIdx];
    const propertyAllocationInputYes = inputs[propertyAllocationInputIdxs[yes]];
    const cashAllocationInputYes = inputs[cashAllocationInputIdxs[yes]];
    const contentType2Input = inputs[TODContentType2.input];
    const objectId2Input = inputs[TODObjectId2.input];
    //遺産分割の方法のとき
    if(typeOfDivisionInputIdxs.includes(i)){
        const isPropertyAllocationDecided = (typeOfDivisions[0].isPropertyAcquirerAlone() || isPropertyAcquirerFree);
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
        const instance = typeOfDivisions[0];
        const {inputs, Qs} = instance;
        const wasAlone = inputs[TODContentType1.input].value !== "";
        const wasNotAcquirers = inputs[TODPropertyAllocation.input[no]].checked;
        let oldPattern = wasAlone ? yes: (wasNotAcquirers ? no: (instance.isPropertyLegalInheritance() ? other: other2));
        //不動産取得者の数に変更があるとき
        if(newPattern !== oldPattern){
            //インスタンスの初期化処理
            //質問欄の表示を遺産分割の方法のみにする
            Qs.forEach(x => {
                if(x !== Qs[TODTypeOfDivision.form])
                    x.style.display = "none";
            })
            //inputとselectの初期化
            for(let i = 0, len = inputs.length; i < len; i++){
                if(i === TODDecedent.input)
                    break;
                const input = inputs[i];
                if(input.type === "radio")
                    input.checked = false;
                else
                    input.value = "";
            }
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
 * @param {HTMLElement} minusBtn  減産ボタン
 * @param {number} val 増減後の値
 * @param {number} min 設定する最小値
 * @param {number} max 設定する最大値
 */
function toggleCountBtn(plusBtn, minusBtn, val, min, max){
    minusBtn.disabled = val > min ? false: true;
    plusBtn.disabled = val >= max ? true: false;
}

/**
 * 数字入力欄のキーダウンイベント
 * @param {Event} e キーダウンイベント
 */
function handleNumInputKeyDown(e){
    if(!/\d|Backspace|Delete|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight/.test(e.key)){
        //数字、バックスペース、デリート、矢印以外は使用不可
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
            if(i === NOPDecedent)
                break;
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
    scrollToTarget(numberOfProperties[0].fieldset);
}

/**
 * 不動産インスタンスをよく使用する変数に分解する
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
        TAWrapper: instance.tempAcquirers[0].fieldset.parentElement,
        TCAs: instance.tempCashAcquirers,
        TCAWrapper: instance.tempCashAcquirers[0].fieldset.parentElement,
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
 * @param {Land|House|Bldg} instances 
 * @param {HTMLElement} input 
 */
function propertyNumberValidation(instances, input){
    let result = isBlank(input);
    if(result !== false)
        return result;
    if(!isNumber(input.value, input))
        return "数字で入力してください";
    result = isDigit(input, "propertyNumber");
    if(typeof result === "string"){
        input.value = "";
        return result;
    }
    result = isDuplicateInput(instances, LNumber.input);
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
 * １００％以下か判別する
 * @param {string} bottomVal 
 * @param {string} topVal 
 * @returns 
 */
function isBelowHundredPercent(bottomVal, topVal){
    if(bottomVal !== "" && topVal !== ""){
        const bottom = parseInt(ZenkakuToHankaku(bottomVal));
        const top = parseInt(ZenkakuToHankaku(topVal));
        if(bottom < top)
            return "分子は分母以下の数字にしてください";
    }
    return true;
}

/**
 * 土地建物情報のバリデーション
 * ※※※インデックスは不動産共通のため仮に土地のものを使用している※※※
 * @param {HTMLCollection} inputs 対象のインスタンスの全input要素
 * @param {number} idx チェック対象のinput要素のインデックス
 */
function landHouseValidation(instances, inputs, idx){
    const input = inputs[idx];
    //不動産番号のとき、空欄、整数、１３桁、重複
    if(idx === LNumber.input){
        return propertyNumberValidation(instances, input);
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
        if(isPurpartyInput){
            result = isBelowHundredPercent(inputs[LPurparty.input[no]].value, inputs[LPurparty.input[other]].value)
            if(typeof result === "string"){
                input.value = "";
                return "分子は分母以下の数字にしてください";
            }
        }
    }

    return true;
}

/**
 * 区分建物情報のバリデーション
 * @param {HTMLCollection} inputs 対象のインスタンスの全input要素
 * @param {number} idx チェック対象のinput要素のインデックス
 */
function bldgValidation(inputs, idx){
    const input = inputs[idx];
    //不動産番号のとき、空欄、整数、１３桁、重複
    if(idx === BNumber.input){
        return propertyNumberValidation(bldgs, input);
    }else if([BAddress.input, BOffice.input, BBldgNumber.input].includes(idx)){
        //所在地、家屋番号、法務局のとき、空欄チェック
        const result = isBlank(input);
        return (result !== false) ? result: true;
    }else if([BPurparty.input[no], BPurparty.input[other], BPrice.input].includes(idx)){
        //所有権・持分、評価額のとき、共通：空欄、整数
        let result = isBlank(input);
        if(result !== false)
            return result;
        //評価額のとき、コンマを削除する
        if(idx === BPrice.input)
            input.value = removeCommas(input.value);
        if(!isNumber(input.value, input))
            return "数字のみで入力してください";
        result = validateIntInput(input);
        if(typeof result === "string")
            return result;
        //所有権割合の分子が分母を超えてないかチェック
        const isPurpartyInput = [BPurparty.input[no], BPurparty.input[other]].includes(idx);
        if(isPurpartyInput){
            result = isBelowHundredPercent(inputs[BPurparty.input[no]].value, inputs[BPurparty.input[other]].value);
            if(typeof result === "string"){
                input.value = "";
                return "分子は分母以下の数字にしてください";
            }
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
        if (!response.ok) {
            throw new Error(`サーバーエラー: ${response.status}`);
        }
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
function handleLandHouseKeydownEvent(e, inputs, idx){
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
 * @param {Land|House|Bldg|Site} instance 
 */
function handlePurpartyCbChangeEvent(instance){
    const {inputs, constructor} = instance;
    const idxs = ([Land, House].includes(constructor))? LPurparty.input: 
        (constructor === Bldg? BPurparty.input: SPurparty.input);
    const denominator = inputs[idxs[no]];
    const molecule = inputs[idxs[other]];
    const isOwner = inputs[idxs[yes]].checked;

    isOwner ? purpartyCbWhenChecked(instance, denominator, molecule): purpartyCbWhenUnChecked(instance, denominator, molecule);
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
 * @param {Land|House|Bldg|Site} instance 
 * @param {HTMLElement[]} noInput 
 * @param {HTMLInputElement} otherInput 
 */
function purpartyCbWhenChecked(instance, noInput, otherInput){
    const functionName = "purpartyCbWhenChecked";
    const {noInputs, constructor, errMsgEls} = instance;

    try{
        inputPurparty(instance, noInput, otherInput, true);
        instance.noInputs = noInputs.filter(x => x !== noInput && x !== otherInput);
        isActivateOkBtn(instance);
    
    
        const idx = ([Land, House].includes(constructor))? LPurparty.form: 
            (constructor === Bldg? BPurparty.form: SPurparty.form);
        errMsgEls[idx].style.display = "none";
    }catch(e){
        throw new Error(`${functionName}でエラーが発生\n${e.message}\ninstance=${instance}`);
    }
}

/**
 * チェック又はチェックを外したことによる取得割合欄の入力
 * @param {Land|House|Bldg} instance 
 * @param {HTMLInputElement} noInput 
 * @param {HTMLInputElement} otherInput 
 * @param {boolean} boolean 
 */
function inputPurparty(instance, noInput, otherInput, boolean){
    const val = boolean ? "１": "";
    inputAndToggleDisable(noInput, val, boolean);
    inputAndToggleDisable(otherInput, val, boolean);
    const type = instance.constructor;
    if(type === Site)
        return;
    const hiddenInput = type === Bldg? instance.inputs[BPurparty.input[other2]]: instance.inputs[LPurparty.input[other2]];
    hiddenInput.value = val + "分の" + val;
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
 * 換価するがチェックされたときの処理
 * @param {Land|House|Bldg} instance 
 */
function isExchangeChecked(instance){
    const TCA = instance.tempCashAcquirers[0];
    const TODInputs = typeOfDivisions[0].inputs;
    const aloneHeirContentType = TODInputs[TODContentType2.input].value;
    const isAloneAcquirer = aloneHeirContentType !== "";
    //一人のみが取得するとき
    if(isAloneAcquirer){
        inputTAWhenAcquirerAlone(TCA);
    }else if(typeOfDivisions[0].isCashLegalInheritance()){
        //法定相続のとき
        createLegalInheritanceTAFieldset(true, instance);
    }else{
        //その他のとき金銭取得者の欄を表示してエラー要素を追加する
        slideDown(TCA.fieldset.parentElement);
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
 * 不動産情報欄のイベントを設定する
 * @param {Land|House[]} instances 
 * @param {number} [startIdx=0] イベント設定する開始対象の土地のインデックス
 */
function setLandHouseEvent(instances, startIdx = 0){
    //土地建物は共通のインデックスのため仮に土地のインデックスを使用している
    const numberInputIdx = LNumber.input;
    const addressInputIdx = LAddress.input;
    const landNumberInputIdxs = LLandNumber.input;
    const purpartyInputIdxs = LPurparty.input;
    const officeInputIdx = LOffice.input;
    const priceInputIdx = LPrice.input;
    const isExchangeInputIdxs = LIsExchange.input;

    //各土地インスタンスに対してループ処理
    for(let i = startIdx, len = instances.length; i < len; i++){
        const instance = instances[i];
        const inputs = instance.inputs;
        for(let j = 0, len2 = inputs.length; j < len2; j++){
            //隠しinputとindex以外のとき
            const isDisplayedInputs = ![landNumberInputIdxs[other], purpartyInputIdxs[other2], LIndex.input, LId.input].includes(j);
            if(isDisplayedInputs){
                //キーダウンイベント
                inputs[j].addEventListener("keydown", (e)=>{
                    handleLandHouseKeydownEvent(e, inputs, j);
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
                    const result = landHouseValidation(instances, inputs, inputIdx);
                    afterValidation(result, instance.errMsgEls[formIdx], result, inputs[inputIdx], instance);
                    if(result && inputIdx !== priceInputIdx)
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
                    }else if(inputIdx === priceInputIdx){
                        //評価額のとき、半角にしてコンマを追加して全角に戻す
                        const hankaku = ZenkakuToHankaku(inputs[inputIdx].value);
                        inputs[inputIdx].value = hankakuToZenkaku(addCommas(hankaku));
                    }
                });
            }

            //各入力欄にchangeイベントを設定する
            if(j === numberInputIdx)
                handleChangeEvent(j, LNumber.form);
            else if(j === addressInputIdx)
                handleChangeEvent(j, LAddress.form);
            else if([landNumberInputIdxs[yes], landNumberInputIdxs[no]].includes(j))
                handleChangeEvent(j, LLandNumber.form);
            else if(j === officeInputIdx)
                handleChangeEvent(j, LOffice.form);
            else if([purpartyInputIdxs[yes], purpartyInputIdxs[no], purpartyInputIdxs[other]].includes(j))
                handleChangeEvent(j, LPurparty.form);
            else if(j === priceInputIdx)
                handleChangeEvent(j, LPrice.form);
            else if(isExchangeInputIdxs.includes(j))
                handleChangeEvent(j, LIsExchange.form);  
        }
    }
}

/**
 * 区分建物情報欄のイベントを設定する
 * @param {number} [startIdx=0] イベント設定する開始対象の土地のインデックス
 */
function setBldgEvent(startIdx = 0){
    const numberInputIdx = BNumber.input;
    const addressInputIdx = BAddress.input;
    const bldgNumberInputIdxs = BBldgNumber.input;
    const purpartyInputIdxs = BPurparty.input;
    const officeInputIdx = BOffice.input;
    const priceInputIdx = BPrice.input;
    const isExchangeInputIdxs = BIsExchange.input;

    //各土地インスタンスに対してループ処理
    for(let i = startIdx, len = bldgs.length; i < len; i++){
        const instance = bldgs[i];
        const inputs = instance.inputs;
        for(let j = 0, len2 = inputs.length; j < len2; j++){
            //隠しinputとindex以外のとき
            const isDisplayedInputs = ![purpartyInputIdxs[other2], BIndex.input, BId.input].includes(j);
            if(isDisplayedInputs){
                //キーダウンイベント
                inputs[j].addEventListener("keydown", (e)=>{
                    //隠しinputが次にある要素のときは、+3にして隠しinputを飛ばす
                    const isNextDisplayedInput = j !== purpartyInputIdxs[other];
                    setEnterKeyFocusNext(e, (isNextDisplayedInput ? inputs[j + 1]: inputs[j + 3]));
                    //所在地、所有者CBと換価確認以外の欄は数字のみの入力に制限する
                    const isNumberOnlyInputs = [numberInputIdx, purpartyInputIdxs[no], purpartyInputIdxs[other], priceInputIdx].includes(j);
                    if(isNumberOnlyInputs)
                        handleNumInputKeyDown(e);
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
            const handleChangeEvent = (formIdx) => {
                inputs[j].addEventListener("change", () => {
                    //所有者CBのとき
                    if(j === purpartyInputIdxs[yes]){
                        handlePurpartyCbChangeEvent(instance);
                        return;
                    }else if(isExchangeInputIdxs.includes(j)){
                        //換価確認ラジオボタンのとき
                        handleIsExchangeChangeEvent(j);
                        return;
                    }
                    //所有者CB、換価確認ラジオボタン以外のとき
                    const result = bldgValidation(inputs, j);
                    afterValidation(result, instance.errMsgEls[formIdx], result, inputs[j], instance);
                    if(result && j !== priceInputIdx)
                        inputs[j].value = hankakuToZenkaku(inputs[j].value);

                    //不動産番号のとき
                    if(j === numberInputIdx){
                        //１３桁入力されているとき
                        if(typeof result === "boolean"){
                            const officeCode = ZenkakuToHankaku(inputs[numberInputIdx].value.slice(0, 4));
                            getOfficeData(officeCode, inputs[officeInputIdx], instance)
                        }
                    }else if([purpartyInputIdxs[no], purpartyInputIdxs[other]].includes(j)){
                        //所有権・持分のとき
                        const regex = j === purpartyInputIdxs[no] ? /.*(?=分の)/ : /(?<=分の).*/;
                        inputs[purpartyInputIdxs[other2]].value = inputs[purpartyInputIdxs[other2]].value.replace(regex, "");
                        if(j === purpartyInputIdxs[no])
                            inputs[purpartyInputIdxs[other2]].value = inputs[j].value + inputs[purpartyInputIdxs[other2]].value;
                        else
                            inputs[purpartyInputIdxs[other2]].value += inputs[j].value;
                    }else if(j === priceInputIdx){
                        //評価額のとき、半角にしてコンマを追加して全角に戻す
                        const hankaku = ZenkakuToHankaku(inputs[j].value);
                        inputs[j].value = hankakuToZenkaku(addCommas(hankaku));
                    }
                });
            }

            //各入力欄にchangeイベントを設定する
            if(j === numberInputIdx)
                handleChangeEvent(BNumber.form);
            else if(j === addressInputIdx)
                handleChangeEvent(BAddress.form);
            else if(j === bldgNumberInputIdxs)
                handleChangeEvent(BBldgNumber.form);
            else if(j === officeInputIdx)
                handleChangeEvent(BOffice.form);
            else if([purpartyInputIdxs[yes], purpartyInputIdxs[no], purpartyInputIdxs[other]].includes(j))
                handleChangeEvent(BPurparty.form);
            else if(j === priceInputIdx)
                handleChangeEvent(BPrice.form);
            else if(isExchangeInputIdxs.includes(j))
                handleChangeEvent(BIsExchange.form);  
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
                const grandChildCount = candidates.filter(x => x instanceof DescendantOrCollateral && x.inputs[DOCObjectId1].value === heir.inputs[SOAObjectId].value).length;
                //配偶者の有無と孫の有無で取得割合が変わる
                if(isDecedentSpouse)
                    return returnPercentage(grandChildCount > 0? heirChildCount * 2 * 2: heirChildCount * 2);
                else
                    return returnPercentage(grandChildCount > 0? heirChildCount * 2: heirChildCount);
            }else if(heir.fieldset.id.includes("id_grand_child-")){
                //相続人が孫のとき
                //子の配偶者の有無と同じobjectId1を持つ孫の数を取得する
                const isChildSpouse = candidates.some(x => x instanceof SpouseOrAscendant && x.inputs[SOAObjectId].value === heir.inputs[DOCObjectId1].value);
                const grandChildCount = candidates.filter(x => x instanceof DescendantOrCollateral && x.inputs[DOCObjectId1].value === heir.inputs[DOCObjectId1].value).length;
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
                    if(heir.inputs[SOAObjectId].value === decedentId){
                        return returnPercentage(6);
                    }else{
                        //相続人が祖父母のとき
                        const isGrandSpouse = candidates.some(x => x.fieldset.id.includes("id_ascendant-") &&
                            x.inputs[SOAObjectId].value === heir.inputs[SOAObjectId].value);
                        //相続人の中に別系統の尊属がいるとき
                        if(candidates.some(x => x.inputs[SOAObjectId].value === decedentId || x.inputs[SOAObjectId].value !== heir.inputs[SOAObjectId].value)){
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
                    if(heir.inputs[SOAObjectId].value === decedentId){
                        return returnPercentage(2);
                    }else{
                        //相続人が祖父母のとき
                        const isGrandSpouse = candidates.some(x => x.fieldset.id.includes("id_ascendant-") &&
                            x.inputs[SOAObjectId].value === heir.inputs[SOAObjectId].value);
                        //相続人の中に別系統の尊属がいるとき
                        if(candidates.some(x => x.inputs[SOAObjectId].value === decedentId || x.inputs[SOAObjectId].value !== heir.inputs[SOAObjectId].value)){
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
 * 取得候補者をoptionにしてselectに追加
 * @param {TempAcquirer} tempAcquires 
 * @param {SpouseOrAscendant|DescendantOrCollateral} candidates 
 * @param {boolean} isIni 初期値（value="",text="選択してください"）が必要か
 */
function addAcquirerCandidate(tempAcquires, candidates, isIni = true){
    tempAcquires.forEach(x =>{
        const select = x.inputs[TAAcquirer.input];
        if(isIni)
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
 * １人が不動産又は金銭を全て相続するとき、隠し不動産取得者欄に入力と不動産取得者仮フォームの非表示
 * @param {TempAcquirer} TA 
 */
function inputTAWhenAcquirerAlone(TA){
    const TODInputs = typeOfDivisions[0].inputs;
    const isCash = TA.fieldset.id.includes("cash_acquirer")? true: false;
    const TODContentTypeVal = isCash? TODInputs[TODContentType2.input].value: TODInputs[TODContentType1.input].value;
    const TODObjectIdVal = isCash? TODInputs[TODObjectId2.input].value: TODInputs[TODObjectId1.input].value;
    const idAndContentType = TODObjectIdVal + "_" + TODContentTypeVal;
    inputTA(TA, idAndContentType, "１", "１");    
    TA.noInputs.length = 0;
    TA.fieldset.parentElement.style.display = "none";
}

/**
 * 取得者候補をselectタグのoptionに追加する
 * @param {Land|House} instances lands, housesのいずれか
 */
function getAndAddAcquirerCandidate(instances){
    //不動産を取得するで「はい」がチェックされた人、金銭取得者（相続人全員）を格納する配列
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
    //全てに対して空欄チェック
    const input = inputs[idx];
    let result = isBlank(input);
    if(result !== false)
        return result;
    //取得割合チェック
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
 * 不動産取得者の仮フォームに対するイベント設定
 * @param {Land|House|Bldg[]} instances
 * @param {number} [startIdx=0] イベントを設定を開始する不動産のインデックス
 */
function setPropertyTAsFormEvent(instances, startIdx = 0){
    const type = instances[0].constructor;
    const addBtn = type === Land? addTLABtns[0]: (type === House? addTHABtns[0]: addTBABtns[0]);
    //各不動産に対してループ処理
    for(let i = startIdx, len = instances.length; i < len; i++){
        const instance = instances[i];
        //不動産取得者仮フォーム
        const TA = instance.tempAcquirers[0];
        const TAInputs = TA.inputs;
        //金銭取得者仮フォーム
        const TCA = instance.tempCashAcquirers[0];
        const TCAInputs = TCA.inputs;
        //不動産取得者仮フォームと金銭取得者仮フォームは、同一のフォーム形式のためイベント設定
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
    const type = instances[0].constructor;
    const addTABtns = type === Land? addTLABtns: (type === House? addTHABtns: addTBABtns);
    const addTCABtns = type ===  Land? addTLCABtns: (type ===  House? addTHCABtns: addTBCABtns);
    const removeTABtns = type ===  Land? removeTLABtns: (type ===  House? removeTHABtns: removeTBABtns);
    const removeTCABtns = type ===  Land? removeTLCABtns: (type ===  House? removeTHCABtns: removeTBCABtns);
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
    const type = instances[0].constructor;
    const addTABtns = type ===  Land? addTLABtns: (type ===  House? addTHABtns: addTBABtns);
    const addTCABtns = type ===  Land? addTLCABtns: (type ===  House? addTHCABtns: addTBCABtns);
    const removeTABtns = type ===  Land? removeTLABtns: (type ===  House? removeTHABtns: removeTBABtns);
    const removeTCABtns = type ===  Land? removeTLCABtns: (type ===  House? removeTHCABtns: removeTBCABtns);
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
 * @param {Land|House|Bldg} instance
 * @returns {string} "land", "house", "bldg"
 */
function getPropertyPrefix(instance){
    const type = instance.constructor;
    return type === Land? "land": (type === House? "house": "bldg");
}

/**
 * 次の不動産へ進むボタンにイベント設定
 * @param {Land|House|Bldg} instances 
 */
function setPropertyOkBtnEvent(instances){
    const prefix = getPropertyPrefix(instances[0]);
    const okBtn =  prefix === "land"? landOkBtn: (prefix === "house"? houseOkBtn: bldgOkBtn);
    const wrappers = document.getElementsByClassName(`${prefix}Wrapper`);
    okBtn.addEventListener("click", ()=>{
        //不動産情報をループ処理（最後の要素から参照する）
        for(let i = wrappers.length - 1; 0 <= i; i--){
            //不動産情報が表示されているとき
            const wrapper = wrappers[i];
            if(wrapper.style.display !== "none"){
                //表示されている最後の不動産情報が最後の不動産情報ではないとき
                if(i !== instances.length - 1){
                    //現在の不動産情報を無効化する
                    disableEveryEls("fieldset, button", wrapper);
                    //次の不動産情報を有効化する
                    const nexIdx = i + 1;
                    enablePropertyWrapper(instances, nexIdx);
                    slideDownAndScroll(wrappers[i + 1]);
                    //最初のinput要素にフォーカスする
                    instances[nexIdx].fieldset.querySelector("input").focus();
                    return;
                }else{
                    //最後の土地が表示されているときに押されてしまった場合、何も処理をしない
                    okBtn.disabled = true;
                    throw new Error("setPropertyOkBtnEvent：想定しない操作が行われました");
                }
            }
        }
    })
}

/**
 * 前の不動産を修正するボタンにイベント設定
 * @param {Land|House} instances 
 */
function setPropertyCorrectBtnEvent(instances){
    const prefix = getPropertyPrefix(instances[0])
    const wrappers = document.getElementsByClassName(`${prefix}Wrapper`);
    const correctBtn = prefix === "land"? landCorrectBtn: (prefix === "house"? houseCorrectBtn: bldgCorrectBtn);
    correctBtn.addEventListener("click", ()=>{
        for(let i = wrappers.length - 1; 0 <= i; i--){
            const preWrapper = wrappers[i - 1];
            //１つ目の不動産情報で修正するボタンが有効になってしまっているとき用
            if(i === 0)
                throw new Error("setPropertyCorrectBtnEvent：想定しない操作が行われました");
            //１つ目の不動産情報に戻るとき、修正ボタンを無効化する
            if(i === 1)
                correctBtn.disabled = true;
            const wrapper = wrappers[i];
            //表示されている不動産情報のとき
            if(wrapper.style.display !== "none"){
                //現在表示されている欄を非表示にして前の欄を有効化してスクロールする
                slideUp(wrapper);
                enablePropertyWrapper(instances, i - 1);
                scrollToTarget(preWrapper);
                //次の項目へボタンを無効化する
                okBtn.disabled = true;
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
 * 法定相続用の仮フォームと仮フォームのインスタンスを生成
 * @param {boolean} isCash 
 * @param {Land|House} instance 
 */
function createLegalInheritanceTAFieldset(isCash, instance){
    const candidates = getAllLegalHeirs();
    for(let i = 0, len = candidates.length; i < len; i++){
        const TAs = isCash ? instance.tempCashAcquirers: instance.tempAcquirers;
        if(i > 0){
            const copyFrom = TAs[i - 1].fieldset;
            const att = "[id],[name],[for]";
            const regex = /(acquirer-)\d+/;
            copyAndPasteEl(copyFrom, att, regex, i);  
            const newId = copyFrom.id.replace(regex, `$1${i}`);
            const newTA = new TempAcquirer(newId, instance);
            isCash ? instance.addTempCashAcquirer(newTA): instance.addTempAcquirer(newTA);
        }
        const candidate = candidates[i];
        const idAndContentType = candidate.inputs[candidate.constructor.idxs.idAndContentType].value;
        const purparty = getLegalPercentage(candidates, candidate);
        const parts = purparty.split("分の");
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
 * @param {Land|House|Bldg[]} instances 
 * @param {number} idx 不動産のインデックス
 */
function enablePropertyWrapper(instances, idx){
    const {property, fieldset, TAs, TCAs} = propertyDataToVariable(instances[idx]);
    const prefix = getPropertyPrefix(property);
    const removeTABtns = prefix === "land"? removeTLABtns: (prefix === "house"? removeTHABtns: removeTBABtns);
    const removeTCABtns = prefix === "land"? removeTLCABtns: (prefix === "house"? removeTHCABtns: removeTBCABtns);
    const correctBtn = prefix === "land"? landCorrectBtn: (prefix === "house"? houseCorrectBtn: bldgCorrectBtn);
    fieldset.disabled = false;
    getLastElFromArray(TAs).fieldset.disabled = getLastElFromArray(TAs).inputs[TAAcquirer.input].length === 2? true: false;
    getLastElFromArray(TCAs).fieldset.disabled = getLastElFromArray(TCAs).inputs[TAAcquirer.input].length === 2? true: false;
    removeTABtns[idx].disabled = TAs.length > 1? false: true;
    removeTCABtns[idx].disabled = TCAs.length > 1? false: true;
    //区分建物のとき
    if(prefix === "bldg"){
        //最後の敷地権を有効にする/１つ以上あるとき削除ボタンを有効にする
        getLastElFromArray(instances[idx].sites).fieldset.disabled = false;
        removeSiteBtns[idx].disabled = instances[idx].sites.length > 1? false: true;
    }
    correctBtn.disabled = idx > 0? false: true;
    isActivateOkBtn(property);
}

/**
 * 不動産情報の削除とインスタンスの削除
 * @param {Land|House|Bldg} instances 
 * @param {number} count 対象の不動産の数
 */
function removePropertyWrappers(instances, count){
    const prefix = getPropertyPrefix(instances[0]);
    const section = getPropertySectionFromPrefix(prefix);
    const wrappers = section.getElementsByClassName(`${prefix}Wrapper`);
    for(let i = wrappers.length - 1; count <= i; i--){
        wrappers[i].remove();
        instances.pop()
    }

}

/**
 * 遺産分割方法の変更に合わせて土地情報の表示状態を変更する
 * @param {Land|House} instances 
 * @param {SpouseOrAscendant|DescendantOrCollateral[]} newCandidates
 */
function iniPropertySectionByPropertyAllocationChange(instances, newCandidates){
    const prefix = getPropertyPrefix(instances[0]);
    const removeTABtns = prefix === "land"? removeTLABtns: (prefix === "house"? removeTHABtns: removeTBABtns);
    const removeTCABtns = prefix === "land"? removeTLCABtns: (prefix === "house"? removeTHCABtns: removeTBCABtns);
    const correctBtn = prefix === "land"? landCorrectBtn: (prefix === "house"? houseCorrectBtn: bldgCorrectBtn);
    for(let i = 0, len = instances.length; i < len; i++){
        const {property, fieldset, TAs, TAWrapper, TCAs, propertyWrapper} = propertyDataToVariable(instances[i]);
        //全て有効化
        fieldset.disabled = false;
        resetTA(TAs, newCandidates);
        getLastElFromArray(TCAs).fieldset.disabled = false;
        //不動産取得者仮フォーム全てを表示状態にする
        TAWrapper.style.display = "block";
        //２つ目以降の土地情報ラッパーは非表示
        if(i === 0){
            propertyWrapper.style.display = "";
            removeTABtns[i].disabled = TAs.length > 1? false: true;
            removeTCABtns[i].disabled = TCAs.length > 1? false: true;
            correctBtn.disabled = true;
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
 * 不動産をを単独で取得するときの処理
 * @param {Land|House[]} instances 
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
 * 不動産フォームを追加するときで不動産が法定相続のときのインスタンス追加処理
 * @param {Land|House} instance 
 * @param {number} instanceIdx 
 */
function addPropertyTAInstanceByLegalInheritance(instance, instanceIdx){
    //不動産が法定相続のとき、仮取得者インスタンスを(不動産取得者 - 1)追加する
    const count = getAllLegalHeirs().length;
    const prefix = getPropertyPrefix(instance);
    for(let i = 1; i < count; i++){
        instance.addTempAcquirer(new TempAcquirer(`id_${prefix}_${instanceIdx}_temp_${prefix}_acquirer-${i}-fieldset`, instance));
    }
}

/**
 * 
 * @param {TempAcquirer[]} sourceTAs 
 * @param {TempAcquirer[]} targetTAs 
 */
function copyAcquirerValues(sourceTAs, targetTAs) {
    sourceTAs.forEach((x, index) => {
        const val = x.inputs[TAAcquirer.input].value;
        targetTAs[index].inputs[TAAcquirer.input].value = val;
    });
}

/**
 * 不動産の数の増加によるフォーム類の追加処理
 * @param {Land|House|Bldg[]} instances 
 * @param {number} index 
 */
function addPropertyFormNotFirstTime(instances, index){
    //最後の不動産情報をコピーする
    const TODInputs = typeOfDivisions[0].inputs;
    const TODPropertyAllocationInputIdxs = TODPropertyAllocation.input;
    const isFreeDivision = TODInputs[TODPropertyAllocationInputIdxs[no]].checked;
    const prefix = getPropertyPrefix(instances[0]);
    clonePropertyFieldset(prefix, index, isFreeDivision);
    //インスタンスを生成
    const newInstance = createNewPropertyInstance(prefix, index);
    //不動産が法定相続のとき、仮取得者インスタンスを(不動産取得者 - 1)追加する
    if(typeOfDivisions[0].isPropertyLegalInheritance()){
        addPropertyTAInstanceByLegalInheritance(newInstance, index);
    }
    //不動産情報と金銭取得者の仮フォームの値を初期化する
    const newInstanceInputs = newInstance.inputs;
    const decedentInputIdx = prefix === "bldg"? BDecedent.input: LDecedent;
    for(let i = 0, len = newInstanceInputs.length; i < len; i++){
        if(i === decedentInputIdx)
            continue;
        iniInputsAndSelectValue(newInstanceInputs[i]);
    }
    newInstance.tempCashAcquirers.forEach(x => iniInputsAndSelectValue(x.inputs));
    //不動産取得がその他のとき、仮フォームの値を初期化する
    if(isFreeDivision){
        newInstance.tempAcquirers.forEach(x => iniInputsAndSelectValue(x.inputs))
    }else{
        //不動産の取得が法定相続又は単独のとき、select要素に値を代入する（複製するときになぜか値が初期化される）
        const lastIndex = instances.length - 1; // 最後のインデックス
        const preLastIndex = lastIndex - 1; // 最後から2番目のインデックス
        const sourceTAs = instances[preLastIndex].tempAcquirers;
        const targetTAs = instances[lastIndex].tempAcquirers;
        copyAcquirerValues(sourceTAs, targetTAs);
        //エラー要素を削除する
        newInstance.tempAcquirers.forEach(x => x.noInputs.length = 0);
    }
    //区分建物のとき
    if(prefix === "bldg"){
        //値を初期化
        iniInputsAndSelectValue(newInstance.sites[0].inputs);
        //敷地権の符号に初期値を代入する
        const siteNumberInput = newInstance.sites[0].inputs[SNumber.input];
        siteNumberInput.value = "１";
        siteNumberInput.disabled = true;
        newInstance.sites[0].inputs[SPurparty.input[no]].disabled = false;
        newInstance.sites[0].inputs[SPurparty.input[other]].disabled = false;
    }
    //所有者欄を有効化する
    const LPurpartyInputIdxs = LPurparty.input;
    newInstanceInputs[LPurpartyInputIdxs[no]].disabled = false;
    newInstanceInputs[LPurpartyInputIdxs[other]].disabled = false;
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
    //区分建物のとき、敷地権も１つにする
    if(prefix === "bldg")
        removeElsExceptFirstByClassName("siteFieldset", clone);
    //クローンした要素は非表示
    clone.style.setProperty("display", "none", "important");
    //複製した土地情報の属性値を変更
    const newBranchNum = `（${hankakuToZenkaku(String(idx + 1))}）`;
    clone.firstElementChild.textContent = newBranchNum;
    clone.id = clone.id.replace(/\d+/, idx);
    const els = clone.querySelectorAll('[id],[for],[name]');
    const regex = prefix === "land"? /(land[_-])\d+/: (prefix === "house"? /(house[_-])\d+/: /(bldg[_-])\d+/);
    const siteRegex = prefix === "bldg"? /(site[_-])\d+/: null;
    const siteIdx = Bldg.section.getElementsByClassName("siteFieldset").length; //区分建物の敷地権用
    els.forEach(x => updateAttr(x, regex, idx, siteRegex, siteIdx));
    copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling);

    /**
     * ID、for属性、name属性を更新する
     * @param {HTMLElement} el - 対象の要素
     * @param {RegExp} regex - 正規表現
     * @param {number} idx - 新しいインデックス
     * @param {RegExp} [siteRegex] - 敷地用の正規表現（オプショナル）
     * @param {number} [siteIdx] - 敷地のインデックス（オプショナル）
     */
    function updateAttr(el, regex, idx, siteRegex = null, siteIdx = null) {
        const attributesToUpdate = ['id', 'htmlFor', 'name'];
        attributesToUpdate.forEach(attr => {
            if(el[attr]){
                el[attr] = el[attr].replace(regex, `$1${idx}`);
                if(siteRegex){
                    el[attr] = el[attr].replace(siteRegex, `$1${siteIdx}`);
                }
            }
        });
        // 特定のIDに基づいて特殊な処理を行う
        if(el.id && (el.id.includes("purparty") || el.id.includes("acquirer-0-fieldset"))){
            el.disabled = false;
        }else if(el.id === `id_${prefix}-${idx}-index` || (siteRegex && el.id === `id_site-${siteIdx}-target`)){
            el.value = `${idx}`;
        }
    }
}

/**
 * 換価確認欄を「いいえ」にチェック/換価確認欄を非表示/イベントを発生させてエラー要素から削除
 * @param {Land|House|Bldg} instance 
 */
function hiddenIsExchange(instance){
    const isExchangeIdxs = instance instanceof Bldg? BIsExchange: LIsExchange;
    const input = instance.inputs[isExchangeIdxs.input[no]];
    input.checked = true;
    instance.Qs[isExchangeIdxs.form].style.display = "none";
    input.dispatchEvent(new Event("change"));
}

/**
 * 新たな不動産インスタンスを生成して返す
 * @param {string} prefix "land", "house", "bldg"のいずれか
 * @param {number} idx インスタンスのインデックス
 * @returns
 */
function createNewPropertyInstance(prefix, idx){
    const classMap = {
        land: Land,
        house: House,
        bldg: Bldg
    };
    let instance;
    if(classMap[prefix]){
        instance = new classMap[prefix](`id_${prefix}-${idx}-fieldset`);
    }else{
        throw new Error("createNewPropertyInstance：想定されていないクラスのインスタンスが渡されました");
    }
    //TempAcquirerを追加
    createTempAcquirerInstance(instance, prefix, idx);
    //区分建物のとき、敷地権のインスタンスも追加する
    if(prefix === "bldg"){
        const siteCount = Bldg.section.getElementsByClassName("siteFieldset").length - 1;
        instance.addSite(new Site(`id_site-${siteCount}-fieldset`, instance));
    }
    return instance;
}

/**
 * TempAcquirerインスタンスを生成
 * @param {Land|House|Bldg} instance  
 * @param {string} prefix  
 * @param {string|number} idx  
 */ 
function createTempAcquirerInstance(instance, prefix, idx){
    instance.addTempAcquirer(new TempAcquirer(`id_${prefix}_${idx}_temp_${prefix}_acquirer-0-fieldset`, instance));
    instance.addTempCashAcquirer(new TempAcquirer(`id_${prefix}_${idx}_temp_${prefix}_cash_acquirer-0-fieldset`, instance));
    instance.tempCashAcquirers[0].noInputs.length = 0;
}

/**
 * 土地情報欄のイベントなど設定
 */
async function setLandSection(){
    try{
        const TOD = typeOfDivisions[0];
        const isLandAcquirerAlone = TOD.isPropertyAcquirerAlone();
        const isNormalDivision = TOD.isNormalDivision();
        const newCount = parseInt(numberOfProperties[0].inputs[NOPLand].value);
        const prefix = "land";

        //初めて土地情報を入力するとき
        if(lands.length === 0){
            const isData = document.getElementById("id_land-0-land_id").value;
            isData?
                handleSetPropertySectionIfData(prefix):
                createPropertyInstanceAndFormForFirstTime(prefix, newCount);

            //取得者候補を追加する
            getAndAddAcquirerCandidate(lands);
            //遺産分割方法の不動産の全取得者欄が入力されているときは、自動入力する
            if(isLandAcquirerAlone){
                lands.forEach(x => x.tempAcquirers.forEach(y => inputTAWhenAcquirerAlone(y)));
            }else if(TOD.isPropertyLegalInheritance()){
                //不動産の取得者が法定相続のとき
                lands.forEach(x => createLegalInheritanceTAFieldset(false, x));
            }
            //不動産欄のイベント設定
            handlePropertyFormsAndBtnsEvent(prefix);
            //通常分割のとき、換価確認欄を非表示にして「しない」にチェックを入れる
            if(isNormalDivision)
                lands.forEach(x => hiddenIsExchange(x));
            //仮取得者欄のイベント設定
            handleTAFieldsetEvent(lands);
        }else{
            //土地情報を入力したことがあるとき
            const oldCount = lands.length;
            //土地の数が減ったとき
            if(newCount < oldCount)
                removePropertyWrappers(lands, newCount);

            const land = lands[0];
            const allLegalHeirs = getAllLegalHeirs();
            TOD.isExchangeDivision()?
                handleIsExchangeYesProcess(lands, allLegalHeirs):
                handleIsExchangeNoProcess(lands, allLegalHeirs);

            const wasTAHidden = land.tempAcquirers[0].fieldset.parentElement.style.display === "none"; //前回の遺産分割方法確認
            //遺産分割方法が１人のとき
            if(isLandAcquirerAlone){
                handlePropertyAcquirerAloneDivision(lands, allLegalHeirs);
            }else if(TOD.isPropertyFreeAllocation()){
                //遺産分割方法がその他のとき
                const newCandidates = getAllcandidates();
                //単独又は法定相続だったのとき
                if(wasTAHidden){
                    iniPropertySectionByPropertyAllocationChange(lands, newCandidates);
                }else{
                    //その他だったのとき
                    const oldCandidates = Array.from(land.tempAcquirers[0].inputs[TAAcquirer.input].options).slice(1);
                    const isAllLegalHeirs = newCandidates.length === allLegalHeirs.length;
                    const isSameLength = newCandidates.length === oldCandidates.length;
                    //同じ人数かつ同じ要素（全員が取得車の場合を除く）のときは何も処理をしない
                    if(!isAllLegalHeirs && isSameLength){
                        if(!isCandidatesNoChange(newCandidates, oldCandidates))
                            iniPropertySectionByPropertyAllocationChange(lands, newCandidates);
                    }else if(!isSameLength){
                        iniPropertySectionByPropertyAllocationChange(lands, newCandidates);
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
                handlePropertyIncreaseProcess(prefix, oldCount, newCount, isNormalDivision);
            }
        }
        //最後に表示されている土地情報を有効化する
        await enableAndDisplayTargetPropertyWrapper(lands);
    }catch(e){
        basicLog("setLandSection", e, "");
    }
}

/**
 * 遺産分割方法が通常から換価に変更されたときの処理
 * ・換価しないのチェックを解除
 * ・換価確認欄を表示する
 * ・換価するラジオボタンをエラー要素に追加してボタン操作
 * ・最初の不動産欄以外は非表示にする（換価確認をする必要があるため）
 * @param {Land|House|Bldg} instances 
 */
function handleNormalToExchangeProcess(instances){
    const prefix = getPropertyPrefix(instances[0]);
    const isExchangeIdxs = prefix === "bldg"? BIsExchange: LIsExchange;
    instances.forEach((x, idx) => {
        const inputs = x.inputs;
        inputs[isExchangeIdxs.input[no]].checked = false;
        x.Qs[isExchangeIdxs.form].style.display = "";
        pushInvalidEl(x, inputs[isExchangeIdxs.input[yes]]);
        if(idx > 0){
            x.fieldset.parentElement.parentElement.style.setProperty("display", "none", "important");
        }
    })    
}

/**
 * 金銭の分配方法の変更に合わせた不動産情報の修正
 * @param {Land|House|Bldg[]} instances 
 * @param {SpouseOrAscendant|DescendantOrCollateral[]} allLegalHeirs 法定相続人全員を格納した配列
 */
function handleCashAllocationChangeProcess(instances, allLegalHeirs){
    const prefix = getPropertyPrefix(instances[0]);
    const isCashFreeDivision = typeOfDivisions[0].inputs[TODCashAllocation.input[other]].checked; //今回の遺産分割方法確認
    let isInitialize = false;   
    for(let i = 0, len = instances.length; i < len; i++){
        const {property, propertyWrapper, TCAs} = propertyDataToVariable(instances[i]);
        const isExchangeInputYes = prefix === "bldg"? property.inputs[BIsExchange.input[yes]]: property.inputs[LIsExchange.input[yes]];
        const isExchange = isExchangeInputYes.checked;
        //金銭の遺産分割方法がその他のとき
        if(isCashFreeDivision){
            const TCAWrapper = TCAs[0].fieldset.parentElement;
            const wasAloneOrLegalInheritance = isExchange && TCAWrapper.style.display === "none";
            //前回１人又は法定相続で換価するにチェックされていたとき
            if(wasAloneOrLegalInheritance){
                TCAWrapper.style.display = "block";
                resetTA(TCAs, allLegalHeirs);
                enablePropertyWrapper(instances, i);
                //最初に一致したフォームに対する処理
                if(!isInitialize){
                    slideDownAndScroll(propertyWrapper);
                    isInitialize = true;
                }else{
                    //以降のフォームは非表示にする
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


/**
 * 不動産情報欄のチェック
 * ・換価分割が選択されていたが換価される不動産がないときにアラート表示して入力を変更
 * ・取得候補者になっていたが、取得者に選択されなかった人がいるとき、アラート表示して入力変更
 */
async function checkPropertySection(){
    try{
        const TOD = typeOfDivisions[0];
        const TODInputs = TOD.inputs;
        //遺産分割方法で換価分割が押されていたが、換価分割する不動産が選択されなかったとき
        if(TOD.isExchangeDivision() && !isAnyPropertyToExchange())
            await alertAndChangeToNormal();
        //遺産分割の不動産の分配方法でその他が選択されているとき
        if(TOD.isPropertyFreeAllocation())
            await alertAndChangeIsAcquire();
        
        //アラート表示と遺産分割方法を通常に変更する
        async function alertAndChangeToNormal(){
            try{
                await showAlert(
                    "確認",
                    "遺産分割の方法で「換価分割」が選択されてましたが、換価する不動産が選択されていないため遺産分割の方法を「通常」に変更しました",
                    "warning"
                    );
                    const fieldset = TOD.fieldset;
                const input = TODInputs[TODTypeOfDivision.input[yes]];
                fixInput(fieldset, input);
            }catch(e){
                throw {type: "alertAndChangeToNormal", message: e.message};
            }
        }
        
        //アラートを表示と取得候補者になったが取得者として選択されなかった相続人の取得確認欄を「しない」に変更する
        async function alertAndChangeIsAcquire(){
            try{
                const candidates = getAllcandidates();
                const acquirers = [];
                findAndAddMatches(lands, candidates, acquirers);
                findAndAddMatches(houses, candidates, acquirers);
                findAndAddMatches(bldgs, candidates, acquirers);
                if (candidates.length !== acquirers.length) {
                    await showAlert(
                        "確認",
                        "不動産取得者に選択されなかった相続人は、相続人情報の「不動産を取得しますか？」を「いいえ」に変更されました", 
                        "warning"
                    )
                    const targets = candidates.filter(x => !acquirers.some(y => y.inputs[y.constructor.idxs.idAndContentType].value === x.inputs[x.constructor.idxs.idAndContentType].value));
                    if(targets){
                        targets.forEach(x => {
                            const fieldset = x.fieldset;
                            const input = x.inputs[x.constructor.idxs.isAcquire[no]];
                            fixInput(fieldset, input);
                        })
                        //相続人が一人になったとき
                        if(targets.length === 1){
                            handlePropertyAcquirerChangeToAloneProcess(targets[0]);
                        }
                    }
                }
            }catch(e){
                throw {type: "alertAndChangeIsAcquire", message: e.message};
            }
        }
        
        //相続人の取得者チェックの変更により取得者が１人になったときの処理
        function handlePropertyAcquirerChangeToAloneProcess(aloneAcquirer){
            //遺産分割方法の分配方法を非表示にする、チェックを初期化する
            TOD.Qs[TODPropertyAllocation.form].style.setProperty('display', 'none', 'important');
            TODPropertyAllocation.input.forEach(x => TODInputs[x].checked = false);
            //objectId1とcontentType1を取得する
            const [objectId, contentType] = aloneAcquirer.inputs[aloneAcquirer.constructor.idxs.idAndContentType].value.split("_");
            TODInputs[TODObjectId1.input].value = objectId;
            TODInputs[TODContentType1.input].value = contentType;
            //不動産取得者のラッパーを全て非表示にする
            [lands, houses, bldgs].forEach(x => {
                if(x.length > 0){
                    x.forEach(y => {
                        y.tempAcquirers[0].fieldset.parentElement.style.setProperty("display", "none", "important");
                    })
                }
            });
        }

        //換価する不動産があるか判別
        function isAnyPropertyToExchange(){
            const isAnyLandsToExchange = isPropertyToExchange(lands, LIsExchange.input);
            const isAnyHousesToExchange = isPropertyToExchange(houses, HIsExchange.input);
            const isAnyBldgsToExchange = isPropertyToExchange(bldgs, BIsExchange.input);
            return (isAnyLandsToExchange || isAnyHousesToExchange || isAnyBldgsToExchange);

            function isPropertyToExchange(properties, idx) {
                return properties.some(property => property.inputs[idx[yes]].checked);
            }
        }

        //取得候補者が全員取得者として選択されているとき、配列に追加する
        function findAndAddMatches(property, candidates, acquirers) {
            if(property.length === 0)
                return;
            property.forEach(x => {
                x.tempAcquirers.forEach(y => {
                    const match = candidates.find(z => z.inputs[z.constructor.idxs.idAndContentType].value === y.inputs[TAAcquirer.input].value);
                    if (match && !acquirers.includes(match)) {
                        acquirers.push(match);
                    }
                });
            });
        }
    }catch(e){
        if(e.type)
            console.error(`${e.type}でエラーが発生しました：`, e.message);
        else
            console.error("checkPropertySectionでエラーが発生しました：", e.message);
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
 * 隠し取得者欄に入力する
 * @param {Acquirer} acquirer 
 * @param {string} objectId 
 * @param {string} contentType 
 * @param {string} percentage 
 * @param {string} index 
 */
function inputToHiddenAcquirer(acquirer, objectId, contentType, percentage, index){
    acquirer.inputs[AObjectId2].value = objectId;
    acquirer.inputs[AContentType2].value = contentType;
    acquirer.inputs[APercentage].value = percentage;
    acquirer.inputs[ATarget].value = index;
}

/**
 * 仮フォームの値を隠しフォームに転記
 * @param {Land|House|Bldg} instance 転記対象の仮フォームを持っている不動産インスタンス
 * @param {TempAcquirer} temp 仮フォームインスタンス
 * @param {Acquirer} acquirer 隠しフォームインスタンス
 */
function copyToPropertyHiddenForm(instance, temp, acquirer){
    const tempInputs = temp.inputs;
    const [objectId, contentType] = tempInputs[TAAcquirer.input].value.split("_");
    const percentage = tempInputs[TAPercentage.input[yes]].value + "分の" + tempInputs[TAPercentage.input[no]].value;
    const index = instance instanceof Bldg?
        instance.inputs[BIndex.input].value:
        instance.inputs[LIndex.input].value;
    inputToHiddenAcquirer(acquirer, objectId, (contentType || ""), percentage, index);
}

/**
 * 不動産情報の取得者仮フォームを隠しフォームに転記する
 * @param {Land|House} instances 
 */
function SynchronizePropertyHiddenForm(instances){
    const prefix = getPropertyPrefix(instances[0]);
    //隠しフォームを初期化する
    iniAcquirers();
    //仮フォームからデータを取得する
    let TAsCount = 0;
    let TCAsCount = 0;
    instances.forEach(x => {
        x.tempAcquirers.forEach((y, idx) => {
            if(TAsCount === 0){
                //インスタンス生成、転記
                x.addAcquirer(new Acquirer(`id_${prefix}_acquirer-0-fieldset`));
                copyToPropertyHiddenForm(x, y, x.acquirers[0]);
            }else{
                //フィールドセットをコピー、属性を更新、ペースト、インスタンス生成、転記
                const AWrapper = document.getElementById(`id_${prefix}_acquirer_wrapper`);
                const copyFrom = getLastElFromArray(AWrapper.getElementsByClassName(`${prefix}AcquirerFieldset`));
                const att = "[id],[name]"
                const regex = /(acquirer-)\d+/;
                copyAndPasteEl(copyFrom, att, regex, TAsCount);
                x.addAcquirer(new Acquirer(`id_${prefix}_acquirer-${TAsCount}-fieldset`));
                copyToPropertyHiddenForm(x, y, x.acquirers[idx]);
            }
            TAsCount += 1;
        });
        x.tempCashAcquirers.forEach((y, idx) => {
            if(TCAsCount === 0){
                x.addCashAcquirer(new Acquirer(`id_${prefix}_cash_acquirer-0-fieldset`));
                copyToPropertyHiddenForm(x, y, x.cashAcquirers[0]);
            }else{
                const CAWrapper = document.getElementById(`id_${prefix}_cash_acquirer_wrapper`);
                const copyFrom = getLastElFromArray(CAWrapper.getElementsByClassName(`${prefix}CashAcquirerFieldset`));
                const att = "[id],[name]"
                const regex = /(acquirer-)\d+/;
                copyAndPasteEl(copyFrom, att, regex, TCAsCount);
                x.addCashAcquirer(new Acquirer(`id_${prefix}_cash_acquirer-${TCAsCount}-fieldset`));
                copyToPropertyHiddenForm(x, y, x.cashAcquirers[idx]);
            }
            TCAsCount += 1;
        });
    })
    //フォームセットの数を更新する
    document.getElementById(`id_${prefix}_acquirer-TOTAL_FORMS`).value = TAsCount;
    document.getElementById(`id_${prefix}_cash_acquirer-TOTAL_FORMS`).value = TCAsCount;

    /**
     * 不動産取得者の隠し取得者フォームとインスタンスを初期化する
     */
    function iniAcquirers(){
        //フィールドセットを１つにする
        removeElsExceptFirstByClassName(`${prefix}AcquirerFieldset`, document.getElementById(`id_${prefix}_acquirer_wrapper`));
        removeElsExceptFirstByClassName(`${prefix}CashAcquirerFieldset`, document.getElementById(`id_${prefix}_cash_acquirer_wrapper`));
        //インスタンスを全て削除する
        instances.forEach(x => {
            x.acquirers.length = 0;
            x.cashAcquirers.length = 0;
        });
    }
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
    SpouseOrAscendant.correctBtn.disabled = true;
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
async function handleNOPSectionOkBtn(section, preSection){
    const nextSectionIdx = 4;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);

    if(section.id === "land-section")
        await setLandSection();
    else if(section.id === "house-section")
        await setHouseSection();
    else if(section.id === "bldg-section")
        await setBldgSection();
    else
        console.error("handleNOPSectionOkBtn：想定されていないセクションが指定されました")
}

/**
 * 不動産情報セクションの次の項目へ進むボタンのイベント設定
 * @param {HTMLElement} section 
 * @param {HTMLElement} preSection 
 */
async function handlePropertySectionOkBtn(section, preSection){
    const nextSectionIdx = ["house-section", "bldg-section"].includes(section.id)? 4: 5;
    handleOkBtnEventCommon(section, preSection, nextSectionIdx);
    //一つ前の不動産セクションの最後の不動産欄のボタンを無効化
    const prefix = preSection.id.includes("land")? "land": (preSection.id.includes("house")? "house": "bldg");
    const correctBtn = prefix === "land"? landCorrectBtn: (prefix === "house"? houseCorrectBtn: bldgCorrectBtn);
    const removeTABtns = prefix === "land"? removeTLABtns: (prefix === "house"? removeTHABtns: removeTBABtns);
    const removeTCABtns = prefix === "land"? removeTLCABtns: (prefix === "house"? removeTHCABtns: removeTBCABtns);
    correctBtn.disabled = true;
    getLastElFromArray(removeTABtns).disabled = true;
    getLastElFromArray(removeTCABtns).disabled = true;
    //不動産情報の仮フォームデータを隠しフォームに転記する処理
    const instances = getPropertyInstancesFromPrefix(prefix);
    if(prefix === "bldg"){
        getLastElFromArray(removeSiteBtns).disabled = true;
        getLastElFromArray(addSiteBtns).disabled = true;
    }
    SynchronizePropertyHiddenForm(instances);
    if(section.id === "house-section")
        await setHouseSection();
    else if(section.id === "bldg-section")
        await setBldgSection ();
    else if(section.id === "application-section")
        await setApplicationSection();
    else
        console.log("handlePropertySectionOkBtn：想定されていないセクションが指定されました")
}

/**
 * 通常分割のときの処理内容
 * @param {Land|House|Bldg} instances 
 * @param {*} allLegalHeirs 
 */
function handleIsExchangeNoProcess(instances, allLegalHeirs){
    instances.forEach(x => {
        resetTA(x.tempCashAcquirers, allLegalHeirs);
        hiddenIsExchange(x);
    })
}

/**
 * 建物情報欄を設定
 */
async function setHouseSection(){
    try{
        const TOD = typeOfDivisions[0];
        const isHouseAcquirerAlone = TOD.isPropertyAcquirerAlone();
        const isNormalDivision = TOD.isNormalDivision();
        const newCount = parseInt(numberOfProperties[0].inputs[NOPHouse].value);
        const prefix = "house";
        //初めて建物情報を入力するとき
        if(houses.length === 0){
            const isData = document.getElementById("id_house-0-house_id").value !== "";
            isData?
                handleSetPropertySectionIfData(prefix):
                createPropertyInstanceAndFormForFirstTime(prefix, newCount);

            //取得者候補を追加する
            getAndAddAcquirerCandidate(houses);
            //遺産分割方法の不動産の全取得者欄が入力されているときは、自動入力する
            if(isHouseAcquirerAlone){
                houses.forEach(x => x.tempAcquirers.forEach(y => inputTAWhenAcquirerAlone(y)));
            }else if(TOD.isPropertyLegalInheritance()){
                //不動産の取得者が法定相続のとき
                houses.forEach(x => createLegalInheritanceTAFieldset(false, x));
            }
            handlePropertyFormsAndBtnsEvent(prefix);
            if(isNormalDivision)
                houses.forEach(x => hiddenIsExchange(x));
            handleTAFieldsetEvent(houses);
        }else{
            //土地情報を入力したことがあるとき
            const oldCount = houses.length;
            //土地の数が減ったとき
            if(newCount < oldCount)
                removePropertyWrappers(houses, newCount);

            const house = houses[0];
            const allLegalHeirs = getAllLegalHeirs();
            //通常か換価かに応じて処理を分ける
            TOD.isExchangeDivision()? 
                handleIsExchangeYesProcess(houses, allLegalHeirs):
                handleIsExchangeNoProcess(houses, allLegalHeirs);

            const wasTAHidden = house.tempAcquirers[0].fieldset.parentElement.style.display === "none"; //前回の遺産分割方法確認
            //遺産分割方法が１人のとき
            if(isHouseAcquirerAlone){
                handlePropertyAcquirerAloneDivision(houses, allLegalHeirs);
            }else if(TOD.isPropertyFreeAllocation()){
                //遺産分割方法がその他のとき
                const newCandidates = getAllcandidates();
                //単独又は法定相続だったのとき
                if(wasTAHidden){
                    iniPropertySectionByPropertyAllocationChange(houses, newCandidates);
                }else{
                    //その他だったのとき
                    const oldCandidates = Array.from(house.tempAcquirers[0].inputs[TAAcquirer.input].options).slice(1);
                    const isAllLegalHeirs = newCandidates.length === allLegalHeirs.length;
                    const isSameLength = newCandidates.length === oldCandidates.length;
                    //同じ人数かつ同じ要素（全員が取得車の場合を除く）のときは何も処理をしない
                    if(!isAllLegalHeirs && isSameLength){
                        if(!isCandidatesNoChange(newCandidates, oldCandidates))
                            iniPropertySectionByPropertyAllocationChange(houses, newCandidates);
                    }else if(!isSameLength){
                        iniPropertySectionByPropertyAllocationChange(houses, newCandidates);
                    }
                }
            }else{
                //遺産分割方法が法定相続のとき
                houses.forEach(x => {
                    resetTA(x.tempAcquirers, allLegalHeirs);
                    createLegalInheritanceTAFieldset(false, x);
                });
            }

            //建物の数が増えたとき
            if(newCount > oldCount){
                handlePropertyIncreaseProcess(prefix, oldCount, newCount, isNormalDivision);
            }
        }
        //最後に表示されている建物情報を有効化する
        await enableAndDisplayTargetPropertyWrapper(houses);
    }catch(e){
        basicLog("setHouseSection", e, "");
    }
}

/**
 * 最後に表示されている不動産情報を有効化する
 * @param {Land|House|Bldg} instances 
 */
async function enableAndDisplayTargetPropertyWrapper(instances){
    for(let i = instances.length - 1; i >= 0; i --){
        const wrapper = instances[i].fieldset.parentElement.parentElement;
        if(wrapper.style.display !== "none"){
            enablePropertyWrapper(instances, i);
            await slideDownAndScroll(wrapper);
            break;
        }
    }
}

/**
 * 所在及び地番のチェック：空欄、「番地」「番」の表記
 * @param {HTMLInputElement} input
 */
function addressAndLandNumberValidation(input){
    const val = input.value;
    let result = isBlank(input);
    if(result !== false) 
        result;
    //番地がないこと
    if(/番地/.test(val))
        return "地番は「◯番地」ではなく「◯番」という形式です";
    //番の前の１字以上の数字、後ろは空欄又は数字
    if(!/([\d\uFF10-\uFF19])番([\d\uFF10-\uFF19]*$)/.test(val))
        return "地番は（数字）番（数字又は空欄）の形式です";
    return true
}

/**
 * 評価額のチェック、共通：空欄、整数
 * @param {HTMLInputElement} input
 */
function priceValidation(input){
    let result = isBlank(input);
    if(result !== false)
        return result;
    input.value = removeCommas(input.value);
    if(!isNumber(input.value, input))
        return "数字のみで入力してください";
    result = validateIntInput(input);
    if(typeof result === "string")
        return result;
    return true;
}

/**
 * 所有権・持分のチェック：空欄、整数、分子が分母を超えていない
 * @param {HTMLInputElement[]} inputs
 * @param {HTMLInputElement} input
 */
function purpartyValidation(inputs, input){
    let result = isBlank(input);
    if(result !== false)
        return result;
    if(!isNumber(input.value, input))
        return "数字のみで入力してください";
    result = validateIntInput(input);
    if(typeof result === "string")
        return result;
    const bottomVal = inputs[SPurparty.input[no]].value;
    const topVal = inputs[SPurparty.input[other]].value;
    if(bottomVal !== "" && topVal !== ""){
        const bottom = parseInt(ZenkakuToHankaku(bottomVal));
        const top = parseInt(ZenkakuToHankaku(topVal));
        if(bottom < top)
            return "分子は分母以下の数字にしてください";
    }
    return true;
}

/**
 * 敷地権のバリデーション
 * @param {*} inputs 
 * @param {*} idx 
 */
function siteValidation(inputs, idx){
    const input = inputs[idx];
    let result;
    //所在及び地番：空欄、「番地」「番」
    if(idx === SAddressAndLandNumber.input){
        result = addressAndLandNumberValidation(input);
    }else if(idx === SType.input){
        //敷地権の種類：空欄チェック
        result = isBlank(input);
        return (result !== false) ? result: true;
    }else if([SPurparty.input[no], SPurparty.input[other]].includes(idx)){
        //所有権・持分：空欄、整数、１を超えない、分子が分母を超えない
        result = purpartyValidation(inputs, input);
    }else if(idx === SPrice.input){
        //評価額：空欄、整数、コンマ付与又は削除
        result = priceValidation(input);
    }else{
        console.error("siteValidation：想定しないidxが渡されました")
    }

    if(typeof result === "string"){
        input.value = "";
    }
    return result;
}

/**
 * inputIdxからformIdxを取得する
 * @param {number} inputIdx 
 * @param {*} idxMap 
 * @returns 
 */
function getFormIdxFromInputidx(inputIdx, idxMap) {
    for (const [key, value] of Object.entries(idxMap)) {
        const inputIdxs = Array.isArray(value.input) ? value.input : [value.input];
        if (inputIdxs.includes(inputIdx)) {
            return value.form;
        }
    }
    return null;
}
/**
 * 敷地権フォームのイベント設定
 */
function handleSiteFormEvent(startIdx = 0){
    const priceInputIdx = SPrice.input;
    for(let i = startIdx, len1 = sites.length; i < len1; i++){
        const site = sites[i];
        const inputs = site.inputs;
        for(let j = 0, len2 = inputs.length; j < len2; j++){

            //土地の符号はイベント不要のためスキップ
            if(j === SNumber.input)
                continue;

            //target以降はイベント不要
            if(j === STarget.input)
                break;

            const input = inputs[j];
            //keydownイベント設定
            input.addEventListener("keydown", (e)=>{

                //評価額以外はEnterで次の欄にフォーカス移動する
                if(j !== priceInputIdx){
                    setEnterKeyFocusNext(e, inputs[j + 1]);
                }

                //所有権・持分と評価額の欄は数字のみの入力に制限
                if([SPurparty.input[no], SPurparty.input[other], priceInputIdx].includes(j)){
                    handleNumInputKeyDown(e);
                }
            })

            //changeインベント設定
            input.addEventListener("change", ()=>{
                //所有権・持分の所有権CBのみ専用のイベント
                if(j === SPurparty.input[yes]){

                    handlePurpartyCbChangeEvent(site);

                }else{

                    const result = siteValidation(inputs, j);
                    const formIdx = getFormIdxFromInputidx(j, Site.idxs);

                    afterValidation(result, site.errMsgEls[formIdx], result, input, site);

                    if(j === priceInputIdx){
                        const hankaku = ZenkakuToHankaku(input.value);
                        input.value = hankakuToZenkaku(addCommas(hankaku));
                    }else if([SAddressAndLandNumber.input, SPurparty.input[no], SPurparty.input[other]].includes(j)){
                        input.value = hankakuToZenkaku(input.value);
                    }
                }
            })
        }
    }
}

/**
 * 敷地権の符号を入力する
 * @param {Bldg} bldg 
 */
function inputSiteNumber(bldg){
    if(!bldg)
        throw new Error("inputSiteNumber：bldgインスタンスが存在しません");
    const count = bldg.sites.length;
    const input = getLastElFromArray(bldg.sites).inputs[SNumber.input];
    input.disabled = false;
    input.value = hankakuToZenkaku(String(count));
    input.disabled = true;
}

/**
 * 敷地権の追加ボタンのイベント設定
 * @param {number} startIdx 
 */
function handleAddSiteBtnEvent(startIdx = 0){
    try{
        for(let i = startIdx, len = addSiteBtns.length; i < len ; i++){
            const addBtn = addSiteBtns[i];
            const bldg = bldgs[i];
            addBtn.addEventListener("click", ()=>{
                if(Application.section.style.display !== "none"){
                    addBtn.disabled = true;
                    return;
                }

                //敷地権フォームを生成
                const newIdx = Bldg.section.getElementsByClassName("siteFieldset").length;
                const copyFrom = getLastElFromArray(bldg.sites).fieldset;
                const regex = /(site-)\d+/;
                const att = '[id],[name],[for]';
                copyAndPasteEl(copyFrom, att, regex, newIdx);
                //インスタンスも生成
                const newId = copyFrom.id.replace(regex, `$1${newIdx}`);
                const newSite = new Site(newId, bldg);
                bldg.addSite(newSite);
                //値を初期化
                const newSiteInputs = newSite.inputs;
                iniInputsAndSelectValue(newSiteInputs);
                newSite.inputs[SPurparty.input[no]].disabled = false;
                newSite.inputs[SPurparty.input[other]].disabled = false;
                //土地の符号に初期値を入れる
                inputSiteNumber(bldg);
                //イベント設定
                handleSiteFormEvent(newIdx);
                //表示処理
                slideDownAndScroll(newSite.fieldset);
                removeSiteBtns[i].disabled = false;
                //一つ前の敷地権を無効化する
                copyFrom.disabled = true;
                isActivateOkBtn(bldg);
            })
        }
    }catch(e){
        console.error("handleAddSiteBtnEvent：エラー発生", e);
    }
}

/**
 * 敷地権の削除ボタンのイベント設定
 */
function handleRemoveSiteBtnEvent(startIdx = 0){
    for(let i = startIdx, len = removeSiteBtns.length; i < len; i++){
        const removeBtn = removeSiteBtns[i];
        const bldg = bldgs[i];
        removeBtn.addEventListener("click", ()=>{
            //フォームを削除
            const target = getLastElFromArray(bldg.sites).fieldset;
            slideUp(target, 250, function(){
                target.remove();
            });
            //インスタンスを削除する(sitesとbldgの両方)
            bldg.sites.pop();
            const site = sites.filter(x => x.fieldset.id === target.id);
            const idx = sites.indexOf(site[0]);
            sites.splice(idx, 1);
            //属性値を更新する
            if(idx < sites.length){
                for(let i = idx, len = sites.length; i < len; i++){
                    updateAttribute(sites[i].fieldset, "[id],[for],[name]", /(site-)\d+/, i);
                }
            }
            //一つ前の敷地権を有効化する
            getLastElFromArray(bldg.sites).fieldset.disabled = false;
            //敷地権が１つになったとき、削除ボタンを無効化
            if(bldg.sites.length === 1){
                removeBtn.disabled = true;
            }
            addSiteBtns[i].disabled = false;
            isActivateOkBtn(bldg);
        })
    }
}

/**
 * 換価分割のときの処理内容
 * ・通常から換価のとき、換価確認のいいえにチェックが入ってるのを解除して表示状態にして最初の欄のみの表示にする
 * ・前回も換価のとき、金銭の分配方法の変更に応じてフォームを修正
 * @param {Land|House|Bldg} instances 
 * @param {SpouseOrAscendant|DescendantOrCollateral[]} allLegalHeirs 
 */
function handleIsExchangeYesProcess(instances, allLegalHeirs){
    const instance = instances[0];
    const prefix = getPropertyPrefix(instance);
    const isExchangeIdxs = prefix === "bldg"? BIsExchange: LIsExchange;
    const isNormalToExchange = 
        instance.inputs[isExchangeIdxs.input[no]].checked &&
        instance.Qs[isExchangeIdxs.form].style.display === "none";
    isNormalToExchange?
        handleNormalToExchangeProcess(instances):
        handleCashAllocationChangeProcess(instances, allLegalHeirs);
}

/**
 * 隠しフォームのインスタンスを全て生成する
 * @param {boolean} isCash 
 * @param {string} prefix 
 */
function createAcquirerInstances(isCash, prefix){
    const id = `id_${prefix}_${isCash? 'cash_': ''}acquirer-`;
    const count = parseInt(document.getElementById(`id_${prefix}_${isCash? "cash_": ""}acquirer-TOTAL_FORMS`).value);
    const acquirers = [];
    for(let i = 0; i < count; i++){
        acquirers.push(new Acquirer(`${id}${i}-fieldset`));
    }
    return acquirers;
}

/**
 * 引数に渡された文字を分解して２つのinputに代入する
 * @param {string} value 
 * @param {string} separator 
 * @param {HTMLInputElement} firstInput 
 * @param {HTMLInputElement} secondInput 
 */
function splitAndInput(value, separator, firstInput, secondInput){
    const [a, b] = value.split(separator);
    firstInput.value = a;
    secondInput.value = b;
}   

/**
 * 登録されているデータに基づく不動産データの復元
 * @param {Land|House|Bldg} instance 
 * @param {number} index 不動産のインデックス
 */
function restorePropertyData(instance, index){
    const indexIdx = instance instanceof Land? LIndex.input:
        instance instanceof House? HIndex.input:
        BIndex.input;
    const purpartyInputIdxs = instance instanceof Land? LPurparty.input:
        instance instanceof House? HPurparty.input:
        BPurparty.input;
    const inputs = instance.inputs;

    //インデックスを入力
    inputs[indexIdx].value = index;

    //土地建物のとき、地番又は家屋番号の復元
    if(isClassMatched(instance, [Land, House])){
        const identIdx = instance instanceof Land? LLandNumber.input: HHouseNumber.input;
        splitAndInput(inputs[identIdx[other]].value, "番", inputs[identIdx[yes]], inputs[identIdx[no]]);
    }

    //所有権・持分の復元
    splitAndInput(inputs[purpartyInputIdxs[other2]].value, "分の", inputs[purpartyInputIdxs[no]], inputs[purpartyInputIdxs[other]]);
}

/**
 * 対象の区分建物の敷地権のインスタンスを生成する
 * @param {HTMLElement} wrapper 
 * @param {Bldg} bldg 
 */
function createSiteInstance(wrapper, bldg){
    const siteFieldsets = wrapper.getElementsByClassName("siteFieldset");
    for(let i = 0, len = siteFieldsets.length; i < len; i++){
        const site = new Site(siteFieldsets[i].id, bldg);
        bldg.addSite(site);
        site.inputs[STarget.input].value = bldg.inputs[BIndex.input].value;
    }
}

/**
 * 不動産と隠しフォームを関連付ける
 * @param {Land|House|Bldg} instance 
 * @param {Acquirer[]} acquirers 
 * @param {boolean} isCash 
 */
function relatePropertyAndAcquirer(instance, acquirers, isCash){
    const prefix = getPropertyPrefix(instance);
    const idIdx = prefix === "land"? LId.input: 
        prefix === "house"? HId.input:
        BId.input;
    const indexIdx = prefix === "land"? LIndex.input: 
        prefix === "house"? HIndex.input:
        BIndex.input;

    acquirers.forEach(x => {
        if(x.inputs[AObjectId1].value === instance.inputs[idIdx].value){
            x.inputs[ATarget].value = instance.inputs[indexIdx].value;
            isCash? instance.addCashAcquirer(x): instance.addAcquirer(x);
        }
    });
}

/**
 * 敷地権のフィールドセット内のイベント設定
 * ・フォーム、追加ボタン、削除ボタン
 */
function handleSiteFieldsetEvent(formStartIdx = 0, btnStartIdx = 0){
    handleSiteFormEvent(formStartIdx);
    handleAddSiteBtnEvent(btnStartIdx);
    handleRemoveSiteBtnEvent(btnStartIdx);
}

/**
 * prefixから不動産のインスタンスを生成する
 * @param {string} prefix 
 * @param {number} idx 
 * @returns 
 */
function createPropertyInstanceFormPrefix(prefix, idx){
    const id = `id_${prefix}-${idx}-fieldset`;

    return prefix === "land"? new Land(id):
        prefix === "house"? new House(id):
        new Bldg(id);
}

/**
 * 登録されているデータがあるときの不動産欄の設定（イベント設定前までの準備）
 * @param {string} prefix "land", "house", "bldg"
 */
function handleSetPropertySectionIfData(prefix){

    //隠し取得者のインスタンスをすべて生成
    const propertyAcquirers = createAcquirerInstances(false, prefix);
    const cashAcquirers = createAcquirerInstances(true, prefix);

    const section = getPropertySectionFromPrefix(prefix);
    const wrappers = section.getElementsByClassName(`${prefix}Wrapper`);
    //不動産情報のラッパー毎にループ処理
    for(let i = 0, len = wrappers.length; i < len; i++){
        
        //不動産インスタンス生成
        const instance = createPropertyInstanceFormPrefix(prefix, i);

        //隠しinputから表示を復元
        restorePropertyData(instance, i);

        //敷地権のインスタンス生成
        if(prefix === "bldg")
            createSiteInstance(wrappers[i], instance);

        //不動産と隠しフォームの不動産インスタンスを紐づける
        relatePropertyAndAcquirer(instance, propertyAcquirers, false);
        relatePropertyAndAcquirer(instance, cashAcquirers, true);

        //仮フォームは最初の１つだけインスタンスを用意する
        createTempAcquirerInstance(instance, prefix, i);

        //最初以外は非表示にする
        if(i > 0)
            wrappers[i].style.setProperty("display", "none", "important");
    }

    isAcquirersRelated();

    //不動産に所属する取得者の数が一致しないときエラーにする
    function isAcquirersRelated(){
        const functionName = "isAcquirersRelated";
        const instances = getPropertyInstancesFromPrefix(prefix);

        //不動産取得者チェック
        const relatedAcquirersCount = instances.reduce((sum, x) => sum + x.acquirers.length, 0);

        if(relatedAcquirersCount !== propertyAcquirers.length)
            throw new Error(`${functionName}/不動産と関連付けできてない不動産取得者があります`);
    
        //金銭取得者チェック
        const relatedCashAcquirersCount = instances.reduce((sum, x) => sum + x.cashAcquirers.length, 0);
        const hasExchangeableInstance = instances.some(x => x.inputs[x.constructor.idxs.isExchange.input[yes]].checked);

        if (hasExchangeableInstance && relatedCashAcquirersCount !== cashAcquirers.length) {
            throw new Error(`${functionName}/不動産と関連付けできてない金銭取得者があります`);
        }
    }
}

/**
 * 仮取得者のフォーム、追加ボタン、削除ボタンイベント設定
 * @param {Land|House|Bldg} instances 
 * @param {number} startIdx イベント設定を開始するインスタンスのインデックス
 */
function handleTAFieldsetEvent(instances, startIdx = 0){
    setPropertyTAsFormEvent(instances, startIdx);
    setAddTABtnsEvent(instances, startIdx);
    setRemoveTABtnsEvent(instances, startIdx);
}

/**
 * 不動産欄のフォームと追加削除ボタンのイベント設定
 * @param {string} prefix "land", "house", "bldg"
 */
function handlePropertyFormsAndBtnsEvent(prefix){
    const instances = getPropertyInstancesFromPrefix(prefix);
    prefix === "bldg"? setBldgEvent(): setLandHouseEvent(instances);
    setPropertyOkBtnEvent(instances);
    setPropertyCorrectBtnEvent(instances);
}

/**
 * prefixをチェック
 * @param {string} prefix 
 * @returns {string}
 */
function checkPropertyPrefixAndReturnLowerCase(prefix){
    if(!["land", "house", "bldg", "Land", "House", "Bldg"].includes(prefix))
        basicThrowError("getPropertyInstancesFromPrefix", "想定しないprefixです")

    return prefix.toLowerCase()
}

/**
 * prefixから不動産のインスタンスを返す
 * @param {string} prefix 
 * @returns {Land|House|Bldg[]}
 */
function getPropertyInstancesFromPrefix(prefix){
    const x = checkPropertyPrefixAndReturnLowerCase(prefix);

    return x === "land"? lands:
        x === "house"? houses:
        bldgs;
}

/**
 * prefixから不動産のインスタンスを返す
 * @param {string} prefix 
 * @returns {Land|House|Bldg[]}
 */
function getPropertySectionFromPrefix(prefix){
    const x = checkPropertyPrefixAndReturnLowerCase(prefix);

    return x === "land"? Land.section:
        x === "house"? House.section:
        Bldg.section;
}

/**
 * 不動産の数が増えたときの処理
 * @param {string} prefix 
 * @param {number} oldCount 
 * @param {number} newCount 
 * @param {boolean} isNormalDivision 
 */
function handlePropertyIncreaseProcess(prefix, oldCount, newCount, isNormalDivision){
    const instances = getPropertyInstancesFromPrefix(prefix);

    //不動産欄の複製
    for(let i = oldCount; i < newCount; i++){
        addPropertyFormNotFirstTime(instances, i);
    }

    //不動産欄にイベントを設定する
    if(prefix === "bldg"){
        setBldgEvent(oldCount);
        const dif = newCount - oldCount;
        handleSiteFieldsetEvent(sites.length - dif, oldCount);
    }else if(["land", "house"].includes(prefix)){
        setLandHouseEvent(instances, oldCount)
    }else{
        basicLog("handlePropertyIncreaseProcess", "", "想定しないprefixです")
    }

    //仮取得者欄にイベント設定
    handleTAFieldsetEvent(instances, oldCount);

    //通常分割のとき、換価確認欄を「いいえ」にして、非表示にする
    if(isNormalDivision)
        instances.forEach(x => hiddenIsExchange(x));
}

/**
 * 不動産の初回入力時のインスタンスとフォーム生成
 * @param {string} prefix 
 * @param {number} count 
 */
function createPropertyInstanceAndFormForFirstTime(prefix, count){
    //インスタンスを生成する
    createNewPropertyInstance(prefix, 0);
    //数が２以上のとき複製する
    if(count > 1)
        addPropertyFormFirstTime(prefix, count);
    //敷地の符号に初期値を入力して無効化する
    if(prefix === "bldg"){
        sites.forEach(x => {
            const siteNumberInput = x.inputs[SNumber.input];
            siteNumberInput.value = "１";
            siteNumberInput.disabled = true;
        });
    }
}

/**
 * 区分建物欄のイベントなど設定
 */
async function setBldgSection(){
    try{
        const TOD = typeOfDivisions[0];
        const isBldgAcquirerAlone = TOD.isPropertyAcquirerAlone();
        const isNormalDivision = TOD.isNormalDivision();
        const newCount = numberOfProperties[0].getBldgCount(true);
        const prefix = "bldg";
        //初回表示
        if(bldgs.length === 0){

            //保存データが表示されている場合
            const isData = document.getElementById("id_bldg-0-bldg_id").value !== "";
            isData?
                handleSetPropertySectionIfData(prefix):
                createPropertyInstanceAndFormForFirstTime(prefix, newCount);

            //取得者候補を追加する
            getAndAddAcquirerCandidate(bldgs);

            //遺産分割方法の不動産の全取得者欄が入力されているときは、自動入力する
            if(isBldgAcquirerAlone){

                bldgs.forEach(x => x.tempAcquirers.forEach(y => inputTAWhenAcquirerAlone(y)));
            }else if(TOD.isPropertyLegalInheritance()){

                //不動産の取得者が法定相続のとき
                bldgs.forEach(x => createLegalInheritanceTAFieldset(false, x));
            }

            handlePropertyFormsAndBtnsEvent(prefix);

            if(isNormalDivision)
                bldgs.forEach(x => hiddenIsExchange(x));

            handleTAFieldsetEvent(bldgs);

            handleSiteFieldsetEvent();
        }else if(bldgs.length > 0){
            //再表示のとき
            const oldCount = bldgs.length;
            //土地の数が減ったとき
            if(newCount < oldCount){
                //減った分のフォームとインスタンスを削除する
                removePropertyWrappers(bldgs, newCount);
            }
            const bldg = bldgs[0];
            const allLegalHeirs = getAllLegalHeirs();
            //換価ボタンが押されたときの処理
            TOD.isExchangeDivision()?
                handleIsExchangeYesProcess(bldgs, allLegalHeirs):
                handleIsExchangeNoProcess(bldgs, allLegalHeirs);
                
            const wasTAHidden = bldg.tempAcquirers[0].fieldset.parentElement.style.display === "none"; //前回の遺産分割方法確認
            //遺産分割方法が１人のとき
            if(isBldgAcquirerAlone){
                handlePropertyAcquirerAloneDivision(bldgs, allLegalHeirs);
            }else if(TOD.isPropertyFreeAllocation()){
                //遺産分割方法がその他のとき
                const newCandidates = getAllcandidates();
                //単独又は法定相続だったのとき
                if(wasTAHidden){
                    iniPropertySectionByPropertyAllocationChange(bldgs, newCandidates);
                }else{
                    //その他だったのとき
                    const oldCandidates = Array.from(bldg.tempAcquirers[0].inputs[TAAcquirer.input].options).slice(1);
                    const isAllLegalHeirs = newCandidates.length === allLegalHeirs.length;
                    const isSameLength = newCandidates.length === oldCandidates.length;
                    //同じ人数かつ同じ要素（全員が取得車の場合を除く）のときは何も処理をしない
                    if(!isAllLegalHeirs && isSameLength){
                        if(!isCandidatesNoChange(newCandidates, oldCandidates))
                            iniPropertySectionByPropertyAllocationChange(bldgs, newCandidates);
                    }else if(!isSameLength){
                        iniPropertySectionByPropertyAllocationChange(bldgs, newCandidates);
                    }
                }
            }else{
                //遺産分割方法が法定相続のとき
                bldgs.forEach(x => {
                    resetTA(x.tempAcquirers, allLegalHeirs);
                    createLegalInheritanceTAFieldset(false, x);
                });
            }

            //数が増えたとき
            if(newCount > oldCount)
                handlePropertyIncreaseProcess(prefix, oldCount, newCount, isNormalDivision);
        }else{
            basicLog("setBldgSection", "", "区分建物の数が不正な値です");
        }
        //最後に表示されている土地情報を有効化する
        await enableAndDisplayTargetPropertyWrapper(bldgs);
    }catch(e){
        basicLog("setBldgSection", e, "");
    }
}


/**
 * 申請人selectに取得者を追加する
 * @param {Application} instance 
 * @param {boolean} isData 
 */
function addApplicantCandidates(instance, isData){
    const applicant = instance.inputs[aApplicant.input];
    applicant.length = 1;

    //データがあるとき、申請人情報を初期化しない
    if(!isData){
        instance.inputs[aObjectId.input].value = "";
        instance.inputs[aContentType.input].value = "";
    }

    applicant.disabled = false;
    const candidates = getAllcandidates();
    candidates.forEach(x => {
        const inputs = x.inputs;
        const idxs = x.constructor.idxs;
        const val = inputs[idxs.idAndContentType].value;
        const text = inputs[idxs.name].value;
        const option = createOption(val, text);
        applicant.add(option);
    })

    //取得者が１人のとき、無効化する
    if(candidates.length === 1){
        applicant.selectedIndex = 1;
        instance.noInputs = instance.noInputs.filter(x => x !== instance.inputs[aApplicant.input]);
        const [id, contentType] = applicant.value.split("_");
        instance.inputs[aObjectId.input].value = id;
        instance.inputs[aContentType.input].value = contentType;
        applicant.disabled = true;
    }else{
        pushInvalidEl(instance, applicant);
    }
}

/**
 * 申請情報のバリデーション
 * @param {HTMLInputElement[]} inputs 
 * @param {number} idx 
 */
function applicationValidation(inputs, idx){
    const input = inputs[idx];
    //申請人（空欄）
    if(idx === aApplicant.input){
        const result = isBlank(input);
        if(typeof result === "string"){
            return result;
        }
    }else if([aApplicantPhoneNumber.input, aPhoneNumber.input].includes(idx)){
        //電話番号（空欄、電話番号チェック）
        let result = isBlank(input);
        if(typeof result === "string"){
            return result;
        }
        result = checkPhoneNumber(input, true);
        if(typeof result === "string"){
            return result;
        }
        input.value = hankakuToZenkaku(input.value);
    }else if(idx === aName.input){
        //代理人氏名
        return isOnlyZenkaku(input);
    }else if(idx === aAddress.input){
        //代理人住所
        const result = isBlank(input);
        if(typeof result === "string"){
            return result;
        }
        input.value = hankakuToZenkaku(input.value);
    }else if([aIsReturn.input, aIsMail.input].includes(idx)){
        //原本還付の有無、郵送の有無、チェックなし
    }else{
        throw new Error("applicationValidation：想定されないidxが渡されました");
    }

    return true;
}

/**
 * 申請情報欄のイベント設定
 * @param {Application} instance
 */
function setApplicationEvent(instance){
    const inputs = instance.inputs;
    const keydownTargetIdxs = [aApplicantPhoneNumber.input, aName.input, aAddress.input, aPhoneNumber.input];
    for(let i = 0, len = inputs.length; i < len; i++){

        //内部データのイベント設定を省略
        if(i === aContentType.input)
            return;

        const input = inputs[i];

        //keydownイベント（氏名、住所、電話番号のみ）/フォーカス移動
        if(keydownTargetIdxs.includes(i)){
            input.addEventListener("keydown", (e) => {
                setEnterKeyFocusNext(e, i === aPhoneNumber.input? inputs[i + 1]: [i + 4]);
            })
        }

        //各入力欄にchangeイベントを設定する
        input.addEventListener("change", () => {
            //代理人の有無専用のイベント
            if(aIsAgent.input.includes(i)){
                handleIsAgentChangeEvent(i);
                isActivateOkBtn(instance);
                return;
            }else if(aIsReturn.input.includes(i)){
                //原本還付
                instance.noInputs = filterArr([inputs[aIsReturn.input[yes]], inputs[aIsReturn.input[no]]], instance.noInputs);
                isActivateOkBtn(instance);
                return;
            }else if(aIsMail.input.includes(i)){
                //郵送・持参
                instance.noInputs = filterArr([inputs[aIsMail.input[yes]], inputs[aIsMail.input[no]]], instance.noInputs);
                isActivateOkBtn(instance);
                return;
            }else if(i === aApplicant.input){
                //申請人
                const [id, contentType] = input.value.split("_");
                inputs[aObjectId.input].value = id;
                inputs[aContentType.input].value = contentType? contentType: "";
            }
            //その共通
            const result = applicationValidation(inputs, i);
            afterValidation(result, instance.errMsgEls[i], result, input, instance);
        })
    }

    /**
     * 代理人の有無のchangeイベント
     * @param {number} idx 
     */
    function handleIsAgentChangeEvent(idx){
        const agentDiv = document.getElementById("application-section").getElementsByClassName("isAgentYesDiv")[0];
        const applicantDiv = document.getElementById("application-section").getElementsByClassName("isAgentNoDiv")[0];
        const inputs = instance.inputs;
        //代理人の有無をエラー要素から削除
        const verifiedInputs = [inputs[aIsAgent.input[yes]], inputs[aIsAgent.input[no]]];
        instance.noInputs = filterArr(verifiedInputs, instance.noInputs);
        if(idx === aIsAgent.input[yes]){
            //代理人有りのとき、代理人の氏名住所電話番号の欄を表示/申請人の電話番号欄を非表示と初期化/エラー要素を変更
            const iniEls = [inputs[aApplicantPhoneNumber.input]];
            const errEls = [inputs[aName.input], inputs[aAddress.input], inputs[aPhoneNumber.input]];
            set(applicantDiv, agentDiv, iniEls, errEls);
        }else{
            //代理人なしのとき、申請人の電話番号の欄を表示/代理人の氏名住所電話番号欄を非表示と初期化/エラー要素を変更
            const iniEls = [inputs[aName.input], inputs[aAddress.input], inputs[aPhoneNumber.input]]
            const errEls = [inputs[aApplicantPhoneNumber.input]];
            set(agentDiv, applicantDiv, iniEls, errEls);
        }

        function set(hiddenEl, displayEl, iniEls, errEls){
            hiddenEl.style.display = "none";
            iniInputsAndSelectValue(iniEls);
            instance.noInputs = filterArr(iniEls, instance.noInputs);
            slideDown(displayEl);
            errEls.forEach(x => pushInvalidEl(instance, x));
            Array.from(hiddenEl.getElementsByClassName("errorMessage")).forEach(x => x.style.display = "none");
        }
    }
}
/**
 * 申請情報欄
 */
async function setApplicationSection(){
    const applicationLength = applications.length;
    //初回表示
    if(applicationLength === 0){
        //インスタンス生成
        const application = new Application("id_application-fieldset")
        //申請人に選択肢を追加する
        const isData = application.inputs[aContentType.input].value !== "";
        addApplicantCandidates(application, isData);
        //イベントを設定
        setApplicationEvent(application);
    }else if(applicationLength === 1){
        //２回目以降
        //申請人に選択肢を追加し直す
        addApplicantCandidates(applications[0], false);
        isActivateOkBtn(applications[0]);
    }else{
        throw new Error("setApplicationSection：想定しない操作が行われました")
    }
    await scrollToTarget(Application.section);
}

/**
 * 次の項目へ進むボタンのイベント設定処理
 */
async function handleOkBtnEvent(){
    //全セクションタグに対してループ処理
    for(let i = 0, len = sections.length; i < len; i++){
        //表示対象か判別されるセクション
        const section = sections[i];
        //非表示のセクションのとき
        if (window.getComputedStyle(section).display === 'none') {
            let preSection = sections[i - 1];
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
                //土地が０のとき次のループへ
                const landCount = numberOfProperties[0].getLandCount(true);
                if(landCount === 0)
                    continue;

                await handleNOPSectionOkBtn(section, preSection);

                break;
            }else if(section.id === "house-section"){
                const NOP = numberOfProperties[0];
                //建物の数が０のとき次のループへ
                if(NOP.getHouseCount(true) === 0)
                    continue;
                NOP.getLandCount(true) === 0 ?
                    await handleNOPSectionOkBtn(section, sections[i - 2]):
                    await handlePropertySectionOkBtn(section, preSection);
                break;
            }else if(section.id === "bldg-section"){
                const NOP = numberOfProperties[0];
                const isNoHouse = NOP.getHouseCount(true) === 0;
                const isNoLand = NOP.getLandCount(true) === 0;
                //区分建物が０のとき次のループへ
                if(NOP.getBldgCount(true) === 0)
                    continue;
                const offset = isNoLand && isNoHouse ? -3 : (isNoHouse ? -2 : -1);
                isNoLand && isNoHouse ?
                    await handleNOPSectionOkBtn(section, sections[i + offset]):
                    await handlePropertySectionOkBtn(section, sections[i + offset]);
                break;
            }else if(section.id === "application-section"){
                okBtn.disabled = true;
                //不動産セクションの入力に齟齬があるときのアラートと入力修正処理
                await checkPropertySection();
                const NOP = numberOfProperties[0];
                const isNoHouse = NOP.getHouseCount(true) === 0;
                const isNoBldg = NOP.getBldgCount(true) === 0;
                const offset = isNoHouse && isNoBldg ? -3 : (isNoBldg ? -2 : -1);
                await handlePropertySectionOkBtn(section, sections[i + offset]);
                break;
            }else{
                console.error("handleOkBtnEvent:想定されていないセクションでokBtnがクリックされました");
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
    const dialogTitle = "ここでの入力内容が一部初期化されますがよろしいですか？";
    const html = "内容を確認するだけの場合は、画面左側にある進捗状況から確認したい項目をクリックしてください";
    const icon = "warning";
    showConfirmDialog(dialogTitle, html, icon).then((result) =>{
        if(result.isConfirmed){
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
    })
}

/**
 * インスタンスの未入力フィールドをチェックする
 * @param {*} instance チェックするインスタンス
 * @throws {Error} 未入力フィールドがある場合、エラーを投げる
 */
function checkNoInputs(instance){
    if(instance.noInputs.length > 0){
        if(instance instanceof NumberOfProperties && instance.noInputs.length < 3)
            return;
        throw new Error(`${instance.constructor.name}に未入力があります`);
    }
}

/**
 * エラー要素があるか判別する
 * @param {*[]} instances 
 */
function isNoInputs(instances){
    instances.forEach(x => {
        checkNoInputs(x);
        if(x instanceof Land || x instanceof House || x instanceof Bldg){
            x.tempAcquirers.forEach(y => checkNoInputs(y));
            x.tempCashAcquirers.forEach(y => checkNoInputs(y));
            if(x instanceof Bldg){
                x.sites.forEach(y => checkNoInputs(y));
            }
        }
    })
}

/**
 * ４．に進むボタンが押されたときの処理
 */
function handleSubmitBtnEvent(event){
    const spinner = document.getElementById("submitSpinner");
    try{    
        //不動産のフォーム数とインスタンス数を確定する
        confirmPropertyCount();
        //複数回submitされないようにする
        document.getElementById("submitBtn").disabled = true;
        spinner.style.display = "";
        //全てのフォームをチェック
        const instances = [decedents, registryNameAndAddresses, heirs, typeOfDivisions, numberOfProperties, lands, houses, bldgs, applications];
        instances.forEach(x => {
            if(x.length > 0)
                isNoInputs(x);
        })
        //全てのフィールドセットのdisabledをfalseに変更する
        enableAllInputsAndSelects();
    }catch(e){
        console.error(`handleSubmitBtnEvent：エラーが発生しました\n詳細：${e}`);
        event.preventDefault();
        spinner.style.display = "none";
    }

    //不動産の数を確定する
    function confirmPropertyCount(){
        const NOP = numberOfProperties[0];
        const landCount = NOP.getLandCount();
        const houseCount = NOP.getHouseCount();
        const bldgCount = NOP.getBldgCount();
        document.getElementById("id_land-TOTAL_FORMS").value = landCount;
        document.getElementById("id_house-TOTAL_FORMS").value = houseCount;
        document.getElementById("id_bldg-TOTAL_FORMS").value = bldgCount;
        document.getElementById("id_site-TOTAL_FORMS").value = String(sites.length);
        if(landCount === "0")
            lands.length = 0;
        if(houseCount === "0")
            houses.length = 0;
        if(bldgCount === "0")
            bldgs.length = 0;
    }
}

/**
 * 
 * 以下、イベントリスナー
 * 
 */
window.addEventListener("load", ()=>{
    initialize();
    disablePage(progress); // progressに応じたページの無効化
})

/**
 * 画面のサイズを変更したとき
 */
window.addEventListener('resize', () => {
    setSidebarHeight();
});

/**
 * 相続人情報の前の人に戻るボタン
 * ・前の相続人の表示処理
 */
SpouseOrAscendant.correctBtn.addEventListener("click", ()=>{
    handleHeirsCorrectEvent();
})

/**
 * 相続人情報の次の人に進むボタン
 * ・次の相続人の表示処理
 */
SpouseOrAscendant.okBtn.addEventListener("click", ()=>{
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
 * ２．に戻るボタンのクリックイベント
 */
preBtn.addEventListener("click", ()=>{
    handlePreBtnEvent();
})

/**
 * ４．に進むボタンのクリックイベント
 */

document.getElementsByTagName("form")[0].addEventListener("submit", (e)=>{
    handleSubmitBtnEvent(e);
})
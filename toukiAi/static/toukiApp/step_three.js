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
        objectId: 15
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
                i !== SpouseOrAscendant.idxs.objectId
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
                i !== SpouseOrAscendant.idxs.objectId
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
        objectId1: 17
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
                    i !== DescendantOrCollateral.idxs.objectId1
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
                    i !== DescendantOrCollateral.idxs.objectId1
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
                    i !== DescendantOrCollateral.idxs.objectId1
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
                    i !== DescendantOrCollateral.idxs.objectId1
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
        propertyAllocation:{form: 1, input:[2, 3, 4]},
        allPropertyAcquirer:{form: 2, input:5},
        cashAllocation:{form: 3, input:[6, 7, 8]},
        allCashAcquirer:{form: 4, input:9}
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) =>
            i !== TypeOfDivision.idxs.allPropertyAcquirer.input &&
            i !== TypeOfDivision.idxs.cashAllocation.input[yes] &&
            i !== TypeOfDivision.idxs.cashAllocation.input[no] &&
            i !== TypeOfDivision.idxs.cashAllocation.input[other] &&
            i !== TypeOfDivision.idxs.allCashAcquirer.input
        );
        typeOfDivisions.push(this);
    }
}

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
        document.getElementById(`${el.id}_verifyingEl`).remove();
        return false;
    }
    return true;
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
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        if(instance.constructor.name === "Decedent" || instance.constructor.name === "RegistryNameAndAddress"){
            //両方のエラー要素がないとき次の項目へボタンを有効化する
            isActivateOkBtn(decedents.concat(registryNameAndAddresses));
        }else{
            //被相続人欄又は登記簿上の氏名と住所欄以外のとき
            //エラー要素がない、かつ、最後の相続人のとき次の項目へボタンを有効化する、次の人へボタンを無効化する
            if(instance.noInputs.length === 0 && getLastElFromArray(heirs) === instance){
                okBtn.disabled = false;
            }else if(instance.noInputs.length === 0){
                heirsOkBtn.disabled = false;
            }
        }
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
        console.log(error);
    }).finally(()=>{
    });
}

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
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
        console.log(error);
    });
}

/**
 * ユーザーのデータを取得する
 */
async function loadData(){
    //被相続人データを反映
    for(let i = 0, len = decedent.inputs.length; i < len; i++){
        //データがあるとき
        if(decedent.inputs[i].value !== ""){
            //エラー要素から削除する
            decedent.noInputs = decedent.noInputs.filter(x => x.id !== decedent.inputs[i].id)
            //都道府県のとき、市区町村データを取得する
            if(i === Decedent.idxs.prefecture || i === Decedent.idxs.domicilePrefecture){
                await getCityData(decedent.inputs[i].value, decedent.inputs[i + 1], decedent);
            }
            else if(i === Decedent.idxs.city || i === Decedent.idxs.domicileCity){
                getDecedentCityData();
            }
        }
        //indexとtargetは処理不要
        if(i === Decedent.idxs.domicileCity)
            break;
    }

    //登記簿上の氏名住所のデータを反映する
    const registryNameAndAddressesCount = document.getElementsByClassName("registryNameAndAddressFieldset").length;
    //フォーム分のインスタンスを生成する（１つはすでに生成されているため1からスタート）
    for(let i = 1; i < registryNameAndAddressesCount; i++){
        new RegistryNameAndAddress(`id_registry_name_and_address-${i}-fieldset`);
    }
    //市区町村データ以外を反映させる
    for(let i = 0; i < registryNameAndAddressesCount; i++){
        for(let j = 0, len = registryNameAndAddresses[i].inputs.length; j < len; j++){
            //都道府県のとき、市区町村データを取得する
            if(j === RegistryNameAndAddress.idxs.prefecture && registryNameAndAddresses[i].inputs[RegistryNameAndAddress.idxs.prefecture].value !== "")
                await getCityData(registryNameAndAddresses[i].inputs[RegistryNameAndAddress.idxs.prefecture].value, registryNameAndAddresses[i].inputs[RegistryNameAndAddress.idxs.city], registryNameAndAddresses[i]);
            //入力データがあるとき、エラー要素から削除する
            if(registryNameAndAddresses[i].inputs[j].value !== "")
                registryNameAndAddresses[i].noInputs = registryNameAndAddresses[i].noInputs.filter(x => x.id !== registryNameAndAddresses[i].inputs[j].id)
        }
    }
    //市区町村データを反映させる
    getRegistryNameAndAddressCityData().then(data => {
        if(data.length > 0){
            for(let i = 0, len = data.length; i < len; i++){
                registryNameAndAddresses[i].inputs[RegistryNameAndAddress.idxs.city].value = data[i];
            }
            //次へボタンの表示判別
            isActivateOkBtn(decedents.concat(registryNameAndAddresses));
        }
    })
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
 * 要素の属性のナンバリングを更新する
 * @param {HTMLElement} el 
 * @param {string} attr 
 * @param {string} upAttr 
 */
function updateAttributeNumbering(el, attr, newNum){
    const currentAttr = el.getAttribute(attr);
    el.setAttribute(attr, currentAttr.replace(/\d+/g, newNum));
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
 * 生年月日と死亡年月日に矛盾がないかチェック
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
    //氏名のときは全角チェック
    if(el === decedent.inputs[Decedent.idxs.name]){
        return isOnlyZenkaku(el);
    }else if(el === decedent.inputs[Decedent.idxs.deathYear] || el === decedent.inputs[Decedent.idxs.deathMonth]){
        //死亡年月欄のとき、日数を更新して死亡年月日と生年月日の矛盾チェック
        const days = getDaysInMonth(Number(decedent.inputs[Decedent.idxs.deathYear].value.slice(0,4)), Number(decedent.inputs[Decedent.idxs.deathMonth].value));
        updateDate("id_decedent-death_date", days);
        if(checkBirthAndDeathDate(decedent) === false)
            return "死亡年月日と生年月日が矛盾してます";
    }else if(el === decedent.inputs[Decedent.idxs.birthYear] || el === decedent.inputs[Decedent.idxs.birthMonth]){
        //生年月欄のとき、日数を更新して死亡年月日と生年月日の矛盾チェック
        const days = getDaysInMonth(Number(decedent.inputs[Decedent.idxs.birthYear].value.slice(0,4)), Number(decedent.inputs[Decedent.idxs.birthMonth].value));
        updateDate("id_decedent-birth_date", days);
        if(checkBirthAndDeathDate(decedent) === false)
            return "死亡年月日と生年月日が矛盾してます";
    }else if(el === decedent.inputs[Decedent.idxs.deathDate] || el === decedent.inputs[Decedent.idxs.birthDate]){
        //死亡日又は生日のとき、死亡年月日と生年月日の矛盾チェック
        if(checkBirthAndDeathDate(decedent) === false)
            return "死亡年月日と生年月日が矛盾してます";
    }else if(el === decedent.inputs[Decedent.idxs.address] || el === decedent.inputs[Decedent.idxs.domicileAddress] || el === decedent.inputs[Decedent.idxs.bldg]){
        //住所又は本籍の町域・番地、住所の建物名のとき、空文字チェックと記号がないことをチェック
        const blankCheck = isBlank(el);
        if(blankCheck !== false) return blankCheck;
        return isSymbolIncluded(el);
    }

    return isBlank(el);
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {number} index 要素のインデックス
 * @param {elemet} el チェック対象の要素
 */
function registryNameAndAddressValidation(index, el){
    //氏名のときは全角チェック
    if(index === RegistryNameAndAddress.idxs.name){
        return isOnlyZenkaku(el);
    }else if(index === RegistryNameAndAddress.idxs.prefecture ||
        index === RegistryNameAndAddress.idxs.city){
        //都道府県又は市区町村のとき、空欄チェック
        return isBlank(el);
    }else{
        //町域・番地又は建物名のとき、空文字チェックと記号がないことをチェック
        const blankCheck = isBlank(el);
        if(blankCheck !== false) return blankCheck;
        return isSymbolIncluded(el);
    }
}

/**
 * エラー配列に対象のエラー要素がないとき追加する（オプションでボタンの無効化も可）
 * @param {Fieldset} instance 対象のインスタンス
 * @param {HTMLElement} el 対象のエラー要素
 */
function pushInvalidEl(instance, el){
    if(!instance.noInputs.some(input => input.id === el.id)){
        instance.noInputs.push(el);
        if(instance.constructor.name === SpouseOrAscendant || instance.constructor.name === DescendantOrCollateral)
            heirsOkBtn.disabled = true;
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
        if(instance.constructor.name === "Decedent" || instance.constructor.name === "RegistryNameAndAddress"){
            isActivateOkBtn(decedents.concat(registryNameAndAddresses));
        }else{
            //被相続人欄又は登記簿上の氏名と住所欄以外のとき
            //エラー要素がない、かつ、最後の相続人のとき次の項目へボタンを有効化する、次の人へボタンを無効化する
            if(instance.noInputs.length === 0 && getLastElFromArray(heirs) === instance){
                okBtn.disabled = false;
            }else if(instance.noInputs.length === 0){
                heirsOkBtn.disabled = false;
            }
        }
    }else{
        //全角ではないとき、エラー要素を追加して次の項目へボタンを無効化する
        pushInvalidEl(instance, el);
    }
}

/**
 * チェック結果に応じて処理を分岐する
 * @param {boolean or string} isValid チェック結果
 * @param {HTMLElement} errMsgEl エラーメッセージを表示する要素
 * @param {boolean or string} message エラーメッセージ
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
        //被相続人欄又は登記簿上の氏名と住所欄のとき
        if(instance.constructor.name === "Decedent" || instance.constructor.name === "RegistryNameAndAddress"){
            //両方のエラー要素がないとき次の項目へボタンを有効化する
            isActivateOkBtn(decedents.concat(registryNameAndAddresses));
        }else{
            //被相続人欄又は登記簿上の氏名と住所欄以外のとき
            //エラー要素がない、かつ、最後の相続人のとき次の項目へボタンを有効化する、次の人へボタンを無効化する
            if(instance.noInputs.length === 0 && getLastElFromArray(heirs) === instance){
                okBtn.disabled = false;
            }else if(instance.noInputs.length === 0){
                heirsOkBtn.disabled = false;
            }
        }
    }else{
        //エラーメッセージを表示する
        errMsgEl.innerHTML = message;
        errMsgEl.style.display = "block";
        //建物名以外の要素のとき
        if(!el.id.includes("bldg")){
            //配列に取得
            instance.noInputs.push(el);
            //相続人情報のとき
            if(instance.constructor.name === "SpouseOrAscendant" || instance.constructor.name === "DescendantOrCollateral")
                heirsOkBtn.disabled = true;
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
    //被相続人欄のinputにイベントを設定
    for(let i = 0, len = decedent.inputs.length; i < len; i++){
        //氏名欄のとき
        if(i === Decedent.idxs.name){
            //キーダウンイベント
            decedent.inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, decedent.inputs[i + 1]);
                //数字を無効化
                disableNumKey(e);
            })
            //inputイベント
            decedent.inputs[i].addEventListener("input", (e)=>{
                //入力文字によって
                handleFullWidthInput(decedent, decedent.inputs[i]);
            })
        }else if(i === Decedent.idxs.address ||
            i === Decedent.idxs.bldg){
            //住所の町域・番地又は住所の建物名のとき
            //キーダウンイベント
            decedent.inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, decedent.inputs[i + 1]);
            })
        }else if(i === Decedent.idxs.domicileAddress){
            //本籍の町域・番地のとき
            //キーダウンイベント
            decedent.inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, registryNameAndAddress.inputs[RegistryNameAndAddress.idxs.name]);
            })
        }

        //全入力欄にchangeイベントを設定する
        decedent.inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = decedentValidation(el);
            //チェック結果に応じて処理を分岐
            afterValidation(isValid, decedent.errMsgEls[i], isValid, el, decedent);
            //建物名のエラーメッセージを非表示にする
            if(i !== Decedent.idxs.bldg)
                decedent.errMsgEls[Decedent.idxs.bldg].style.display = "none";
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if(el === decedent.inputs[Decedent.idxs.prefecture] || el === decedent.inputs[Decedent.idxs.domicilePrefecture]){
                const val = el.value;
                await getCityData(val, decedent.inputs[i + 1], decedent);
            }
            isActivateOkBtn(decedents.concat(registryNameAndAddresses));
        })
    }
}


/**
 * 登記簿上の氏名住所にイベントを設定する
 * @param {RegistryNameAndAddress} registryNameAndAddressInstance
 */
function setRegistryNameAndAddressEvent(registryNameAndAddressInstance){
    //登記簿上の氏名住所のインスタンスの各インプット要素に対して処理
    for(let i = 0, len = registryNameAndAddressInstance.inputs.length; i < len; i++){
        if(i === RegistryNameAndAddress.idxs.name){
            //キーダウンイベント
            registryNameAndAddressInstance.inputs[i].addEventListener("keydown",(e)=>{
                //enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, registryNameAndAddressInstance.inputs[i + 1]);
                //数字を無効化
                disableNumKey(e);
            })
            //inputイベント
            registryNameAndAddressInstance.inputs[i].addEventListener("input", (e)=>{
                //入力文字によって
                handleFullWidthInput(registryNameAndAddressInstance, registryNameAndAddressInstance.inputs[i]);
                if(registryNameAndAddresses.length > 9)
                    addRegistryAddressButton.disabled = true;
                else
                    addRegistryAddressButton.disabled = registryNameAndAddressInstance.noInputs.length === 0 ? false: true;
                isActivateOkBtn(decedents.concat(registryNameAndAddresses));
            })
        }

        //全入力欄にchangeイベントを設定する
        registryNameAndAddressInstance.inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = registryNameAndAddressValidation(i, el);
            //チェック結果に応じて処理を分岐
            afterValidation(isValid, registryNameAndAddressInstance.errMsgEls[i], isValid, el, registryNameAndAddressInstance);
            //建物名のエラーメッセージを非表示にする
            if(i !== RegistryNameAndAddress.idxs.bldg)
                registryNameAndAddressInstance.errMsgEls[RegistryNameAndAddress.idxs.bldg].style.display = "none";
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if(i === RegistryNameAndAddress.idxs.prefecture){
                await getCityData(el.value, registryNameAndAddressInstance.inputs[i + 1], registryNameAndAddressInstance);
            }
            if(registryNameAndAddresses.length > 9)
                addRegistryAddressButton.disabled = true;
            else
                addRegistryAddressButton.disabled = registryNameAndAddressInstance.noInputs.length === 0 ? false: true;
            isActivateOkBtn(decedents.concat(registryNameAndAddresses));
        })
    }
}

/**
 * 次へ項目ボタンの有効化判別処理
 * @param {Fieldset[]} arr 
 */
function isActivateOkBtn(arr){
    okBtn.disabled = arr.some(item => item.noInputs.length !== 0);
}

/**
 * 増減するフォームの削除ボタンに対する処理を設定する処理
 * @param {string} className 
 * @param {Fieldset[]} arr 
 * @param {HTMLButtonElement} addBtn 
 * @param {HTMLButtonElement} removeBtn 
 */
function handleRemoveColumnButton(className, arr, addBtn, removeBtn){
    //最後の要素を削除する
    const fieldsets = document.getElementsByClassName(className);
    const lastFieldset = getLastElFromArray(fieldsets);
    lastFieldset.remove();
    arr.pop();
    getLastElFromArray(fieldsets).disabled = false;
    addBtn.disabled = false;
    //要素が１つになるとき、削除ボタンを無効化する
    if(fieldsets.length === 1)
        removeBtn.disabled = true;
    //次の項目へボタンの有効化判別処理
    isActivateOkBtn(decedents.concat(registryNameAndAddresses));
}

/**
 * 相続人情報のバリデーション
 * @param {HTMLElement} el 
 * @param {Fieldset} instance
 */
function heirsValidation(el, instance){
    //氏名又は前配偶者・異父母の氏名のとき、全角チェックの結果を返す
    if(el === instance.inputs[SpouseOrAscendant.idxs.name] || el === instance.inputs[DescendantOrCollateral.idxs.otherParentsName]){
        return isOnlyZenkaku(el);
    }else if(el === instance.inputs[SpouseOrAscendant.idxs.deathYear] || el === instance.inputs[SpouseOrAscendant.idxs.deathMonth]){
        //死亡年月欄のとき、日数を変更と死亡年月日と生年月日の矛盾チェック
        const days = getDaysInMonth(Number(instance.inputs[SpouseOrAscendant.idxs.deathYear].value.slice(0,4)), Number(instance.inputs[SpouseOrAscendant.idxs.deathMonth].value));
        updateDate(instance.inputs[SpouseOrAscendant.idxs.deathDate].id, days);
        if(checkBirthAndDeathDate(instance) === false)
            return "死亡年月日と生年月日が矛盾してます";
    }else if(el === instance.inputs[SpouseOrAscendant.idxs.birthYear] || el === instance.inputs[SpouseOrAscendant.idxs.birthMonth]){
        //生年月欄のとき、日数を更新と死亡年月日と生年月日の矛盾チェック
        const days = getDaysInMonth(Number(instance.inputs[SpouseOrAscendant.idxs.birthYear].value.slice(0,4)), Number(instance.inputs[SpouseOrAscendant.idxs.birthMonth].value));
        updateDate(instance.inputs[SpouseOrAscendant.idxs.birthDate].id, days);
        if(checkBirthAndDeathDate(instance) === false)
            return "死亡年月日と生年月日が矛盾してます";
        const result = checkBirthDate(instance);
        if(typeof result === "string")
            return result;
    }else if(el === instance.inputs[SpouseOrAscendant.idxs.deathDate] || el === instance.inputs[SpouseOrAscendant.idxs.birthDate]){
        //死亡日又は生日のとき、死亡年月日と生年月日の矛盾チェック
        if(checkBirthAndDeathDate(instance) === false)
            return "死亡年月日と生年月日が矛盾してます";
        const result = checkBirthDate(instance);
        if(typeof result === "string")
            return result;
    }else if(el === instance.inputs[SpouseOrAscendant.idxs.isAcquire[yes]]){
        //不動産取得が「はい」のとき
        //不動産を取得する人がいない旨のエラーメッセージを非表示にする
        document.getElementById("statusArea").getElementsByClassName("errorMessage")[0].style.display = "none";
        //住所入力欄を表示して、住所欄をエラー要素に追加してtrueを返す
        slideDownAndScroll(instance.fieldset.getElementsByClassName("heirsAddressDiv")[0]);
        if(instance.inputs[DescendantOrCollateral.idxs.prefecture].parentElement.style.display === "none")
            instance.noInputs = instance.noInputs.concat([instance.inputs[SpouseOrAscendant.idxs.address], instance.inputs[SpouseOrAscendant.idxs.bldg]]);
        else
            instance.noInputs = instance.noInputs.concat([instance.inputs[SpouseOrAscendant.idxs.prefecture], instance.inputs[SpouseOrAscendant.idxs.city], instance.inputs[SpouseOrAscendant.idxs.address]])
        return true;
    }else if(el === instance.inputs[SpouseOrAscendant.idxs.isAcquire[no]]){
        //不動産取得が「いいえ」のとき、住所欄を非表示にして、住所欄をエラー要素から削除してtrueを返す
        slideUp(instance.fieldset.getElementsByClassName("heirsAddressDiv")[0]);
        [
            instance.inputs[SpouseOrAscendant.idxs.prefecture],
            instance.inputs[SpouseOrAscendant.idxs.city],
            instance.inputs[SpouseOrAscendant.idxs.address],
            instance.inputs[SpouseOrAscendant.idxs.bldg]
        ].forEach(element => instance.noInputs = instance.noInputs.filter(item => item !== element));
        return true;
    }else if(el === instance.inputs[SpouseOrAscendant.idxs.address] ||
        el === instance.inputs[SpouseOrAscendant.idxs.domicileAddress] ||
        el === instance.inputs[SpouseOrAscendant.idxs.bldg]){
        //住所又は本籍の町域・番地、住所の建物名のとき、空文字チェックと記号がないことのチェック結果を返す
        const blankCheck = isBlank(el);
        if(blankCheck !== false) return blankCheck;
        return isSymbolIncluded(el);
    }

    //空欄チェックの結果を返す
    return isBlank(el);
}

/**
 * 相続人共通のイベントを設定
 * @param {Fieldset} instance //相続人のインスタンス
 */
function setHeirsEvent(instance){
    //インスタンスのinputにイベントを設定
    for(let i = 0, len = instance.inputs.length; i < len; i++){
        //相続放棄、日本在住、成人情報はイベント設定不要
        if((instance.constructor.name === "SpouseOrAscendant" && i === SpouseOrAscendant.idxs.isRefuse) ||
        (instance.constructor.name === "DescendantOrCollateral" && i === DescendantOrCollateral.idxs.isRefuse))
            return;
        //氏名欄のとき
        if(i === SpouseOrAscendant.idxs.name || i === DescendantOrCollateral.idxs.otherParentsName){
            //キーダウンイベント
            instance.inputs[i].addEventListener("keydown",(e)=>{
                if(i === SpouseOrAscendant.idxs.name){
                    //enterで死亡年欄又は生年（次の入力欄）にフォーカス移動するイベントを設定する
                    if(instance.fieldset.getElementsByClassName("heirsDeathDateDiv")[0].style.display === "none")
                        setEnterKeyFocusNext(e, instance.inputs[i + 4]);
                    else
                        setEnterKeyFocusNext(e, instance.inputs[i + 1]);
                }
                //数字を無効化
                disableNumKey(e);
            })
            //inputイベント
            instance.inputs[i].addEventListener("input", (e)=>{
                //入力文字によって
                handleFullWidthInput(instance, instance.inputs[i]);
            })
        }else if(i === SpouseOrAscendant.idxs.address || i === SpouseOrAscendant.idxs.bldg){
            //住所の町域・番地又は住所の建物名のとき
            //キーダウンイベント
            instance.inputs[i].addEventListener("keydown",(e)=>{
                //enterで次の入力欄にフォーカス移動するイベントを設定する
                setEnterKeyFocusNext(e, instance.inputs[i + 1]);
            })
        }

        //全入力欄にchangeイベントを設定する
        instance.inputs[i].addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得して各要素別のイベント設定又はバリデーションを行う
            const el = e.target;
            isValid = heirsValidation(el, instance);
            //不動産取得のラジオボタンではないとき
            if(i !== SpouseOrAscendant.idxs.isAcquire[yes] && i !== SpouseOrAscendant.idxs.isAcquire[no]){
                //チェック結果に応じて処理を分岐
                afterValidation(isValid, instance.errMsgEls[i], isValid, el, instance);
                //建物名のエラーメッセージを非表示にする
                if(i !== SpouseOrAscendant.idxs.bldg)
                    //建物名のエラーメッセージを非表示にする
                    instance.errMsgEls[SpouseOrAscendant.idxs.bldg].style.display = "none";
                if(i === SpouseOrAscendant.idxs.prefecture){
                    //住所の都道府県のとき、市町村データを取得する
                    const val = el.value;
                    await getCityData(val, instance.inputs[i + 1], instance);
                }
            }else{
                //不動産取得のラジオボタンのとき
                //エラー要素から削除
                instance.noInputs = instance.noInputs.filter(x => x.id !== instance.inputs[SpouseOrAscendant.idxs.isAcquire[yes]].id && x.id !== instance.inputs[SpouseOrAscendant.idxs.isAcquire[no]].id);
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
 * 登記簿上の氏名住所の追加ボタンのイベント設定処理
 */
function handleAddRegistryAddressButtonEvent(){
    //最後の登記上の氏名住所欄をコピーする
    const fieldsets = document.getElementsByClassName("registryNameAndAddressFieldset")
    const count = fieldsets.length;
    const copyFrom = getLastElFromArray(fieldsets);
    const clone = copyFrom.cloneNode(true);
    //コピー元のフィールドの建物名のエラー表示を非表示にする
    getLastElFromArray(registryNameAndAddresses).errMsgEls[RegistryNameAndAddress.idxs.bldg].style.display = "none";
    //属性を更新する
    clone.id = `id_registry_name_and_address-${count}-fieldset`;
    clone.querySelector("div").textContent = `（${hankakuToZenkaku(registryNameAndAddresses.length + 1)}）`

    const labels = clone.querySelectorAll("label");
    for(let i = 0, len = labels.length; i < len; i++){
        updateAttributeNumbering(labels[i], "for", String(count));
    }
    const inputs = clone.querySelectorAll("input");
    for(let i = 0, len = inputs.length; i < len; i++){
        updateAttributeNumbering(inputs[i], "id", String(count));
        updateAttributeNumbering(inputs[i], "name", String(count));
    }
    const selects = clone.querySelectorAll("select");
    for(let i = 0, len = selects.length; i < len; i++){
        updateAttributeNumbering(selects[i], "id", String(count));
        updateAttributeNumbering(selects[i], "name", String(count));
    }
    const span = clone.querySelector("span.cityEmPosition");
    updateAttributeNumbering(span, "id", String(count));

    //最後の要素の後にペーストする
    slideDown(copyFrom.parentNode.insertBefore(clone, copyFrom.nextSibling));

    //コピー元を無効化する
    copyFrom.disabled = true;

    //インスタンスを生成
    new RegistryNameAndAddress(clone.id);

    //値を初期化する
    const lastInstance = getLastElFromArray(registryNameAndAddresses);
    for(let i = 0, len = lastInstance.inputs.length; i < len; i++){
        lastInstance.inputs[i].value = "";
        if(i === RegistryNameAndAddress.idxs.city)
            lastInstance.inputs[i].disabled = true;
    }

    //生成した要素にイベントを設定
    setRegistryNameAndAddressEvent(getLastElFromArray(registryNameAndAddresses));

    //削除ボタンを有効化する
    removeRegistryAddressButton.disabled = false;

    //追加ボタンを無効化する
    addRegistryAddressButton.disabled = true;

    //次の項目へボタンを無効化する
    okBtn.disabled = true;
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

                if(heirs[i].noInputs.length === 0)
                    okBtn.disabled = false;
                else
                    okBtn.disabled = true;
            }else{
                //表示する人のnoInputsの要素数が0のときは次の人へ進むボタンを有効化する
                if(heirs[i].noInputs.length === 0)
                    heirsOkBtn.disabled = false;
                else
                    heirsOkBtn.disabled = true;
            }

            //前の人を修正するボタンが無効化されているときは、有効化する
            heirsCorrectBtn.disabled = false;

            return;
        }
    }
}

/**
 * 一つ前のセクションに戻る
 */
function backToPreSection(){
    //全セクションタグを取得して最後の要素からループ処理
    const sections = document.getElementsByTagName("section");
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
            Array.from(fieldsets).forEach(fieldset => fieldset.disabled = false);
            okBtn.disabled = false;
            statusText.textContent = "現在１／５項目";
            if(i === 1) correctBtn.disabled = true;
            if(i === sections.length - 1) submitBtn.disabled = true;
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
    preSectionFieldsets.forEach(fieldset => fieldset.disabled = true);
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
    combined.forEach(item => {
        section.insertBefore(item.element, toggleBtn);
    });
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
        //全フィールドセットを取得してループ処理
        sortChildHeirsFieldset(section);
        const fieldsets = section.getElementsByTagName("fieldset");
        //子の配偶者と孫のフィールドセットを並び替え
        for(let i = 0, len = fieldsets.length; i < len; i++){
            //被相続人の配偶者のとき
            if(fieldsets[i].id.includes("decedent_spouse")){
                new SpouseOrAscendant("id_decedent_spouse-fieldset");
            }else if(fieldsets[i].id.includes("id_child-")){
                //子のとき
                const count = heirs.filter(item => item instanceof DescendantOrCollateral).length;
                new DescendantOrCollateral(`id_child-${count}-fieldset`);
            }else if(fieldsets[i].id.includes("id_child_spouse-")){
                //子の配偶者のとき
                const count = heirs.filter(item => item instanceof SpouseOrAscendant && item.fieldset.id.includes("id_child_spouse-")).length;
                new SpouseOrAscendant(`id_child_spouse-${count}-fieldset`);
            }else if(fieldsets[i].id.includes("id_grand_child-")){
                //孫のとき
                const count = heirs.filter(item => item instanceof DescendantOrCollateral && item.fieldset.id.includes("id_grand_child-")).length;
                new DescendantOrCollateral(`id_grand_child-${count}-fieldset`);
            }else if(fieldsets[i].id.includes("id_ascendant-")){
                //尊属のとき
                const count = heirs.filter(item => item instanceof SpouseOrAscendant && item.fieldset.id.includes("id_ascendant-")).length;
                new SpouseOrAscendant(`id_ascendant-${count}-fieldset`);
            }else if(fieldsets[i].id.includes("id_collateral-")){
                //兄弟姉妹のとき
                const count = heirs.filter(item => item instanceof DescendantOrCollateral && item.fieldset.id.includes("id_collateral-")).length;
                new DescendantOrCollateral(`id_collateral-${count}-fieldset`);
            }
            setHeirsEvent(heirs[i]);

            //最初の人以外は非表示にする
            if(i > 0) fieldsets[i].style.display = "none";
        }
        //次の項目へボタンを無効化する
        okBtn.disabled = true;
    }else{
        //次の項目へボタンの有効化判別
        const allNoInputsEmpty = heirs.every(heir => heir.noInputs.length === 0);
        if (allNoInputsEmpty)
            okBtn.disabled = false;
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
            if(heirs[i].inputs[SpouseOrAscendant.idxs.isAcquire[yes]].value === "true"){
                return true;
            }
        }else if(heirs[i].constructor.name === "DescendantOrCollateral"){
            if(heirs[i].inputs[DescendantOrCollateral.idxs.isAcquire[yes]].value === "true"){
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
 * 全て取得する人の選択肢に名前を追加する
 * @param {TypeOfDivision} instance 
 */
function addNameToAcquirerSelect(instance){
    const allPropertyAcquirer = instance.inputs[TypeOfDivision.idxs.allPropertyAcquirer.input];
    const allCashAcquirer = instance.inputs[TypeOfDivision.idxs.allCashAcquirer.input];

    function addOptionIfAcquirer(heir, idxs) {
        if(heir.inputs[idxs.isAcquire[yes]].checked){
            const option = document.createElement("option");
            option.value = heir.inputs[idxs.name].value;
            option.text = heir.inputs[idxs.name].value;
            allPropertyAcquirer.add(option);
            const option2 = document.createElement("option");
            option2.value = heir.inputs[idxs.name].value;
            option2.text = heir.inputs[idxs.name].value;
            allCashAcquirer.add(option2);
        }
    }

    heirs.forEach(heir => {
        if(heir.constructor.name === "SpouseOrAscendant"){
            addOptionIfAcquirer(heir, SpouseOrAscendant.idxs);
        }else if(heir.constructor.name === "DescendantOrCollateral"){
            addOptionIfAcquirer(heir, DescendantOrCollateral.idxs);
        }
    })
}


/**
 * 遺産分割の方法セクションのchangeインベントを設定する
 * @param {TypeOfDivision} instance 
 * @param {number} i 
 */
function setChangeEventToTypeOfDivision(instance, i){
    const idxs = TypeOfDivision.idxs;
    const inputs = instance.inputs;
    //遺産分割の方法のとき
    if(idxs.typeOfDivision.input.includes(i)){
        //不動産の取得方法欄が表示されてないときは表示する
        slideDownIfHidden(instance.Qs[idxs.propertyAllocation.form]);
        //通常のとき
        if(i === idxs.typeOfDivision.input[yes]){
            //金銭取得方法欄が表示されているとき
            if(instance.Qs[idxs.cashAllocation.form].style.display !== "none"){
                //金銭取得方法欄と金銭を一人が全て取得する場合の欄を非表示かつボタンを初期化する
                slideUp(instance.Qs[idxs.cashAllocation.form]);
                uncheckTargetElements(inputs[idxs.cashAllocation.input], [yes, no, other]);
                slideUp(instance.Qs[idxs.allCashAcquirer.form]);
                inputs[idxs.allCashAcquirer.input].value = "";
                //エラー要素から金銭取得関連を削除
                instance.noInputs = instance.noInputs.filter(x => 
                    x !== inputs[idxs.cashAllocation.input[yes]] && x !== inputs[idxs.cashAllocation.input[no]] &&
                    x !== inputs[idxs.cashAllocation.input[other]] && x !== inputs[idxs.allCashAcquirer.input])
            }
            //次へ進むボタンの有効化判別
            okBtn.disabled = instance.noInputs.length === 0 ? false: true;
        }else{
            //換価分割のとき
            //全不動産を取得する人が選択されている、不動産取得方法欄で法定相続又はその他が選択されているとき
            if(inputs[idxs.allPropertyAcquirer.input].value !== "" || inputs[idxs.propertyAllocation.input[no]].checked ||
                inputs[idxs.propertyAllocation.input[other]].checked){
                //金銭取得方法欄を表示する
                slideDownAndScroll(instance.Qs[idxs.cashAllocation.form]);
                //金銭取得方法欄のinputをエラー要素に追加して次の項目へボタンを無効化する
                pushInvalidEl(instance, inputs[idxs.cashAllocation.input[yes]])
            }
        }
    }else if(idxs.propertyAllocation.input.includes(i)){
        //不動産の分配方法のとき
        //一人が取得するとき、全取得者欄を表示してエラー要素に追加する
        if(inputs[idxs.propertyAllocation.input[yes]].checked){
            slideDownAndScroll(instance.Qs[idxs.allPropertyAcquirer.form]);
            pushInvalidEl(instance, inputs[idxs.allPropertyAcquirer.input]);
        }else{
            //法定相続又はその他のとき
            //通常分割のとき
            if(instance.Qs[idxs.allPropertyAcquirer.form].style.display !== "none"){
                slideUp(instance.Qs[idxs.allPropertyAcquirer.form]);
                instance.Qs[idxs.allPropertyAcquirer.input].value = "";
                instance.noInputs = instance.noInputs.filter(x => x !== instance.Qs[idxs.allPropertyAcquirer.input]);
            }
            if(inputs[idxs.typeOfDivision.input[yes]].checked){
                //エラー要素を削除して次の項目へボタンを有効化する
                instance.noInputs.length = 0;
                okBtn.disabled = false;
            }else if(inputs[idxs.typeOfDivision.input[no]].checked){
                //換価分割のとき、金銭の分配方法欄を表示してエラー要素に追加
                slideDownIfHidden(instance.Qs[idxs.propertyAllocation]); 
                if([yes, no, other].every(idx => !inputs[idxs.cashAllocation.input[idx]].checked)){
                    pushInvalidEl(instance, inputs[idxs.cashAllocation.input[yes]]);
                }
            }
        }
    }else if(i === idxs.allPropertyAcquirer.input){
        //全不動産の取得者のとき
        //取得車が選択されているとき
        if(inputs[idxs.allPropertyAcquirer.input].value !== ""){
            //通常分割のとき、エラー要素を削除して次の項目へボタンを有効化する
            if(inputs[idxs.typeOfDivision.input[yes]].checked){
                instance.noInputs.length = 0;
                okBtn.disabled = false;
            }else if(inputs[idxs.typeOfDivision.input[no]].checked){
                //換価分割のとき、金銭の分配方法欄を表示してエラー要素に追加
                slideDownIfHidden(instance.Qs[idxs.cashAllocation.form]);
                pushInvalidEl(instance, inputs[idxs.cashAllocation.input[yes]]);
            }
        }else{
            //選択されていないとき
            if(instance.Qs[idxs.allCashAcquirer.form].style.display !== "none")
                slideUp(instance.Qs[idxs.allCashAcquirer.form]);
            if(instance.Qs[idxs.cashAllocation.form].style.display !== "none")
                slideUp(instance.Qs[idxs.cashAllocation.form]);
            pushInvalidEl(instance, inputs[idxs.allPropertyAcquirer.input]);
        }
    }else if(idxs.cashAllocation.input.includes(i)){
        //金銭の分配方法のとき
        //一人が取得するとき、全取得欄を表示してエラー要素を追加する
        if(inputs[idxs.cashAllocation.input[yes]].checked){
            slideDownAndScroll(instance.Qs[idxs.allCashAcquirer.form]);
            pushInvalidEl(inputs[idxs.allCashAcquirer.input]);
        }else{
            //法定相続又はその他のとき、全取得欄を非表示にして初期化、エラー要素を削除して次の項目へボタンを有効化する
            if(instance.Qs[idxs.allCashAcquirer.form].style.display !== "none"){
                slideUp(instance.Qs[idxs.allCashAcquirer.form]);
                inputs[idxs.allCashAcquirer.input].value = "";
            }
            instance.noInputs.length = 0;
            okBtn.disabled = false;
        }
    }else if(i === idxs.allCashAcquirer.input){
        //全金銭の取得者のとき、取得車が選択されたら次へ進むボタンを有効化、されなかったら無効化
        if(inputs[i].value !== ""){
            instance.noInputs.length = 0;
            okBtn.disabled = false;
        }else{
            pushInvalidEl(instance, inputs[i])
        }
    }
}

/**
 * 遺産分割方法セクションを表示する
 */
function setTypeOfDivisionSection(){
    if(typeOfDivisions.length === 0){
        //インスタンス生成
        const instance = new TypeOfDivision("id_type_of_division-0-fieldset");
        //取得者をselectに追加する
        addNameToAcquirerSelect(instance);
        //イベントを設定
        for(let i = 0, len = instance.inputs.length; i < len; i++){
            instance.inputs[i].addEventListener("change", (e)=>{
                setChangeEventToTypeOfDivision(instance, i);
            })
        }
        //次の項目へ進むボタンを無効化する
        okBtn.disabled = true;
    }else{
        //取得者をselectに追加する
        addNameToAcquirerSelect(instance);

        //入力状況に応じて次の項目へ進むボタンを有効化又は無効化する
        if(typeOfDivisions[0].noInputs.length === 0)
            okBtn.disabled = false;
        else
            okBtn.disabled = true;
    }
}

/**
 * 不動産の数のセクションのイベントをセットする
 */
function setPropertyCountSection(){

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
            }else if(sections[i].id === "property-count-section"){
                handleOkBtnEventCommon(sections[i], sections[i - 1], 4);
                setPropertyCountSection();
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
    handleRemoveColumnButton("registryNameAndAddressFieldset", registryNameAndAddresses, addRegistryAddressButton, removeRegistryAddressButton);
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
    backToPreSection();
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

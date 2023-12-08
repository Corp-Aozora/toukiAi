"use strict";

/**
 * @typedef {Decedent|EveryPerson} EveryPerson
 * @typedef {Decedent|Spouse|Child|ChildSpouse|GrandChild|Ascendant|Collateral} EveryPersonButCommon
 */
/**
    変数
*/
//この章の入力状況欄
class Guide{
    static btns = [document.querySelector(".guideBtn")];
    static guides = [document.querySelector(".guide")];
    static caretIcons = [document.querySelector(".guideCaret")];
    static checkIcons = [];
    static elIdx = 0;
}

class Person{
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        this.fieldset = document.getElementById(fieldsetId);
        this.Qs = Array.from(this.fieldset.getElementsByClassName("Q"));
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
        this.preBtn = this.fieldset.getElementsByClassName("preBtn")[0];
        this.nextBtn = this.fieldset.getElementsByClassName("nextBtn")[0];
        this.errMsgEls = Array.from(this.fieldset.getElementsByClassName("errorMessage"));
        this.noInputs = Array.from(this.fieldset.getElementsByTagName("input"));
    }
}

//被相続人
const decedents = [];
class Decedent extends Person{
    //入力欄のインデックス
    static idxs = {
        name : 0,
        deathYear : 1,
        deathMonth : 2,
        prefecture : 3,
        city : 4,
        domicilePrefecture : 5,
        domicileCity : 6,
        index : 7,
        target : 8,
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
        this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
            (_, i) => i !== Decedent.idxs.deathYear && i != Decedent.idxs.index && i !== Decedent.idxs.target
        );
        this.inputs[Decedent.idxs.index].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        this.inputs[Decedent.idxs.target].value = "";
        decedents.push(this);
    }
}
const decedent = new Decedent("id_decedent-0-fieldset");

//配偶者
const spouses = [];
class Spouse extends Person{
    //入力欄のインデックス
    static idxs = {
        name : {form: 0, input:0},
        isExist : {form: 1, input: [1, 2]},
        isLive : {form:2, input: [3, 4]},
        isRemarriage : {form: 3, input: [5, 6]},
        isStepChild : {form: 4, input: [7, 8]},
        isRefuse : {form: 5, input: [9, 10]},
        isJapan : {form: 6, input: [11, 12]},
        index : {form: 7, input: 13},
        target : {form: 8, input: 14}
    }
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = this.noInputs.filter((_, i) => i !== Spouse.idxs.index.input && i !== Spouse.idxs.target.input);
        this.inputs[Spouse.idxs.index.input].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        this.inputs[Spouse.idxs.target.input].value = decedent.inputs[Decedent.idxs.index].value.trim();
        if(this.constructor === Spouse)
            spouses.push(this);
    }
}
const spouse = new Spouse("id_spouse-0-fieldset");

//子供共通
const childCommons = [];
class ChildCommon extends Person{
    //入力欄のインデックス
    static idxs = {
        isExist:{ form: 0, input: [0, 1] },
        count:{ form: 1, input: 2 },
        isSameParents:{ form: 2, input: [3, 4] },
        isLive:{ form: 3, input: [5, 6] },
        isRefuse:{ form: 4, input: [7, 8] },
        isAdult:{ form: 5, input: [9, 10] },
        isJapan:{ form: 6, input: [11, 12] }
    }
    constructor(fieldsetId){
        super(fieldsetId);
        childCommons.push(this);
    }
}
const childCommon = new ChildCommon("id_child_common-0-fieldset");

//子
const childs = [];
class Child extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameParents:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        count:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]},
        index : {form: 10, input: 18},
        target1 : {form: 11, input: 19},
        target2 : {form: 12, input: 20},
    }
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = this.noInputs.filter((_, i) => i !== Child.idxs.index.input && i !== Child.idxs.target1.input && i !== Child.idxs.target2.input);
        this.inputs[Child.idxs.index.input].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        this.inputs[Child.idxs.target1.input].value = decedent.inputs[Decedent.idxs.index].value.trim();
        if(this.constructor === Child)
            childs.push(this);
    }
}

//子の配偶者
const childSpouses = [];
class ChildSpouse extends Spouse{
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = this.noInputs.filter((_, i) => i !== ChildSpouse.idxs.index.input && i !== ChildSpouse.idxs.target.input);
        this.successFrom;
        this.inputs[ChildSpouse.idxs.index.input].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        childSpouses.push(this);
    }
}

//子の子（孫）
const grandChilds = [];
class GrandChild extends Child{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameParents:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        isAdult:{form: 7, input: [13, 14]},
        isJapan:{form: 8, input: [15, 16]},
        index : {form: 9, input: 17},
        target1 : {form: 10, input: 18},
        target2 : {form: 11, input: 19},
    }
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = this.noInputs.filter((_, i) => i !== GrandChild.idxs.index.input && i !== GrandChild.idxs.target1.input && i !== GrandChild.idxs.target2.input);
        this.successFrom;
        this.inputs[GrandChild.idxs.index.input].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        grandChilds.push(this);
    }
}

//尊属
const ascendants = [];
class Ascendant extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isLive:{form: 1, input: [1, 2]},
        isExist:{form: 2, input: [3, 4]},
        isRefuse:{form: 3, input: [5, 6]},
        isSpouse:{form: 4, input: [7, 8]},
        isRemarriage:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        isJapan:{form: 7, input: [13, 14]},
        index : {form: 8, input: 15},
        target : {form: 9, input: 16}
    }
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = this.noInputs.filter((_, i) => i !== Ascendant.idxs.index.input && i !== Ascendant.idxs.target.input);
        this.inputs[Ascendant.idxs.index.input].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        ascendants.push(this);
    }
}

//兄弟姉妹共通
const collateralCommons = [];
class CollateralCommon extends Person{
    //入力欄のインデックス
    static idxs = {
        isExist:{ form: 0, input: [0, 1] },
        count:{ form: 1, input: 2 },
        isSameParents:{ form: 2, input: [3, 4] },
        isLive:{ form: 3, input: [5, 6] },
        isRefuse:{ form: 4, input: [7, 8] },
        isAdult:{ form: 5, input: [9, 10] },
        isJapan:{ form: 6, input: [11, 12] }
    }
    constructor(fieldsetId){
        super(fieldsetId);
        collateralCommons.push(this);
    }
}

//兄弟姉妹
const collaterals = [];
class Collateral extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameParents:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        isAdult:{form: 7, input: [13, 14]},
        isJapan:{form: 8, input: [15, 16]},
        index : {form: 9, input: 17},
        target1 : {form: 10, input: 18},
        target2 : {form: 11, input: 19},
    }
    constructor(fieldsetId){
        super(fieldsetId);
        this.noInputs = this.noInputs.filter((_, i) => i !== Collateral.idxs.index.input && i !== Collateral.idxs.target1.input && i !== Collateral.idxs.target2.input);
        this.inputs[Collateral.idxs.index.input].value = this.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent.split("．")[0].trim();
        this.inputs[Collateral.idxs.target1.input].value = decedent.inputs[Decedent.idxs.index].value.trim();
        collaterals.push(this);
    }
}

//入力が必要な人
const reqPerson = [decedent];
//次へボタンのイベントハンドラー
let oneStepFowardHandler;
//子の数をカウントする
let countChild = () => parseInt(childCommon.inputs[ChildCommon.idxs.count.input].value);
//兄弟姉妹の数をカウントする
let countCollateral = () => parseInt(collateralCommons[0]?.inputs[CollateralCommon.idxs.count.input].value);

/**
 * fieldset又はガイドのタイトル変更クラス
 */
class UpdateTitle{
    /**
     * 子個人又は兄弟姉妹個人専用（枝番と続柄のインデックスを更新する）
     * 
     * 「１－１．（続柄）１について」を「１－２．（続柄）２について」に変換する
     * @param {HTMLElement} titleEl タイトル要素
     * @param {string} zokugara 続柄（"子"又は"兄弟姉妹"）
     */
    static childOrCollateral(titleEl, zokugara){
        const oldNumbering = getTitleNumbering(titleEl); //旧ナンバリングを取得する
        const idx = oldNumbering.lastIndexOf("－"); //－のインデックスを取得する
        const oldBranchNum = oldNumbering.slice(idx + 1); //枝番を取得する
        const newBranchNum = parseInt(ZenkakuToHankaku(oldBranchNum)) + 1; //枝番に１加算する
        const newNumbering = oldNumbering.slice(0, idx + 1) + hankakuToZenkaku(String(newBranchNum)); //枝番を更新したナンバリングを取得する
        const newTitle = `${newNumbering}．${zokugara}${hankakuToZenkaku(String(newBranchNum))}について`; //枝番と続柄のインデックスを更新したタイトルを取得する
        titleEl.textContent = newTitle; //新しいタイトルに上書きする
    }
    /**
     * 子の配偶者又は孫専用（本番と枝番を更新する、孫のときは、続柄のインデックスも更新する）
     * @param {HTMLElement} titleEl タイトル要素
     * @param {Child} child 被相続人の子（子の配偶者から見ると配偶者）
     * @param {string} zokugara 「配偶者」又は「子」のどちらか
     * @param {number} successFromIdx 数次相続のインデックス（タイトルの本番部分の更新のため）
     * @param {number} childsHeirIdx 数次相続の相続人のインデックス（タイトルの枝番部分の更新のため）
     */
    static childsHeirs(titleEl, child, zokugara, successFromIdx, childsHeirIdx){
        const childNum = 4;
        const newMainNum = hankakuToZenkaku(String(childNum + successFromIdx));
        const newBranchNum = hankakuToZenkaku(String(childsHeirIdx));
        const newTitle = `${newMainNum}－${newBranchNum}．${child.inputs[Child.idxs.name.input].value}の${zokugara}について`
        titleEl.textContent = newTitle;
    }
    /**
     * 全尊属の欄の本番と枝番を一括更新する（父欄を表示するとき用）
     * 
     * 「（変更後の数字）－１．父について」「（変更後の数字）－２．母について」...に変更する
     * @param {ChildCommon|Child} fromPerson 一つ前の人
     * @param {boolean} isFieldset fieldsetのタイトル変更フラグ（falseのときはガイドのタイトルを変更する）
     */
    static ascendants(fromPerson, isFieldset){
        const els = isFieldset ? 
            document.getElementsByClassName("ascendantFieldset"):
            document.getElementsByClassName("ascendantGuide");
        const zokugara = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"];
        const preTitle = fromPerson.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
        const preMainNum = preTitle.replace(/\n/g, "").replace(/\s/g, "").split("－")[0];
        const preNum = parseInt(ZenkakuToHankaku(preMainNum));
        const newNum = hankakuToZenkaku(String(preNum + 1));
        for(let i = 0, len = els.length; i < len; i++){
            const titleEl = isFieldset ?
                els[i].getElementsByClassName("fieldsetTitle")[0]:
                els[i].getElementsByTagName("button")[0];
            const newTitle = `${newNum}－${hankakuToZenkaku(String(i + 1))}．${zokugara[i]}について`;
            titleEl.textContent = newTitle;
        }
    }
    /**
     * 母欄から母方の祖父欄を表示するとき（枝番を更新する）
     * 
     * 「（本番）－（変更後の数字）．母方の祖父について」、「（本番）－（変更後の数字）．母方の祖母について」に変換する
     * @param {boolean} isFieldset fieldsetのタイトル変更フラグ（falseのときはガイドのタイトルを変更する）
     */
    static motherGparents(isFieldset){
        const els = ["id_ascendant-4-fieldset", "id_ascendant-5-fieldset"].map(id => 
            isFieldset ?
                document.getElementById(id) :
                document.getElementsByClassName("motherGGuide")[id === "id_ascendant-4-fieldset" ? 0 : 1]
        );
        const zokugara = ["母方の祖父", "母方の祖母"];
        for(let i = 0, len = els.length; i < len; i++){
            const titleEl = isFieldset?
                els[i].getElementsByClassName("fieldsetTitle")[0]:
                els[i].getElementsByTagName("button")[0];
            const oldNumbering = getTitleNumbering(titleEl);
            const idx = oldNumbering.lastIndexOf("－");
            const newNumbering = oldNumbering.slice(0, idx + 1) + hankakuToZenkaku(String(ascendants.length - 1 + i));
            const newTitle = `${newNumbering}．${zokugara[i]}について`;
            titleEl.textContent = newTitle;
        }
    }
    /**
     * 兄弟姉妹共通、兄弟姉妹１のタイトルを変更（本番を変更する）
     * @param {EveryPerson} fromPerson 
     * @param {EveryPerson} nextPerson 
     * @param {string} zokugara 
     */
    static collateralCommonFieldsetOrFirstCollateralFieldset(fromPerson, nextPerson, zokugara){
        const preTitle = fromPerson.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
        const preTitleMainNum = preTitle.replace(/\n/g, "").replace(/\s/g, "").split("－")[0];
        const newTitleMainNum = hankakuToZenkaku(String(parseInt(ZenkakuToHankaku(preTitleMainNum)) + 1));
        const newTitle = `${newTitleMainNum}－１．${zokugara}について`
        nextPerson.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent = newTitle;
    }

    /**
     * 兄弟姉妹共通ガイドのタイトルを変更する（フィールドセットと同期する）
     * @param {HTMLElement} guideList 
     */
    static collateralCommonGuide(guideList){
        const newTitle = getLastElFromArray(reqPerson).fieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
        guideList.getElementsByClassName("collateralCommonGuide")[0].getElementsByTagName("button")[0].textContent = newTitle;
    }
}

/**
 * ロード時の初期処理
 * ・サイドバーを更新する
 * ・被相続人の入力欄のエラー要素を取得する（死亡年はnullになることがないため除く）
 */
function initialize(){
    updateSideBar();
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
        document.getElementById(`${el.id}_verifyingEl`).remove();
        return false;
    }
    return true;
}

/**
 * 選択された都道府県に存在する市区町村を取得する
 * @param {string} val 都道府県欄の値
 * @param {HTMLElement} el 市区町村欄
 * @returns 
 */
function getCityData(val, el){
    //未選択のとき、市町村データを全て削除して無効化する
    if(!checkPrefecture(val, el))
        return;
    //エラー要素から都道府県を削除する
    decedent.noInputs = decedent.noInputs.filter(x => x.id !== el.id);
    //市区町村欄を有効化してフォーカスを移動する
    el.disabled = false;
    el.focus();
    //データ取得中ツールチップを表示する
    const verifyingEl = `<span id="${el.id}_verifyingEl" class="verifying emPosition">
    市区町村データ取得中
    <div class="spinner-border text-white spinner-border-sm" role="status">
    </div>
    </span>`;
    el.insertAdjacentHTML('afterend', verifyingEl);
    //都道府県に紐づく市区町村データを取得して表示できるようにする
    const url = 'get_city';
    fetch(url, {
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
            decedent.noInputs.push(el);
        }
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        //次へボタンの表示判別
        decedent.nextBtn.disabled = decedent.noInputs.length === 0 ? false: true;
    });
}

/**
 * 人のデータを変数に代入する
 * @param {EveryPerson} person  
 * @returns 変数化した人のデータ
 */
function personDataToVariable(person){
    return{
        fieldset : person.fieldset,
        Qs : person.Qs,
        inputs : person.inputs,
        preBtn : person.preBtn,
        nextBtn : person.nextBtn,
        errMsgEls : person.errMsgEls,
        noInputs : person.noInputs
    }
}

/**
 * 対象の要素の属性値を変更する
 * @param {string[]|string} attributes 変更対象の属性（複数可）
 * @param {HTMLElement} el 変更対象の要素
 * @param {number} newVal 置き換える値
 * @param {number} oldVal 置き換える対象の値
 */
function updateAttribute(attributes, el, newVal, oldVal){
    if(!Array.isArray(attributes))
        attributes = [attributes];
    attributes.forEach(attribute => {
        const oldAttribute = el.getAttribute(attribute);
        if(oldAttribute){
            const newAttribute = oldAttribute.replace(oldVal, newVal);
            el.setAttribute(attribute, newAttribute);
        }
    });
}

/**
 * タイトルのナンバリング（「本番－枝番」の部分）を取得する
 * @param {HTMLElement} titleEl タイトル要素
 * @returns タイトルのナンバリング
 */
function getTitleNumbering(titleEl){
    const title = titleEl.textContent;
    const removedSpace = title.replace(/\n|\s/g, "");
    return removedSpace.split("．")[0];
}

/**
 * クローンで生成した子個人又は兄弟姉妹個人のfieldsetの属性値を更新する
 * @param {HTMLElement} fieldset 属性を更新する対象のfieldset
 * @param {string} relation 続柄（"child"又は"collateral"）
 * @param {number} newIdx 属性を更新する対象の人の続柄インデックス（例：子１のときは１）
 */
function updateCloneAttribute(fieldset, relation, newIdx){
    //fieldsetのidを変更
    fieldset.id = `id_${relation}-${newIdx}-fieldset`;
    //氏名のlabelのforを変更
    fieldset.querySelector("label").setAttribute("for", `id_${relation}-${newIdx}-name`);
    //inputとbuttonのname、id、tabindexを変更する
    let newTabindex = parseInt(getLastElByAttribute("nextBtn", "class", fieldset).getAttribute("tabindex")) + 1;
    const els = fieldset.querySelectorAll("input, button");
    for(let i = 0, len = els.length; i < len; i++){
        if(els[i].tagName.toLowerCase() === "input")
            updateAttribute(["name", "id"], els[i], newIdx, /\d+/);
        els[i].setAttribute("tabindex", newTabindex + i);
    }
}

/**
 * 直前のfieldsetをコピーしてタイトルや属性値を変更する（子個人又は兄弟姉妹個人を生成するとき専用）
 * @param {HTMLElement} preEl コピー元になる１つ前のfieldset
 * @param {boolean} isChild 続柄（"child"又は"collateral"）
 * @param {number} newIdx 属性に付与する新しいインデックス
 * @returns コピー元のタイトルと属性値を変更した後の新しいfieldset
 */
function cloneAndUpdateFieldset(preEl, isChild, newIdx){
    const newFieldset = preEl.cloneNode(true);
    const titleEl = newFieldset.querySelector(".fieldsetTitle");
    const zokugara = isChild? "子": "兄弟姉妹";
    const relation = isChild? "child": "collateral";
    updateCloneAttribute(newFieldset, relation, newIdx);
    UpdateTitle.childOrCollateral(titleEl, zokugara);

    return newFieldset;
}

/**
 * 子個人又は兄弟姉妹個人のfieldsetを生成する
 * @param {boolean} isChild 子フォームの生成か兄弟姉妹フォームの生成か判別する用
 */
function createChildOrCollateralFieldset(isChild){
    //生成するフォームを判別
    const relation = isChild ? "child": "collateral";
    //formsetの数を１加算する
    const totalForms = document.getElementById(`id_${relation}-TOTAL_FORMS`);
    const oldCount = parseInt(totalForms.value);
    totalForms.value = oldCount + 1;
    //直前のfieldsetをコピーしてidを変更
    const preFieldset = getLastElByAttribute(`${relation}Fieldset`, "class");
    const newFieldset = cloneAndUpdateFieldset(preFieldset, isChild, oldCount);
    //新しいfieldsetをコピー元の次に挿入する
    preFieldset.after(newFieldset);
}

/**
 * 次のfieldsetを表示する
 * @param {HTMLElement} nextFieldset 表示するfieldset
 */
function displayNextFieldset(nextFieldset){
    //次のfieldsetを表示/hrを挿入/次のfieldsetにスクロール/最初の入力欄にフォーカス
    slideDown(nextFieldset);
    const hr = document.createElement("hr");
    hr.className = "my-5";
    nextFieldset.before(hr);
    scrollToTarget(nextFieldset);
    nextFieldset.querySelector("input").focus();
}

/**
 * ガイドを押したら対象のfieldsetにスクロールするイベントを設定する
 * @param {event} e クリックイベント
 */
function scrollToTargetHandler(e){
    const idx = Guide.btns.indexOf(e.target);
    scrollToTarget(reqPerson[idx].fieldset, 0);
}

/**
 * 次のガイド要素を取得して強調する（事前にGuide.elIdxの加算をすること）
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function activeGuide(guideList){
    const nextGuide = guideList.getElementsByClassName("guide")[Guide.elIdx];
    const nextBtn = guideList.getElementsByClassName("guideBtn")[Guide.elIdx];
    const nextCaretIcon = guideList.getElementsByClassName("guideCaret")[Guide.elIdx];
    Guide.guides.push(nextGuide);
    Guide.btns.push(nextBtn);
    Guide.caretIcons.push(nextCaretIcon);
    if(window.getComputedStyle(nextGuide).display === "none")
        nextGuide.style.display = "block";
    nextGuide.classList.add("active");
    nextBtn.disabled = false;
    nextCaretIcon.style.display = "inline-block";
}

/**
 * 完了したfieldsetのガイドを通常表示にする
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function inactiveGuide(guideList){
    getLastElFromArray(Guide.guides).classList.remove("active");
    getLastElFromArray(Guide.caretIcons).style.display = "none";
    Guide.checkIcons.push(guideList.getElementsByClassName("guideCheck")[Guide.elIdx]);
    getLastElFromArray(Guide.checkIcons).style.display = "inline-block";
}

/**
 * 子個人又は兄弟姉妹個人のガイドを生成/タイトル変更/ガイドを表示/idを変更/１つ前のガイドの次に挿入する
 * @param {string} relation 続柄（child又はcollateral）
 * @param {number} idx 続柄インデックス（例：子１のときは１）
 */
function createChildOrCollateralGuide(relation, idx){
    const zokugara = relation === "child" ? "子": "兄弟姉妹";
    //直前のガイドをコピー
    const copyFrom = getLastElByAttribute(`${relation}Guide`, "class");
    const clone = copyFrom.cloneNode(true);
    //タイトルの枝番を変更
    UpdateTitle.childOrCollateral(clone.querySelector("button"), zokugara);
    //idを変更して非表示から表示に変更して最後の要素の次に挿入する
    clone.style.display = "block";
    clone.id = `id_${relation}-${idx}-guide`;
    copyFrom.after(clone)
}

/**
 * 子のガイドの数を追加又は削除する/追加のときは、タイトルとidを変更して表示する/全ての子を表示する
 * @param {string} relation 続柄（child又はcollateral）
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {number} oldCount 初期値である１又は前に入力された子の人数
 * @param {number} newCount 新たに入力された子の人数
 */
function adjustChildGuideCount(relation, guideList, oldCount, newCount){
    const guides = Array.from(guideList.getElementsByClassName(`${relation}Guide`));
    //子が増えたとき、増えた分のガイドを生成する
    if(newCount > oldCount){
        for(let i = oldCount; i < newCount; i ++){
            createChildOrCollateralGuide(relation, i);
        }
    }else if(newCount < oldCount){
        //子が減ったとき、減った分の子のガイドを削除する
        guides.slice(newCount).forEach(el => el.parentNode.removeChild(el));
    }
    //子のガイドが２つ以上あるとき、子１以外のガイドも表示する
    if(guides.length > 1)
        displayAdditionalGuide(guideList, `.${relation}Guide`);
}

/**
 * 子の配偶者と孫のガイド両方を生成して属性値も更新する
 */
function createChildsHeirGuides(){
    const childsHeirInstances = childSpouses.concat(grandChilds); //子の配偶者と孫のインスタンスを結合する
    childsHeirInstances.sort((a, b) => childs.indexOf(a.successFrom) - childs.indexOf(b.successFrom)); //子の相続人を子のインデックス順にソートする
    let guideCount = { childSpouse: 0, grandChild: 0 }; //子の配偶者、孫のインデックス（ガイドのidに付与するインデックス用）
    let copyFrom = getLastElByAttribute("childGuide", "class");
    childsHeirInstances.forEach((instance, i) => {
        let clone = copyFrom.cloneNode(true);
        clone.style.display = "block";
        const btn = clone.querySelector("button");
        btn.disabled = "true";
        const type = instance.fieldset.classList.contains("childSpouseFieldset") ? "childSpouse" : "grandChild";
        btn.textContent = instance.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
        clone.id = `id_${type === "childSpouse" ? "child_spouse" : "grand_child"}-${guideCount[type]}-guide`;
        clone.className = `card-title guide ${type}Guide childsHeirGuide`;
        clone.getElementsByClassName("guideCheck")[0].style.display = "none";
        copyFrom.after(clone);
        copyFrom = clone;
        guideCount[type] += 1;
    });
}

/**
 * 子の配偶者又は孫のガイドいずれかのみ生成する
 * @param {(ChildSpouse|GrandChild)[]} persons 生成する系統（childSpouses又はgrandChilds）
 */
function createChildsHeirGuide(persons){
    const isChildSpouse = persons[0].constructor.name === "ChildSpouse";
    const relation = isChildSpouse? "childSpouse": "grandChild";
    const idPrefix = isChildSpouse? "child_spouse": "grand_child";
    const fieldsets = document.getElementsByClassName("childsHeirFieldset");
    let copyFrom = getLastElByAttribute("childGuide", "class");
    //fieldsetは子の配偶者又は孫のテンプレとして残ってるだけの可能性があるためインスタンスの数でループする
    for(let i = 0, len = persons.length; i < len; i ++){
        const clone = copyFrom.cloneNode(true);
        clone.style.display = "block";
        const btn = clone.querySelector("button");
        btn.disabled = "true";
        btn.textContent = fieldsets[i].querySelector(".fieldsetTitle").textContent;
        clone.id = `id_${idPrefix}-${i}-guide`;
        clone.className = `card-title guide ${relation}Guide childsHeirGuide`;
        clone.getElementsByClassName("guideCheck")[0].style.display = "none";
        copyFrom.after(clone)
        copyFrom = clone;
    }
}

/**
 * 追加のガイドを表示する
 * @param {HTMLElement} guideList ガイドのラッパー要素
 * @param {string} selector querySelectorAllで指定するセレクタ
 * @example 子が複数いるときに子１の表示と同時に他の子も全員表示するなど
 */
function displayAdditionalGuide(guideList, selector){
    Array.from(guideList.querySelectorAll(selector)).slice(1).forEach(el => el.style.display = "block");
}

/**
 * 子共通欄から父欄を表示するときのガイド処理
 * ・子１以外のガイドを削除
 * ・母のガイドを無効化した状態で表示する
 * ・尊属ガイドのタイトルを変更する
 * ・表示するガイドのインデックスを２加算する（子１のガイドをスキップするため）
 * @param {EveryPerson} fromPerson 
 * @param {HTMLElement} guideList 
 */
function childCommonToFatherGuide(fromPerson, guideList){
    removeAllExceptFirst(guideList.getElementsByClassName("childGuide"));
    guideList.getElementsByClassName("ascendantGuide")[1].style.display = "block";
    UpdateTitle.ascendants(fromPerson, false);
    Guide.elIdx += 2;
}

/**
 * 最後の子から次に表示するガイドを判別する
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {EveryPerson} fromPerson １つ前の人インスタンス
 */
function selectChildGuideTo(guideList, fromPerson){
    //子の配偶者と孫のガイドを全て削除する
    const childsHeirGuides = guideList.querySelectorAll(".childSpouseGuide, .grandChildGuide");
    if(childsHeirGuides)
        removeAll(childsHeirGuides);
    //子の配偶者と孫がいるときを表示するとき
    if(childSpouses.length > 0 && grandChilds.length > 0){
        createChildsHeirGuides();
    }else if(childSpouses.length > 0){
        //子の配偶者のみいるとき
        createChildsHeirGuide(childSpouses);
    }else if(grandChilds.length > 0){
        //孫のみいるとき
        createChildsHeirGuide(grandChilds);
    }else{
        //父欄を表示するとき、母のガイドも無効化した状態で表示してタイトルの本番を更新する
        guideList.getElementsByClassName("ascendantGuide")[1].style.display = "block";
        UpdateTitle.ascendants(fromPerson, false);
    }
    //次のガイドにインデックスを移す
    Guide.elIdx += 1;
}

/**
 * 子の最後の相続人のガイドから父のガイドを表示するとき
 * @param {HTMLElement} guideList 
 * @param {EveryPerson} fromPerson 
 */
function childsHeirGuideToFatherGuide(guideList, fromPerson){
    guideList.getElementsByClassName("ascendantGuide")[1].style.display = "block";
    UpdateTitle.ascendants(fromPerson, false);
    Guide.elIdx += 1;
}

/**
 * ガイドを更新する
 * @param {EveryPerson} fromPerson １つ前に入力された人
 * @param {EveryPerson} nextPerson 次に入力してもらう人
 */
function updateGuide(fromPerson, nextPerson){
    const fromFieldsetId = fromPerson.fieldset.id;
    const nextFieldsetId = nextPerson.fieldset.id;
    const guideList = document.getElementById("guideList");
    const childCount = countChild();
    //一つ前のガイドを通常表示にする
    inactiveGuide(guideList);
    //子共通欄から父欄を表示するとき
    if(fromPerson === childCommon && childCount === 0){
        childCommonToFatherGuide(fromPerson, guideList);
    }else if(childCount > 0 && fromPerson === getLastElFromArray(childs)){
        //最後の子からのとき
        selectChildGuideTo(guideList, fromPerson);
    }else if(fromPerson === getLastChildsHeir()){
        //子の最後の相続人のとき（完了したときは、この処理まで来ないため条件分岐不要）
        childsHeirGuideToFatherGuide(guideList, fromPerson);
    }else if(fromFieldsetId === "id_ascendant-1-fieldset" && nextFieldsetId === "id_collateral_common-0-fieldset"){
        //母から兄弟姉妹共通を表示するとき
        UpdateTitle.collateralCommonGuide(guideList);
        Guide.elIdx += 5;
    }else if(fromFieldsetId === "id_ascendant-1-fieldset" && nextFieldsetId === "id_ascendant-4-fieldset"){
        //母から母方の祖父を表示するとき
        UpdateTitle.motherGparents(false);
        guideList.getElementsByClassName("motherGGuide")[1].style.display = "block";
        Guide.elIdx += 3;
    }else if(fromFieldsetId === "id_ascendant-3-fieldset" && nextFieldsetId === "id_collateral_common-0-fieldset"){
        //父方の祖母から兄弟姉妹共通を表示するとき
        UpdateTitle.collateralCommonGuide(guideList);
        Guide.elIdx += 3;
    }else{
        /**
         * 通常の相続の流れのとき（具体的には以下のとおり）
         * ・子共通欄から子１を表示するとき
         * ・子個人欄から子個人欄を表示するとき
         * ・母欄から父方の祖父欄を表示するとき
         * ・母方の祖母欄から兄弟姉妹共通欄を表示するとき
         */
        Guide.elIdx += 1;
        
        //子共通欄から子１を表示するとき、子の人数に応じてガイドの数を増やす
        if(fromFieldsetId === "id_child_common-0-fieldset"){
            //子の数を取得する
            const oldCount = guideList.getElementsByClassName("childGuide").length;
            const newCount = document.getElementsByClassName("childFieldset").length;
            adjustChildGuideCount("child", guideList, oldCount, newCount);
        }else if(fromFieldsetId === "id_ascendant-1-fieldset"){
            //母から父方の祖父を表示するとき、父方の祖母を無効化した状態で表示する
            guideList.getElementsByClassName("fatherGGuide")[1].style.display = "block";
        }else if(fromFieldsetId === "id_ascendant-3-fieldset"){
            //父方の祖母から母方の祖父を表示するとき、母方の祖母を無効化した状態で表示する
            UpdateTitle.motherGparents(false);
            guideList.getElementsByClassName("motherGGuide")[1].style.display = "block";
        }else if(fromFieldsetId === "id_ascendant-5-fieldset"){
            UpdateTitle.collateralCommonGuide(guideList);
        }else if(fromFieldsetId === "id_collateral_common-0-fieldset"){
            //兄弟姉妹の数を取得する
            const oldCount = guideList.getElementsByClassName("collateralGuide").length;
            const newCount = document.getElementsByClassName("collateralFieldset").length;
            adjustChildGuideCount("collateral", guideList, oldCount, newCount);
        }
    }
    //次の項目を強調する
    activeGuide(guideList);
    //次の項目のガイドボタンにイベントを追加
    getLastElFromArray(Guide.btns).addEventListener("click", scrollToTargetHandler);
}

/**
 * 前の項目を有効化する
 * @param {EveryPerson} currentPerson 無効化対象の人
 */
function putBackFieldset(currentPerson){
    const disableField = currentPerson.fieldset; //無効化対象のfieldset
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ
    //無効化するフィールドにあるイベントが設定されている要素を初期化してイベントを削除する
    replaceElements(disableField, "input");
    replaceElements(disableField, "button");
    currentPerson.inputs = Array.from(disableField.getElementsByTagName("input"));
    currentPerson.preBtn = disableField.getElementsByClassName("preBtn")[0];
    currentPerson.nextBtn = disableField.getElementsByClassName("nextBtn")[0];
    //現在のcurrentPerson.noInputsの各要素を、replaceElementsによって更新された同じidのinput要素に更新
    currentPerson.noInputs = currentPerson.noInputs.map(input => {
        return disableField.querySelector(`input[id="${input.id}"]`);
    });
    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    reqPerson.pop();
    slideUp(removeHr);
    removeHr.remove();
    //直前の項目を有効化してスクロール
    const preFieldset = getLastElFromArray(reqPerson).fieldset;
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
}

/**
 * 最後のガイドを削除する
 */
function removeLastGuide(){
    const idx = Guide.guides.length - 1;
    Guide.guides[idx].classList.remove("active");
    Guide.guides.pop();

    Guide.btns[idx].removeEventListener("click", scrollToTargetHandler);
    Guide.btns[idx].disabled = true;
    Guide.btns.pop();

    Guide.caretIcons[idx].style.display = "none";
    Guide.caretIcons.pop();
}

/**
 * 一つ前のガイドを作業中にする
 */
function enablePreGuide(){
    const idx = Guide.guides.length - 1;
    Guide.checkIcons[idx].style.display = "none";
    Guide.checkIcons.pop();
    Guide.guides[idx].classList.add("active");
    Guide.caretIcons[idx].style.display = "inline-block";
}

/**
 * 現在のガイドがその続柄のうち最初のインデックスのとき、同じ続柄のガイドを一括してスライドアップする
 * 
 * 子の相続人のガイドはスライドアップと同時に削除する
 * @param {string} currentGuideId 現在のガイドのid
 */
function slideUpSameRelationGuides(currentGuideId){
    const guideClasses = {
        "id_child-0-guide": "childGuide",
        "id_ascendant-0-guide": "ascendantGuide",
        "id_ascendant-2-guide": "fatherGGuide",
        "id_ascendant-4-guide": "motherGGuide",
        "id_collateral_common-0-guide": "collateralCommonGuide",
        "id_collateral-0-guide": "collateralGuide"
    };
    //孫１が子の相続人のうち最初の相続人のとき、guideClassesに要素を追加する
    if(currentGuideId === Guide.guides.filter(x => x.classList.contains("childsHeirGuide"))[0]?.id){
        guideClasses["id_child_spouse-0-guide"] = "childsHeirGuide";
        guideClasses["id_grand_child-0-guide"] = "childsHeirGuide";
    }
    //現在のガイドのidがguideClassesに存在するとき、現在のガイドと同じクラスを持つ全ての要素を一括して非表示にする
    if(currentGuideId in guideClasses){
        const guides = Array.from(document.getElementsByClassName(guideClasses[currentGuideId]));
        slideUpEls(guides, 0, guides.length - 1);
        if(guideClasses["id_grand_child-0-guide"])
            removeAll(guides);
    }
}

/**
 * 強調するガイドの要素のインデックスを戻す
 * @param {string} currentGuideId 現在強調されているガイドのid
 */
function putBackGuideElIdx(currentGuideId){
    //被相続人の子の数を取得する
    const childCount = countChild();
    //現在のガイドが父、かつ子がいないとき２戻す（子共通のインデックスに戻す）
    if(currentGuideId === "id_ascendant-0-guide" && childCount === 0) 
        Guide.elIdx -= 2;
    //現在のガイドが母方の祖父、かつ尊属のインスタンスが４つ（父、母、母方の祖父、母方の祖母）のとき、３つ戻す（母のインデックスに戻す）
    else if(currentGuideId === "id_ascendant-4-guide" && ascendants.length === 4) 
        Guide.elIdx -= 3;
    //現在のガイドが兄弟姉妹共通、かつ尊属のインスタンスが２つ（父、母）のとき、５つ戻す（母のインデックスに戻す）
    else if(currentGuideId === "id_collateral_common-0-guide" && ascendants.length === 2) 
        Guide.elIdx -= 5;
    //現在のガイドが兄弟姉妹共通、かつ最後の尊属のインスタンスのidが父方の祖母のとき、３つ戻す（父方の祖母のインデックスに戻す）
    else if(currentGuideId === "id_collateral_common-0-guide" && getLastElFromArray(ascendants).fieldset.id === "id_ascendant-3-fieldset") 
        Guide.elIdx -= 3;
    else 
        Guide.elIdx -= 1;
}

/**
 * ガイドを一つ戻す
 */
function putBackGuide(){
    //現在強調されているガイドのid
    const currentGuideId = getLastElFromArray(Guide.guides).id;
    //続柄の最初のインデックスの要素のとき、同じ続柄のガイドを全て非表示にする
    slideUpSameRelationGuides(currentGuideId);
    //押されたボタンに応じてガイドの表示している要素のインデックスを変更する
    putBackGuideElIdx(currentGuideId);
    //ガイドのデータを削除する
    removeLastGuide();
    //一つ前の項目をactiveにする
    enablePreGuide();
}

/**
 * 前の項目を有効化にする
 * 
 * putBackGuideとputBackFieldsetを返す関数
 * @param {} currentPerson 押された戻るボタンが属するfieldsetの１つ前のfieldset
 */
function oneStepBack(currentPerson){
    return function(e){
        //前の項目を有効化とガイドの巻き戻し
        putBackGuide();
        putBackFieldset(currentPerson);
    }
}

/**
 * インデックスが連続する要素を非表示にする
 * @param {HTMLElement[]} els 対象の要素の配列
 * @param {number} startIdx 非表示を開始する要素のインデックス
 * @param {number} endIdx 非表示を終了する要素のインデックス
 * @return {boolean}
 */
function slideUpEls(els, startIdx, endIdx){
    if(!Array.isArray(els))
        els = [els];
    let isSlideUp = false;
    for(let i = startIdx; i < endIdx + 1; i++){
        if(window.getComputedStyle(els[i]).display !== "none"){
            slideUp(els[i]);
            isSlideUp = true;
        } 
    }
    return isSlideUp;
}

/**
 * エラー配列に対象のエラー要素がないとき追加する（オプションでボタンの無効化も可）
 * @param {EveryPerson} person 対象の人
 * @param {HTMLElement} el 対象のエラー要素
 */
function pushInvalidEl(person, el){
    if(!person.noInputs.some(input => input.id === el.id)){
        person.noInputs.push(el);
        person.nextBtn.disabled = true;
    }
}

/**
 * エラー要素を追加して要素をスライドダウン表示する
 * 
 * pushInvalidElとslideDownIfHiddenをまとめた関数
 * @param {EveryPerson} person 対象の人
 * @param {HTMLElement} errEl 追加するエラー要素
 * @param {HTMLElement} displayEl スライドダウン表示する要素
 */
function pushInvalidElAndSDIfHidden(person, errEl, displayEl){
    pushInvalidEl(person, errEl);
    slideDownIfHidden(displayEl);
}

/**
 * 相続する続柄が変わったときの処理
 * 
 * pushInvalidEl, iniQs, slideDownAfterSlideUpをまとめた関数
 * @param {...(HTMLElement|number)} args 
 * [0] {EveryPerson} person
 * [1] {HTMLElement} el
 * [2] {HTMLElement[]} Qs
 * [3] {number} startIdx 
 * [4] {number} endIdx 
 * [5] {number[]} rbIdxs
 * [6] {HTMLElement} el  
 * [7] {HTMLElement} textInput
 */
function changeCourse(...args){
    if(args[0])
        pushInvalidEl(args[0], args[1]);
    const isSlideUp = iniQs(args[2], args[3], args[4], args[5], args[6]);
    let delay = 0;
    if(isSlideUp)
        delay = 250;
    slideDownAfterDelay(args[7], delay);
}

/**
 * 連番の数字を配列に入れて返す（オプションで特定の数字（複数可）を除外可）
 * @param {number} startIdx 配列に格納する最初の数字
 * @param {number} endIdx 配列に格納する最後の数字
 * @param {Array} exclude 除外したい数字を格納した配列 
 * @return オプションで除外した数字を除く連続した数字を格納した配列
 */
function getSequentialNumArr(startIdx, endIdx, exclude = []){
    if(!Array.isArray(exclude))
        exclude = [exclude];
    return Array.from({length: endIdx - startIdx + 1}, (_, i) => startIdx + i).filter(num => !exclude.includes(num));
}

/**
 * 複数の質問欄を非表示にして値を初期化する
 * @param {HTMLElement} Qs 連続する質問欄
 * @param {number} startIdx 非表示を開始する質問欄のインデックス
 * @param {number} endIdx 非表示を終了する質問欄のインデックス
 * @param {number} rbIdxs 初期化するラジオボタンの配列
 * @param {HTMLElement} textInput 人数テキストボックスの初期化
 * @return {boolean} スライドアップしたフラグ（したときはtrue、してないときはfalse）
 */
function iniQs(Qs, startIdx, endIdx, rbIdxs, textInput = null){
    uncheckTargetElements(getLastElFromArray(reqPerson).inputs, rbIdxs);
    if(textInput !== null)
        textInput.value = textInput.type === "number" ? "0": "";
    const isSlideUp = slideUpEls(Qs, startIdx, endIdx);
    return isSlideUp;
}

/**
 * 特定の入力欄をチェックして次へボタンの有効化判別と不要な質問の初期化
 * @param {HTMLElement} checkEl 次へボタン有効化前にチェックするエラー要素
 * @param {EveryPerson} person 対象の人
 * @param {HTMLElement[]} Qs 全質問要素
 * @param {number} iniStartIdx 初期化を開始する質問のインデックス
 * @param {number} iniEndIdx 初期化を終了する質問のインデックス
 * @param {number[]} iniRbIdxs 初期化するラジオボタンのインデックス
 * @param {HTMLElement} textInput テキスト要素（必要なときだけ）
 */
function breakQ(checkEl, person, Qs = null, iniStartIdx = null, iniEndIdx = null, iniRbIdxs = null, textInput = null){
    if(checkEl)
        person.noInputs = person.noInputs.filter(x => x.id === checkEl.id);
    else
        person.noInputs.length = 0;

    if(person.noInputs.length === 0)
        person.nextBtn.disabled = false;

    if(Qs)
        iniQs(Qs, iniStartIdx, iniEndIdx, iniRbIdxs, textInput);
}

/**
 * 共通のラジオボタンイベントハンドラー
 */
class CommonRbHandler{
    //true又はfalseに応じた処理を行う
    static handleYesNo(rbIdx, yesIdx, yesAction, noAction){
        if(rbIdx === yesIdx)
            yesAction();
        else
            noAction();
    }
    //日本在住
    static isJapan(idx, person){
        breakQ(person.inputs[idx], person);
    }
}
/**
 * エラーメッセージ要素を初期化する
 * @param {HTMLElement|HTMLElement[]} errMsgEl （複数も可）
 */
function iniErrMsgEls(errMsgEl){
    if(!Array.isArray(errMsgEl))
        errMsgEl = [errMsgEl];
    for(let i = 0, len = errMsgEl.length; i < len; i++){
        errMsgEl[i].style.display = "none";
        errMsgEl[i].innerHTML = "";
    }
}

/**
 * システム対応外であることを表示する
 * @param {HTMLElement} el
 * @param {string} msg
 */
function displayNotAvailable(el, msg = null){
    el.style.display = "block";
    el.innerHTML = msg? msg: "本システムでは対応できません";
}

/**
 * 配偶者のラジオボタンのイベントハンドラー
 */
class SpouseRbHandler extends CommonRbHandler{
    //相続時存在
    static isExist(rbIdx, spouse){
        const {inputs, Qs, nextBtn, errMsgEls, noInputs} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isExist.input[yes],
            ()=>{
                //yesAction
                //エラー要素に日本在住を追加して次へボタンを無効にする、手続時存在を表示する
                pushInvalidElAndSDIfHidden(spouse, inputs[Spouse.idxs.isJapan.input[yes]], Qs[Spouse.idxs.isLive.form]);
                //氏名欄が無効なとき、氏名欄を有効にしてエラー要素に氏名欄を追加する
                if(inputs[Spouse.idxs.name.input].disabled){
                    inputs[Spouse.idxs.name.input].disabled = false;
                    pushInvalidEl(spouse, inputs[Spouse.idxs.name.input]);
                }
            },
            ()=>{
                //noAction
                //エラー要素を全て削除する/次へボタンを有効にする/氏名欄を初期化して無効にする
                noInputs.length = 0;
                nextBtn.disabled = false;
                inputs[Spouse.idxs.name.input].value = "";
                inputs[Spouse.idxs.name.input].disabled = true;
                iniErrMsgEls(errMsgEls[Spouse.idxs.name.input]);
                //3問目以降の質問を全て非表示にして値を初期化する
                const rbIdxs = getSequentialNumArr(Spouse.idxs.isLive.input[yes], Spouse.idxs.isJapan.input[no])
                iniQs(Qs, Spouse.idxs.isLive.form, Spouse.idxs.isJapan.form, rbIdxs);
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, spouse){
        const {inputs, Qs, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isLive.input[yes],
            ()=>{
                //エラー要素に日本在住trueを追加して次へボタンを無効化/被相続人以外の子欄の非表示と値の初期化/相続放棄欄を表示
                const rbIdx = getSequentialNumArr(Spouse.idxs.isRemarriage.input[yes], Spouse.idxs.isStepChild[no]);
                changeCourse(
                    spouse, inputs[Spouse.idxs.isJapan.input[yes]], 
                    Qs, Spouse.idxs.isRemarriage.form, Spouse.idxs.isStepChild.form, rbIdx, null,
                    Qs[Spouse.idxs.isRefuse.form]
                )
            },
            ()=>{
                //被相続人以外の子のエラーメッセージを非表示
                iniErrMsgEls(errMsgEls[Spouse.idxs.isRemarriage.form]);
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/被相続人以外の子欄を表示
                const rbIdxs = getSequentialNumArr(Spouse.idxs.isRefuse.input[yes], Spouse.idxs.isJapan.input[no]);
                changeCourse(
                    spouse, inputs[Spouse.idxs.isStepChild.input[no]],
                    Qs, Spouse.idxs.isRefuse.form, Spouse.idxs.isJapan.form, rbIdxs, null,
                    Qs[Spouse.idxs.isRemarriage.form]
                )
            }
        )
    }

    //配偶者存在
    static isSpouse(rbIdx, spouse){
        const {inputs, Qs, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isRemarriage.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化/falseのときの表示欄を初期化/システム対応外であることを表示する
                pushInvalidEl(spouse, inputs[Spouse.idxs.isStepChild.input[no]]);
                iniQs(Qs, Spouse.idxs.isStepChild.form, Spouse.idxs.isStepChild.form, Spouse.idxs.isStepChild.input);
                displayNotAvailable(errMsgEls[Spouse.idxs.isRemarriage.form]);
            },
            ()=>{
                //エラーを非表示にする/被相続人以外の子を表示する
                iniErrMsgEls([errMsgEls[Spouse.idxs.isRemarriage.form], errMsgEls[Spouse.idxs.isStepChild.form]]);
                slideDownIfHidden(Qs[Spouse.idxs.isStepChild.form]);
            }
        )
    }

    //被相続人以外の子を表示する
    static isStepChild(rbIdx, spouse){
        const {inputs, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isStepChild.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化/システム対応外であることを表示する
                pushInvalidEl(spouse, inputs[Spouse.idxs.isStepChild.input[no]]);
                displayNotAvailable(errMsgEls[Spouse.idxs.isStepChild.form]);
            },
            ()=>{
                //エラーを非表示にする/名前が入力されているときは次へボタンを有効化する
                iniErrMsgEls(errMsgEls[Spouse.idxs.isStepChild.form]);
                breakQ(inputs[Spouse.idxs.name.input], spouse);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, spouse){
        const {inputs, Qs} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する、日本在住を非表示にして値を初期化
                breakQ(inputs[Spouse.idxs.name.input], spouse, Qs, Spouse.idxs.isJapan.form, Spouse.idxs.isJapan.form, Spouse.idxs.isJapan.input);
            },
            ()=>{
                //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                pushInvalidElAndSDIfHidden(spouse, inputs[Spouse.idxs.isJapan.input[yes]], Qs[Spouse.idxs.isJapan.form]);
            }
        )
    }
}

/**
 * 配偶者項目のラジオボタンイベントを設定する
 * @param {number} rbIdx 押されたラジオボタンのインデックス
 * @param {Spouse} spouse 対象の配偶者
 */
function setSpouseRbsEvent(rbIdx, spouse){
    //相続時存在
    if(Spouse.idxs.isExist.input.includes(rbIdx)) SpouseRbHandler.isExist(rbIdx, spouse);
    //手続時存在
    else if(Spouse.idxs.isLive.input.includes(rbIdx)) SpouseRbHandler.isLive(rbIdx, spouse);
    //配偶者存在
    else if(Spouse.idxs.isRemarriage.input.includes(rbIdx)) SpouseRbHandler.isSpouse(rbIdx, spouse);
    //被相続人以外の子存在
    else if(Spouse.idxs.isStepChild.input.includes(rbIdx)) SpouseRbHandler.isStepChild(rbIdx, spouse);
    //相続放棄
    else if(Spouse.idxs.isRefuse.input.includes(rbIdx)) SpouseRbHandler.isRefuse(rbIdx, spouse);
    //日本在住
    else SpouseRbHandler.isJapan(Spouse.idxs.name.input, spouse);
}

/**
 * 子の欄のラジオボタンのイベントハンドラー
 */
class ChildRbHandler extends CommonRbHandler{
    //同じ配偶者
    static isSameParents(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        //手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(Qs[Child.idxs.isLive.form]);
        //手続時存在の初期値があるとき、手続時存在trueのイベントを発生させる
        if(inputs[Child.idxs.isLive.input[yes]].disabled){
            const event = new Event("change");
            inputs[Child.idxs.isLive.input[yes]].dispatchEvent(event);
            //相続放棄の初期値があるとき、相続放棄trueのイベントを発生させる
            if(inputs[Child.idxs.isRefuse.input[no]].disabled){
                inputs[Child.idxs.isRefuse.input[no]].checked = true;
                inputs[Child.idxs.isRefuse.input[no]].dispatchEvent(event);
                //成人欄の初期値があるとき、成人trueのイベントを発生させる
                if(inputs[Child.idxs.isAdult.input[yes]].disabled)
                    inputs[Child.idxs.isAdult.input[yes]].dispatchEvent(event);
                //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
                if(inputs[Child.idxs.isJapan.input[yes]].disabled)
                    inputs[Child.idxs.isJapan.input[yes]].dispatchEvent(event);
            }
        }
        this.handleYesNo(rbIdx, Child.idxs.isSameParents.input[yes],
            ()=>{
                //yesAction
                //続柄を設定する
                if(spouse.inputs[Spouse.idxs.isExist.input[yes]].checked)
                    inputs[Child.idxs.target2.input].value = spouse.inputs[Spouse.idxs.index.input].value.trim();
            },
            ()=>{
                //noAction
                //続柄を設定する
                inputs[Child.idxs.target2.input].value = "";
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        const rbIdxs = rbIdx === Child.idxs.isLive.input[yes] ? 
            getSequentialNumArr(Child.idxs.isExist.input[yes], Child.idxs.isChild.input[no]):
            Child.idxs.isRefuse.input.concat(Child.idxs.isAdult.input, Child.idxs.isJapan.input);
        this.handleYesNo(rbIdx, Child.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    person, inputs[Child.idxs.isJapan.input[yes]],
                    Qs, Child.idxs.isExist.form, Child.idxs.count.form, rbIdxs, Qs[Child.idxs.count.form],
                    Qs[Child.idxs.isRefuse.form]
                )
            },
            ()=>{
                //noAction
                slideUpEls(Qs[Child.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    person, inputs[Child.idxs.count.input],
                    Qs, Child.idxs.isRefuse.form, Child.idxs.isJapan.form, rbIdxs, null,
                    Qs[Child.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Child.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    person, inputs[Child.idxs.count.input],
                    Qs, Child.idxs.isChild.form, Child.idxs.count.form, Child.idxs.isChild.input, inputs[Child.idxs.count.input],
                    Qs[Child.idxs.isRefuse.form]
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(Child.idxs.isRefuse.input[yes], Child.idxs.isChild.input[no]);
                changeCourse(
                    person, inputs[Child.idxs.count.input],
                    Qs, Child.idxs.isRefuse.form, Child.idxs.count.form, rbIdxs, inputs[Child.idxs.count.input],
                    Qs[Child.idxs.isChild.form]
                )
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Child.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する、falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(Child.idxs.isSpouse.input[yes], Child.idxs.isJapan.input[no], Child.idxs.count.input);
                breakQ(inputs[Child.idxs.name.input], person, Qs, Child.idxs.isSpouse.form, Child.idxs.isJapan.form, rbIdxs, inputs[Child.idxs.count.input]);
            },
            ()=>{
                //手続時存在trueのとき
                if(inputs[Child.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(person, inputs[Child.idxs.isJapan.input[yes]], Qs[Child.idxs.isAdult.form]);
                }else if(inputs[Child.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(person, inputs[Child.idxs.count.input], Qs[Child.idxs.isSpouse.form]);
                }
            }            
        )
    }

    //配偶者確認
    static isSpouse(el){
        slideDownIfHidden(el);
    }

    //子供存在
    static isChild(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Child.idxs.isChild.input[yes],
            ()=>{
                //子の人数欄を表示
                inputs[Child.idxs.count.input].value = "1";
                slideDown(Qs[Child.idxs.count.form]);
            },
            ()=>{
                //子の人数欄を非表示にして初期化する
                inputs[Child.idxs.count.input].value = "0";
                errMsgEls[Child.idxs.count.form].style.display = "none";
                //子供の人数欄をエラー要素に追加して次へボタンを無効化、子の人数欄を表示
                slideUp(Qs[Child.idxs.count.form]);
            }
            )
        breakQ(inputs[Child.idxs.name.input], person);
    }

    //成人
    static isAdult(person){
        const {inputs, Qs} = personDataToVariable(person);
        //日本在住欄を表示する
        slideDownIfHidden(Qs[Child.idxs.isJapan.form]);
        //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
        if(inputs[Child.idxs.isJapan.input[yes]].disabled){
            const event = new Event("change");
            inputs[Child.idxs.isJapan.input[yes]].dispatchEvent(event);
        }
    }
}

/**
 * 子項目を表示する
 * @param {number} rbIdx イベントを設定するinputのインデックス
 * @param {Child} person 対象の子
 */
function setChildRbsEvent(rbIdx, person){
    //同じ配偶者
    if(Child.idxs.isSameParents.input.includes(rbIdx)) ChildRbHandler.isSameParents(rbIdx, person);
    //手続時存在
    else if(Child.idxs.isLive.input.includes(rbIdx)) ChildRbHandler.isLive(rbIdx, person);
    //相続時存在
    else if(Child.idxs.isExist.input.includes(rbIdx)) ChildRbHandler.isExist(rbIdx, person);
    //相続放棄
    else if(Child.idxs.isRefuse.input.includes(rbIdx)) ChildRbHandler.isRefuse(rbIdx, person);
    //配偶者確認
    else if(Child.idxs.isSpouse.input.includes(rbIdx)) ChildRbHandler.isSpouse(person.Qs[Child.idxs.isChild.form]);
    //子の存在欄
    else if(Child.idxs.isChild.input.includes(rbIdx)) ChildRbHandler.isChild(rbIdx, person);
    //成人欄
    else if(Child.idxs.isAdult.input.includes(rbIdx)) ChildRbHandler.isAdult(person);
    //日本在住欄
    else if(Child.idxs.isJapan.input.includes(rbIdx)) ChildRbHandler.isJapan(Child.idxs.name.input, person);
}

/**
 * 兄弟姉妹の欄のラジオボタンのイベントハンドラー
 */
class CollateralRbHandler extends CommonRbHandler{
    //同じ配偶者
    static isSameParents(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        //手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(Qs[Collateral.idxs.isLive.form]);
        //手続時存在の初期値があるとき、手続時存在trueのイベントを発生させる
        if(inputs[Collateral.idxs.isLive.input[yes]].disabled){
            const event = new Event("change");
            inputs[Collateral.idxs.isLive.input[yes]].dispatchEvent(event);
            //相続放棄の初期値があるとき、相続放棄trueのイベントを発生させる
            if(inputs[Collateral.idxs.isRefuse.input[no]].disabled){
                inputs[Collateral.idxs.isRefuse.input[no]].checked = true;
                inputs[Collateral.idxs.isRefuse.input[no]].dispatchEvent(event);
                //成人欄の初期値があるとき、成人trueのイベントを発生させる
                if(inputs[Collateral.idxs.isAdult.input[yes]].disabled)
                    inputs[Collateral.idxs.isAdult.input[yes]].dispatchEvent(event);
                //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
                if(inputs[Collateral.idxs.isJapan.input[yes]].disabled)
                    inputs[Collateral.idxs.isJapan.input[yes]].dispatchEvent(event);
            }
        }
        this.handleYesNo(rbIdx, Collateral.idxs.isSameParents.input[yes],
            ()=>{
                //yesAction
                //続柄を設定する
                if(spouse.inputs[Spouse.idxs.isExist.input[yes]].checked)
                    inputs[Collateral.idxs.target2.input].value = spouse.inputs[Spouse.idxs.index.input].value.trim();
            },
            ()=>{
                //noAction
                //続柄を設定する
                inputs[Collateral.idxs.target2.input].value = "";
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        const rbIdxs = rbIdx === Collateral.idxs.isLive.input[yes] ? 
            getSequentialNumArr(Collateral.idxs.isExist.input[yes], Collateral.idxs.isChild.input[no]):
            Collateral.idxs.isRefuse.input.concat(Collateral.idxs.isAdult.input, Collateral.idxs.isJapan.input);
        this.handleYesNo(rbIdx, Collateral.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    person, inputs[Collateral.idxs.isJapan.input[yes]],
                    Qs, Collateral.idxs.isExist.form, Collateral.idxs.isChild.form, rbIdxs, null,
                    Qs[Collateral.idxs.isRefuse.form]
                )
                iniErrMsgEls(errMsgEls[Collateral.idxs.isRefuse.form]);
            },
            ()=>{
                //noAction
                slideUpEls(Qs[Collateral.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    person, inputs[Collateral.idxs.isChild.input[no]],
                    Qs, Collateral.idxs.isRefuse.form, Collateral.idxs.isJapan.form, rbIdxs, null,
                    Qs[Collateral.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Collateral.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    person, inputs[Collateral.idxs.isChild.input[no]],
                    Qs, Collateral.idxs.isChild.form, Collateral.idxs.isChild.form, Collateral.idxs.isChild.input, null,
                    Qs[Collateral.idxs.isRefuse.form]
                )
                iniErrMsgEls(errMsgEls[Collateral.idxs.isExist.form]);
                iniErrMsgEls(errMsgEls[Collateral.idxs.isRefuse.form]);
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                if(person === getLastElFromArray(collaterals)){
                    if(spouse.inputs[Spouse.idxs.isExist.input[no]].checked || spouse.inputs[Spouse.idxs.isRefuse.input[yes]].checked){
                        pushInvalidEl(person, inputs[Collateral.idxs.isJapan.input[yes]]);
                        displayNotAvailable(errMsgEls[Collateral.idxs.isExist.form], "相続人がいない場合、本システムでは対応できません");
                        slideUp(Qs[Collateral.idxs.isRefuse.form]);
                        return;
                    }else{
                        iniErrMsgEls(errMsgEls[Collateral.idxs.isExist.form]);
                    }
                }
                const rbIdxs = getSequentialNumArr(Collateral.idxs.isRefuse.input[yes], Collateral.idxs.isChild.input[no]);
                changeCourse(
                    person, inputs[Collateral.idxs.isChild.input[no]],
                    Qs, Collateral.idxs.isRefuse.form, Collateral.idxs.isChild.form, rbIdxs, null,
                    Qs[Collateral.idxs.isChild.form]
                )

            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Collateral.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する/falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(Collateral.idxs.isSpouse.input[yes], Collateral.idxs.isJapan.input[no]);
                breakQ(inputs[Collateral.idxs.name.input], person, Qs, Collateral.idxs.isSpouse.form, Collateral.idxs.isJapan.form, rbIdxs);
                if(person === getLastElFromArray(collaterals)){
                    if(spouse.inputs[Spouse.idxs.isExist.input[no]].checked || spouse.inputs[Spouse.idxs.isRefuse.input[yes]].checked){
                        pushInvalidEl(person, inputs[Collateral.idxs.isJapan.input[yes]]);
                        displayNotAvailable(errMsgEls[Collateral.idxs.isRefuse.form], "相続人がいない場合、本システムでは対応できません");
                    }else{
                        iniErrMsgEls(errMsgEls[Collateral.idxs.isRefuse.form]);
                    }
                }
            },
            ()=>{
                //手続時存在trueのとき
                if(inputs[Collateral.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(person, inputs[Collateral.idxs.isJapan.input[yes]], Qs[Collateral.idxs.isAdult.form]);
                }else if(inputs[Collateral.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(person, inputs[Collateral.idxs.isChild.input[no]], Qs[Collateral.idxs.isSpouse.form]);
                }
                iniErrMsgEls(errMsgEls[Collateral.idxs.isRefuse.form]);
                iniErrMsgEls(errMsgEls[Collateral.idxs.isSpouse.form]);
            }            
        )
    }

    //配偶者確認
    static isSpouse(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Collateral.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素を取得/システム対応外表示
                pushInvalidEl(person, inputs[Collateral.idxs.isChild.input[no]]);
                displayNotAvailable(errMsgEls[Collateral.idxs.isSpouse.form], "兄弟姉妹の数次相続には対応してません。");
                slideUp(Qs[Collateral.idxs.isChild.form]);
            },
            ()=>{
                //配偶者存在と子存在のエラー表示を初期化する
                iniErrMsgEls(errMsgEls[Collateral.idxs.isSpouse.form]);
                iniErrMsgEls(errMsgEls[Collateral.idxs.isChild.form]);
                //子供存在欄を表示する
                slideDownIfHidden(Qs[Collateral.idxs.isChild.form]);
            }
        )
    }

    //子供存在
    static isChild(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Collateral.idxs.isChild.input[yes],
            ()=>{
                //システム対応外を表示する
                pushInvalidEl(person, inputs[Collateral.idxs.isChild.input[no]]);
                displayNotAvailable(errMsgEls[Collateral.idxs.isChild.form], "兄弟姉妹の数次相続には対応してません。");
            },
            ()=>{
                iniErrMsgEls(errMsgEls[Collateral.idxs.isChild.form]);
                breakQ(inputs[Collateral.idxs.name.input], person);
            }
        )
    }

    //成人
    static isAdult(person){
        const {inputs, Qs} = personDataToVariable(person);
        //日本在住欄を表示する
        slideDownIfHidden(Qs[Collateral.idxs.isJapan.form]);
        //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
        if(inputs[Collateral.idxs.isJapan.input[yes]].disabled){
            const event = new Event("change");
            inputs[Collateral.idxs.isJapan.input[yes]].dispatchEvent(event);
        }
    }
}

/**
 * 子項目を表示する
 * @param {number} rbIdx イベントを設定するinputのインデックス
 * @param {Collateral} person 対象の子
 */
function setCollateralRbsEvent(rbIdx, person){
    //同じ配偶者
    if(Collateral.idxs.isSameParents.input.includes(rbIdx)) CollateralRbHandler.isSameParents(rbIdx, person);
    //手続時存在
    else if(Collateral.idxs.isLive.input.includes(rbIdx)) CollateralRbHandler.isLive(rbIdx, person);
    //相続時存在
    else if(Collateral.idxs.isExist.input.includes(rbIdx)) CollateralRbHandler.isExist(rbIdx, person);
    //相続放棄
    else if(Collateral.idxs.isRefuse.input.includes(rbIdx)) CollateralRbHandler.isRefuse(rbIdx, person);
    //配偶者確認
    else if(Collateral.idxs.isSpouse.input.includes(rbIdx)) CollateralRbHandler.isSpouse(rbIdx, person);
    //子の存在欄
    else if(Collateral.idxs.isChild.input.includes(rbIdx)) CollateralRbHandler.isChild(rbIdx, person);
    //成人欄
    else if(Collateral.idxs.isAdult.input.includes(rbIdx)) CollateralRbHandler.isAdult(person);
    //日本在住欄
    else if(Collateral.idxs.isJapan.input.includes(rbIdx)) CollateralRbHandler.isJapan(Collateral.idxs.name.input, person);
}

/**
 * 孫の欄のラジオボタンのイベントハンドラー
 */
class GrandChildRbHandler extends CommonRbHandler{
    //同じ配偶者
    static isSameParents(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        //手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(Qs[GrandChild.idxs.isLive.form]);
        this.handleYesNo(rbIdx, GrandChild.idxs.isSameParents.input[yes],
            ()=>{
                //yesAction
                //続柄を設定する
                const childSpouse = childSpouses.find(x => x.successFrom === person.successFrom);
                if(childSpouse && inputs[GrandChild.idxs.isSameParents.input[yes]].checked){
                    inputs[GrandChild.idxs.target2.input].value = childSpouse.inputs[ChildSpouse.idxs.index.input].value;
                }
            },
            ()=>{
                //noAction
                //続柄を設定する
                inputs[GrandChild.idxs.target2.input].value = "";
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        const rbIdxs = rbIdx === GrandChild.idxs.isLive.input[yes] ? 
            getSequentialNumArr(GrandChild.idxs.isExist.input[yes], GrandChild.idxs.isChild.input[no]):
            GrandChild.idxs.isRefuse.input.concat(GrandChild.idxs.isAdult.input, GrandChild.idxs.isJapan.input);
        this.handleYesNo(rbIdx, GrandChild.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    person, inputs[GrandChild.idxs.isJapan.input[yes]],
                    Qs, GrandChild.idxs.isExist.form, GrandChild.idxs.isChild.form, rbIdxs, null,
                    Qs[GrandChild.idxs.isRefuse.form]
                )
            },
            ()=>{
                //noAction
                slideUpEls(Qs[GrandChild.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    person, inputs[GrandChild.idxs.isChild.input[no]],
                    Qs, GrandChild.idxs.isRefuse.form, GrandChild.idxs.isJapan.form, rbIdxs, null,
                    Qs[GrandChild.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    person, inputs[GrandChild.idxs.isChild.input[no]],
                    Qs, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.input, null,
                    Qs[GrandChild.idxs.isRefuse.form]
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(GrandChild.idxs.isRefuse.input[yes], GrandChild.idxs.isChild.input[no]);
                changeCourse(
                    person, inputs[GrandChild.idxs.isChild.input[no]],
                    Qs, GrandChild.idxs.isRefuse.form, GrandChild.idxs.isChild.form, rbIdxs, null,
                    Qs[GrandChild.idxs.isChild.form]
                )
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する、falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(GrandChild.idxs.isSpouse.input[yes], GrandChild.idxs.isJapan.input[no]);
                breakQ(inputs[GrandChild.idxs.name.input], person, Qs, GrandChild.idxs.isSpouse.form, GrandChild.idxs.isJapan.form, rbIdxs, null);
            },
            ()=>{
                //手続時存在trueのとき
                if(inputs[GrandChild.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化して成人欄を表示
                    pushInvalidElAndSDIfHidden(person, inputs[GrandChild.idxs.isJapan.input[yes]], Qs[GrandChild.idxs.isAdult.form]);
                }else if(inputs[GrandChild.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化して配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(person, inputs[GrandChild.idxs.isChild.input[no]], Qs[GrandChild.idxs.isSpouse.form]);
                }
            }            
        )
    }

    //配偶者確認
    static isSpouse(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素を追加して次へボタンを無効化/子存在欄を初期化/システム対応外のエラーメッセージ表示
                pushInvalidEl(person, inputs[GrandChild.idxs.isChild.input[no]]);
                iniQs(Qs, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.input);
                displayNotAvailable(errMsgEls[GrandChild.idxs.isSpouse.form]);
            },
            ()=>{
                //配偶者存在欄と子供存在欄のエラーメッセージを非表示にする/子供存在欄を表示する
                iniErrMsgEls(errMsgEls[GrandChild.idxs.isSpouse.form]);
                slideDownAndScroll(Qs[GrandChild.idxs.isChild.form]);
            }
        )
    }

    //子供存在
    static isChild(rbIdx, person){
        const {inputs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isChild.input[yes],
            ()=>{
                //エラー要素を追加して次へボタンを無効化/システム対応外のエラーメッセージ表示
                pushInvalidEl(person, inputs[GrandChild.idxs.isChild.input[no]]);
                displayNotAvailable(errMsgEls[GrandChild.idxs.isChild.form]);
            },
            ()=>{
                //エラーメッセージを非表示にする/氏名欄が適切なとき、次へボタンを有効化する
                iniErrMsgEls(errMsgEls[GrandChild.idxs.isChild.form]);
                breakQ(inputs[GrandChild.idxs.name.input], person);
            }
        )
    }

    //成人
    static isAdult(person){
        //日本在住欄を表示する
        slideDownIfHidden(person.Qs[GrandChild.idxs.isJapan.form]);
    }
}

/**
 * 孫の欄にイベントを設定する
 * @param {number} rbIdx イベントを設定するinputのインデックス
 * @param {GrandChild} person 対象の子
 */
function setGrandChildRbsEvent(rbIdx, person){
    //同じ配偶者
    if(GrandChild.idxs.isSameParents.input.includes(rbIdx)) GrandChildRbHandler.isSameParents(rbIdx, person);
    //手続時存在
    else if(GrandChild.idxs.isLive.input.includes(rbIdx)) GrandChildRbHandler.isLive(rbIdx, person);
    //相続時存在
    else if(GrandChild.idxs.isExist.input.includes(rbIdx)) GrandChildRbHandler.isExist(rbIdx, person);
    //相続放棄
    else if(GrandChild.idxs.isRefuse.input.includes(rbIdx)) GrandChildRbHandler.isRefuse(rbIdx, person);
    //配偶者確認
    else if(GrandChild.idxs.isSpouse.input.includes(rbIdx)) GrandChildRbHandler.isSpouse(rbIdx, person);
    //子の存在欄
    else if(GrandChild.idxs.isChild.input.includes(rbIdx)) GrandChildRbHandler.isChild(rbIdx, person);
    //成人欄
    else if(GrandChild.idxs.isAdult.input.includes(rbIdx)) GrandChildRbHandler.isAdult(person);
    //日本在住欄
    else if(GrandChild.idxs.isJapan.input.includes(rbIdx)) GrandChildRbHandler.isJapan(GrandChild.idxs.name.input, person);
}
/**
 * 尊属のラジオボタンのイベントハンドラー
 */
class AscendantRbHandler extends CommonRbHandler{
    //手続時存在
    static isLive(rbIdx, ascendant){
        const {inputs, Qs, nextBtn} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラー要素に日本在住trueを追加して次へボタンを無効化/falseのときに表示した質問と値の初期化/相続放棄欄を表示
                const rbIdx = getSequentialNumArr(Ascendant.idxs.isExist.input[yes], Ascendant.idxs.isChild.input[no]);
                changeCourse(
                    ascendant, inputs[Ascendant.idxs.isJapan.input[yes]],
                    Qs, Ascendant.idxs.isExist.form, Ascendant.idxs.isChild.form, rbIdx, null,
                    Qs[Ascendant.idxs.isRefuse.form]
                )
            },
            ()=>{
                //noAction
                //エラー要素に被相続人以外の子を追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/配偶者存在欄を表示
                const rbIdxs = Ascendant.idxs.isRefuse.input.concat(Ascendant.idxs.isJapan.input);
                changeCourse(
                    ascendant, inputs[Ascendant.idxs.isChild.input[yes]],
                    Qs, Ascendant.idxs.isRefuse.form, Ascendant.idxs.isJapan.form, rbIdxs, null,
                    Qs[Ascendant.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, ascendant){
        const {inputs, Qs} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isExist.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子欄を追加して次へボタンを無効にする、相続放棄を表示する
                pushInvalidElAndSDIfHidden(ascendant, inputs[Ascendant.idxs.isChild.input[yes]], Qs[Ascendant.idxs.isRefuse.form]);
            }
            ,()=>{
                //氏名以外のエラー要素を全て削除して氏名が入力されているときは次へボタンを有効にする、trueで表示した質問を全て非表示にして値を初期化する
                const rbIdxs = getSequentialNumArr(Ascendant.idxs.isRefuse.input[yes], Ascendant.idxs.isChild.input[no]);
                breakQ(inputs[Ascendant.idxs.name.input], ascendant, Qs, Ascendant.idxs.isRefuse.form, Ascendant.idxs.isChild.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, ascendant){
        const {inputs, Qs, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する、falseで表示する質問を全て非表示にして値を初期化
                const rbIdxs = getSequentialNumArr(Ascendant.idxs.isSpouse.input[yes], Ascendant.idxs.isJapan.input[no]);
                breakQ(inputs[Ascendant.idxs.name.input], ascendant, Qs, Ascendant.idxs.isSpouse.form, Ascendant.idxs.isJapan.form, rbIdxs);
            },
            ()=>{
                //手続時生存trueのとき
                if(inputs[Ascendant.idxs.isLive.input[yes]].checked){
                    pushInvalidElAndSDIfHidden(ascendant, inputs[Ascendant.idxs.isJapan.input[yes]], Qs[Ascendant.idxs.isJapan.form]);
                }else if(inputs[Ascendant.idxs.isExist.input[yes]].checked){
                    //相続時生存trueのとき
                    //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                    pushInvalidElAndSDIfHidden(ascendant, inputs[Ascendant.idxs.isChild.input[yes]], Qs[Ascendant.idxs.isSpouse.form]);
                    iniErrMsgEls(errMsgEls[Ascendant.idxs.isSpouse.form]);
                }
            }
        )
    }
    
    //配偶者存在
    static isSpouse(rbIdx, ascendant){
        const {inputs, Qs, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、falseで表示した質問を初期化、配偶者は母か確認欄を表示する
                changeCourse(
                    ascendant, inputs[Ascendant.idxs.isChild.input[yes]],
                    Qs, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.input, null,
                    Qs[Ascendant.idxs.isRemarriage.form]
                )
                //配偶者は母か確認欄のエラーメッセージを初期化する
                iniErrMsgEls(errMsgEls[Ascendant.idxs.isRemarriage.form]);
            },
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、trueで表示した質問を初期化、被相続人以外の子の欄を表示する
                const rbIdxs = getSequentialNumArr(Ascendant.idxs.isRemarriage.input[yes], Ascendant.idxs.isChild.input[no]);
                changeCourse(
                    ascendant, inputs[Ascendant.idxs.isChild.input[yes]],
                    Qs, Ascendant.idxs.isRemarriage.form, Ascendant.idxs.isChild.form, rbIdxs, null,
                    Qs[Ascendant.idxs.isChild.form]
                )
                //エラーを非表示にする
                iniErrMsgEls(errMsgEls[Ascendant.idxs.isChild.form]);
            }
        )
    }

    //配偶者と母が同じを表示する
    static isRemarriage(rbIdx, ascendant){
        const {inputs, Qs, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isRemarriage.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化/エラー要素を初期化
                slideDownAndScroll(Qs[Ascendant.idxs.isChild.form]);
                iniErrMsgEls(errMsgEls[Ascendant.idxs.isRemarriage.form]);
            },
            ()=>{
                //システム対応外であることを表示する/エラー要素として被相続人以外の子trueを追加してボタンを無効化する、被相続人以外の子を初期化する
                displayNotAvailable(errMsgEls[Ascendant.idxs.isRemarriage.form]);
                pushInvalidEl(ascendant, inputs[Ascendant.idxs.isChild.input[yes]]);
                iniQs(Qs, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.input);
            }
        )
    }

    //被相続人以外の子を表示する
    static isChild(rbIdx, ascendant){
        const {inputs, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isChild.input[yes],
            ()=>{
                //氏名が適切に入力されているかチェックして次へボタンを有効化判別/エラーメッセージを非表示にする
                breakQ(inputs[Ascendant.idxs.name.input], ascendant);
                iniErrMsgEls(errMsgEls[Ascendant.idxs.isChild.form]);
            },
            ()=>{
                //エラーを表示する/trueをエラー要素に追加して次へボタンを無効化する
                displayNotAvailable(errMsgEls[Ascendant.idxs.isChild.form]);
                pushInvalidEl(ascendant, inputs[Ascendant.idxs.isChild.input[yes]]);
            }
        )
    }
}

/**
 * 配偶者項目を表示する
 * @param {number} rbIdx 押された次へボタンのインデックス
 * @param {} ascendant 尊属のうちいずれか
 */
function setAscendantRbsEvent(rbIdx, ascendant){
    //手続時存在
    if(Ascendant.idxs.isLive.input.includes(rbIdx)) AscendantRbHandler.isLive(rbIdx, ascendant);
    //相続時存在
    else if(Ascendant.idxs.isExist.input.includes(rbIdx)) AscendantRbHandler.isExist(rbIdx, ascendant);
    //相続放棄
    else if(Ascendant.idxs.isRefuse.input.includes(rbIdx)) AscendantRbHandler.isRefuse(rbIdx, ascendant);
    //配偶者存在
    else if(Ascendant.idxs.isSpouse.input.includes(rbIdx)) AscendantRbHandler.isSpouse(rbIdx, ascendant);
    //配偶者と母は同じ
    else if(Ascendant.idxs.isRemarriage.input.includes(rbIdx)) AscendantRbHandler.isRemarriage(rbIdx, ascendant);
    //被相続人以外の子
    else if(Ascendant.idxs.isChild.input.includes(rbIdx)) AscendantRbHandler.isChild(rbIdx, ascendant);
    //日本在住
    else AscendantRbHandler.isJapan(Ascendant.idxs.name.input, ascendant);
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
 * 子の人数を１増加させる
 * @param {boolean} isIncrease 増加フラグ
 * @param {EveryPerson} person  カウント欄を持つ人
 * @param {number} limitCount 上限値又は下限値
 */
function adjustChildCount(isIncrease, person, limitCount){
    const countInput = person.inputs[person.constructor.idxs.count.input];
    let val = parseInt(countInput.value) || 0;
    if((isIncrease && val < limitCount) || (!isIncrease && val > limitCount))
        val += isIncrease ? 1 : -1;
    countInput.value = val;
}

/**
 * 人数欄の値変更イベント用
 * @param {HTMLElement} el イベントが発火した要素
 * @param {EveryPerson} person  人数欄を持つ人
 */
function countCheck(el, person){
    let val = el.value;
    isValid = isNumber(val, el) ? true: "false"; //整数チェック
    let msg = "";

    //整数のとき
    if(typeof isValid === "boolean"){
        //15人以下チェック
        const intVal = parseInt(val);
        if(intVal > 15){
            isValid = "false";
            msg = "上限は１５人までです";
            val = "1";
        }else if(intVal === 0){
            isValid = "false";
            msg = "いない場合は上の質問で「いいえ」を選択してください";
            val = "1";
        }
    }else{
        msg = "入力必須です";
        val = "1";
    }
    const countInputIdx = person.constructor.idxs.count.input;
    const countFormIdx = person.constructor.idxs.count.form;
    afterValidation(isValid, person.errMsgEls[countFormIdx], msg, person.inputs[countInputIdx], person);
}

/**
 * 数字入力欄のキーダウンイベント
 * @param {event} e キーダウンイベント
 * @param {HTMLElement} nextEl 次にフォーカスする要素
 */
function handleNumInputKeyDown(e, nextEl){
    //Enterで次にフォーカス
    if(e.key === "Enter"){
        e.preventDefault();
        nextEl.focus();
    }else if(!/\d|Backspace|Delete|Tab/.test(e.key)){
        //数字又はバックスペースとデリート以外は使用不可
        e.preventDefault()
    }
}

/**
 * 全角入力欄の値変更イベントのハンドラー
 * @param {HTMLElement} el 全角入力欄
 * @param {number} idx 全角入力欄のインデックス
 * @param {EveryPerson} person 
 */
function handleFullWidthInputChange(el, idx, person){
    //入力値のチェック結果を取得して結果に応じた処理をする
    isValid = isOnlyZenkaku(el);
    afterValidation(isValid, person.errMsgEls[idx], isValid, person.inputs[idx], person);
}

/**
 * エンターキーに次の入力欄にフォーカスする処理を実装する
 * @param {event} e イベント
 * @param {HTMLElement} el 次にフォーカスする要素
 */
function setEnterKeyFocusNext(e, el){
    //Enterで次の入力欄にフォーカス
    if(e.key === "Enter"){
        e.preventDefault();
        el.focus();
    }
}

/**
 * 増減ボタンのイベントハンドラー
 * @param {boolean} isIncrease 増加ボタンフラグ
 * @param {EveryPerson} person  カウント欄を持つ人
 * @param {HTMLElement} plusBtn プラスボタン
 * @param {HTMLElement} minusBtn マイナスボタン
 * @param {number} minCount 設定の最小値
 * @param {number} maxCount 設定の最大値
 */
function countBtnHandler(isIncrease, person, plusBtn, minusBtn, minCount, maxCount){
    const countInput = person.inputs[person.constructor.idxs.count.input];
    adjustChildCount(isIncrease, person, (isIncrease ? maxCount : minCount));
    countCheck(countInput, person);
    toggleCountBtn(plusBtn, minusBtn, countInput.value, minCount, maxCount);
}

/**
 * カウント欄と増減ボタンにイベントを設定
 * @param {EveryPerson} person  カウント欄を持つ人
 * @param {number} minCount 最小値
 * @param {number} maxCount 最大値
 */
function countFormHandler(person){
    const minCount = 1;
    const maxCount = 15;
    const {fieldset, inputs, nextBtn} = personDataToVariable(person);
    const idx = person.constructor.idxs.count.input;
    const minusBtn = fieldset.getElementsByClassName("decreaseBtn")[0];
    const plusBtn = fieldset.getElementsByClassName("increaseBtn")[0];
    //カウント入力欄
    inputs[idx].addEventListener("change", (e)=>{
        countCheck(e.target, person);
        toggleCountBtn(plusBtn, minusBtn, parseInt(e.target.value), minCount, maxCount);
    })
    inputs[idx].addEventListener("keydown",(e)=>{
        handleNumInputKeyDown(e, (idx === 2 ? inputs[idx + 1] : nextBtn));
    })
    inputs[idx].addEventListener("input", (e)=>{
        //３文字以上入力不可
        e.target.value = e.target.value.slice(0,2);
    })
    //マイナスボタン
    minusBtn.addEventListener("click",(e)=>{
        countBtnHandler(false, person, plusBtn, minusBtn, minCount, maxCount)
    })
    //プラスボタン
    plusBtn.addEventListener("click",(e)=>{
        countBtnHandler(true, person, plusBtn, minusBtn, minCount, maxCount)
    })
}

/**
 * 全角入力欄のinputイベントハンドラー
 * @param {EveryPerson} person 対象の人
 * @param {HTMLElement} el 全角入力欄
 */
function handleFullWidthInput(person, el){
    isValid = isOnlyZenkaku(el)
    if(typeof isValid === "boolean"){
        person.noInputs = person.noInputs.filter(x => x.id !== el.id);
        if(person.noInputs.length === 0)
            person.nextBtn.disabled = false;
    }else{
        pushInvalidEl(person, el);
    }
}

/**
 * 個人入力欄にイベントを設定する
 * @param {HTMLElement} person イベントをセットする対象の人
 */
function setEventToIndivisualFieldset(person){
    const {fieldset, inputs} = personDataToVariable(person);
    for(let i = 0, len = inputs.length; i < len; i++){
        //氏名欄のとき
        if(i === person.constructor.idxs.name.input){
            inputs[i].addEventListener("change",(e)=>{
                handleFullWidthInputChange(e.target, i, person);
            })
            inputs[i].addEventListener("keydown",(e)=>{
                setEnterKeyFocusNext(e, inputs[i + 1]);
                disableNumKey(e);
            })
            inputs[i].addEventListener("input", (e)=>{
                handleFullWidthInput(person, inputs[i]);
            })
        }else{
            //氏名欄以外のとき
    
            //配偶者欄のとき、配偶者専用のラジオボタンのchangeイベントを設定する
            if(fieldset.id === "id_spouse-0-fieldset" || fieldset.classList.contains("childSpouseFieldset")){
                inputs[i].addEventListener("change",(e)=>{
                    setSpouseRbsEvent(i, person);
                })
            }else if(fieldset.classList.contains("childFieldset")){
                //子の欄のとき
    
                //人数欄にイベントを設定
                if(i === Child.idxs.count.input){
                    countFormHandler(person);
                }else{
                    //人数欄以外のとき
    
                    //子専用のchangeイベントを設定
                    inputs[i].addEventListener("change",(e)=>{
                        //子専用のラジオボタンイベントを設定
                        setChildRbsEvent(i, person);
                    })
                }
            }else if(fieldset.classList.contains("grandChildFieldset")){
                //孫の欄のとき
                //子専用のchangeイベントを設定
                inputs[i].addEventListener("change",(e)=>{
                    //子専用のラジオボタンイベントを設定
                    setGrandChildRbsEvent(i, person);
                })
            }else if(fieldset.classList.contains("ascendantFieldset")){
                //尊属の欄のとき
                //尊属専用のラジオボタンイベントを設定
                inputs[i].addEventListener("change",(e)=>{
                    setAscendantRbsEvent(i, person);
                })
            }else if(fieldset.classList.contains("collateralFieldset")){
                //兄弟姉妹個人欄のとき
                //兄弟姉妹個人専用のラジオボタンイベントを設定
                inputs[i].addEventListener("change", (e)=>{
                    setCollateralRbsEvent(i, person);
                })
            }
        }
    }
}

/**
 * 子供欄のラジオボタンのインベントハンドラー
 */
class ChildCommonRbHandler extends CommonRbHandler{
    //子供存在
    static isExist(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        this.handleYesNo(rbIdx, ChildCommon.idxs.isExist.input[yes],
            //yesAction
            ()=>{
                //エラー要素を初期化する
                person.noInputs = person.noInputs.filter(x => x.id === inputs[ChildCommon.idxs.isJapan.input[yes]].id)
                pushInvalidEl(person, inputs[ChildCommon.idxs.isJapan.input[yes]]);
                //人数入力欄を表示する
                inputs[ChildCommon.idxs.count.input].value = "1";
                slideDownAndScroll(Qs[ChildCommon.idxs.count.form]);
                slideDown(Qs[ChildCommon.idxs.isSameParents.form]);
            },
            //noAction
            ()=>{
                //trueのときに表示する欄を初期化して次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(ChildCommon.idxs.isSameParents.input[yes], ChildCommon.idxs.isJapan.input[no])
                breakQ(null, person, Qs, ChildCommon.idxs.count.form, ChildCommon.idxs.isJapan.form, rbIdxs, inputs[ChildCommon.idxs.count.input])
            }
        )
    }

    //同じ両親
    static isSameParents(el){
        slideDownIfHidden(el);
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person)
        this.handleYesNo(rbIdx, ChildCommon.idxs.isLive.input[yes],
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(person, inputs[ChildCommon.idxs.isJapan.input[yes]], Qs[ChildCommon.idxs.isRefuse.form]);
            },
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(ChildCommon.idxs.isRefuse.input[yes], ChildCommon.idxs.isJapan.input[no]);
                breakQ(inputs[ChildCommon.idxs.count.input], person, Qs, ChildCommon.idxs.isRefuse.form, ChildCommon.idxs.isJapan.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs} = personDataToVariable(person);
        this.handleYesNo(rbIdx, ChildCommon.idxs.isRefuse.input[yes], 
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = ChildCommon.idxs.isAdult.input.concat(ChildCommon.idxs.isJapan.input);
                breakQ(inputs[ChildCommon.idxs.count.input], person, Qs, ChildCommon.idxs.isAdult.form, ChildCommon.idxs.isJapan.form, rbIdxs);
            },
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(person, inputs[ChildCommon.idxs.isJapan.input[yes]], Qs[ChildCommon.idxs.isAdult.form]);
            }
        )
    }

    //成人
    static isAdult(el){
        slideDownIfHidden(el);
    }
}

class CollateralCommonRbHandler extends ChildCommonRbHandler{
    static isExist(rbIdx, person){
        const {inputs, Qs, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, CollateralCommon.idxs.isExist.input[yes],
            //yesAction
            ()=>{
                //エラー要素を初期化する
                person.noInputs = person.noInputs.filter(x => x.id === inputs[CollateralCommon.idxs.isJapan.input[yes]].id)
                pushInvalidEl(person, inputs[CollateralCommon.idxs.isJapan.input[yes]]);
                //人数入力欄を表示する
                inputs[CollateralCommon.idxs.count.input].value = "1";
                slideDownAndScroll(Qs[CollateralCommon.idxs.count.form]);
                slideDown(Qs[CollateralCommon.idxs.isSameParents.form]);
                iniErrMsgEls(errMsgEls[CollateralCommon.idxs.isExist.form]);
            },
            //noAction
            ()=>{
                //trueのときに表示する欄を初期化して次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(CollateralCommon.idxs.isSameParents.input[yes], CollateralCommon.idxs.isJapan.input[no])
                breakQ(null, person, Qs, CollateralCommon.idxs.count.form, CollateralCommon.idxs.isJapan.form, rbIdxs, inputs[CollateralCommon.idxs.count.input])
                if(spouse.inputs[Spouse.idxs.isExist.input[no]].checked || spouse.inputs[Spouse.idxs.isRefuse.input[yes]].checked){
                    pushInvalidEl(person, inputs[CollateralCommon.idxs.isExist.input[yes]]);
                    displayNotAvailable(errMsgEls[CollateralCommon.idxs.isExist.form]);
                }else{
                    iniErrMsgEls(errMsgEls[CollateralCommon.idxs.isExist.form]);
                }
            }
        )
    }
}

/**
 * 子共通のラジオボタンのイベントを設定する
 * @param {number} rbIdx ラジオボタンのインデックス
 * @param {ChildCommon} person 子共通のインスタンス
 */
function setChildCommonRbsEvent(rbIdx, person){
    //子供存在
    if(ChildCommon.idxs.isExist.input.includes(rbIdx)) ChildCommonRbHandler.isExist(rbIdx, person);
    //同じ両親
    else if(ChildCommon.idxs.isSameParents.input.includes(rbIdx)) ChildCommonRbHandler.isSameParents(person.Qs[ChildCommon.idxs.isLive.form]);
    //手続時生存
    else if(ChildCommon.idxs.isLive.input.includes(rbIdx)) ChildCommonRbHandler.isLive(rbIdx, person);
    //相続放棄
    else if(ChildCommon.idxs.isRefuse.input.includes(rbIdx)) ChildCommonRbHandler.isRefuse(rbIdx, person);
    //成人
    else if(ChildCommon.idxs.isAdult.input.includes(rbIdx)) ChildCommonRbHandler.isAdult(person.Qs[ChildCommon.idxs.isJapan.form]);
    //日本在住
    else ChildCommonRbHandler.isJapan(ChildCommon.idxs.count.input, person);
}

/**
 * 兄弟姉妹共通欄のラジオボタンのイベントを設定する
 * @param {number} rbIdx ラジオボタンのインデックス
 * @param {CollateralCommon} person 兄弟姉妹共通のインスタンス
 */
function setCollateralCommonRbsEvent(rbIdx, person){
    //子供存在
    if(CollateralCommon.idxs.isExist.input.includes(rbIdx)) CollateralCommonRbHandler.isExist(rbIdx, person);
    //同じ両親
    else if(CollateralCommon.idxs.isSameParents.input.includes(rbIdx)) CollateralCommonRbHandler.isSameParents(person.Qs[CollateralCommon.idxs.isLive.form]);
    //手続時生存
    else if(CollateralCommon.idxs.isLive.input.includes(rbIdx)) CollateralCommonRbHandler.isLive(rbIdx, person);
    //相続放棄
    else if(CollateralCommon.idxs.isRefuse.input.includes(rbIdx)) CollateralCommonRbHandler.isRefuse(rbIdx, person);
    //成人
    else if(CollateralCommon.idxs.isAdult.input.includes(rbIdx)) CollateralCommonRbHandler.isAdult(person.Qs[CollateralCommon.idxs.isJapan.form]);
    //日本在住
    else CollateralCommonRbHandler.isJapan(CollateralCommon.idxs.count.input, person);
}

/**
 * 子共通欄又は兄弟姉妹共通欄のイベントを設定する
 * @param {EveryPerson} person  イベントを設定する対象の共通欄インスタンス
 */
function setEventToCommonFieldset(person){
    const inputs = person.inputs;
    for(let i = 0, len = inputs.length; i < len; i++){
        //人数欄のとき
        if(i === person.constructor.idxs.count.input){
            countFormHandler(person, i, 1, 15);
        }else{
            if(person.constructor.name === "ChildCommon"){
                inputs[i].addEventListener("change", (e)=>{
                    setChildCommonRbsEvent(i, person);
                })
            }else{
                inputs[i].addEventListener("change", (e)=>{
                    setCollateralCommonRbsEvent(i, person);
                })
            }
        }
    }
}

/**
 * 子共通で入力された値を各個別フォームに初期値として反映させて初期表示を変更する
 * @param {object} iniData 
 */
function reflectData(iniData, idxs, instances){
    const isRefuseFalseIdx = idxs.isRefuse.input[no];
    for(let i = 0, len = instances.length; i < len; i++){
        for(let key in iniData){
            if(iniData[key].checked){
                instances[i].inputs[iniData[key].idx].checked = true;
                if(iniData[key].idx === isRefuseFalseIdx){
                    instances[i].inputs[iniData[key].idx - 1].disabled = true;
                    instances[i].inputs[iniData[key].idx].disabled = true;
                }else{
                    instances[i].inputs[iniData[key].idx].disabled = true;
                    instances[i].inputs[iniData[key].idx + 1].disabled = true;
                }
            }
        }
    }
}

/**
 * 引数fieldsetsに属するinputとbutton要素にタブインデックスを更新する
 * @param {HTMLElement} lastNextBtn 直前のfieldsetの次へボタン
 * @param {HTMLElement[]} fieldsets タブインデックスを更新するinput要素が属するfieldset
 */
function updateAscendantTabindex(lastNextBtn, fieldsets){
    let newTabindex = parseInt(lastNextBtn.getAttribute("tabindex")) + 1;
    for(let i = 0, len = fieldsets.length; i < len; i++){
        const els = fieldsets[i].querySelectorAll("input, button");
        for(let j = 0, len = els.length; j < len; j++){
            els[j].setAttribute("tabindex", (newTabindex + j));
        }
        newTabindex += els.length;
    }
}

/**
 * 個人入力欄のfieldsetの値の初期化、有効化、非表示にする
 * @param {EveryPersonButCommon} persons 初期化対象のインスタンス（複数可）
 */
function iniIndivisualFieldsets(persons){
    if(!Array.isArray(persons))
        persons = [persons];
    const startFormIdx = 2;
    for(let i = 0, len = persons.length; i < len; i++){
        iniAllInputs(persons[i].fieldset);
        Array.from(persons[i].Qs).slice(startFormIdx).forEach(Q => {
            Q.style.display = "none";
        });
        persons[i].nextBtn.disabled = true;
    }
}

/**
 * 共通入力欄のfieldsetの値の初期化、有効化、非表示にする
 * @param {ChildCommon|CollateralCommon} persons 初期化対象のインスタンス（複数可）
 */
function iniCommonFieldsets(persons){
    if(!Array.isArray(persons))
        persons = [persons];
    const startFormIdx = 1;
    const countInputIdx = 2;
    for(let i = 0, len = persons.length; i < len; i++){
        iniAllInputs(persons[i].fieldset);
        persons[i].inputs[countInputIdx].value = "1";
        Array.from(persons[i].Qs).slice(startFormIdx).forEach(Q => {
            Q.style.display = "none";
        });
        persons[i].nextBtn.disabled = true;
    }
}

/**
 * 子個人または兄弟姉妹個人のfieldsetの数を加減する
 * @param {string} relation (child,collateral)
 * @param {number} newCount 新しく入力された子又は兄弟姉妹の数
 */
function adjustChildOrCollateralFieldsetCount(relation, newCount){
    const oldTotalForms = document.getElementById(`id_${relation}-TOTAL_FORMS`);
    const oldCount = parseInt(oldTotalForms.value);
    const fieldsets = Array.from(document.getElementsByClassName(`${relation}Fieldset`));
    //増えたとき、増えた分のfieldsetを生成する
    if(newCount > oldCount){
        for(let i = oldCount; i < newCount; i ++){
            createChildOrCollateralFieldset(relation === "child"? true: false);
        }
    }else if(newCount < oldCount){
        //減ったとき、余分な子のfieldsetを削除する
        oldTotalForms.value = newCount;
        fieldsets.slice(newCount).forEach(el => el.parentNode.removeChild(el));
    }
}

/**
 * 子個人または兄弟姉妹個人のインスタンスの数を加減する
 * @param {string} relation (child, collateral)
 * @param {number} newCount 新しく入力された子又は兄弟姉妹の数
 */
function adjustChildOrCollateralInstanceCount(relation, newCount){
    const instance = relation === "child"? childs: collaterals;
    const newIdx = instance.length;
    if(newCount > newIdx){
        for(let i = 0, len = newCount - newIdx; i < len; i++){
            if(relation === "child")
                new Child(`id_child-${newIdx + i}-fieldset`);
            else
                new Collateral(`id_collateral-${newIdx + i}-fieldset`);
        }
    }else if(newCount < newIdx){
        instance.splice(newCount, newIdx - newCount);
    }
}

/**
 * エラー要素を初期化する
 * @param {EveryPersonButCommon[]} persons 
 */
function iniNoInputs(persons){
    for(let i = 0, len = persons.length; i < len; i++){
        const idxs = persons[i].constructor.idxs;
        persons[i].noInputs = Array.from(persons[i].fieldset.getElementsByTagName("input")).filter((_, x) =>{
            return !(idxs.index && x === idxs.index.input) &&
                   !(idxs.target && x === idxs.target.input) &&
                   !(idxs.target1 && x === idxs.target1.input) &&
                   !(idxs.target2 && x === idxs.target2.input);
        });
    }
}

/**
 * 子供欄から子の欄を表示するときの処理
 * @param {number} childCount 子の数
 * @return 子１のインスタンス
 */
function childCommonToChild(childCount){
    //子１のインスタンスが未生成のとき、子１インスタンスを生成してタブインデックスを設定する
    if(childs.length === 0){
        new Child("id_child-0-fieldset");
        updateTabIndex(childCommon, childs[0]);
    }
    //子のfieldsetとインスタンスの数を加減する（子のインスタンスにfieldsetの要素を紐付ける必要があるためインスタンスの加減はfieldsetの加減の後に行わなければならない）
    adjustChildOrCollateralFieldsetCount("child", childCount);
    adjustChildOrCollateralInstanceCount("child", childCount);
    //尊属欄全てと子の欄を初期化する
    if(ascendants.length > 0){
        iniIndivisualFieldsets(ascendants);
        ascendants.length = 0;
    }
    //すべての子のフィールドセットを初期化して子１を返す
    iniIndivisualFieldsets(childs);
    //エラー要素を初期化する
    iniNoInputs(childs);
    return childs[0];
}

/**
 * 子の欄の初期値に応じたイベントを発生させる
 * @param {Child|Collateral} person 初期値を反映させる人 
 * @param {object} iniData 初期値
 */
function dispatchIniChangeEvent(person, iniData){
    const inputs = person.inputs;
    const event = new Event("change");
    for(let key in iniData){
        if(iniData[key].checked){
            inputs[iniData[key].idx].checked = true;
            inputs[iniData[key].idx].dispatchEvent(event);
        }else{
            break;
        }
    }
}

/**
 * 子共通又は兄弟姉妹共通欄のデータを取得する
 * @param {ChildCommon|CollateralCommon} commonInstance 
 * @param {Object} indivisualIdxs
 * @param {Object} commonIdxs 
 * @returns 子共通又は兄弟姉妹共通のデータ
 */
function getCommonData(commonInstance, indivisualIdxs, commonIdxs){
    const inputs = commonInstance.inputs;
    const iniData = {
        isSameParents: {
            idx: indivisualIdxs.isSameParents.input[yes],
            checked: inputs[commonIdxs.isSameParents.input[yes]].checked ? true: false
        },
        isLiveTrue: {
            idx: indivisualIdxs.isLive.input[yes],
            checked: inputs[commonIdxs.isLive.input[yes]].checked ? true: false 
        },
        isRefuseFalse: { 
            idx: indivisualIdxs.isRefuse.input[no], 
            checked: inputs[commonIdxs.isRefuse.input[no]].checked ? true: false 
        },
        isAdultTrue: { 
            idx: indivisualIdxs.isAdult.input[yes],
            checked: inputs[commonIdxs.isAdult.input[yes]].checked ? true: false 
        },
        isJapanTrue: {
            idx: indivisualIdxs.isJapan.input[yes],
            checked: inputs[commonIdxs.isJapan.input[yes]].checked ? true: false 
        }
    }
    return iniData;
}

/**
 * １つのラジオボタンのイベントを発火させる
 * @param {HTMLElement} rb ラジオボタン要素
 */
function dispatchSingleRbEvent(rb){
    if(rb.checked){
        const event = new Event("change");
        rb.dispatchEvent(event);
    }
}

/**
 * fieldsetに初期値を反映させて、その初期値に応じたイベントを実行しておく
 * @param {ChildCommon|Child|CollateralCommon|Collateral} nextPerson 反映させるfieldset
 */
function setIniData(nextPerson){
    const {fieldset, inputs} = personDataToVariable(nextPerson);
    //子共通欄のとき
    if(fieldset.id === "id_child_common-0-fieldset"){
        //子がいないボタンが押されていたらchangeイベントを発生させる
        dispatchSingleRbEvent(inputs[ChildCommon.idxs.isExist.input[no]]);
    }else if(fieldset.classList.contains("childFieldset")){
        //子個人の欄のとき
        const iniData = getCommonData(childCommons[0], Child.idxs, ChildCommon.idxs);
        //子１の欄のとき、全ての子の欄に初期値を入力する
        if(fieldset.id === "id_child-0-fieldset")
            reflectData(iniData, Child.idxs, childs);
        //初期値があるときは、そのイベントを発生させる。チェックが連続しているときだけループを続ける
        dispatchIniChangeEvent(nextPerson, iniData);
    }else if(fieldset.id === "id_collateral_common-0-fieldset"){
        //兄弟姉妹共通欄のとき、兄弟姉妹がいないボタンが押されていたらchangeイベントを発生させる
        dispatchSingleRbEvent(inputs[CollateralCommon.idxs.isExist.input[no]]);
    }else if(fieldset.classList.contains("collateralFieldset")){
        //兄弟姉妹個人欄のとき
        const iniData = getCommonData(collateralCommons[0], Collateral.idxs, CollateralCommon.idxs);
        //子１の欄のとき、全ての子の欄に初期値を入力する
        if(fieldset.id === "id_collateral-0-fieldset")
            reflectData(iniData, Collateral.idxs, collaterals);
        //初期値があるときは、そのイベントを発生させる。チェックが連続しているときだけループを続ける
        dispatchIniChangeEvent(nextPerson, iniData);
    }
}

/**
 * 完了fieldsetの戻るボタンのクリックイベントハンドラー
 * @param {event} e 
 */
function handleSubmitBtnFieldsetPreBtnClick(e){
    //完了fieldsetを非表示にする
    const submitBtnFieldset = document.getElementById("submitBtnFieldset");
    const lastHr = getLastElByAttribute("hr", "tag");
    slideUp(lastHr);
    slideUp(submitBtnFieldset);
    lastHr.remove();
    //一つ前のfieldsetを有効化する
    const preFieldset = getLastElFromArray(reqPerson).fieldset;
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
    //一つ前のfieldsetを最初の項目にフォーカスする
    getLastElFromArray(reqPerson).inputs[0].focus();
    //最後のガイドをactiveにする
    const lastGuide = getLastElFromArray(Guide.guides);
    lastGuide.classList.add("active");
    //最後のガイドのキャレットを表示する
    const lastCaretIcon = getLastElFromArray(Guide.caretIcons);
    lastCaretIcon.style.display = "inline-block";
    //最後のガイドのチェックを非表示にする
    const lastCheckIcon = getLastElByAttribute("guideCheck", "class", lastGuide);
    lastCheckIcon.style.display = "none";
    //このイベントを削除する
    const preBtn = submitBtnFieldset.getElementsByClassName("preBtn")[0];
    preBtn.removeEventListener("click", handleSubmitBtnFieldsetPreBtnClick);
}

/**
 * 完了fieldsetのOKボタンのクリックイベントハンドラー
 * @param {EveryPersonButCommon} fromPerson 
 */
function cleanFormData(fromPerson){
    //インスタンスが生成されていないフォームのデータを初期化する
    if(fromPerson === getLastElFromArray(childs)){
        removeAllExceptFirst(Array.from(document.getElementsByClassName("childSpouseFieldset")));
        iniIndivisualFieldsets(childSpouses[0]);
        childSpouses.length = 0;
        removeAllExceptFirst(Array.from(document.getElementsByClassName("grandChildFieldset")));
        iniIndivisualFieldsets(grandChilds[0]);
        grandChilds.length = 0;
        iniIndivisualFieldsets(ascendants);
        ascendants.length = 0;
        removeAllExceptFirst(Array.from(document.getElementsByClassName("collateralFieldset")))
        iniIndivisualFieldsets(collaterals[0]);
        collaterals.length = 0;
    }else if(fromPerson === getLastElFromArray(childSpouses) || fromPerson === getLastElFromArray(grandChilds)){
        iniIndivisualFieldsets(ascendants);
        ascendants.length = 0;
        removeAllExceptFirst(Array.from(document.getElementsByClassName("collateralFieldset")))
        iniIndivisualFieldsets(collaterals[0]);
        collaterals.length = 0;
    }else if(fromPerson === getLastElFromArray(ascendants)){
        removeAllExceptFirst(Array.from(document.getElementsByClassName("collateralFieldset")))
        iniIndivisualFieldsets(collaterals[0]);
        collaterals.length = 0;
    }
}

/**
 * 完了fieldsetを有効化する
 * 
 * inputFieldやGuideのデータは１つ前のfieldsetのもののままにする
 * @param {EveryPersonButCommon} fromPerson 
 */
function enableSubmitBtnFieldset(fromPerson){
    //完了fieldsetを表示する
    const submitBtnFieldset = document.getElementById("submitBtnFieldset");
    displayNextFieldset(submitBtnFieldset);
    //最後のガイドのactiveを削除／キャレットを非表示、チェックを表示
    const lastGuide = getLastElFromArray(Guide.guides);
    lastGuide.classList.remove("active");
    const lastCaretIcon = getLastElFromArray(Guide.caretIcons);
    lastCaretIcon.style.display = "none";
    const lastGuideCheck = lastGuide.getElementsByClassName("guideCheck")[0];
    lastGuideCheck.style.display = "inline-block";
    //ボタンにタブインデックスを設定
    const lastFieldset = getLastElFromArray(reqPerson).fieldset;
    const lastTabindex = lastFieldset.getElementsByClassName("nextBtn")[0].getAttribute("tabindex");
    const newTabindex = lastTabindex + 1;
    const btns = submitBtnFieldset.getElementsByTagName("button");
    for(let i = 0, len = btns.length; i < len; i++){
        btns[i].setAttribute("tabindex", newTabindex + 1);
    }
    //戻るボタンにイベントを設定
    const preBtn = submitBtnFieldset.getElementsByClassName("preBtn")[0];
    preBtn.addEventListener("click", handleSubmitBtnFieldsetPreBtnClick);
    //完了ボタンにフォーカスを移動する
    const nextBtn = submitBtnFieldset.getElementsByClassName("nextBtn")[0];
    const handleSubmitBtnFieldsetNextBtnClick = cleanFormData(fromPerson);
    nextBtn.addEventListener("click", handleSubmitBtnFieldsetNextBtnClick)
    nextBtn.focus();
}

/**
 * 父母のインスタンスを生成してフィールドセットにインデックスを付与する
 */
function createFatherAndMotherInstance(){
    const father = new Ascendant("id_ascendant-0-fieldset");
    new Ascendant("id_ascendant-1-fieldset");
    for(let i = 0, len = ascendants.length; i < len; i++){
        ascendants[i].inputs[Ascendant.idxs.target.input].value = decedent.inputs[Decedent.idxs.index].value.trim();
    }
    return father;
}

/**
 * 子共通欄から父欄を表示するとき、子１の以外のfieldsetを削除、子全てのインスタンスを削除して父母のインスタンスを生成する。
 * @returns 父のインスタンス
 */
function childCommonToFather(){
    const childFieldsets = Array.from(document.getElementsByClassName("childFieldset"));
    if(childFieldsets.length > 1){
        removeAllExceptFirst(childFieldsets);
        removeAllExceptFirst(Array.from(document.getElementsByClassName("childSpouseFieldset")));
        removeAllExceptFirst(Array.from(document.getElementsByClassName("grandChildFieldset")));
    }
    if(childs.length > 1){
        iniIndivisualFieldsets(childs[0]);
        iniIndivisualFieldsets(childSpouses[0]);
        iniIndivisualFieldsets(grandChilds[0])
    }
    childs.length = 0;
    document.getElementById(`id_child-TOTAL_FORMS`).value = 1;
    return createFatherAndMotherInstance();
}

/**
 * 有効化するfieldsetのタブインデックスを更新する
 * @param {EveryPerson} fromPerson １つ前の人
 * @param {EveryPerson} nextPerson タブインデックスを更新する人
 */
function updateTabIndex(fromPerson, nextPerson){
    const newTabindex = parseInt(fromPerson.nextBtn.getAttribute("tabindex")) + 1;
    const els = nextPerson.fieldset.querySelectorAll("input, button");
    for(let i = 0, len = els.length; i < len; i++){
        els[i].setAttribute("tabindex", newTabindex + i);
    }
}

/**
 * 子の相続人のインスタンスを配列に入れてソートして、その結果を返す
 * @returns ソートされた子の相続人のインスタンスが格納された配列
 */
function getSortedChildsHeirsInstance(){
    const childsHeirs = [...childSpouses, ...grandChilds];
    const childIndexMap = new Map(childs.map((child, index) => [child, index]));
    childsHeirs.sort((a, b) => {
        const indexA = childIndexMap.get(a.successFrom);
        const indexB = childIndexMap.get(b.successFrom);
        if (indexA === indexB)
            return (a instanceof ChildSpouse) ? -1 : 1;
        return indexA - indexB;
    });
    return childsHeirs;
}

/**
 * 子の相続人のfieldsetのタイトルと属性（id,name,class,tabindex,for）を更新する
 * @param {[ChildSpouse, GrandChild]} instances 子の相続人のインスタンスが格納された配列
 */
function updateChildsHeirFieldsets(instances){
    const fieldsets = document.getElementsByClassName("childsHeirFieldset");
    let childSpouseIdx = 0; //子の配偶者のインデックス（id用）
    let grandChildIdx = 0; //孫のインデックス（id用）
    let preChildIdx; //１つ前の死亡している子のインデックス
    let countSuccessFrom = 0; //数次相続の数をカウントする（タイトルの本番に使用するため）
    let countHeir = 0; //死亡している子ごとに相続人をカウントする（タイトルの枝番に使用するため）
    for(let i = 0, len = instances.length; i < len; i++){
        const isSpouse = instances[i].constructor.name === "ChildSpouse";
        const zokugara = isSpouse? "配偶者": "子"; //タイトル用
        const relation = isSpouse? "child_spouse": "grand_child"; //idとfor用
        const newIdx = isSpouse? childSpouseIdx: grandChildIdx; //属性に付与するインデックス
        //既存の子の配偶者欄のfieldsetのタイトルを変更する
        const titleEl = fieldsets[i].querySelector(".fieldsetTitle");
        const childIdx = childs.indexOf(instances[i].successFrom); //子のインデックスを取得する
        //子のインデックスが１つ前のものと同じ時、その子の相続人のインデックスを加算する
        if(childIdx === preChildIdx){
            countHeir += 1;
        }else{
            //異なるとき、その子の相続人のインデックスを１に戻す、孫のインデックスも１に戻す、数次相続の数を１増やす
            countHeir = 1;
            countSuccessFrom += 1;
        }
        preChildIdx = childIdx;
        UpdateTitle.childsHeirs(titleEl, instances[i].successFrom, zokugara, countSuccessFrom, countHeir);
        //フィールどセットのidを更新
        fieldsets[i].id = `id_${relation}-${newIdx}-fieldset`;
        //氏名のlabelのforを更新
        const label = fieldsets[i].querySelector("label");
        label.setAttribute("for", `id_${relation}-${newIdx}-name`);
        //inputとbuttonのname、id、tabindex、クラスを更新する
        const preFieldset = i === 0? 
            getLastElByAttribute("childFieldset", "class"):
            fieldsets[i -1];
        let newTabindex = parseInt(preFieldset.getElementsByClassName("nextBtn")[0].getAttribute("tabindex")) + 1;
        const els = fieldsets[i].querySelectorAll("input, button");
        for(let j = 0, len = els.length; j < len; j++){
            if(els[j].tagName.toLowerCase() === "input"){
                if(isSpouse){
                    updateAttribute(["id", "name"], els[j], `${newIdx}`, "0");
                    if(els[j].type === "hidden"){
                        if(els[j].id.includes("index")){
                            const title = fieldsets[i].getElementsByClassName("fieldsetTitle")[0].textContent;
                            els[j].value = title.match(/[^．]+/)[0];
                        }else{
                            els[j].value = instances[i].successFrom.inputs[Child.idxs.index.input].value.trim();
                        }
                    }
                }else{
                    updateAttribute(["id", "name"], els[j], `${newIdx}`, "0");
                    if(els[j].type === "hidden"){
                        if(els[j].id.includes("index")){
                            const title = fieldsets[i].getElementsByClassName("fieldsetTitle")[0].textContent;
                            els[j].value = title.match(/[^．]+/)[0];
                        }else if(els[j].id.includes("target1")){
                            els[j].value = instances[i].successFrom.inputs[Child.idxs.index.input].value.trim();
                        }
                    }
                } 
            }
            els[j].setAttribute("tabindex", newTabindex + j);
        }
        const className = isSpouse? `child${childIdx}Spouse`: `child${childIdx}Child${grandChildIdx}`;
        fieldsets[i].classList.add(className);
        isSpouse? childSpouseIdx += 1: grandChildIdx += 1;
    }
    return fieldsets;
}

/**
 * 子の相続人のインスタンスを生成する（生成したインスタンスのidのインデックスは後で更新するため0固定でOK）
 * @param {boolean} isSpouse 子の配偶者フラグ
 * @param {number} idx 被相続人の子のインデックス
 */
function createChildsHeirInstance(isSpouse, idx){
    if(isSpouse){
        const newInstance = new ChildSpouse(`id_child_spouse-0-fieldset`);
        newInstance.successFrom = childs[idx];
    }else{
        for(let i = 0, len = parseInt(childs[idx].inputs[Child.idxs.count.input].value); i < len; i++){
            const newInstance =  new GrandChild(`id_grand_child-0-fieldset`);
            newInstance.successFrom = childs[idx];
        }
    }
}

/**
 * 子の相続人のfieldsetを全て削除して、ソートされた子の相続人のインスタンスのインデックス順にfieldsetを生成する
 * 
 * 子の配偶者又は孫がいないときは、テンプレ元のfieldsetを復活させる
 * @param {(ChildSpouse|GrandChild)[]} childsHeirs 被相続人の子の相続人のインスタンスが格納されたインスタンス
 */
function createChildsHeirsFieldset(childsHeirs){
    let preFieldset = getLastElByAttribute("childFieldset", "class");
    const childSpouseTemplate = removeSpecificPatternClass(document.getElementById("id_child_spouse-0-fieldset"), /^child\d+Spouse$/);
    const grandChildTemplate = removeSpecificPatternClass(document.getElementById("id_grand_child-0-fieldset"), /^child\d+Child\d+$/);
    const templates = {
        "ChildSpouse": childSpouseTemplate,
        "GrandChild": grandChildTemplate
    };
    removeAll(Array.from(document.getElementsByClassName("childSpouseFieldset")).concat(Array.from(document.getElementsByClassName("grandChildFieldset"))));
    for(let i = 0, len = childsHeirs.length; i < len; i++){
        const newElement = templates[childsHeirs[i].constructor.name].cloneNode(true);
        preFieldset.after(newElement);
        preFieldset = newElement;
    }
    document.getElementById("id_child_spouse-TOTAL_FORMS").value = childSpouses.length;
    document.getElementById("id_grand_child-TOTAL_FORMS").value = grandChilds.length;
    if(childSpouses.length === 0) preFieldset.after(templates["ChildSpouse"].cloneNode(true));
    else if(grandChilds.length === 0) preFieldset.after(templates["GrandChild"].cloneNode(true));
}

/**
 * 子の相続人のインスタンスとfieldsetを紐付ける
 * @param {ChildSpouse|GrandChild} instances 
 * @param {HTMLCollection} fieldsets 
 */
function linkChildsHeirInstanceToFieldset(instances, fieldsets){
    for(let i = 0, len = instances.length; i < len; i++){
        instances[i].fieldset = fieldsets[i];
        instances[i].Qs = Array.from(fieldsets[i].getElementsByClassName("Q"));
        instances[i].inputs = Array.from(fieldsets[i].getElementsByTagName("input"));
        instances[i].preBtn = fieldsets[i].getElementsByClassName("preBtn")[0];
        instances[i].nextBtn = fieldsets[i].getElementsByClassName("nextBtn")[0];
        instances[i].errMsgEls = Array.from(fieldsets[i].getElementsByClassName("errorMessage"));
    }
}

/**
 * 被相続人の子の相続人のインスタンスとfieldsetを初期化する
 */
function iniChildsHeirInstanceAndFieldset(){
    removeAllExceptFirst(document.getElementsByClassName("childSpouseFieldset"));
    removeAllExceptFirst(document.getElementsByClassName("grandChildFieldset"));
    childSpouses.length = 0;
    grandChilds.length = 0;
    new ChildSpouse("id_child_spouse-0-fieldset");
    new GrandChild("id_grand_child-0-fieldset");
    iniIndivisualFieldsets(childSpouses.concat(grandChilds));
    childSpouses.length = 0;
    grandChilds.length = 0;
}
/**
 * 最後の子の欄から次に表示する欄を判別する
 * @returns 次に表示する人又はtrue（trueを返すとき完了fieldsetを表示する）
 */
function selectChildTo(){
    //子の相続人のインスタンスとfieldsetを初期化
    iniChildsHeirInstanceAndFieldset();
    let isDone = false; //完了フラグ
    let isChildSpouse = false; //子の配偶者表示フラグ
    let isGrandChild = false; //孫表示フラグ
    //権利移動のパターンをチェックする
    for(let i = 0, len = childs.length; i < len; i++){
        const inputs = childs[i].inputs;
        const isLive = inputs[Child.idxs.isLive.input[yes]].checked;
        const isExist = inputs[Child.idxs.isExist.input[yes]].checked;
        const isRefuse = inputs[Child.idxs.isRefuse.input[yes]].checked;
        const isSpouse = inputs[Child.idxs.isSpouse.input[yes]].checked;
        const isChild = inputs[Child.idxs.isChild.input[yes]].checked;
        if(isLive){
            if(!isRefuse)
                isDone = true;
            continue;
        }
        /**
         * 数次のとき
         * ・子の中に相続時生存true、かつ相続放棄false、かつ配偶者がいるとき
         * ・子の中に相続時生存true、かつ相続放棄false、かつ子がいるとき
         */
        if(isExist && !isRefuse){
            if(isSpouse){
                isChildSpouse = true;
                createChildsHeirInstance(true, i);
            }
            if(isChild){
                isGrandChild = true;
                createChildsHeirInstance(false, i);
            }
        }
        /**
         * 代襲のとき
         * ・子の中に相続時生存false、かつ子がいるとき
         */
        if(!isExist && isChild){
            isGrandChild = true;
            createChildsHeirInstance(false, i);
        }
    }
    /**
     * 数次相続のとき
     * １，インスタンスをソートする
     * ２，fieldsetの生成と削除
     * ３，fieldsetのタイトルと属性値を更新する
     * ４，インスタンスとfieldsetを紐付ける
     */
    if(isChildSpouse || isGrandChild){
        const sortedInstances = getSortedChildsHeirsInstance();
        createChildsHeirsFieldset(sortedInstances);
        const sortedFieldsets = updateChildsHeirFieldsets(sortedInstances);
        linkChildsHeirInstanceToFieldset(sortedInstances, sortedFieldsets);
        /**
         * ・数次相続があり配偶者と子（孫）の両方がいるとき、子のインデックスが若い方を先に取得する
         * ・配偶者のみのとき、配偶者を表示する
         * ・孫のみのとき、孫を表示する
         */
        if(isChildSpouse && isGrandChild)
            return childs.indexOf(grandChilds[0].successFrom) < childs.indexOf(childSpouses[0].successFrom) ? grandChilds[0]: childSpouses[0];
        if(isChildSpouse)
            return childSpouses[0];  
        if(isGrandChild)
            return grandChilds[0];
    }
    /**
     * 子のみが相続したときは完了fieldsetを返す
     * ・１人以上手続時生存trueかつ相続放棄falseかつ配偶者falseかつ子（孫）false
     */
    if(isDone)
        return true;
    //尊属に権利が移動したとき（卑属に相続人がいないとき）
    return createFatherAndMotherInstance();
}

/**
 * 次の人のインデックスを返す
 * @param {Child|Ascendant|Collateral} persons
 * @param {HTMLElement} preFieldset 
 * @returns 次の人のインデックス
 */
function getNextPersonIdx(persons, preFieldset){
    for(let i = 0, len = persons.length; i < len; i++){
        if(persons[i].fieldset === preFieldset)
            return i + 1;
    }   
}

/**
 * 次の子の相続人を返す
 * ・子の配偶者と孫から次のfieldsetと一致するfieldsetを持つ人を探す
 * @param {HTMLElement} preFieldset 
 * @returns 次の子の相続人又はnull
 */
function getNextChildsHeir(preFieldset){
    const childsHeirs = childSpouses.concat(grandChilds);
    const nextFieldset = getNextElByTag(preFieldset, "fieldset");
    const nextHeir = childsHeirs.find(heir => nextFieldset === heir.fieldset);
    return nextHeir || null;
}

/**
 * 子の最後の相続人から次へ表示する欄を判別する
 * @returns 卑属が相続人のときはtrue、違うときは父インスタンス
 */
function selectChildsHeirTo(){
    //子、子の配偶者、孫の中に手続時生存trueかつ相続放棄falseが１人以上いるとき、完了fieldsetを表示する
    const descendants = childs.concat(childSpouses, grandChilds);
    const isLiveAndNotRefuse = descendant => {
        const isLive = descendant.inputs[descendant.constructor.idxs.isLive.input[yes]].checked;
        const isRefuse = descendant.inputs[descendant.constructor.idxs.isRefuse.input[no]].checked;
        return isLive && isRefuse;
    };
    if (descendants.some(isLiveAndNotRefuse)) {
        return true;
    }
    //いないとき、父母インスタンスを生成して父インスタンスを返す
    return createFatherAndMotherInstance()
}

/**
 * 子の最後の相続人のインスタンスを返す
 * @returns 子の最後の相続人のインスタンス
 */
function getLastChildsHeir(){
    const childsHeirs = childSpouses.concat(grandChilds);
    let maxIndex = -1;
    let lastChildsHeir = null;
    for (let childsHeir of childsHeirs) {
        const index = childs.indexOf(childsHeir.successFrom);
        if (index > maxIndex) {
            maxIndex = index;
            lastChildsHeir = childsHeir;
        } else if (index === maxIndex && childsHeir instanceof GrandChild) {
            // 同じchildsのインデックスを持つ場合は、GrandChildの方を優先
            lastChildsHeir = childsHeir;
        }
    }
    return lastChildsHeir;
}

/**
 * 兄弟姉妹共通欄から兄弟姉妹１を表示するとき、兄弟姉妹個人のfieldsetとインスタンスを調整する
 * @param {EveryPerson} fromPerson 
 * @return 兄弟姉妹１のインスタンス
 */
function collateralCommonToCollateral(fromPerson){
    const count = countCollateral();
    //兄弟姉妹１のインスタンスが未生成のとき、兄弟姉妹１を生成、タイトル変更、タブインデックス設定をする
    if(collaterals.length === 0){
        const firstCollateral = new Collateral("id_collateral-0-fieldset");
        UpdateTitle.collateralCommonFieldsetOrFirstCollateralFieldset(fromPerson, firstCollateral, "兄弟姉妹１");
        updateTabIndex(collateralCommons[0], firstCollateral);
    }
    //兄弟姉妹のfieldsetの数を加減する
    adjustChildOrCollateralFieldsetCount("collateral", count);
    //兄弟姉妹のインスタンスの数を加減する（兄弟姉妹のインスタンスにfieldsetの要素を紐付ける必要があるためインスタンスの加減はfieldsetの加減の後に行わなければならない）
    adjustChildOrCollateralInstanceCount("collateral", count);
    //兄弟姉妹個人の欄を初期化する
    iniIndivisualFieldsets(collaterals);
    //エラー要素を初期化する
    iniNoInputs(collaterals);
    return collaterals[0];
}

/**
 * 兄弟姉妹共通欄から返すデータを判別する
 * @param {EveryPerson} fromPerson 
 */
function selectCollateralCommonTo(fromPerson){
    //兄弟姉妹がいるとき、兄弟姉妹１を返す
    const isExist = fromPerson.inputs[CollateralCommon.idxs.isExist.input[yes]].checked;
    if(isExist)
        return collateralCommonToCollateral(fromPerson);
    //兄弟姉妹がいないとき、配偶者が手続時生存trueかつ相続放棄falseであれば完了フラグを返す
    const isSpouseLive = spouses[0].inputs[Spouse.idxs.isLive.input[yes]].checked;
    const isSpouseRefuse = spouses[0].inputs[Spouse.idxs.isRefuse.input[yes]].checked;
    if(isSpouseLive && !isSpouseRefuse)
        return true;
    return null;
}

/**
 * 母から母方の祖父を表示するとき
 * @returns 母方の祖父インスタンス
 */
function motherToMotherGfather(){
    //父方の祖父から戻ってきているとき、父方の祖父母のfieldsetを初期化して尊属インスタンスを父母のみにする
    if(ascendants[2] && ascendants[2].fieldset.id === "id_ascendant-2-fieldset"){
        iniIndivisualFieldsets(ascendants.slice(2));
        ascendants.length = 2;
    }
    //母方の祖父母のインスタンスが生成されてないときは生成する
    let motherGfather = ascendants.find(ascendant => ascendant.fieldset.id === "id_ascendant-4-fieldset");
    if(motherGfather){
        return motherGfather;
    }else{
        motherGfather = new Ascendant("id_ascendant-4-fieldset");
        new Ascendant("id_ascendant-5-fieldset");
        //母方の祖父母のtargetを設定する
        for(let i = 2, len = ascendants.length; i < len; i++){
            ascendants[i].inputs[Ascendant.idxs.target.input].value = ascendants[1].inputs[Ascendant.idxs.index.input].value.trim();
        }
        return motherGfather;
    }
}

/**
 * 母から兄弟姉妹共通を表示するとき
 * @returns 兄弟姉妹共通インスタンス
 */
function motherToCollateralCommon(){
    //祖父母のインスタンスがあるとき、祖父母のfieldsetを初期化して尊属インスタンスを父母のみにする
    if(ascendants[2]){
        iniIndivisualFieldsets(ascendants.slice(2));
        ascendants.length = 2;
    }
    //兄弟姉妹共通インスタンスが存在するとき、既存の兄弟姉妹共通インスタンスを返す
    if(collateralCommons[0] && collateralCommons[0].fieldset.id === "id_collateral_common-0-fieldset")
        return collateralCommons[0];
    else
        return new CollateralCommon("id_collateral_common-0-fieldset");
}

/**
 * 母から父方の祖父を表示する
 * @returns 父方の祖父インスタンス
 */
function motherToFatherGfather(){
    //次に父方の祖父インスタンスが生成されているとき、既存の父方の祖父インスタンスを返す
    if(ascendants[2] && ascendants[2].fieldset.id === "id_ascendant-2-fieldset")
        return ascendants[2];
    //父方の祖父母インスタンスが生成されていないとき、父方の祖父母インスタンスを生成する
    const fatherGfather = new Ascendant("id_ascendant-2-fieldset");
    new Ascendant("id_ascendant-3-fieldset");
    //次に母方の祖父インスタンスが生成されているとき、尊属インスタンスを並び替える
    if(ascendants.length === 6){
        ascendants.sort((a, b) => {
            return parseInt(a.fieldset.id.split('-')[1]) - parseInt(b.fieldset.id.split('-')[1]);
        });
    }
    //父方の祖父母のtargetを設定する
    for(let i = 2; i < 4; i++){
        ascendants[i].inputs[Ascendant.idxs.target.input].value = ascendants[0].inputs[Ascendant.idxs.index.input].value.trim();
    }
    return fatherGfather;
}

/**
 * 母欄から返すデータを判別する
 * @returns 次に入力してもらう人のインスタンスまたはtrue（完了フラグ）
 */
function selectMotherTo(){
    const fatherInputs = ascendants[0].inputs;
    const isFatherLive = fatherInputs[Ascendant.idxs.isLive.input[yes]].checked;
    const isFatherRefuse = fatherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
    const motherInputs = ascendants[1].inputs;
    const isMotherRefuse = motherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
    const isMotherExistFalse = motherInputs[Ascendant.idxs.isExist.input[no]].checked;
    /**
     * 母方の祖父欄を表示する条件
     * ・父が手続時trueかつ母が相続時false
     * ・父が相続放棄trueかつ母が相続時false
     */
    if((isFatherLive || isFatherRefuse) && isMotherExistFalse)
        return motherToMotherGfather();
    /**
     * 兄弟姉妹共通欄を表示する条件
     * ・父と母の両方が相続放棄true
     */
    if(isFatherRefuse && isMotherRefuse)
        return motherToCollateralCommon();
    /**
     * 完了fieldsetを表示する条件
     * ・父が相続放棄trueで母が手続時存在trueかつ相続放棄false
     * ・父が手続時存在trueかつ相続放棄falseかつ母が相続放棄true
     * ・父が手続時存在trueかつ相続放棄falseかつ母が手続時存在trueかつ相続放棄false
    */
    const isFatherHeir = isFatherLive && !isFatherRefuse;
    const isMotherLive = motherInputs[Ascendant.idxs.isLive.input[yes]].checked;
    const isMotherHeir = isMotherLive && !isMotherRefuse;
    if(
        (isFatherRefuse && isMotherHeir) ||
        (isMotherRefuse && isFatherHeir) ||
        (isFatherHeir && isMotherHeir)
    ){
        return true;
    }
    //上記のいずれにも該当しないとき、父方の祖父を表示する
    return motherToFatherGfather();
}

/**
 * 父方の祖母から次に表示する欄を判別する
 * @returns 次に表示する欄またはtrue（完了フラグ）
 */
function selectFatherGmotherTo(){
    const fatherGfatherInputs = ascendants[2].inputs;
    const isFatherGfatherExistNo = fatherGfatherInputs[Ascendant.idxs.isExist.input[no]].checked;
    const isFatherGfatherLiveYes = fatherGfatherInputs[Ascendant.idxs.isLive.input[yes]].checked;
    const isFatherGfatherRefuseYes = fatherGfatherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
    const isFatherGfatherRefuseNo = fatherGfatherInputs[Ascendant.idxs.isRefuse.input[no]].checked;
    const isFatherGfatherHeir = isFatherGfatherLiveYes && isFatherGfatherRefuseNo;
    const fatherGmotherInputs = ascendants[3].inputs;
    const isFatherGmotherExistNo = fatherGmotherInputs[Ascendant.idxs.isExist.input[no]].checked;
    const isFatherGmotherLiveYes = fatherGmotherInputs[Ascendant.idxs.isLive.input[yes]].checked;
    const isFatherGmotherRefuseYes = fatherGmotherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
    const isFatherGmotherRefuseNo = fatherGmotherInputs[Ascendant.idxs.isRefuse.input[no]].checked;
    const isFatherGmotherHeir = isFatherGmotherLiveYes && isFatherGmotherRefuseNo;
    const motherInputs = ascendants[1].inputs;
    const isMotherLiveYes = motherInputs[Ascendant.idxs.isLive.input[yes]].checked;
    const isMotherRefuseYes = motherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
    const isMotherRefuseNo = motherInputs[Ascendant.idxs.isRefuse.input[no]].checked;
    const isMotherHeir = isMotherLiveYes && isMotherRefuseNo;
    /**
     * 入力が完了したとき
     *・母が手続時生存trueかつ相続放棄false
     *・母が相続放棄true、かつ父方の祖父母のいずれかが手続時生存trueかつ相続放棄false
     */
    if(isMotherHeir || (isMotherRefuseYes && (isFatherGfatherHeir || isFatherGmotherHeir))){
        return true;
    }else if((isFatherGfatherExistNo || isFatherGfatherRefuseYes) && (isFatherGmotherExistNo || isFatherGmotherRefuseYes) && isMotherRefuseYes){
        /**
         * 兄弟姉妹共通を返すとき（父方の祖父母が相続人でなく、かつ母方が相続人でないことが確定している）
         * ・父方の祖父母の両方が相続時生存falseまたは相続放棄true、かつ母が相続放棄true
        */
        if(collateralCommons[0])
            return collateralCommons[0];
        return new CollateralCommon("id_collateral_common-0-fieldset")
    }
    //母方の祖父を返すとき
    if(ascendants[4] && ascendants[5])
        return ascendants[4];
    const motherGfather = new Ascendant("id_ascendant-4-fieldset");
    new Ascendant("id_ascendant-5-fieldset");
    for(let i = 4; i < 6; i++){
        ascendants[i].inputs[Ascendant.idxs.target.input].value = ascendants[1].inputs[Ascendant.idxs.index.input].value.trim();
    }
    return motherGfather;
}

/**
 * 子共通欄から次に表示する欄を判別する
 * @returns 次に表示するインスタンス
 */
function selectChildCommonTo(){
    const childCount = countChild();
    if(childCount > 0)
        return childCommonToChild(childCount);
    return childCommonToFather();
}

/**
 * 前の子にindexとtargetのvalueをセットして次の子のインスタンスを返す
 * @param {EveryPersonButCommon} fromPerson 前の子のインスタンス
 */
function getNextChild(fromPerson){
    if(fromPerson.inputs[fromPerson.constructor.idxs.isSameParents.input[yes]].checked){
        fromPerson.inputs[fromPerson.constructor.idxs.target2.input].value = "２";
    }
    return childs[childs.indexOf(fromPerson) + 1];
}

/**
 * 母方の祖母から次に表示する欄を判別する
 * @returns 次に表示するインスタンス
 */
function selectMotherGmotherTo(){
    const isHeir = (ascendant) => ascendant.inputs[Ascendant.idxs.isLive.input[yes]].checked && ascendant.inputs[Ascendant.idxs.isRefuse.input[no]].checked;
    //尊属が父母と母方の祖父母のとき
    if(ascendants.length === 4){
        //父、母方の祖父母のいずれかが手続時生存trueかつ相続放棄falseのとき、完了フラグを返す
        if(isHeir(ascendants[0]) || isHeir(ascendants[2]) || isHeir(ascendants[3]))
            return true;
    }

    //尊属が父母と両方の祖父母のとき
    if(ascendants.length === 6){
        //両方の祖父母のいずれかが手続時生存trueかつ相続放棄falseのとき、完了フラグを返す
        if(isHeir(ascendants[2]) || isHeir(ascendants[3]) || isHeir(ascendants[4]) || isHeir(ascendants[5]))
            return true;
    }

    //尊属の中に相続人がいないとき、兄弟姉妹共通を表示する
    return collateralCommons[0] || new CollateralCommon("id_collateral_common-0-fieldset");
}

/**
 * 次に回答してもらう人を判別して、インスタンスを生成する
 * @param {EveryPerson} fromPerson 前の人
 * @returns 次に回答してもらう人を返す|trueのとき入力完了|falseのとき該当なし（エラー）
 */
function getNextPersonAndCreateCourse(fromPerson){
    const preFieldset = fromPerson.fieldset;
    const preFieldsetId = preFieldset.id;
    //１つ前が被相続人インスタンスのとき、配偶者インスタンスを返す
    if(fromPerson === decedents[0])
        return spouse;
    //１つ前が配偶者インスタンスのとき、子共通インスタンスを返す
    if(fromPerson === spouses[0])
        return childCommon;
    //１つ前が子共通欄のとき
    if(fromPerson === childCommons[0])
        return selectChildCommonTo();
    //１つ前が最後の子個人欄のとき
    if(fromPerson === getLastElFromArray(childs))
        return selectChildTo();
    //１つ前が最後以外の子の欄のとき
    if(childs.includes(fromPerson))
        return getNextChild(fromPerson);
    //１つ前が最後の子の相続人のとき
    if(fromPerson === getLastChildsHeir())
        return selectChildsHeirTo();
    //１つ前が子の相続人のとき
    if(childSpouses.concat(grandChilds).includes(fromPerson))
        return getNextChildsHeir(preFieldset);
    //１つ前が父、父方の祖父、母方の祖父のインスタンスからのとき
    if(["id_ascendant-0-fieldset", "id_ascendant-2-fieldset", "id_ascendant-4-fieldset"].includes(preFieldsetId))
        return ascendants[getNextPersonIdx(ascendants, preFieldset)];
    //１つ前が母欄のとき
    if(preFieldsetId === "id_ascendant-1-fieldset")
        return selectMotherTo();
    //１つ前が父方の祖母欄のとき
    if(preFieldsetId === "id_ascendant-3-fieldset")
        return selectFatherGmotherTo();
    //１つ前が母方の祖母インスタンスのとき
    if(preFieldsetId === "id_ascendant-5-fieldset")
        return selectMotherGmotherTo();
    //１つ前が兄弟姉妹共通インスタンスのとき
    if(preFieldsetId === "id_collateral_common-0-fieldset")
        return selectCollateralCommonTo(fromPerson);
    //１つ前が最後の兄弟姉妹個人のインスタンスのとき
    if(fromPerson === getLastElFromArray(collaterals))
        return true;
    //１つ前が最後以外の兄弟姉妹個人のインスタンスのとき
    if(collaterals.includes(fromPerson))
        return collaterals[getNextPersonIdx(collaterals, preFieldset)];
    //該当がないとき
    return false;
}

/**
 * 有効化する次のfieldsetの属性値の変更やイベント設定をする（インスタンスとfieldsetの生成、削除はしていない）
 * @param {EveryPerson} fromPerson １つ前の人
 * @param {EveryPerson} nextPerson 次に入力する人
 */
function adjustFieldsetsAndInstance(fromPerson, nextPerson){
    //有効化するfieldsetの要素などを取得する
    reqPerson.push(nextPerson);;
    const nextFieldset = nextPerson.fieldset;
    const nextFieldsetId = nextFieldset.id;
    /**
     * 母欄を有効化するとき
     * タブインデックスを設定
     * イベントを設定
     */
    if(nextFieldsetId === "id_spouse-0-fieldset"){
        updateTabIndex(fromPerson, nextPerson);
        setEventToIndivisualFieldset(nextPerson);
    }else if(nextFieldsetId === "id_child_common-0-fieldset"){
        /**
         * 子共通欄のとき
         * ・タブインデックスを設定
         * ・イベントを設定
         * ・初期値を設定
         */
        updateTabIndex(fromPerson, nextPerson);
        setEventToCommonFieldset(nextPerson);
        setIniData(nextPerson);
    }else if(nextFieldset.classList.contains("childFieldset")){
        /**
         * 子個人欄のとき
         * ・イベントを設定する
         * ・初期値を入力する
         */
        setEventToIndivisualFieldset(nextPerson);
        setIniData(nextPerson);
    }else if(nextFieldset.classList.contains("childSpouseFieldset")){
        //子の配偶者のとき
        setEventToIndivisualFieldset(nextPerson);
    }else if(nextFieldset.classList.contains("grandChildFieldset")){
        //孫のとき
        setEventToIndivisualFieldset(nextPerson);
    }else if(nextFieldset.classList.contains("ascendantFieldset")){
        /**
         * 尊属欄のとき
         * ・イベントを設定する
         */
        setEventToIndivisualFieldset(nextPerson);
        /**
         * 父欄のとき
         * ・全尊属の欄のタイトルを設定
         * ・父母欄のタブインデックスを設定
         * 子から権利移動したとき
         * ・子の欄を子１のみにして子１の入力欄を初期化する
        */
        if(nextFieldsetId === "id_ascendant-0-fieldset"){
            UpdateTitle.ascendants(fromPerson, true);
            const ascendantFieldsets = Array.from(document.getElementsByClassName("ascendantFieldset"));
            updateAscendantTabindex(fromPerson.nextBtn, ascendantFieldsets);
        }else if(nextPerson.fieldset.id === "id_ascendant-4-fieldset"){
            UpdateTitle.motherGparents(true);
        }
    }else if(nextPerson.fieldset.classList.contains("collateralCommonFieldset")){
        /**
         * 兄弟姉妹共通欄のとき
         * ・イベントを設定する
         * ・タブインデックスを設定する
         * ・タイトルの番号を設定する
         */
        setEventToCommonFieldset(nextPerson);
        updateTabIndex(fromPerson, nextPerson);
        UpdateTitle.collateralCommonFieldsetOrFirstCollateralFieldset(fromPerson, nextPerson, "兄弟姉妹");
        setIniData(nextPerson);
    }else if(nextPerson.fieldset.classList.contains("collateralFieldset")){
        /**
         * 兄弟姉妹個人欄のとき
         * ・イベントを設定する
         * ・初期値を設定する
         */
        setEventToIndivisualFieldset(nextPerson);
        setIniData(nextPerson);
    }
}

/**
 * 次の項目と次のガイドを有効化して前の項目を無効化する
 * @param fromPerson 入力が完了した人
 */
function oneStepFoward(fromPerson){
    const nextPerson = getNextPersonAndCreateCourse(fromPerson);
    if(nextPerson === null){
        console.log("次の人が見つかりませんでした");
        return;
    }
    //前のfieldsetを無効化
    fromPerson.fieldset.disabled = true;
    //入力が完了又はエラーのとき
    if(typeof nextPerson === "boolean"){
        //fromPersonに応じてインスタンスを初期化する

        //入力完了のとき完了fieldsetを表示してエラーのときは何もせずに処理を中止
        if(nextPerson) enableSubmitBtnFieldset(fromPerson);
        return;
    }
    //有効化対象のfieldsetの複製や属性値を調整、イベントの設定、初期値の設定をする
    adjustFieldsetsAndInstance(fromPerson, nextPerson);
    //次のfieldsetを表示と要素を取得
    const nextFieldset = nextPerson.fieldset; 
    displayNextFieldset(nextFieldset);
    //ガイドを更新
    updateGuide(fromPerson, nextPerson);
    //戻るボタンにイベントを設定
    const oneStepBackHandler = oneStepBack(nextPerson);
    const preBtn = nextFieldset.getElementsByClassName("preBtn")[0];
    preBtn.addEventListener("click", oneStepBackHandler);
    //次へボタンにイベントを設定
    //配偶者欄又は母方の祖父母欄のとき、子供欄又は兄弟姉妹欄用のイベントを設定するようにする
    oneStepFowardHandler = function () {oneStepFoward(nextPerson)};
    const nextBtn = nextFieldset.getElementsByClassName("nextBtn")[0];
    nextBtn.addEventListener("click", oneStepFowardHandler);
}

/**
 * チェック結果に応じて処理を分岐する
 * @param {boolean or string} isValid チェック結果
 * @param {HTMLElement} errMsgEl エラーメッセージを表示する要素
 * @param {boolean or string} message エラーメッセージ
 * @param {HTMLElement} el チェック対象の要素
 * @param {EveryPerson} person 対象の人
 */
function afterValidation(isValid, errMsgEl, message, el, person){
    //エラー要素から削除
    const nextBtn = person.nextBtn;
    person.noInputs = person.noInputs.filter(x => x.id !== el.id);
    //チェック結果がtrueのとき
    if(typeof isValid === "boolean"){
        //エラーメッセージを隠す
        errMsgEl.style.display = "none";
        //次へボタンを有効化判別
        if(person.noInputs.length === 0)
            nextBtn.disabled = false;  
    }else{
        //エラーメッセージを表示する
        errMsgEl.innerHTML = message;
        errMsgEl.style.display = "block";
        //配列に取得
        person.noInputs.push(el);
        //次へのボタンを無効化
        nextBtn.disabled = true;
        el.value = "";
    }
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {elemet} el チェック対象の要素
 */
function decedentValidation(el){
    //氏名のときは全角チェック、その他は空欄チェック
    return (el === decedent.inputs[Decedent.idxs.name]) ? isOnlyZenkaku(el): isBlank(el);
}

/**
 * イベント
 */
//最初の画面表示後の処理
window.addEventListener("load", ()=>{
    //初期処理
    initialize();
    
    //全input要素にenterを押したことによるPOSTが実行されないようにする
    const inputArr = document.getElementsByTagName("input");
    for(let i = 0, len = inputArr.length; i < len; i++){
        inputArr[i].addEventListener("keydown",(e)=>{
            if(e.key === "Enter")
                e.preventDefault();
        })
    }

    //被相続人の入力欄にイベントを設定する
    for(let i = 0, len = decedent.inputs.length; i < len; i++){
        //氏名欄のとき、enterで死亡年欄（次の入力欄）にフォーカス移動するイベントを設定する
        if(i === Decedent.idxs.name){
            decedent.inputs[i].addEventListener("keydown",(e)=>{
                setEnterKeyFocusNext(e, decedent.inputs[Decedent.idxs.deathYear]);
                disableNumKey(e);
            })
            decedent.inputs[i].addEventListener("input", (e)=>{
                handleFullWidthInput(decedent, decedent.inputs[i]);
            })
        }

        //前入力欄にchangeイベントを設定する
        if(i !== Decedent.idxs.index && i !== Decedent.idxs.target){
            decedent.inputs[i].addEventListener("change", (e)=>{
                //入力値のチェック結果を取得
                const el = e.target;
                isValid = decedentValidation(el);
                //チェック結果に応じて処理を分岐
                afterValidation(isValid, decedent.errMsgEls[i], isValid, el, decedent);
    
                //住所又は本籍地のの都道府県のとき、市町村データを取得する
                if(el === decedent.inputs[Decedent.idxs.prefecture] || el === decedent.inputs[Decedent.idxs.domicilePrefecture]){
                    const val = el.value;
                    getCityData(val, decedent.inputs[i + 1]);
                }
            })
        }
    }

    //氏名欄にフォーカスする
    decedent.inputs[Decedent.idxs.name].focus();
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    //サイドバーの高さを調整する
    setSidebarHeight();
});

//被相続人ガイド
Guide.btns[0].addEventListener("click", scrollToTargetHandler)

//被相続人欄の次へボタン
decedent.nextBtn.addEventListener("click",(e)=>{

    //被相続人欄の入力値を全てチェックする
    for(let i = 0, len = decedent.inputs.length; i < len; i++){
        if(i !== Decedent.idxs.index && i !== Decedent.idxs.target){
            isValid = decedentValidation(decedent.inputs[i])
            afterValidation(isValid, decedent.errMsgEls[i], isValid, decedent.inputs[i], decedent);
        }
    }

    //エラーがあるときは、処理を中止してエラーの要素にフォーカスする
    if(decedent.noInputs.length > 0){
        e.preventDefault();
        decedent.noInputs[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    oneStepFoward(decedent);
})
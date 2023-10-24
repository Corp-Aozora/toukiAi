"use strict";

/**
 * @typedef {Decedent|Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} EveryPerson
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
    //フィールドセット、入力欄、ボタン
    constructor(fieldsetId){
        this.fieldset = document.getElementById(fieldsetId);
        this.Qs = Array.from(this.fieldset.getElementsByClassName("Q"));
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
        this.preBtn = this.fieldset.getElementsByClassName("preBtn")[0];
        this.nextBtn = this.fieldset.getElementsByClassName("nextBtn")[0];
        this.errMsgEls = Array.from(this.fieldset.getElementsByClassName("errorMessage"));
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
        domicileCity : 6
    }
    //フィールドセット、入力欄、ボタン
    constructor(fieldsetId){
        super(fieldsetId);
        this.inputs = this.inputs.concat(Array.from(this.fieldset.getElementsByTagName("select")));
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
        isJapan : {form: 6, input: [11, 12]}
    }
    constructor(fieldsetId){
        super(fieldsetId);
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
    }
    constructor(fieldsetId){
        super(fieldsetId);
        if(this.constructor === Child)
            childs.push(this);
    }
}

//子の配偶者
const childSpouses = [];
class ChildSpouse extends Spouse{
    constructor(fieldsetId){
        super(fieldsetId);
        this.successFrom;
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
    }
    constructor(fieldsetId){
        super(fieldsetId);
        this.successFrom;
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
        isJapan:{form: 7, input: [13, 14]}
    }
    constructor(fieldsetId){
        super(fieldsetId);
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
        isSameSpouse:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        count:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]}
    }
    constructor(fieldsetId){
        super(fieldsetId);
        collaterals.push(this);
    }
}

//入力が必要な人
const reqFieldsets = [decedent];
//次へボタンのイベントハンドラー
let oneStepFowardHandler;
//子の数をカウントする
let countChild = () => parseInt(childCommon.inputs[ChildCommon.idxs.count.input].value);

/**
 * ロード時の初期処理
 * ・サイドバーを更新する
 * ・被相続人の入力欄のエラー要素を取得する（死亡年はnullになることがないため除く）
 */
function initialize(){
    updateSideBar();
    invalidEls = [...decedent.inputs];
    invalidEls.splice(Decedent.idxs.deathYear, 1);
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
    if(!checkPrefecture(val, el)) return;
    //エラー要素から都道府県を削除する
    invalidEls = invalidEls.filter(x => x !== el);
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
            invalidEls.push(el);
        }
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        //次へボタンの表示判別
        decedent.nextBtn.disabled = invalidEls.length === 0 ? false: true;
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
        errMsgEls : person.errMsgEls
    }
}

/**
 * クローンしたフォームのid又はnameを変更する
 * @param {string[]|string} attributes 変更対象の属性（複数可）
 * @param {HTMLElement} el 変更対象の要素
 * @param {number} newVal 置き換える値
 * @param {number} oldVal 置き換える対象の値
 */
function updateCloneIdOrName(attributes, el, newVal, oldVal){
    if(!Array.isArray(attributes)) attributes = [attributes];
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
 * タイトルの枝番を更新する（母欄から母方の祖父欄に移動するとき用）
 * 
 * フィールドセットとガイドで共通使用
 * @param {boolean} isFieldset フィールドセットのタイトル変更フラグ（falseのときはガイドのタイトルを変更する）
 * @example 「１－１．（続柄）について」を「１－２．（続柄）について」に変換する
 */
function updateTitleBranchNum(isFieldset){
    const motherGParents = ["id_ascendant-4-fieldset", "id_ascendant-5-fieldset"].map(id => 
        isFieldset ?
            document.getElementById(id) :
            document.getElementsByClassName("motherGGuide")[id === "id_ascendant-4-fieldset" ? 0 : 1]
    );
    const zokugara = ["母方の祖父", "母方の祖母"];
    for(let i = 0, len = motherGParents.length; i < len; i++){
        const oldTitleEl = isFieldset?
            motherGParents[i].getElementsByClassName("fieldsetTitle")[0]:
            motherGParents[i].getElementsByTagName("button")[0];
        const oldNumbering = getTitleNumbering(oldTitleEl);
        const idx = oldNumbering.lastIndexOf("－");
        const newNumbering = oldNumbering.slice(0, idx + 1) + hankakuToZenkaku(String(3 + i));
        const newTitle = `${newNumbering}．${zokugara[i]}について`;
        oldTitleEl.textContent = newTitle;
    }
}

/**
 * タイトルの枝番と続柄のインデックスを更新する（子個人又は兄弟姉妹個人専用）
 * 
 * フィールドセットとガイドで共通使用
 * @param {HTMLElement} el 対象の要素
 * @param {string} zokugara 続柄（日本語）、子又は兄弟姉妹
 * @example 「１－１．（続柄）１について」を「１－２．（続柄）２について」に変換する
 */
function updateTitleBranchNumAndPersonIdx(el, zokugara){
    const oldNumbering = getTitleNumbering(el); //旧ナンバリングを取得する
    const idx = oldNumbering.lastIndexOf("－"); //－のインデックスを取得する
    const oldBranchNum = oldNumbering.slice(idx + 1); //枝番を取得する
    const newBranchNum = parseInt(ZenkakuToHankaku(oldBranchNum)) + 1; //枝番に１加算する
    const newNumbering = oldNumbering.slice(0, idx + 1) + hankakuToZenkaku(String(newBranchNum)); //枝番を更新したナンバリングを取得する
    const newTitle = `${newNumbering}．${zokugara}${hankakuToZenkaku(String(newBranchNum))}について`; //枝番と続柄のインデックスを更新したタイトルを取得する
    el.textContent = newTitle; //新しいタイトルに上書きする
}

/**
 * クローンした要素の属性を更新（子個人又は兄弟姉妹個人の欄を生成したとき用）
 * @param {HTMLElement} fieldset 属性を更新する対象のフィールドセット
 * @param {string} relation 続柄（child又はcollateral）
 * @param {number} newIdx 属性を更新する対象の人のインデックス
 */
function updateCloneAttribute(fieldset, relation, newIdx){
    //フィールどセットのidを変更
    fieldset.id = `id_${relation}-${newIdx}-fieldset`;
    //氏名のlabelのforを変更
    fieldset.querySelector("label").setAttribute("for", `id_${relation}-${newIdx}-name`);
    //inputとbuttonのname、id、tabindexを変更する
    let newTabindex = parseInt(getLastElByAttribute("nextBtn", "class", fieldset).getAttribute("tabindex")) + 1;
    const els = fieldset.querySelectorAll("input, button");
    for(let i = 0, len = els.length; i < len; i++){
        if(els[i].tagName.toLowerCase() === "input")
            updateCloneIdOrName(["name", "id"], els[i], newIdx, /\d+/g);
        els[i].setAttribute("tabindex", newTabindex + i);
    }
}

/**
 * 直前のフィールドセットをコピーしてタイトルや属性値を変更する
 * @param {HTMLElement} preEl コピー元のフィールドセット
 * @param {string} relation 続柄（child又はcollateral）
 * @param {number} newIdx 属性に付与する新しいインデックス
 * @returns idのプレフィックスを更新した複製したフィールドセット
 */
function cloneAndUpdateFieldset(preEl, relation, newIdx){
    const newFieldset = preEl.cloneNode(true);
    const titleEl = newFieldset.querySelector(".fieldsetTitle");
    let zokugara = relation === "child" ? "子": "兄弟姉妹";
    updateTitleBranchNumAndPersonIdx(titleEl, zokugara);
    updateCloneAttribute(newFieldset, relation, newIdx);

    return newFieldset;
}

/**
 * 子個人又は兄弟姉妹個人のフィールドセットを生成する
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
    const newFieldset = cloneAndUpdateFieldset(preFieldset, relation, oldCount);
    // 新しいfieldset要素をFormsetに追加します
    preFieldset.after(newFieldset);
}

/**
 * フィールドセットに属する要素を取得する
 * @param {boolean} isForward 次へボタンフラグ（falseは戻るボタンが押されたとき）
 * @param {EveryPerson} person 取得する要素を持つ人
 */
function getFieldsetEl(isForward, person){
    if(isForward){
        reqFieldsets.push(person);
        invalidEls.length = 0;
        invalidEls = preserveInvalidEls.length > 0 ?
            preserveInvalidEls.pop():
            Array.from(person.fieldset.getElementsByTagName("input"));
    }else{
        preserveInvalidEls.push(invalidEls.slice());
        invalidEls.length = 0; //preserveInvalidElArrに追加する前に実行するとpreserveInvalidElArrに正しく追加されない
    }
}

/**
 * 次のフィールドセットの有効化
 * @param {HTMLElement} nextFieldset 有効化するフィールドセット
 */
function displayNextFieldset(nextFieldset){
    //次のフィールドセットを表示/hrを挿入/次のフィールドセットにスクロール/最初の入力欄にフォーカス
    slideDown(nextFieldset);
    document.createElement("hr").className = "my-5";
    nextFieldset.before(hr);
    scrollToTarget(nextFieldset);
    nextFieldset.querySelector("input").focus();
}

/**
 * ガイドを押したら対象のフィールドセットにスクロールするイベントを設定する
 * @param {event} e クリックイベント
 */
function scrollToTargetHandler(e){
    const idx = Guide.btns.indexOf(e.target);
    scrollToTarget(reqFieldsets[idx].fieldset, 0);
}

/**
 * 対象のガイド要素を取得して強調する（事前にGuide.elIdxの加算をすること）
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function addNextGuideActive(guideList){
    Guide.guides.push(guideList.getElementsByClassName("guide")[Guide.elIdx]);
    Guide.btns.push(guideList.getElementsByClassName("guideBtn")[Guide.elIdx]);
    Guide.caretIcons.push(guideList.getElementsByClassName("guideCaret")[Guide.elIdx]);
    const lastGuide = getLastElFromArray(Guide.guides);
    if(window.getComputedStyle(lastGuide).display === "none")
        lastGuide.style.display = "block";
    lastGuide.classList.add("active");
    getLastElFromArray(Guide.btns).disabled = false;
    getLastElFromArray(Guide.caretIcons).style.display = "inline-block";
}

/**
 * 完了したフィールドセットのガイドを通常表示にする
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function removePreGuideActive(guideList){
    getLastElFromArray(Guide.guides).classList.remove("active");
    getLastElFromArray(Guide.caretIcons).style.display = "none";
    Guide.checkIcons.push(guideList.getElementsByClassName("guideCheck")[Guide.elIdx]);
    getLastElFromArray(Guide.checkIcons).style.display = "inline-block";
}

/**
 * 子のガイドの数を追加又は削除する/追加のときは、タイトルとidを変更して表示する/全ての子を表示する
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {number} oldCount 初期値である１又は前に入力された子の人数
 * @param {number} newCount 新たに入力された子の人数
 */
function adjustChildGuideCount(guideList, oldCount, newCount){
    const childGuides = Array.from(guideList.getElementsByClassName("childGuide"));
    //子が増えたとき
    if(newCount > oldCount){
        for(let i = oldCount; i < newCount; i ++){
            //直前のガイドをコピー
            const copyFrom = getLastElByAttribute("childGuide", "class");
            const clone = copyFrom.cloneNode(true);
            //タイトルの枝番を変更
            updateTitleBranchNumAndPersonIdx(clone.querySelector("button"), "子");
            //idを変更して非表示から表示に変更して最後の要素の次に挿入する
            clone.style.display = "block";
            clone.id = `id_child-${i}-guide`;
            copyFrom.after(clone)
        }
    }else if(newCount < oldCount){
        //子が減ったとき、減った分の子のガイドを削除する
        childGuides.slice(newCount).forEach(el => el.parentNode.removeChild(el));
    }
    //子のガイドが２つ以上あるとき、子１以外のガイドも表示する
    if(childGuides.length > 1)
        displayAdditionalGuide(guideList, "childGuide");
}

/**
 * 子の配偶者と孫のガイド両方を生成する
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
    //フィールドセットは子の配偶者又は孫のテンプレとして残ってるだけの可能性があるためインスタンスの数でループする
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
    updateAscendantTitle(fromPerson, false);
    Guide.elIdx += 2;
}

/**
 * ガイドを更新する
 * @param {} fromPerson １つ前に入力された人
 */
function updateGuide(fromPerson){
    const fromFieldset = fromPerson.fieldset;
    const fromFieldsetId = fromFieldset.id;
    const guideList = document.getElementById("guideList");
    const childCount = countChild();
    //一つ前のガイドを通常表示にする
    removePreGuideActive(guideList);
    //子共通欄から父欄を表示するとき
    if(fromPerson === childCommon && childCount === 0){
        childCommonToFatherGuide(fromPerson, guideList);
    }else if(childCount > 0 && fromPerson === getLastElFromArray(childs)){
        //最後の子からのとき
        //子の配偶者と孫のガイドを全て削除する
        const secondaryHeirGuides = guideList.querySelectorAll(".childSpouseGuide, .grandChildGuide");
        if(secondaryHeirGuides)
            removeAll(secondaryHeirGuides);
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
            //父欄を表示するとき
            //母のガイドも無効化した状態で表示する
            guideList.getElementsByClassName("ascendantGuide")[1].style.display = "block";
            //タイトルの本番を変更する
            updateAscendantTitle(fromPerson, false);
        }
        //次のガイドにインデックスを移す
        Guide.elIdx += 1;
    }else if(fromFieldsetId === "id_ascendant-1-fieldset" && collateralCommons.length === 1){
        //母の欄から兄弟姉妹欄を表示するとき
        Guide.elIdx += 5;
    }else if(fromFieldsetId === "id_ascendant-1-fieldset" && ascendants[2].fieldset.id === "id_ascendant-4-fieldset"){
        //母の欄から母方の祖父欄を表示するとき
        guideList.getElementsByClassName("motherGGuide")[1].style.display = "block";
        updateTitleBranchNum(false);
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
            adjustChildGuideCount(guideList, oldCount, newCount);
        }
    }
    //次の項目を強調する
    addNextGuideActive(guideList);
    //次の項目のガイドボタンにイベントを追加
    getLastElFromArray(Guide.btns).addEventListener("click", scrollToTargetHandler);
}

/**
 * 前の項目を有効化する
 * @param {EveryPerson} currentPerson 無効化対象の人
 */
function putBackFieldset(currentPerson){
    const disableField = currentPerson.fieldset; //無効化対象のフィールドセット
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ
    //無効化するフィールドにあるイベントが設定されている要素を初期化してイベントを削除する
    replaceElements(disableField, "input");
    replaceElements(disableField, "button");
    currentPerson.inputs = Array.from(disableField.getElementsByTagName("input"));
    currentPerson.preBtn = disableField.getElementsByClassName("preBtn")[0];
    currentPerson.nextBtn = disableField.getElementsByClassName("nextBtn")[0];
    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    reqFieldsets.pop();
    slideUp(removeHr);
    removeHr.remove();
    //直前の項目を有効化してスクロール
    const preFieldset = getLastElFromArray(reqFieldsets).fieldset;
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
    //一つ前のフィールドの要素を取得する
    getFieldsetEl(false, currentPerson);
    //子共通、兄弟姉妹共通、子の最後の欄に戻るときは、途中の入力データを保存しない
    const target = [childCommons[0], collateralCommons[0], getLastElFromArray(childs)].map(item => item?.fieldset).filter(Boolean);
    if(target.includes(preFieldset))
        preserveInvalidEls.length = 0;
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
    else if(currentGuideId === "id_collateral_common-0-guide" && getLastElFromArray(ascendants).fieldset.id === "id_ascendant-3-guide") 
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
 * @param {} currentPerson 押された戻るボタンが属するフィールドセットの１つ前のフィールドセット
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
    if(!Array.isArray(els)) els = [els];
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
 * @param {HTMLElement} el 対象のエラー要素
 * @param {HTMLElement} btn 無効化したいボタン
 */
function pushInvalidEl(el, btn){
    if(invalidEls.indexOf(el) === -1){
        invalidEls.push(el);
        btn.disabled = true;
    }
}

/**
 * エラー要素を追加して要素をスライドダウン表示する
 * 
 * pushInvalidElとslideDownIfHiddenをまとめた関数
 * @param {HTMLElement} errEl 追加するエラー要素
 * @param {HTMLElement} btn 無効化するボタン
 * @param {HTMLElement} displayEl スライドダウン表示する要素
 */
function pushInvalidElAndSDIfHidden(errEl, btn, displayEl){
    pushInvalidEl(errEl, btn);
    slideDownIfHidden(displayEl);
}

/**
 * 相続する続柄が変わったときの処理
 * 
 * pushInvalidEl, iniQs, slideDownAfterSlideUpをまとめた関数
 * @param {...(HTMLElement|number)} args 
 * [0] {HTMLElement} el
 * [1] {HTMLElement} btn
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
    if(!Array.isArray(exclude)) exclude = [exclude];
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
    uncheckTargetElements(getLastElFromArray(reqFieldsets).inputs, rbIdxs);
    if(textInput !== null)
        textInput.value = textInput.type === "number" ? "0": "";
    const isSlideUp = slideUpEls(Qs, startIdx, endIdx);
    return isSlideUp;
}

/**
 * 特定の入力欄をチェックして次へボタンの有効化判別と不要な質問の初期化
 * @param {HTMLElement} checkEl 次へボタン有効化前にチェックするエラー要素
 * @param {HTMLElement} nextBtn 次へボタン
 * @param {HTMLElement[]} Qs 全質問要素
 * @param {number} iniStartIdx 初期化を開始する質問のインデックス
 * @param {number} iniEndIdx 初期化を終了する質問のインデックス
 * @param {number[]} iniRbIdxs 初期化するラジオボタンのインデックス
 * @param {HTMLElement} textInput テキスト要素（必要なときだけ）
 */
function breakQ(checkEl, nextBtn, Qs = null, iniStartIdx = null, iniEndIdx = null, iniRbIdxs = null, textInput = null){
    invalidEls = invalidEls.filter(x => x === checkEl);
    if(invalidEls.length === 0) nextBtn.disabled = false;
    if(Qs) iniQs(Qs, iniStartIdx, iniEndIdx, iniRbIdxs, textInput);
}

/**
 * 共通のラジオボタンイベントハンドラー
 */
class CommonRbHandler{
    //true又はfalseに応じた処理を行う
    static handleYesNo(rbIdx, yesIdx, yesAction, noAction){
        if(rbIdx === yesIdx) yesAction();
        else noAction();
    }
    //日本在住
    static isJapan(idx, person){
        breakQ(person.inputs[idx], person.nextBtn);
    }
}

/**
 * 配偶者のラジオボタンのイベントハンドラー
 */
class SpouseRbHandler extends CommonRbHandler{
    //相続時存在
    static isExist(rbIdx, spouse){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isExist.input[yes],
            ()=>{
                //yesAction
                //エラー要素に日本在住を追加して次へボタンを無効にする、手続時存在を表示する
                pushInvalidElAndSDIfHidden(inputs[Spouse.idxs.isJapan.input[yes]], nextBtn, Qs[Spouse.idxs.isLive.form]);
                //氏名欄が無効なとき、氏名欄を有効にしてエラー要素に氏名欄を追加する
                if(inputs[Spouse.idxs.name.input].disabled){
                    inputs[Spouse.idxs.name.input].disabled = false;
                    pushInvalidEl(inputs[Spouse.idxs.name.input], nextBtn);
                }
            }
            ,()=>{
                //noAction
                //エラー要素を全て削除する/次へボタンを有効にする/氏名欄を初期化して無効にする
                invalidEls.length = 0;
                nextBtn.disabled = false;
                inputs[Spouse.idxs.name.input].value = "";
                inputs[Spouse.idxs.name.input].disabled = true;
                errMsgEls[Spouse.idxs.name.input].innerHTML = "";
                errMsgEls[Spouse.idxs.name.input].style.display = "none";
                //3問目以降の質問を全て非表示にして値を初期化する
                const rbIdxs = getSequentialNumArr(Spouse.idxs.isLive.input[yes], Spouse.idxs.isJapan.input[no])
                iniQs(Qs, Spouse.idxs.isLive.form, Spouse.idxs.isJapan.form, rbIdxs);
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, spouse){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isLive.input[yes],
            ()=>{
                //エラー要素に日本在住trueを追加して次へボタンを無効化/被相続人以外の子欄の非表示と値の初期化/相続放棄欄を表示
                const rbIdx = getSequentialNumArr(Spouse.idxs.isRemarriage.input[yes], Spouse.idxs.isStepChild[no]);
                changeCourse(
                    inputs[Spouse.idxs.isJapan.input[yes]], nextBtn,
                    Qs, Spouse.idxs.isRemarriage.form, Spouse.idxs.isStepChild.form, rbIdx, null,
                    Qs[Spouse.idxs.isRefuse.form]
                )
            },
            ()=>{
                //被相続人以外の子のエラーメッセージを非表示
                errMsgEls[Spouse.idxs.isRemarriage.form].style.display = "none";
                errMsgEls[Spouse.idxs.isRemarriage.form].innerHTML = "";
                const rbIdxs = getSequentialNumArr(Spouse.idxs.isRefuse.input[yes], Spouse.idxs.isJapan.input[no]);
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/被相続人以外の子欄を表示
                changeCourse(
                    inputs[Spouse.idxs.isStepChild.input[no]], nextBtn,
                    Qs, Spouse.idxs.isRefuse.form, Spouse.idxs.isJapan.form, rbIdxs, null,
                    Qs[Spouse.idxs.isRemarriage.form]
                )
            }
        )
    }

    //配偶者存在
    static isSpouse(rbIdx, spouse){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isRemarriage.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化
                pushInvalidEl(inputs[Spouse.idxs.isStepChild.input[no]], nextBtn);
                iniQs(Qs, Spouse.idxs.isStepChild.form, Spouse.idxs.isStepChild.form, Spouse.idxs.isStepChild.input);
                //システム対応外であることを表示する
                errMsgEls[Spouse.idxs.isRemarriage.form].style.display = "block";
                errMsgEls[Spouse.idxs.isRemarriage.form].innerHTML = "本システムでは対応できません";

            },
            ()=>{
                //エラーを非表示にする
                errMsgEls[Spouse.idxs.isRemarriage.form].style.display = "none";
                errMsgEls[Spouse.idxs.isRemarriage.form].innerHTML = "";
                errMsgEls[Spouse.idxs.isStepChild.form].style.display = "none";
                errMsgEls[Spouse.idxs.isStepChild.form].innerHTML = "";
                //被相続人以外の子を表示する
                slideDownIfHidden(Qs[Spouse.idxs.isStepChild.form], nextBtn);
            }
        )
    }

    //被相続人以外の子を表示する
    static isStepChild(rbIdx, spouse){
        const {inputs, nextBtn, errMsgEls} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isStepChild.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化
                pushInvalidEl(inputs[Spouse.idxs.isStepChild.input[no]], nextBtn);
                //システム対応外であることを表示する
                errMsgEls[Spouse.idxs.isStepChild.form].style.display = "block";
                errMsgEls[Spouse.idxs.isStepChild.form].innerHTML = "本システムでは対応できません";
            },
            ()=>{
                //エラーを非表示にする
                errMsgEls[Spouse.idxs.isStepChild.form].style.display = "none";
                errMsgEls[Spouse.idxs.isStepChild.form].innerHTML = "";
                //名前が入力されているときは次へボタンを有効化する
                breakQ(inputs[Spouse.idxs.name.input], nextBtn);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, spouse){
        const {inputs, Qs, nextBtn} = personDataToVariable(spouse);
        this.handleYesNo(rbIdx, Spouse.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する、日本在住を非表示にして値を初期化
                breakQ(inputs[Spouse.idxs.name.input], nextBtn, Qs, Spouse.idxs.isJapan.form, Spouse.idxs.isJapan.form, Spouse.idxs.isJapan.input);
            },
            ()=>{
                //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                pushInvalidElAndSDIfHidden(inputs[Spouse.idxs.isJapan.input[yes]], nextBtn, Qs[Spouse.idxs.isJapan.form]);
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
    static isSameParents(person){
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
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        const rbIdxs = rbIdx === Child.idxs.isLive.input[yes] ? 
            getSequentialNumArr(Child.idxs.isExist.input[yes], Child.idxs.isChild.input[no]):
            Child.idxs.isRefuse.input.concat(Child.idxs.isAdult.input).concat(Child.idxs.isJapan.input);
        this.handleYesNo(rbIdx, Child.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    inputs[Child.idxs.isJapan.input[yes]], nextBtn,
                    Qs, Child.idxs.isExist.form, Child.idxs.count.form, rbIdxs, Qs[Child.idxs.count.form],
                    Qs[Child.idxs.isRefuse.form]
                )
            },
            ()=>{
                //noAction
                slideUpEls(Qs[Child.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    inputs[Child.idxs.count.input], nextBtn,
                    Qs, Child.idxs.isRefuse.form, Child.idxs.isJapan.form, rbIdxs, null,
                    Qs[Child.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Child.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    inputs[Child.idxs.count.input], nextBtn,
                    Qs, Child.idxs.isChild.form, Child.idxs.count.form, Child.idxs.isChild.input, inputs[Child.idxs.count.input],
                    Qs[Child.idxs.isRefuse.form]
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(Child.idxs.isRefuse.input[yes], Child.idxs.isChild.input[no]);
                changeCourse(
                    inputs[Child.idxs.count.input], nextBtn,
                    Qs, Child.idxs.isRefuse.form, Child.idxs.count.form, rbIdxs, inputs[Child.idxs.count.input],
                    Qs[Child.idxs.isChild.form]
                )
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        this.handleYesNo(rbIdx, Child.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する、falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(Child.idxs.isSpouse.input[yes], Child.idxs.isJapan.input[no], Child.idxs.count.input);
                breakQ(inputs[Child.idxs.name.input], nextBtn, Qs, Child.idxs.isSpouse.form, Child.idxs.isJapan.form, rbIdxs, inputs[Child.idxs.count.input]);
            },
            ()=>{
                //手続時存在trueのとき
                if(inputs[Child.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(inputs[Child.idxs.isJapan.input[yes]], nextBtn, Qs[Child.idxs.isAdult.form]);
                }else if(inputs[Child.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(inputs[Child.idxs.count.input], nextBtn, Qs[Child.idxs.isSpouse.form]);
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
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(person);
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
        breakQ(inputs[Child.idxs.name.input], nextBtn);
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
    if(Child.idxs.isSameParents.input.includes(rbIdx)) ChildRbHandler.isSameParents(person);
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
 * 孫の欄のラジオボタンのイベントハンドラー
 */
class GrandChildRbHandler extends CommonRbHandler{
    //同じ配偶者
    static isSameParents(person){
        //手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(person.Qs[GrandChild.idxs.isLive.form]);
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        const rbIdxs = rbIdx === GrandChild.idxs.isLive.input[yes] ? 
            getSequentialNumArr(GrandChild.idxs.isExist.input[yes], GrandChild.idxs.isChild.input[no]):
            GrandChild.idxs.isRefuse.input.concat(GrandChild.idxs.isAdult.input).concat(GrandChild.idxs.isJapan.input);
        this.handleYesNo(rbIdx, GrandChild.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    inputs[GrandChild.idxs.isJapan.input[yes]], nextBtn,
                    Qs, GrandChild.idxs.isExist.form, GrandChild.idxs.isChild.form, rbIdxs, null,
                    Qs[GrandChild.idxs.isRefuse.form]
                )
            },
            ()=>{
                //noAction
                slideUpEls(Qs[GrandChild.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    inputs[GrandChild.idxs.isChild.input[no]], nextBtn,
                    Qs, GrandChild.idxs.isRefuse.form, GrandChild.idxs.isJapan.form, rbIdxs, null,
                    Qs[GrandChild.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    inputs[GrandChild.idxs.isChild.input[no]], nextBtn,
                    Qs, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.input, null,
                    Qs[GrandChild.idxs.isRefuse.form]
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(GrandChild.idxs.isRefuse.input[yes], GrandChild.idxs.isChild.input[no]);
                changeCourse(
                    inputs[GrandChild.idxs.isChild.input[no]], nextBtn,
                    Qs, GrandChild.idxs.isRefuse.form, GrandChild.idxs.isChild.form, rbIdxs, null,
                    Qs[GrandChild.idxs.isChild.form]
                )
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する、falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(GrandChild.idxs.isSpouse.input[yes], GrandChild.idxs.isJapan.input[no]);
                breakQ(inputs[GrandChild.idxs.name.input], nextBtn, Qs, GrandChild.idxs.isSpouse.form, GrandChild.idxs.isJapan.form, rbIdxs, null);
            },
            ()=>{
                //手続時存在trueのとき
                if(inputs[GrandChild.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(inputs[GrandChild.idxs.isJapan.input[yes]], nextBtn, Qs[GrandChild.idxs.isAdult.form]);
                }else if(inputs[GrandChild.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(inputs[GrandChild.idxs.isChild.input[no]], nextBtn, Qs[GrandChild.idxs.isSpouse.form]);
                }
            }            
        )
    }

    //配偶者確認
    static isSpouse(rbIdx, person){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素を追加して次へボタンを無効化/子存在欄を初期化/システム対応外のエラーメッセージ表示
                pushInvalidEl(inputs[GrandChild.idxs.isChild.input[no]], nextBtn);
                iniQs(Qs, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.form, GrandChild.idxs.isChild.input);
                errMsgEls[GrandChild.idxs.isSpouse.form].style.display = "block";
                errMsgEls[GrandChild.idxs.isSpouse.form].textContent = "本システムでは対応できません";
            },
            ()=>{
                //配偶者存在欄と子供存在欄のエラーメッセージを非表示にする/子供存在欄を表示する
                errMsgEls[GrandChild.idxs.isSpouse.form].style.display = "none";
                errMsgEls[GrandChild.idxs.isSpouse.form].textContent = "";
                slideDownAndScroll(Qs[GrandChild.idxs.isChild.form]);
            }
        )
    }

    //子供存在
    static isChild(rbIdx, person){
        const {inputs, nextBtn, errMsgEls} = personDataToVariable(person);
        this.handleYesNo(rbIdx, GrandChild.idxs.isChild.input[yes],
            ()=>{
                //エラー要素を追加して次へボタンを無効化/システム対応外のエラーメッセージ表示
                pushInvalidEl(inputs[GrandChild.idxs.isChild.input[no]], nextBtn);
                errMsgEls[GrandChild.idxs.isChild.form].style.display = "block";
                errMsgEls[GrandChild.idxs.isChild.form].textContent = "本システムでは対応できません";
            },
            ()=>{
                //エラーメッセージを非表示にする/氏名欄が適切なとき、次へボタンを有効化する
                errMsgEls[GrandChild.idxs.isChild.form].style.display = "none";
                errMsgEls[GrandChild.idxs.isChild.form].textContent = "";
                breakQ(inputs[GrandChild.idxs.name.input], nextBtn);
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
    if(GrandChild.idxs.isSameParents.input.includes(rbIdx)) GrandChildRbHandler.isSameParents(person);
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
                    inputs[Ascendant.idxs.isJapan.input[yes]], nextBtn,
                    Qs, Ascendant.idxs.isExist.form, Ascendant.idxs.isChild.form, rbIdx, null,
                    Qs[Ascendant.idxs.isRefuse.form]
                )
            },
            ()=>{
                //noAction
                //エラー要素に被相続人以外の子を追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/配偶者存在欄を表示
                const rbIdxs = Ascendant.idxs.isRefuse.input.concat(Ascendant.idxs.isJapan.input);
                changeCourse(
                    inputs[Ascendant.idxs.isChild.input[yes]], nextBtn,
                    Qs, Ascendant.idxs.isRefuse.form, Ascendant.idxs.isJapan.form, rbIdxs, null,
                    Qs[Ascendant.idxs.isExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, ascendant){
        const {inputs, Qs, nextBtn} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isExist.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子欄を追加して次へボタンを無効にする、相続放棄を表示する
                pushInvalidElAndSDIfHidden(inputs[Ascendant.idxs.isChild.input[yes]], nextBtn, Qs[Ascendant.idxs.isRefuse.form]);
            }
            ,()=>{
                //氏名以外のエラー要素を全て削除して氏名が入力されているときは次へボタンを有効にする、trueで表示した質問を全て非表示にして値を初期化する
                const rbIdxs = getSequentialNumArr(Ascendant.idxs.isRefuse.input[yes], Ascendant.idxs.isChild.input[no]);
                breakQ(inputs[Ascendant.idxs.name.input], nextBtn, Qs, Ascendant.idxs.isRefuse.form, Ascendant.idxs.isChild.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, ascendant){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する、falseで表示する質問を全て非表示にして値を初期化
                const rbIdxs = getSequentialNumArr(Ascendant.idxs.isSpouse.input[yes], Ascendant.idxs.isJapan.input[no]);
                breakQ(inputs[Ascendant.idxs.name.input], nextBtn, Qs, Ascendant.idxs.isSpouse.form, Ascendant.idxs.isJapan.form, rbIdxs);
            },
            ()=>{
                //手続時生存trueのとき
                if(inputs[Ascendant.idxs.isLive.input[yes]].checked){
                    pushInvalidElAndSDIfHidden(inputs[Ascendant.idxs.isJapan.input[yes]], nextBtn, Qs[Ascendant.idxs.isJapan.form]);
                }else if(inputs[Ascendant.idxs.isExist.input[yes]].checked){
                    //相続時生存trueのとき
                    //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                    pushInvalidElAndSDIfHidden(inputs[Ascendant.idxs.isChild.input[yes]], nextBtn, Qs[Ascendant.idxs.isSpouse.form]);
                    errMsgEls[Ascendant.idxs.isSpouse.form].style.display = "none";
                    errMsgEls[Ascendant.idxs.isSpouse.form].innerHTML = "";           
                }
            }
        )
    }
    
    //配偶者存在
    static isSpouse(rbIdx, ascendant){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、falseで表示した質問を初期化、配偶者は母か確認欄を表示する
                changeCourse(
                    inputs[Ascendant.idxs.isChild.input[yes]], nextBtn,
                    Qs, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.input, null,
                    Qs[Ascendant.idxs.isRemarriage.form]
                )
                //配偶者は母か確認欄のエラーメッセージを初期化する
                errMsgEls[Ascendant.idxs.isRemarriage.form].style.display = "none";
                errMsgEls[Ascendant.idxs.isRemarriage.form].innerHTML = "";
            },
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、trueで表示した質問を初期化、被相続人以外の子の欄を表示する
                const rbIdxs = getSequentialNumArr(Ascendant.idxs.isRemarriage.input[yes], Ascendant.idxs.isChild.input[no]);
                changeCourse(
                    inputs[Ascendant.idxs.isChild.input[yes]], nextBtn,
                    Qs, Ascendant.idxs.isRemarriage.form, Ascendant.idxs.isChild.form, rbIdxs, null,
                    Qs[Ascendant.idxs.isChild.form]
                )
                //エラーを非表示にする
                errMsgEls[Ascendant.idxs.isChild.form].style.display = "none";
                errMsgEls[Ascendant.idxs.isChild.form].innerHTML = "";
            }
        )
    }

    //配偶者と母が同じを表示する
    static isRemarriage(rbIdx, ascendant){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isRemarriage.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化
                slideDownAndScroll(Qs[Ascendant.idxs.isChild.form]);
                //エラーを非表示にする
                errMsgEls[Ascendant.idxs.isRemarriage.form].style.display = "none";
                errMsgEls[Ascendant.idxs.isRemarriage.form].innerHTML = "";
            },
            ()=>{
                //システム対応外であることを表示する
                errMsgEls[Ascendant.idxs.isRemarriage.form].style.display = "block";
                errMsgEls[Ascendant.idxs.isRemarriage.form].innerHTML = "本システムでは対応できません";
                //エラー要素として被相続人以外の子trueを追加してボタンを無効化する、被相続人以外の子を初期化する
                pushInvalidEl(inputs[Ascendant.idxs.isChild.input[yes]], nextBtn);
                iniQs(Qs, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.form, Ascendant.idxs.isChild.input);
            }
        )
    }

    //被相続人以外の子を表示する
    static isChild(rbIdx, ascendant){
        const {inputs, Qs, nextBtn, errMsgEls} = personDataToVariable(ascendant);
        this.handleYesNo(rbIdx, Ascendant.idxs.isChild.input[yes],
            ()=>{
                //氏名が適切に入力されているかチェックして次へボタンを有効化判別
                breakQ(inputs[Ascendant.idxs.name.input], nextBtn);
                //エラーメッセージを非表示にする
                errMsgEls[Ascendant.idxs.isChild.form].innerHTML = "";
                errMsgEls[Ascendant.idxs.isChild.form].style.display = "none";
            },
            ()=>{
                //エラーを表示する
                errMsgEls[Ascendant.idxs.isChild.form].innerHTML = "本システムでは対応できません";
                errMsgEls[Ascendant.idxs.isChild.form].style.display = "block";
                //trueをエラー要素に追加して次へボタンを無効化する
                pushInvalidEl(inputs[Ascendant.idxs.isChild.input[yes]], nextBtn);
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
 * @param {Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} person  カウント欄を持つ人
 * @param {number} limitCount 上限値又は下限値
 */
function adjustChildCount(isIncrease, person, limitCount){
    const countInput = person.inputs[person.constructor.idxs.count.input];
    let val = parseInt(countInput.value) || 0;
    if((isIncrease && val < limitCount) || (!isIncrease && val > limitCount)){
        val += isIncrease ? 1 : -1;
    }
    countInput.value = val;
}

/**
 * 人数欄の値変更イベント用
 * @param {HTMLElement} el イベントが発火した要素
 * @param {Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} person  人数欄を持つ人
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
    sort(isValid, person.errMsgEls[countFormIdx], msg, person.inputs[countInputIdx], person.nextBtn);
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
 * @param {Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} person 
 */
function handleFullWidthInputChange(el, idx, person){
    //入力値のチェック結果を取得して結果に応じた処理をする
    isValid = isOnlyZenkaku(el);
    sort(isValid, person.errMsgEls[idx], isValid, person.inputs[idx], person.nextBtn);
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
 * @param {Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} person  カウント欄を持つ人
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
 * @param {Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} person  カウント欄を持つ人
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
 * @param {HTMLElement} el 全角入力欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function handleFullWidthInput(el, nextBtn){
    isValid = isOnlyZenkaku(el)
    if(typeof isValid === "boolean"){
        invalidEls = invalidEls.filter(x => x !== el);
        if(invalidEls.length === 0) nextBtn.disabled = false;
    }else{
        pushInvalidEl(el, nextBtn);
    }
}

/**
 * 個人入力欄にイベントを設定する
 * @param {HTMLElement} person イベントをセットする対象の人
 */
function setEventToIndivisualFieldset(person){
    const {fieldset, inputs, nextBtn} = personDataToVariable(person);
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
                handleFullWidthInput(inputs[i], nextBtn);
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
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        this.handleYesNo(rbIdx, ChildCommon.idxs.isExist.input[yes],
            //yesAction
            ()=>{
                //エラー要素を初期化する
                invalidEls = invalidEls.filter(x => x === inputs[ChildCommon.idxs.isJapan.input[yes]])
                pushInvalidEl(inputs[ChildCommon.idxs.isJapan.input[yes]], nextBtn);
                //人数入力欄を表示する
                inputs[ChildCommon.idxs.count.input].value = "1";
                slideDownAndScroll(Qs[ChildCommon.idxs.count.form]);
                slideDown(Qs[ChildCommon.idxs.isSameParents.form]);
            },
            //noAction
            ()=>{
                invalidEls.length = 0;
                const rbIdxs = getSequentialNumArr(ChildCommon.idxs.isSameParents.input[yes], ChildCommon.idxs.isJapan.input[no])
                iniQs(Qs, ChildCommon.idxs.count.form, ChildCommon.idxs.isJapan.form, rbIdxs, inputs[ChildCommon.idxs.count.input]);
                //次へボタンを有効化して子供なしフラグをtrueにする
                nextBtn.disabled = false;
            }
        )
    }

    //同じ両親
    static isSameParents(el){
        slideDownIfHidden(el);
    }

    //手続時存在
    static isLive(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person)
        this.handleYesNo(rbIdx, ChildCommon.idxs.isLive.input[yes],
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(inputs[ChildCommon.idxs.isJapan.input[yes]], nextBtn, Qs[ChildCommon.idxs.isRefuse.form]);
            },
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(ChildCommon.idxs.isRefuse.input[yes], ChildCommon.idxs.isJapan.input[no]);
                breakQ(inputs[ChildCommon.idxs.count.input], nextBtn, Qs, ChildCommon.idxs.isRefuse.form, ChildCommon.idxs.isJapan.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, person){
        const {inputs, Qs, nextBtn} = personDataToVariable(person);
        this.handleYesNo(rbIdx, ChildCommon.idxs.isRefuse.input[yes], 
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = ChildCommon.idxs.isAdult.input.concat(ChildCommon.idxs.isJapan.input);
                breakQ(inputs[ChildCommon.idxs.count.input], nextBtn, Qs, ChildCommon.idxs.isAdult.form, ChildCommon.idxs.isJapan.form, rbIdxs);
            },
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(inputs[ChildCommon.idxs.isJapan.input[yes]], nextBtn, Qs[ChildCommon.idxs.isAdult.form]);
            }
        )
    }

    //成人
    static isAdult(el){
        slideDownIfHidden(el);
    }
}

/**
 * 子供欄のラジオボタンのイベントを設定する
 * @param {number} rbIdx ラジオボタンのインデックス
 * @param {ChildCommon|CollateralCommon} person 子共通欄
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
 * 子全員又は兄弟姉妹全員欄のイベントを設定する
 * @param {Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} person  イベントを設定する対象の人
 */
function setEventToCommonFieldset(person){
    //人数欄のインデックス
    const {fieldset, inputs} = personDataToVariable(person);
    for(let i = 0, len = inputs.length; i < len; i++){
        //人数欄のとき
        if(i === person.constructor.idxs.count.input){
            countFormHandler(person, i, 1, 15);
        }else{
            if(fieldset.id === "id_child_common-0-fieldset"){
                inputs[i].addEventListener("change", (e)=>{
                    setChildCommonRbsEvent(i, person);
                })
            }
        }
    }
}

/**
 * 子共通で入力された値を各個別フォームに初期値として反映させて初期表示を変更する
 * @param {object} iniData 
 */
function reflectData(iniData){
    const isRefuseFalseIdx = Child.idxs.isRefuse.input[no];
    for(let i = 0, len = childs.length; i < len; i++){
        for(let key in iniData){
            if(iniData[key].checked){
                childs[i].inputs[iniData[key].idx].checked = true;
                if(iniData[key].idx === isRefuseFalseIdx){
                    childs[i].inputs[iniData[key].idx - 1].disabled = true;
                    childs[i].inputs[iniData[key].idx].disabled = true;
                }else{
                    childs[i].inputs[iniData[key].idx].disabled = true;
                    childs[i].inputs[iniData[key].idx + 1].disabled = true;
                }
            }
        }
    }
}

/**
 * 全尊属の欄のタイトルを更新する
 * 
 * フィールドセットとガイドで共通使用
 * @param {ChildCommon|Child} fromPerson 一つ前の人
 * @param {boolean} isFieldset フィールドセットのタイトル変更フラグ（falseのときはガイドのタイトルを変更する）
 * @example 「１－１．（続柄）について」を「２－１．（続柄）について」に変更する
 */
function updateAscendantTitle(fromPerson, isFieldset){
    const els = isFieldset ? 
        document.getElementsByClassName("ascendantFieldset"):
        document.getElementsByClassName("ascendantGuide");
    const ascendantNames = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"];
    const preTitle = fromPerson.fieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
    const preTitleParts = preTitle.replace(/\n/g, "").replace(/\s/g, "").split("－");
    const preNum = parseInt(ZenkakuToHankaku(preTitleParts[0]));
    const newNum = hankakuToZenkaku(String(preNum + 1));
    for(let i = 0, len = els.length; i < len; i++){
        const titleEl = isFieldset ? els[i].getElementsByClassName("fieldsetTitle")[0]: els[i].getElementsByTagName("button")[0];
        const newTitle = `${newNum}－${hankakuToZenkaku(String(i + 1))}．${ascendantNames[i]}について`;
        titleEl.textContent = newTitle;
    }
}

/**
 * 引数fieldsetsに属するinputとbutton要素にタブインデックスを更新する
 * @param {HTMLElement[]} preFieldset 直前のフィールドセット
 * @param {HTMLElement[]} fieldsets タブインデックスを更新するinput要素が属するフィールドセット
 */
function updateAscendantTabindex(preFieldset, fieldsets){
    const lastNextBtn = preFieldset.getElementsByClassName("nextBtn")[0];
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
 * 個人入力欄のフィールドセットの値の初期化、有効化、非表示にする
 * @param {Spouse|Child|ChildSpouse|GrandChild|Ascendant|Collateral} persons 初期化対象のインスタンス（複数可）
 */
function iniIndivisualFieldsets(persons){
    if(!Array.isArray(persons)) persons = [persons];
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
 * 子のフィールドセットの数を加減する
 * @param {number} newCount 
 */
function adjustChildFieldsetCount(newCount){
    const oldTotalForms = document.getElementById(`id_child-TOTAL_FORMS`);
    const oldCount = parseInt(oldTotalForms.value);
    const childFieldsets = Array.from(document.getElementsByClassName("childFieldset"));
    //増えたとき、増えた分の子の欄を生成する
    if(newCount > oldCount){
        for(let i = oldCount; i < newCount; i ++){
            createChildOrCollateralFieldset(true);
        }
    }else if(newCount < oldCount){
        //減ったとき、余分な子の欄を削除する
        oldTotalForms.value = newCount;
        childFieldsets.slice(newCount).forEach(el => el.parentNode.removeChild(el));
    }
}

/**
 * 子のインスタンスの数を加減する
 * @param {number} newCount 
 */
function adjustChildInstanceCount(newCount){
    const newIdx = childs.length;
    if(newCount > newIdx){
        for(let i = 0, len = newCount - newIdx; i < len; i++){
            new Child(`id_child-${newIdx + i}-fieldset`);
        }
    }else if(newCount < newIdx){
        childs.splice(newCount, newIdx - newCount);
    }
}

/**
 * 子供欄から子の欄を表示するとき、子のフィールドセットとインスタンスを調整して尊属全ての欄と子の全ての欄を初期化する
 * @param {number} childCount 子の数
 * @return 子１のインスタンス
 */
function childCommonToChild(childCount){
    //子１のインスタンスが未生成のとき、子１を生成してタブインデックスを設定する
    if(childs.length === 0){
        new Child("id_child-0-fieldset");
        updateTabIndex(childCommon, childs[0]);
    }
    //子のフィールドセットの数を加減する
    adjustChildFieldsetCount(childCount);
    //子のインスタンスの数を加減する（子のインスタンスにフィールドセットの要素を紐付ける必要があるためインスタンスの加減はフィールドセットの加減の後に行わなければならない）
    adjustChildInstanceCount(childCount);
    //尊属欄全てと子の欄を初期化する
    if(ascendants.length > 0){
        iniIndivisualFieldsets(ascendants);
        ascendants.length = 0;
    }
    iniIndivisualFieldsets(childs);
    return childs[0];
}

/**
 * 子の欄の初期値に応じたイベントを発生させる
 * @param {Child|Collateral} person 初期値を反映させる人 
 * @param {object} iniData 初期値
 */
function dispatchChildIniChangeEvent(person, iniData){
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
 * 子共通欄のデータを取得する
 * @returns 子共通欄のデータ
 */
function getChildCommonData(){
    const inputs = childCommon.inputs;
    const iniData = {
        isSameParents: {
            idx: Child.idxs.isSameParents.input[yes],
            checked: inputs[ChildCommon.idxs.isSameParents.input[yes]].checked ? true: false
        },
        isLiveTrue: {
            idx: Child.idxs.isLive.input[yes],
            checked: inputs[ChildCommon.idxs.isLive.input[yes]].checked ? true: false 
        },
        isRefuseFalse: { 
            idx: Child.idxs.isRefuse.input[no], 
            checked: inputs[ChildCommon.idxs.isRefuse.input[no]].checked ? true: false 
        },
        isAdultTrue: { 
            idx: Child.idxs.isAdult.input[yes],
            checked: inputs[ChildCommon.idxs.isAdult.input[yes]].checked ? true: false 
        },
        isJapanTrue: {
            idx: Child.idxs.isJapan.input[yes],
            checked: inputs[ChildCommon.idxs.isJapan.input[yes]].checked ? true: false 
        }
    }
    return iniData;
}

/**
 * フィールドセットに初期値を反映させて、その初期値に応じたイベントを実行しておく
 * @param {ChildCommon|Child|CollateralCommon|Collateral} nextPerson 反映させるフィールドセット
 */
function setIniData(nextPerson){
    const {fieldset, inputs} = personDataToVariable(nextPerson);
    //子共通欄のとき
    if(fieldset.id === "id_child_common-0-fieldset"){
        //子がいないとき、子がいないボタンが押されたときのイベントを発生させる
        if(inputs[ChildCommon.idxs.isExist.input[no]].checked){
            const event = new Event("change");
            inputs[ChildCommon.idxs.isExist.input[no]].dispatchEvent(event);
        }
    }else if(fieldset.classList.contains("childFieldset")){
        //子個人の欄のとき
        const iniData = getChildCommonData()
        //子１の欄のとき、全ての子の欄に初期値を入力する
        if(fieldset.id === "id_child-0-fieldset")
            reflectData(iniData);
        //初期値があるときは、そのイベントを発生させる。チェックが連続しているときだけループを続ける
        dispatchChildIniChangeEvent(nextPerson, iniData);
    }else if(fieldset.id === "collateralCommonFieldset"){
        //兄弟姉妹共通欄のとき
    }else if(fieldset.classList.contains("collateralFieldset")){
        //兄弟姉妹個人欄のとき
    }
}

/**
 * 完了フィールドセットの戻るボタンのクリックイベントハンドラー
 * @param {event} e 
 */
function handleSubmitBtnFieldsetPreBtnClick(e){
    //完了フィールドセットを非表示にする
    const submitBtnFieldset = document.getElementById("submitBtnFieldset");
    const lastHr = getLastElByAttribute("hr", "tag");
    slideUp(lastHr);
    slideUp(submitBtnFieldset);
    lastHr.remove();
    //一つ前のフィールドセットを有効化する
    const preFieldset = getLastElFromArray(reqFieldsets).fieldset;
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
    //一つ前のフィールドセットを最初の項目にフォーカスする
    getLastElFromArray(reqFieldsets).inputs[0].focus();
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
 * 完了フィールドセットを有効化する
 * 
 * inputFieldやGuideのデータは１つ前のフィールドセットのもののままにする
 */
function enableSubmitBtnFieldset(){
    //完了フィールドセットを表示する
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
    const lastFieldset = getLastElFromArray(reqFieldsets).fieldset;
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
    nextBtn.focus();
}

/**
 * 子共通欄から父欄を表示するとき、子１の以外のフィールドセットを削除、子全てのインスタンスを削除して父母のインスタンスを生成する。
 * @returns 父のインスタンス
 */
function childCommonToFather(){
    const childFieldsets = Array.from(document.getElementsByClassName("childFieldset"));
    if(childFieldsets.length > 1) removeAllExceptFirst(childFieldsets);
    if(childs.length > 1) iniIndivisualFieldsets(childs[0]);
    childs.length = 0;
    document.getElementById(`id_child-TOTAL_FORMS`).value = 1;
    new Ascendant("id_ascendant-1-fieldset");
    return new Ascendant("id_ascendant-0-fieldset");
}

/**
 * 有効化するフィールドセットのタブインデックスを更新する
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
 * 子の配偶者又は孫のフィールドセットのタイトルを変更する
 * @param {HTMLElement} titleEl タイトル要素
 * @param {Child} child 被相続人の子（子の配偶者から見ると配偶者）
 * @param {string} zokugara 「配偶者」又は「子」のどちらか
 * @param {number} successFromIdx 数次相続のインデックス（タイトルの本番部分の更新のため）
 * @param {number} childsHeirIdx 数次相続の相続人のインデックス（タイトルの枝番部分の更新のため）
 */
function updateChildsHeirsTitle(titleEl, child, zokugara, successFromIdx, childsHeirIdx){
    const childNum = 4;
    const newMainNum = hankakuToZenkaku(String(childNum + successFromIdx));
    const newBranchNum = hankakuToZenkaku(String(childsHeirIdx));
    const newTitle = `${newMainNum}－${newBranchNum}．${child.inputs[Child.idxs.name.input].value}の${zokugara}について`
    titleEl.textContent = newTitle;
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
 * 子の相続人のフィールドセットのタイトルと属性（id,name,class,tabindex,for）
 * @param {EveryPerson[]} instances 子の相続人のインスタンスが格納された配列
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
        //既存の子の配偶者欄のフィールドセットのタイトルを変更する
        const titleEl = fieldsets[i].querySelector(".fieldsetTitle");
        const childIdx = childs.indexOf(instances[i].successFrom); //子のインデックスを取得する
        //子のインデックスが１つ前のものと同じ時、その子の相続人のインデックスを加算する
        if(childIdx === preChildIdx){
            countHeir += 1;
        }else{
            //異なるとき、その子の相続人のインデックスを１に戻す、孫のインデックスも１に戻す、数次相続の数を１増やす
            countHeir = 1;
            grandChildIdx = 0;
            countSuccessFrom += 1;
        }
        preChildIdx = childIdx;
        updateChildsHeirsTitle(titleEl, instances[i].successFrom, zokugara, countSuccessFrom, countHeir);
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
        for(let i = 0, len = els.length; i < len; i++){
            if(els[i].tagName.toLowerCase() === "input"){
                if(isSpouse) updateCloneIdOrName(["id, name"], els[i], `child_spouse-${childSpouseIdx}`, /spouse/g);
                else updateCloneIdOrName(["id, name"], els[i], `${grandChildIdx}`, /\d+/g);
            }
            els[i].setAttribute("tabindex", newTabindex + i);
        }
        const className = isSpouse? `child${childIdx}Spouse`: `child${childIdx}Child${grandChildIdx}`;
        fieldsets[i].classList.add(className);
        isSpouse? childSpouseIdx += 1: grandChildIdx += 1;
    }
    return fieldsets;
}

/**
 * 子の相続人のインスタンスを生成する
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
 * 子の相続人のフィールドセットを全て削除して、ソートされた子の相続人のインスタンスのインデックス順にフィールドセットを生成する
 * 
 * 子の配偶者又は孫がいないときは、テンプレ元のフィールドセットを復活させる
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
    if(childSpouses.length === 0) preFieldset.after(templates["ChildSpouse"].cloneNode(true));
    else if(grandChilds.length === 0) preFieldset.after(templates["GrandChild"].cloneNode(true));
}

/**
 * 子の相続人のインスタンスとフィールドセットを紐付ける
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
 * 被相続人の子の相続人のインスタンスとフィールドセットを初期化する
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
 * @returns 次に表示する人又はtrue（trueを返すとき完了フィールドセットを表示する）
 */
function selectChildTo(){
    //子の相続人のインスタンスとフィールドセットを初期化
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
     * ２，フィールドセットの生成と削除
     * ３，フィールドセットのタイトルと属性値を更新する
     * ４，インスタンスとフィールドセットを紐付ける
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
     * 子のみが相続したときは完了フィールドセットを返す
     * ・１人以上手続時生存trueかつ相続放棄falseかつ配偶者falseかつ子（孫）false
     */
    if(isDone)
        return true;
    //尊属に権利が移動したとき（卑属に相続人がいないとき）
    new Ascendant("id_ascendant-1-fieldset");
    return new Ascendant("id_ascendant-0-fieldset");
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
 * ・子の配偶者と孫から次のフィールドセットと一致するフィールドセットを持つ人を探す
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
 * 次に回答してもらう人を判別して、インスタンスを生成する
 * @param {EveryPerson} fromPerson 前の人
 * @returns 次に回答してもらう人を返す|trueのとき入力完了|falseのとき該当なし（エラー）
 */
function getNextPersonAndCreateFieldsetsAndInstance(fromPerson){
    const preFieldset = fromPerson.fieldset;
    const preFieldsetId = preFieldset.id;
    //被相続人欄の次へボタンが押されたとき配偶者欄を返す
    if(preFieldsetId === "id_decedent-0-fieldset"){
        return spouse;
    }else if(preFieldsetId === "id_spouse-0-fieldset"){
        //配偶者欄からのとき子共通欄を返す
        return childCommon;
    }else if(preFieldsetId === "id_child_common-0-fieldset"){
        /**
         * 子共通欄のとき
         * ・子がいるときは、子全員のフィールドセット調整とインスタンスを生成して子１を返す
         * ・子がいないときは、尊属全員のフィールドセット調整と父母のインスタンスを生成して父を返す
         */
        const childCount = countChild();
        if(childCount > 0) return childCommonToChild(childCount);
        else return childCommonToFather();
    }else if(preFieldset === childs[childs.length - 1].fieldset){
        //最後の子個人欄のとき、完了・子の配偶者・孫・父のいずれかを取得する
        return selectChildTo();
    }else if(preFieldset.classList.contains("childFieldset")){
        //最後以外の子の欄のとき、次の子を返す
        return childs[getNextPersonIdx(childs, preFieldset)];
    }else if(preFieldset === getLastElByAttribute("childsHeirFieldset", "class")){
        //最後の子の相続人のとき
    }else if(preFieldset.classList.contains("childsHeirFieldset")){
        //子の相続人のとき、次の子の相続人を返す
        return getNextChildsHeir(preFieldset);
    }else if(preFieldset.preFieldsetId === "id_ascendant-1-preFieldset"){
        //母欄のとき
        const fatherInputs = document.getElementById("id_ascendant-0-fieldset").getElementsByTagName("input");
        const isFatherLive = fatherInputs[Ascendant.idxs.isLive.input[yes]].checked;
        const isFatherRefuse = fatherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
        const motherInputs = fieldset.getElementsByTagName("input");
        const isMotherRefuse = motherInputs[Ascendant.idxs.isRefuse.input[yes]].checked;
        const isMotherExist = motherInputs[Ascendant.idxs.isExist.input[yes]].checked;
        /**
         * 母方の祖父欄を表示する条件
         * ・父が手続時trueかつ母が相続時false
         * ・父が相続放棄trueかつ母が相続時false
         */
        if((isFatherLive || isFatherRefuse) && !isMotherExist){
            new Ascendant("id_ascendant-5-fieldset");
            return new Ascendant("id_ascendant-4-fieldset");
        } 
        /**
         * 兄弟姉妹共通欄を表示する条件
         * ・父と母の両方が相続放棄true
         */
        if(isFatherRefuse && isMotherRefuse)
            return new CollateralCommon("id_collateral");
        /**
         * 完了フィールドセットを表示する条件
         * ・父が手続時存在trueかつ相続放棄trueで母が手続時存在trueかつ相続放棄false
         * ・父が手続時存在trueかつ相続放棄falseかつ母が手続時存在trueかつ相続放棄true
         * ・父が手続時存在trueかつ相続放棄falseかつ母が手続時存在trueかつ相続放棄false
         * ・父が手続時存在trueかつ相続放棄falseかつ母が相続時存在trueかつ相続放棄true
         * ・父が相続時存在trueかつ相続放棄trueで母が手続時存在trueかつ相続放棄false
        */
        const isFatherExist = fatherInputs[Ascendant.idxs.isExist.input[yes]].checked;
        const isMotherLive = motherInputs[Ascendant.idxs.isLive.input[yes]].checked;
        if(
            isFatherLive && isMotherLive && (isFatherRefuse && !isMotherRefuse || !isFatherRefuse) ||
            isFatherLive && !isFatherRefuse && isMotherExist && isMotherRefuse ||
            isFatherExist && isFatherRefuse && isMotherLive && !isMotherRefuse
        ){
            return true;
        }
    }else if(preFieldsetId === "id_ascendant-3-fieldset"){

    }else if(preFieldsetId === "id_ascendant-5-fieldset"){

    }else if(preFieldsetId === "id_collateral_common-0-fieldset"){

    }else if(preFieldset === collaterals[collaterals.length - 1].fieldset){

    }else if(preFieldset.classList.contains("collateralFieldset")){

    }
 
    //原則次のフィールドセットを取得する
    return false;
}

/**
 * 有効化する次のフィールドセットの属性値やフォームの数などを調整する
 * @param {EveryPerson} fromPerson １つ前の人
 * @param {EveryPerson} nextPerson 次に入力する人
 */
function adjustFieldsetsAndInstance(fromPerson, nextPerson){
    //有効化するフィールドセットの要素などを取得する
    getFieldsetEl(true, nextPerson);
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
            updateAscendantTitle(fromPerson, true);
            const ascendantFieldsets = document.getElementsByClassName("ascendantFieldset");
            const parentsFieldsets = [ascendantFieldsets[0], ascendantFieldsets[1]];
            updateAscendantTabindex(fromPerson.fieldset, parentsFieldsets);
        }else if(nextFieldsetId == "id_ascendant-2-fieldset"){

        }else if(nextPerson.fieldset.id === "id_ascendant-4-fieldset"){
            updateTitleBranchNum(true);
        }
    }else if(nextPerson.fieldset.classList.contains("collateralCommonFieldset")){
        /**
         * 兄弟姉妹共通欄のとき
         * ・イベントを設定する
         */
        setEventToCommonFieldset(nextPerson.fieldset);
    }else if(nextPerson.fieldset.classList.contains("collateralFieldset")){
        /**
         * 兄弟姉妹個人欄のとき
         * ・イベントを設定する
         */
        setEventToIndivisualFieldset(nextPerson.fieldset);
    }
}

/**
 * 次の項目と次のガイドを有効化して前の項目を無効化する
 * @param fromPerson 入力が完了した人
 */
function oneStepFoward(fromPerson){
    const nextPerson = getNextPersonAndCreateFieldsetsAndInstance(fromPerson);
    if(nextPerson === null){
        console.log("次の人が見つかりませんでした");
        return;
    }
    //前のフィールドセットを無効化
    fromPerson.fieldset.disabled = true;
    //入力が完了又はエラーのとき
    if(typeof nextPerson === "boolean"){
        //入力完了のとき完了フィールドセットを表示してエラーのときは何もせずに処理を中止
        if(nextPerson) enableSubmitBtnFieldset();
        return;
    }
    //有効化対象のフィールドセットの複製や属性値を調整、イベントの設定、初期値の設定をする
    adjustFieldsetsAndInstance(fromPerson, nextPerson);
    //次のフィールドセットを表示と要素を取得
    const nextFieldset = nextPerson.fieldset; 
    displayNextFieldset(nextFieldset);
    //ガイドを更新
    updateGuide(fromPerson);
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
 * @param {HTMLElement} errorMessagesEl エラーメッセージを表示する要素
 * @param {boolean or string} message エラーメッセージ
 * @param {HTMLElement} el チェック対象の要素
 * @param {HTMLElement} nextBtn 次へボタン
 */
function sort(isValid, errorMessagesEl, message, el, nextBtn){
    //エラー要素から削除
    invalidEls = invalidEls.filter(x => x !== el);
    //チェック結果がtrueのとき
    typeof isValid === "boolean" ? 
        afterValidation(true, errorMessagesEl, "", el, nextBtn):
        afterValidation(false, errorMessagesEl, message, el, nextBtn);
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
                handleFullWidthInput(decedent.inputs[i], decedent.nextBtn);
            })
        }

        //前入力欄にchangeイベントを設定する
        decedent.inputs[i].addEventListener("change", (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = decedentValidation(el);
            //チェック結果に応じて処理を分岐
            sort(isValid, decedent.errMsgEls[i], isValid, el, decedent.nextBtn);
            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if(el === decedent.inputs[Decedent.idxs.prefecture] || el === decedent.inputs[Decedent.idxs.domicilePrefecture]){
                const val = el.value;
                getCityData(val, decedent.inputs[i + 1]);
            }
        })
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
        isValid = decedentValidation(decedent.inputs[i])
        sort(isValid, decedent.errMsgEls[i], isValid, decedent.inputs[i], decedent.nextBtn)
    }

    //エラーがあるときは、処理を中止してエラーの要素にフォーカスする
    if(invalidEls.length > 0){
        e.preventDefault();
        invalidEls[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    oneStepFoward(decedent);
})
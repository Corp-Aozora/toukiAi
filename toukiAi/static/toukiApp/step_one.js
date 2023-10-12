"use strict";

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
    constructor(fieldsetId, fieldsetIdx){
        this.fieldset = document.getElementById(fieldsetId);
        this.fieldsetIdx = fieldsetIdx;
        this.Qs = Array.from(this.fieldset.getElementsByClassName("Q"));
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
        this.preBtn = this.fieldset.getElementsByClassName("previousBtn")[0];
        this.nextBtn = this.fieldset.getElementsByClassName("nextBtn")[0];
        this.errMsgEls = Array.from(this.fieldset.getElementsByClassName("errorMessage"));
    }
}

//被相続人
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
    constructor(fieldsetId, fieldsetIdx){
        super(fieldsetId, fieldsetIdx);
        this.inputs = this.inputs.concat(Array.from(this.fieldset.getElementsByTagName("select")));
    }
}
const decedent = new Decedent("decedentFieldset", 0);
const decedents = [decedent];

//配偶者
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
}
const spouse = new Spouse("spouseFieldset", 1);
const spouses = [spouse];

//子供共通
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
}
const childCommon = new ChildCommon("childrenFieldset", 2);
const childCommons = [childCommon];

//卑属
class Descendant extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameSpouse:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        childCount:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]}
    }
}
const child = new Descendant("id_child-0-fieldset", 3);
const childs = [];
const gChilds = [];

//尊属
class Ascendant extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameSpouse:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        childCount:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]}
    }
}
const father = new Ascendant("id_ascendant-0-fieldset", 3);
const ascendants = [];

//兄弟姉妹共通
class CollateralCommon extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameSpouse:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        childCount:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]}
    }
}
const CollateralCommons = [];

//兄弟しまし
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
        childCount:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]}
    }
}
const collaterals = [];

const reqFieldsets = [decedent.fieldset];

//入力欄のフィールド
class InputsField{
    constructor(decedent){
        this.reqFieldsets = [decedent.fieldset];
        this.nextBtns = [decedent.nextBtn];
        this.preBtnsArr = [];
        this.errMsgEls = [...decedent.errMsgEls];
    }
}
const inputsField = new InputsField(decedent);

//次へボタンのイベントハンドラー
let oneStepFowardHandler;
//子供情報
let childrenData;
//子供なしフラグ
let isNoChild = false;
//兄弟姉妹なしフラグ
let isNoCollateral = false;
//両親の数次相続フラグ
let isParentsInheritance = false;
//卑属から尊属に権利が移動したフラグ
let isTransfferedToAscendant = false;
//尊属から傍系に権利が移動したフラグ
let isTransfferedToCollateral = false;

/**
 * 初期処理
 */
function initialize(){
    updateSideBar();
    reqInputs = [...decedent.inputs];
    invalidEls = [...decedent.inputs];
    //年は初期値があり値もnullになることはないためエラー要素から除外する
    invalidEls.splice(Decedent.idxs.deathYear, 1);
}

/**
 * 選択された都道府県に存在する市区町村を取得する
 * @param {string} val 都道府県欄の値
 * @param {HTMLElement} el 市区町村欄
 * @returns 
 */
function getCityData(val, el){
    
    //未選択のとき、市町村データを全て削除して無効化する
    if(val === ""){
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.disabled = true;
        document.getElementById(`${el.id}_verifyingEl`).remove();
        return;
    }
    
    const url = 'get_city';

    //エラー要素から削除する
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
  
    //非同期処理
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
        const errorMessageEl = document.getElementById(`${el.id}_message`);

        if(response.city !== ""){

            let option = "";
            
            //東京都以外の区は表示しない
            for(let i = 0, len = response.city.length; i < len; i++){
                if(response.city[i]["id"].slice(0, 2) !== "13" && response.city[i]["name"].slice(-1) === "区") continue;
                option += `<option value="${response.city[i]["name"]}">${response.city[i]["name"]}</option>`;
            }

            el.innerHTML = option;
            errorMessageEl.style.display = "none";

        }else{

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
 * クローンしたフォームのid又はnameのプレフィックスを変更する
 * @param {string[]|string} attributes 変更対象の属性（複数可）
 * @param {HTMLElement} el 変更対象の要素
 * @param {number} num 変更後のプレフィックス番号
 */
function updateCloneIdOrName(attributes, el, num){
    if(!Array.isArray(attributes)) attributes = [attributes];
    attributes.forEach(attribute => {
        const oldAttribute = el.getAttribute(attribute);
        const newAttribute = oldAttribute.replace(/\d+/g, num);
        el.setAttribute(attribute, newAttribute);
    });
}

/**
 * タブインデックスを変更する
 * @param {HTMLElement} el 要素
 * @param {number} addNum 加算する数
 */
function updateCloneTabindex(el, addNum){
    const oldTabindex = el.getAttribute("tabindex");
    const newTabindex = parseInt(oldTabindex) + addNum;
    el.setAttribute("tabindex", newTabindex);
}

/**
 * 子又は兄弟姉妹欄のタイトルの枝番を更新する
 * @param {HTMLElement} el 対象の要素 
 * @param {string} zokugara 続柄（日本語）、子又は兄弟姉妹
 * @param {number} newNum 新しい番号
 */
function updateTitleBranchNum(el, zokugara, newNum){
    const oldTitle = el.textContent;
    const removedSpace = oldTitle.replace(/\n/g, "").replace(/\s/g, "");
    const oldNum = removedSpace.split("．")[0];
    const idx = oldNum.lastIndexOf("－");
    const newNumbering = oldNum.slice(0, idx + 1) + hankakuToZenkaku(String(newNum));
    const newTitle = `${newNumbering}．${zokugara}${hankakuToZenkaku(String(newNum))}について`;
    el.textContent = newTitle;
}

/**
 * 属性を更新（子又は兄弟姉妹の欄を生成したとき用）
 * @param {HTMLElement} fieldset 属性を更新する対象のフィールドセット
 * @param {string} relation 続柄（child又はcollateral）
 * @param {number} oldCount 一つ前のフィールドセットのprefix
 */
function updateCloneAttribute(fieldset, relation, oldCount){
    //氏名のlabelのforを変更
    const label = fieldset.querySelector("label");
    label.setAttribute("for", `id_${relation}-${oldCount}-name`);

    //inputのname、id、tabindexを変更して子供データを入力する
    const inputsArr = fieldset.getElementsByTagName("input");
    const addTabIdx = 12; //元のタブインデックスに加算する数字
    for(let i = 0, len = inputsArr.length; i < len; i++){
        updateCloneIdOrName(["name", "id"], inputsArr[i], oldCount);
        updateCloneTabindex(inputsArr[i], addTabIdx);
    }

    //buttonのtabindexを変更
    const btns = fieldset.getElementsByTagName("button");
    for(let i = 0, len = btns.length; i < len; i++){
        updateCloneTabindex(btns[i], addTabIdx)
    }
}

/**
 * 直前のフィールドセットをコピーしてidを変更する
 * @param {string} relation 続柄（child又はcollateral）
 * @returns idのプレフィックスを更新した複製したフィールドセット
 */
function copyPreFieldset(preFieldset, relation, oldCount){
    const newFieldset = preFieldset.cloneNode(true);
    newFieldset.id = `id_${relation}-${oldCount}-fieldset`;
    return newFieldset;
}

/**
 * フォームを生成する
 * @param {boolean} isChild 子フォームの生成か兄弟姉妹フォームの生成か判別する用
 */
function createForm(isChild){
    //生成するフォームを判別
    let relation = isChild ? "child": "collateral";
    let zokugara = isChild ? "子": "兄弟姉妹";
    //formsetの数を１加算する
    const totalForms = document.getElementById(`id_${relation}-TOTAL_FORMS`);
    const oldCount = parseInt(totalForms.value);
    const newCount = oldCount + 1;
    totalForms.value = newCount;
    //直前のfieldsetをコピーしてidを変更
    const preFieldset = getLastElByAttribute(`${relation}Fieldset`, "class");
    const newFieldset = copyPreFieldset(preFieldset, relation, oldCount);
    //タイトルを変更
    const titleEl = newFieldset.querySelector(".fieldsetTitle");
    updateTitleBranchNum(titleEl, zokugara, newCount);
    //属性を変更
    updateCloneAttribute(newFieldset, relation, oldCount);
    // 新しいfieldset要素をFormsetに追加します
    preFieldset.after(newFieldset);
}

/**
 * 次のフィールドセットの要素を取得する
 * @param {boolean} isForward
 * @param {HTMLElement} fieldset 次のフィールドセット
 */
function getFieldsetEl(isForward, fieldset){
    reqInputs.length = 0;
    inputsField.errMsgEls.length = 0;
    inputsField.errMsgEls = Array.from(fieldset.getElementsByClassName("errorMessage"));
    //次へボタンが押されたとき
    if(isForward){
        reqInputs = Array.from(fieldset.getElementsByTagName("input"));
        invalidEls.length = 0;
        invalidEls = preserveInvalidEls.length > 0 ? preserveInvalidEls.pop(): Array.from(fieldset.getElementsByTagName("input"));
        inputsField.nextBtns.push(fieldset.getElementsByClassName("nextBtn")[0]);
        inputsField.preBtnsArr.push(fieldset.getElementsByClassName("previousBtn")[0]);
    }else{
        //戻るボタンが押されたとき
        preserveInvalidEls.push(invalidEls.slice());
        invalidEls.length = 0; //preserveInvalidElArrに追加する前に実行するとpreserveInvalidElArrに正しく追加されない
        inputsField.nextBtns.pop();
        inputsField.preBtnsArr.pop();

        //被相続人欄を有効化するとき
        reqInputs = fieldset === decedent.fieldset ? [...decedent.inputs]: Array.from(fieldset.getElementsByTagName("input"));
    }
}

/**
 * 区切り線を入れて項目を表示する
 * @param {HTMLElement} fieldset 表示する項目
 */
function displayFieldset(fieldset){
    slideDown(fieldset);
    const hr = document.createElement("hr");
    hr.className = "my-5";
    fieldset.before(hr);
    scrollToTarget(fieldset);
}

/**
 * 次の項目を有効化して前の項目を無効化する
 * @param {HTMLElement} fromFieldset 押された次へボタンが属するフィールドセット
 */
function enableNextFieldset(fromFieldset){
    //次のフィールドセットを取得する
    let nextFieldset;
    //子供欄から子がいないフラグtrueのとき、父欄を取得する
    if(fromFieldset.id === "childrenFieldset" && isNoChild){
        nextFieldset = document.getElementById("id_ascendant-0-fieldset");
    }
    else if(fromFieldset.id === "id_ascendant-1-fieldset" && isTransfferedToCollateral){
        //母欄から兄弟姉妹に権利移動フラグtrueのとき、兄弟姉妹欄を表示する
        nextFieldset = document.getElementById("collateralsFieldset");
    }else{
        //原則次のフィールドセットを取得する
        nextFieldset = getNextElByTag(fromFieldset, "fieldset");
    }
    //次の項目を表示、hrを挿入、次の項目にスクロール
    inputsField.reqFieldsets.push(nextFieldset);
    displayFieldset(nextFieldset);
    //前の項目を無効化
    fromFieldset.disabled = true;
    //次のフィールドセットの要素を取得する
    getFieldsetEl(true, nextFieldset);
    //次の項目の最初の入力欄にフォーカスする
    reqInputs[0].focus();
}

/**
 * 次のガイドボタンにイベントを設定する
 * @param {event} e クリックイベント
 */
function scrollToTargetHandler(e){
    //次の項目にスクロールする
    const idx = Guide.btns.indexOf(e.target);
    scrollToTarget(inputsField.reqFieldsets[idx], 0);
}

/**
 * ガイドを強調する（事前にGuide.elIdxの加算をすること）
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {number} nextIdx 次のインデックス
 */
function addGuideActive(guideList, nextIdx){
    Guide.guides.push(guideList.getElementsByClassName("guide")[Guide.elIdx]);
    Guide.btns.push(guideList.getElementsByClassName("guideBtn")[Guide.elIdx]);
    Guide.caretIcons.push(guideList.getElementsByClassName("guideCaret")[Guide.elIdx]);
    
    if(window.getComputedStyle(Guide.guides[nextIdx]).display === "none")
        Guide.guides[nextIdx].style.display = "block";

    Guide.guides[nextIdx].classList.add("active");
    Guide.btns[nextIdx].disabled = false;
    Guide.caretIcons[nextIdx].style.display = "inline-block";
}

/**
 * ガイドを通常表示にする
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {number} nextIdx 次のインデックス
 */
function removeGuideActive(guideList, nextIdx){
    //通常表示にする
    Guide.guides[nextIdx - 1].classList.remove("active");
    Guide.caretIcons[nextIdx - 1].style.display = "none";
    Guide.checkIcons.push(guideList.getElementsByClassName("guideCheck")[Guide.elIdx]);
    Guide.checkIcons[nextIdx - 1].style.display = "inline-block";
}

/**
 * ガイドを複製など調整する
 * @param {HTMLElement} guideList 各ガイドを包んだ要素
 * @param {number} oldCount 初期値である１又は前に入力された子の人数
 * @param {number} newCount 新たに入力された子の人数
 */
function adjustGuide(guideList, oldCount, newCount){
    //増えたとき
    if(newCount > oldCount){
        for(let i = oldCount; i < newCount; i ++){
            //直前のガイドをコピー
            const copyFrom = getLastElByAttribute("childGuide", "class");
            const clone = copyFrom.cloneNode(true);
            //タイトルの枝番を変更
            const btn = clone.querySelector("button");
            updateTitleBranchNum(btn, "子", (i + 1));
            //idを変更して非表示から表示に変更して最後の要素の次に挿入する
            clone.style.display = "block";
            clone.id = `id_child-${i}-guide`
            copyFrom.after(clone)
        }
    }else if(newCount < oldCount){
        //減ったとき
        const childGuides = Array.from(guideList.getElementsByClassName("childGuide"));
        childGuides.slice(newCount).forEach(el => el.parentNode.removeChild(el));
    }
}

/**
 * ガイドのタイトルの本番を変更する
 * @param {HTMLElement} preFieldset １つ前のフィールドセット
 * @param {HTMLElement[]} guideList ガイド
 * @param {string} relation 更新対象の続柄
 */
function updateGuideTitleMainNum(preFieldset, guideList, relation){
    const ascendantFieldsets = guideList.getElementsByClassName(`${relation}Guide`);
    const preFieldsetTitle = preFieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
    const preFieldsetTitleParts = preFieldsetTitle.replace(/\n/g, "").replace(/\s/g, "").split("－");
    const preFieldsetMainNum = parseInt(ZenkakuToHankaku(preFieldsetTitleParts[0]));
    for(let i = 0, len = ascendantFieldsets.length; i < len; i++){
        const btn = ascendantFieldsets[i].firstElementChild;
        const oldTitle = btn.textContent;
        const oldTitleParts = oldTitle.replace(/\n/g, "").replace(/\s/g, "").split("．");
        const oldNumberingParts = oldTitleParts[0].split("－");
        const newMainNum = hankakuToZenkaku(parseInt(ZenkakuToHankaku(preFieldsetMainNum)) + 1);
        const newNumbering = newMainNum + "－" + oldNumberingParts[1];
        const newTitle = `${newNumbering}．${oldTitleParts[1]}`;
        btn.textContent = newTitle;
    }
}

/**
 * ガイドを更新する
 * @param {HTMLElement[]} fromFieldset 押された次へボタンが属するフィールドセット
 */
function updateGuide(fromFieldset){
    const guideList = document.getElementById("guideList");
    const nextIdx = inputsField.reqFieldsets.length - 1;
    //一つ前のガイドを通常表示にする
    removeGuideActive(guideList, nextIdx);
    //子供欄から父の欄を表示するとき
    if(isNoChild && fromFieldset.id === "childrenFieldset"){
        //子のガイドが複製されているとき、子１以外は削除する
        const childGuides = guideList.getElementsByClassName("childGuide");
        removeAllExceptFirst(childGuides);
        //子のガイドをスキップするために2加算する
        Guide.elIdx += 2;
        //母のガイドも無効化した状態で表示する
        guideList.getElementsByClassName("ascendantGuide")[1].style.display = "block";
        //タイトルの本番を変更する
        updateGuideTitleMainNum(fromFieldset, guideList, "ascendant");
    }else if(isTransfferedToAscendant){
        //父の要素に移動する
        Guide.elIdx += 1;
        //タイトルの本番を変更する
        updateGuideTitleMainNum(fromFieldset, guideList, "ascendant");
        //母のガイドも無効化した状態で表示する
        guideList.getElementsByClassName("ascendantGuide")[1].style.display = "block";
    }else if(fromFieldset.id === "id_ascendantFieldset-1-fieldset" && isTransfferedToCollateral){
        //母の欄から兄弟姉妹欄を表示するとき
        Guide.elIdx += 5;
    }else{
        Guide.elIdx += 1;
        
        //子のガイドを表示するとき、子の人数に応じてガイドの数を増やす
        if(fromFieldset.id === "childrenFieldset"){
            //子の数を取得する
            const oldCount = guideList.getElementsByClassName("childGuide").length;
            const newCount = document.getElementsByClassName("childFieldset").length;
            adjustGuide(guideList, oldCount, newCount);
        }
    }

    //次の項目を強調する
    addGuideActive(guideList, nextIdx);
    //次の項目のガイドボタンにイベントを追加
    Guide.btns[nextIdx].addEventListener("click", scrollToTargetHandler);
}

/**
 * 前の項目を有効化する
 * @param {HTMLElement} preFieldset 押された戻るボタンが属するフィールドセットの１つ前のフィールドセット
 */
function putBackFieldset(preFieldset){
    const disableField = inputsField.reqFieldsets[inputsField.reqFieldsets.length - 1]; //無効化対象のフィールドセット
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ

    //無効化対象のフィールドセットが子供欄のとき子供不存在フラグをfalseに戻す
    if(disableField.id === "childrenFieldset") isNoChild = false;
    //兄弟姉妹欄のとき、尊属から傍系への権利移動フラグをfalseに戻す
    else if(disableField.id === "collateralFieldset") isTransfferedToCollateral = false;

    //無効化するフィールドにあるイベントが設定されている要素を初期化してイベントを削除する
    replaceElements(disableField, "input");
    replaceElements(disableField, "button");

    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    slideUp(removeHr);
    inputsField.reqFieldsets.pop();
    removeHr.remove();
    
    //直前の項目を有効化してスクロール
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
    
    //一つ前のフィールドの要素を取得する
    getFieldsetEl(false, preFieldset);

    //子の欄から戻るときは、途中の入力データを保存しない
    if(disableField.id === "id_child-0-fieldset") preserveInvalidEls.length = 0;
    else if(disableField.id === "id_ascendant-0-fieldset") isTransfferedToAscendant = false;
}

/**
 * ガイドを削除する
 * @param {number} idx 
 */
function removeGuide(idx){
    Guide.guides[idx].classList.remove("active");
    Guide.guides.pop();

    Guide.btns[idx].removeEventListener("click", scrollToTargetHandler);
    Guide.btns[idx].disabled = true;
    Guide.btns.pop();

    Guide.caretIcons[idx].style.display = "none";
    Guide.caretIcons.pop();
}

/**
 * 戻るボタンにより一つ前のガイドを有効化する
 * @param {number} idx 
 */
function enablePreGuide(idx){
    Guide.checkIcons[idx].style.display = "none";
    Guide.checkIcons.pop();
    Guide.guides[idx].classList.add("active");
    Guide.caretIcons[idx].style.display = "inline-block";
}

/**
 * ガイドを一つ戻す
 */
function putBackGuide(){
    const currentIdx = Guide.guides.length - 1;
    
    //子１の欄のとき
    const currentGuideId = Guide.guides[currentIdx].id;
    if(currentGuideId === "id_child-0-guide"){
        const guides = document.getElementsByClassName("childGuide");
        slideUpDisuseEls(guides, 0, guides.length - 1)
    }else if(currentGuideId === "id_father-guide"){
        //父欄のとき
        const guides = document.getElementsByClassName("ascendantGuide");
        slideUpDisuseEls(guides, 0, guides.length - 1)
    }else if(currentGuideId === "id_fatherGfather-guide"){
        //父方の祖父欄のとき
    }else if(currentGuideId === "id_motherGfather-guide"){
        //母方の祖父欄のとき
    }

    //押されたボタンに応じて要素番号を変更する
    if(isNoChild && currentGuideId === "id_father-guide")
        Guide.elIdx -= 2;
    else if(currentGuideId === "id_child-0-guide"){
        isNoChild = false;
        Guide.elIdx -= 1;
    }else if(currentGuideId === "id_collaterals-guide"){
        Guide.elIdx -= 5;
    }else{
        Guide.elIdx -= 1;
    }

    //ガイドのデータを削除する
    removeGuide(currentIdx);
    //一つ前の項目をactiveにする
    enablePreGuide(currentIdx - 1);
}

/**
 * 前の項目を有効化にする
 * @param {HTMLElement} preFieldset 押された戻るボタンが属するフィールドセットの１つ前のフィールドセット
 */
function oneStepBack(preFieldset){
    return function(e){
        //前の項目を有効化とガイドの巻き戻し
        putBackGuide();
        putBackFieldset(preFieldset);
    }
}

/**
 * 使用しないインデックスが連続する要素を非表示にする
 * @param {HTMLElement[]} elsArr 対象の要素の配列
 * @param {number} startIdx 非表示を開始するQのインデックス
 * @param {number} endIdx 非表示を終了するQのインデックス
 */
function slideUpDisuseEls(elsArr, startIdx, endIdx){
    for(let i = startIdx; i < endIdx + 1; i++){
        if(window.getComputedStyle(elsArr[i]).display !== "none") slideUp(elsArr[i]);    
    }
}

/**
 * 使用しない要素を１つ非表示にする
 * @param {HTMLElement} el 対象の要素
 */
function slideUpDisuseEl(el){
    if(window.getComputedStyle(el).display !== "none") slideUp(el);    
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
 * @param {HTMLElement} errEl 追加するエラー要素
 * @param {HTMLElement} btn 無効化するボタン
 * @param {HTMLElement} displayEl スライドダウン表示する要素
 */
function pushInvalidElAndSDIfHidden(errEl, btn, displayEl){
    pushInvalidEl(errEl, btn);
    slideDownIfHidden(displayEl);
}

/**
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
 * [8] {number} time 
 */
function changeCourse(...args){
    if(args[0])
        pushInvalidEl(args[0], args[1]);
    iniQs(args[2], args[3], args[4], args[5], args[6]);
    slideDownAfterDelay(args[7], args[8]);
}

/**
 * 連番の数字を配列に入れて返す
 * @param {number} startIdx 配列に格納する最初の数字
 * @param {number} endIdx 配列に格納する最後の数字
 */
function getSequentialNumArr(startIdx, endIdx){
    return Array.from({length: endIdx - startIdx + 1}, (_, i) => startIdx + i);
}

/**
 * 複数の質問欄を非表示にして値を初期化する
 * @param {HTMLElement} QsArr 連続する質問欄
 * @param {number} startIdx 非表示を開始する質問欄のインデックス
 * @param {number} endIdx 非表示を終了する質問欄のインデックス
 * @param {number} rbIdxs 初期化するラジオボタンの配列
 * @param {HTMLElement} textInput 人数テキストボックスの初期化
 */
function iniQs(QsArr, startIdx, endIdx, rbIdxs, textInput = null){
    uncheckTargetElements(reqInputs, rbIdxs);
    if(textInput !== null)
        textInput.value = textInput.type === "number" ? "0": "";
    slideUpDisuseEls(QsArr, startIdx, endIdx);
}

/**
 * 質問を途中で終了して次へボタンの有効化判別をする
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
    static isJapan(idx, btn){
        breakQ(reqInputs[idx], btn);
    }
}

/**
 * 配偶者のラジオボタンのイベントハンドラー
 */
class SpouseRbHandler extends CommonRbHandler{
    //相続時存在
    static isExist(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, Spouse.idxs.isExist.input[yes],
            ()=>{
                //yesAction
                //エラー要素に氏名を追加して次へボタンを無効にする、手続時存在を表示する
                pushInvalidElAndSDIfHidden(reqInputs[Spouse.idxs.isExist.input[yes]], nextBtn, Qs[Spouse.idxs.isLive.form]);
                //氏名欄が無効なときは有効にする
                if(reqInputs[Spouse.idxs.name.input].disabled)
                    reqInputs[Spouse.idxs.name.input].disabled = false;
            }
            ,()=>{
                //noAction
                //エラー要素を全て削除する/次へボタンを有効にする/氏名欄を初期化して無効にする
                invalidEls.length = 0;
                nextBtn.disabled = false;
                reqInputs[Spouse.idxs.name.input].value = "";
                reqInputs[Spouse.idxs.name.input].disabled = true;
                //3問目以降の質問を全て非表示にして値を初期化する
                const rbIdxs = getSequentialNumArr(Spouse.idxs.isLive.input[yes], Spouse.idxs.isJapan.input[no])
                iniQs(Qs, Spouse.idxs.isLive.form, Spouse.idxs.isJapan.form, rbIdxs);
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, Spouse.idxs.isLive.input[yes],
            ()=>{
                //エラー要素に日本在住trueを追加して次へボタンを無効化/被相続人以外の子欄の非表示と値の初期化/相続放棄欄を表示
                const rbIdx = getSequentialNumArr(Spouse.idxs.isRemarriage.input[yes], Spouse.idxs.isStepChild[no]);
                changeCourse(
                    reqInputs[Spouse.idxs.isJapan.input[yes]], nextBtn,
                    Qs, Spouse.idxs.isRemarriage.form, Spouse.idxs.isStepChild.form, rbIdx, null,
                    Qs[Spouse.idxs.isRefuse.form], null
                )
            },
            ()=>{
                //被相続人以外の子のエラーメッセージを非表示
                inputsField.errMsgEls[Spouse.idxs.isRemarriage.form].style.display = "none";
                inputsField.errMsgEls[Spouse.idxs.isRemarriage.form].innerHTML = "";
                const rbIdxs = getSequentialNumArr(Spouse.idxs.isRefuse.input[yes], Spouse.idxs.isJapan.input[no]);
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/被相続人以外の子欄を表示
                changeCourse(
                    reqInputs[Spouse.idxs.isStepChild.input[no]], nextBtn,
                    Qs, Spouse.idxs.isRefuse.form, Spouse.idxs.isJapan.form, rbIdxs, null,
                    Qs[Spouse.idxs.isRemarriage.form], null
                )
            }
        )
    }

    //配偶者存在
    static isSpouse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, Spouse.idxs.isRemarriage.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化
                pushInvalidEl(reqInputs[Spouse.idxs.isStepChild.input[no]], nextBtn);
                iniQs(Qs, Spouse.idxs.isStepChild.form, Spouse.idxs.isStepChild.form, Spouse.idxs.isStepChild.input);
                //システム対応外であることを表示する
                inputsField.errMsgEls[Spouse.idxs.isRemarriage.form].style.display = "block";
                inputsField.errMsgEls[Spouse.idxs.isRemarriage.form].innerHTML = "本システムでは対応できません";

            },
            ()=>{
                //エラーを非表示にする
                inputsField.errMsgEls[Spouse.idxs.isRemarriage.form].style.display = "none";
                inputsField.errMsgEls[Spouse.idxs.isRemarriage.form].innerHTML = "";
                inputsField.errMsgEls[Spouse.idxs.isStepChild.form].style.display = "none";
                inputsField.errMsgEls[Spouse.idxs.isStepChild.form].innerHTML = "";
                //被相続人以外の子を表示する
                slideDownIfHidden(Qs[Spouse.idxs.isStepChild.form], nextBtn);
            }
        )
    }

    //被相続人以外の子を表示する
    static isStepChild(rbIdx, nextBtn){
        this.handleYesNo(rbIdx, Spouse.idxs.isStepChild.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化
                pushInvalidEl(reqInputs[Spouse.idxs.isStepChild.input[no]], nextBtn);
                //システム対応外であることを表示する
                inputsField.errMsgEls[Spouse.idxs.isStepChild.form].style.display = "block";
                inputsField.errMsgEls[Spouse.idxs.isStepChild.form].innerHTML = "本システムでは対応できません";
            },
            ()=>{
                //エラーを非表示にする
                inputsField.errMsgEls[Spouse.idxs.isStepChild.form].style.display = "none";
                inputsField.errMsgEls[Spouse.idxs.isStepChild.form].innerHTML = "";
                //名前が入力されているときは次へボタンを有効化する
                breakQ(reqInputs[Spouse.idxs.name.input], nextBtn);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, Spouse.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する、日本在住を非表示にして値を初期化
                breakQ(reqInputs[Spouse.idxs.name.input], nextBtn, Qs, Spouse.idxs.isJapan.form, Spouse.idxs.isJapan.form, Spouse.idxs.isJapan.input);
            },
            ()=>{
                //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                pushInvalidElAndSDIfHidden(reqInputs[Spouse.idxs.isJapan.input[yes]], nextBtn, Qs[Spouse.idxs.isJapan.form]);
            }
        )
    }
}

/**
 * 配偶者項目を表示する
 * @param {number} rbIdx 押された次へボタンのインデックス
 * @param {HTMLElement[]} Qs 対象の項目の質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setSpouseRbsEvent(rbIdx, Qs, nextBtn){
    //相続時存在
    if(Spouse.idxs.isExist.input.includes(rbIdx)) SpouseRbHandler.isExist(rbIdx, Qs, nextBtn);
    //手続時存在
    else if(Spouse.idxs.isLive.input.includes(rbIdx)) SpouseRbHandler.isLive(rbIdx, Qs, nextBtn);
    //配偶者存在
    else if(Spouse.idxs.isRemarriage.input.includes(rbIdx)) SpouseRbHandler.isSpouse(rbIdx, Qs, nextBtn);
    //被相続人以外の子存在
    else if(Spouse.idxs.isStepChild.input.includes(rbIdx)) SpouseRbHandler.isStepChild(rbIdx, nextBtn);
    //相続放棄
    else if(Spouse.idxs.isRefuse.input.includes(rbIdx)) SpouseRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //日本在住
    else SpouseRbHandler.isJapan(Spouse.idxs.name.input, nextBtn);
}

/**
 * 子の欄のラジオボタンのイベントハンドラー
 */
class ChildRbHandler extends CommonRbHandler{
    //同じ配偶者
    static isSameSpouse(Qs){
        //手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(Qs[Descendant.idxs.isLive.form]);
        //手続時存在の初期値があるとき、手続時存在trueのイベントを発生させる
        if(reqInputs[Descendant.idxs.isLive.input[yes]].disabled){
            const event = new Event("change");
            reqInputs[Descendant.idxs.isLive.input[yes]].dispatchEvent(event);
            //相続放棄の初期値があるとき、相続放棄trueのイベントを発生させる
            if(reqInputs[Descendant.idxs.isRefuse.input[no]].disabled){
                reqInputs[Descendant.idxs.isRefuse.input[no]].checked = true;
                reqInputs[Descendant.idxs.isRefuse.input[no]].dispatchEvent(event);
                //成人欄の初期値があるとき、成人trueのイベントを発生させる
                if(reqInputs[Descendant.idxs.isAdult.input[yes]].disabled)
                    reqInputs[Descendant.idxs.isAdult.input[yes]].dispatchEvent(event);
                //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
                if(reqInputs[Descendant.idxs.isJapan.input[yes]].disabled)
                    reqInputs[Descendant.idxs.isJapan.input[yes]].dispatchEvent(event);
            }
        }
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        const rbIdxs = rbIdx === Descendant.idxs.isLive.input[yes] ? 
            getSequentialNumArr(Descendant.idxs.isExist.input[yes], Descendant.idxs.isChild.input[no]):
            Descendant.idxs.isRefuse.input.concat(Descendant.idxs.isAdult.input).concat(Descendant.idxs.isJapan.input);
        this.handleYesNo(rbIdx, Descendant.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    reqInputs[Descendant.idxs.isJapan.input[yes]], nextBtn,
                    Qs, Descendant.idxs.isExist.form, Descendant.idxs.childCount.form, rbIdxs, Qs[Descendant.idxs.childCount.form],
                    Qs[Descendant.idxs.isRefuse.form], null
                )
            },
            ()=>{
                //noAction
                slideUpDisuseEl(Qs[Descendant.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    reqInputs[Descendant.idxs.childCount.input], nextBtn,
                    Qs, Descendant.idxs.isRefuse.form, Descendant.idxs.isJapan.form, rbIdxs, null,
                    Qs[Descendant.idxs.isExist.form], null
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, Qs, nextBtn){
        //エラー要素として子供の人数欄を追加して次へボタンを無効化する
        pushInvalidEl(reqInputs[Descendant.idxs.childCount.input], nextBtn);
        this.handleYesNo(rbIdx, Descendant.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    null, null,
                    Qs, Descendant.idxs.isChild.form, Descendant.idxs.childCount.form, Descendant.idxs.isChild.input, reqInputs[Descendant.idxs.childCount.input],
                    Qs[Descendant.idxs.isRefuse.form], null
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(Descendant.idxs.isRefuse.input[yes], Descendant.idxs.isChild.input[no]);
                changeCourse(
                    null, null,
                    Qs, Descendant.idxs.isRefuse.form, Descendant.idxs.childCount.form, rbIdxs, reqInputs[Descendant.idxs.childCount.input],
                    Qs[Descendant.idxs.isChild.form], null
                )
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, Descendant.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する、falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = Descendant.idxs.isSpouse.input.concat(Descendant.idxs.isChild.input).concat(Descendant.idxs.isAdult.input).concat(Descendant.idxs.isJapan.input);
                breakQ(reqInputs[Descendant.idxs.name.input], nextBtn, Qs, Descendant.idxs.isSpouse.form, Descendant.idxs.isJapan.form, rbIdxs, reqInputs[Descendant.idxs.childCount.input]);
            },
            ()=>{
                //手続時存在trueのとき
                if(reqInputs[Descendant.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(reqInputs[Descendant.idxs.isJapan.input[yes]], nextBtn, Qs[Descendant.idxs.isAdult.form]);
                }else if(reqInputs[Descendant.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(reqInputs[Descendant.idxs.childCount.input], nextBtn, Qs[Descendant.idxs.isSpouse.form]);
                }
            }            
        )
    }

    //配偶者確認
    static isSpouse(el){
        slideDownIfHidden(el);
    }

    //子供存在
    static isChild(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, Descendant.idxs.isChild.input[yes],
            ()=>{
                //子の人数欄を表示
                reqInputs[Descendant.idxs.childCount.input].value = "1";
                slideDown(Qs[Descendant.idxs.childCount.form]);
            },
            ()=>{
                //子の人数欄を非表示にして初期化する
                reqInputs[Descendant.idxs.childCount.input].value = "0";
                inputsField.errMsgEls[Descendant.idxs.childCount.form].style.display = "none";
                //子供の人数欄をエラー要素に追加して次へボタンを無効化、子の人数欄を表示
                slideUp(Qs[Descendant.idxs.childCount.form]);
            }
            )
        breakQ(reqInputs[Descendant.idxs.name.input], nextBtn);
    }

    //成人
    static isAdult(el){
        //日本在住欄を表示する
        slideDownIfHidden(el);
        //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
        if(reqInputs[Descendant.idxs.isJapan.input[yes]].disabled){
            const event = new Event("change");
            reqInputs[Descendant.idxs.isJapan.input[yes]].dispatchEvent(event);
        }
    }
}

/**
 * 子項目を表示する
 * @param {number} rbIdx イベントを設定するinputのインデックス
 * @param {HTMLElement[]} Qs 対象の項目の質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setChildRbsEvent(rbIdx, Qs, nextBtn){
    //同じ配偶者
    if(Descendant.idxs.isSameSpouse.input.includes(rbIdx)) ChildRbHandler.isSameSpouse(Qs);
    //手続時存在
    else if(Descendant.idxs.isLive.input.includes(rbIdx)) ChildRbHandler.isLive(rbIdx, Qs, nextBtn);
    //相続時存在
    else if(Descendant.idxs.isExist.input.includes(rbIdx)) ChildRbHandler.isExist(rbIdx, Qs, nextBtn);
    //相続放棄
    else if(Descendant.idxs.isRefuse.input.includes(rbIdx)) ChildRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //配偶者確認
    else if(Descendant.idxs.isSpouse.input.includes(rbIdx)) ChildRbHandler.isSpouse(Qs[Descendant.idxs.isChild.form]);
    //子の存在欄
    else if(Descendant.idxs.isChild.input.includes(rbIdx)) ChildRbHandler.isChild(rbIdx, Qs, nextBtn);
    //成人欄
    else if(Descendant.idxs.isAdult.input.includes(rbIdx)) ChildRbHandler.isAdult(Qs[Descendant.idxs.isJapan.form]);
    //日本在住欄
    else if(Descendant.idxs.isJapan.input.includes(rbIdx)) ChildRbHandler.isJapan(Descendant.idxs.name.input, nextBtn);
}

/**
 * 尊属のラジオボタンのイベントハンドラー
 */
class AscendantRbHandler extends CommonRbHandler{
    static idxs = {
        name:{form: 0, input: 0},
        isLive:{form: 1, input: [1, 2]},
        isExist:{form: 2, input: [3, 4]},
        isRefuse:{form: 3, input: [5, 6]},
        isSpouse:{form: 4, input: [7, 8]},
        isRemarriage:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        isJapan:{form: 7, input: [13, 14]},
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラー要素に日本在住trueを追加して次へボタンを無効化/falseのときに表示した質問と値の初期化/相続放棄欄を表示
                const rbIdx = getSequentialNumArr(this.idxs.isExist.input[yes], this.idxs.isChild.input[no]);
                changeCourse(
                    reqInputs[this.idxs.isJapan.input[yes]], nextBtn,
                    Qs, this.idxs.isExist.form, this.idxs.isChild.form, rbIdx, null,
                    Qs[this.idxs.isRefuse.form], null
                )
                isParentsInheritance = false;
            },
            ()=>{
                //noAction
                //エラー要素に被相続人以外の子を追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/配偶者存在欄を表示
                const rbIdxs = this.idxs.isRefuse.input.concat(this.idxs.isJapan.input);
                changeCourse(
                    reqInputs[this.idxs.isChild.input[yes]], nextBtn,
                    Qs, this.idxs.isRefuse.form, this.idxs.isJapan.form, rbIdxs, null,
                    Qs[this.idxs.isExist.form], null
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isExist.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子欄を追加して次へボタンを無効にする、相続放棄を表示する
                pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isChild.input[yes]], nextBtn, Qs[this.idxs.isRefuse.form]);
            }
            ,()=>{
                //氏名以外のエラー要素を全て削除して氏名が入力されているときは次へボタンを有効にする、trueで表示した質問を全て非表示にして値を初期化する
                const rbIdxs = getSequentialNumArr(this.idxs.isRefuse.input[yes], this.idxs.isChild.input[no]);
                breakQ(reqInputs[this.idxs.name.input], nextBtn, Qs, this.idxs.isRefuse.form, this.idxs.isChild.form, rbIdxs);
                isParentsInheritance = false;
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する、falseで表示する質問を全て非表示にして値を初期化
                const rbIdxs = getSequentialNumArr(this.idxs.isSpouse.input[yes], this.idxs.isJapan.input[no]);
                breakQ(reqInputs[this.idxs.name.input], nextBtn, Qs, this.idxs.isSpouse.form, this.idxs.isJapan.form, rbIdxs);
                isParentsInheritance = false;
            },
            ()=>{
                //手続時生存trueのとき
                if(reqInputs[this.idxs.isLive.input[yes]].checked){
                    pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isJapan.input[yes]], nextBtn, Qs[this.idxs.isJapan.form]);
                }else if(reqInputs[this.idxs.isExist.input[yes]].checked){
                    //相続時生存trueのとき
                    //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                    pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isChild.input[yes]], nextBtn, Qs[this.idxs.isSpouse.form]);
                    inputsField.errMsgEls[this.idxs.isSpouse.form].style.display = "none";
                    inputsField.errMsgEls[this.idxs.isSpouse.form].innerHTML = "";           
                }
            }
        )
    }
    
    //配偶者存在
    static isSpouse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、falseで表示した質問を初期化、配偶者は母か確認欄を表示する
                changeCourse(
                    reqInputs[this.idxs.isChild.input[yes]], nextBtn,
                    Qs, this.idxs.isChild.form, this.idxs.isChild.form, this.idxs.isChild.input, null,
                    Qs[this.idxs.isRemarriage.form], null
                )
                //配偶者は母か確認欄のエラーメッセージを初期化する
                inputsField.errMsgEls[this.idxs.isRemarriage.form].style.display = "none";
                inputsField.errMsgEls[this.idxs.isRemarriage.form].innerHTML = "";
            },
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、trueで表示した質問を初期化、被相続人以外の子の欄を表示する
                const rbIdxs = getSequentialNumArr(this.idxs.isRemarriage.input[yes], this.idxs.isChild.input[no]);
                changeCourse(
                    reqInputs[this.idxs.isChild.input[yes]], nextBtn,
                    Qs, this.idxs.isRemarriage.form, this.idxs.isChild.form, rbIdxs, null,
                    Qs[this.idxs.isChild.form], null
                )
                //エラーを非表示にする
                inputsField.errMsgEls[this.idxs.isChild.form].style.display = "none";
                inputsField.errMsgEls[this.idxs.isChild.form].innerHTML = "";
            }
        )
    }

    //配偶者と母が同じを表示する
    static isRemarriage(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isRemarriage.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化
                slideDownAndScroll(Qs[this.idxs.isChild.form]);
                //エラーを非表示にする
                inputsField.errMsgEls[this.idxs.isRemarriage.form].style.display = "none";
                inputsField.errMsgEls[this.idxs.isRemarriage.form].innerHTML = "";
            },
            ()=>{
                //システム対応外であることを表示する
                inputsField.errMsgEls[this.idxs.isRemarriage.form].style.display = "block";
                inputsField.errMsgEls[this.idxs.isRemarriage.form].innerHTML = "本システムでは対応できません";
                //エラー要素として被相続人以外の子trueを追加してボタンを無効化する、被相続人以外の子を初期化する
                pushInvalidEl(reqInputs[this.idxs.isChild.input[yes]], nextBtn);
                iniQs(Qs, this.idxs.isChild.form, this.idxs.isChild.form, this.idxs.isChild.input);
            }
        )
    }

    //被相続人以外の子を表示する
    static isChild(rbIdx, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isChild.input[yes],
            ()=>{
                //氏名が適切に入力されているかチェックして次へボタンを有効化判別
                breakQ(reqInputs[this.idxs.name.input], nextBtn);
                //エラーメッセージを非表示にする
                inputsField.errMsgEls[this.idxs.isChild.form].innerHTML = "";
                inputsField.errMsgEls[this.idxs.isChild.form].style.display = "none";
                isParentsInheritance = true;
            },
            ()=>{
                //エラーを表示する
                inputsField.errMsgEls[this.idxs.isChild.form].innerHTML = "本システムでは対応できません";
                inputsField.errMsgEls[this.idxs.isChild.form].style.display = "block";
                //trueをエラー要素に追加して次へボタンを無効化する
                pushInvalidEl(reqInputs[this.idxs.isChild.input[yes]], nextBtn);
            }
        )
    }
}

/**
 * 配偶者項目を表示する
 * @param {number} rbIdx 押された次へボタンのインデックス
 * @param {HTMLElement[]} Qs 対象の項目の質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setAscendantRbsEvent(rbIdx, Qs, nextBtn){
    const nameIdx = 0;
    const isLiveIdx = [1, 2];
    const isExistIdx = [3, 4];
    const isRefuseIdx = [5, 6];
    const isSpouseIdx = [7, 8];
    const isRemarriageIdx = [9, 10];
    const isChildIdx = [11, 12];
    const isJapanIdx = [13, 14];

    //手続時存在
    if(isLiveIdx.includes(rbIdx)) AscendantRbHandler.isLive(rbIdx, Qs, nextBtn);
    //相続時存在
    else if(isExistIdx.includes(rbIdx)) AscendantRbHandler.isExist(rbIdx, Qs, nextBtn);
    //相続放棄
    else if(isRefuseIdx.includes(rbIdx)) AscendantRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //配偶者存在
    else if(isSpouseIdx.includes(rbIdx)) AscendantRbHandler.isSpouse(rbIdx, Qs, nextBtn);
    //配偶者と母は同じ
    else if(isRemarriageIdx.includes(rbIdx)) AscendantRbHandler.isRemarriage(rbIdx, Qs, nextBtn);
    //被相続人以外の子
    else if(isChildIdx.includes(rbIdx)) AscendantRbHandler.isChild(rbIdx, nextBtn);
    //日本在住
    else AscendantRbHandler.isJapan(nameIdx, nextBtn);
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
 * @param {number} idx カウント欄のインデックス
 * @param {number} limitCount 上限値又は下限値
 */
function adjustChildCount(isIncrease, idx, limitCount){
    let val = parseInt(reqInputs[idx].value) || 0;
    if((isIncrease && val < limitCount) || (!isIncrease && val > limitCount)){
        val += isIncrease ? 1 : -1;
    }
    reqInputs[idx].value = val;
}

/**
 * 人数欄の値変更イベント用
 * @param {HTMLElement} el イベントが発火した要素
 * @param {number} idx 入力欄のインデックス
 * @param {HTMLElement} nextBtn 次へボタン
 */
function countCheck(el, idx, nextBtn){
    let val = el.value;
    isValid = isNumber(val, el) ? true: "false"; //整数チェック
    let msg = "";

    //整数のとき
    if(typeof isValid === "boolean"){
        //15人以下チェック
        if(parseInt(val) > 15){
            isValid = "false";
            msg = "上限は１５人までです";
        }else if(parseInt(val) === 0){
            msg = "いない場合は上の質問で「いいえ」を選択してください";
            val = "1";
        }
    }else{
        msg = "入力必須です";
        val = "1";
    }

    sort(isValid, inputsField.errMsgEls[idx], msg, reqInputs[idx], nextBtn);
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
    }else if(!/\d|Backspace|Delete/.test(e.key)){
        //数字又はバックスペースとデリート以外は使用不可
        e.preventDefault()
    }
}

/**
 * 全角入力欄の値変更イベントのハンドラー
 * @param {HTMLElement} el 全角入力欄
 * @param {number} idx 全角入力欄のインデックス
 * @param {HTMLElement} nextBtn 次へボタン
 */
function handleFullWidthInputChange(el, idx, nextBtn){
    //エラー要素から削除
    invalidEls = invalidEls.filter(x => x !== el);
    //入力値のチェック結果を取得して結果に応じた処理をする
    isValid = isOnlyZenkaku(el);
    sort(isValid, inputsField.errMsgEls[idx], isValid, reqInputs[idx], nextBtn);
}

/**
 * エンターキーに次の入力欄にフォーカスする処理を実装する
 * @param {event} e イベント
 * @param {number} idx エンターキーが押された入力欄のインデックス
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
 * @param {number} idx カウント欄のインデックス
 * @param {number} minCount 設定の最小値
 * @param {HTMLElement} el カウント欄
 * @param {HTMLElement} nextBtn 次へボタン
 * @param {HTMLElement} plusBtn プラスボタン
 * @param {HTMLElement} minusBtn マイナスボタン
 * @param {number} val 増減後の値
 * @param {number} maxCount 設定の最大値
 */
function handleCountBtn(isIncrease, idx, minCount, el, nextBtn, plusBtn, minusBtn, val, maxCount){
    adjustChildCount(isIncrease, idx, (isIncrease ? maxCount:minCount));
    countCheck(el, idx, nextBtn);
    toggleCountBtn(plusBtn, minusBtn, val, minCount, maxCount);
}

/**
 * カウント欄と増減ボタンにイベントを設定
 * @param {HTMLElement} el カウントinputが属するフォーム欄
 * @param {number} idx カウントinputのインデックス
 * @param {HTMLElement} nextBtn 次へボタン
 * @param {number} minCount 最小値
 * @param {number} maxCount 最大値
 */
function setEventToCountInputAndButtons(el, idx, nextBtn, minCount, maxCount){
    const minusBtn = el.getElementsByClassName("decreaseBtn")[0];
    const plusBtn = el.getElementsByClassName("increaseBtn")[0];
    //カウント入力欄
    reqInputs[idx].addEventListener("change", (e)=>{
        countCheck(e.target, idx, nextBtn);
        toggleCountBtn(plusBtn, minusBtn, parseInt(e.target.value), minCount, maxCount);
    })
    reqInputs[idx].addEventListener("keydown",(e)=>{
        handleNumInputKeyDown(e, (idx === 2 ? reqInputs[idx + 1] : nextBtn));
    })
    reqInputs[idx].addEventListener("input", (e)=>{
        //３文字以上入力不可
        e.target.value = e.target.value.slice(0,2);
    })
    //マイナスボタン
    minusBtn.addEventListener("click",(e)=>{
        handleCountBtn(false, idx, minCount, reqInputs[idx], nextBtn, plusBtn, minusBtn, parseInt(reqInputs[idx].value), maxCount)
    })
    //プラスボタン
    plusBtn.addEventListener("click",(e)=>{
        handleCountBtn(true, idx, minCount, reqInputs[idx], nextBtn, plusBtn, minusBtn, parseInt(reqInputs[idx].value), maxCount)
    })
}

/**
 * 次の入力欄を表示する
 * @param {number} i ループ変数
 * @param {HTMLElement} fieldset イベントをセットする対象のフィールドセット
 * @param {HTMLElement[]} Qs 対象の項目の質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setEventToIndivisualFieldset(i, fieldset, Qs, nextBtn){
    //氏名（個人用の入力欄では共通のインデックス）
    const nameInputIdx = 0;
    if(i === nameInputIdx){
        reqInputs[i].addEventListener("change",(e)=>{
            handleFullWidthInputChange(e.target, i, nextBtn);
        })
        reqInputs[i].addEventListener("keydown",(e)=>{
            setEnterKeyFocusNext(e, reqInputs[i + 1]);
        })
    }else{
        //氏名欄以外のとき

        //配偶者欄のとき
        if(fieldset.id === "spouseFieldset"){
            reqInputs[i].addEventListener("change",(e)=>{
                setSpouseRbsEvent(i, Qs, nextBtn);
            })
        }else if(fieldset.classList.contains("childFieldset")){
            //子の欄

            //人数欄
            if(i === Descendant.idxs.childCount.input){
                const countForm = Qs[Descendant.idxs.childCount.form]; 
                setEventToCountInputAndButtons(countForm, i, nextBtn, 1, 15);
            }else{
                //ラジオボタン欄

                //値変更
                reqInputs[i].addEventListener("change",(e)=>{
                    //子専用のラジオボタンイベントを設定
                    setChildRbsEvent(i, Qs, nextBtn);
                })
            }
        }else if(fieldset.classList.contains("ascendantFieldset")){
            //尊属の欄
            reqInputs[i].addEventListener("change",(e)=>{
                //ラジオボタンイベントを設定
                setAscendantRbsEvent(i, Qs, nextBtn);
            })
        }
    }
}

/**
 * 子供欄のラジオボタンのインベントハンドラー
 */
class ChildrenRbHandler extends CommonRbHandler{
    //子供存在
    static isExist(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, ChildCommon.idxs.isExist.input[yes],
            //yesAction
            ()=>{
                //エラー要素を初期化する
                invalidEls = invalidEls.filter(x => x === reqInputs[ChildCommon.idxs.isJapan.input[yes]])
                pushInvalidEl(reqInputs[ChildCommon.idxs.isJapan.input[yes]], nextBtn);
                //人数入力欄を表示する
                reqInputs[ChildCommon.idxs.count.input].value = "1";
                slideDownAndScroll(Qs[ChildCommon.idxs.count.form]);
                slideDown(Qs[ChildCommon.idxs.isSameParents.form]);
                //子供いないフラグをfalseにする
                isNoChild = false;
            },
            //noAction
            ()=>{
                invalidEls.length = 0;
                const rbIdxs = ChildCommon.idxs.isSameParents.input.concat(ChildCommon.idxs.isLive.input).concat(ChildCommon.idxs.isRefuse.input).concat(ChildCommon.idxs.isAdult.input).concat(ChildCommon.idxs.isJapan.input);
                iniQs(Qs, ChildCommon.idxs.count.form, ChildCommon.idxs.isJapan.form, rbIdxs, reqInputs[rbIdx]);
                //次へボタンを有効化して子供なしフラグをtrueにする
                nextBtn.disabled = false;
                isNoChild = true;
            }
        )
    }

    //同じ両親
    static isSameParents(el){
        slideDownIfHidden(el);
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, ChildCommon.idxs.isLive.input[yes],
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(reqInputs[ChildCommon.idxs.isJapan.input[yes]], nextBtn, Qs[ChildCommon.idxs.isRefuse.form]);
            },
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = ChildCommon.idxs.isRefuse.input.concat(ChildCommon.idxs.isAdult.input).concat(ChildCommon.idxs.isJapan.input);
                breakQ(reqInputs[ChildCommon.idxs.count.input], nextBtn, Qs, ChildCommon.idxs.isRefuse.form, ChildCommon.idxs.isJapan.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, ChildCommon.idxs.isRefuse.input[yes], 
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = ChildCommon.idxs.isAdult.input.concat(ChildCommon.idxs.isJapan.input);
                breakQ(reqInputs[ChildCommon.idxs.count.input], nextBtn, Qs, ChildCommon.idxs.isAdult.form, ChildCommon.idxs.isJapan.form, rbIdxs);
            },
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(reqInputs[ChildCommon.idxs.isJapan.input[yes]], nextBtn, Qs[ChildCommon.idxs.isAdult.form]);
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
 * @param {HTMLElement[]} Qs 全質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setChildrenRbsEvent(rbIdx, Qs, nextBtn){
    //子供存在
    if(ChildCommon.idxs.isExist.input.includes(rbIdx)) ChildrenRbHandler.isExist(rbIdx, Qs, nextBtn);
    //同じ両親
    else if(ChildCommon.idxs.isSameParents.input.includes(rbIdx)) ChildrenRbHandler.isSameParents(Qs[ChildCommon.idxs.isLive.form]);
    //手続時生存
    else if(ChildCommon.idxs.isLive.input.includes(rbIdx)) ChildrenRbHandler.isLive(rbIdx, Qs, nextBtn);
    //相続放棄
    else if(ChildCommon.idxs.isRefuse.input.includes(rbIdx)) ChildrenRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //成人
    else if(ChildCommon.idxs.isAdult.input.includes(rbIdx)) ChildrenRbHandler.isAdult(Qs[ChildCommon.idxs.isJapan.form]);
    //日本在住
    else ChildrenRbHandler.isJapan(ChildCommon.idxs.count.input, nextBtn);
}

/**
 * 子全員又は兄弟姉妹全員欄のイベントを設定する
 * @param {number} i ループ変数
 * @param {HTMLElement} fieldset 対象の項目
 * @param {HTMLElement[]} Qs 対象の項目の質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setEventToGroupFieldset(i, fieldset, Qs, nextBtn){

    //人数欄
    const countInputIdx = 2;
    if(i === countInputIdx){
        const countFormIdx = 1;
        const countForm = Qs[countFormIdx]; 
        setEventToCountInputAndButtons(countForm, i, nextBtn, 1, 15);

    }else{
        if(fieldset.id === "childrenFieldset")
        reqInputs[i].addEventListener("change", (e)=>{
            setChildrenRbsEvent(i, Qs, nextBtn);
        })
    }
}

/**
 * 各フォームから初期値を入力するinput要素を取得する。取得したinputは初期化される。
 * @param {string} relation child又はcollateral
 * @returns 取得した各フォームのinput要素（true,false両方のラジオボタン）
 */
function getForms(relation){

    const fieldsets = document.getElementsByClassName(`${relation}Fieldset`);
    const forms = [];
    //子又は兄弟姉妹の初期値を反映させるフォームのインデックス
    const isSameIdx = 1;
    const isLiveIdx = 2;
    const isRefuseIdx = 4;
    const isAdultIdx = 8;
    const isJapanIdx = 9;
    const requiredIdx = [isSameIdx, isLiveIdx, isRefuseIdx, isAdultIdx, isJapanIdx];
    for(let i = 0, len = fieldsets.length; i < len; i++){
        const form = [];
        const Qs = Array.from(fieldsets[i].getElementsByClassName("Q"));
        for(let j = 0, len = Qs.length; j < len; j++){
            if(requiredIdx.includes(j)){

                if(j !== isSameIdx) Qs[j].style.display = "none";

                Array.from(Qs[j].getElementsByTagName("input")).forEach((x)=>{
                    x.disabled = false;
                    x.checked = false;
                })
                form.push(Qs[j]);
            } 
        }
        forms.push(form);
    }

    return forms;
}

/**
 * データの反映と無効化
 * @param {HTMLElement[]} forms 子又は兄弟姉妹の欄
 * @param {number} formIdx 子又は兄弟姉妹の欄のインデックス
 * @param {number} inputIdx ラジオボタンのインデックス
 */
function checkAndDisableRbs(forms, formIdx, inputIdx){
    const isRefuseIdx = 2;
    const targetInputs = Array.from(forms[formIdx][inputIdx].getElementsByClassName("form-check-input"));
    targetInputs[(inputIdx === isRefuseIdx) ? no : yes].checked = true;
    targetInputs.forEach((x)=>{
        x.disabled = true;
    })
}

/**
 * 子供又は兄弟姉妹欄で入力された値を各個別フォームに初期値として反映させて初期表示を変更する
 * @param {number} fieldset 押された次へボタンが属するフィールドセット
 * @param {string} relation "children"又は"collaterals"
 * @param {HTMLElement[]} forms 反映させるinputがあるQ（child又はcollateralの）
 * @returns 子供欄の入力値
 */
function reflectData(fieldset, relation, forms){
    const isSameSpouseTrue = fieldset.querySelector(`[name="${relation}_is_spouse"]`);
    const isLiveTrue = fieldset.querySelector(`[name="${relation}_is_live"]`);
    const isRefuse = fieldset.querySelectorAll(`[name="${relation}_is_refuse"]`);
    const isAdultTrue = fieldset.querySelector(`[name="${relation}_is_adult"]`);
    const isJapanTrue = fieldset.querySelector(`[name="${relation}_is_japan"]`);
    const fromData = {
        isSameSpouseTrue: { idx: 0, checked: isSameSpouseTrue.checked ? true: false },
        isLiveTrue: { idx: 1, checked: isLiveTrue.checked ? true: false },
        isRefuseFalse: { idx: 2, checked: isRefuse[no].checked ? true: false },
        isAdultTrue: { idx: 3, checked: isAdultTrue.checked ? true: false },
        isJapanTrue: { idx: 4, checked: isJapanTrue.checked ? true: false }
    }

    for(let i = 0, len = forms.length; i < len; i++){
        for(let key in fromData){
            if(fromData[key].checked){
                checkAndDisableRbs(forms, i, fromData[key].idx);
            }
        }
    }

    return fromData;
}

/**
 * 全尊属の欄のタイトルを更新する
 * @param {HTMLElement} preFieldset 一つ前のフィールドセット
 */
function updateAscendantTitle(preFieldset){
    const fieldsets = document.getElementsByClassName("ascendantFieldset");
    const ascendantNames = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"];
    const preFieldsetTitle = preFieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
    const preFieldsetTitleParts = preFieldsetTitle.replace(/\n/g, "").replace(/\s/g, "").split("－");
    const preFieldsetNum = parseInt(ZenkakuToHankaku(preFieldsetTitleParts[0]));
    for(let i = 0, len = fieldsets.length; i < len; i++){
        const titleEl =  fieldsets[i].getElementsByClassName("fieldsetTitle")[0];
        const newNum = hankakuToZenkaku(String(preFieldsetNum + 1));
        const newTitle = `${newNum}－${hankakuToZenkaku(String(i + 1))}．${ascendantNames[i]}について`;
        titleEl.textContent = newTitle;
    }
}

/**
 * 引数で渡すフィールドセット内にあるinputとbutton要素にタブインデックスを更新する
 * @param {HTMLElement[]} fieldsets タブインデックスを更新するinput要素が属するフィールドセット
 */
function updateAscendantTabindex(fieldsets){
    const lastNextBtn = inputsField.nextBtns[inputsField.nextBtns.length - 1];
    let newTabindex = parseInt(lastNextBtn.getAttribute("tabindex")) + 1;
    const beforeCountInputIdx = 13;
    const afterCountInputIdx = 15;
    for(let i = 0, len = fieldsets.length; i < len; i++){
        const inputs = Array.from(fieldsets[i].getElementsByTagName("input"));
        const buttons = Array.from(fieldsets[i].getElementsByTagName("button"));
        //尊属欄用のインデックス（子の人数の入力欄に+-のボタンがあるため）
        inputs.splice(beforeCountInputIdx, 0, buttons.shift());
        inputs.splice(afterCountInputIdx, 0, buttons.shift());
        const els = inputs.concat(buttons);
        for(let j = 0, len = els.length; j < len; j++){
            els[j].setAttribute("tabindex", (newTabindex + j));
        }
        newTabindex += els.length;
    }
}

/**
 * 個人入力欄のフィールドセットを初期化する
 * @param {HTMLElement[]} fieldsets 初期化対象のフィールドセット
 */
function iniIndivisualFieldsets(fieldsets){
    //値の初期化
    iniAllInputs(fieldsets);
    //質問の初期表示を初期化
    fieldsets.forEach((fieldset, i) => {
        const Qs = fieldset.getElementsByClassName("Q");
        const startFormIdx = 2;
        Array.from(Qs).slice(startFormIdx).forEach(Q => {
            Q.style.display = "none";
        });
    });
}

/**
 * 尊属に権利が移動したか判別する
 * @returns 
 */
function checkIfTransfferedToAscendant(){
    //子の欄を全て取得する
    const childFieldsets = document.getElementsByClassName("childFieldset");
    for(let i = 0, len = childFieldsets.length; i < len; i++){
        const inputs = childFieldsets[i].getElementsByTagName("input");
        /**
         * 卑属に相続権がある条件(falseの条件)
         * ・手続時に生存している、かつ相続放棄していない
         * ・相続時に生存している、かつ相続放棄していない、かつ子又は配偶者がいる
         * ・相続時に死亡している、かつ子がいない
         */
        const isLiveTrue = inputs[Descendant.idxs.isLive.input[yes]].checked;
        const isRefuseFalse = inputs[Descendant.idxs.isRefuse.input[no]].checked;
        const isChildTrue = inputs[Descendant.idxs.isChild.input[yes].checked];
        const isSpouseTrue = inputs[Descendant.idxs.isSpouse.input[yes].checked];
        if(isLiveTrue && isRefuseFalse || isChildTrue || isSpouseTrue) return false;
    }
    return true;
}

/**
 * 子供欄から子の欄を表示するとき
 */
function childrenToChild(){
    const oldTotalForms = document.getElementById(`id_child-TOTAL_FORMS`);
    const oldFormCount = parseInt(oldTotalForms.value);
    const newFormCount = parseInt(reqInputs[ChildCommon.idxs.count.input].value);
    let childFieldsets = Array.from(document.getElementsByClassName("childFieldset"));
    //増えたとき、増えた分の子の欄を生成する
    if(newFormCount > oldFormCount){
        for(let i = oldFormCount; i < newFormCount; i ++){
            createForm(true);
        }
    }else if(newFormCount < oldFormCount){
        //減ったとき、余分な子の欄を削除する
        oldTotalForms.value = newFormCount;
        childFieldsets.slice(newFormCount).forEach(el => el.parentNode.removeChild(el));
    }
    //父、母、子の欄を初期化する
    const ascendantFieldsets = document.getElementsByClassName("ascendantFieldset");
    const parentsFieldsets = Array.from(ascendantFieldsets).slice(0, 2);
    iniIndivisualFieldsets(parentsFieldsets);
    childFieldsets = Array.from(document.getElementsByClassName("childFieldset"));
    iniIndivisualFieldsets(childFieldsets);
}

/**
 * 必要なフィールドセットを生成や使用しない欄の初期化など対象の続柄のフィールドセットを一括で調整をする
 * @param {HTMLElement} fieldset 押された次へボタンがあるフィールドセット
 */
function adjustFieldsets(fieldset){
    //子供欄から子の欄を表示するとき、子の欄のフォーム数の調整と父、母、子の欄の初期化
    if(fieldset.id === "childrenFieldset" && !isNoChild){
        childrenToChild();
        return;
    }

    //子の欄の次へボタンが押されたとき
    if(fieldset.classList.contains("childFieldset")){
        //最後の子の欄のとき
        const lastChildFieldset = getLastElByAttribute("childFieldset", "class");
        if(fieldset === lastChildFieldset)
            //尊属に権利が移動したか判別
            isTransfferedToAscendant = checkIfTransfferedToAscendant();
    }

    //父欄を表示するとき
    if(
        (fieldset.id === "childrenFieldset" && isNoChild) ||
        (isTransfferedToAscendant)
    ){
        //全尊属の欄のタイトルを設定
        updateAscendantTitle(fieldset);
        //父母欄のタブインデックスを設定
        const ascendantFieldsets = document.getElementsByClassName("ascendantFieldset");
        const parentsFieldsets = [ascendantFieldsets[0], ascendantFieldsets[1]];
        updateAscendantTabindex(parentsFieldsets);

        //子から尊属に権利が移動した場合はこの初期化はしない
        if(isTransfferedToAscendant) return;

        //子供欄から父の欄を表示するときは、子の欄を初期化する
        const childFieldsets = Array.from(document.getElementsByClassName("childFieldset"));
        removeAllExceptFirst(childFieldsets);
        iniIndivisualFieldsets([childFieldsets[0]]);
        document.getElementById(`id_child-TOTAL_FORMS`).value = 1;
        return;
    }

    //母欄のとき
    if(fieldset.id === "id_ascendant-1-fieldset"){
        //父方の祖父欄を表示する
        //母方の祖父欄を表示する
        //兄弟姉妹欄を表示する
        const fatherInputs = document.getElementById("id_ascendant-0-fieldset").getElementsByTagName("input");
        const isFatherRefuse = fatherInputs[Ascendant.idxs.isRefuse.input[yes]];
        const motherInputs = fieldset.getElementsByTagName("input");
        const isMotherRefuse = motherInputs[Ascendant.idxs.isRefuse.input[yes]];
        if(isFatherRefuse && isMotherRefuse) isTransfferedToCollateral = true;
        return;
        //完了フィールドセットを表jしうる
    }
}

/**
 * 子の欄の初期値に応じたイベントを発生させる
 */
function dispatchChildIniChangeEvent(){
    const event = new Event("change");
    for(let key in childrenData){
        if(childrenData[key].checked){
            reqInputs[childrenData[key].idx].checked = true;
            reqInputs[childrenData[key].idx].dispatchEvent(event);
        }else{
            break;
        }
    }
}

/**
 * フィールドセットに初期値を反映させる
 * @param fieldset 反映させるフィールドセット
 */
function setIniData(fieldset){
    //子供欄のとき
    if(fieldset.id === "childrenFieldset"){
        const isChildFalseIdx = 1;
        //子がいないとき、子がいないボタンが押されたときのイベントを発生させる
        if(reqInputs[isChildFalseIdx].checked){
            const event = new Event("change");
            reqInputs[isChildFalseIdx].dispatchEvent(event);
        }
    }else if(fieldset.id === "id_child-0-fieldset"){
        //子１の欄のとき、全てのこの欄に初期値を入力する
        const childForms = getForms("child");
        const childrenFieldsetIdx = inputsField.reqFieldsets.length - 2;
        const childrenFieldset = inputsField.reqFieldsets[childrenFieldsetIdx];
        childrenData = reflectData(childrenFieldset, "children", childForms);
        //インデックスを子の欄のものに合わせる
        childrenData.isSameSpouseTrue.idx = 1;
        childrenData.isLiveTrue.idx = 3;
        childrenData.isRefuseFalse.idx = 8;
        childrenData.isAdultTrue.idx = 14;
        childrenData.isJapanTrue.idx = 16;

        //初期値があるときは、そのイベントを発生させる。チェックが連続しているときだけループを続ける
        dispatchChildIniChangeEvent();
    }else if(fieldset.classList.contains("childFieldset")){
        dispatchChildIniChangeEvent();
    }
}

/**
 * 完了フィールドセットの戻るボタンのクリックイベントハンドラー
 * @param {event} e 
 */
function handleSubmitBtnFieldsetPreBtnClick(e){
    //完了フィールドセットを非表示にする
    const fieldset = document.getElementById("submitBtnFieldset");
    const lastHr = getLastElByAttribute("hr", "tag");
    slideUp(lastHr);
    slideUp(fieldset);
    lastHr.remove();
    //一つ前のフィールドセットを有効化する
    const preFieldset = inputsField.reqFieldsets[inputsField.reqFieldsets.length - 1];
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
    //一つ前のフィールドセットを最初の項目にフォーカスする
    reqInputs[0].focus();
    //最後のガイドをactiveにする
    const lastGuideIdx = Guide.guides.length - 1;
    Guide.guides[lastGuideIdx].classList.add("active");
    //最後のガイドをキャレットを表示する
    Guide.caretIcons[lastGuideIdx].style.display = "inline-block";
    //最後のガイドをチェックを非表示にする
    getLastElByAttribute("guideCheck", "class", Guide.guides[lastGuideIdx]).style.display = "none";
    //このイベントを削除する
    const preBtn = fieldset.getElementsByClassName("previousBtn")[0];
    preBtn.removeEventListener("click", handleSubmitBtnFieldsetPreBtnClick);
}

/**
 * 完了フィールドセットを有効化する
 * @param {HTMLElement} fromFieldset 一つ前のフィールドセット
 */
function enableSubmitBtnFieldset(fromFieldset){
    //完了フィールドセットを表示する
    const submitBtnFieldset = document.getElementById("submitBtnFieldset");
    displayFieldset(submitBtnFieldset);
    //最後のガイドのactiveを削除する
    const lastGuideIdx = Guide.guides.length - 1;
    const lastGuide = Guide.guides[lastGuideIdx];
    lastGuide.classList.remove("active");
    //最後のガイドのキャレットを非表示にする
    Guide.caretIcons[lastGuideIdx].style.display = "none";
    //最後のガイドのチェックを取得して表示する
    const lastGuideCheck = lastGuide.getElementsByClassName("guideCheck")[0];
    lastGuideCheck.style.display = "inline-block";
    //一つ前のフィールドセットを無効化する
    fromFieldset.disabled = true;
    //ボタンにタブインデックスを設定
    const lastFieldset = inputsField.reqFieldsets[inputsField.reqFieldsets.length - 1];
    const lastTabindex = lastFieldset.getElementsByClassName("nextBtn")[0].getAttribute("tabindex");
    const newTabindex = lastTabindex + 1;
    const btns = submitBtnFieldset.getElementsByTagName("button");
    for(let i = 0, len = btns.length; i < len; i++){
        btns[i].setAttribute("tabindex", newTabindex + 1);
    }
    //戻るボタンにイベントを設定
    const preBtn = submitBtnFieldset.getElementsByClassName("previousBtn")[0];
    preBtn.addEventListener("click", handleSubmitBtnFieldsetPreBtnClick);
    //完了ボタンにフォーカスを移動する
    const nextBtn = submitBtnFieldset.getElementsByClassName("nextBtn")[0];
    nextBtn.focus();
}

/**
 * 入力が完了したか判別する
 * @param {HTMLElement} fieldset 押された次へボタンが属するフィールドセット
 * @returns 入力完了フラグ
 */
function checkIfDone(fieldset){
    //最後の子の欄で次へボタンが押されたとき、１人でも手続時に健在な人がいれば完了ボタンを表示する
    if(fieldset.classList.contains("childFieldset")){
        const lastChildFieldset = getLastElByAttribute("childFieldset", "class");
        if(fieldset === lastChildFieldset){
            const childFieldsets = document.getElementsByClassName("childFieldset");
            for(let i = 0, len = childFieldsets.length; i < len; i++){
                const inputs = childFieldsets[i].getElementsByTagName("input");
                const isLiveTrue = inputs[Descendant.idxs.isLive.input[yes]].checked;
                const isRefuseFalse = inputs[Descendant.idxs.isRefuse.input[no]].checked;
                if(isLiveTrue && isRefuseFalse){
                    enableSubmitBtnFieldset(fieldset);
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 次の項目とガイドの次の項目を有効化して前の項目を無効化する
 * @param {boolean} isIndivisual 次の欄が個人用欄フラグ
 */
function oneStepFoward(isIndivisual){
    const fromFieldsetIdx = inputsField.reqFieldsets.length - 1
    const fromFieldset = inputsField.reqFieldsets[fromFieldsetIdx];

    //入力完了判断
    if(checkIfDone(fromFieldset)) return;
    //有効化対象の続柄の全fieldsetの下準備
    adjustFieldsets(fromFieldset);
    //次のフィールドセットを表示
    enableNextFieldset(fromFieldset);
    //ガイドを更新
    updateGuide(fromFieldset);

    //表示対象のフィールドセットのデータを取得する
    const currentIdx = inputsField.reqFieldsets.length - 1;
    const fieldset = inputsField.reqFieldsets[currentIdx];
    const Qs = inputsField.reqFieldsets[currentIdx].getElementsByClassName("Q");
    const nextBtn = inputsField.nextBtns[currentIdx];

    //表示対象のフィールドセットが個人入力欄のとき
    if(isIndivisual){
        //イベントを設定
        for(let i = 0, len = reqInputs.length; i < len; i++){          
            setEventToIndivisualFieldset(i, fieldset, Qs, nextBtn);
        }
    }else{
        //子供全員又は兄弟姉妹全員入力欄のとき
        for(let i = 0, len = reqInputs.length; i < len; i++){
            setEventToGroupFieldset(i, fieldset, Qs, nextBtn);
        }
    }

    //有効化対象のフィールドセット全てに初期値をセットする
    //子供欄のとき
    if(fieldset.id === "childrenFieldset"){
        setIniData(fieldset);
    }else if(fieldset.classList.contains("childFieldset")){
        //子の欄のとき
        setIniData(fieldset);
    }

    //戻るボタンにイベントを設定
    const oneStepBackHandler = oneStepBack(fromFieldset);
    inputsField.preBtnsArr[inputsField.preBtnsArr.length - 1].addEventListener("click", oneStepBackHandler);

    //次へボタンにイベントを設定
    //配偶者欄又は母方の祖父母欄のとき
    if([spouse.fieldset.id, "motherGmotherFieldset"].includes(fieldset.id)){
        oneStepFowardHandler = function () {oneStepFoward(false)};
    }else{
        oneStepFowardHandler = function () {oneStepFoward(true)};
    }
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
    //チェック対象をエラー配列から削除
    invalidEls = invalidEls.filter(x => x !== el);
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
                if(e.key === "Enter"){
                    e.preventDefault();
                    decedent.inputs[Decedent.idxs.deathYear].focus();
                }
            })
        }

        //前入力欄にchangeイベントを設定する
        decedent.inputs[i].addEventListener("change", (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            isValid = decedentValidation(el);
            //チェック結果に応じて処理を分岐
            sort(isValid, decedent.errMsgEls[i], isValid, decedent.inputs[i], decedent.nextBtn);
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
    oneStepFoward(true);
})
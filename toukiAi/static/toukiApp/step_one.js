"use strict";

/**
    変数
*/
//この章の入力状況欄
class GuideField{
    constructor(){
        this.btns = [document.querySelector(".guideBtn")];
        this.guides = [document.querySelector(".guide")];
        this.caretIcons = [document.querySelector(".guideCaret")];
        this.checkIcons = [];
        this.elIdx = 0;
    }
}
const guideField = new GuideField();

//被相続人欄
class DecedentInput{
    static name = document.getElementById("id_name");
    static deathYear = document.getElementById("id_death_year");
    static deathMonth = document.getElementById("id_death_month");
    static prefecture = document.getElementById("id_prefecture");
    static city = document.getElementById("id_city");
    static domicilePrefecture = document.getElementById("id_domicile_prefecture");
    static domicileCity = document.getElementById("id_domicile_city");
}

//被相続人欄のインデックス
class DecedentInputIdx{
    static name = 0;
    static deathYear = 1;
    static deathMonth = 2;
    static prefecture = 3;
    static city = 4;
    static domicilePrefecture = 5;
    static domicileCity = 6;
}

//入力欄のフィールド
class InputsField{
    
    static decedentFieldset = document.querySelector("fieldset");
    
    constructor(){
        this.reqFieldsets = [InputsField.decedentFieldset];
        this.nextBtns = Array.from(InputsField.decedentFieldset.getElementsByClassName("nextBtn"));
        this.preBtnsArr = [];
        this.errMsgEls = Array.from(InputsField.decedentFieldset.getElementsByClassName("errorMessage"));
    }
}
const inputsField = new InputsField();

//被相続人項目のインデックス
const decedentFieldsetIdx = 0;
//次へボタンのイベントハンドラー
let oneStepFowardHandler;
//子供なしフラグ
let isNoChild = false;
let isNoCollateral = false;
//子供データ
let childrenData;

/**
 * 初期化
 */
function initialize(){
    updateSideBar();
    reqInputs = Object.values(DecedentInput);
    invalidEls = Object.values(DecedentInput);
    invalidEls.splice(DecedentInputIdx.deathYear, 1);
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
            for(let i = 0; i < response.city.length; i++){
                if(response.city[i]["id"].slice(0, 2) !== "13" && response.city[i]["name"].slice(-1) === "区") continue;
                option += `<option value="${response.city[i]["name"]}">${response.city[i]["name"]}</option>`;
            }

            el.innerHTML = option;
            errorMessageEl.style.display = hidden;

        }else{

            errorMessageEl.style.display = display;
            invalidEls.push(el);
        }
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        //次へボタンの表示判別
        inputsField.nextBtns[decedentFieldsetIdx].disabled = invalidEls.length === 0 ? false: true;
    });
}

/**
 * 属性のプレフィックスを変更する
 * @param {string} attribute 変更対象の属性
 * @param {HTMLElement} el 変更対象の要素
 * @param {number} num 変更後のプレフィックス番号
 */
function updateCloneIdOrName(attribute, el, num){
    const oldAttribute = el.getAttribute(attribute);
    const newAttribute = oldAttribute.replace(/\d+/g, num);
    el.setAttribute(attribute, newAttribute);
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
    for(let i = 0; i < inputsArr.length; i++){
        updateCloneIdOrName("name", inputsArr[i], oldCount);
        updateCloneIdOrName("id", inputsArr[i], oldCount);
        updateCloneTabindex(inputsArr[i], addTabIdx);
    }

    //buttonのtabindexを変更
    const btns = fieldset.getElementsByTagName("button");
    for(let i = 0; i < btns.length; i++){
        updateCloneTabindex(btns[i], addTabIdx)
    }
}

/**
 * 直前のフィールドセットをコピーする
 * @param {string} relation 続柄（child又はcollateral）
 * @returns idのプレフィックスを更新した複製したフィールドセット
 */
function copyPreFieldset(relation, oldCount){
    const fieldsets = document.getElementsByClassName(`${relation}Fieldset`);
    const preFieldset = fieldsets[fieldsets.length - 1];
    const newFieldset = preFieldset.cloneNode(true);
    newFieldset.id = `id_${relation}-${oldCount}-fieldset`;
    return newFieldset;
}

/**
 * フォームを生成する
 * @param {boolean} isChild 子フォームの生成か兄弟姉妹フォームの生成か判別する用
 */
function createForm(isChild) {
    //生成するフォームを判別
    let relation = isChild ? "child": "collateral";
    let zokugara = isChild ? "子": "兄弟姉妹";
    //formsetの数を１加算する
    const totalForms = document.getElementById(`id_${relation}-TOTAL_FORMS`);
    totalForms.value = parseInt(totalForms.value) + 1;
    //直前のfieldsetをコピーしてidを変更
    const newFieldset = copyPreFieldset(relation, oldCount);
    //タイトルを変更
    const titleEl = newFieldset.querySelector(".fieldsetTitle");
    updateTitleBranchNum(titleEl, zokugara, newCount);
    //属性を変更
    updateCloneAttribute(newFieldset, relation, oldCount);
    // 新しいfieldset要素をFormsetに追加します
    fromFieldset.after(newFieldset);
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
        reqInputs = fieldset.id === "decedentFieldset" ? Object.values(DecedentInput): Array.from(enableField.getElementsByTagName("input"));
    }
}

/**
 * 次の項目を有効化して前の項目を無効化する
 * @param {number} i 押された次へボタンのインデックス
 */
function displayNextFieldset(i){
    //次の項目を取得（子がいないときは、項目を１つ飛ばす）
    let nextFieldset = isNoChild ? document.getElementsByTagName("fieldset")[i + 2]: document.getElementsByTagName("fieldset")[i + 1];

    //次の項目を表示、hrを挿入、次の項目にスクロール
    inputsField.reqFieldsets.push(nextFieldset);
    slideDown(nextFieldset);
    const hr = document.createElement("hr");
    hr.className = "my-5";
    nextFieldset.before(hr);
    scrollToTarget(nextFieldset);
    
    //前の項目を無効化
    inputsField.reqFieldsets[i].disabled = true;

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
    const idx = guideField.btns.indexOf(e.target);
    scrollToTarget(inputsField.reqFieldsets[idx], 0);
}

/**
 * ガイドを強調する（事前にguideField.elIdxの加算をすること）
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {number} nextIdx 次のインデックス
 */
function addGuideActive(guideList, nextIdx){
    guideField.guides.push(guideList.getElementsByClassName("guide")[guideField.elIdx]);
    guideField.btns.push(guideList.getElementsByClassName("guideBtn")[guideField.elIdx]);
    guideField.caretIcons.push(guideList.getElementsByClassName("guideCaret")[guideField.elIdx]);
    
    if(guideField.guides[nextIdx].style.display === hidden)
        guideField.guides[nextIdx].style.display = display;

    guideField.guides[nextIdx].classList.add("active");
    guideField.btns[nextIdx].disabled = false;
    guideField.caretIcons[nextIdx].style.display = "inline-block";
}

/**
 * ガイドを通常表示にする
 * @param {HTMLElement} guideList ガイド全体の要素
 * @param {number} nextIdx 次のインデックス
 */
function removeGuideActive(guideList, nextIdx){
    //通常表示にする
    guideField.guides[nextIdx - 1].classList.remove("active");
    guideField.caretIcons[nextIdx - 1].style.display = "none";
    guideField.checkIcons.push(guideList.getElementsByClassName("guideCheck")[guideField.elIdx]);
    guideField.checkIcons[nextIdx - 1].style.display = "inline-block";
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
            const childGuides = guideList.getElementsByClassName("childGuide");
            const copyFrom = childGuides[childGuides.length - 1];
            const clone = copyFrom.cloneNode(true);
            //タイトルの枝番を変更
            const btn = clone.querySelector("button");
            updateTitleBranchNum(btn, "子", (i + 1));
            //idを変更して非表示から表示に変更して最後の要素の次に挿入する
            clone.style.display = display;
            clone.id = `id_child-${i}-guide`
            copyFrom.after(clone)
        }
    }else if(newCount < oldCount){
        //減ったとき
        const childGuides = guideList.getElementsByClassName("childGuide");
        childGuides.slice(newCount).forEach(el => el.parentNode.removeChild(el));
    }
}

/**
 * ガイドを更新する
 */
function enableNextGuide(){
    const guideList = document.getElementById("guideList");
    const nextIdx = inputsField.reqFieldsets.length - 1;

    //一つ前のガイドを通常表示にする
    removeGuideActive(guideList, nextIdx);

    //ガイドの次の項目が選択状態にする
    if(isNoChild){
        guideField.elIdx += 2;
    }else{
        guideField.elIdx += 1;
        
        //子のガイドを表示するとき、子の人数に応じてガイドの数を増やす
        if(guideField.guides[guideField.guides.length - 1].id === "id_children-guide"){
            //子の数を取得する
            const oldCount = guideList.getElementsByClassName("childGuide").length;
            const newCount = document.getElementsByClassName("childFieldset").length;
            adjustGuide(guideList, oldCount, newCount);
        }
    }

    //次の項目を強調する
    addGuideActive(guideList, nextIdx);

    //次の項目のガイドボタンにイベントを追加
    guideField.btns[nextIdx].addEventListener("click", scrollToTargetHandler);
}

/**
 * 前の項目を有効化する
 * @param {number} i 押された戻るボタンのインデックス
 */
function enablePreFieldset(i){
    const disableField = inputsField.reqFieldsets[i + 1]; //無効化対象のフィールドセット
    const enableField = inputsField.reqFieldsets[i]; //有効化対象のフィールドセット
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ

    //無効化するフィールドにあるイベントが設定されている要素を初期化してイベントを削除する
    replaceElements(disableField, "input");
    replaceElements(disableField, "button");

    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    slideUp(removeHr);
    inputsField.reqFieldsets.pop();
    removeHr.remove();
    
    //直前の項目を有効化してスクロール
    enableField.disabled = false;
    scrollToTarget(enableField);
    
    //一つ前のフィールドの要素を取得する
    getFieldsetEl(false, enableField);
}

/**
 * ガイドを削除する
 * @param {number} idx 
 */
function removeGuide(idx){
    guideField.guides[idx].classList.remove("active");
    guideField.guides.pop();

    guideField.btns[idx].removeEventListener("click", scrollToTargetHandler);
    guideField.btns[idx].disabled = true;
    guideField.btns.pop();

    guideField.caretIcons[idx].style.display = "none";
    guideField.caretIcons.pop();
}

/**
 * 戻るボタンにより一つ前のガイドを有効化する
 * @param {number} idx 
 */
function enablePreGuide(idx){
    guideField.checkIcons[idx].style.display = hidden;
    guideField.checkIcons.pop();
    guideField.guides[idx].classList.add("active");
    guideField.caretIcons[idx].style.display = "inline-block";
}

/**
 * ガイドを一つ戻す
 * @param {number} i 押された次へボタンのインデックス
 */
function putBackGuide(i){
    const currentIdx = guideField.guides.length - 1;
    
    //子１の欄のとき
    const currentGuideId = guideField.guides[currentIdx].id;
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
        guideField.elIdx -= 2;
    else if(currentGuideId === "id_child-0-guide"){
        isNoChild = false;
        guideField.elIdx -= 1;
    }else{
        guideField.elIdx -= 1;
    }

    //ガイドのデータを削除する
    removeGuide(currentIdx);
    //一つ前の項目をactiveにする
    enablePreGuide(currentIdx - 1);
}

/**
 * 前の項目を有効化にする
 * @param {num} i 押された戻るボタンのインデックス
 */
function oneStepBack(i){
    return function(e){
        //前の項目を有効化とガイドの巻き戻し
        putBackGuide(i);
        enablePreFieldset(i);
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
        if(elsArr[i].style.display !== hidden) slideUp(elsArr[i]);    
    }
}

/**
 * 使用しない要素を１つ非表示にする
 * @param {HTMLElement} el 対象の要素
 */
function slideUpDisuseEl(el){
    if(el.style.display !== hidden) slideUp(el);    
}

/**
 * エラー配列に対象のエラー要素がないとき追加する（オプションでボタンの無効化も可）
 * @param {HTMLElement} el 対象のエラー要素
 * @param {HTMLElement} btn 無効化したいボタン
 */
function pushInvalidEl(el, btn = null){
    if(invalidEls.indexOf(el) === -1){
        invalidEls.push(el);
        if(btn !== null) btn.disabled = true;
    }
}

/**
 * 複数の質問欄を非表示にして値を初期化する
 * @param {HTMLElement} QsArr 連続する質問欄
 * @param {number} startIdx 非表示を開始する質問欄のインデックス
 * @param {number} endIdx 非表示を終了する質問欄のインデックス
 * @param {number} rbIdxArr 初期化するラジオボタンの配列
 * @param {HTMLElement} textInput 人数テキストボックスの初期化
 */
function initializeQs(QsArr, startIdx, endIdx, rbIdxArr, textInput = null){
    uncheckTargetElements(reqInputs, rbIdxArr);
    if(textInput !== null)
        textInput.value = "0";
    slideUpDisuseEls(QsArr, startIdx, endIdx);
}

/**
 * 入力事項をチェックして次へボタンを有効化するか判別する
 * @param {HTMLElement} el チェック対象の要素
 * @param {HTMLElement} btn 有効化するボタン
 */
function validateBeforeEnableNextBtn(el, btn){
    invalidEls = invalidEls.filter(x => x === el);
    if(invalidEls.length === 0) btn.disabled = false;
}

/**
 * 非表示のとき対象の要素を表示する
 * @param {HTMLElement} el 表示する要素
 */
function slideDownElIfHidden(el){
    if(el.style.display === hidden)
        slideDown(el);
}

/**
 * 同じ要素をスライドアップしてスライドダウンするときの表示
 * @param {HTMLElement} el 対象の要素
 * @param {number} time スライドアップが完了する時間間
 */
function slideDownAfterSlideUp(el, time = null){
    setTimeout(() => {
        slideDown(el);
    }, time = time !== null ? time: 250);
}

/**
 * エラー要素を追加して要素をスライドダウン表示する
 * @param {HTMLElement} errEl 追加するエラー要素
 * @param {HTMLElement} btn 無効化するボタン
 * @param {HTMLElement} displayEl スライドダウン表示する要素
 */
function pushInvalidElAndSDIfHidden(errEl, btn, displayEl){
    pushInvalidEl(errEl, btn);
    slideDownElIfHidden(displayEl);
}

/**
 * pushInvalidEl, initializeQs, slideDownAfterSlideUpをまとめた関数
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
    initializeQs(args[2], args[3], args[4], args[5], args[6]);
    slideDownAfterSlideUp(args[7], args[8]);
}

/**
 * 共通のラジオボタンイベントハンドラー
 */
class CommonRbHandler{
    //日本在住
    static isJapan(idx, btn){
        validateBeforeEnableNextBtn(reqInputs[idx], btn);
    }
}

/**
 * 配偶者のラジオボタンのイベントハンドラー
 */
class SpouseRbHandler extends CommonRbHandler{
    static idxs = {
        name:{form: 0, input: 0},
        isExist:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isSpouse:{form: 3, input: [5, 6]},
        isStepChild:{form: 4, input: [7, 8]},
        isRefuse:{form: 5, input: [9, 10]},
        isJapan:{form: 6, input: [11, 12]},
    }

    static handleYesNo(rbIdx, yesIdx, yesAction, noAction){
        if(rbIdx === yesIdx) yesAction();
        else noAction();
    }

    //相続時存在
    static isExist(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isExist.input[yes],
            ()=>{
                //yesAction
                //エラー要素に氏名を追加して次へボタンを無効にする、手続時存在を表示する
                pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isExist.input[yes]], nextBtn, Qs[this.idxs.isLive.form]);
                //氏名欄が無効なときは有効にする
                if(reqInputs[this.idxs.name.input].disabled)
                    reqInputs[this.idxs.name.input].disabled = false;
            }
            ,()=>{
                //noAction
                //エラー要素を全て削除する/次へボタンを有効にする/氏名欄を初期化して無効にする
                invalidEls.length = 0;
                nextBtn.disabled = false;
                reqInputs[this.idxs.name.input].value = "";
                reqInputs[this.idxs.name.input].disabled = true;
                //3問目以降の質問を全て非表示にして値を初期化する
                const rbIdxArr = this.idxs.isLive.input.concat(this.idxs.isSpouse.input).concat(this.idxs.isStepChild.input).concat(this.idxs.isRefuse.input).concat(this.idxs.isJapan.input);
                initializeQs(Qs, this.idxs.isLive.form, this.idxs.isJapan.form, rbIdxArr);
            }
        )
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isLive.input[yes],
            ()=>{
                //エラー要素に日本在住trueを追加して次へボタンを無効化/被相続人以外の子欄の非表示と値の初期化/相続放棄欄を表示
                const rbIdx = this.idxs.isSpouse.input.concat(this.idxs.isStepChild.input)
                changeCourse(
                    reqInputs[this.idxs.isJapan.input[yes]], nextBtn,
                    Qs, this.idxs.isSpouse.form, this.idxs.isStepChild.form, rbIdx, null,
                    Qs[this.idxs.isRefuse.form], null
                )
            },
            ()=>{
                //被相続人以外の子のエラーメッセージを非表示
                inputsField.errMsgEls[this.idxs.isSpouse.form].style.display = hidden;
                inputsField.errMsgEls[this.idxs.isSpouse.form].innerHTML = "";
                const rbIdxArr = this.idxs.isRefuse.input.concat(this.idxs.isJapan.input);
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化/相続放棄欄以降の非表示と値の初期化/被相続人以外の子欄を表示
                changeCourse(
                    reqInputs[this.idxs.isStepChild.input[no]], nextBtn,
                    Qs, this.idxs.isRefuse.form, this.idxs.isJapan.form, rbIdxArr, null,
                    Qs[this.idxs.isSpouse.form], null
                )
            }
        )
    }

    //配偶者存在
    static isSpouse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isSpouse.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子falseを追加して次へボタンを無効化
                pushInvalidEl(reqInputs[this.idxs.isStepChild.input[no]], nextBtn);
                initializeQs(Qs, this.idxs.isStepChild.form, this.idxs.isStepChild.form, this.idxs.isStepChild.input);
                //システム対応外であることを表示する
                inputsField.errMsgEls[this.idxs.isSpouse.form].style.display = display;
                inputsField.errMsgEls[this.idxs.isSpouse.form].innerHTML = "本システムでは対応できません";

            },
            ()=>{
                //エラーを非表示にする
                inputsField.errMsgEls[this.idxs.isSpouse.form].style.display = hidden;
                inputsField.errMsgEls[this.idxs.isSpouse.form].innerHTML = "";
                inputsField.errMsgEls[this.idxs.isStepChild.form].style.display = hidden;
                inputsField.errMsgEls[this.idxs.isStepChild.form].innerHTML = "";
                //被相続人以外の子を表示する
                slideDownElIfHidden(Qs[this.idxs.isStepChild.form], nextBtn);
            }
        )
    }

    //被相続人以外の子を表示する
    static isStepChild(rbIdx, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isStepChild.input[yes],
            ()=>{
                //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化
                pushInvalidEl(reqInputs[this.idxs.isStepChild.input[no]], nextBtn);
                //システム対応外であることを表示する
                inputsField.errMsgEls[this.idxs.isStepChild.form].style.display = display;
                inputsField.errMsgEls[this.idxs.isStepChild.form].innerHTML = "本システムでは対応できません";
            },
            ()=>{
                //エラーを非表示にする
                inputsField.errMsgEls[this.idxs.isStepChild.form].style.display = hidden;
                inputsField.errMsgEls[this.idxs.isStepChild.form].innerHTML = "";
                //名前が入力されているときは次へボタンを有効化する
                validateBeforeEnableNextBtn(reqInputs[this.idxs.name.input], nextBtn);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isRefuse.input[yes],
            ()=>{
                //氏名が入力されているときは次へボタンを有効化する
                validateBeforeEnableNextBtn(reqInputs[this.idxs.name.input], nextBtn);
                //日本在住を非表示にして値を初期化
                initializeQs(Qs, this.idxs.isJapan.form, this.idxs.isJapan.form, this.idxs.isJapan.input);
            },
            ()=>{
                //日本在住trueをエラー要素を追加して次へボタンを無効化、日本在住欄を表示する
                pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isJapan.input[yes]], nextBtn, Qs[this.idxs.isJapan.form]);
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
    const nameIdx = 0;
    const isExistIdx = [1, 2];
    const isLiveIdx = [3, 4];
    const isSpouseIdx = [5, 6];
    const isStepChildIdx = [7, 8];
    const isRefuseIdx = [9, 10];
    const isJapanIdx = [11, 12];

    //相続時存在
    if(isExistIdx.includes(rbIdx)) SpouseRbHandler.isExist(rbIdx, Qs, nextBtn);
    //手続時存在
    else if(isLiveIdx.includes(rbIdx)) SpouseRbHandler.isLive(rbIdx, Qs, nextBtn);
    //配偶者存在
    else if(isSpouseIdx.includes(rbIdx)) SpouseRbHandler.isSpouse(rbIdx, Qs, nextBtn);
    //被相続人以外の子存在
    else if(isStepChildIdx.includes(rbIdx)) SpouseRbHandler.isStepChild(rbIdx, nextBtn);
    //相続放棄
    else if(isRefuseIdx.includes(rbIdx)) SpouseRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //日本在住
    else SpouseRbHandler.isJapan(nameIdx, nextBtn);
}

/**
 * 子の欄のラジオボタンのイベントハンドラー
 */
class ChildRbHandler extends CommonRbHandler{
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
        isJapan:{form: 9, input: [16, 17]},
    }

    static handleYesNo(rbIdx, yesIdx, yesAction, noAction){
        if(rbIdx === yesIdx) yesAction();
        else noAction();
    }

    //同じ配偶者
    static isSameSpouse(Qs){
        //手続時存在欄が表示されてないとき表示する
        slideDownElIfHidden(Qs[this.idxs.isLive.form]);
        //手続時存在の初期値があるとき、手続時存在trueのイベントを発生させる
        if(reqInputs[this.idxs.isLive.input[yes]].disabled){
            const event = new Event("change");
            reqInputs[this.idxs.isLive.input[yes]].dispatchEvent(event);
            //相続放棄の初期値があるとき、相続放棄trueのイベントを発生させる
            if(reqInputs[this.idxs.isRefuse.input[no]].disabled){
                reqInputs[this.idxs.isRefuse.input[no]].checked = true;
                reqInputs[this.idxs.isRefuse.input[no]].dispatchEvent(event);
                //成人欄の初期値があるとき、成人trueのイベントを発生させる
                if(reqInputs[this.idxs.isAdult.input[yes]].disabled)
                    reqInputs[this.idxs.isAdult.input[yes]].dispatchEvent(event);
                //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
                if(reqInputs[this.idxs.isJapan.input[yes]].disabled)
                    reqInputs[this.idxs.isJapan.input[yes]].dispatchEvent(event);
            }
        }
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        const rbIdxArr = rbIdx === this.idxs.isLive.input[yes] ? 
            this.idxs.isExist.input.concat(this.idxs.isRefuse.input).concat(this.idxs.isSpouse.input).concat(this.idxs.isChild.input):
            this.idxs.isRefuse.input.concat(this.idxs.isAdult.input).concat(this.idxs.isJapan.input);
        this.handleYesNo(rbIdx, this.idxs.isLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    reqInputs[this.idxs.isJapan.input[yes]], nextBtn,
                    Qs, this.idxs.isExist.form, this.idxs.childCount.form, rbIdxArr, Qs[this.idxs.childCount.form],
                    Qs[this.idxs.isRefuse.form], null
                )
            },
            ()=>{
                //noAction
                slideUpDisuseEl(Qs[this.idxs.isRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    reqInputs[this.idxs.childCount.input], nextBtn,
                    Qs, this.idxs.isAdult.form, this.idxs.isJapan.form, rbIdxArr, null,
                    Qs[this.idxs.isExist.form], null
                )
            }
        )
    }

    //相続時存在
    static isExist(rbIdx, Qs, nextBtn){
        //エラー要素として子供の人数欄を追加して次へボタンを無効化する
        pushInvalidEl(reqInputs[this.idxs.childCount.input], nextBtn);
        this.handleYesNo(rbIdx, this.idxs.isExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    null, null,
                    Qs, this.idxs.isChild.form, this.idxs.childCount.form, this.idxs.isChild.input, reqInputs[this.idxs.childCount.input],
                    Qs[this.idxs.isRefuse.form], null
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxArr = this.idxs.isRefuse.input.concat(this.idxs.isSpouse.input).concat(this.idxs.isChild.input);
                changeCourse(
                    null, null,
                    Qs, this.idxs.isRefuse.form, this.idxs.childCount.form, rbIdxArr, reqInputs[this.idxs.childCount.input],
                    Qs[this.idxs.isChild.form], null
                )
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する
                validateBeforeEnableNextBtn(reqInputs[this.idxs.name.input], nextBtn);
                //falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxArr = this.idxs.isSpouse.input.concat(this.idxs.isChild.input).concat(this.idxs.isAdult.input).concat(this.idxs.isJapan.input);
                initializeQs(Qs, this.idxs.isSpouse.form, this.idxs.isJapan.form, rbIdxArr, reqInputs[this.idxs.childCount.input])
            },
            ()=>{
                //手続時存在trueのとき
                if(reqInputs[this.idxs.isLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isJapan.input[yes]], nextBtn, Qs[this.idxs.isAdult.form]);
                }else if(reqInputs[this.idxs.isExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(reqInputs[this.idxs.childCount.input], nextBtn, Qs[this.idxs.isSpouse.form]);
                }
            }            
        )
    }

    //配偶者確認
    static isSpouse(el){
        slideDownElIfHidden(el);
    }

    //子供存在
    static isChild(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isChild.input[yes],
            ()=>{
                //子の人数欄を表示
                reqInputs[this.idxs.childCount.input].value = "1";
            },
            ()=>{
                //子の人数欄を非表示にして初期化する
                reqInputs[this.idxs.childCount.input].value = "0";
                inputsField.errMsgEls[this.idxs.childCount.form].style.display = hidden;
            }
        )
        //子供の人数欄をエラー要素に追加して次へボタンを無効化、子の人数欄を表示
        validateBeforeEnableNextBtn(reqInputs[this.idxs.name.input], nextBtn);
        slideUp(Qs[this.idxs.childCount.form]);
    }

    //成人
    static isAdult(el){
        //日本在住欄を表示する
        slideDownElIfHidden(el);
        //日本在住の初期値があるとき、日本在住trueのイベントを発生させる
        if(reqInputs[this.idxs.isJapan.input[yes]].disabled){
            const event = new Event("change");
            reqInputs[this.idxs.isJapan.input[yes]].dispatchEvent(event);
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
    const idxs = {
        name:{form: 0, input: 0},
        isSameSpouse:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        childCount:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]},
    }

    //同じ配偶者
    if(idxs.isSameSpouse.input.includes(rbIdx)) ChildRbHandler.isSameSpouse(Qs);
    //手続時存在
    else if(idxs.isLive.input.includes(rbIdx)) ChildRbHandler.isLive(rbIdx, Qs, nextBtn);
    //相続時存在
    else if(idxs.isExist.input.includes(rbIdx)) ChildRbHandler.isExist(rbIdx, Qs, nextBtn);
    //相続放棄
    else if(idxs.isRefuse.input.includes(rbIdx)) ChildRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //配偶者確認
    else if(idxs.isSpouse.input.includes(rbIdx)) ChildRbHandler.isSpouse(Qs[idxs.isChild.form]);
    //子の存在欄
    else if(idxs.isChild.input.includes(rbIdx)) ChildRbHandler.isChild(rbIdx, Qs, nextBtn);
    //成人欄
    else if(idxs.isAdult.input.includes(rbIdx)) ChildRbHandler.isAdult(Qs[idxs.isJapan.form]);
    //日本在住欄
    else if(idxs.isJapan.input.includes(rbIdx)) ChildRbHandler.isJapan(idxs.name.input, nextBtn);
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
    const val = el.value;
    //エラー要素から削除
    invalidEls = invalidEls.filter(x => x !== el);
    //入力値のチェック結果を取得して結果に応じた処理をする
    isValid = isOnlyZenkaku(val, el);
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
            const childCountInputIdx = 13;
            if(i === childCountInputIdx){
                
                const childCountFormIdx = 7;
                const countForm = Qs[childCountFormIdx]; 
                setEventToCountInputAndButtons(countForm, i, nextBtn, 1, 15);
            }else{
                //ラジオボタン欄

                //値変更
                reqInputs[i].addEventListener("change",(e)=>{
                    //子のラジオボタンイベントを設定
                    setChildRbsEvent(i, Qs, nextBtn);
                })
            }
        }
    }
}

/**
 * 質問を途中で終了する場合
 * @param {HTMLElement} checkEl エラー要素
 * @param {HTMLElement[]} Qs 全質問要素
 * @param {number} iniStartIdx 初期化を開始する質問のインデックス
 * @param {number} iniEndIdx 初期化を終了する質問のインデックス
 * @param {number[]} iniRbIdxs 初期化するラジオボタンのインデックス
 * @param {HTMLElement} nextBtn 次へボタン
 * @param {HTMLElement} textInput テキスト要素（必要なときだけ）
 */
function breakQ(checkEl, Qs, iniStartIdx, iniEndIdx, iniRbIdxs, nextBtn, textInput = null){
    invalidEls = invalidEls.filter(x => x === checkEl);
    initializeQs(Qs, iniStartIdx, iniEndIdx, iniRbIdxs, textInput);
    if(invalidEls.length === 0) nextBtn.disabled = false;
}

/**
 * 子供欄のラジオボタンのインベントハンドラー
 */
class ChildrenRbHandler extends CommonRbHandler{
    static idxs = {
        isExist:{ form: 0, input: [0, 1] },
        count:{ form: 1, input: 2 },
        isSameParents:{ form: 2, input: [3, 4] },
        isLive:{ form: 3, input: [5, 6] },
        isRefuse:{ form: 4, input: [7, 8] },
        isAdult:{ form: 5, input: [9, 10] },
        isJapan:{ form: 6, input: [11, 12] },
    }

    static handleYesNo(rbIdx, yesIdx, yesAction, noAction){
        if(rbIdx === yesIdx) yesAction();
        else noAction();
    }

    //子供存在
    static isExist(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isExist.input[yes],
            //yesAction
            ()=>{
                //エラー要素を初期化する
                invalidEls = invalidEls.filter(x => x === reqInputs[this.idxs.isJapan.input[yes]])
                pushInvalidEl(reqInputs[this.idxs.isJapan.input[yes]], nextBtn);
                //人数入力欄を表示する
                reqInputs[this.idxs.count.input].value = "1";
                slideDown(Qs[this.idxs.count.form]);
                slideDown(Qs[this.idxs.isSameParents.form]);
                //子供いないフラグをfalseにする
                isNoChild = false;
            },
            //noAction
            ()=>{
                invalidEls.length = 0;
                const rbIdxArr = this.idxs.isSameParents.input.concat(this.idxs.isLive.input).concat(this.idxs.isRefuse.input).concat(this.idxs.isAdult.input).concat(this.idxs.isJapan.input);
                initializeQs(Qs, this.idxs.count.form, this.idxs.isJapan.form, rbIdxArr, reqInputs[rbIdx]);
                //次へボタンを有効化して子供なしフラグをtrueにする
                nextBtn.disabled = false;
                isNoChild = true;
            }
        )
    }

    //同じ両親
    static isSameParents(el){
        slideDownElIfHidden(el);
    }

    //手続時存在
    static isLive(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isLive.input[yes],
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isJapan.input[yes]], nextBtn, Qs[this.idxs.isRefuse.form]);
            },
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxArr = this.idxs.isRefuse.input.concat(this.idxs.isAdult.input).concat(this.idxs.isJapan.input);
                breakQ(reqInputs[this.idxs.count.input], Qs, this.idxs.isRefuse.form, this.idxs.isJapan.form, rbIdxArr, nextBtn);
            }
        )
    }

    //相続放棄
    static isRefuse(rbIdx, Qs, nextBtn){
        this.handleYesNo(rbIdx, this.idxs.isRefuse.input[yes], 
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxArr = this.idxs.isAdult.input.concat(this.idxs.isJapan.input);
                breakQ(reqInputs[this.idxs.count.input], Qs, this.idxs.isAdult.form, this.idxs.isJapan.form, rbIdxArr, nextBtn);
            },
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(reqInputs[this.idxs.isJapan.input[yes]], nextBtn, Qs[this.idxs.isAdult.form]);
            }
        )
    }

    //成人
    static isAdult(el){
        slideDownElIfHidden(el);
    }
}

/**
 * 子供欄のラジオボタンのイベントを設定する
 * @param {number} rbIdx ラジオボタンのインデックス
 * @param {HTMLElement[]} Qs 全質問欄
 * @param {HTMLElement} nextBtn 次へボタン
 */
function setChildrenRbsEvent(rbIdx, Qs, nextBtn){
    const idxs = {
        isExist:{ form: 0, input: [0, 1] },
        count:{ form: 1, input: 2 },
        isSameParents:{ form: 2, input: [3, 4] },
        isLive:{ form: 3, input: [5, 6] },
        isRefuse:{ form: 4, input: [7, 8] },
        isAdult:{ form: 5, input: [9, 10] },
        isJapan:{ form: 6, input: [11, 12] },
    }

    //子供存在
    if(idxs.isExist.input.includes(rbIdx)) ChildrenRbHandler.isExist(rbIdx, Qs, nextBtn);
    //同じ両親
    else if(idxs.isSameParents.input.includes(rbIdx)) ChildrenRbHandler.isSameParents(Qs[idxs.isLive.form]);
    //手続時生存
    else if(idxs.isLive.input.includes(rbIdx)) ChildrenRbHandler.isLive(rbIdx, Qs, nextBtn);
    //相続放棄
    else if(idxs.isRefuse.input.includes(rbIdx)) ChildrenRbHandler.isRefuse(rbIdx, Qs, nextBtn);
    //成人
    else if(idxs.isAdult.input.includes(rbIdx)) ChildrenRbHandler.isAdult(Qs[idxs.isJapan.form]);
    //日本在住
    else ChildrenRbHandler.isJapan(idxs.count.input, nextBtn);
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
 * 各フォームから初期値を入力するinput要素を取得する
 * @param {string} relation 
 * @returns 取得した各フォームのinput要素（true,false両方のラジオボタン）
 */
function getForms(relation){

    const fieldsets = document.getElementsByClassName(`${relation}Fieldset`);
    const forms = [];
    const isSameSpouseIdx = 1;
    const isLiveIdx = 2;
    const isRefuseIdx = 4;
    const isAdultIdx = 8;
    const isJapanIdx = 9;
    const reqiredIdx = [isSameSpouseIdx, isLiveIdx, isRefuseIdx, isAdultIdx, isJapanIdx];
    for(let i = 0; i < fieldsets.length; i++){
        const form = [];
        const Qs = Array.from(fieldsets[i].getElementsByClassName("Q"));
        for(let j = 0; j < Qs.length; j++){
            if(reqiredIdx.includes(j)){

                if(j !== isSameSpouseIdx) Qs[j].style.display = hidden;

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
 * @param {number} idx 押された次へボタンのインデックス
 * @param {string} relation "children"又は"collaterals"
 * @param {HTMLElement[]} forms 反映させるinputがあるQ（child又はcollateralの）
 * @returns 子供欄の入力値
 */
function reflectData(idx, relation, forms){

    const fieldset = inputsField.reqFieldsets[idx];
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

    for(let i = 0; i < forms.length; i++){
        for(let key in fromData){
            if(fromData[key].checked){
                checkAndDisableRbs(forms, i, fromData[key].idx);
            }
        }
    }

    return fromData;
}

/**
 * 尊属のタイトルを更新する
 * @param {HTMLElement} fieldsets 全尊属のフィールドセット
 * @param {HTMLElement} preFieldset 一つ前のフィールドセット
 */
function updateAscendantTitle(fieldsets, preFieldset){
    const ascendants = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"];

    if(isNoChild === false){
        const preFieldsetTitle = preFieldset.getElementsByClassName("fieldsetTitle")[0].textContent;
        const removedSpace = preFieldsetTitle.replace(/\n/g, "").replace(/\s/g, "");
        const preFieldsetNum = parseInt(ZenkakuToHankaku(removedSpace.slice(0, 1)));

        for(let i = 0; i < fieldsets.length; i++){
            //タイトルを変更する
            const newTitleEl =  fieldsets[i].getElementsByClassName("fieldsetTitle")[0];
            const newNum = hankakuToZenkaku(String(preFieldsetNum + 1));
            const newTitle = `${newNum}－${hankakuToZenkaku(String(i + 1))}．${ascendants[i]}について`;
            newTitleEl.textContent = newTitle;
        }
    }
}

/**
 * 引数で渡すフィールドセット内にあるinputとbutton要素にタブインデックスを設定する
 * @param {HTMLElement[]} fieldsets タブインデックスを設定する要素があるフィールドセット
 */
function updateTabindex(fieldsets){
    const lastNextBtn = inputsField.nextBtns[inputsField.nextBtns.length - 1];
    const newTabindex = parseInt(lastNextBtn.getAttribute("tabindex")) + 1;
    //ループ処理をしてタブインデックスを設定する
    for(let i = 0; i < fieldsets.length; i++){
        const inputs = Array.from(fieldsets[i].getElementsByTagName("input"));
        const buttons = Array.from(fieldsets[i].getElementsByTagName("button"));
        const beforeCountInputIdx = 13;
        const afterCountInputIdx = 15;
        
        inputs.splice(beforeCountInputIdx, 0, buttons.shift());
        inputs.splice(afterCountInputIdx, 0, buttons.shift());

        const els = inputs.concat(buttons);
        for(let j = 0; j < els.length; j++){
            els[j].setAttribute("tabindex", (newTabindex + j));
        }
    }
}

/**
 * 必要なフィールドセットを生成などする
 * @param {HTMLElement} fieldset 押された次へボタンがあるフィールドセット
 */
function adjustFieldset(fieldset){
    //子の欄の調整
    if(fieldset.id === "childrenFieldset" && !isNoChild){
        const childCountInputIdx = 2;
        const oldTotalForms = document.getElementById(`id_child-TOTAL_FORMS`);
        const oldFormCount = parseInt(oldTotalForms.value);
        const newFormCount = parseInt(reqInputs[childCountInputIdx].value);
        const fieldsets = Array.from(document.getElementsByClassName("childFieldset"));

        //増えたとき
        if(isNoChild === false && newFormCount > oldFormCount){
            const isChild = true;
            for(let i = oldFormCount; i < newFormCount; i ++){
                createForm(isChild);
            }
        }else if(newFormCount < oldFormCount){
            //減ったとき
            oldTotalForms.value = newFormCount;
            fieldsets.slice(newFormCount).forEach(el => el.parentNode.removeChild(el));
        }

        //子供欄の入力値を全ての子の欄に反映させて初期表示も変更する
        const forms = getForms("child");
        childrenData = reflectData(fromNextBtnIdx, "children", forms);

    }else if(fieldset.id === "childrenFieldset" && isNoChild){
        //父欄のとき
        //尊属欄のタイトルを設定
        const ascendantFieldsets = document.getElementsByClassName("ascendantFieldset");
        updateAscendantTitle(ascendantFieldsets, fieldset)
        //父母欄のタブインデックスを設定
        const parentsFieldsets = [ascendantFieldsets[0], ascendantFieldsets[1]];
        updateTabindex(parentsFieldsets);
    }
}

/**
 * 次の項目とガイドの次の項目を有効化して前の項目を無効化する
 * @param {number} fromNextBtnIdx 押された次へボタンのインデックス
 * @param {boolean} isIndivisual 次の欄が個人用欄か
 */
function oneStepFoward(fromNextBtnIdx, isIndivisual){
    
    //次のフォームを生成、タイトル変更、属性変更など有効化前の処理
    const fromFieldset = inputsField.reqFieldsets[inputsField.reqFieldsets.length - 1];
    if(fromFieldset) adjustFieldset(fromFieldset);

    //次の項目を有効化とガイドを更新
    displayNextFieldset(fromNextBtnIdx);
    enableNextGuide();

    //各入力欄に処理
    const currentIdx = inputsField.reqFieldsets.length - 1;
    const fieldset = inputsField.reqFieldsets[currentIdx];
    const Qs = inputsField.reqFieldsets[currentIdx].getElementsByClassName("Q");
    const nextBtn = inputsField.nextBtns[currentIdx];

    //個人入力欄のとき
    if(isIndivisual){
        
        //イベントを設定
        for(let i = 0; i < reqInputs.length; i++){          
            setEventToIndivisualFieldset(i, fieldset, Qs, nextBtn);
        }
        
        //子の欄のとき
        if(fieldset.classList.contains("childFieldset")){
            //インデックスを子の欄のものに修正する
            childrenData.isSameSpouseTrue.idx = 1;
            childrenData.isLiveTrue.idx = 3;
            childrenData.isRefuseFalse.idx = 8;
            childrenData.isAdultTrue.idx = 14;
            childrenData.isJapanTrue.idx = 16;

            //初期値があるときは、そのイベントを発生させる
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
    }else{
        //子供全員又は兄弟姉妹全員入力欄のとき
        for(let i = 0; i < reqInputs.length; i++){
            setEventToGroupFieldset(i, fieldset, Qs, nextBtn);
        }
    }

    //戻るボタンにイベントを設定
    const oneStepBackHandler = oneStepBack(fromNextBtnIdx);
    inputsField.preBtnsArr[fromNextBtnIdx].addEventListener("click", oneStepBackHandler);

    //次へボタンにイベントを設定
    //配偶者欄又は母方の祖父母欄のとき
    if(["spouseFieldset", "motherGmotherFieldset"].includes(fieldset.id)){
        oneStepFowardHandler = function () {oneStepFoward(fromNextBtnIdx + 1, false)};
    }else{
        oneStepFowardHandler = function () {oneStepFoward(fromNextBtnIdx + 1, true)};
    }
    nextBtn.addEventListener("click", oneStepFowardHandler);

    //配偶者欄の次へボタンが押されたときかつ子供がいないボタンが押されているとき
    if(fieldset.id === "childrenFieldset"){
        if(reqInputs[1].checked){
            nextBtn.disabled = false;
            isNoChild = true;
        }
    }
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
 * @param {string} val 入力値
 * @param {elemet} el 対象の要素
 */
function decedentFormValidationList(val, el){
    //チェック対象をエラー配列から削除
    invalidEls = invalidEls.filter(x => x !== el);
    //氏名のときは全角チェック、その他は空欄チェック
    return el === DecedentInput.name ? isOnlyZenkaku(val, el): isBlank(val,el);
}

/**
 * イベント
 */

//最初の画面表示後の処理
window.addEventListener("load", ()=>{

    //初期処理
    initialize();
    
    //input要素でenterを押したらPOSTが実行されないようにする
    const inputArr = document.getElementsByTagName("input");
    for(let i = 0; i < inputArr.length; i++){
        inputArr[i].addEventListener("keydown",(e)=>{
            if(e.key === "Enter")
                e.preventDefault();
        })
    }

    //被相続人欄をループ
    for(let i = 0; i < reqInputs.length; i++){
        
        //被相続人欄内の入力欄にイベントを設定
        reqInputs[i].addEventListener("change", (e)=>{
            const el = e.target;
            const val = el.value;

            //入力値のチェック結果を取得
            isValid = decedentFormValidationList(val, el);
    
            //結果に応じて分岐
            sort(isValid, inputsField.errMsgEls[i], isValid, reqInputs[i], inputsField.nextBtns[decedentFieldsetIdx]);

            //住所の都道府県
            if(reqInputs[i] === DecedentInput.prefecture || reqInputs[i] === DecedentInput.domicilePrefecture){

                //市区町村データ取得
                getCityData(val, reqInputs[i + 1]);
            }
        })
    }

    reqInputs[DecedentInputIdx.name].focus();
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    setSidebarHeight();
});

//この章の入力状況欄
//１．お亡くなりになった方についてボタン
guideField.btns[0].addEventListener("click", scrollToTargetHandler)

//氏名
DecedentInput.name.addEventListener("keydown",(e)=>{
    if(e.key === "Enter"){
        e.preventDefault();
        DecedentInput.deathYear.focus();
    }
})

//被相続人欄の次へボタン
inputsField.nextBtns[decedentFieldsetIdx].addEventListener("click",(e)=>{

    //被相続人欄の入力値を全てチェックする
    for(let i = 0; i < reqInputs.length; i++){
        isValid = decedentFormValidationList(reqInputs[i].value, reqInputs[i])
        sort(isValid, inputsField.errMsgEls[i], isValid, reqInputs[i], inputsField.nextBtns[decedentFieldsetIdx])
    }

    //エラーがあるときは、処理を中止
    if(invalidEls.length > 0){
        e.preventDefault();
        invalidEls[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    oneStepFoward(decedentFieldsetIdx, true);
})
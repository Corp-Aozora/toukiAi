"use strict";

/**
    変数
*/
//この章の入力状況欄
class GuideField{
    constructor(){
        this.btnsArr = [document.querySelector(".guideBtn")];
        this.progressListArr = [document.querySelector(".progressList")];
        this.caretIconsArr = [document.querySelector(".guideCaret")];
        this.checkIconsArr = [];
        this.inProgressIndex = 0;
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
class DecedentColumnInputIndex{
    static name = 0;
    static deathYear = 1;
    static deathMonth = 2;
    static prefecture = 3;
    static city = 4;
    static domicilePrefecture = 5;
    static domicileCity = 6;
}

//次へボタン又は各欄のインデックス（相続人が確定したときにインデックスを設定する）
class ColumnsIndex{
    constructor(){
        this.decedent = 0;
        this.spouse = 1;
        this.children = 2;
        this.childrenArr = [];
        this.father;
        this.mother;
        this.fatherGfather;
        this.fatherGmother;
        this.motherGfather;
        this.motherGmother;
        this.collateral;
        this.collateralsArr = [];
    }
}
const columnsIndex = new ColumnsIndex();

//戻るボタンのインデックス（相続人が確定したときにインデックスを設定する）
class PreviousBtnsIndex{
    constructor(){
        this.spouse = 0;
        this.children = 1;
        this.childrenArr = [];
        this.father;
        this.mother;
        this.fatherGfather;
        this.fatherGmother;
        this.motherGfather;
        this.motherGmother;
        this.collateral;
        this.collateralsArr = [];
    }
}
const previousBtnsIndex = new PreviousBtnsIndex();

//入力欄のフィールド
class InputsField{
    
    static decedentFieldset = document.querySelector("fieldset");

    constructor(){
        this.requiredFieldsetsArr = [document.querySelector("fieldset")];
        this.nextBtnsArr = Array.from(InputsField.decedentFieldset.getElementsByClassName("nextBtn"));
        this.previousBtnsArr = [];
        this.errorMessagesElArr = Array.from(InputsField.decedentFieldset.getElementsByClassName("errorMessage"));
    }
}
const inputsField = new InputsField();

/**
 * 初期化
 */
function initialize(){
    updateSideBar();
    requiredInputArr = Object.values(DecedentInput);
    invalidElArr = Object.values(DecedentInput);
    invalidElArr.splice(DecedentColumnInputIndex.deathYear, 1);
}

/**
 * 選択された都道府県に存在する市区町村を取得する
 * @param {string} val 都道府県欄の値
 * @param {element} el 市区町村欄
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
    invalidElArr = invalidElArr.filter(x => x !== el);

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
    })
    .then(response => {
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
            inputsField.nextBtnsArr[columnsIndex.decedent].disabled = false;

        }else{

            errorMessageEl.style.display = display;
            invalidElArr.push(el);
        }
    })
    .catch(error => {
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
    });
}

/**
 * 次の項目を有効化して前の項目を無効化する
 * @param {number} i 押された次へボタンのインデックス
 * @param {boolean} isIndivisual 個人入力欄フラグ
 */
function enableNextColumn(i, isIndivisual){

    //次の項目を表示、hrを挿入、次の項目にスクロール
    const targetField = document.getElementsByTagName("fieldset")[i + 1];
    const hr = document.createElement("hr");

    inputsField.requiredFieldsetsArr.push(targetField);
    slideDown(targetField);
    hr.className = "my-5";
    targetField.before(hr);
    scrollToTarget(targetField);
    
    //前の項目を無効化、次の項目のデータ準備
    inputsField.requiredFieldsetsArr[i].disabled = true;
    checkedRequiredInputArr = [requiredInputArr.map(x => x.cloneNode(true))];
    requiredInputArr.length = 0;
    invalidElArr.length = 0;
    inputsField.errorMessagesElArr.length = 0;
    inputsField.errorMessagesElArr = Array.from(targetField.getElementsByClassName("errorMessage"));
    inputsField.nextBtnsArr.push(targetField.getElementsByClassName("nextBtn")[0]);
    inputsField.previousBtnsArr.push(targetField.getElementsByClassName("previousBtn")[0]);
    
    //個人入力欄（子全員、兄弟姉妹全員以外の欄）のとき
    if(isIndivisual){
        //入力必須欄とエラー要素欄を取得する
        requiredInputArr = Array.from(targetField.getElementsByTagName("input"));
        invalidElArr = Array.from(targetField.getElementsByTagName("input"));
    }else{
        //子全員又は兄弟姉妹全員欄のとき

    }

    //次の項目の最初の入力欄にフォーカスする
    requiredInputArr[0].focus();
}

/**
 * 次のガイドボタンにイベントを設定する
 * @param {event} e 
 */
function enableNextGuidBtn(e){
    const index = guideField.btnsArr.indexOf(e.target);
    scrollToTarget(inputsField.requiredFieldsetsArr[index], 0);
}

/**
 * ガイドを更新する
 */
function enableNextGuide(){
    //ガイドの前の項目を通常表示にする
    guideField.checkIconsArr.push(document.getElementsByClassName("guideCheck")[guideField.inProgressIndex]);

    guideField.progressListArr[guideField.inProgressIndex].classList.remove("active");
    guideField.caretIconsArr[guideField.inProgressIndex].style.display = "none";
    guideField.checkIconsArr[guideField.inProgressIndex].style.display = "inline-block";

    //ガイドの次の項目が選択状態にする
    guideField.inProgressIndex += 1;
    guideField.progressListArr.push(document.getElementsByClassName("progressList")[guideField.inProgressIndex]);
    guideField.btnsArr.push(document.getElementsByClassName("guideBtn")[guideField.inProgressIndex]);
    guideField.caretIconsArr.push(document.getElementsByClassName("guideCaret")[guideField.inProgressIndex]);

    guideField.progressListArr[guideField.inProgressIndex].classList.add("active");
    guideField.btnsArr[guideField.inProgressIndex].disabled = false;
    guideField.caretIconsArr[guideField.inProgressIndex].style.display = "inline-block";

    //次の項目のガイドボタンにイベントを追加
    guideField.btnsArr[guideField.inProgressIndex].addEventListener("click", enableNextGuidBtn);
}

/**
 * 前の項目を有効化する
 * @param {number} i 押された戻るボタンのインデックス
 */
function enablePreviouseColumn(i){
    
    const disableField = inputsField.requiredFieldsetsArr[i + 1]; //無効化対象のフィールドセット
    const enableField = inputsField.requiredFieldsetsArr[i]; //有効化対象のフィールドセット
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ

    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    slideUp(removeHr);
    inputsField.requiredFieldsetsArr.pop();
    // disableField.remove();
    removeHr.remove();
    
    //直前の項目を有効化してスクロール
    enableField.disabled = false;
    scrollToTarget(enableField);

    //データの準備
    checkedRequiredInputArr.pop();
    requiredInputArr.length = 0;
    invalidElArr.length = 0;
    inputsField.errorMessagesElArr.length = 0
    inputsField.errorMessagesElArr = Array.from(enableField.getElementsByClassName("errorMessage"));
    inputsField.nextBtnsArr.pop();
    inputsField.previousBtnsArr.pop();

    //被相続人欄を有効化するとき
    if(i === 0){
        //全て入力済みのためエラー要素配列は設定不要
        requiredInputArr = Object.values(DecedentInput);
    }
}

/**
 * ガイドを一つ戻す
 */
function putBackGuide(){
    //無効化された項目のガイドを無効化する
    guideField.progressListArr[guideField.inProgressIndex].classList.remove("active");
    guideField.progressListArr.pop();

    guideField.btnsArr[guideField.inProgressIndex].removeEventListener("click", enableNextGuidBtn);
    guideField.btnsArr[guideField.inProgressIndex].disabled = true;
    guideField.btnsArr.pop();

    guideField.caretIconsArr[guideField.inProgressIndex].style.display = "none";
    guideField.caretIconsArr.pop();


    //このボタンが選択されている状態にする
    guideField.inProgressIndex -= 1;
    guideField.checkIconsArr[guideField.inProgressIndex].style.display = "none";
    guideField.checkIconsArr.pop();

    guideField.progressListArr[guideField.inProgressIndex].classList.add("active");

    guideField.caretIconsArr[guideField.inProgressIndex].style.display = "inline-block";
}

/**
 * 前の項目を有効化にする
 * @param {num} i 押された戻るボタンのインデックス
 */
function oneStepBack(i){
    return function(e){
        //前の項目を有効化とガイドの巻き戻し
        enablePreviouseColumn(i);
        putBackGuide();
    }
}

/**
 * 次の入力欄を表示する
 * @param {number} btnIdx 押されたボタンのインデックス
 * @param {boolean} isIndivisual 個人入力欄フラグ
 * @returns 
 */
function displayNextInput(btnIdx, isIndivisual){
    const fieldset = inputsField.requiredFieldsetsArr[guideField.inProgressIndex];

    //配偶者項目のとき
    if(fieldset.classList.contains("spouseFieldset")){
        const spouseQsArr = Array.from(fieldset.getElementsByClassName("spouseQ"));
        const yes = 0;
        const no = 1;
        const nameInputIdx = 0;
        const isExistBtnIdx = [1, 2];
        const isLiveBtnIdx = [3, 4];
        const isStepChildBtnIdx = [5, 6];
        const isRefuseBtnIdx = [7, 8];
        const isJapanBtnIdx = [9, 10];

        const isExistInputIdx = 1;
        const isLiveInputIdx = 2;
        const isStepChildInputIdx = 3;
        const isRefuseInputIdx = 4;
        const isJapanInputIdx = 5;
        inputsField.errorMessagesElArr[isStepChildInputIdx].style.display = hidden;
        inputsField.errorMessagesElArr[isStepChildInputIdx].innerHTML = "";
        inputsField.nextBtnsArr[guideField.inProgressIndex].disabled = true;

        //死亡時存在
        if(isExistBtnIdx.includes(btnIdx)){
            
            //true
            if(btnIdx === isExistBtnIdx[yes]){
                
                //ラジオボタンの入力が未了であることを維持するために適当なラジオボタンの要素を追加しておく
                if(invalidElArr.indexOf(requiredInputArr[isExistBtnIdx[yes]]) === -1) 
                    invalidElArr.push(requiredInputArr[isExistBtnIdx[yes]]);

                //次の入力欄を表示する
                slideDown(spouseQsArr[isLiveInputIdx]);

            }else{
                //false

                //氏名欄以外を削除する
                invalidElArr = invalidElArr.filter(x => x === requiredInputArr.indexOf(nameInputIdx));
                //氏名欄が入力されているとき、次へボタンを有効化
                if(invalidElArr.length === 0) inputsField.nextBtnsArr[guideField.inProgressIndex].disabled = false;
    
                //3問目以降のボタンを全て初期化
                for(let i = isLiveBtnIdx[yes]; i < requiredInputArr.length; i++){
                    requiredInputArr[i].checked = false;
                }
                //3問目以降を全て非表示にする
                for(let i = isLiveInputIdx; i < spouseQsArr.length; i++){
                    slideUp(spouseQsArr[i]);
                }
            }
        }else if(isLiveBtnIdx.includes(btnIdx)){
            //手続時存在

            //true
            if(btnIdx === isLiveBtnIdx[yes]){

                if(invalidElArr.indexOf(requiredInputArr[isExistBtnIdx[yes]]) === -1) 
                    invalidElArr.push(requiredInputArr[isExistBtnIdx[yes]]);

                //相続放棄欄を表示する
                slideDown(spouseQsArr[isRefuseInputIdx]);

                //連れ子欄を非表示かつボタンを初期化
                requiredInputArr[isStepChildBtnIdx[yes]].checked = false;
                requiredInputArr[isStepChildBtnIdx[no]].checked = false;
                slideUp(spouseQsArr[isStepChildInputIdx])

            }else{
                //false

                if(invalidElArr.indexOf(requiredInputArr[isExistBtnIdx[yes]]) === -1) 
                    invalidElArr.push(requiredInputArr[isExistBtnIdx[yes]]);

                //連れ子欄を表示
                slideDown(spouseQsArr[isStepChildInputIdx]);

                //相続放棄欄以降を非表示にしてボタンを初期化
                for(let i = isRefuseInputIdx; i < spouseQsArr.length; i++){
                    slideUp(spouseQsArr[i]);
                }
                requiredInputArr[isRefuseBtnIdx[yes]].checked = false;
                requiredInputArr[isRefuseBtnIdx[no]].checked = false;
                requiredInputArr[isJapanBtnIdx[yes]].checked = false;
                requiredInputArr[isJapanBtnIdx[yes]].checked = false;
            }    

        }else if(isStepChildBtnIdx.includes(btnIdx)){
            //連れ子

            //true
            if(btnIdx === isStepChildBtnIdx[yes]){
   
               //システム対応外であることを表示する
               if(invalidElArr.indexOf(requiredInputArr[isExistBtnIdx[yes]]) === -1) 
                    invalidElArr.push(requiredInputArr[isExistBtnIdx[yes]]);

               inputsField.errorMessagesElArr[isStepChildInputIdx].style.display = display;
               inputsField.errorMessagesElArr[isStepChildInputIdx].innerHTML = "本システムでは対応できません";
               inputsField.nextBtnsArr[guideField.inProgressIndex].disabled = false;

            }else{
                //false
        
                //名前が入力されているときは次へボタンを有効化する
                invalidElArr = invalidElArr.filter(x => x === requiredInputArr[nameInputIdx]);
                if(invalidElArr.length === 0) inputsField.nextBtnsArr[guideField.inProgressIndex].disabled = false;
            }
        }else if(isRefuseBtnIdx.includes(btnIdx)){
            //相続放棄

            //true
            if(btnIdx === isRefuseBtnIdx[yes]){
                
                //名前が入力されているときは次へボタンを有効化する
                invalidElArr = invalidElArr.filter(x => x === requiredInputArr[nameInputIdx]);
                if(invalidElArr.length === 0) inputsField.nextBtnsArr[guideField.inProgressIndex].disabled = false;

                slideUp(spouseQsArr[isJapanInputIdx]);
                requiredInputArr[isJapanBtnIdx[yes]].checked = false;
                requiredInputArr[isJapanBtnIdx[no]].checked = false;

            }else{
                //false

                if(invalidElArr.indexOf(requiredInputArr[isExistBtnIdx[yes]]) === -1) 
                    invalidElArr.push(requiredInputArr[isExistBtnIdx[yes]]);

                //次の入力欄を表示する
                slideDown(spouseQsArr[isJapanInputIdx]);
            }
        }else{
            //日本在住(true、false同じ処理)

            //名前が入力されているときは次へボタンを有効化する
            invalidElArr = invalidElArr.filter(x => x === requiredInputArr[nameInputIdx]);
            if(invalidElArr.length === 0) inputsField.nextBtnsArr[guideField.inProgressIndex].disabled = false;
        }

        return;
    }

    //個人入力項目のとき
    if(isIndivisual){

    }else{
        //子全員又は兄弟姉妹全員項目のとき
    }
}

/**
 * 次の項目とガイドの次の項目を有効化して前の項目を無効化する
 * @param {number} idx 押された次へボタンのインデックス
 */
function oneStepFoward(idx, isIndivisual){
    
    //次の項目を有効化とガイドを更新
    enableNextColumn(idx, isIndivisual);
    enableNextGuide();

    //各入力欄にイベントを設定
    for(let i = 0; i < requiredInputArr.length; i++){

        if(isIndivisual){
            //氏名
            if(i === 0){

                requiredInputArr[i].addEventListener("change",(e)=>{
                    //エラー要素から削除
                    invalidElArr = invalidElArr.filter(x => x !== e.target);

                    //入力値チェック
                    const val = e.target.value;
                    const el = e.target;
        
                    //入力値のチェック結果を取得して結果に応じた処理をする
                    isValid = isOnlyZenkaku(val, el);
                    sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[columnsIndex.spouse]);
        
                })

                requiredInputArr[i].addEventListener("keypress",(e)=>{
                    //キーで次にフォーカス
                    if(e.code === "Enter" || e.code === "NumpadEnter"){
                        e.preventDefault();
                        requiredInputArr[i + 1].focus();
                    }
                })

            }else{
                requiredInputArr[i].addEventListener("change",(e)=>{
                    displayNextInput(i, isIndivisual);
                })
            }
        }

    }

    //戻るボタンにイベントを設定
    const handler = oneStepBack(idx);
    inputsField.previousBtnsArr[idx].addEventListener("click", handler);

    //次へボタンにイベントを設定
    let handler2;

    //個人入力欄のとき
    if(!inputsField.requiredFieldsetsArr[guideField.inProgressIndex].classList.contains("childrenFieldset") || !inputsField.requiredFieldsetsArr[guideField.inProgressIndex].classList.contains("collateralsFieldset")){
        handler2 = function () {oneStepFoward(idx + 1, true)};
    }else{
        //子全員又は兄弟姉妹全員入力欄のとき
        handler2 = function () {oneStepFoward(idx + 1, false)};
    }
    inputsField.nextBtnsArr[idx + 1].addEventListener("click", handler2);
}


/**
 * チェック結果に応じて処理を分岐する
 * @param {boolean or string} isValid チェック結果
 * @param {element} errorMessagesEl エラーメッセージを表示する要素
 * @param {boolean or string} message エラーメッセージ
 * @param {element} el チェック対象の要素
 * @param {element} nextBtn 次へボタン
 */
function sort(isValid, errorMessagesEl, message, el, nextBtn){
    if(typeof isValid === "boolean"){
        afterValidation(true, errorMessagesEl, "", el, nextBtn);
    }else{
        afterValidation(false, errorMessagesEl, message, el, nextBtn);
    }
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {string} val 入力値
 * @param {elemet} el 対象の要素
 */
function decedentFormValidationList(val, el){

    invalidElArr = invalidElArr.filter(x => x !== el);

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
        inputArr[i].addEventListener("keypress",(e)=>{
            if(e.code === "Enter" || e.code === "NumpadEnter")
                e.preventDefault();
        })
    }

    //被相続人欄をループ
    for(let i = 0; i < requiredInputArr.length; i++){
        
        //被相続人欄内の入力欄にイベントを設定
        requiredInputArr[i].addEventListener("change", (e)=>{
            const val = e.target.value;
            const el = e.target;

            //入力値のチェック結果を取得
            isValid = decedentFormValidationList(val, el);
    
            //結果に応じて分岐
            sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[columnsIndex.decedent]);

            //住所の都道府県
            if(requiredInputArr[i] === DecedentInput.prefecture || requiredInputArr[i] === DecedentInput.domicilePrefecture){

                //市区町村データ取得
                getCityData(val, requiredInputArr[i + 1]);
            }
        })
    }

    requiredInputArr[DecedentColumnInputIndex.name].focus();
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    setSidebarHeight();
});

//この章の入力状況欄
//１．お亡くなりになった方についてボタン
guideField.btnsArr[0].addEventListener("click", enableNextGuidBtn)

//氏名
DecedentInput.name.addEventListener("keypress",(e)=>{
    if(e.code === "Enter" || e.code === "NumpadEnter"){
        e.preventDefault();
        DecedentInput.deathYear.focus();
    }
})

//被相続人欄の次へボタン
inputsField.nextBtnsArr[columnsIndex.decedent].addEventListener("click",(e)=>{

    //被相続人欄の入力値を全てチェックする
    for(let i = 0; i < requiredInputArr.length; i++){
        isValid = decedentFormValidationList(requiredInputArr[i].value, requiredInputArr[i])
        sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[columnsIndex.decedent])
    }

    //エラーがあるときは、処理を中止
    if(invalidElArr.length > 0){
        e.preventDefault();
        invalidElArr[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    oneStepFoward(columnsIndex.decedent, true);
})


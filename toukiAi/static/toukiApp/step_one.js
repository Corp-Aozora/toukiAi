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
class DecendantInput{
    static name = document.getElementById("id_name");
    static deathYear = document.getElementById("id_death_year");
    static deathMonth = document.getElementById("id_death_month");
    static prefecture = document.getElementById("id_prefecture");
    static city = document.getElementById("id_city");
    static domicilePrefecture = document.getElementById("id_domicile_prefecture");
    static domicileCity = document.getElementById("id_domicile_city");
}

//配偶者欄
class SpouseInput{
    static name = document.getElementById("id_spouse_name");
    static exist = document.getElementsByName("spouse_exist");
    static isLive = document.getElementsByName("spouse_is_live");
    static isStepChild = document.getElementsByName("spouse_is_step_child");
    static isJapan = document.getElementsByName("spouse_is_japan");
}

//各入力欄のインデックス
class DecendantColumnInputIndex{
    static name = 0;
    static deathYear = 1;
    static deathMonth = 2;
    static prefecture = 3;
    static city = 4;
    static domicilePrefecture = 5;
    static domicileCity = 6;
}

//次へボタン又は各欄のインデックス（相続人が確定したときにインデックスを設定する）
class NextBtnsIndex{
    constructor(){
        this.decendant = 0;
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
const columnsIndex = new NextBtnsIndex();

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
    
    static decendantFieldset = document.querySelector("fieldset");
    static spouseFieldset = document.getElementsByTagName("fieldset")[columnsIndex.spouse];
    static childrenFieldset = document.getElementsByTagName("fieldset")[columnsIndex.children];

    constructor(){
        this.requiredFieldsetsArr = [document.querySelector("fieldset")];
        this.nextBtnsArr = InputsField.decendantFieldset.getElementsByClassName("nextBtn");
        this.previousBtnsArr = [];
        this.errorMessagesElArr = InputsField.decendantFieldset.getElementsByClassName("errorMessage");
    }
}
const inputsField = new InputsField();

/**
 * 初期化
 */
function initialize(){
    updateSideBar();
    requiredInputArr = Object.values(DecendantInput);
    invalidElArr = Object.values(DecendantInput);
    invalidElArr.splice(DecendantColumnInputIndex.deathYear, 1);
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
 */
function enableNextColumn(i){

    //次の項目のフィールドセットを取得
    const targetField = document.getElementsByTagName("fieldset")[i + 1];
    inputsField.requiredFieldsetsArr.push(targetField);

    //hrタグを生成
    const hr = document.createElement("hr");
    hr.className = "my-5";

    //次の項目を表示、区切り線を挿入、次の項目にスクロール
    slideDown(targetField);
    targetField.before(hr);
    scrollToTarget(targetField);
    
    //前の項目を無効化する
    inputsField.requiredFieldsetsArr[i].disabled = true;

    //入力必須欄を変更する
    checkedRequiredInputArr = requiredInputArr.map(x => x.cloneNode(true));
    requiredInputArr.length = 0;
    requiredInputArr = []
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
function updateGuideField(){
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
 * 前の項目を有効化にする
 * @param {num} i 押された戻るボタンのインデックス
 */
function enablePreviousColumn(i){
    return function(e){
        //削除対象のフィールドセット
        const removeField = inputsField.requiredFieldsetsArr[i + 1];
        //有効化対象のフィールドセット
        const enableField = inputsField.requiredFieldsetsArr[i];
        //削除対象のhrタグ
        const removeHr = removeField.previousElementSibling;
    
        //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
        slideUp(removeField);
        slideUp(removeHr);
        inputsField.requiredFieldsetsArr = inputsField.requiredFieldsetsArr.filter(x => x !== removeField);
        // removeField.remove();
        removeHr.remove();
        
        //直前の項目を有効化してスクロール
        enableField.disabled = false;
        scrollToTarget(enableField);
    
    
            // 一つ先の項目を無効化する
            // guideField.progressListArr[guideField.inProgressIndex].classList.remove("active");
            // guideField.progressListArr = guideField.progressListArr.pop();
        
            // guideField.btnsArr[guideField.inProgressIndex].removeEventListener("click", enableNextGuidBtn);
            // guideField.btnsArr[guideField.inProgressIndex].disabled = true;
            // guideField.btnsArr = guideField.btnsArr.pop();
        
            // guideField.caretIconsArr[guideField.inProgressIndex].style.display = "none";
            // guideField.caretIconsArr = guideField.caretIconsArr.pop();
        
        
            // //このボタンが選択されている状態にする
            // guideField.inProgressIndex -= 1;
            // guideField.checkIconsArr[guideField.inProgressIndex].style.display = "none";
            // guideField.checkIconsArr = guideField.checkIconsArr.pop();
        
            // guideField.progressListArr[guideField.inProgressIndex].classList.add("active");
        
            // guideField.caretIconsArr[guideField.inProgressIndex].style.display = "inline-block";
    }
}

/**
 * 次の項目とガイドの次の項目を有効化して前の項目を無効化する
 * @param {number} i 押された次へボタンのインデックス
 */
function enableNextColumnAndGuide(i){
    
    //次の項目を有効化
    enableNextColumn(i);

    //ガイドを更新する
    updateGuideField();
    
    //戻るボタンを設定
    inputsField.previousBtnsArr.push(document.getElementsByClassName("previousBtn")[i]);
    const handler = enablePreviousColumn(i);
    inputsField.previousBtnsArr[i].addEventListener("click", handler);
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
function decendantFormValidationList(val, el){

    invalidElArr = invalidElArr.filter(x => x !== el);

    return el === DecendantInput.name ? isOnlyZenkaku(val, el): isBlank(val,el);
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
            isValid = decendantFormValidationList(val, el);
    
            //結果に応じて分岐
            sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[columnsIndex.decendant]);

            //住所の都道府県
            if(requiredInputArr[i] === DecendantInput.prefecture || requiredInputArr[i] === DecendantInput.domicilePrefecture){

                //市区町村データ取得
                getCityData(val, requiredInputArr[i + 1]);
            }
        })
    }

    requiredInputArr[DecendantColumnInputIndex.name].focus();
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    setSidebarHeight();
});

//この章の入力状況欄
//１．お亡くなりになった方についてボタン
guideField.btnsArr[0].addEventListener("click", enableNextGuidBtn)

//氏名
DecendantInput.name.addEventListener("keypress",(e)=>{
    if(e.code === "Enter" || e.code === "NumpadEnter"){
        e.preventDefault();
        DecendantInput.deathYear.focus();
    }
})

//被相続人欄の次へボタン
inputsField.nextBtnsArr[columnsIndex.decendant].addEventListener("click",(e)=>{

    //被相続人欄の入力値を全てチェックする
    for(let i = 0; i < requiredInputArr.length; i++){
        isValid = decendantFormValidationList(requiredInputArr[i].value, requiredInputArr[i])
        sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[columnsIndex.decendant])
    }

    //エラーがあるときは、処理を中止
    if(invalidElArr.length > 0){
        e.preventDefault();
        invalidElArr[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    enableNextColumnAndGuide(columnsIndex.decendant);
})


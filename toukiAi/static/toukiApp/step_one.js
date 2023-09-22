"use strict";

/**
    変数
*/
//この章の入力状況欄
const guideBtns = [document.getElementsByClassName("guideBtn")[0]];

//被相続人欄
const decendantName = document.getElementById("id_name");
const deathYear = document.getElementById("id_death_year");
const deathMonth = document.getElementById("id_death_month");
const prefecture = document.getElementById("id_prefecture");
const city = document.getElementById("id_city");
const domicilePrefecture = document.getElementById("id_domicile_prefecture");
const domicileCity = document.getElementById("id_domicile_city");

//必須項目とエラー項目（各欄に移動したときにセットし直す）
requiredInputArr = [decendantName, deathYear, deathMonth, prefecture, city, domicilePrefecture, domicileCity];
invalidElArr = [decendantName, deathMonth, prefecture, city, domicilePrefecture, domicileCity];

//次へボタン又は各欄のインデックス（相続人が確定したときにインデックスを設定する）
const decendantColumnNBIdx = 0;
const spouseColumnNBIdx = 1;
const childColumnNBIdx = 2;
let childColumnsNBIdxArr = [];
let fatherColumnNBIdx;
let motherColumnNBIdx;
let fatherGfatherColumnNBIdx;
let fatherGmotherColumnNBIdx;
let motherGfatherColumnNBIdx;
let motherGmotherColumnNBIdx;
let collateralColumnNBIdx;
let collateralColumnsNBIdxArr = [];

//戻るボタンのインデックス（相続人が確定したときにインデックスを設定する）
const spouseColumnPBIdx = 0;
const childColumnPBIdx = 1;
let childColumnsPBIdxArr = [];
let fatherColumnPBIdx;
let motherColumnPBIdx;
let fatherGfatherColumnPBIdx;
let fatherGmotherColumnPBIdx;
let motherGfatherColumnPBIdx;
let motherGmotherColumnPBIdx;
let collateralColumnPBIdx;
let collateralColumnsPBIdxArr = [];

//各入力欄のインデックス
const decendantNameIdx = 0;
const deathYearIdx = 1;
const deathMonthIdx = 2;
const prefectureIdx = 3;
const cityIdx = 4;
const domicilePrefectureIdx = 5;
const domicileCityIdx = 6;

//input以外の要素を取得する（各欄でセットし直す）
const decendantFieldset = document.querySelector("fieldset");
const spouseFieldset = document.getElementsByTagName("fieldset")[1];
let requiredFieldsetsArr = [decendantFieldset];
let nextBtnsArr = decendantFieldset.getElementsByClassName("nextBtn");
let previousBtnsArr = spouseFieldset.getElementsByClassName("previousBtn");
let errorMessagesElArr = decendantFieldset.getElementsByClassName("errorMessage");

/**
 * 初期化
 */
function initialize(){
    updateSideBar();
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

    invalidElArr = invalidElArr.filter(x => x !== el);

    el.disabled = false;
    el.focus();

    const verifyingEl = `<span id="${el.id}_verifyingEl" class="verifying emPosition">
                        市区町村データ取得中
                        <div class="spinner-border text-white spinner-border-sm" role="status">
                        </div>
                        </span>`;
    el.insertAdjacentHTML('afterend', verifyingEl);
  
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
        document.getElementById(`${el.id}_verifyingEl`).remove();
    });
}

/**
 * 次の項目を表示又は非表示にする
 * @param {num} i 押されたボタンのインデックス
 */
function enableNextColumn(i){
    //表示対象のフィールドセット
    const targetField = document.getElementsByTagName("fieldset")[i + 1];
    //必須欄に追加する
    requiredFieldsetsArr.push(targetField);
    //hrタグを生成
    const hr = document.createElement("hr");
    hr.className = "my-5";

    //次の項目を表示、区切り線を挿入、次の項目にスクロール
    slideDown(targetField);
    targetField.before(hr);
    scrollToTarget(targetField);
    
    
    // //前の項目を無効化する
    requiredFieldsetsArr[i].disabled = true;
}

/**
 * 前の項目を有効化にする
 * @param {num} i 押されたボタンのインデックス
 */
function enablePreviousColumn(i){
    //削除対象のフィールドセット
    const removeField = requiredFieldsetsArr[i + 1];
    //有効化対象のフィールドセット
    const enableField = requiredFieldsetsArr[i];
    //削除対象のhrタグ
    const removeHr = removeField.previousElementSibling;

    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(removeField);
    slideUp(removeHr);
    requiredFieldsetsArr = requiredFieldsetsArr.filter(x => x !== removeField);
    // removeField.remove();
    removeHr.remove();
    
    //直前の項目を有効化してスクロール
    enableField.disabled = false;
    scrollToTarget(enableField);
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

    return el === decendantName ? isOnlyZenkaku(val, el): isBlank(val,el);
}

/**
 * 被相続人欄の一括チェック
 */
function validateDecendantForm(){

    //各入力欄をチェック
    for(let i = 0; i < requiredInputArr.length; i++){

        //氏名は全角入力チェック
        if(requiredInputArr[i] === decendantName){
            isValid = isOnlyZenkaku(decendantName.value, decendantName);
        }else{
            //氏名以外は空欄チェック
            isValid = isBlank(requiredInputArr[i].value, requiredInputArr[i]);
        }

        //結果に応じた分岐
        sort(isValid, errorMessagesElArr[i], isValid, requiredInputArr[i], nextBtnsArr[decendantColumnNBIdx])
    }
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
            sort(isValid, errorMessagesElArr[i], isValid, requiredInputArr[i], nextBtnsArr[decendantColumnNBIdx]);

            //住所の都道府県
            if(requiredInputArr[i] === prefecture || requiredInputArr[i] === domicilePrefecture){

                //市区町村データ取得
                getCityData(val, requiredInputArr[i + 1]);
            }
        })
    }

    requiredInputArr[0].focus();
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    setSidebarHeight();
});

//この章の入力状況欄
guideBtns[0].addEventListener("click",(e)=>{
    scrollToTarget(decendantFieldset, 0);
})

//氏名
decendantName.addEventListener("keypress",(e)=>{
    if(e.code === "Enter" || e.code === "NumpadEnter"){
        e.preventDefault();
        deathYear.focus();
    }
})

//被相続人欄の次へボタン
nextBtnsArr[decendantColumnNBIdx].addEventListener("click",(e)=>{

    //エラーがあるときは、処理を中止
    if(invalidElArr.length > 0){
        e.preventDefault();
        invalidElArr[0].focus();
    }

    //被相続人欄の入力値を全てチェックする
    validateDecendantForm();

    //エラーがあるときは、処理を中止
    if(invalidElArr.length > 0){
        e.preventDefault();
        invalidElArr[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    enableNextColumn(decendantColumnNBIdx);
})

//配偶者欄の戻るボタン
previousBtnsArr[spouseColumnPBIdx].addEventListener("click",(e)=>{
    enablePreviousColumn(spouseColumnPBIdx);
})
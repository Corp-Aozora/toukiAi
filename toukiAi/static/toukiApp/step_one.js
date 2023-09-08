"use strict";

/**
    変数
*/
const decendantName = document.getElementById("id_name");
const prefecture = document.getElementById("id_prefecture");
const domicilePrefecture = document.getElementById("id_domicile_prefecture");
const nextBtns = document.getElementsByClassName("nextBtn");
const decendantColumnNBIdx = 0;
const spouseColumnNBIdx = 1;
const childColumnNBIdx = 2;
const child1ColumnNBIdx = 3;
let fatherColumnNBIdx = 4;
let motherColumnNBIdx = 5;
let fatherGfatherColumnNBIdx = 6;
let fatherGmotherColumnNBIdx = 7;
let motherGfatherColumnNBIdx = 8;
let motherGmotherColumnNBIdx = 9;
let collateralColumnNBIdx = 10;
let collateral1ColumnNBIdx = 11;

const previousBtns = document.getElementsByClassName("previousBtn");
const spouseColumnPBIdx = 0;
const childColumnPBIdx = 1;
const child1ColumnPBIdx = 2;
let fatherColumnPBIdx = 3;
let motherColumnPBIdx = 4;
let fatherGfatherColumnPBIdx = 5;
let fatherGmotherColumnPBIdx = 6;
let motherGfatherColumnPBIdx = 7;
let motherGmotherColumnPBIdx = 8;
let collateralColumnPBIdx = 9;
let collateral1ColumnPBIdx = 10;

const partitions = document.getElementsByClassName("partition");
const columns = document.getElementsByClassName("column")
const errorMessages = document.getElementsByClassName("errorMessage");
const nameIdx = 0;
const deathYearIdx = 1;
const deathMonthIdx = 2;
const prefectureIdx = 3;
const cityIdx = 4;
const domicilePrefectureIdx = 5;
const domicileCityIdx = 6;

//入力必須要素のid
const required1 = "id_name";
const required2 = "id_death_year";
const required3 = "id_death_month";
const required4 = "id_prefecture";
const required5 = "id_city";
const required6 = "id_domicile_prefecture";
const required7 = "id_domicile_city";
requiredInputArr = [required1, required2, required3, required4, required5, required6, required7];
/**
 * 初期化
 */
function initialize(){
    updateSideBar();
}

function getCityData(e, el){
    //未選択のとき、市町村データを全て削除して無効化する
    if(e.target.value === ""){
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        el.disabled = true;
        return;
    }

    el.disabled = false;
    const url = 'get_city';
  
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({"prefecture" : e.target.value}),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    })
    .then(response => {
        const error_message = document.getElementById(`${el.id}_message`);

        if(response.city !== ""){
            let option = "";
            for(let i = 0; i < response.city.length; i++){
                if(response.city[i]["id"].slice(0, 2) !== "13" && response.city[i]["name"].slice(-1) === "区") continue;
                option += `<option value="${response.city[i]["name"]}">${response.city[i]["name"]}</option>`;
            }
            el.innerHTML = option;
            
            error_message.style.display = hidden;
        }else{
            error_message.style.display = display;
        }
    })
    .catch(error => {
        console.log(error);
    });
}

/**
 * 次の項目を表示又は非表示にする
 * @param {num} i 押されたボタンのインデックス
 */
function displayNextInputs(i){
    //次の項目と区切り線を表示する
    slideDown(partitions[i]);
    slideDown(columns[i + 1]);
    scrollToTarget(columns[i + 1]);
    
    //前の項目を無効化する
    columns[i].disabled = true;
}

/**
 * 前の項目を有効化にする
 * @param {num} i 押されたボタンのインデックス
 */
function enablePreviousColumn(i){
    //今の項目と区切り線を非表示にする
    slideUp(columns[i + 1]);
    slideUp(partitions[i]);
    
    //前の項目を無効化する
    columns[i].disabled = false;
    scrollToTarget(columns[i]);
}

/**
 * イベント
 */
//画面を最初に表示したとき
window.addEventListener("load", ()=>{
    initialize();
    
    //次へボタン
    for(let i = 0; i < nextBtns.length; i++){
        nextBtns[i].addEventListener("click", (e)=>{
            displayNextInputs(i);
        })
    }
    //戻るボタン
    for(let i = 0; i < previousBtns.length; i++){
        previousBtns[i].addEventListener("click", (e)=>{
            enablePreviousColumn(i);
        })
    }
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    setSidebarHeight();
});

//氏名
decendantName.addEventListener("change", (e)=>{
    //空白削除
    const val = trimSpace(e.target.value, decendantName);
    //アルファベット、数字、記号が含まれてないかチェック
    const r1 = isAlphaNumSymbolIncluded(val, el);
    if (r1 === false) isValidRequiredInput(r1, errorMessages[nameIdx], "アルファペット、数字又は記号が含まれています", decendantName, nextBtns[decendantColumnNBIdx]);
    //入力値チェック
    const r2 = checkTextInput(val, decendantName);
    isValidRequiredInput(r2, errorMessages[nameIdx], "30字以内の日本語で入力してください", decendantName, nextBtns[0]);
})

//住所の都道府県
prefecture.addEventListener("change", (e)=>{
    getCityData(e, document.getElementById("id_city"));
})

//住所の都道府県
domicilePrefecture.addEventListener("change", (e)=>{
    getCityData(e, document.getElementById("id_domicile_city"));
})
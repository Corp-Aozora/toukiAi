"use strict";

//サイドバー
let stepTwoArrow = document.getElementById("stepTwoArrow");
let btnStepTwo = document.getElementById("btnStepTwo");
let stepThreeArrow = document.getElementById("stepThreeArrow");
let btnStepThree = document.getElementById("btnStepThree");

//被相続人欄
const decendantColumn = document.getElementById("decendantColumn");
const decendantField = document.getElementById("decendantField");
const decendantResistry1AddressArea = document.getElementById("decendantResistry1AddressArea");
const addResistryAddressButton = document.getElementById("addResistryAddressButton");
const removeResistryAddressButton = document.getElementById("removeResistryAddressButton");
const addResistryAddressButtonNote = document.getElementById("addResistryAddressButtonNote");
const decendantOkBtn = document.getElementById("decendantOkBtn");
const decendantCorrectBtn = document.getElementById("decendantCorrectBtn");

//相続人欄
const heirsColumn = document.getElementById("heirsColumn");
const heirsField = document.getElementById("heirsField");
const heirsColumnTitle = document.getElementById("heirsColumnTitle");
const heirsOkBtn = document.getElementById("heirsOkBtn");
const heirsCorrectBtn = document.getElementById("heirsCorrectBtn");
const heir1InheritRbsZero = document.getElementById("heir1InheritRbsZero");
const heir1InheritRbsOne = document.getElementById("heir1InheritRbsOne");

//分割欄
const divisionColumn = document.getElementById("divisionColumn");
const divisionField = document.getElementById("divisionField");
const divisionAquirerArea = document.getElementById("divisionAquirerArea");
const divisionAllAquirerSelect = document.getElementById("divisionAllAquirerSelect");
const divisionOkBtn = document.getElementById("divisionOkBtn");
const divisionCorrectBtn = document.getElementById("divisionCorrectBtn");

//不動産の数欄
const numberOfRealEstateColumn = document.getElementById("numberOfRealEstateColumn");
const numberOfRealEstateField = document.getElementById("numberOfRealEstateField");
const numberOfRealEstateOkBtn = document.getElementById("numberOfRealEstateOkBtn");
const numberOfRealEstateCorrectBtn = document.getElementById("numberOfRealEstateCorrectBtn");

//土地欄
const landColumn = document.getElementById("landColumn");
const landField = document.getElementById("landField");
const landOkBtn = document.getElementById("landOkBtn");
const landCorrectBtn = document.getElementById("landCorrectBtn");
const addLandBtn = document.getElementById("addLandBtn");
const removeLandBtn = document.getElementById("removeLandBtn");

//建物欄
const bldgColumn = document.getElementById("bldgColumn");
const bldgField = document.getElementById("bldgField");
const bldgOkBtn = document.getElementById("bldgOkBtn");
const bldgCorrectBtn = document.getElementById("bldgCorrectBtn");
const addBldgBtn = document.getElementById("addBldgBtn");
const removeBldgBtn = document.getElementById("removeBldgBtn");
const addBldg1SizeButton = document.getElementById("addBldg1SizeButton");
const removeBldg1SizeButton = document.getElementById("removeBldg1SizeButton");
let countBldg = 1;
let countBldgFloorsArray = [];
let countBldgFloors = 1;

//区分建物欄
const condominiumColumn = document.getElementById("condominiumColumn");
const condominiumField = document.getElementById("condominiumField");
const condominiumOkBtn = document.getElementById("condominiumOkBtn");
const condominiumCorrectBtn = document.getElementById("condominiumCorrectBtn");
const addCondominiumBtn = document.getElementById("addCondominiumBtn");
const removeCondominiumBtn = document.getElementById("removeCondominiumBtn");
const addCondominium1SizeButton = document.getElementById("addCondominium1SizeButton");
const removeCondominium1SizeButton = document.getElementById("removeCondominium1SizeButton");
let countCondominium = 1;
let countCondominiumFloorsArray = [];
let countCondominiumFloors = 1;

//申請人欄
const applicationColumn = document.getElementById("applicationColumn");
const applicationField = document.getElementById("applicationField");
const papersList = document.getElementById("papersList");
const completeBtn = document.getElementById("completeBtn");

//ボタン群
const okBtns = [decendantOkBtn, heirsOkBtn, divisionOkBtn, numberOfRealEstateOkBtn, landOkBtn, bldgOkBtn, condominiumOkBtn];
const correctBtns = [decendantCorrectBtn, heirsCorrectBtn, divisionCorrectBtn, numberOfRealEstateCorrectBtn, landCorrectBtn, bldgCorrectBtn, condominiumCorrectBtn];
const decendantBtn = 0;
const heirsBtn = 1;
const divisionBtn = 2;
const numberBtn = 3;
const landBtn = 4;
const bldgBtn = 5;
const condominiumBtn = 6;
const preBtn = document.getElementById("preBtn");

const heir1InheritRbs = document.getElementsByName("heir1InheritRbs");
const inheritYes = 0;
const inheritNo = 1;

const divisionRbs = document.getElementsByName("divisionRbs");
const monopoly = 0;
const everyone = 1;
const other = 2 

const statusText = document.getElementById("statusText");
const statusDecendant = "１";
const statusHeirs = "２";
const statusDivision = "３";
const statusNumberOfRealEstate = "４";
const statusApplication = "５";
let countDecendantResistryAddress = 1;
let countHeir = 1;
let countLand = 1;

/**
 * 初期処理
 */
function initialize(){
    //サイドバーを更新
    updateSideBar();

    //確定ボタンと修正ボタンにイベントを追加
    for(let i = 0; i < okBtns.length; i++){
        okBtns[i].addEventListener("click",(e)=>{
            displayNextColumn(e);
        })

        correctBtns[i].addEventListener("click", (e)=>{
            redoFormerColumn(e);
        })
    }

    //相続人項目のボタンイベント
    for(let i = 0; i < heir1InheritRbs.length; i++){
        heir1InheritRbs[i].addEventListener("click", ()=>{
            displayHeirAddress();
        })
    }

    //分割方法項目のボタンイベント
    for(let i = 0; i < divisionRbs.length; i++){
        divisionRbs[i].addEventListener("click", ()=>{
            buttonToElement(divisionRbs[monopoly], divisionAquirerArea);
        })
    }
}

/**
 * 要素を複製する
 * @param {string} cloneFromId 複製元の要素のid
 * @param {string} prefixId 属性変更対象の要素の前方一致id
 * @param {number} count 複製される要素の現在の数
 * @param {boolean} [fixLast=false] 修正対象を最後一致にするかのフラグ
 * @return {number} countに+1した数
 */
function cloneElement(cloneFromId, prefixId, count, fixLast = false){
    //１をコピーする
    let cloneFrom = document.getElementById(cloneFromId);
    let cloneElement = cloneFrom.cloneNode(true);

    //属性を変更する要素を全て取得する
    let idElement = cloneElement.querySelectorAll(`[id^=${prefixId}]`);
    
    //ループ処理
    for(let i = 0; i < idElement.length; i++){
        //各属性を変更
        idElement[i].setAttribute("id", fixAttribute(idElement[i], "id", count, fixLast));
        if(idElement[i].getAttribute("name") !== null) idElement[i].setAttribute("name", fixAttribute(idElement[i], "name", count, fixLast));
        if(idElement[i].getAttribute("aria-describedby") !== null) idElement[i].setAttribute("aria-describedby", fixAttribute(idElement[i], "aria-describedby", count, fixLast));

        //fixLastがtrueのときラベルを修正する
        if(fixLast && idElement[i].classList.contains("input-group-text")){
            idElement[i].innerHTML = idElement[i].innerHTML.replace(String(count), String(count + 1));
        }
    }
   
    //数を1増やす
    count += 1;
    let fixedId;

    if(fixLast){
        let reg = new RegExp(`(.*)${String(count - 1)}`);
        fixedId = cloneElement.id.replace(reg, `$1${String(count)}`);
    }else{
        fixedId = cloneElement.id.replace((String(count - 1)), String(count));
    }

    //idを変更
    cloneElement.id = fixedId;

    //最後のナンバリングの子の直後にペーストする
    cloneFrom.after(cloneElement);
    slideDown(cloneElement);
    scrollToTarget(cloneElement);

    return count;
}

/**
 * 追加する要素の上限を設定する
 * @param {number} limitNumber 上限の数
 * @param {number} count 現在の数
 * @param {button element} addBtn 追加ボタン
 * @param {string} text ボタンに設定する注意書き
 */
function setUpperLimitToAddElement(limitNumber, count, addBtn, text){
        //上限を設定
        if(count >= limitNumber){
            addBtn.disabled = true;
            text.style.display = "block";

        //上限未満のときは解除
        }else{
            //追加ボタンを有効化する
            addBtn.disabled = false;
            //注意書きを非表示にする
            text.style.display = "none";
        }
}

/**
 * 削除ボタンの有効化切り替え
 * @param {number} count 
 * @param {button element} removeBtn 
 */
function removeBtnToggle(count, removeBtn){
        //削除ボタンを表示して有効化する
        if(count === 2){
            removeBtn.style.display = display;
            removeBtn.disabled = false;
        }else if(count === 1){
            removeBtn.style.display = hidden;
            removeBtn.disabled = true;
        }else if(count === 0){
            alert("検証モードを操作した場合、想定外のエラーが発生する可能性があります。\nページを更新してやり直してください");
        }
}

/**
 * 属性を修正する
 * @param {element} el 対象の要素
 * @param {string} attribute 対象の属性
 * @param {number} count 複製された要素の複製前の数
 * @param {boolean} [fixLast=false] 修正対象を最後一致にするかのフラグ
 */
function fixAttribute(el, attribute, count, fixLast = false){
    let former = el.getAttribute(attribute);
    let fixed;

    if(fixLast){
        let reg = new RegExp(`(.*)${String(count)}`);
        fixed = former.replace(reg, `$1${String(count + 1)}`);
    }else{
        fixed = former.replace(String(count), String(count + 1));
    }

    return fixed;
}

/**
 * 次の項目を入力できるようにする
 * @param {event} e 押されたボタンイベント
 */
function displayNextColumn(e){
    if(e.target === decendantOkBtn){
        //次の項目の入力モードにする
        setNextColumn(heirsColumn, heirsField, heirsOkBtn, decendantField, decendantOkBtn, decendantCorrectBtn);
        //進捗を更新する
        updateStatus(statusDecendant, statusHeirs);
    }else if(e.target === heirsOkBtn){
        setNextColumn(divisionColumn, divisionField, divisionOkBtn, heirsField, heirsOkBtn, heirsCorrectBtn);
        updateStatus(statusHeirs, statusDivision);
    }else if(e.target === divisionOkBtn){
        setNextColumn(numberOfRealEstateColumn, numberOfRealEstateField, numberOfRealEstateOkBtn, divisionField, divisionOkBtn, divisionCorrectBtn);
        updateStatus(statusDivision, statusNumberOfRealEstate);
    }else if(e.target === numberOfRealEstateOkBtn){
        setNextColumn(landColumn, landField, landOkBtn, numberOfRealEstateField, numberOfRealEstateOkBtn, numberOfRealEstateCorrectBtn);
    }else if(e.target === landOkBtn){
        setNextColumn(bldgColumn, bldgField, bldgOkBtn, landField, landOkBtn, landCorrectBtn);
    }else if(e.target === bldgOkBtn){
        setNextColumn(condominiumColumn, condominiumField, condominiumOkBtn, bldgField, bldgOkBtn, bldgCorrectBtn);
    }else if(e.target === condominiumOkBtn){
        setNextColumn(applicationColumn, applicationField, completeBtn, bldgField, condominiumOkBtn, condominiumCorrectBtn);
        updateStatus(statusNumberOfRealEstate, statusApplication);
    }
}

/**
 * 前の項目を修正できるようにする
 * @param {event} e 押されたボタンイベント
 */
function redoFormerColumn(e){
    if(e.target === decendantCorrectBtn){
        //前の項目の入力モードにする
        setFormerColumn(heirsField, heirsOkBtn, decendantColumn, decendantField, decendantOkBtn, decendantCorrectBtn);
        //進捗を更新する
        updateStatus(statusHeirs, statusDecendant);
    }else if(e.target === heirsCorrectBtn){
        setFormerColumn(divisionField, divisionOkBtn, heirsColumn, heirsField, heirsOkBtn, heirsCorrectBtn);
        updateStatus(statusDivision, statusHeirs);
    }else if(e.target === divisionCorrectBtn){
        setFormerColumn(numberOfRealEstateField, numberOfRealEstateOkBtn, divisionColumn, divisionField, divisionOkBtn, divisionCorrectBtn);
        updateStatus(statusNumberOfRealEstate, statusDivision);
    }else if(e.target === numberOfRealEstateCorrectBtn){
        setFormerColumn(landField, landOkBtn, numberOfRealEstateColumn, numberOfRealEstateField, numberOfRealEstateOkBtn, numberOfRealEstateCorrectBtn);
    }else if(e.target === landCorrectBtn){
        setFormerColumn(bldgField, bldgOkBtn, landColumn, landField, landOkBtn, landCorrectBtn);
    }else if(e.target === bldgCorrectBtn){
        setFormerColumn(condominiumField, condominiumOkBtn, bldgColumn, bldgField, bldgOkBtn, bldgCorrectBtn);
    }else if(e.target === condominiumCorrectBtn){
        setFormerColumn(applicationField, completeBtn, condominiumColumn, condominiumField, condominiumOkBtn, condominiumCorrectBtn);
        updateStatus(statusApplication, statusNumberOfRealEstate);
    }
}

/**
 * 次の項目の入力モードにする
 * @param {element} nextColumn 
 * @param {element} nextField 
 * @param {element} nextOkBtn 
 * @param {element} formerField 
 * @param {element} formerOkBtn 
 * @param {element} formerCorrectBtn 
 */
function setNextColumn(nextColumn, nextField, nextOkBtn, formerField, formerOkBtn, formerCorrectBtn){
        //次の項目を表示する
        nextColumn.style.display = "block";
        if(nextColumn.style.display === "none"){
            slideDown(nextColumn);
            scrollToTarget(nextColumn);
        }else{
            scrollToTarget(nextColumn, 0);
            //次の項目を有効化する
            nextField.disabled = false;
            nextOkBtn.disabled = false;
        }
        //前の項目を全て無効化する
        formerField.disabled = true;
        //前の項目の修正ボタンを有効化する
        formerOkBtn.disabled = true;
        formerCorrectBtn.disabled = false;
}

/**
 * 前の項目の入力モードにする
 * @param {element} nextField
 * @param {element} nextOkBtn 
 * @param {element} formerColumn 
 * @param {element} formerField 
 * @param {element} formerOkBtn 
 * @param {element} formerCorrectBtn 
 */
function setFormerColumn(nextField, nextOkBtn, formerColumn, formerField, formerOkBtn, formerCorrectBtn){
    //最後の項目を無効化する
    nextField.disabled = true;
    nextOkBtn.disabled = true;
    //前の項目を有効化してスクロールする
    scrollToTarget(formerColumn, 0);
    formerField.disabled = false;
    //前の項目の確定ボタンを有効化する
    formerOkBtn.disabled = false;
    //前の項目の修正を無効化する
    formerCorrectBtn.disabled = true;
}

/**
 * ページ下部にある進捗を更新
 * @param {string} before 更新前の文字列の数字
 * @param {string} after 更新後の文字列の数字
 */
function updateStatus(before, after){
    let text = statusText.innerHTML;
    let fixText = text.replace(before, after);
    statusText.innerHTML = fixText;
}

/**
 * 不動産を取得する相続人の住所を表示する
 */
function displayHeirAddress(){
    let yes = document.getElementById(`heir${countHeir}InheritRbsZero`);
    let displayArea = document.getElementById(`heir${countHeir}AddressArea`);

    if(yes.checked){
        if(displayArea.style.display === "none"){
            slideDown(displayArea);
            scrollToTarget(displayArea);
        }
    }else{
        slideUp(displayArea);
    } 
}

/**
 * 階数をリセットする
 */
function resetCountFloors(){
    //前の建物の階数を保存する
    countBldgFloorsArray.push(countBldgFloors);

    //階数のカウントをリセットする
    countBldgFloors = 1;
}

/**
 * 建物を複製する際に階数をリセットする
 * @returns 
 */
function resetFloor(){
    //複製後の要素の床面積欄を取得する
    let bldgFloors = document.querySelectorAll(`div[id^=bldg${countBldg}Size]`);

    //ループ処理で1階以外すべて削除する
    for(let i = bldgFloors.length; i--;){
        if(i === 0) return;

        bldgFloors[i].remove();
    }
}

/**
 * ボタン２つのidを変更する
 * @param {string} parentId 親要素のid
 * @param {string} partialId 部分一致させるid
 * @param {number} count 現在の数 - 1
 */
function updateBtnsAttr(parentId ,partialId, count){
    //対象の建物を取得する
    let bldg = document.querySelector(`[id=${parentId}]`);
    //要素を取得する
    let targets = bldg.querySelectorAll(`[id*=${partialId}]`);

    for(let i = 0; i < targets.length; i++){
        targets[i].setAttribute("id", fixAttribute(targets[i], "id", count));
    }
}

/**
 * 複製したボタンにイベントを追加する
 * @param {string} addBtnId 追加ボタンのid
 * @param {string} removeBtnId 削除ボタンのid
 * @param {boolean} isBldg 一般建物フラグ
 */
function addEventToFloorBtns(addBtnId, removeBtnId, isBldg = true){
    //追加したボタン要素を取得する
    const addBtn = document.getElementById(`${addBtnId}`);
    const removeBtn = document.getElementById(`${removeBtnId}`);

    //追加ボタンにイベントを追加する
    addBtn.addEventListener("click", ()=>{
        if(isBldg){
            //要素を複製する
            countBldgFloors = cloneElement(`bldg${countBldg}Size${countBldgFloors}`, `bldg${countBldg}Size${countBldgFloors}`, countBldgFloors, true);
    
            //削除ボタンを表示して有効化
            removeBtnToggle(countBldgFloors, removeBtn);
        }else{

        }
    })

    //削除ボタンにイベントを追加する
    removeBtn.addEventListener("click", ()=>{
        if(isBldg){
            countBldgFloors = removeElement(`bldg${countBldg}Size${countBldgFloors}`, countBldgFloors);
            removeBtnToggle(countBldgFloors, removeBtn);
        }else{

        }
    })

}

/*
    イベント
*/
window.addEventListener("load", ()=>{
    initialize();
})

window.addEventListener('resize', () => {
    setSidebarHeight();
});

heirsColumnTitle.addEventListener("mouseover", ()=>{
    emphasizeText(heirsColumnTitle);
});

heirsColumnTitle.addEventListener("mouseout", ()=>{
    removeEmphasizeText(heirsColumnTitle);
});

addResistryAddressButton.addEventListener("click", ()=>{
    countDecendantResistryAddress = cloneElement(`decendantResistry${countDecendantResistryAddress}AddressArea`, `decendantResistry${countDecendantResistryAddress}`, countDecendantResistryAddress);
    setUpperLimitToAddElement(5, countDecendantResistryAddress, addResistryAddressButton, addResistryAddressButtonNote);
    removeBtnToggle(countDecendantResistryAddress, removeResistryAddressButton);
})

removeResistryAddressButton.addEventListener("click", ()=>{
    countDecendantResistryAddress = removeElement(`decendantResistry${countDecendantResistryAddress}AddressArea`, countDecendantResistryAddress);
    setUpperLimitToAddElement(5, countDecendantResistryAddress, addResistryAddressButton, addResistryAddressButtonNote);
    removeBtnToggle(countDecendantResistryAddress, removeResistryAddressButton);
})

heir1InheritRbsZero.addEventListener("click", ()=>{
    displayHeirAddress();
})

heir1InheritRbsOne.addEventListener("click", ()=>{
    displayHeirAddress();
})

addLandBtn.addEventListener("click", ()=>{
    countLand = cloneElement(`land${countLand}`, `land${countLand}`, countLand);
    removeBtnToggle(countLand, removeLandBtn);
})

removeLandBtn.addEventListener("click", ()=>{
    countLand = removeElement(`land${countLand}`, countLand);
    removeBtnToggle(countLand, removeLandBtn);
})

addBldg1SizeButton.addEventListener("click", ()=>{
    //要素を複製する
    countBldgFloors = cloneElement(`bldg1Size${countBldgFloors}`, `bldg1Size${countBldgFloors}`, countBldgFloors, true);

    //削除ボタンを表示して有効化
    removeBtnToggle(countBldgFloors, removeBldg1SizeButton);
})

removeBldg1SizeButton.addEventListener("click", ()=>{
    countBldgFloors = removeElement(`bldg1Size${countBldgFloors}`, countBldgFloors);
    removeBtnToggle(countBldgFloors, removeBldg1SizeButton);
})

addBldgBtn.addEventListener("click", ()=>{
    //複製する
    countBldg = cloneElement(`bldg${countBldg}`, `bldg${countBldg}`, countBldg);

    //床面積の追加削除ボタンの属性を変更する
    updateBtnsAttr(`bldg${countBldg}`, `Bldg${countBldg - 1}Size`, countBldg - 1);

    //複製対象の階数を配列に取得する
    resetCountFloors();
    
    //床面積を1階のみにする
    resetFloor();

    //削除ボタンを表示して有効化
    removeBtnToggle(countBldgFloors, document.getElementById(`removeBldg${countBldg}SizeButton`));

    //イベントを追加する
    addEventToFloorBtns(`addBldg${countBldg}SizeButton`, `removeBldg${countBldg}SizeButton`);
})

preBtn.addEventListener("click", ()=>{
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
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = 'step_three';

    });
})
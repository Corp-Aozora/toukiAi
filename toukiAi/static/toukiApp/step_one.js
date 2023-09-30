"use strict";

/**
    変数
*/
//この章の入力状況欄
class GuideField{
    constructor(){
        this.btnsArr = [document.querySelector(".guideBtn")];
        this.guidesArr = [document.querySelector(".guide")];
        this.caretIconsArr = [document.querySelector(".guideCaret")];
        this.checkIconsArr = [];
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
class DecedentColumnInputIndex{
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
        this.requiredFieldsetsArr = [document.querySelector("fieldset")];
        this.nextBtnsArr = Array.from(InputsField.decedentFieldset.getElementsByClassName("nextBtn"));
        this.previousBtnsArr = [];
        this.errorMessagesElArr = Array.from(InputsField.decedentFieldset.getElementsByClassName("errorMessage"));
    }
}
const inputsField = new InputsField();

//被相続人項目のインデックス
const decedentColumnIdx = 0;
const spouseColumnIdx = 1;
//次へボタンのイベントハンドラー
let oneStepFowardHandler;
//子供なしフラグ
let isNoChild = false;
let isNoCollateral = false;

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
            invalidElArr.push(el);
        }
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        //データ取得中ツールチップを削除する
        document.getElementById(`${el.id}_verifyingEl`).remove();
        //次へボタンの表示判別
        inputsField.nextBtnsArr[decedentColumnIdx].disabled = invalidElArr.length === 0 ? false: true;
    });
}

/**
 * フォームを生成する
 * @param {boolean} isChild 
 */
function createForm(isChild) {
    let relation;
    let zokugara;
    if(isChild){
        relation = "child";
        zokugara = "子";
    }else{
        relation = "collateral";
        zokugara = "兄弟姉妹";
    }

    const totalForms = document.getElementById(`id_${relation}-TOTAL_FORMS`);
    const nowCount = parseInt(totalForms.value);
    const afterCount = nowCount + 1;
    totalForms.value = afterCount;

    // 直前のfieldsetをコピー
    const x = document.getElementsByClassName(`${relation}Fieldset`);
    const lastEl = x[x.length - 1];
    const clone = lastEl.cloneNode(true);
    clone.id = `id_${relation}-${afterCount}-fieldset`;

    //タイトルを変更
    const fieldsetTitle = clone.querySelector(".fieldsetTitle");
    const originalColTitle = fieldsetTitle.textContent;
    const a = originalColTitle.replace(/\n/g, "").replace(/\s/g, "");
    const b = a.slice(0,1);
    const fixColNum = parseInt(ZenkakuToHankaku(b)) + 1;
    const fixTitle = `${hankakuToZenkaku(String(fixColNum))}．${zokugara}${hankakuToZenkaku(String(afterCount))}について`;
    fieldsetTitle.textContent = fixTitle;

    //ラベルのforを変更
    const nameLabel = clone.querySelector("label");
    nameLabel.setAttribute("for", `id_${relation}-${nowCount}-name`);

    //inputのname、id、tabindexを変更
    const inputsArr = clone.getElementsByTagName("input");
    const addIdx = 12;
    for(let i = 0; i < inputsArr.length; i++){
        const originalNameAtt = inputsArr[i].getAttribute("name");
        const fixNameAtt = originalNameAtt.replace(/\d+/g, nowCount);
        inputsArr[i].setAttribute("name", fixNameAtt);

        const originalIdAtt = inputsArr[i].getAttribute("id");
        const fixIdAtt = originalIdAtt.replace(/\d+/, nowCount);
        inputsArr[i].setAttribute("id", fixIdAtt);

        const originalTabindexAtt = inputsArr[i].getAttribute("tabindex");
        const fixTabindexAtt = parseInt(originalTabindexAtt) + addIdx;
        inputsArr[i].setAttribute("tabindex", String(fixTabindexAtt));
    }

    //buttonのtabindexを変更
    const btnsArr = clone.getElementsByTagName("button");
    for(let i = 0; i < btnsArr.length; i++){
        const originalTabindexAtt = btnsArr[i].getAttribute("tabindex");
        const fixTabindexAtt = parseInt(originalTabindexAtt) + addIdx;
        btnsArr[i].setAttribute("tabindex", String(fixTabindexAtt));
    }

    // 新しいfieldset要素をFormsetに追加します
    lastEl.after(clone);
}

/**
 * 次の項目を有効化して前の項目を無効化する
 * @param {number} i 押された次へボタンのインデックス
 */
function enableNextColumn(i){

    //次の項目を取得（子がいないときは、項目を１つ飛ばす）
    let nextFieldset = isNoChild ? document.getElementsByTagName("fieldset")[i + 2]: document.getElementsByTagName("fieldset")[i + 1];

    //次の項目を表示、hrを挿入、次の項目にスクロール
    inputsField.requiredFieldsetsArr.push(nextFieldset);
    slideDown(nextFieldset);
    const hr = document.createElement("hr");
    hr.className = "my-5";
    nextFieldset.before(hr);
    scrollToTarget(nextFieldset);
    
    //前の項目を無効化
    inputsField.requiredFieldsetsArr[i].disabled = true;

    //次の項目の要素を取得
    requiredInputArr.length = 0;
    requiredInputArr = Array.from(nextFieldset.getElementsByTagName("input"));

    //エラー要素に次のfieldsetの入力欄を追加する（戻るから復帰したときは保存されていた入力状況に応じたエラー要素を取得する）
    invalidElArr.length = 0;
    invalidElArr = preserveInvalidElArr.length > 0 ? preserveInvalidElArr.pop(): Array.from(nextFieldset.getElementsByTagName("input"));

    //エラーメッセージ要素を取得する
    inputsField.errorMessagesElArr.length = 0;
    inputsField.errorMessagesElArr = Array.from(nextFieldset.getElementsByClassName("errorMessage"));

    //次へと戻るのボタンを追加する
    inputsField.nextBtnsArr.push(nextFieldset.getElementsByClassName("nextBtn")[0]);
    inputsField.previousBtnsArr.push(nextFieldset.getElementsByClassName("previousBtn")[0]);

    //次の項目の最初の入力欄にフォーカスする
    requiredInputArr[0].focus();
}

/**
 * 次のガイドボタンにイベントを設定する
 * @param {event} e クリックイベント
 */
function enableNextGuideBtn(e){
    //次の項目にスクロールする
    const idx = guideField.btnsArr.indexOf(e.target);
    scrollToTarget(inputsField.requiredFieldsetsArr[idx], 0);
}

/**
 * ガイドを更新する
 */
function enableNextGuide(){
    const list = document.getElementById("guideList")
    const nextIdx = inputsField.requiredFieldsetsArr.length - 1;

    //ガイドの前の項目を通常表示にする
    guideField.guidesArr[nextIdx - 1].classList.remove("active");
    guideField.caretIconsArr[nextIdx - 1].style.display = "none";
    guideField.checkIconsArr.push(list.getElementsByClassName("guideCheck")[guideField.elIdx]);
    guideField.checkIconsArr[nextIdx - 1].style.display = "inline-block";

    //ガイドの次の項目が選択状態にする
    if(isNoChild)
        guideField.elIdx += 2;
    else
        guideField.elIdx += 1;

    guideField.guidesArr.push(list.getElementsByClassName("guide")[guideField.elIdx]);
    guideField.btnsArr.push(list.getElementsByClassName("guideBtn")[guideField.elIdx]);
    guideField.caretIconsArr.push(list.getElementsByClassName("guideCaret")[guideField.elIdx]);

    if(guideField.guidesArr[nextIdx].style.display === hidden)
        guideField.guidesArr[nextIdx].style.display = display;

    guideField.guidesArr[nextIdx].classList.add("active");
    guideField.btnsArr[nextIdx].disabled = false;
    guideField.caretIconsArr[nextIdx].style.display = "inline-block";

    //次の項目のガイドボタンにイベントを追加
    guideField.btnsArr[nextIdx].addEventListener("click", enableNextGuideBtn);
}

/**
 * 前の項目を有効化する
 * @param {number} i 押された戻るボタンのインデックス
 */
function enablePreviouseColumn(i){
    
    const disableField = inputsField.requiredFieldsetsArr[i + 1]; //無効化対象のフィールドセット
    const enableField = inputsField.requiredFieldsetsArr[i]; //有効化対象のフィールドセット
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ

    //無効化するフィールドにあるイベントが設定されている要素を初期化してイベントを削除する
    replaceElements(disableField, "input");
    replaceElements(disableField, "button");

    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    slideUp(removeHr);
    inputsField.requiredFieldsetsArr.pop();
    removeHr.remove();
    
    //直前の項目を有効化してスクロール
    enableField.disabled = false;
    scrollToTarget(enableField);

    //データの準備
    requiredInputArr.length = 0;
    preserveInvalidElArr.push(invalidElArr.slice());
    invalidElArr.length = 0;
    inputsField.errorMessagesElArr.length = 0
    inputsField.errorMessagesElArr = Array.from(enableField.getElementsByClassName("errorMessage"));
    inputsField.nextBtnsArr.pop();
    inputsField.previousBtnsArr.pop();

    //被相続人欄を有効化するとき
    if(i === 0){
        //全て入力済みのためエラー要素配列は設定不要
        requiredInputArr = Object.values(DecedentInput);
    }else{
        requiredInputArr = Array.from(enableField.getElementsByTagName("input"));
    }
}

/**
 * ガイドを一つ戻す
 * @param {number} i 押された戻るボタンのインデックス
 */
function putBackGuide(i){
    const currentIdx = inputsField.requiredFieldsetsArr.length - 1;
    const childrenPreBtnIdx = 1;
    
    //子供欄より先の欄の戻るボタンが押されたとき
    if(i > childrenPreBtnIdx)
        guideField.guidesArr[currentIdx].style.display = "none";

    //無効化された項目のガイドを無効化する
    guideField.guidesArr[currentIdx].classList.remove("active");
    guideField.guidesArr.pop();

    guideField.btnsArr[currentIdx].removeEventListener("click", enableNextGuideBtn);
    guideField.btnsArr[currentIdx].disabled = true;
    guideField.btnsArr.pop();

    guideField.caretIconsArr[currentIdx].style.display = "none";
    guideField.caretIconsArr.pop();

    //子供項目から戻るとき
    const fatherPreBtnIdx = 2;

    //押されたボタンに応じて要素番号を変更する
    if(isNoChild && i === fatherPreBtnIdx)
        guideField.elIdx -= 2;
    else if(i === childrenPreBtnIdx){
        isNoChild = false;
        guideField.elIdx -= 1;
    }else{
        guideField.elIdx -= 1;
    }

    //一つ前の項目をactiveにする
    guideField.checkIconsArr[currentIdx - 1].style.display = "none";
    guideField.checkIconsArr.pop();

    guideField.guidesArr[currentIdx - 1].classList.add("active");

    guideField.caretIconsArr[currentIdx - 1].style.display = "inline-block";
}

/**
 * 前の項目を有効化にする
 * @param {num} i 押された戻るボタンのインデックス
 */
function oneStepBack(i){
    return function(e){
        //前の項目を有効化とガイドの巻き戻し
        putBackGuide(i);
        enablePreviouseColumn(i);
    }
}

/**
 * 使用しないインデックスが連続する質問を非表示にする
 * @param {element array} elsArr 対象の要素の配列
 * @param {number} startIdx 非表示を開始するQのインデックス
 * @param {number} endIdx 非表示を終了するQのインデックス
 */
function slideUpDisuseQs(elsArr, startIdx, endIdx){
    for(let i = startIdx; i < endIdx + 1; i++){
        if(elsArr[i].style.display !== hidden)
            slideUp(elsArr[i]);    
    }
}

/**
 * 使用しない質問を非表示にする
 * @param {element} el 対象の要素
 */
function slideUpDisuseQ(el){
    if(el.style.display !== hidden)
        slideUp(el);    
}

/**
 * エラー配列に対象のエラー要素がないとき追加する（オプションでボタンの無効化も可）
 * @param {element} el 対象のエラー要素
 * @param {element} btn 無効化したいボタン
 */
function pushInvalidEl(el, btn = null){
    if(invalidElArr.indexOf(el) === -1){
        invalidElArr.push(el);
        if(btn !== null){
            btn.disabled = true;
        }
    }
}

/**
 * 複数の質問欄を非表示にして値を初期化する
 * @param {element array} QsArr 連続する質問欄
 * @param {number} startIdx 非表示を開始する質問欄のインデックス
 * @param {number} endIdx 非表示を終了する質問欄のインデックス
 * @param {number array} rbIdxArr 初期化するラジオボタンの配列
 * @param {element} textInput テキストボックスの初期化
 */
function initializeQs(QsArr, startIdx, endIdx, rbIdxArr, textInput = null){
    uncheckTargetElements(requiredInputArr, rbIdxArr);
    if(textInput !== null)
        textInput.value = "0";
    slideUpDisuseQs(QsArr, startIdx, endIdx);
}

/**
 * 入力事項をチェックして次へボタンを有効化するか判別する
 * @param {element} el チェック対象の要素
 * @param {element} btn 有効化するボタン
 */
function validateBeforeEnableNextBtn(el, btn){
    invalidElArr = invalidElArr.filter(x => x === el);
    if(invalidElArr.length === 0) btn.disabled = false;
}

/**
 * 非表示のとき対象の要素を表示する
 * @param {element} el 表示する要素
 */
function slideDownElementIfHidden(el){
    if(el.style.display === hidden)
        slideDown(el);
}

/**
 * 同じ要素をスライドアップしてスライドダウンするときの表示
 * @param {element} el 対象の要素
 * @param {number} time スライドアップが完了する時間間
 */
function slideDownAfterSlideUp(el, time = null){
    setTimeout(() => {
        slideDown(el);
    }, time = time !== null ? time: 250);
}

/**
 * 配偶者項目を表示する
 * @param {number} btnIdx 押された次へボタンのインデックス
 * @param {element array} Qs 対象の項目の質問欄
 * @param {element} nextBtn 次へボタン
 */
function setSpouseRbsEvent(btnIdx, Qs, nextBtn){
    const yes = 0;
    const no = 1;
    const inputsArr = {
        name:{ formIdx: 0, inputIdx: 0},
        isExist:{formIdx: 1, inputIdx: [1, 2]},
        isLive:{formIdx: 2, inputIdx: [3, 4]},
        isStepChild:{formIdx: 3, inputIdx: [5, 6]},
        isRefuse:{formIdx: 4, inputIdx: [7, 8]},
        isJapan:{formIdx: 5, inputIdx: [9, 10]},
    }

    //死亡時存在true
    if(btnIdx === inputsArr.isExist.inputIdx[yes]){
        
        //エラー要素に氏名欄を追加する
        pushInvalidEl(requiredInputArr[inputsArr.isExist.inputIdx[yes]], nextBtn);
        requiredInputArr[inputsArr.name.inputIdx].disabled = false;

        //次の入力欄を表示する
        slideDown(Qs[isLiveIdx]);

    }else if(btnIdx === inputsArr.isExist.inputIdx[no]){
        //false

        //エラー要素を全て削除/次へボタンを有効化/氏名欄を初期化して無効化
        invalidElArr.length = 0;
        nextBtn.disabled = false;
        requiredInputArr[inputsArr.name.inputIdx].value = "";
        requiredInputArr[inputsArr.name.inputIdx].disabled = true;

        //3問目以降の質問を全て非表示にして値を初期化する
        const rbIdxArr = inputsArr.isLive.inputIdx.concat(inputsArr.isStepChild.inputIdx).concat(inputsArr.isRefuse.inputIdx).concat(inputsArr.isJapan.inputIdx);
        initializeQs(Qs, inputsArr.isLive.formIdx, inputsArr.isJapan.formIdx, rbIdxArr);

    }else if(btnIdx === inputsArr.isLive.inputIdx[yes]){
        //手続時存在true

        //エラー要素を追加
        pushInvalidEl(requiredInputArr[inputsArr.isJapan.inputIdx[yes]], nextBtn);

        //連れ子欄を非表示かつボタンを初期化
        initializeQs(Qs, inputsArr.isStepChild.formIdx, inputsArr.isStepChild.formIdx, inputsArr.isStepChild.inputIdx);

        //相続放棄欄を表示する
        slideDownAfterSlideUp(Qs[inputsArr.isRefuse.formIdx]);

    }else if(btnIdx === inputsArr.isLive.inputIdx[no]){
        //手続時存在false

        //エラー要素を追加
        pushInvalidEl(requiredInputArr[inputsArr.isJapan.inputIdx[yes]], nextBtn);

        //相続放棄欄以降を非表示にしてボタンを初期化
        const rbIdxArr = inputsArr.isRefuse.inputIdx.concat(inputsArr.isJapan.inputIdx);
        initializeQs(Qs, inputsArr.isRefuse.formIdx, inputsArr.isJapan.formIdx, rbIdxArr);

        //連れ子欄を表示
        inputsField.errorMessagesElArr[inputsArr.isStepChild.formIdx].style.display = hidden;
        inputsField.errorMessagesElArr[inputsArr.isStepChild.formIdx].innerHTML = "";
        slideDownAfterSlideUp(Qs[inputsArr.isStepChild.formIdx]);

    }else if(btnIdx === inputsArr.isStepChild.inputIdx[yes]){
        //連れ子true
        
        //エラー要素を追加
        pushInvalidEl(requiredInputArr[inputsArr.isStepChild.inputArr[yes]], nextBtn);
        
        //システム対応外であることを表示する
        inputsField.errorMessagesElArr[inputsArr.isStepChild.formIdx].style.display = display;
        inputsField.errorMessagesElArr[inputsArr.isStepChild.formIdx].innerHTML = "本システムでは対応できません";

    }else if(btnIdx === inputsArr.isRefuse.inputIdx[yes]){
        //相続放棄true

        //名前が入力されているときは次へボタンを有効化する
        validateBeforeEnableNextBtn(requiredInputArr[inputsArr.name.inputIdx], nextBtn);

        //日本在住を非表示にして値を初期化
        initializeQs(Qs, inputsArr.isJapan.formIdx, inputsArr.isJapan.formIdx, inputsArr.isJapan.inputIdx);

    }else if(btnIdx === inputIdxsArr[isRefuseIdx][no]){
        //false

        //エラー要素を追加
        pushInvalidEl(requiredInputArr[inputsArr.isJapan.inputIdx[yes]], nextBtn);

        //次の入力欄を表示する
        slideDown(Qs[isJapanIdx]);

    }else{
        //日本在住(true、false同じ処理)、又は連れ子false

        //名前が入力されているときは次へボタンを有効化する
        validateBeforeEnableNextBtn(requiredInputArr[inputsArr.name.inputIdx], nextBtn)
    }
}

/**
 * 子項目を表示する
 * @param {number} idx イベントを設定するinputのインデックス
 * @param {element array} Qs 対象の項目の質問欄
 * @param {element} nextBtn 次へボタン
 */
function setChildRbsEvent(idx, Qs, nextBtn){
    const yes = 0;
    const no = 1;
    const inputsArr = {
        name:{ formIdx: 0, inputIdx: 0},
        isSameSpouse:{formIdx: 1, inputIdx: [1, 2]},
        isLive:{formIdx: 2, inputIdx: [3, 4]},
        isExist:{formIdx: 3, inputIdx: [5, 6]},
        isRefuse:{formIdx: 4, inputIdx: [7, 8]},
        isSpouse:{formIdx: 5, inputIdx: [9, 10]},
        isChild:{formIdx: 6, inputIdx: [11, 12]},
        childCount:{formIdx: 7, inputIdx: 13},
        isAdult:{formIdx: 8, inputIdx: [14, 15]},
        isJapan:{formIdx: 9, inputIdx: [16, 17]},
    }

    //同じ配偶者、true又はfalseのとき
    if(inputsArr.isSameSpouse.inputIdx.includes(idx)){
        //手続時存在欄が表示されてないとき表示する
        slideDownElementIfHidden(Qs[inputsArr.isLive.formIdx]);

    }else if(idx === inputsArr.isLive.inputIdx[yes]){
        //手続時存在true

        //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する
        pushInvalidEl(requiredInputArr[inputsArr.isJapan.inputIdx[yes]], nextBtn);

        //falseのときに表示する欄を非表示にして入力値とボタンを初期化
        const rbIdxArr = inputsArr.isExist.inputIdx.concat(inputsArr.isRefuse.inputIdx).concat(inputsArr.isSpouse.inputIdx).concat(inputsArr.isChild.inputIdx);
        initializeQs(Qs, inputsArr.isExist.formIdx, inputsArr.childCount.formIdx, rbIdxArr, Qs[inputsArr.childCount.formIdx]);


        //相続放棄欄を表示する
        slideDownAfterSlideUp(Qs[inputsArr.isRefuse.formIdx]);

    }else if(idx === inputsArr.isLive.inputIdx[no]){
        //手続時存在false

        pushInvalidEl(requiredInputArr[inputsArr.childCount.inputIdx], nextBtn);

        //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化
        slideUpDisuseQ(Qs[inputsArr.isRefuse.formIdx]);
        const rbIdxArr = inputsArr.isRefuse.inputIdx.concat(inputsArr.isAdult.inputIdx).concat(inputsArr.isJapan.inputIdx);
        initializeQs(Qs, inputsArr.isAdult.formIdx, inputsArr.isJapan.formIdx, rbIdxArr);

        //相続時存在欄を表示する
        slideDownAfterSlideUp(Qs[inputsArr.isExist.formIdx]);

    }else if(idx === inputsArr.isExist.inputIdx[yes]){
        //相続時存在true

        //エラー要素として子供の人数欄を追加して次へボタンを無効化する
        pushInvalidEl(requiredInputArr[inputsArr.childCount.inputIdx], nextBtn);

        //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する
        initializeQs(Qs, inputsArr.isChild.formIdx, inputsArr.childCount.formIdx, inputsArr.isChild.inputIdx, requiredInputArr[inputsArr.childCount.inputIdx])

        //相続放棄欄を表示
        slideDownAfterSlideUp(Qs[inputsArr.isRefuse.formIdx]);

    }else if(idx === inputsArr.isExist.inputIdx[no]){
        //相続時存在false

        //エラー要素として子供の人数欄を追加して次へボタンを無効化する
        pushInvalidEl(requiredInputArr[inputsArr.childCount.inputIdx], nextBtn);

        //trueのときに表示する欄を非表示にして値とボタンを初期化
        const rbIdxArr = inputsArr.isRefuse.inputIdx.concat(inputsArr.isSpouse.inputIdx).concat(inputsArr.isChild.inputIdx);
        initializeQs(Qs, inputsArr.isRefuse.formIdx, inputsArr.childCount.formIdx, rbIdxArr, requiredInputArr[inputsArr.childCount.inputIdx])

        //子の存在確認欄を表示
        slideDownAfterSlideUp(Qs[inputsArr.isChild.formIdx]);

    }else if(idx === inputsArr.isRefuse.inputIdx[yes]){
        //相続放棄true

        //氏名欄にエラーがないときは次へボタンを有効化する
        validateBeforeEnableNextBtn(requiredInputArr[inputsArr.name.inputIdx], nextBtn);

        //falseのときに表示する欄を非表示にして値とボタンを初期化
        const rbIdxArr = inputsArr.isSpouse.inputIdx.concat(inputsArr.isChild.inputIdx).concat(inputsArr.isAdult.inputIdx).concat(inputsArr.isJapan.inputIdx);
        initializeQs(Qs, inputsArr.isSpouse.formIdx, inputsArr.isJapan.formIdx, rbIdxArr, requiredInputArr[inputsArr.childCount.inputIdx])

    }else if(idx === inputsArr.isRefuse.inputIdx[no]){
        //相続放棄false

        //手続時存在trueのとき
        if(requiredInputArr[inputsArr.isLive.inputIdx[yes]].checked){

            //エラー要素を追加と次へボタンを無効化
            pushInvalidEl(requiredInputArr[inputsArr.isJapan.inputIdx[yes]], nextBtn);

            //成人欄を表示
            slideDown(Qs[inputsArr.isAdult.formIdx]);

        }else if(requiredInputArr[inputsArr.isExist.inputIdx[yes]].checked){
            //死亡時存在trueのとき

            //エラー要素を追加と次へボタンを無効化
            pushInvalidEl(requiredInputArr[inputsArr.childCount.inputIdx], nextBtn);

            //配偶者確認欄を表示
            slideDown(Qs[inputsArr.isSpouse.formIdx]);
        }

    }else if(inputsArr.isSpouse.inputIdx.includes(idx)){
        //配偶者確認true、又はfalse

        //子供存在欄を表示する
        slideDownElementIfHidden(Qs[inputsArr.isChild.formIdx])

    }else if(inputsArr.isChild.inputIdx.includes(idx)){
        //子の存在欄のとき

        //子供の人数欄をエラー要素に追加して次へボタンを無効化
        validateBeforeEnableNextBtn(requiredInputArr[inputsArr.name.inputIdx], nextBtn);
        
        if(idx === inputsArr.isChild.inputIdx[yes]){
            //子供存在true
    
            //子の人数欄を表示
            requiredInputArr[inputsArr.childCount.inputIdx].value = "1";
            slideDown(Qs[inputsArr.childCount.formIdx]);
    
        }else if(idx === inputsArr.isChild.inputIdx[no]){
            //子供存在false
    
            //子の人数欄を非表示にして初期化する
            requiredInputArr[inputsArr.childCount.inputIdx].value = "0";
            slideUp(Qs[inputsArr.childCount.formIdx]);
            inputsField.errorMessagesElArr[inputsArr.childCount.formIdx].style.display = hidden;
        }

    }else if(inputsArr.isAdult.inputIdx.includes(idx)){
        //成人欄

        //日本在住欄を表示する
        slideDownElementIfHidden(Qs[inputsArr.isJapan.formIdx]);

    }else if(inputsArr.isJapan.inputIdx.includes(idx)){
        //日本在住欄

        //氏名欄にエラーがないときは次へボタンを有効化する
        validateBeforeEnableNextBtn(requiredInputArr[inputsArr.name.inputIdx], nextBtn);
    }
}

/**
 * プラスボタンとマイナスボタンの有効化トグル
 * @param {element} plusBtn 
 * @param {element} minusBtn 
 * @param {number} val 
 */
function togglePlusBtnAndMinusBtn(plusBtn, minusBtn, val, min, max){
    minusBtn.disabled = val > min ? false: true;
    plusBtn.disabled = val > max ? true: false;
}

/**
 * 子の人数を１増加させる
 * 
 */
function adjustChildCount(isIncrease, idx, limitCount){
    let val = parseInt(requiredInputArr[idx].value);

    if(isIncrease){
        if(val < limitCount)
            val += 1;
    }else{
        if(val > limitCount)
            val -= 1;
    }
    requiredInputArr[idx].value = val;
}

/**
 * 人数欄の値変更イベント用
 * @param {event} e 値変更イベント
 * @param {number} idx 入力欄のインデックス
 * @param {element} nextBtn 次へボタン
 */
function countCheck(e, idx, nextBtn){
    let val = e.target.value;

    //整数チェック
    isValid = isNumber(val, e.target);
    //整数のとき
    if(isValid){
        //15人以下チェック
        if(parseInt(val) > 15){
            sort("false", inputsField.errorMessagesElArr[idx], "上限は１５人までです", requiredInputArr[idx], nextBtn);
        }else if(parseInt(val) === 0){
            sort("false", inputsField.errorMessagesElArr[idx], "いない場合は上の質問で「いいえ」を選択してください", requiredInputArr[idx], nextBtn);
            val = "1";
        }else{
            sort(isValid, inputsField.errorMessagesElArr[idx], "", requiredInputArr[idx], nextBtn);
        }

    }else{
        sort("false", inputsField.errorMessagesElArr[idx], "入力必須です", requiredInputArr[idx], nextBtn)
        val = "1";
    }
}

/**
 * 数字入力欄のキーダウンイベント
 * @param {event} e キーダウンイベント
 * @param {element} nextEl 次にフォーカスする要素
 */
function handleNumInputKeyDown(e, nextEl){
    //Enterで次にフォーカス
    if(e.key === "Enter"){
        e.preventDefault();
        nextEl.focus();
    }else if(!(e.key >= 0 && e.key <= 9 || e.key === "Backspace" || e.key === "Delete")){
        //数字又はバックスペースとデリート以外は使用不可
        e.preventDefault()
    }
}

/**
 * 次の入力欄を表示する
 * @param {number} i ループ変数
 * @param {element} fieldset 対象の項目
 * @param {element array} Qs 対象の項目の質問欄
 * @param {element} nextBtn 次へボタン
 */
function setIndivisualFieldsetEvent(i, fieldset, Qs, nextBtn){
    const nameInputIdx = 0;
    //氏名
    if(i === nameInputIdx){

        requiredInputArr[i].addEventListener("change",(e)=>{
            //エラー要素から削除
            invalidElArr = invalidElArr.filter(x => x !== e.target);

            //入力値チェック
            const val = e.target.value;
            const el = e.target;

            //入力値のチェック結果を取得して結果に応じた処理をする
            isValid = isOnlyZenkaku(val, el);
            sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], nextBtn);
        })

        requiredInputArr[i].addEventListener("keydown",(e)=>{
            //Enterで次にフォーカス
            if(e.key === "Enter"){
                e.preventDefault();
                requiredInputArr[i + 1].focus();
            }
        })
    }else{
        //氏名欄以外のとき

        //配偶者項目のとき
        if(fieldset.classList.contains("spouseFieldset")){
            requiredInputArr[i].addEventListener("change",(e)=>{
                setSpouseRbsEvent(i, Qs, nextBtn);
            })
        }else if(fieldset.classList.contains("childFieldset")){
            //子の欄

            const childCountInputIdx = 13;
            
            //人数欄
            if(i === childCountInputIdx){
                
                const childCountFormIdx = 7;
                const minusBtn = Qs[childCountFormIdx].getElementsByClassName("decreaseBtn")[0];
                const plusBtn = Qs[childCountFormIdx].getElementsByClassName("increaseBtn")[0];
                const minChildCount = 1;
                const maxChildCount = 15;

                requiredInputArr[i].addEventListener("change", (e)=>{
                    countCheck(e, i, nextBtn);
                    togglePlusBtnAndMinusBtn(plusBtn, minusBtn, parseInt(val), minChildCount, maxChildCount);
                })

                requiredInputArr[i].addEventListener("keydown",(e)=>{
                    handleNumInputKeyDown(e, nextBtn);
                })

                requiredInputArr[i].addEventListener("input", (e)=>{
                    //３文字以上入力不可
                    e.target.value = e.target.value.slice(0,2);
                })

                //マイナスボタン
                minusBtn.addEventListener("click",(e)=>{
                    adjustChildCount(false, i, minChildCount);
                    togglePlusBtnAndMinusBtn(plusBtn, minusBtn, parseInt(requiredInputArr[i].value), minChildCount, maxChildCount);
                })

                //プラスボタン
                plusBtn.addEventListener("click",(e)=>{
                    adjustChildCount(true, i, maxChildCount);
                    togglePlusBtnAndMinusBtn(plusBtn, minusBtn, parseInt(requiredInputArr[i].value), minChildCount, maxChildCount);
                })

            }else{
                //ラジオボタン欄

                //値変更
                requiredInputArr[i].addEventListener("change",(e)=>{
                    //子のラジオボタンイベントを設定
                    setChildRbsEvent(i, Qs, nextBtn);
                })
            }
        }
    }
}

/**
 * 子全員又は兄弟姉妹全員欄のイベントを設定する
 * @param {number} i ループ変数
 * @param {element} fieldset 対象の項目
 * @param {element array} Qs 対象の項目の質問欄
 * @param {element} nextBtn 次へボタン
 */
function setGroupEvent(i, fieldset, Qs, nextBtn){
    
    const yes = 0;
    const no = 1;
    const inputsArr = {
        isExist:{ formIdx: 0, inputIdx: [0, 1] },
        count:{ formIdx: 1, inputIdx: 2 },
        isSameParents:{ formIdx: 2, inputIdx: [3, 4] },
        isLive:{ formIdx: 3, inputIdx: [5, 6] },
        isAdult:{ formIdx: 4, inputIdx: [7, 8] },
        isJapan:{ formIdx: 5, inputIdx: [9, 10] },
    }

    //子供存在true
    if(i === inputsArr.isExist.inputIdx[yes]){

        requiredInputArr[i].addEventListener("change", (e)=>{
            //エラー要素を初期化する
            pushInvalidEl(requiredInputArr[inputsArr.isJapan.inputIdx[yes]], nextBtn);

            //人数入力欄を表示する
            requiredInputArr[inputsArr.count.inputIdx].value = "1";
            slideDown(Qs[inputsArr.count.formIdx]);
            slideDown(Qs[inputsArr.isSameParents.formIdx]);

            //子供いないフラグをfalseにする
            isNoChild = false;
        })

    }else if(i === inputsArr.isExist.inputIdx[no]){
        //子供存在false

        requiredInputArr[i].addEventListener("change", (e)=>{
            invalidElArr.length = 0
            const rbIdxArr = inputsArr.isSameParents.inputIdx.concat(inputsArr.isLive.inputIdx).concat(inputsArr.isAdult.inputIdx).concat(inputsArr.isJapan.inputIdx);
            initializeQs(Qs, inputsArr.count.formIdx, inputsArr.isJapan.formIdx, rbIdxArr, requiredInputArr[i]);

            //次へボタンを有効化して子供なしフラグをtrueにする
            nextBtn.disabled = false;
            isNoChild = true;
        })

    }else if(i === inputsArr.count.inputIdx){
        //人数欄
        
        const countForm = Qs[inputsArr.count.formIdx]; 
        const minusBtn = countForm.getElementsByClassName("decreaseBtn")[0];
        const plusBtn = countForm.getElementsByClassName("increaseBtn")[0];
        const minChildCount = 1;
        const maxChildCount = 15;
        
        requiredInputArr[i].addEventListener("change", (e)=>{
            countCheck(e, i, nextBtn);
            togglePlusBtnAndMinusBtn(plusBtn, minusBtn, parseInt(val), minChildCount, maxChildCount);
        })

        requiredInputArr[i].addEventListener("keydown",(e)=>{
            handleNumInputKeyDown(e, requiredInputArr[i + 1]);
        })

        requiredInputArr[i].addEventListener("input", (e)=>{
            //３文字以上入力不可
            e.target.value = e.target.value.slice(0,2);
        })

        //マイナスボタン
        minusBtn.addEventListener("click",(e)=>{
            adjustChildCount(false, i, minChildCount);
            togglePlusBtnAndMinusBtn(plusBtn, minusBtn, parseInt(requiredInputArr[i].value), minChildCount, maxChildCount);
        })

        //プラスボタン
        plusBtn.addEventListener("click",(e)=>{
            adjustChildCount(true, i, maxChildCount);
            togglePlusBtnAndMinusBtn(plusBtn, minusBtn, parseInt(requiredInputArr[i].value), minChildCount, maxChildCount);
        })

    }else if(inputsArr.isSameParents.inputIdx.includes(i)){
        //同じ配偶者のtrue又はfalseのとき次の質問を表示する
        requiredInputArr[i].addEventListener("change", (e)=>{
            slideDownElementIfHidden(Qs[inputsArr.isLive.formIdx]);
        })
    }else if(inputsArr.isLive.inputIdx.includes(i)){
        //手続時生存のtrue又はfalseのとき次の質問を表示する
        requiredInputArr[i].addEventListener("change", (e)=>{
            slideDownElementIfHidden(Qs[inputsArr.isAdult.formIdx]);
        })
    }else if(inputsArr.isAdult.inputIdx.includes(i)){
        //成人true又はfalseのとき次の質問を表示する
        requiredInputArr[i].addEventListener("change", (e)=>{
            slideDownElementIfHidden(Qs[inputsArr.isJapan.formIdx]);
        })
    }else{
        //日本在住true又はfalse
        requiredInputArr[i].addEventListener("change", (e)=>{
            invalidElArr.length = 0
            nextBtn.disabled = false;
        })
    }
}

/**
 * 次の項目とガイドの次の項目を有効化して前の項目を無効化する
 * @param {number} fromNextBtnIdx 押された次へボタンのインデックス
 */
function oneStepFoward(fromNextBtnIdx, isIndivisual){
    
    //子供欄の次へボタンが押されたとき
    if(inputsField.requiredFieldsetsArr[inputsField.requiredFieldsetsArr.length - 1].id === "childrenFieldset"){
        //子が２人以上いるとき、子フォームを追加する
        const childCountInputIdx = 2;
        const addFormNum = parseInt(requiredInputArr[childCountInputIdx].value) - 1;
        if(isNoChild === false && addFormNum > 0){
            const isChild = true;
            for(let i = 0; i < addFormNum; i ++){
                createForm(isChild);
            }
        }
    }

    //次の項目を有効化とガイドを更新
    enableNextColumn(fromNextBtnIdx);
    enableNextGuide();

    //各入力欄に処理
    const currentIdx = inputsField.requiredFieldsetsArr.length - 1;
    const fieldset = inputsField.requiredFieldsetsArr[currentIdx];
    const Qs = inputsField.requiredFieldsetsArr[currentIdx].getElementsByClassName("Q");
    const nextBtn = inputsField.nextBtnsArr[currentIdx];

    //個人入力欄のとき
    if(isIndivisual){
        for(let i = 0; i < requiredInputArr.length; i++){
            //イベントを設定
            setIndivisualFieldsetEvent(i, fieldset, Qs, nextBtn);
        }
    }else{
        //子供全員又は兄弟姉妹全員入力欄のとき
        for(let i = 0; i < requiredInputArr.length; i++){
            setGroupEvent(i, fieldset, Qs, nextBtn);
        }
    }

    //戻るボタンにイベントを設定
    const oneStepBackHandler = oneStepBack(fromNextBtnIdx);
    inputsField.previousBtnsArr[fromNextBtnIdx].addEventListener("click", oneStepBackHandler);

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
        if(requiredInputArr[1].checked){
            nextBtn.disabled = false;
            isNoChild = true;
        }
    }
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
    //チェック結果がtrueのとき
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
    //チェック対象をエラー配列から削除
    invalidElArr = invalidElArr.filter(x => x !== el);
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
    for(let i = 0; i < requiredInputArr.length; i++){
        
        //被相続人欄内の入力欄にイベントを設定
        requiredInputArr[i].addEventListener("change", (e)=>{
            const val = e.target.value;
            const el = e.target;

            //入力値のチェック結果を取得
            isValid = decedentFormValidationList(val, el);
    
            //結果に応じて分岐
            sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[decedentColumnIdx]);

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
guideField.btnsArr[0].addEventListener("click", enableNextGuideBtn)

//氏名
DecedentInput.name.addEventListener("keydown",(e)=>{
    if(e.key === "Enter"){
        e.preventDefault();
        DecedentInput.deathYear.focus();
    }
})

//被相続人欄の次へボタン
inputsField.nextBtnsArr[decedentColumnIdx].addEventListener("click",(e)=>{

    //被相続人欄の入力値を全てチェックする
    for(let i = 0; i < requiredInputArr.length; i++){
        isValid = decedentFormValidationList(requiredInputArr[i].value, requiredInputArr[i])
        sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[decedentColumnIdx])
    }

    //エラーがあるときは、処理を中止
    if(invalidElArr.length > 0){
        e.preventDefault();
        invalidElArr[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    oneStepFoward(decedentColumnIdx, true);
})
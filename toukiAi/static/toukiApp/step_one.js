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
const decendantColumnIdx = 0;
const spouseColumnIdx = 1;
//次へボタンのイベントハンドラー
let oneStepFowardHandler;
//子供なしフラグ
let isNoChild = false;

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
        //次へボタンの表示判別
        inputsField.nextBtnsArr[decendantColumnIdx].disabled = invalidElArr.length === 0 ? false: true;
    });
}

/**
 * 次の項目を有効化して前の項目を無効化する
 * @param {number} i 押された次へボタンのインデックス
 */
function enableNextColumn(i){

    //子がいないときは、項目を１つ飛ばす
    let targetField;
    if(isNoChild)
        targetField = document.getElementsByTagName("fieldset")[i + 2];
    else
        targetField = document.getElementsByTagName("fieldset")[i + 1];

    //次の項目を表示、hrを挿入、次の項目にスクロール
    inputsField.requiredFieldsetsArr.push(targetField);
    slideDown(targetField);
    const hr = document.createElement("hr");
    hr.className = "my-5";
    targetField.before(hr);
    scrollToTarget(targetField);
    
    //前の項目を無効化、次の項目の要素を取得
    inputsField.requiredFieldsetsArr[i].disabled = true;
    requiredInputArr.length = 0;
    requiredInputArr = Array.from(targetField.getElementsByTagName("input"));
    invalidElArr.length = 0;
    if(preserveInvalidElArr.length > 0)
        invalidElArr = preserveInvalidElArr.pop();
    else
        invalidElArr = Array.from(targetField.getElementsByTagName("input"));
    inputsField.errorMessagesElArr.length = 0;
    inputsField.errorMessagesElArr = Array.from(targetField.getElementsByClassName("errorMessage"));
    inputsField.nextBtnsArr.push(targetField.getElementsByClassName("nextBtn")[0]);
    inputsField.previousBtnsArr.push(targetField.getElementsByClassName("previousBtn")[0]);

    //次の項目の最初の入力欄にフォーカスする
    requiredInputArr[0].focus();
}

/**
 * 次のガイドボタンにイベントを設定する
 * @param {event} e 
 */
function enableNextGuideBtn(e){
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
    guideField.checkIconsArr.push(list.getElementsByClassName("guideCheck")[guideField.elIdx]);

    guideField.guidesArr[nextIdx - 1].classList.remove("active");
    guideField.caretIconsArr[nextIdx - 1].style.display = "none";
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

    //無効化するフィールドにあるイベントが設定されている要素を入れ替えてイベントを削除する
    let inputs = disableField.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        let oldInput = inputs[i];
        let newInput = oldInput.cloneNode(true);
        oldInput.parentNode.replaceChild(newInput, oldInput);
    }
    let buttons = disableField.getElementsByTagName('button');
    for (let i = 0; i < buttons.length; i++) {
        let oldButton = buttons[i];
        let newButton = oldButton.cloneNode(true);
        oldButton.parentNode.replaceChild(newButton, oldButton);
    }

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
    requiredInputArr.length = 0;
    preserveInvalidElArr.push(invalidElArr);
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
    //無効化された項目のガイドを無効化する
    if(i > 1)
        guideField.guidesArr[currentIdx].style.display = "none";

    guideField.guidesArr[currentIdx].classList.remove("active");
    guideField.guidesArr.pop();

    guideField.btnsArr[currentIdx].removeEventListener("click", enableNextGuideBtn);
    guideField.btnsArr[currentIdx].disabled = true;
    guideField.btnsArr.pop();

    guideField.caretIconsArr[currentIdx].style.display = "none";
    guideField.caretIconsArr.pop();

    //このボタンが選択されている状態にする
    //子供項目から戻るとき
    const childrenPreBtnIdx = 1;
    const fatherPreBtnIdx = 2;
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
 * 配偶者項目を表示する
 * @param {number} btnIdx 押された次へボタンのインデックス
 * @param {element array} Qs 対象の項目の質問欄
 * @param {element} nextBtn 次へボタン
 */
function setSpouseRbEvent(btnIdx, Qs, nextBtn){
    const yes = 0;
    const no = 1;
    const inputIdxsArr = [
        0,
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
        [9, 10]
    ]
    const nameIdx = 0;
    const isExistIdx = 1;
    const isLiveIdx = 2;
    const isStepChildIdx = 3;
    const isRefuseIdx = 4;
    const isJapanIdx = 5;

    nextBtn.disabled = true;
    inputsField.errorMessagesElArr[isStepChildIdx].style.display = hidden;
    inputsField.errorMessagesElArr[isStepChildIdx].innerHTML = "";

    //死亡時存在true
    if(btnIdx === inputIdxsArr[isExistIdx][yes]){
        
        //ラジオボタンの入力が未了であることを維持するために適当なラジオボタンの要素を追加しておく
        if(invalidElArr.indexOf(requiredInputArr[inputIdxsArr[isExistIdx][yes]]) === -1) 
            invalidElArr.push(requiredInputArr[inputIdxsArr[isExistIdx][yes]]);

        //次の入力欄を表示する
        slideDown(Qs[isLiveIdx]);

    }else if(btnIdx === inputIdxsArr[isExistIdx][no]){
        //false

        //氏名欄以外を削除する
        invalidElArr = invalidElArr.filter(x => x === requiredInputArr.indexOf(nameIdx));
        //氏名欄が入力されているとき、次へボタンを有効化
        if(invalidElArr.length === 0) nextBtn.disabled = false;

        //3問目以降のボタンを全て初期化
        for(let i = inputIdxsArr[isLiveIdx][yes]; i < requiredInputArr.length; i++){
            requiredInputArr[i].checked = false;
        }
        //3問目以降を全て非表示にする
        for(let i = isLiveIdx; i < Qs.length; i++){
            slideUp(Qs[i]);
        }

    }else if(btnIdx === inputIdxsArr[isLiveIdx][yes]){
        //手続時存在true

        if(invalidElArr.indexOf(requiredInputArr[inputIdxsArr[isExistIdx][yes]]) === -1) 
            invalidElArr.push(requiredInputArr[inputIdxsArr[isExistIdx][yes]]);

        //相続放棄欄を表示する
        slideDown(Qs[isRefuseIdx]);

        //連れ子欄を非表示かつボタンを初期化
        requiredInputArr[inputIdxsArr[isStepChildIdx][yes]].checked = false;
        requiredInputArr[inputIdxsArr[isStepChildIdx][no]].checked = false;
        slideUp(Qs[isStepChildIdx])

    }else if(btnIdx === inputIdxsArr[isLiveIdx][no]){
            //false

            if(invalidElArr.indexOf(requiredInputArr[inputIdxsArr[isExistIdx][yes]]) === -1) 
                invalidElArr.push(requiredInputArr[inputIdxsArr[isExistIdx][yes]]);

            //連れ子欄を表示
            slideDown(Qs[isStepChildIdx]);

            //相続放棄欄以降を非表示にしてボタンを初期化
            for(let i = isRefuseIdx; i < Qs.length; i++){
                slideUp(Qs[i]);
            }
            requiredInputArr[inputIdxsArr[isRefuseIdx][yes]].checked = false;
            requiredInputArr[inputIdxsArr[isRefuseIdx][no]].checked = false;
            requiredInputArr[inputIdxsArr[isJapanIdx][yes]].checked = false;
            requiredInputArr[inputIdxsArr[isJapanIdx][no]].checked = false;

    }else if(btnIdx === inputIdxsArr[isStepChildIdx][yes]){
        //連れ子true

        //システム対応外であることを表示する
        if(invalidElArr.indexOf(requiredInputArr[inputIdxsArr[isExistIdx][yes]]) === -1) 
            invalidElArr.push(requiredInputArr[inputIdxsArr[isExistIdx][yes]]);

        inputsField.errorMessagesElArr[isStepChildIdx].style.display = display;
        inputsField.errorMessagesElArr[isStepChildIdx].innerHTML = "本システムでは対応できません";
        nextBtn.disabled = false;

    }else if(btnIdx === inputIdxsArr[isStepChildIdx][no]){
        //false

        //名前が入力されているときは次へボタンを有効化する
        invalidElArr = invalidElArr.filter(x => x === requiredInputArr[nameIdx]);
        if(invalidElArr.length === 0) nextBtn.disabled = false;

    }else if(btnIdx === inputIdxsArr[isRefuseIdx][yes]){
        //相続放棄true

        //名前が入力されているときは次へボタンを有効化する
        invalidElArr = invalidElArr.filter(x => x === requiredInputArr[nameIdx]);
        if(invalidElArr.length === 0) nextBtn.disabled = false;

        slideUp(Qs[isJapanIdx]);
        requiredInputArr[inputIdxsArr[isJapanIdx][yes]].checked = false;
        requiredInputArr[inputIdxsArr[isJapanIdx][no]].checked = false;

    }else if(btnIdx === inputIdxsArr[isRefuseIdx][no]){
        //false

        if(invalidElArr.indexOf(requiredInputArr[inputIdxsArr[isExistIdx][yes]]) === -1) 
            invalidElArr.push(requiredInputArr[inputIdxsArr[isExistIdx][yes]]);

        //次の入力欄を表示する
        slideDown(Qs[isJapanIdx]);

    }else{
        //日本在住(true、false同じ処理)

        //名前が入力されているときは次へボタンを有効化する
        invalidElArr = invalidElArr.filter(x => x === requiredInputArr[nameIdx]);
        if(invalidElArr.length === 0) nextBtn.disabled = false;
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
        //ラジオボタン欄のとき

        //配偶者項目のとき
        if(fieldset.classList.contains("spouseFieldset")){
            requiredInputArr[i].addEventListener("change",(e)=>{
                setSpouseRbEvent(i, Qs, nextBtn);
            })
        }else{

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
    
    const inputIdxsArr =[
        [0, 1],
        2,
        [3, 4],
        [5, 6],
        [7, 8],
        [9, 10]
    ]
    const isExistIdx = 0;
    const countIdx = 1;
    const isSameParentsIdx = 2;
    const isLiveIdx = 3;
    const isAdultIdx = 4;
    const isJapanIdx = 5;
    const yes = 0;
    const no = 1;

    //子供存在true
    if(i === inputIdxsArr[isExistIdx][yes]){

        requiredInputArr[i].addEventListener("change", (e)=>{
            //エラー要素に適当なボタン要素を追加する
            if(invalidElArr.indexOf(requiredInputArr[inputIdxsArr[countIdx]]) === -1)
                invalidElArr.push(requiredInputArr[inputIdxsArr[countIdx]]);

            //人数入力欄を表示する
            requiredInputArr[inputIdxsArr[countIdx]].value = "1";
            slideDown(Qs[countIdx]);
            slideDown(Qs[isSameParentsIdx]);

            //いないボタンからいるボタンが押されたときは、次へボタンを無効化して子供いないフラグをfalseにする
            nextBtn.disabled = true;
            isNoChild = false;
        })

    }else if(i === inputIdxsArr[isExistIdx][no]){
        //子供存在false

        requiredInputArr[i].addEventListener("change", (e)=>{
            invalidElArr.length = 0

            //他の欄を非表示にして入力値を初期化
            for(let i = inputIdxsArr[countIdx]; i < requiredInputArr.length; i++){
                if(i === inputIdxsArr[countIdx])
                    requiredInputArr[i].value = "0";
                else
                    requiredInputArr[i].checked = false;
            }
            for(let i = countIdx; i < Qs.length; i++){
                slideUp(Qs[i]);
            }

            //次へボタンを有効化して子供なしフラグをtrueにする
            nextBtn.disabled = false;
            isNoChild = true;
        })


    }else if(i === inputIdxsArr[countIdx]){
        //人数欄

        const minusBtn = Qs[countIdx].getElementsByClassName("decreaseBtn")[0];
        const plusBtn = Qs[countIdx].getElementsByClassName("increaseBtn")[0];
        let intervalId;
        
        requiredInputArr[i].addEventListener("change", (e)=>{
            let val = e.target.value;

            //整数チェック
            isValid = isNumber(val, e.target);
            //整数のとき
            if(isValid){
                //16人以上チェック
                if(parseInt(val) > 15){
                    sort("false", inputsField.errorMessagesElArr[countIdx], "上限は１５人までです", requiredInputArr[i], nextBtn);
                }else if(parseInt(val) === 0){
                    sort("false", inputsField.errorMessagesElArr[countIdx], "いない場合は上の質問で「いいえ」を選択してください", requiredInputArr[i], nextBtn);
                    val = 1;
                }else{
                    sort(isValid, inputsField.errorMessagesElArr[countIdx], "", requiredInputArr[i], nextBtn);
                }
            }
            else{
                sort("false", inputsField.errorMessagesElArr[countIdx], "入力必須です", requiredInputArr[i], nextBtn)
            }

            if(isValid === false)
                val = 1;

            //１のときマイナスボタンは無効化
            minusBtn.disabled = parseInt(val) < 2 ? true: false;

            //１５以上が入力されているときプラスボタンを無効化
            plusBtn.disabled = parseInt(val) > 15 ? true: false;
                
        })

        requiredInputArr[i].addEventListener("keydown",(e)=>{
            //Enterで次にフォーカス
            if(e.key === "Enter"){
                e.preventDefault();
                requiredInputArr[i + 1].focus();
            }else if(!(e.key >= 0 && e.key <= 9 || e.key === "Backspace" || e.key === "Delete")){
                //数字又はバックスペースとデリート以外は使用不可
                e.preventDefault()
            }
        })

        requiredInputArr[i].addEventListener("input", (e)=>{
            //３文字以上入力不可
            e.target.value = e.target.value.slice(0,2);
        })

        //マイナスボタン
        minusBtn.addEventListener("click",(e)=>{
            let val = parseInt(requiredInputArr[i].value);

            if(val > 1){
                val -= 1;
                requiredInputArr[i].value = val;
            }else{
                requiredInputArr[i].value = "1";
                clearInterval(intervalId);
            }
            plusBtn.disabled = val > 15 ? true: false;
            minusBtn.disabled = val < 2 ? true: false;
        })
        minusBtn.addEventListener("mousedown",(e)=>{
            intervalId = setInterval(function(){
                let val = parseInt(requiredInputArr[i].value);

                if(val > 1){
                    val -= 1;
                    requiredInputArr[i].value = val;
                }else{
                    requiredInputArr[i].value = "1";
                    clearInterval(intervalId);
                }
                plusBtn.disabled = val > 15 ? true: false;
                minusBtn.disabled = val < 2 ? true: false;
            }, 200)
        })
        minusBtn.addEventListener("mouseup", ()=>{
            clearInterval(intervalId);
        })

        //プラスボタン
        plusBtn.addEventListener("click",(e)=>{
            let val = parseInt(requiredInputArr[i].value);

            if(val < 15){
                val += 1;
                requiredInputArr[i].value = val;
            }
            plusBtn.disabled = val > 15 ? true: false;
            minusBtn.disabled = val < 2 ? true: false;
        })
        plusBtn.addEventListener("mousedown",(e)=>{
            intervalId = setInterval(function(){
                let val = parseInt(requiredInputArr[i].value);
    
                if(val < 15){
                    val += 1;
                    requiredInputArr[i].value = val;
                }
                plusBtn.disabled = val > 15 ? true: false;
                minusBtn.disabled = val < 2 ? true: false;
            }, 200)
        })
        plusBtn.addEventListener("mouseup", ()=>{
            clearInterval(intervalId);
        })

    }else if(inputIdxsArr[isSameParentsIdx].includes(i)){
        //同じ配偶者のtrue又はfalse
        requiredInputArr[i].addEventListener("change", (e)=>{
            //次の質問を表示する
            if(Qs[isLiveIdx].style.display === hidden)
                slideDown(Qs[isLiveIdx]);
        })
    }else if(inputIdxsArr[isLiveIdx].includes(i)){
        //手続時生存のtrue又はfalse
        requiredInputArr[i].addEventListener("change", (e)=>{
            //次の質問を表示する
            if(Qs[isAdultIdx].style.display === hidden)
                slideDown(Qs[isAdultIdx]);
        })
    }else if(inputIdxsArr[isAdultIdx].includes(i)){
        //成人true又はfalse
        requiredInputArr[i].addEventListener("change", (e)=>{
            //次の質問を表示する
            if(Qs[isJapanIdx].style.display === hidden)
                slideDown(Qs[isJapanIdx]);
        })
    }else{
        //日本在住true又はfalse
        requiredInputArr[i].addEventListener("change", (e)=>{
            invalidElArr = invalidElArr.filter(x => x === requiredInputArr[countIdx]);
            if(invalidElArr.length === 0) nextBtn.disabled = false;
        })
    }
}

/**
 * 次の項目とガイドの次の項目を有効化して前の項目を無効化する
 * @param {number} fromNextBtnIdx 押された次へボタンのインデックス
 */
function oneStepFoward(fromNextBtnIdx, isIndivisual){

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
    //個人入力欄のとき
    if(["spouseFieldset", "motherGmotherFieldset"].includes(fieldset.id)){
        oneStepFowardHandler = function () {oneStepFoward(fromNextBtnIdx + 1, false)};
    }else{
        //子全員又は兄弟姉妹全員入力欄のとき
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
            sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[decendantColumnIdx]);

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
inputsField.nextBtnsArr[decendantColumnIdx].addEventListener("click",(e)=>{

    //被相続人欄の入力値を全てチェックする
    for(let i = 0; i < requiredInputArr.length; i++){
        isValid = decedentFormValidationList(requiredInputArr[i].value, requiredInputArr[i])
        sort(isValid, inputsField.errorMessagesElArr[i], isValid, requiredInputArr[i], inputsField.nextBtnsArr[decendantColumnIdx])
    }

    //エラーがあるときは、処理を中止
    if(invalidElArr.length > 0){
        e.preventDefault();
        invalidElArr[0].focus();
    }
    
    //チェックを通ったときは、次へ入力欄を有効化する
    oneStepFoward(decendantColumnIdx, true);
})


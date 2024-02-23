reqInputs = [oldpassword, password1, password2];
msgEls = [oldpasswordMessageEl, password1MessageEl, password2MessageEl];
msgs = [oldpasswordMessage, password1Message, password2Message];

/**
 * バリデーションリスト
 * @param {number} index 
 */
function validationList(index){
    invalidEls = invalidEls.filter(x => x !== reqInputs[index]);

    //各欄のバリデーション
    if(index === oldpasswordIndex){
        verificatePassword(reqInputs[index].value, reqInputs[index]);
        return;
    }
    else if(index === password1Index){
        isValid = checkPassword(reqInputs[index].value, reqInputs[index]);
    }else if(index === password2Index){
        isValid = password1.value === password2.value ? true: false;
    } 

    //エラーメッセージトグル
    toggleErrorMessage(isValid, msgEls[index], msgs[index]);
    
    //エラーが有るときは、その要素を取得し、適切なときは削除する
    if(isValid === false) invalidEls.push(reqInputs[index]);
}

/**
 * 入力されたパスワードと登録されているパスワードを照合する
 * @param {string} val 
 */
function verificatePassword(val){
    const url = 'is_oldpassword';
    const verifyingEl = `<span id="id_oldpassword_verifyingEl" class="verifying emPosition">
                    照合中
                    <div class="spinner-border text-white spinner-border-sm" role="status">
                    </div>
                    </span>`;
    oldpassword.insertAdjacentHTML('afterend', verifyingEl);

    fetch(url, {
        method: 'POST',
        body: `oldpassword=${val}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': csrftoken,
        },
        mode: "same-origin"
    }).then(response => {
        return response.json();
    }).then(response => {
        if(response.is_valid){
            toggleErrorMessage(true, msgEls[oldpasswordIndex]);
        }else{
            toggleErrorMessage(false, msgEls[oldpasswordIndex], oldpasswordMessage);
            invalidEls.push(reqInputs[oldpasswordIndex]);
        }
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        document.getElementById("id_oldpassword_verifyingEl").remove();
    });
}

/**
 * イベント
 */
window.addEventListener("load", ()=>{

    for(let i = 0; i < reqInputs.length; i++){
        //フォーカス移動イベント
        reqInputs[i].addEventListener("keypress", (e)=>{
            if(e.code === "Enter" || e.code === "NumpadEnter"){
                e.preventDefault();
                e.target === password2 ? submitBtn.focus(): reqInputs[i + 1].focus();
            }
        })

        //各入力欄にバリデーションを設定
        reqInputs[i].addEventListener("change",(e)=>{
            validationList(i);
            if(reqInputs[i] === password1) togglePassword2();
        })

        //入力中はエラー表示を消す
        reqInputs[i].addEventListener("input", ()=>{
            msgEls[i].style.display = "none";
        })

        //モデルのバリデーションでエラーが出たとき用
        if(errorlist !== null) validationList(i);
    }

    //パスワード1が空欄又はエラーメッセージが出ているとき
    if(errorlist !== null){
        togglePassword2();
        if(invalidEls.length > 0) invalidEls[0].focus();
    }
})

//フォーム
form.addEventListener("submit", (e)=>{

    // 送信前に各入力欄をチェックする
    for(let i = 0; i < reqInputs.length; i++){
        validationList(i);
    }

    //エラーがあるときは、そのうちの最初のエラー入力欄にフォーカスして送信をやめる
    if(invalidEls.length > 0){
        invalidEls[0].focus();
        e.preventDefault();
    } 
})
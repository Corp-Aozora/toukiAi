"use strict";

/**
 * カード情報の送信エラーセッション
 */
class CardInfoError{

    constructor(){
        this.count = parseInt(sessionStorage.getItem("card_info_error")) || 0;
        this.time = parseInt(sessionStorage.getItem("card_info_limit_time")) || 0;

        this.limitCount = 3;
        this.duration = 15 * 60 * 1000;

        // 制限時間を経過しているときは初期化
        const now = new Date().getTime();
        if(this.time <= now){
            this.clear();
        }
    }

    // エラー情報を取得
    set(){
        const now = new Date().getTime();

        this.count += 1;
        sessionStorage.setItem("card_info_error", this.count);

        this.time = now + this.duration;
        sessionStorage.setItem("card_info_limit_time", this.time);
    }

    // 制限チェック
    isValid(){
        const now = new Date().getTime();

        if(this.count >= this.limitCount && now < this.time)
            return "受付できませんでした。\nカード情報の送信回数制限に達しました。\nお手数ですが、15分ほど時間を空けてから再度お試しください。";

        return true;
    }

    // セッションを初期化
    clear(){
        this.count = 0;
        sessionStorage.removeItem("card_info_error");

        this.time = 0;
        sessionStorage.removeItem("card_info_limit_time");
    }
}
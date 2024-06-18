"use strict";

window.addEventListener("load", ()=>{

    class Form{
        constructor(){
            this.preBtn = document.getElementById("preBtn");
            this.preBtnSpinner = document.getElementById("preBtnSpinner");

            this.setEvent();
        }

        setEvent(){
            this.preBtn.addEventListener("click", ()=>{
                handlePreBtnEvent(progress);
            })
        }
    }

    new Form();
    updateSideBar();
})
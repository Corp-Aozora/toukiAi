"use strict";

const linkToProgress = document.getElementById("linkToProgress");
const linkToProgressArea = document.getElementById("linkToProgressArea");
const logout = document.querySelector("#logout");
/**
 * 以下、イベント
 */
// logo.addEventListener("mouseover", ()=>{
//     logo.classList.remove("text-dark");
//     emphasizeText(logo);
// })

// logo.addEventListener("mouseout", ()=>{
//     logo.classList.add("text-dark");
//     removeEmphasizeText(logo);
// })

if(logout){
    logout.addEventListener("click", ()=>{
        const date1 = new Date();
        const date2 = date1.getHours() + "時" + 
                    date1.getMinutes() + "分" + 
                    date1.getSeconds() + "秒"
        sessionStorage.setItem("logout", "true");
        sessionStorage.setItem("lastUpdateDate", date2);
    })
}
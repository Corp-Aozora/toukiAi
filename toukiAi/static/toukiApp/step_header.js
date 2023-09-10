"use strict";

const linkToAccount = document.getElementById("linkToAccount");
const linkToAccountArea = document.getElementById("linkToAccountArea");
const linkToProgress = document.getElementById("linkToProgress");
const linkToProgressArea = document.getElementById("linkToProgressArea");
const thirdStepWrap = document.getElementById("thirdStepWrap");
const logoArea = document.getElementById("logoArea");
const logo = document.getElementById("logo");
const logoutArea = document.getElementById("logoutArea");
const logout = document.getElementById("logout");

/**
 * 以下、イベント
 */
linkToAccount.addEventListener("mouseover", ()=>{
    linkToAccount.classList.remove("text-dark");
    emphasizeText(linkToAccount);
})

linkToAccount.addEventListener("mouseout", ()=>{
    linkToAccount.classList.add("text-dark");
    removeEmphasizeText(linkToAccount);
})

logo.addEventListener("mouseover", ()=>{
    logo.classList.remove("text-dark");
    emphasizeText(logo);
})

logo.addEventListener("mouseout", ()=>{
    logo.classList.add("text-dark");
    removeEmphasizeText(logo);
})

logout.addEventListener("click", ()=>{
    const date1 = new Date();
	const date2 = date1.getHours() + "時" + 
				date1.getMinutes() + "分" + 
				date1.getSeconds() + "秒"
    sessionStorage.setItem("logout", "true");
    sessionStorage.setItem("lastUpdateDate", date2);
})
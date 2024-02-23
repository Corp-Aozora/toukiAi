function adjustToScreenSize(){
    const companyInfo = document.getElementById("companyInfo");
    const clientWidth = document.documentElement.clientWidth;

    if(clientWidth < lgWidth){
        companyInfo.classList.add("text-center");
    }else{
        companyInfo.classList.remove("text-center");
    }
}

window.addEventListener("load", ()=>{
    adjustToScreenSize();
})

window.addEventListener("resize", ()=>{
    adjustToScreenSize();
})
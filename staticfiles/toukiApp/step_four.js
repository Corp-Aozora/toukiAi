"use strict";

function initialize(){
    updateSideBar();
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
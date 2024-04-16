function adjustModalScale() {
    const modal = document.getElementById('condition_diagram_modal');
    let screenWidth = window.innerWidth;
    let scale = screenWidth / 820; // 820px が基準サイズ
  
    // スケールが1未満の場合のみ適用、それ以上は1（100%）に固定
    scale = scale < 1 ? scale : 1;
  
    modal.style.transform = `scale(${scale})`;
    modal.style.transformOrigin = 'top center';
}

window.addEventListener("load", adjustModalScale);
window.addEventListener("resize", adjustModalScale);
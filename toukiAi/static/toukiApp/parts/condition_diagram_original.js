function adjustModalScale() {
    const modal = document.getElementById('condition_diagram_modal');
    let screenWidth = window.innerWidth;
    let scale = screenWidth / 820; // 820px が基準サイズ
  
    // スケールが1未満の場合のみ適用、それ以上は1（100%）に固定
    scale = scale < 1 ? scale : 1;
  
    modal.style.transform = `scale(${scale})`;
    modal.style.transformOrigin = 'top center';

    // スケールに基づいて高さも調整
    // if (scale < 1) {
    //     modal.style.height = `calc(100vh / ${scale})`;
    // } else {
    //     modal.style.height = 'auto';  // スケールが1の場合は元の高さに戻す
    // }
}

window.addEventListener("load", adjustModalScale);
window.addEventListener("resize", adjustModalScale);
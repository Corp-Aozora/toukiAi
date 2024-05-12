"use strict";

/**
 * 要素の途中で改ページされるときは、その要素全体を次のページに表示させる
 * @param {number} marginTop 
 * @param {number} marginBottom 
 */
function preventElementSplitOnPageBreak(marginTop, marginBottom) {

    // マージンをピクセル単位で計算（上20mm、下10mm）
    const usableHeight = 1226 - marginTop - marginBottom; // A4の高さ（1126）- 上下のマージン

    // 対象の要素（.signature）の位置を取得し、改ページ判断を行う
    const elements = document.querySelectorAll('.print_per_section .signature');
    elements.forEach(el => {

        // 親要素内での相対的な位置を計算
        const parentRect = el.closest('.print_per_section').getBoundingClientRect();
        const childRect = el.getBoundingClientRect();
        const relativeTop = childRect.top - parentRect.top;

        // 署名欄がページをまたぐとき
        if(Math.floor(relativeTop / usableHeight) !== Math.floor((relativeTop + childRect.height) / usableHeight)){
            el.style.pageBreakBefore = 'always'; // 要素の直前で改ページ
        } else {
            el.style.pageBreakBefore = 'auto'; // デフォルトの挙動
        }
    });
};

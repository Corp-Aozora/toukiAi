"use strict";

/**
 * リサイズされたとき、線の位置を更新する
 */
window.addEventListener("resize", ()=>{
    const svgContainers = document.getElementsByClassName("svgContainer");
    for(let i = 0, len = svgContainers.length; i < len; i++){
        const svgContainer = svgContainers[i];
        while(svgContainer.firstChild){
            svgContainer.removeChild(svgContainer.firstChild);
        }
    }
    drawAllLine();
})

/**
 * ロード後に相関関係を示す線を描画する
 */
document.addEventListener("DOMContentLoaded", ()=>{
    drawAllLine();
})

//隠しインプットのインデックス
const idx = {
    "type": 0,
    "id": 1,
    "relation_type1": 2,
    "relation_id1": 3,
    "relation_type2": 4,
    "relation_id2": 5,
}

/**
 * 関係を示す線を全て描画する
 */
function drawAllLine(){
    const contents = document.getElementsByClassName('content');
    const svgContainers = document.getElementsByClassName('svgContainer');
    const decedents = document.getElementsByClassName('decedent');
    for(let i = 0, len = contents.length; i < len; i++){
        const content = contents[i];
        const contentRect = contents[i].getBoundingClientRect();
        const svgContainer = svgContainers[i];

        //被相続人と前配偶者を結ぶ線
        relateDecedentAndExSpouses(content, contentRect, svgContainer, decedents[i]);
        //祖父母と父母を結ぶ線
        drawGrandParentsGen(content, contentRect, svgContainer);
        //父母世代の線を描画する
        drawParentsGen(content, contentRect, svgContainer);

        //被相続人と配偶者から子へのライン
        const decedentSpouseLines = content.getElementsByClassName("decedent_spouse_line");
        const childs = content.getElementsByClassName("child");
        if(decedentSpouseLines.length > 0 && childs.length > 0){
            const decedentSpouseLineRect = content.getElementsByClassName("decedent_spouse_line")[0].getBoundingClientRect();
            twoGenLine(contentRect, svgContainer, decedentSpouseLineRect, childs);
        }

        //被相続人と前配偶者から連れ子へのライン
        //対象の前配偶者と一致する連れ子を判別する
        const stepChilds = content.getElementsByClassName("step_child");
        if(stepChilds.length > 0){
            const decedentExSpouseLines = content.getElementsByClassName("decedent_ex_spouse_single_line");
            const exSpouses = content.getElementsByClassName("ex_spouse");
            for(let i = 0, len1 = exSpouses.length; i < len1; i++){
                const exSpouseInputs = exSpouses[i].querySelectorAll("input");
                const targetStepChilds = [];
                for(let j = 0, len2 = stepChilds.length; j < len2; j++){
                    const stepChild = stepChilds[j];
                    const stepChildInputs = stepChild.querySelectorAll("input");
                    if(exSpouseInputs[idx["relation_id1"]].value === stepChildInputs[idx["id"]].value){
                        targetStepChilds.push(stepChild);
                    }
                }
                const decedentExSpouseLineRect = decedentExSpouseLines[i].getBoundingClientRect();
                twoGenLine(contentRect, svgContainer, decedentExSpouseLineRect, targetStepChilds);
            }

            //２人以上いるときはラインを変更する必要がある！
        }

        //子から子の前配偶者へのライン
        const childExSpouses = content.getElementsByClassName('child_ex_spouse');
        if(childExSpouses.length > 0){
            for(let i = 0, len = childs.length; i < len; i++){
                const child = childs[i];
                const childInputs = child.querySelectorAll("input");
                const targetChildExSpouses = [];
                for(let j = 0, len2 = childExSpouses.length; j < len2; j++){
                    const childExSpouse = childExSpouses[j];
                    const exInputs = childExSpouse.inputs;
                    if(childInputs[idx["id"]].value === exInputs[idx["relation_id1"]].value){
                        targetChildExSpouses.push(childExSpouse);
                    }
                }
                const childRect = child.getBoundingClientRect();
                sameGenLine(contentRect, svgContainer, childRect, targetChildExSpouses);
            }

            //子と子の前配偶者から子の連れ子へのライン
            //対象の前配偶者と一致する連れ子を判別する
            const stepGrandChilds = content.getElementsByClassName("step_grand_child");
            if(stepGrandChilds.length > 0){
                for(let i = 0, len1 = childExSpouses.length; i < len1; i++){
                    const childExSpouseInputs = childExSpouses[i].querySelectorAll("input");
                    const targetStepGrandChilds = [];
                    for(let j = 0, len2 = stepGrandChilds.length; j < len2; j++){
                        const stepGrandChild = stepGrandChilds[j];
                        const stepGrandChildInputs = stepGrandChild.querySelectorAll("input");
                        if(childExSpouseInputs[idx["relation_id1"]].value === stepGrandChildInputs[idx["id"]].value){
                            targetStepGrandChilds.push(stepGrandChild);
                        }
                    }
                    const childEXSpoouseLineRect = childExSpouses[i].getBoundingClientRect();
                    temp(contentRect, svgContainer, childEXSpoouseLineRect, targetStepGrandChilds);
                }
            }
        }
    
        //子と子の配偶者から孫へのライン
        const childGen = content.getElementsByClassName("child_gen")[0];
        const childSpouses = content.getElementsByClassName("child_spouse");
        const grandChilds = content.getElementsByClassName("grand_child");
        if(childSpouses.length > 0 && grandChilds.length > 0){
            const childSpouseLines = childGen.getElementsByClassName("double_line");
            for(let i = 0, len1 = childSpouses.length; i < len1; i++){
                const childSpouseInputs = childSpouses[i].querySelectorAll("input");
                const targetGrandChilds = [];
                for(let j = 0, len2 = grandChilds.length; j < len2; j++){
                    const grandChild = grandChilds[j];
                    const grandChildInputs = grandChild.querySelectorAll("input");
                    if(childSpouseInputs[idx["id"]].value === grandChildInputs[idx["relation_id2"]].value){
                        targetGrandChilds.push(grandChild);
                    }
                }
                const childSpouseLineRect = childSpouseLines[i].getBoundingClientRect();
                twoGenLine(contentRect, svgContainer, childSpouseLineRect, targetGrandChilds);
            }
        }
    }
}

/**
 * 被相続人と前配偶者をつなぐ線
 * １人目の前配偶者はhtmlで表示しているため２人目以降に対する処理
 */
function relateDecedentAndExSpouses(content, contentRect, svgContainer, decedent){
    const exSpouses = content.getElementsByClassName('ex_spouse');
    if(exSpouses.length > 1){
        const decedentRect = decedent.getBoundingClientRect();
        sameGenLine(contentRect, svgContainer, decedentRect, exSpouses, true);
    }
}

/**
 * 祖父母の世代の線を描画する
 * @param {*} content 
 * @param {*} contentRect 
 * @param {*} svgContainer 
 */
function drawGrandParentsGen(content, contentRect, svgContainer){
    const gen = content.getElementsByClassName("grand_parents_gen")[0];
    if(gen){
        const fromEls = gen.getElementsByClassName("grand_parents");
        const doubleLines = gen.getElementsByClassName("double_line");
        const toEls = content.getElementsByClassName("parents");
        for(let i = 0, len = fromEls.length; i < len; i += 2){
            const fromInputs = fromEls[i].querySelectorAll("input");
            for(let j = 0, len2 = toEls.length; j < len2; j++){
                const toEl = toEls[j];
                const toElInputs = toEl.querySelectorAll("input");
                if(fromInputs[idx["relation_id1"]].value === toElInputs[idx["id"]].value){
                    const doubleLineRect = doubleLines[j].getBoundingClientRect();
                    twoGenLine(contentRect, svgContainer, doubleLineRect, [toEl]);
                }
            }
        }
    }
}

/**
 * 父母の世代の線を描画する
 * @param {*} content 
 * @param {*} contentRect 
 * @param {*} svgContainer 
 */
function drawParentsGen(content, contentRect, svgContainer){
    const gen = content.getElementsByClassName("parents_gen")[0];
    if(gen){
        //父母から被相続人（と兄弟姉妹）を結ぶ線
        const doubleLine = gen.getElementsByClassName("double_line")[0];
        const doubleLineRect = doubleLine.getBoundingClientRect();
        const isFullCollateral = content.getElementsByClassName("full_collateral").length > 0;
        const targets = content.querySelectorAll(isFullCollateral? '.full_collateral, .decedent': ".decedent");
        twoGenLine(contentRect, svgContainer, doubleLineRect, targets);

        //異父母から父又は母へのライン
        const halfParents = gen.getElementsByClassName('half_parents');
        if(halfParents.length > 0){
            const parents = gen.getElementsByClassName("parents");
            for(let i = 0, len = parents.length; i < len; i++){
                const parent = parents[i];
                const parentInputs = parent.querySelectorAll("input");
                const targetHalfParents = [];
                for(let j = 0, len2 = halfParents.length; j < len2; j++){
                    const halfParent = halfParents[j];
                    const halfParentInputs = halfParent.inputs;
                    if(parentInputs[idx["id"]].value === halfParentInputs[idx["relation_id1"]].value){
                        targetHalfParents.push(halfParent);
                    }
                }
                const parentRect = parent.getBoundingClientRect();
                sameGenLine(contentRect, svgContainer, parentRect, targetHalfParents);
            }
            //異父母から半血兄弟へのライン
            //対象の前配偶者と一致する連れ子を判別する
            const halfCollaterals = content.getElementsByClassName("half_collateral");
            if(halfCollaterals.length > 0){
                for(let i = 0, len1 = halfParents.length; i < len1; i++){
                    const halfParentInputs = halfParents[i].querySelectorAll("input");
                    const targetHalfCollaterals = [];
                    for(let j = 0, len2 = halfCollaterals.length; j < len2; j++){
                        const halfCollateral = halfCollaterals[j];
                        const halfCollateralInputs = halfCollateral.querySelectorAll("input");
                        if(halfParentInputs[idx["relation_id1"]].value === halfCollateralInputs[idx["id"]].value){
                            targetHalfCollaterals.push(halfCollateral);
                        }
                    }
                    const halfParentLineRect = halfParentInputs[i].getBoundingClientRect();
                    temp2(contentRect, svgContainer, halfParentLineRect, targetHalfCollaterals);
                }
            }
        }
    }
}

/**
 * 被相続人と配偶者から子へのライン
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} fromRect 
 * @param {*} toEls 
 */
function temp2(contentRect, svgContainer, fromRect, toEls){
    for(let i = 0, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();
        // 親要素を基準にした子要素の相対位置を算出
        const fromX = fromRect.right - contentRect.left + 20;
        const fromY = fromRect.top - contentRect.top + fromRect.height -15;
        const addHeight = 85; 
        const toY = addHeight + fromY;
        //二重線の中央から下線を70px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);
        //二重線の中央から70px上を起点として対象の要素の真ん中まで横線を伸ばす（1番左端の子のときのみ）
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        if(i === 0)
            drawLine(svgContainer, fromX, toY, toRectCenter, toY);
        //対象の要素の真ん中へ下線を書く
        drawLine(svgContainer, toRectCenter, toY, toRectCenter, toY + 15)
    }
}

/**
 * 被相続人と配偶者から子へのライン
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} fromRect 
 * @param {*} toEls 
 */
function temp(contentRect, svgContainer, fromRect, toEls){
    for(let i = 0, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();
        // 親要素を基準にした子要素の相対位置を算出
        const fromX = fromRect.left - contentRect.left - 20;
        const fromY = fromRect.top - contentRect.top + fromRect.height -15;
        const addHeight = 85; 
        const toY = addHeight + fromY;
        //二重線の中央から下線を70px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);
        //二重線の中央から70px上を起点として対象の要素の真ん中まで横線を伸ばす（1番左端の子のときのみ）
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        if(i === 0)
            drawLine(svgContainer, fromX, toY, toRectCenter, toY);
        //対象の要素の真ん中へ下線を書く
        drawLine(svgContainer, toRectCenter, toY, toRectCenter, toY + 15)
    }
}

/**
 * 被相続人と配偶者から子へのライン
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} fromRect 
 * @param {*} toEls 
 */
function twoGenLine(contentRect, svgContainer, fromRect, toEls){
    for(let i = 0, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();
        // 親要素を基準にした子要素の相対位置を算出
        const fromX = fromRect.left - contentRect.left + fromRect.width / 2;
        const fromY = fromRect.top - contentRect.top + fromRect.height;
        const addHeight = 70; 
        const toY = addHeight + fromY;
        //二重線の中央から下線を70px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);
        //二重線の中央から70px上を起点として対象の要素の真ん中まで横線を伸ばす（1番左端の子のときのみ）
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        if(i === 0)
            drawLine(svgContainer, fromX, toY, toRectCenter, toY);
        //対象の要素の真ん中へ下線を書く
        drawLine(svgContainer, toRectCenter, toY, toRectCenter, toY + 15)
    }
}

/**
 * 対象の人と前配偶者のラインを書く
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} fromRect 
 * @param {HTMLCollection} toEls 
 */
function sameGenLine(contentRect, svgContainer, fromRect, toEls, isDecedent = false){
    //被相続人と前配偶者の場合は、1人目の前配偶者との間にデフォルトの横線があるため2人目からループ処理
    for(let i = isDecedent? 1: 0, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();
        // 親要素を基準にした子要素の相対位置を算出
        const fromY = fromRect.top - contentRect.top;
        const fromX = fromRect.right - contentRect.left;
        const addHeight = -15 * i;
        const toY = fromY + addHeight;
        //ulに右上から上線を15px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);
        //ulの右上から15px上を起点として対象の要素の真ん中まで横線を伸ばす
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        drawLine(svgContainer, fromX, toY, toRectCenter, toY);
        //対象の要素の真ん中
        drawLine(svgContainer, toRectCenter, toY, toRectCenter, fromY + (-1 * addHeight))
    }
}

/**
 * 線を描画する
 * @param {*} svgContainer 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 */
function drawLine(svgContainer, x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'black');
    svgContainer.appendChild(line);
}
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
    writeLine();
})

document.addEventListener("DOMContentLoaded", ()=>{
    writeLine();
})

const idx = {
    "type": 0,
    "id": 1,
    "relation_type1": 2,
    "relation_id1": 3,
    "relation_type2": 4,
    "relation_id2": 5,
}

function writeLine(){
    const contents = document.getElementsByClassName('content');
    const svgContainers = document.getElementsByClassName('svgContainer');

    const decedents = document.getElementsByClassName('decedent');
    for(let i = 0, len = contents.length; i < len; i++){
        const content = contents[i];
        const contentRect = contents[i].getBoundingClientRect();
        const svgContainer = svgContainers[i];
        
        //被相続人と前配偶者（2人目からのライン）
        const decedentRect = decedents[i].getBoundingClientRect();
        const exSpouses = content.getElementsByClassName('ex_spouse');
        sameGenLine(contentRect, svgContainer, decedentRect, exSpouses);

        //父方の祖父母から父へのライン
        //母方の祖父母から母へのライン
        //異父母から父又は母へのライン
        //異父母から半血兄弟へのライン
        //父母から被相続人と全血兄弟姉妹へのライン
        //被相続人と配偶者から子へのライン
        const decedentSpouseLineRect = content.getElementsByClassName("decedent_spouse_line")[0].getBoundingClientRect();
        const childs = content.getElementsByClassName("child");
        twoGenLine(contentRect, svgContainer, decedentSpouseLineRect, childs);

        //被相続人と前配偶者から連れ子へのライン
        //対象の前配偶者と一致する連れ子を判別する
        const decedentExSpouses = content.getElementsByClassName("ex_spouse");
        const decedentExSpouseLines = content.getElementsByClassName("decedent_ex_spouse_single_line");
        const stepChilds = content.getElementsByClassName("step_child");
        for(let i = 0, len1 = decedentExSpouses.length; i < len1; i++){
            const decedentExSpouse = decedentExSpouses[i];
            const decedentExSpouseInputs = decedentExSpouse.querySelectorAll("input");
            const targetStepChilds = [];
            for(let j = 0, len2 = stepChilds.length; j < len2; j++){
                const stepChild = stepChilds[j];
                const stepChildInputs = stepChild.querySelectorAll("input");
                if(decedentExSpouseInputs[idx["relation_id1"]].value === stepChildInputs[idx["id"]].value){
                    targetStepChilds.push(stepChild);
                }
            }
            const decedentExSpouseLineRect = decedentExSpouseLines[i].getBoundingClientRect();
            twoGenLine(contentRect, svgContainer, decedentExSpouseLineRect, targetStepChilds);
        }
        //子から子の前配偶者へのライン
        //子と配偶者から孫へのライン
        const childGen = content.getElementsByClassName("child_gen")[0];
        const childSpouseLines = childGen.getElementsByClassName("double_line");
        const childSpouses = content.getElementsByClassName("child_spouse");
        const grandChilds = content.getElementsByClassName("grand_child");
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
        //子と子の前配偶者から子の連れ子へのライン
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
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        // 親要素を基準にした子要素の相対位置を算出
        const fromX = fromRect.left - contentRect.left + fromRect.width / 2;
        const fromY = fromRect.top - contentRect.top + fromRect.height;
        const addHeight = 70; 
        const toY = addHeight + fromY;
        //ulに右上から上線を15px伸ばす
        line1.setAttribute('x1', fromX);
        line1.setAttribute('y1', fromY);
        line1.setAttribute('x2', fromX);
        line1.setAttribute('y2', toY);
        line1.setAttribute('stroke', 'black');
        svgContainer.appendChild(line1);

        //ulの右上から15px上を起点として対象の要素の真ん中まで横線を伸ばす（1番左端の子のときのみ）
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        if(i === 0){
            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', fromX);
            line2.setAttribute('y1', toY);
            line2.setAttribute('x2', toRectCenter);
            line2.setAttribute('y2', toY);
            line2.setAttribute('stroke', 'black');
            svgContainer.appendChild(line2);
        }

        //対象の要素の真ん中へ下線を書く
        const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line3.setAttribute('x1', toRectCenter);
        line3.setAttribute('y1', toY);
        line3.setAttribute('x2', toRectCenter);
        line3.setAttribute('y2', toY + 15);
        line3.setAttribute('stroke', 'black');
        svgContainer.appendChild(line3);
    }
}

/**
 * 被相続人と前配偶者（2人目から）のラインを書く
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} fromRect 
 * @param {HTMLCollection} toEls 
 */
function sameGenLine(contentRect, svgContainer, fromRect, toEls){
    //1人目の前配偶者はデフォルトの横線があるため2人目からループ処理
    for(let i = 1, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        // 親要素を基準にした子要素の相対位置を算出
        const fromY = fromRect.top - contentRect.top;
        const fromX = fromRect.right - contentRect.left;
        
        const addHeight = -15 * i;
        const toY = fromY + addHeight;
        //ulに右上から上線を15px伸ばす
        line1.setAttribute('x1', fromX);
        line1.setAttribute('y1', fromY);
        line1.setAttribute('x2', fromX);
        line1.setAttribute('y2', toY);
        line1.setAttribute('stroke', 'black');
        svgContainer.appendChild(line1);
    
        //ulの右上から15px上を起点として対象の要素の真ん中まで横線を伸ばす
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', fromX);
        line2.setAttribute('y1', toY);
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        console.log(toRectCenter);
        line2.setAttribute('x2', toRectCenter);
        line2.setAttribute('y2', toY);
        line2.setAttribute('stroke', 'black');
        svgContainer.appendChild(line2);
    
        //対象の要素の真ん中
        const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line3.setAttribute('x1', toRectCenter);
        line3.setAttribute('y1', toY);
        line3.setAttribute('x2', toRectCenter);
        line3.setAttribute('y2', fromY + (-1 * addHeight));
        line3.setAttribute('stroke', 'black');
        svgContainer.appendChild(line3);
    }
}
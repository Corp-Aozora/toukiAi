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
const idxs = {
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

        //祖父母と父母を結ぶ線
        drawGrandParentsGen(content, contentRect, svgContainer);

        //被相続人と前配偶者を結ぶ線
        relateDecedentAndExSpouses(content, contentRect, svgContainer, decedents[i]);

        //被相続人と前配偶者から連れ子へのライン
        drawStepChildLines(content, contentRect, svgContainer);

        //父母世代の線を描画する
        drawParentsGen(content, contentRect, svgContainer);

        //被相続人と配偶者から子へのライン
        drawDecedentSpouseChildLines(content, contentRect, svgContainer);

        //孫へのライン
        const childGen = content.getElementsByClassName("child_gen")[0];
        const grandChilds = content.getElementsByClassName("grand_child");
        // 孫がいるとき
        if(grandChilds.length > 0){

            const childSpouses = content.getElementsByClassName("child_spouse");
            // 子の配偶者がいるとき
            if(childSpouses.length > 0){

                const marriageLines = childGen.getElementsByClassName("double_line");

                // 各子の配偶者に対する処理
                for(let i = 0, len1 = childSpouses.length; i < len1; i++){
                    const cs = childSpouses[i];
                    const csInputs = cs.querySelectorAll("input");
                    const targetGrandChilds = [];

                    for(let j = 0, len2 = grandChilds.length; j < len2; j++){
                        const gc = grandChilds[j];
                        const gcInputs = gc.querySelectorAll("input");

                        if(csInputs[idxs["id"]].value === gcInputs[idxs["relation_id2"]].value){
                            targetGrandChilds.push(gc);
                        }
                    }

                    if(targetGrandChilds.length > 0){
                        const lineRect = marriageLines[i].getBoundingClientRect();
                        twoGenLine(contentRect, svgContainer, lineRect, targetGrandChilds);
                    }
                }
            }
        }

        //子から子の前配偶者へのライン
        const childExSpouses = content.getElementsByClassName('child_ex_spouse');
        if(childExSpouses.length > 0){

            const childs = content.querySelectorAll(".child, .step_child");
            for(let i = 0, len = childs.length; i < len; i++){
                const child = childs[i];
                const childInputs = child.querySelectorAll("input");
                const targetExs = [];

                for(let j = 0, len2 = childExSpouses.length; j < len2; j++){
                    const ex = childExSpouses[j];
                    const exInputs = ex.querySelectorAll("input");

                    if(childInputs[idxs["id"]].value === exInputs[idxs["relation_id2"]].value){
                        targetExs.push(ex);
                    }
                }

                if(targetExs.length > 0){
                    const childRect = child.getBoundingClientRect();
                    sameGenLine(contentRect, svgContainer, childRect, targetExs, true, false, false, "child_ex_spouse");
                }
            }

            const stepGrandChilds = content.getElementsByClassName("step_grand_child");
            // 連れ孫がいるとき
            if(stepGrandChilds.length > 0){

                // 各子の前配偶者にループ処理
                for(let i = 0, len = childExSpouses.length; i < len; i++){
                    const es = childExSpouses[i];
                    const esInputs = es.querySelectorAll("input");
                    const targetGcs = [];

                    // 各連れ孫に対するループ処理
                    for(let j = 0, len2 = stepGrandChilds.length; j < len2; j++){
                        const targetGc = stepGrandChilds[j];
                        const targetGcInputs = targetGc.querySelectorAll("input");

                        // 対象の子の前配偶者に紐づく連れ孫のとき
                        const esRelationIds = JSON.parse(esInputs[idxs["relation_id1"]].value);
                        const targetGcId = parseInt(targetGcInputs[idxs["id"]].value);
                        if(esRelationIds.includes(targetGcId)){
                            targetGcs.push(targetGc);
                        }
                    }

                    // 対象の子の前配偶者に紐づく連れ孫がいるとき
                    if(targetGcs.length > 0){
                        const lineRect = content.getElementsByClassName("horizontal_line-child_ex_spouse")[i].getBoundingClientRect();
                        const esRect = es.getBoundingClientRect();
                        twoGenLine2(contentRect, svgContainer, lineRect, esRect, targetGcs, false);
                    }
                }
            }
        }
    }
}

/**
 * 連れ子へのライン
 * @param {*} content 
 * @param {*} contentRect 
 * @param {*} svgContainer 
 */
function drawStepChildLines(content, contentRect, svgContainer){

    const exSpouses = content.getElementsByClassName("ex_spouse");
    // 前配偶者がいるとき
    if(exSpouses.length > 0){
        
        const stepChilds = content.getElementsByClassName("step_child");
        // 連れ子がいるとき
        if(stepChilds.length > 0){

            // 各前配偶者に対する処理
            for(let i = 0, len1 = exSpouses.length; i < len1; i++){
                const exSpouse = exSpouses[i];
                const exSpouseInputs = exSpouse.querySelectorAll("input");
                const targetStepChilds = [];

                // 各連れ子に対する処理
                for(let j = 0, len2 = stepChilds.length; j < len2; j++){
                    const stepChild = stepChilds[j];
                    const stepChildInputs = stepChild.querySelectorAll("input");

                    const exSpouseRelationIds = JSON.parse(exSpouseInputs[idxs["relation_id1"]].value);
                    const stepChildId = parseInt(stepChildInputs[idxs["id"]].value);
                    // 対象の前配偶者と紐づく連れ子を取得する
                    if(exSpouseRelationIds.includes(stepChildId)){
                        targetStepChilds.push(stepChild);
                    }
                }

                // 対象の前配偶者に紐づく連れ子がいるとき
                if(targetStepChilds.length > 0){

                    // 最初の前配偶者のとき
                    if(i === 0){
                        const singleLine = content.getElementsByClassName("decedent_ex_spouse_single_line")[0];
                        const lineRect = singleLine.getBoundingClientRect();
                        twoGenLine(contentRect, svgContainer, lineRect, targetStepChilds);
                    }else{
                        const lineRect = content.getElementsByClassName("horizontal_line-ex_spouse")[i - 1].getBoundingClientRect();
                        const exSpouseRect = exSpouses[i - 1].getBoundingClientRect();
                        twoGenLine2(contentRect, svgContainer, lineRect, exSpouseRect, targetStepChilds, true);
                    }
                }
            }
        }
    }
}

/**
 * 現配偶者の子へのライン
 * @param {*} content 
 * @param {*} contentRect 
 * @param {*} svgContainer 
 */
function drawDecedentSpouseChildLines(content, contentRect, svgContainer){
    const decedentSpouseLine = content.getElementsByClassName("decedent_spouse_line")[0];
    const childs = content.getElementsByClassName("child");
    // 現配偶者がいる、かつ子供がいる
    if(decedentSpouseLine && childs.length > 0){
        const decedentSpouseLineRect = decedentSpouseLine.getBoundingClientRect();
        twoGenLine(contentRect, svgContainer, decedentSpouseLineRect, childs);
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
        sameGenLine(contentRect, svgContainer, decedentRect, exSpouses, true, true, false, "ex_spouse");
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
                if(fromInputs[idxs["relation_id1"]].value === toElInputs[idxs["id"]].value){
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

    //父母から被相続人（と兄弟姉妹）を結ぶ線
    if(gen){
        const doubleLine = gen.getElementsByClassName("double_line")[0];
        const doubleLineRect = doubleLine.getBoundingClientRect();
        const targets = content.querySelectorAll('.full_collateral, .decedent');
        twoGenLine(contentRect, svgContainer, doubleLineRect, targets);


        const otherMothers = gen.getElementsByClassName('other_mother');
        // 異母がいるとき
        if(otherMothers.length > 0){
            const father = gen.getElementsByClassName("parents")[0];
            const parentRect = father.getBoundingClientRect();
            //異母から父へのライン
            sameGenLine(contentRect, svgContainer, parentRect, otherMothers, false, false, true, "other_mother");

            const otherMotherCollaterals = content.getElementsByClassName("other_mother_collateral");
            // 異母兄弟姉妹がいるとき
            if(otherMotherCollaterals.length > 0){
                // 各異母に対する処理
                for(let i = otherMothers.length - 1; i >= 0; i--){
                    const otherMother = otherMothers[i];
                    const otherMotherInputs = otherMother.querySelectorAll("input");
                    const targetCollaterals = [];

                    // 各異母兄弟姉妹に対する処理
                    for(let j = 0, len2 = otherMotherCollaterals.length; j < len2; j++){
                        const targetCollateral = otherMotherCollaterals[j];
                        const targetCollateralInputs = targetCollateral.querySelectorAll("input");

                        // 対象の異母と紐づく異母兄弟姉妹のとき
                        const otherMotherRelationIds = JSON.parse(otherMotherInputs[idxs["relation_id1"]].value);
                        const targetCollateralId = parseInt(targetCollateralInputs[idxs["id"]].value);
                        if(otherMotherRelationIds.includes(targetCollateralId)){
                            targetCollaterals.push(targetCollateral);
                        }
                    }

                    // 対象の異母の兄弟姉妹がいるとき
                    if(targetCollaterals.length > 0){
                        // 最後の異母のとき
                        if(i === otherMothers.length - 1){
                            const singleLine = gen.getElementsByClassName("other_mother_single_line")[0];
                            const lineRect = singleLine.getBoundingClientRect();
                            twoGenLine(contentRect, svgContainer, lineRect, targetCollaterals);
                        }else{
                            const lineRect = gen.getElementsByClassName("horizontal_line-other_mother")[i - 1].getBoundingClientRect();
                            const otherMotherRect = otherMother.getBoundingClientRect();
                            twoGenLine2(contentRect, svgContainer, lineRect, otherMotherRect, targetCollaterals, true);
                        }
                    }
                }
            }
        }

        const otherFathers = gen.getElementsByClassName('other_father');
        // 異父がいるとき
        if(otherFathers.length > 0){
            const mother = gen.getElementsByClassName("parents")[1];
            const parentRect = mother.getBoundingClientRect();

            //異父から母へのライン
            sameGenLine(contentRect, svgContainer, parentRect, otherFathers, true, true, false, "other_father");

            const otherFatherCollaterals = content.getElementsByClassName("other_father_collateral");
            // 異父兄弟姉妹がいるとき
            if(otherFatherCollaterals.length > 0){

                // 各異父に対する処理
                for(let i = 0, len1 = otherFathers.length; i < len1; i++){
                    const otherFather = otherFathers[i];
                    const otherFatherInputs = otherFather.querySelectorAll("input");
                    const targetCollaterals = [];

                    // 各異父兄弟姉妹に対する処理
                    for(let j = 0, len2 = otherFatherCollaterals.length; j < len2; j++){
                        const targetCollateral = otherFatherCollaterals[j];
                        const targetCollateralInputs = targetCollateral.querySelectorAll("input");

                        // 対象の異父と紐づく異父兄弟姉妹を取得する
                        const otherFatherRelationIds = JSON.parse(otherFatherInputs[idxs["relation_id1"]].value);
                        const targetCollateralId = parseInt(targetCollateralInputs[idxs["id"]].value);
                        if(otherFatherRelationIds.includes(targetCollateralId)){
                            targetCollaterals.push(targetCollateral);
                        }
                    }

                    // 対象の異父の兄弟姉妹がいるとき
                    if(targetCollaterals.length > 0){

                        // 最初の異父のとき
                        if(i === 0){
                            const singleLine = gen.getElementsByClassName("other_father_single_line")[0];
                            const lineRect = singleLine.getBoundingClientRect();
                            twoGenLine(contentRect, svgContainer, lineRect, targetCollaterals);
                        }else{
                            const lineRect = gen.getElementsByClassName("horizontal_line-other_father")[i - 1].getBoundingClientRect();
                            const otherFatherRect = otherFathers[i - 1].getBoundingClientRect();
                            twoGenLine2(contentRect, svgContainer, lineRect, otherFatherRect, targetCollaterals, true);
                        }
                    }
                }
            }
        }
    }
}

/**
 * 前配偶者との子へのライン
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} lineRect 
 * @param {*} toEls 
 */
function twoGenLine2(contentRect, svgContainer, lineRect, elRect, toEls, isRight){
    let lineHeight = 110;
    // 親要素を基準にした子要素の相対位置を算出
    const fromX = isRight? elRect.right - contentRect.left: elRect.left - contentRect.left; // 起点のx座標（横座標）
    const fromY = lineRect.top - contentRect.top + lineRect.height; // 起点のy座標（縦座標）
    let toY = lineHeight + fromY; // 伸ばす線の終点座標

    // 線が近すぎるときは回避するように引く
    if(checkHorizontalLineAtPoint(svgContainer, fromX, toY)){
        toY -= 7;
        if(checkHorizontalLineAtPoint(svgContainer, fromX, toY)){
            toY -=7;
            if(checkHorizontalLineAtPoint(svgContainer, fromX, toY)){
                toY -=7;
                alert("システム対応外です。\n別途作成したPDFをメールいたしますので、恐れ入りますが「※注意事項」に記載の弊社メールアドレスまでお問い合わせをお願いします。")
            }
        }
    }

    for(let i = 0, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();

        // 二重線の中央から下線を60px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);

        // 二重線の中央から60px下を起点として要素の真ん中までのx座標を取得する
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        const toRectTop = (toRect.top - contentRect.top);

        // 最初処理
        if(i === 0){
            // 最初の要素の上まで横線を引く
            drawLine(svgContainer, fromX, toY, toRectCenter, toY);

            const lastEl = getLastElFromArray(toEls);
            const toLastElRect = lastEl.getBoundingClientRect();
            const lastElRectCenter = (toLastElRect.left - contentRect.left) + (toLastElRect.width / 2);
            // 最後の要素が起点より右にあるときは、最後の要素の上までにも横線を引く
            if(lastElRectCenter > fromX){
                drawLine(svgContainer, fromX, toY, lastElRectCenter, toY);
            }
        }

        //対象の要素の真ん中へ下線を書く
        const diff = toY - toRectTop;
        drawLine(svgContainer, toRectCenter, toY, toRectCenter, toY - diff)
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
    let line1Height = 65;
    // 親要素を基準にした子要素の相対位置を算出
    const fromX = fromRect.left - contentRect.left + fromRect.width / 2; // 起点のx座標（横座標）
    const fromY = fromRect.top - contentRect.top + fromRect.height; // 起点のy座標（縦座標）
    let toY = line1Height + fromY; // 伸ばす線の終点座標

    // 線が近すぎるときは回避するように引く
    if(checkHorizontalLineAtPoint(svgContainer, fromX, toY)){
        toY -= 7;
        if(checkHorizontalLineAtPoint(svgContainer, fromX, toY)){
            toY -=7;
            if(checkHorizontalLineAtPoint(svgContainer, fromX, toY)){
                toY -=7;
                alert("システム対応外です。\n別途作成したPDFをメールいたしますので、恐れ入りますが「※注意事項」に記載の弊社メールアドレスまでお問い合わせをお願いします。")
            }
        }
    }

    for(let i = 0, len = toEls.length; i < len; i++){
        const toRect = toEls[i].getBoundingClientRect();

        // 二重線の中央から下線を60px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);

        // 二重線の中央から60px下を起点として要素の真ん中までのx座標を取得する
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        const toRectTop = (toRect.top - contentRect.top);

        // 最初処理
        if(i === 0){
            // 最初の要素の上まで横線を引く
            drawLine(svgContainer, fromX, toY, toRectCenter, toY);

            const lastEl = getLastElFromArray(toEls);
            const toLastElRect = lastEl.getBoundingClientRect();
            const lastElRectCenter = (toLastElRect.left - contentRect.left) + (toLastElRect.width / 2);
            // 最後の要素が起点より右にあるときは、最後の要素の上までにも横線を引く
            if(lastElRectCenter > fromX){
                drawLine(svgContainer, fromX, toY, lastElRectCenter, toY);
            }
        }

        //対象の要素の真ん中へ下線を書く
        const diff = toY - toRectTop;
        drawLine(svgContainer, toRectCenter, toY, toRectCenter, toY - diff)
    }
}

/**
 * 対象の人と前配偶者のラインを書く
 * @param {*} contentRect 
 * @param {*} svgContainer 
 * @param {*} fromRect 
 * @param {HTMLCollection} toEls 
 */
function sameGenLine(contentRect, svgContainer, fromRect, toEls, fromTopRight, skipFirst, skipLast, relation){

    //子と子の配偶者以外の場合は、1人目の前配偶者との間にデフォルトの横線があるため2人目からループ処理
    for(let i = skipFirst? 1: 0, len = toEls.length; i < len; i++){

        // 異母は最後の要素がデフォルトで線があるため不要
        if(skipLast && i === len - 1)
            break;

        const toRect = toEls[i].getBoundingClientRect();
        // 親要素を基準にした子要素の相対位置を算出
        const fromY = fromRect.top - contentRect.top;
        const fromX = fromTopRight? fromRect.right - contentRect.left - fromRect.width / 4: fromRect.left - contentRect.left + fromRect.width / 4;
        const addHeight = skipLast || !skipFirst && !skipLast? -10 * i - 10: -10 * i;
        const toY = fromY + addHeight;
        //ulに右上または左上から上線を10px伸ばす
        drawLine(svgContainer, fromX, fromY, fromX, toY);
        //ulの右上または左上から10px上を起点として対象の要素の真ん中まで横線を伸ばす
        const toRectCenter = (toRect.left - contentRect.left) + (toRect.width / 2);
        drawLine(svgContainer, fromX, toY, toRectCenter, toY, `horizontal_line-${relation}`);
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
function drawLine(svgContainer, x1, y1, x2, y2, className=null) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'black');

    if (className !== null) {
        line.setAttribute('class', className);
    }

    svgContainer.appendChild(line);
}

/**
 * 点がライン上にあるか判定
 * @param {*} svg 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function checkHorizontalLineAtPoint(svg, x, y) {
    const lines = svg.querySelectorAll('line');
    return Array.from(lines).some(line => {
        const y1 = parseFloat(line.getAttribute('y1'));
        const y2 = parseFloat(line.getAttribute('y2'));
        const x1 = parseFloat(line.getAttribute('x1'));
        const x2 = parseFloat(line.getAttribute('x2'));

        // 水平線ではないときは次へ
        if(y1 !== y2)
            return false;

        // 水平線をチェック
        if (Math.abs(y - y1) <= 6) {
            // x座標が線の範囲内にあるか
            return x >= Math.min(x1, x2) && x <= Math.max(x1, x2);
        }

        return false;
    });
}
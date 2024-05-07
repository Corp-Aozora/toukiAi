"use strict";

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

/**
 * @typedef {Decedent|Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} EveryInstance
 * @typedef {Decedent|Spouse|Child|ChildSpouse|GrandChild|Ascendant|Collateral} EveryIndivisual
 * @typedef {ChildCommon|CollateralCommon} EveryCommon
 */

class ErrorMessageTemplate{

    /**
     * データロード中にエラーを発生した入力欄を摘示
     */
    static identInvalidInputWhenLoad(functionName, input, e){
        return `${functionName}でエラー\nid：${input.id}の復元中にエラー\n${e.message}`;
    }

    /**
     * データロード中に次へボタンが有効化されていないとき
     */
    static someInvalidInputWhenLoad(functionName, instance){
        return `${functionName}\n${UpdateTitle.getFieldsetTitle({instance: instance})}に入力不備があるため次へボタンが有効化されてません`;
    }

    /**
     * データロード中の汎用エラー
     */
    static errorWhenLoad(functionName, instance, e){
        return `${functionName}\n${UpdateTitle.getFieldsetTitle({instance: instance})}の復元中にエラー\nエラーメッセージ：${e.message}`;
    }
}

/**
 * fieldset又はガイドのタイトル変更クラス
 */
class UpdateTitle{
    /**
     * 子個人又は兄弟姉妹個人専用（枝番と続柄のインデックスを更新する）
     * 
     * 「１－１．（続柄）１について」を「１－２．（続柄）２について」に変換する
     * @param {HTMLElement} titleEl タイトル要素
     * @param {string} zokugara 続柄（"子"又は"兄弟姉妹"）
     */
    static childOrCollateralFollowing(titleEl, zokugara){
        const oldNumbering = getTitleNumbering(titleEl); //旧ナンバリングを取得する
        const idx = oldNumbering.lastIndexOf("－"); //－のインデックスを取得する
        const oldBranchNum = oldNumbering.slice(idx + 1); //枝番を取得する
        const newBranchNum = parseInt(ZenkakuToHankaku(oldBranchNum)) + 1; //枝番に１加算する
        const newNumbering = oldNumbering.slice(0, idx + 1) + hankakuToZenkaku(String(newBranchNum)); //枝番を更新したナンバリングを取得する
        const newTitle = `${newNumbering}．${zokugara}${hankakuToZenkaku(String(newBranchNum))}`; //枝番と続柄のインデックスを更新したタイトルを取得する
        titleEl.textContent = newTitle; //新しいタイトルに上書きする
    }

    /**
     * 子の配偶者又は孫専用（本番と枝番を更新する、孫のときは、続柄のインデックスも更新する）
     * @param {HTMLElement} titleEl タイトル要素
     * @param {Child} child 被相続人の子（子の配偶者から見ると配偶者）
     * @param {string} zokugara 「配偶者」又は「子」のどちらか
     * @param {number} successFromIdx 数次相続のインデックス（タイトルの本番部分の更新のため）
     * @param {number} childsHeirIdx 数次相続の相続人のインデックス（タイトルの枝番部分の更新のため）
     */
    static childsHeirs(titleEl, child, zokugara, successFromIdx, childsHeirIdx){
        try{
            const childNum = 4; //子
            const newMainNum = hankakuToZenkaku(String(childNum + successFromIdx));
            const newBranchNum = hankakuToZenkaku(String(childsHeirIdx));
            const newTitle = `${newMainNum}－${newBranchNum}．${child.inputs[CName.input].value}の${zokugara}`
            titleEl.textContent = newTitle;
        }catch(e){
            throw new Error(`UpdateTitle.childsHeirsでエラー\n${titleEl}のタイトル更新でエラー`);
        }
    }

    /**
     * 全尊属の欄の本番と枝番を一括更新する（父欄を表示するとき用）
     * 
     * 「（変更後の数字）－１．父」「（変更後の数字）－２．母」...に変更する
     * @param {ChildCommon|Child} fromInstance 一つ前の人
     * @param {boolean} isFieldset fieldsetのタイトル変更フラグ（falseのときはガイドのタイトルを変更する）
     */
    static ascendants(fromInstance, isFieldset){
        const els = isFieldset ? 
            document.getElementsByClassName(Classes.fieldset.ascendant):
            document.getElementsByClassName(Classes.guide.ascendant);
        
        const zokugara = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"];
        const newMainNum = this.getNewMainNumberingFromPreFieldset({instance: fromInstance});
        for(let i = 0, len = els.length; i < len; i++){
            const el = els[i];
            const titleEl = isFieldset ?
                el.getElementsByClassName(Classes.fieldset.title)[0]:
                el.getElementsByTagName("button")[0];
            const newTitle = `${newMainNum}－${hankakuToZenkaku(String(i + 1))}．${zokugara[i]}`;
            titleEl.textContent = newTitle;
        }
    }

    /**
     * 母方の祖父欄を表示するとき（枝番を更新する）
     * 
     * 「（本番）－（変更後の数字）．母方の祖父」、「（本番）－（変更後の数字）．母方の祖母」に変換する
     * @param {boolean} isFromMother 母欄からの表示フラグ
     */
    static motherGparentsFieldset(isFromMother){
        const els = [Ids.fieldset.motherGF, Ids.fieldset.motherGM].map(x => document.getElementById(x));
        const zokugara = ["母方の祖父", "母方の祖母"];
        for(let i = 0, len = els.length; i < len; i++){
            const titleEl = els[i].getElementsByClassName(Classes.fieldset.title)[0];
            const preNumbering = this.getNumbering({fieldset: document.getElementById(isFromMother? Ids.fieldset.mother: Ids.fieldset.fatherGM)});
            const [preMainNumStr, preBranchNumStr] = preNumbering.split("－");
            const newBranchNum = parseInt(ZenkakuToHankaku(preBranchNumStr)) + 1;
            const newNumbering = preMainNumStr + "－" + hankakuToZenkaku(String(newBranchNum + i));
            const newTitle = `${newNumbering}．${zokugara[i]}`;
            titleEl.textContent = newTitle;
        }
    }

    /**
     * 母方の祖父母のガイドを表示するとき（フィールドセットのものをコピペ）
     */
    static parentsGuide(fFieldsetId, mFieldsetId, fGuideId, mGuideId){
        const gfTitle = this.getFieldsetTitle({fieldset: document.getElementById(fFieldsetId)});
        const gmTitle = this.getFieldsetTitle({fieldset: document.getElementById(mFieldsetId)});

        const gfGuideTitleEl = this.getTitleEl(document.getElementById(fGuideId), false);
        const gmGuide = document.getElementById(mGuideId);
        const gmGuideTitleEl = this.getTitleEl(gmGuide, false);

        gfGuideTitleEl.textContent = gfTitle;
        gmGuideTitleEl.textContent = gmTitle;
        gmGuide.style.display = "block";
    }

    /**
     * 本番のみのタイトルを変更
     * @param {EveryInstance} fromInstance 
     * @param {HTMLElement} el 
     * @param {string} splitPoint 本番直後の文字列（{．}{－}）
     */
    static mainNumber(fromInstance, el, splitPoint){
        const titleEl = this.getTitleEl(el, true);
        const title = this.getTextFromEl(titleEl);
        const newMainNum = this.getNewMainNumberingFromPreFieldset({instance: fromInstance});
        const following = title.split(splitPoint)[1];
        titleEl.textContent = [newMainNum, following].join(splitPoint);
    }

    /**
     * 兄弟姉妹共通ガイドのタイトルを変更する（フィールドセットのものをコピペ）
     */
    static collateralCommonGuide(){
        const newTitle = this.getFieldsetTitle({ instance: getLastElFromArray(reqInstance) });
        const titleEl = this.getTitleEl(document.getElementById(Ids.guide.collateralCommon), false);
        titleEl.textContent = newTitle;
    }

    // タイトル要素を取得する
    static getTitleEl(el, isFieldset){
        return isFieldset? 
            el.getElementsByClassName(Classes.fieldset.title)[0]: 
            el.getElementsByClassName(Classes.guide.btn)[0];
    }

    // 要素からテキストを取得する
    static getTextFromEl(el){
        return el.textContent.replace(/\n/g, "").replace(/\s/g, "");
    }

    // フィールドセットのタイトルを取得する
    static getFieldsetTitle({ instance, fieldset } = {}){
        const field = instance? instance.fieldset: fieldset;
        if(!field)
            throw new Error("getFieldsetTitleでエラー\n引数が渡されてません");
        
        const titleEl = this.getTitleEl(field, true);
        if(!titleEl)
            throw new Error("getFieldsetTitleでエラー\nタイトルがない引数です");

        return titleEl.textContent.replace(/\n/g, "").replace(/\s/g, "");
    }

    // フィールドセットのナンバリングを取得する（全角数字－全角数字の部分）
    static getNumbering({ instance, fieldset } = {}){
        return this.getFieldsetTitle({ instance: instance, fieldset: fieldset }).split("．")[0];
    }

    // タイトルの新しい本番（全角）を取得する
    static getNewMainNumberingFromPreFieldset({ instance, fieldset } = {}){
        const preTitle = this.getFieldsetTitle({ instance: instance, fieldset: fieldset });
        const preMainNumStr = preTitle.split("－")[0];
        const preMainNum = parseInt(ZenkakuToHankaku(preMainNumStr));
        return hankakuToZenkaku(String(preMainNum + 1));
    }
}

// ガイド
class Guide{
    static btns = [document.querySelector(".guideBtn")];
    static guides = [document.querySelector(".guide")];
    static caretIcons = [document.querySelector(".guideCaret")];
    static checkIcons = [];
    static elIdx = 0;
}

class Ids{
    static fieldset = {
        decedentSpouse: "id_spouse-0-fieldset", // 配偶者
        childCommon: "id_child_common-0-fieldset", // 子供全員
        firstChild: "id_child-0-fieldset", // 最初の子
        firstChildSpouse: "id_child_spouse-0-fieldset", //最初の子の配偶者
        firstGrandChild: "id_grand_child-0-fieldset", //最初の孫
        father: "id_ascendant-0-fieldset", // 父
        mother: "id_ascendant-1-fieldset", // 母
        fatherGF: "id_ascendant-2-fieldset", //父方の祖父
        fatherGM: "id_ascendant-3-fieldset", //父方の祖父
        motherGF: "id_ascendant-4-fieldset", // 母方の祖父
        motherGM: "id_ascendant-5-fieldset", // 母方の祖母
        collateralCommon: "id_collateral_common-0-fieldset", // 兄弟姉妹全員
        firstCollateral: "id_collateral-0-fieldset" // 最初の兄弟姉妹
    }

    static totalForm = {
        child: "id_child-TOTAL_FORMS",
        childSpouse: "id_child_spouse-TOTAL_FORMS",
        grandChild: "id_grand_child-TOTAL_FORMS",
        ascendant: "id_ascendant-TOTAL_FORMS",
        collateral: "id_collateral-TOTAL_FORMS",
    }

    static guide = {
        child: "id_child-0-guide",
        father: "id_ascendant-0-guide",
        mother: "id_ascendant-1-guide",
        fatherGF: "id_ascendant-2-guide",
        fatherGM: "id_ascendant-3-guide",
        motherGF: "id_ascendant-4-guide",
        motherGM: "id_ascendant-5-guide",
        collateralCommon: "id_collateral_common-0-guide",
        firstCollateral: "id_collateral-0-guide"
    }
}

class Classes{
    static fieldset = {
        child: "childFieldset",
        childHeir: "childHeirFieldset",
        childSpouse: "childSpouseFieldset",
        grandChild: "grandChildFieldset",
        ascendant: "ascendantFieldset",
        collateralCommon: "collateralCommonFieldset",
        collateral: "collateralFieldset",
        title: "fieldsetTitle"
    }

    static guide ={
        child: "childGuide",
        childHeir: "childsHeirGuide",
        ascendant: "ascendantGuide",
        fatherG: "fatherGGuide",
        motherG: "motherGGuide",
        collateralCommon: "collateralCommonGuide",
        collateral: "collateralGuide",
        check: "guideCheck",
        btn: "guideBtn"
    }
}

class Person{
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        this.fieldset = document.getElementById(fieldsetId);
        this.Qs = Array.from(this.fieldset.getElementsByClassName("Q"));
        this.inputs = Array.from(this.fieldset.getElementsByTagName("input"));
        this.preBtn = this.fieldset.getElementsByClassName("preBtn")[0];
        this.nextBtn = this.fieldset.getElementsByClassName("nextBtn")[0];
        this.errMsgEls = Array.from(this.fieldset.getElementsByClassName("errorMessage"));
        this.noInputs = Array.from(this.fieldset.getElementsByTagName("input"));
    }
}

//被相続人
const decedents = [];
class Decedent extends Person{
    //入力欄のインデックス
    static idxs = {
        name : 0,
        deathYear : 1,
        deathMonth : 2,
        index : 3,
        target : 4,
    }
    //fieldset、入力欄、ボタン
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.inputs = Array.from(this.fieldset.querySelectorAll("input, select"));
            this.noInputs = Array.from(this.fieldset.querySelectorAll("input, select")).filter(
                (_, i) => i !== Decedent.idxs.deathYear &&
                    i != Decedent.idxs.deathMonth && 
                    i != Decedent.idxs.index && 
                    i !== Decedent.idxs.target
            );
            this.inputs[Decedent.idxs.index].value = UpdateTitle.getNumbering({instance: this});
            this.inputs[Decedent.idxs.target].value = "";
            decedents.push(this);
        }catch(e){
            basicLog("Decedentのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }
}
const decedent = new Decedent("id_decedent-0-fieldset");
const {
    name: DName,
    deathYear: DDeathYear,
    deathMonth: DDeathMonth,
    index: DIndex,
    target: DTarget,
} = Decedent.idxs

//配偶者
const spouses = [];
class Spouse extends Person{
    //入力欄のインデックス
    static idxs = {
        name : {form: 0, input:0},
        isExist : {form: 1, input: [1, 2]},
        isLive : {form:2, input: [3, 4]},
        isRefuse : {form: 3, input: [5, 6]},
        isRemarriage : {form: 4, input: [7, 8]},
        isStepChild : {form: 5, input: [9, 10]},
        isJapan : {form: 6, input: [11, 12]},
        index : {form: 7, input: 13},
        target : {form: 8, input: 14}
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.noInputs = this.noInputs.filter((_, i) => 
                i !== Spouse.idxs.index.input && 
                i !== Spouse.idxs.target.input);
            this.inputs[Spouse.idxs.index.input].value = UpdateTitle.getNumbering({instance: this});
            this.inputs[Spouse.idxs.target.input].value = decedent.inputs[DIndex].value.trim();
            if(this.constructor === Spouse)
                spouses.push(this);
        }catch(e){
            basicLog("Spouseのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }

    isHeir(){
        return this.inputs[Spouse.idxs.isLive.input[yes]].checked && this.inputs[Spouse.idxs.isRefuse.input[no]].checked;
    }
}
const spouse = new Spouse(Ids.fieldset.decedentSpouse);
const {
    name: SName,
    isExist: SIsExist,
    isLive: SIsLive,
    isRefuse: SIsRefuse,
    isRemarriage: SIsRemarriage,
    isStepChild: SIsStepChild,
    isJapan: SIsJapan,
    index: SIndex,
    target: STarget,
} = Spouse.idxs;

//子供共通
const childCommons = [];
class ChildCommon extends Person{
    //入力欄のインデックス
    static idxs = {
        isExist:{ form: 0, input: [0, 1] },
        count:{ form: 1, input: 2 },
        isSameParents:{ form: 2, input: [3, 4] },
        isLive:{ form: 3, input: [5, 6] },
        isRefuse:{ form: 4, input: [7, 8] },
        isAdult:{ form: 5, input: [9, 10] },
        isJapan:{ form: 6, input: [11, 12] }
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.minusBtn = this.fieldset.getElementsByClassName("decreaseBtn")[0];
            this.plusBtn = this.fieldset.getElementsByClassName("increaseBtn")[0];
            childCommons.push(this);
        }catch(e){
            basicLog("ChildCommonのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }

    countChilds(){
        return parseInt(this.inputs[ChildCommon.idxs.count.input].value);
    }
}
const childCommon = new ChildCommon(Ids.fieldset.childCommon);
const {
    isExist: ChCIsExist,
    count: ChCCount,
    isSameParents: ChCIsSameParents,
    isLive: ChCIsLive,
    isRefuse: ChCIsRefuse,
    isAdult: ChCIsAdult,
    isJapan: ChCIsJapan,
} = ChildCommon.idxs;

//子
const childs = [];
class Child extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameParents:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        count:{form: 7, input: 13},
        isAdult:{form: 8, input: [14, 15]},
        isJapan:{form: 9, input: [16, 17]},
        index : {form: 10, input: 18},
        target1 : {form: 11, input: 19},
        target2 : {form: 12, input: 20},
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.noInputs = this.noInputs.filter((_, i) => 
                i !== Child.idxs.index.input && 
                i !== Child.idxs.target1.input && 
                i !== Child.idxs.target2.input);
            this.inputs[Child.idxs.index.input].value = UpdateTitle.getNumbering({instance: this});
            this.minusBtn = null;
            this.plusBtn = null;
            // GrandChildのインスタンスの可能性があるため分岐
            if(this.constructor === Child){
                this.inputs[Child.idxs.target1.input].value = decedent.inputs[DIndex].value.trim();
                this.minusBtn = this.fieldset.getElementsByClassName("decreaseBtn")[0];
                this.plusBtn = this.fieldset.getElementsByClassName("increaseBtn")[0];
                childs.push(this);
            }
        }catch(e){
            basicLog("Childのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }
}
const {
    name: CName,
    isSameParents: CIsSameParents,
    isLive: CIsLive,
    isExist: CIsExist,
    isRefuse: CIsRefuse,
    isSpouse: CIsSpouse,
    isChild: CIsChild,
    count: CCount,
    isAdult: CIsAdult,
    isJapan: CIsJapan,
    index: CIndex,
    target1: CTarget1,
    target2: CTarget2,
} = Child.idxs;

//子の配偶者
const childSpouses = [];
class ChildSpouse extends Spouse{
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.noInputs = this.noInputs.filter((_, i) => 
                i !== ChildSpouse.idxs.index.input && 
                i !== ChildSpouse.idxs.target.input);
            this.successFrom;
            this.inputs[ChildSpouse.idxs.index.input].value = UpdateTitle.getNumbering({instance: this});
            childSpouses.push(this);
        }catch(e){
            basicLog("ChildSpouseのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }
}
const {
    name: CSName,
    isExist: CSIsExist,
    isLive: CSIsLive,
    isRefuse: CSIsRefuse,
    isRemarriage: CSIsRemarriage,
    isStepChild: CSIsStepChild,
    isJapan: CSIsJapan,
    index: CSIndex,
    target: CSTarget,
} = ChildSpouse.idxs;

//子の子（孫）
const grandChilds = [];
class GrandChild extends Child{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameParents:{form: 1, input: [1, 2]},
        isLive:{form: 2, input: [3, 4]},
        isExist:{form: 3, input: [5, 6]},
        isRefuse:{form: 4, input: [7, 8]},
        isSpouse:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        isAdult:{form: 7, input: [13, 14]},
        isJapan:{form: 8, input: [15, 16]},
        index : {form: 9, input: 17},
        target1 : {form: 10, input: 18},
        target2 : {form: 11, input: 19},
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.noInputs = this.noInputs.filter((_, i) => 
                i !== GrandChild.idxs.index.input && 
                i !== GrandChild.idxs.target1.input && 
                i !== GrandChild.idxs.target2.input);
            this.successFrom;
            this.inputs[GrandChild.idxs.index.input].value = UpdateTitle.getNumbering({instance: this});
            grandChilds.push(this);
        }catch(e){
            basicLog("GrandChildのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }
}
const {
    name: GName,
    isSameParents: GIsSameParents,
    isLive: GIsLive,
    isExist: GIsExist,
    isRefuse: GIsRefuse,
    isSpouse: GIsSpouse,
    isChild: GIsChild,
    isAdult: GIsAdult,
    isJapan: GIsJapan,
    index: GIndex,
    target1: GTarget1,
    target2: GTarget2,
} = GrandChild.idxs;

//尊属
const ascendants = [];
class Ascendant extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isLive:{form: 1, input: [1, 2]},
        isExist:{form: 2, input: [3, 4]},
        isRefuse:{form: 3, input: [5, 6]},
        isSpouse:{form: 4, input: [7, 8]},
        isRemarriage:{form: 5, input: [9, 10]},
        isChild:{form: 6, input: [11, 12]},
        isJapan:{form: 7, input: [13, 14]},
        index : {form: 8, input: 15},
        target : {form: 9, input: 16}
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.noInputs = this.noInputs.filter((_, i) => 
                i !== Ascendant.idxs.index.input && 
                i !== Ascendant.idxs.target.input);

            // 父母のときは常にtargetは被相続人のindex
            if([Ids.fieldset.father, Ids.fieldset.mother].includes(fieldsetId))
                this.inputs[Ascendant.idxs.target.input].value = decedent.inputs[DIndex].value.trim();

            // indexをタイトルのものに更新する
            this.inputs[Ascendant.idxs.index.input].value = UpdateTitle.getNumbering({instance: this});
            ascendants.push(this);
        }catch(e){
            basicLog("Ascendantのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }
}
const {
    name: AName,
    isLive: AIsLive,
    isExist: AIsExist,
    isRefuse: AIsRefuse,
    isSpouse: AIsSpouse,
    isRemarriage: AIsRemarriage,
    isChild: AIsChild,
    isJapan: AIsJapan,
    index: AIndex,
    target: ATarget,
} = Ascendant.idxs;

//兄弟姉妹全員
const collateralCommons = [];
class CollateralCommon extends Person{
    //入力欄のインデックス
    static idxs = {
        isExist:{ form: 0, input: [0, 1] },
        count:{ form: 1, input: 2 },
        isSameParents:{ form: 2, input: [3, 4] },
        isLive:{ form: 3, input: [5, 6] },
        isRefuse:{ form: 4, input: [7, 8] },
        isAdult:{ form: 5, input: [9, 10] },
        isJapan:{ form: 6, input: [11, 12] }
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.minusBtn = this.fieldset.getElementsByClassName("decreaseBtn")[0];
            this.plusBtn = this.fieldset.getElementsByClassName("increaseBtn")[0];
            collateralCommons.push(this);
        }catch(e){
            basicLog("CollateralCommonのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }

    countCollaterals(){
        return parseInt(this.inputs[CollateralCommon.idxs.count.input].value);
    } 
}
const {
    isExist: CoCIsExist,
    count: CoCCount,
    isSameParents: CoCIsSameParents,
    isLive: CoCIsLive,
    isRefuse: CoCIsRefuse,
    isAdult: CoCIsAdult,
    isJapan: CoCIsJapan
} = CollateralCommon.idxs;

//兄弟姉妹
const collaterals = [];
class Collateral extends Person{
    //入力欄のインデックス
    static idxs = {
        name:{form: 0, input: 0},
        isSameParents:{form: 1, input: [1, 2]},
        isFather:{form: 2, input: [3, 4]},
        isLive:{form: 3, input: [5, 6]},
        isExist:{form: 4, input: [7, 8]},
        isRefuse:{form: 5, input: [9, 10]},
        isSpouse:{form: 6, input: [11, 12]},
        isChild:{form: 7, input: [13, 14]},
        isAdult:{form: 8, input: [15, 16]},
        isJapan: {form: 9, input: [17, 18]},
        index: {form: 10, input: 19},
        target1: {form: 11, input: 20},
        target2: {form: 12, input: 21},
    }
    constructor(fieldsetId){
        try{
            super(fieldsetId);
            this.noInputs = this.noInputs.filter((_, i) => 
                i !== Collateral.idxs.index.input && 
                i !== Collateral.idxs.target1.input && 
                i !== Collateral.idxs.target2.input);
            this.inputs[Collateral.idxs.index.input].value = UpdateTitle.getNumbering({instance: this});
            collaterals.push(this);
        }catch(e){
            basicLog("Collateralのconstructor", e, "インスタンス生成時にエラーが発生しました");
        }
    }

    isHeir(){
        return this.inputs[Collateral.idxs.isLive.input[yes]] && this.inputs[Collateral.idxs.isRefuse.input[no]];
    }
}
const {
    name: ColName,
    isSameParents: ColIsSameParents,
    isFather: ColIsFather,
    isLive: ColIsLive,
    isExist: ColIsExist,
    isRefuse: ColIsRefuse,
    isSpouse: ColIsSpouse,
    isChild: ColIsChild,
    isAdult: ColIsAdult,
    isJapan: ColIsJapan,
    index: ColIndex,
    target1: ColTarget1,
    target2: ColTarget2
} = Collateral.idxs;

//入力が必要な人
const reqInstance = [decedent];
//次へボタンのイベントハンドラー
let oneStepFowardHandler;

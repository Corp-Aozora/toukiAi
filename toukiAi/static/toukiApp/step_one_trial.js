"use strict";

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

/**
 * @typedef {Decedent|Spouse|ChildCommon|Child|ChildSpouse|GrandChild|Ascendant|CollateralCommon|Collateral} EveryInstance
 * @typedef {Decedent|Spouse|Child|ChildSpouse|GrandChild|Ascendant|Collateral} EveryIndivisual
 * @typedef {ChildCommon|CollateralCommon} EveryCommon
 */


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
        prefecture : 3,
        city : 4,
        domicilePrefecture : 5,
        domicileCity : 6,
        index : 7,
        target : 8,
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
    prefecture: DPrefecture,
    city: DCity,
    domicilePrefecture: DDomicilePrefecture,
    domicileCity: DDomicileCity,
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

/**
 * ユーザーに紐づく被相続人の市区町村データを取得する
 */
function getDecedentCityData(){
    const {inputs, nextBtn, noInputs} = decedent;
    const url = 'get_decedent_city_data';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        if(response.city !== ""){
            inputs[DCity].value = response.city;
        }
        if(response.domicileCity !== ""){
            inputs[DDomicileCity].value = response.domicileCity;
        }
    }).catch(e => {
        basicLog("getDecedentCityData", e, "fetch中のエラー");
    }).finally(()=>{
        //次へボタンの表示判別
        nextBtn.disabled = noInputs.length !== 0;
    });
}

/**
 * 次の人のフォームへ進むか次へボタンにスクロールするか判別する
 * @param {EveryInstance} person 
 */
function oneStepFowardOrScrollToTarget(person){
    if(person.noInputs.length === 0){
        person.nextBtn.disabled = false;
        oneStepFoward(person);
    }else{
        scrollToTarget(person.nextBtn);
    }
}

/**
 * ユーザーに紐づくデータのうち氏名のデータを復元する
 */
function loadNameData(data, input){
    if(data !== ""){
        input.value = data;
        input.dispatchEvent(new Event("change"));
    }
} 

/**
 * ユーザーに紐づくデータのうちラジオボタンのデータを復元する
 * @param {Element} input 
 */
function loadRbData(input){
    input.checked = true;
    input.dispatchEvent(new Event("change"));
}

/**
 * 次へボタンのトグル
 * @param {EveryInstance} instance 
 */
function isActivateOkBtn(instance){
    instance.nextBtn.disabled = instance.noInputs.length !== 0;
}

/**
 * 被相続人のデータを復元する
 */
async function loadDecedentData(){
    try{
        const inputs = decedent.inputs;
        for(let i = 0, len = inputs.length; i < len; i++){
            //indexとtargetは処理不要
            if(i === DIndex)
                break;

            //データがあるとき
            const input = inputs[i];
            const val = input.value;
            if(val !== ""){
                //エラー要素から削除する
                decedent.noInputs = decedent.noInputs.filter(x => x.id !== input.id)
                //都道府県のとき、市区町村データを取得する
                if([DPrefecture, DDomicilePrefecture].includes(i)){
                    await getCityData(val, inputs[i + 1], decedent);
                }
                if(i === DCity || i === DDomicileCity){
                    getDecedentCityData();
                }
            }
        }
        //すべて入力されているとき、次へボタンを有効化する
        oneStepFowardOrScrollToTarget(decedent);
    }catch(e){
        basicLog("loadDecedentData", e, "被相続人の復元中にエラー");
    }
}

/**
 * ユーザーのデータを取得する
 */
async function loadData(){
    const functionName = "loadData";
    //被相続人データのチェック
    if(userDataScope.includes("decedent")){
        await loadDecedentData();
    }else{
        // 未入力があるときは中止
        return;
    }

    //配偶者（イベントを発生させる順序があるためデータを確認しながらイベント発火）
    if(userDataScope.includes("spouse")){
        try{
            const {inputs, nextBtn} = spouse;
            loadNameData(spouse_data["name"], inputs[SName.input]);
    
            if(spouse_data["is_exist"]){
                loadRbData(inputs[SIsExist.input[yes]]);
    
                if(spouse_data["is_live"]){
                    loadRbData(inputs[SIsLive.input[yes]]);
    
                    if(spouse_data["is_refuse"]){
                        loadRbData(inputs[SIsRefuse.input[yes]]);
                    }else if(spouse_data["is_refuse"] === false){
                        // 未入力の可能性もあるためfalseを指定すること
                        loadRbData(inputs[SIsRefuse.input[no]]);
    
                        if(spouse_data["is_japan"]){
                            loadRbData(inputs[SIsJapan.input[yes]]);
                        }else if(spouse_data["is_japan"] === false){
                            loadRbData(inputs[SIsJapan.input[no]]);
                        }
                    }
                }else if(spouse_data["is_live"] === false){
                    loadRbData(inputs[SIsLive.input[no]]);
                    
                    if(spouse_data["is_refuse"]){
                        loadRbData(inputs[SIsRefuse.input[yes]]);
                    }else if(spouse_data["is_refuse"] === false){
                        // 再婚相手と連れ子はデータとして取得しないため仮で入力している
                        loadRbData(inputs[SIsRefuse.input[no]]);
                        loadRbData(inputs[SIsRemarriage.input[no]]);
                        loadRbData(inputs[SIsStepChild.input[no]]);                  
                    }
                }
            }else if(spouse_data["is_exist"] === false){
                loadRbData(inputs[SIsExist.input[no]])
            }
            //すべて適切に入力されているとき次へボタンを有効化する
            if(!nextBtn.disabled)
                oneStepFowardOrScrollToTarget(spouse);
        }catch(e){
            basicLog(functionName, e, "被相続人の配偶者の復元中にエラー");
        }
    }else{
        return;
    }

    //子共通
    if(userDataScope.includes("child_common")){
        try{
            //子の数データを取得する（is_existがtrueの場合、1が入力されてしまうため）
            const {inputs, Qs, nextBtn} = childCommon;
            const countInputIdx = ChCCount.input; 
            const count = inputs[countInputIdx].value;
            const event = new Event("change");
    
            for(let i = 0, len = inputs.length; i < len; i++){
                //データがあるとき
                const input = inputs[i];
                if(i !== countInputIdx && input.checked){
                    //チェックされたボタンに付随するイベントを発生させる
                    input.dispatchEvent(event);
                }else if(i === countInputIdx && count > 1){
                    inputs[countInputIdx].value = count;
                    input.dispatchEvent(event);
                }
            }
    
            // 配偶者確認欄のいいえ、かつ子が１人、かつ配偶者がいないとき健在確認欄を非表示にする
            if(inputs[ChCIsSameParents.input[no]].checked && childCommon.countChilds() === 1 && spouse.inputs[SIsExist.input[no]].checked){
                Qs[ChCIsLive.form].style.display = "none";
            }
            //すべて適切に入力されているとき次へボタンを有効化する
            if(!nextBtn.disabled)
                oneStepFowardOrScrollToTarget(childCommon);

        }catch(e){
            basicLog(functionName, e, "子供全員の復元中にエラー");
        }
    }else{
        return;
    }

    //子
    if(userDataScope.includes("child")){
        for(let i = 0, len = childs.length; i < len; i++){
            try{
                //データがあるとき、データを反映させる
                loadNameData(childs_data[i]["name"], childs[i].inputs[CName.input]);
    
                if(childs_data[i]["object_id2"] === spouse_data["id"] && childs[i].inputs[CIsSameParents.input[yes]].disabled === false){
                    loadRbData(childs[i].inputs[CIsSameParents.input[yes]]);
                }else if((childs_data[i]["object_id2"] === null || childs_data[i]["object_id2"] !== spouse_data["id"]) && childs[i].inputs[CIsSameParents.input[no]].disabled === false){
                    loadRbData(childs[i].inputs[CIsSameParents.input[no]]);
                }
    
                if(childs_data[i]["is_live"] === true && childs[i].inputs[CIsLive.input[yes]].disabled === false){
                    loadRbData(childs[i].inputs[CIsLive.input[yes]]);
    
                    if(childs_data[i]["is_refuse"] === true){
                        loadRbData(childs[i].inputs[CIsRefuse.input[yes]]);
                    }else if(childs_data[i]["is_refuse"] === false && childs[i].inputs[CIsRefuse.input[no]].disabled === false){
                        loadRbData(childs[i].inputs[CIsRefuse.input[no]]);
                    }
    
                }else if(childs_data[i]["is_live"] === false){
                    loadRbData(childs[i].inputs[CIsLive.input[no]]);
    
                    if(childs_data[i]["is_exist"] === true){
                        loadRbData(childs[i].inputs[CIsExist.input[yes]]);
    
                        if(childs_data[i]["is_refuse"] === true){
                            loadRbData(childs[i].inputs[CIsRefuse.input[yes]]);
                        }else if(childs_data[i]["is_refuse"] === false && childs[i].inputs[CIsRefuse.input[no]].disabled === false){
                            loadRbData(childs[i].inputs[CIsRefuse.input[no]]);
    
                            if(childs_data[i]["is_spouse"] > 0){
                                loadRbData(childs[i].inputs[CIsSpouse.input[yes]]);
                            }else if(childs_data[i]["is_spouse"] === 0){
                                loadRbData(childs[i].inputs[CIsSpouse.input[no]]);
                            }
    
                            if(childs_data[i]["count"] > 0){
                                loadRbData(childs[i].inputs[CIsChild.input[yes]]);
                                childs[i].inputs[CCount.input].value = childs_data[i]["count"];
                            }else if(childs_data[i]["count"] === 0){
                                loadRbData(childs[i].inputs[CIsChild.input[no]]);
                            } 
                
                        }
                    }else if(childs_data[i]["is_exist"] === false){
                        loadRbData(childs[i].inputs[CIsExist.input[no]]);
    
                        if(childs_data[i]["count"] > 0){
                            loadRbData(childs[i].inputs[CIsChild.input[yes]]);
                            childs[i].inputs[CCount.input].value = childs_data[i]["count"];
                        }else if(childs_data[i]["count"] === 0){
                            loadRbData(childs[i].inputs[CIsChild.input[no]]);
                        } 
                    }
                }
    
                if(childs_data[i]["is_adult"] === true && childs[i].inputs[CIsAdult.input[yes]].disabled === false){
                    loadRbData(childs[i].inputs[CIsAdult.input[yes]]);
                }else if(childs_data[i]["is_adult"] === false){
                    loadRbData(childs[i].inputs[CIsAdult.input[no]]);
                }
    
                if(childs_data[i]["is_japan"] === true && childs[i].inputs[CIsJapan.input[yes]].disabled === false){
                    loadRbData(childs[i].inputs[CIsJapan.input[yes]]);
                }else if(childs_data[i]["is_japan"] === false){
                    loadRbData(childs[i].inputs[CIsJapan.input[no]]);
                }
    
                //すべて適切に入力されているとき次へボタンを有効化する
                oneStepFowardOrScrollToTarget(childs[i]);
            }catch(e){
                basicLog(functionName, e, `子${i}の再現中にエラー`);
            }
        }
    }

    //子の相続人
    if(userDataScope.includes("child_heirs")){
        //childSpousesとgrandChildsの配列を合体してソートする
        const childHeirs = getSortedChildsHeirsInstance();

        //データがあるとき、データを反映させる
        for(let i = 0, len = childHeirs.length; i < len; i++){
            //子の配偶者のとき
            if(childHeirs[i].constructor.name === "ChildSpouse"){
                loadNameData(child_heirs_data[i]["name"], childHeirs[i].inputs[ChildSpouse.idxs.name.input]);

                if(child_heirs_data[i]["is_exist"] === true){
                    loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isExist.input[yes]]);

                    if(child_heirs_data[i]["is_live"] === true){
                        loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isLive.input[yes]]);
        
                        if(child_heirs_data[i]["is_refuse"] === true){
                            loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isRefuse.input[yes]]);
                        }else if(child_heirs_data[i]["is_refuse"] === false){
                            loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isRefuse.input[no]]);

                            if(child_heirs_data[i]["is_japan"] === true){
                                loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isJapan.input[yes]]);
                            }else if(child_heirs_data[i]["is_japan"] === false){
                                loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isJapan.input[no]]);
                            }
                        }
                    }else if(child_heirs_data[i]["is_live"] === false){
                        loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isLive.input[no]]);
                        
                        if(child_heirs_data[i]["is_refuse"] === true){
                            loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isRefuse.input[yes]]);
                        }else if(child_heirs_data[i]["is_refuse"] === false){
                            loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isRefuse.input[no]]);
                            loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isRemarriage.input[no]]);
                            loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isStepChild.input[no]]);
                        }
                    }
                }else if(child_heirs_data[i]["is_exist"] === false){
                    loadRbData(childHeirs[i].inputs[ChildSpouse.idxs.isExist.input[no]]);
                }
            }else{
                //子の子のとき
                loadNameData(child_heirs_data[i]["name"], childHeirs[i].inputs[GName.input]);
    
                if(child_heirs_data[i]["content_type2"] && child_heirs_data[i]["content_type2"] == 21){
                    loadRbData(childHeirs[i].inputs[GIsSameParents.input[yes]]);
                }else if(child_heirs_data[i]["content_type2"] === null || child_heirs_data[i]["content_type2"] == 27){
                    loadRbData(childHeirs[i].inputs[GIsSameParents.input[no]]);
                }
    
                if(child_heirs_data[i]["is_live"] === true){
                    loadRbData(childHeirs[i].inputs[GIsLive.input[yes]]);
    
                    if(child_heirs_data[i]["is_refuse"] === true){
                        loadRbData(childHeirs[i].inputs[GIsRefuse.input[yes]]);
                    }else if(child_heirs_data[i]["is_refuse"] === false){
                        loadRbData(childHeirs[i].inputs[GIsRefuse.input[no]]);

                        if(child_heirs_data[i]["is_adult"] === true){
                            loadRbData(childHeirs[i].inputs[GIsAdult.input[yes]]);
                        }else if(child_heirs_data[i]["is_adult"] === false){
                            loadRbData(childHeirs[i].inputs[GIsAdult.input[no]]);
                        }
            
                        if(child_heirs_data[i]["is_japan"] === true){
                            loadRbData(childHeirs[i].inputs[GIsJapan.input[yes]]);
                        }else if(child_heirs_data[i]["is_japan"] === false){
                            loadRbData(childHeirs[i].inputs[GIsJapan.input[no]]);
                        }
                    }
    
                }else if(child_heirs_data[i]["is_live"] === false){
                    loadRbData(childHeirs[i].inputs[GIsLive.input[no]]);
    
                    if(child_heirs_data[i]["is_exist"] === true){
                        loadRbData(childHeirs[i].inputs[GIsExist.input[yes]]);
    
                        if(child_heirs_data[i]["is_refuse"] === true){
                            loadRbData(childHeirs[i].inputs[GIsRefuse.input[yes]]);
                        }else if(child_heirs_data[i]["is_refuse"] === false){
                            loadRbData(childHeirs[i].inputs[GIsRefuse.input[no]]);
                            loadRbData(childHeirs[i].inputs[GIsSpouse.input[no]]);
                            loadRbData(childHeirs[i].inputs[GIsChild.input[no]]);
                        }
                    }else if(child_heirs_data[i]["is_exist"] === false){
                        loadRbData(childHeirs[i].inputs[GIsExist.input[no]]);
                        loadRbData(childHeirs[i].inputs[GIsChild.input[no]]);
                    }
                }
            }

            //すべて適切に入力されているとき次へボタンを有効化する
            oneStepFowardOrScrollToTarget(childHeirs[i]);
        }
    }   

    //父母、父方の祖父母、母方の祖父母
    if(userDataScope.includes("ascendant")){
        //父母のデータを反映させる
        for(let i = 0; i < ascendants.length; i++){
            loadNameData(ascendant_data[i]["name"], ascendants[i].inputs[AName.input]);

            if(ascendant_data[i]["is_live"] === true){
                loadRbData(ascendants[i].inputs[AIsLive.input[yes]]);

                if(ascendant_data[i]["is_refuse"] === true){
                    loadRbData(ascendants[i].inputs[AIsRefuse.input[yes]]);
                }else if(ascendant_data[i]["is_refuse"] === false){
                    loadRbData(ascendants[i].inputs[AIsRefuse.input[no]]);
                }

            }else if(ascendant_data[i]["is_live"] === false){
                loadRbData(ascendants[i].inputs[AIsLive.input[no]]);

                if(ascendant_data[i]["is_exist"] === true){
                    loadRbData(ascendants[i].inputs[AIsExist.input[yes]]);

                    if(ascendant_data[i]["is_refuse"] === true){
                        loadRbData(ascendants[i].inputs[AIsRefuse.input[yes]]);
                    }else if(ascendant_data[i]["is_refuse"] === false){
                        loadRbData(ascendants[i].inputs[AIsRefuse.input[no]]);
                        loadRbData(ascendants[i].inputs[AIsSpouse.input[no]]);
                        loadRbData(ascendants[i].inputs[AIsChild.input[yes]]);
                    }
                }else if(ascendant_data[i]["is_exist"] === false){
                    loadRbData(ascendants[i].inputs[AIsExist.input[no]]);
                }
            }

            if(ascendant_data[i]["is_japan"] === true){
                loadRbData(ascendants[i].inputs[AIsJapan.input[yes]]);
            }else if(ascendant_data[i]["is_japan"] === false){
                loadRbData(ascendants[i].inputs[AIsJapan.input[no]]);
            }

            //すべて適切に入力されているとき次へボタンを有効化する
            oneStepFowardOrScrollToTarget(ascendants[i]);
        }
        // //祖父母がいるとき、祖父母のデータを反映させる
        // if(ascendants.length > 2){

        // }
    }

    //兄弟姉妹共通
    if(userDataScope.includes("collateral_common")){
        //子の数データを取得する（is_existがtrueの場合、1が入力されてしまうため）
        const count = collateralCommons[0].inputs[CoCCount.input].value;
        const event = new Event("change");

        for(let i = 0, len = collateralCommons[0].inputs.length; i < len; i++){
            //データがあるとき
            if(i !== CoCCount.input && collateralCommons[0].inputs[i].checked){
                //チェックされたボタンに付随するイベントを発生させる
                collateralCommons[0].inputs[i].dispatchEvent(event);
            }else if(i === CoCCount.input && count > 1){
                collateralCommons[0].inputs[CoCCount.input].value = count;
                collateralCommons[0].inputs[i].dispatchEvent(event);
            }
        }
        //すべて適切に入力されているとき次へボタンを有効化する
        oneStepFowardOrScrollToTarget(collateralCommons[0]);
    }

    //兄弟姉妹
    if(userDataScope.includes("collateral")){
        for(let i = 0, len = collaterals.length; i < len; i++){
            //データがあるとき、データを反映させる
            loadNameData(collateral_data[i]["name"], collaterals[i].inputs[ColName.input]);

            if(collateral_data[i]["object_id2"] && collaterals[i].inputs[ColIsSameParents.input[yes]].disabled === false){
                loadRbData(collaterals[i].inputs[ColIsSameParents.input[yes]]);
            }else if(collateral_data[i]["object_id2"] === null && collaterals[i].inputs[ColIsSameParents.input[no]].disabled === false){
                loadRbData(collaterals[i].inputs[ColIsSameParents.input[no]]);
            }

            if(collateral_data[i]["is_live"] === true && collaterals[i].inputs[ColIsLive.input[yes]].disabled === false){
                loadRbData(collaterals[i].inputs[ColIsLive.input[yes]]);

                if(collateral_data[i]["is_refuse"] === true){
                    loadRbData(collaterals[i].inputs[ColIsRefuse.input[yes]]);
                }else if(collateral_data[i]["is_refuse"] === false && collaterals[i].inputs[ColIsRefuse.input[no]].disabled === false){
                    loadRbData(collaterals[i].inputs[ColIsRefuse.input[no]]);
                }

            }else if(collateral_data[i]["is_live"] === false){
                loadRbData(collaterals[i].inputs[ColIsLive.input[no]]);

                if(collateral_data[i]["is_exist"] === true){
                    loadRbData(collaterals[i].inputs[ColIsExist.input[yes]]);

                    if(collateral_data[i]["is_refuse"] === true){
                        loadRbData(collaterals[i].inputs[ColIsRefuse.input[yes]]);
                    }else if(collateral_data[i]["is_refuse"] === false && collaterals[i].inputs[ColIsRefuse.input[no]].disabled === false){
                        loadRbData(collaterals[i].inputs[ColIsRefuse.input[no]]);
                        loadRbData(collaterals[i].inputs[ColIsSpouse.input[no]]);
                        loadRbData(collaterals[i].inputs[ColIsChild.input[no]]);
                    }
                }else if(collateral_data[i]["is_exist"] === false){
                    loadRbData(collaterals[i].inputs[ColIsExist.input[no]]);
                    loadRbData(collaterals[i].inputs[ColIsChild.input[no]]);
                }
            }

            if(collateral_data[i]["is_adult"] === true && collaterals[i].inputs[ColIsAdult.input[yes]].disabled === false){
                loadRbData(collaterals[i].inputs[ColIsAdult.input[yes]]);
            }else if(collateral_data[i]["is_adult"] === false){
                loadRbData(collaterals[i].inputs[ColIsAdult.input[no]]);
            }

            if(collateral_data[i]["is_japan"] === true && collaterals[i].inputs[ColIsJapan.input[yes]].disabled === false){
                loadRbData(collaterals[i].inputs[ColIsJapan.input[yes]]);
            }else if(collateral_data[i]["is_japan"] === false){
                loadRbData(collaterals[i].inputs[ColIsJapan.input[no]]);
            }

            //すべて適切に入力されているとき次へボタンを有効化する
            oneStepFowardOrScrollToTarget(collaterals[i]);
        }
    }
}

/**
 * タイトルのナンバリング（「本番－枝番」の部分）を取得する
 * @param {HTMLElement} titleEl タイトル要素
 * @returns タイトルのナンバリング
 */
function getTitleNumbering(titleEl){
    const title = titleEl.textContent;
    const removedSpace = title.replace(/\n|\s/g, "");
    return removedSpace.split("．")[0];
}

/**
 * 子個人又は兄弟姉妹個人のフィールドセットを生成する
 * @param {HTMLElement} preFieldset コピー元のフィールドセット
 * @param {string} relation "child"又は"collateral"
 * @param {number} newIdx 属性に付与する新しいインデックス
 * @returns コピー元のタイトルと属性値を変更した後の新しいfieldset
 */
function createChildOrCollateralFieldset(preFieldset, relation, newIdx){
    const newFieldset = preFieldset.cloneNode(true);
    updateAttribute(newFieldset, "[id], [name], [for]", /(-)(\d+)/, newIdx);

    const titleEl = newFieldset.querySelector(".fieldsetTitle");
    const zokugara = relation === "child"? "子": "兄弟姉妹";
    UpdateTitle.childOrCollateralFollowing(titleEl, zokugara);

    return newFieldset;
}

/**
 * 次のfieldsetを表示する
 * @param {HTMLElement} nextFieldset 表示するfieldset
 */
async function displayNextFieldset(nextFieldset){
    //次のfieldsetを表示/hrを挿入/次のfieldsetにスクロール/最初の入力欄にフォーカス
    slideDownIfHidden(nextFieldset);
    const hr = document.createElement("hr");
    hr.className = "my-5";
    nextFieldset.before(hr);
    scrollToTarget(nextFieldset);
    nextFieldset.querySelector("input").focus();
}

/**
 * ガイドを押したら対象のfieldsetにスクロールするイベントを設定する
 * @param {event} e クリックイベント
 */
function scrollToTargetHandler(e){
    const idx = Guide.btns.indexOf(e.target);
    scrollToTarget(reqInstance[idx].fieldset, 0);
}

/**
 * 次のガイド要素を取得して強調する（事前にGuide.elIdxの加算をすること）
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function activeGuide(guideList){
    const nextIdx = Guide.elIdx;
    const nextGuide = guideList.getElementsByClassName("guide")[nextIdx];
    const nextBtn = guideList.getElementsByClassName(Classes.guide.btn)[nextIdx];
    const nextCaretIcon = guideList.getElementsByClassName("guideCaret")[nextIdx];
    Guide.guides.push(nextGuide);
    Guide.btns.push(nextBtn);
    Guide.caretIcons.push(nextCaretIcon);
    if(window.getComputedStyle(nextGuide).display === "none")
        nextGuide.style.display = "block";
    nextGuide.classList.add("active");
    nextBtn.disabled = false;
    nextCaretIcon.style.display = "inline-block";
}

/**
 * 完了したfieldsetのガイドを通常表示にする
 * @param {boolean} isDone 完了fieldsetか判別
 */
function inactiveGuide(isDone){
    const guideList = document.getElementById("guideList");
    try{
        const lastGuide = getLastElFromArray(Guide.guides);
        lastGuide.classList.remove("active");
        const lastCaretIcon = getLastElFromArray(Guide.caretIcons);
        lastCaretIcon.style.display = "none";
        if(isDone){
            const lastGuideCheck = lastGuide.getElementsByClassName(Classes.guide.check)[0];
            lastGuideCheck.style.display = "inline-block";
        }else{
            Guide.checkIcons.push(guideList.getElementsByClassName(Classes.guide.check)[Guide.elIdx]);
            getLastElFromArray(Guide.checkIcons).style.display = "inline-block";
        }
    }catch(e){
        basicLog("inactiveGuide", e, `ガイドを通常表示に戻す処理でエラー（isDone=${isDone}）`)
    }
}

/**
 * 子個人又は兄弟姉妹個人のガイドを生成/タイトル変更/ガイドを表示/idを変更/１つ前のガイドの次に挿入する
 * @param {string} relation 続柄（child又はcollateral）
 * @param {number} idx 続柄インデックス（例：子１のときは１）
 */
function createChildOrCollateralGuide(relation, idx){
    const zokugara = relation === "child" ? "子": "兄弟姉妹";
    //直前のガイドをコピー
    const copyFrom = getLastElByAttribute(`${relation}Guide`, "class");
    const clone = copyFrom.cloneNode(true);
    //タイトルの枝番を変更
    UpdateTitle.childOrCollateralFollowing(clone.querySelector("button"), zokugara);
    //idを変更して非表示から表示に変更して最後の要素の次に挿入する
    clone.style.display = "block";
    clone.id = `id_${relation}-${idx}-guide`;
    copyFrom.after(clone);
}

/**
 * 子のガイドの数を追加又は削除する/追加のときは、タイトルとidを変更して表示する/全ての子を表示する
 * @param {string} relation 続柄（child又はcollateral）
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function regenerateChildOrCollateralGuide(relation, guideList){

    const guides = Array.from(guideList.getElementsByClassName(`${relation}Guide`));
    removeAllExceptFirst(guides);
    
    const newCount = relation === "child"? childs.length: collaterals.length;
    for(let i = 1; i < newCount; i ++){
        createChildOrCollateralGuide(relation, i);
    }

    //子のガイドが２つ以上あるとき、子１以外のガイドも表示する
    if(guides.length > 1)
        displayAdditionalGuide(guideList, `.${relation}Guide`);
}

/**
 * 子の配偶者と孫のガイド両方を生成して属性値も更新する
 */
function createChildsHeirGuides(){
    const childsHeirInstances = getSortedChildsHeirsInstance();
    let guideCount = { childSpouse: 0, grandChild: 0 }; //子の配偶者、孫のインデックス（ガイドのidに付与するインデックス用）
    let copyFrom = getLastElByAttribute(Classes.guide.child, "class");
    childsHeirInstances.forEach(instance => {
        const clone = copyFrom.cloneNode(true);
        clone.style.display = "block";
        const btn = clone.querySelector("button");
        btn.disabled = "true";
        const type = instance.fieldset.classList.contains(Classes.fieldset.childSpouse) ? "childSpouse" : "grandChild";
        btn.textContent = instance.fieldset.getElementsByClassName(Classes.fieldset.title)[0].textContent;
        clone.id = `id_${type === "childSpouse" ? "child_spouse" : "grand_child"}-${guideCount[type]}-guide`;
        clone.className = `card-title guide ${type}Guide childsHeirGuide`;
        clone.getElementsByClassName(Classes.guide.check)[0].style.display = "none";
        copyFrom.after(clone);
        copyFrom = clone;
        guideCount[type] += 1;
    });
}

/**
 * 子の配偶者又は孫のガイドいずれかのみ生成する
 * @param {(ChildSpouse|GrandChild)[]} persons 生成する系統（childSpouses又はgrandChilds）
 */
function createChildsHeirGuide(persons){
    const isChildSpouse = persons[0].constructor.name === "ChildSpouse";
    const relation = isChildSpouse? "childSpouse": "grandChild";
    const idPrefix = isChildSpouse? "child_spouse": "grand_child";
    const fieldsets = document.getElementsByClassName(Classes.fieldset.childHeir);
    let copyFrom = getLastElByAttribute(Classes.guide.child, "class");
    //fieldsetは子の配偶者又は孫のテンプレとして残ってるだけの可能性があるためインスタンスの数でループする
    for(let i = 0, len = persons.length; i < len; i ++){
        const clone = copyFrom.cloneNode(true);
        clone.style.display = "block";
        const btn = clone.querySelector("button");
        btn.disabled = "true";
        btn.textContent = fieldsets[i].querySelector(".fieldsetTitle").textContent;
        clone.id = `id_${idPrefix}-${i}-guide`;
        clone.className = `card-title guide ${relation}Guide childsHeirGuide`;
        clone.getElementsByClassName(Classes.guide.check)[0].style.display = "none";
        copyFrom.after(clone)
        copyFrom = clone;
    }
}

/**
 * 追加のガイドを表示する
 * @param {HTMLElement} guideList ガイドのラッパー要素
 * @param {string} selector querySelectorAllで指定するセレクタ
 * @example 子が複数いるときに子１の表示と同時に他の子も全員表示するなど
 */
function displayAdditionalGuide(guideList, selector){
    Array.from(guideList.querySelectorAll(selector)).slice(1).forEach(el => el.style.display = "block");
}

/**
 * 子共通欄から父欄を表示するときのガイド処理
 * ・子１以外のガイドを削除
 * ・母のガイドを無効化した状態で表示する
 * ・尊属ガイドのタイトルを変更する
 * ・表示するガイドのインデックスを２加算する（子１のガイドをスキップするため）
 * @param {HTMLElement} guideList 
 */
function childCommonToFatherGuide(guideList){
    removeAllExceptFirst(guideList.getElementsByClassName(Classes.guide.child));
    UpdateTitle.parentsGuide(Ids.fieldset.father, Ids.fieldset.mother, Ids.guide.father, Ids.guide.mother);
}

/**
 * 最後の子から次に表示するガイドを判別する
 * @param {HTMLElement} guideList ガイド全体の要素
 */
function selectChildGuideTo(guideList){
    //子の配偶者と孫のガイドを全て削除する
    removeAll(guideList.querySelectorAll(".childSpouseGuide, .grandChildGuide"));
    
    //子の配偶者と孫がいるときを表示するとき
    if(childSpouses.length > 0 && grandChilds.length > 0){
        createChildsHeirGuides();
    }else if(childSpouses.length > 0){
        //子の配偶者のみいるとき
        createChildsHeirGuide(childSpouses);
    }else if(grandChilds.length > 0){
        //孫のみいるとき
        createChildsHeirGuide(grandChilds);
    }else{
        //父欄を表示するとき
        UpdateTitle.parentsGuide(Ids.fieldset.father, Ids.fieldset.mother, Ids.guide.father, Ids.guide.mother);
    }
}

/**
 * ガイドを更新する
 * @param {EveryInstance} fromInstance １つ前に入力された人
 * @param {EveryInstance} nextInstance 次に入力してもらう人
 */
function updateGuide(fromInstance, nextInstance){
    const fromFieldsetId = fromInstance.fieldset.id;
    const nextFieldsetId = nextInstance.fieldset.id;
    const guideList = document.getElementById("guideList");
    // 一つ前のガイドを通常表示にする
    inactiveGuide(false);
    // 子共通欄から父欄を表示するとき
    if(fromInstance === childCommon && nextFieldsetId === Ids.fieldset.father){
        childCommonToFatherGuide(guideList);
        Guide.elIdx += 2;
    }else if(fromFieldsetId === Ids.fieldset.mother && nextFieldsetId === Ids.fieldset.collateralCommon){
        // 母から兄弟姉妹共通を表示するとき
        UpdateTitle.collateralCommonGuide(guideList);
        Guide.elIdx += 5;
    }else if(fromFieldsetId === Ids.fieldset.mother && nextFieldsetId === Ids.fieldset.motherGF){
        // 母から母方の祖父を表示するとき
        UpdateTitle.parentsGuide(Ids.fieldset.motherGF, Ids.fieldset.motherGM, Ids.guide.motherGF, Ids.guide.motherGM);
        Guide.elIdx += 3;
    }else if(fromFieldsetId === Ids.fieldset.fatherGM && nextFieldsetId === Ids.fieldset.collateralCommon){
        // 父方の祖母から兄弟姉妹共通を表示するとき
        UpdateTitle.collateralCommonGuide(guideList);
        Guide.elIdx += 3;
    }else{
         // 通常の相続の流れのとき（具体的には以下のとおり）
        Guide.elIdx += 1;
        
        // 子共通欄から子１を表示するとき、子の人数に応じてガイドの数を増やす
        if(fromInstance === childCommon){
            regenerateChildOrCollateralGuide("child", guideList);
        }else if(childs.length > 0 && fromInstance === getLastElFromArray(childs)){
            // 最後の子からのとき
            selectChildGuideTo(guideList);
        }else if(nextFieldsetId === Ids.fieldset.father){
            // 子または子の相続人から父のとき
            UpdateTitle.parentsGuide(Ids.fieldset.father, Ids.fieldset.mother, Ids.guide.father, Ids.guide.mother);
        }else if(fromFieldsetId === Ids.fieldset.mother){
            // 母から父方の祖父を表示するとき
            UpdateTitle.parentsGuide(Ids.fieldset.fatherGF, Ids.fieldset.fatherGM, Ids.guide.fatherGF, Ids.guide.fatherGM);
        }else if(fromFieldsetId === Ids.fieldset.fatherGM){
            // 父方の祖母から母方の祖父を表示するとき
            UpdateTitle.parentsGuide(Ids.fieldset.motherGF, Ids.fieldset.motherGM, Ids.guide.motherGF, Ids.guide.motherGM);
        }else if(fromFieldsetId === Ids.fieldset.motherGM){
            // 母方の祖母からのとき
            UpdateTitle.collateralCommonGuide(guideList);
        }else if(fromFieldsetId === Ids.fieldset.collateralCommon){
            // 兄弟姉妹全員からのとき
            const titleEl = UpdateTitle.getTitleEl(document.getElementById(Ids.guide.firstCollateral), false);
            titleEl.textContent = UpdateTitle.getFieldsetTitle({instance: nextInstance});
            regenerateChildOrCollateralGuide("collateral", guideList);
        }
    }
    //次の項目を強調する
    activeGuide(guideList);
    //次の項目のガイドボタンにイベントを追加
    getLastElFromArray(Guide.btns).addEventListener("click", scrollToTargetHandler);
}

/**
 * インスタンスの初期化処理
 * @param {EveryInstance} instance 
 * @param {HTMLFieldSetElement} fieldset 
 */
function iniInstanceAndFieldset(instance, fieldset){
    replaceElements(fieldset, "input, button");
    instance.inputs = Array.from(fieldset.getElementsByTagName("input"));
    instance.preBtn = fieldset.getElementsByClassName("preBtn")[0];
    instance.nextBtn = fieldset.getElementsByClassName("nextBtn")[0];
    // replaceElementsによって更新された同じinput要素に更新
    instance.noInputs = instance.noInputs.map(input => {
        return fieldset.querySelector(`input[id="${input.id}"]`);
    });
    // plusBtnとminusBtn属性がinstanceに存在する場合にのみ要素を設定
    if('minusBtn' in instance){
        instance.minusBtn = fieldset.getElementsByClassName("decreaseBtn")[0];
    }
    if('plusBtn' in instance){
        instance.plusBtn = fieldset.getElementsByClassName("increaseBtn")[0];
    }
}

/**
 * 前の項目を有効化する
 * @param {EveryInstance} currentInstance 無効化対象のインスタンス
 */
function putBackFieldset(currentInstance){
    const disableField = currentInstance.fieldset; //無効化対象のfieldset
    const removeHr = disableField.previousElementSibling; //削除対象のhrタグ
    //無効化するフィールドにあるイベントが設定されている要素を初期化してイベントを削除する
    iniInstanceAndFieldset(currentInstance, disableField);
    //削除対象を非表示にしてから削除。必須欄から削除対象を削除。
    slideUp(disableField);
    slideUp(removeHr);
    removeHr.remove();
    reqInstance.pop();
    //直前の項目を有効化してスクロール
    const preFieldset = getLastElFromArray(reqInstance).fieldset;
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
}

/**
 * 最後のガイドを削除する
 */
function removeLastGuide(){
    const idx = Guide.guides.length - 1;
    Guide.guides[idx].classList.remove("active");
    Guide.guides.pop();

    Guide.btns[idx].removeEventListener("click", scrollToTargetHandler);
    Guide.btns[idx].disabled = true;
    Guide.btns.pop();

    Guide.caretIcons[idx].style.display = "none";
    Guide.caretIcons.pop();
}

/**
 * 一つ前のガイドを作業中にする
 * @param {boolean} isFromSubmitFieldset 完了fieldsetから戻ってきたときtrue
 */
function enablePreGuide(isFromSubmitFieldset){
    try{
        const lastGuide = getLastElFromArray(Guide.guides);
        lastGuide.classList.add("active");
        const lastCaretIcon = getLastElFromArray(Guide.caretIcons);
        lastCaretIcon.style.display = "inline-block";
        const lastCheckIcon = getLastElByAttribute(Classes.guide.check, "class", lastGuide);
        lastCheckIcon.style.display = "none";
        if(!isFromSubmitFieldset)
            Guide.checkIcons.pop();
    }catch(e){
        throw new Error(`enablePreGuideでエラー\n１つ前のガイドを作業中の表示にする処理でエラー\nisFromSubmitFieldset=${isFromSubmitFieldset}`);
    }
}

/**
 * 現在のガイドがその続柄のうち最初のインデックスのとき、同じ続柄のガイドを一括してスライドアップする
 * 
 * 子の相続人のガイドはスライドアップと同時に削除する
 * @param {string} currentGuideId 現在のガイドのid
 */
function slideUpSameRelationGuides(currentGuideId){
    const guideClasses = {
        "id_child-0-guide": Classes.guide.child,
        "id_ascendant-0-guide": Classes.guide.ascendant,
        "id_ascendant-2-guide": Classes.guide.fatherG,
        "id_ascendant-4-guide": Classes.guide.motherG,
        "id_collateral_common-0-guide": Classes.guide.collateralCommon,
        "id_collateral-0-guide": Classes.guide.collateral
    };
    //孫１が子の相続人のうち最初の相続人のとき、guideClassesに要素を追加する
    if(currentGuideId === Guide.guides.filter(x => x.classList.contains(Classes.guide.childHeir))[0]?.id){
        guideClasses["id_child_spouse-0-guide"] = Classes.guide.childHeir;
        guideClasses["id_grand_child-0-guide"] = Classes.guide.childHeir;
    }

    //現在のガイドのidがguideClassesに存在するとき、現在のガイドと同じクラスを持つ全ての要素を一括して非表示にする
    if(currentGuideId in guideClasses){
        const guides = Array.from(document.getElementsByClassName(guideClasses[currentGuideId]));
        slideUpEls(guides, 0, guides.length - 1);
        if(guideClasses["id_grand_child-0-guide"])
            removeAll(guides);
    }
}

/**
 * 強調するガイドの要素のインデックスを戻す
 * @param {string} currentGuideId 現在強調されているガイドのid
 */
function putBackGuideElIdx(currentGuideId){
    //現在のガイドが父、かつ子がいないとき２戻す（子共通のインデックスに戻す）
    const childCount = childCommon.countChilds();
    if(currentGuideId === Ids.guide.father && childCount === 0) 
        Guide.elIdx -= 2;
    //現在のガイドが母方の祖父、かつ尊属のインスタンスが４つ（父、母、母方の祖父、母方の祖母）のとき、３つ戻す（母のインデックスに戻す）
    else if(currentGuideId === Ids.guide.motherGF && !ascendants.some(x => x.fieldset.id === Ids.fieldset.fatherGF)) 
        Guide.elIdx -= 3;
    //現在のガイドが兄弟姉妹共通、かつ最後の尊属のインスタンスのidが父方の祖母のとき、３つ戻す（父方の祖母のインデックスに戻す）
    else if(currentGuideId === Ids.guide.collateralCommon && getLastElFromArray(ascendants).fieldset.id === Ids.fieldset.fatherGM) 
        Guide.elIdx -= 3;
    //現在のガイドが兄弟姉妹共通、かつ尊属のインスタンスが２つ（父、母）のとき、５つ戻す（母のインデックスに戻す）
    else if(currentGuideId === Ids.guide.collateralCommon && ascendants.length === 2) 
        Guide.elIdx -= 5;
    else 
        Guide.elIdx -= 1;
}

/**
 * ガイドを一つ戻す
 */
function putBackGuide(){
    //現在強調されているガイドのid
    const currentGuideId = getLastElFromArray(Guide.guides).id;
    //続柄の最初のインデックスの要素のとき、同じ続柄のガイドを全て非表示にする
    slideUpSameRelationGuides(currentGuideId);
    //押されたボタンに応じてガイドの表示している要素のインデックスを変更する
    putBackGuideElIdx(currentGuideId);
    //ガイドのデータを削除する
    removeLastGuide();
    //一つ前の項目をactiveにする
    enablePreGuide(false);
}

/**
 * 前の項目を有効化にする
 * @param {EveryInstance} currentInstance 押された戻るボタンが属するfieldsetのインスタンス
 */
function oneStepBack(currentInstance){
    return function(e){
        //前の項目を有効化とガイドの巻き戻し
        putBackGuide();
        putBackFieldset(currentInstance);
    }
}

/**
 * インデックスが連続する要素を非表示にする
 * @param {HTMLElement[]} els 対象の要素の配列
 * @param {number} startIdx 非表示を開始する要素のインデックス
 * @param {number} endIdx 非表示を終了する要素のインデックス
 * @return {boolean}
 */
function slideUpEls(els, startIdx, endIdx){
    if(!Array.isArray(els))
        els = [els];
    let isSlideUp = false;
    for(let i = startIdx; i < endIdx + 1; i++){
        if(window.getComputedStyle(els[i]).display !== "none"){
            slideUp(els[i]);
            isSlideUp = true;
        } 
    }
    return isSlideUp;
}

/**
 * エラー配列に対象のエラー要素がないとき追加する（オプションでボタンの無効化も可）
 * @param {EveryInstance} instance 対象の人
 * @param {HTMLElement} el 対象のエラー要素
 */
function pushInvalidEl(instance, el){
    if(!instance.noInputs.some(x => x.id === el.id)){
        instance.noInputs.push(el);
        instance.nextBtn.disabled = true;
    }
}

/**
 * エラー要素を追加して要素をスライドダウン表示する
 * 
 * pushInvalidElとslideDownIfHiddenをまとめた関数
 * @param {EveryInstance} person 対象の人
 * @param {HTMLElement} errEl 追加するエラー要素
 * @param {HTMLElement} displayEl スライドダウン表示する要素
 */
function pushInvalidElAndSDIfHidden(person, errEl, displayEl){
    pushInvalidEl(person, errEl);
    slideDownIfHidden(displayEl);
}

/**
 * isLiveとisExistに変更があったときの処理
 * 
 * pushInvalidEl([0],[1])
 * 
 * iniQs([2],[3],[4],[5])
 * 
 * slideDownAfterSlideUp([7]をまとめた関数
 * @param {...(HTMLElement|number)} args 
 * [0] {EveryInstance} instance
 * [1] {HTMLElement} el
 * [2] {number} startIdx 
 * [3] {number} endIdx 
 * [4] {number[]} rbIdxs
 * [5] {HTMLElement} textInput
 * [6] {HTMLElement} el
 */
function changeCourse(...args){
    if(args[0])
        pushInvalidEl(args[0], args[1]);

    const isSlideUp = iniQs(args[0], args[2], args[3], args[4], args[5]);

    let delay = 0;
    if(isSlideUp)
        delay = 250;
    slideDownAfterDelay(args[6], delay);
}

/**
 * 連番の数字を配列に入れて返す（オプションで特定の数字（複数可）を除外可）
 * @param {number} startIdx 配列に格納する最初の数字
 * @param {number} endIdx 配列に格納する最後の数字
 * @param {Array} exclude 除外したい数字を格納した配列 
 * @return オプションで除外した数字を除く連続した数字を格納した配列
 */
function getSequentialNumArr(startIdx, endIdx, exclude = []){
    if(!Array.isArray(exclude))
        exclude = [exclude];
    return Array.from({length: endIdx - startIdx + 1}, (_, i) => startIdx + i).filter(num => !exclude.includes(num));
}

/**
 * 複数の質問欄を非表示にして値を初期化する
 * @param {EveryInstance} instance 対象のインスタンス
 * @param {number} startIdx 非表示を開始する質問欄のインデックス
 * @param {number} endIdx 非表示を終了する質問欄のインデックス
 * @param {number} rbIdxs 初期化するラジオボタンの配列
 * @param {HTMLElement} textInput 人数テキストボックスの初期化
 * @return {boolean} スライドアップしたフラグ（したときはtrue、してないときはfalse）
 */
function iniQs(instance, startIdx, endIdx, rbIdxs, textInput = null){
    const {inputs, Qs, errMsgEls} = instance;
    uncheckTargetElements(inputs, rbIdxs);

    if(textInput !== null)
        textInput.value = textInput.type === "number" ? "0": "";

    iniErrMsgEls(errMsgEls.slice(startIdx, endIdx));

    const isSlideUp = slideUpEls(Qs, startIdx, endIdx);
    return isSlideUp;
}

/**
 * 特定の入力欄をチェックして次へボタントグルとiniQs
 * @param {HTMLElement} checkEl 次へボタン有効化前にチェックするエラー要素
 * @param {EveryInstance} instance 対象の人
 * @param {number} iniStartIdx 初期化を開始する質問のインデックス
 * @param {number} iniEndIdx 初期化を終了する質問のインデックス
 * @param {number[]} iniRbIdxs 初期化するラジオボタンのインデックス
 * @param {HTMLElement} textInput テキスト要素（必要なときだけ）
 */
function breakQ(checkEl, instance, iniStartIdx = null, iniEndIdx = null, iniRbIdxs = null, textInput = null){

    if(checkEl)
        instance.noInputs = instance.noInputs.filter(x => x.id === checkEl.id);
    else
        instance.noInputs.length = 0;

    if(instance.noInputs.length === 0)
        instance.nextBtn.disabled = false;

    if(iniStartIdx)
        iniQs(instance, iniStartIdx, iniEndIdx, iniRbIdxs, textInput);
}

/**
 * 共通のラジオボタンイベントハンドラー
 */
class CommonRbHandler{
    //true又はfalseに応じた処理を行う
    static handleYesNo(rbIdx, yesIdx, yesAction, noAction){
        if(rbIdx === yesIdx)
            yesAction();
        else
            noAction();
    }
    //日本在住
    static isJapan(person, idx){
        breakQ(person.inputs[idx], person);
    }
}
/**
 * 対象のエラーメッセージ要素を非表示にしてテキストを初期化する
 * @param {HTMLElement|HTMLElement[]} errMsgEls
 */
function iniErrMsgEls(errMsgEls){
    if(!Array.isArray(errMsgEls))
        errMsgEls = [errMsgEls];

    errMsgEls.forEach(x => {
        x.style.display = "none";
        x.innerHTML = "";
    })
}

/**
 * システム対応外であることを表示する
 * @param {HTMLElement} el
 * @param {string} msg
 */
function displayNotAvailable(el, msg = null){
    el.style.display = "block";
    el.innerHTML = msg? msg: "本システムでは対応できません";
    const modalEl = document.getElementById("not-available-modal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

/**
 * システム対応外になるチェックがされたとき
 * エラー要素を追加して次へボタンを無効化、質問欄を初期化、メッセージ表示
 * @param {EveryIndivisual} instance 
 * @param {HTMLInputElement} errInput 
 * @param {number} iniStartIdx 
 * @param {number} iniEndIdx 
 * @param {number[]} iniRbIdxs 
 * @param {HTMLInputElement} iniRbIdxs 
 * @param {HTMLElement} errMsgEl 
 */
function notAvailablePattern(instance, errInput, iniStartIdx, iniEndIdx, iniRbIdxs, textInput, errMsgEl){
    pushInvalidEl(instance, errInput);
    if(iniStartIdx)
        iniQs(instance, iniStartIdx, iniEndIdx, iniRbIdxs, textInput);
    displayNotAvailable(errMsgEl);
}

/**
 * 氏名欄のトグル
 * @param {EveryIndivisual} instance 
 * @param {boolean} isEnable 
 */
function toggleName(instance, isEnable){
    const nameInput = instance.inputs[instance.constructor.idxs.name.input];

    if(isEnable){
        nameInput.disabled = false;
        nameInput.dispatchEvent(new Event("change"));
    }else{
        nameInput.value = "";
        nameInput.disabled = true;
    }
}

/**
 * 子共通のトグル
 * @param {boolean} isYesAction 
 * @returns 
 */
function toggleChildCommonQs(isYesAction){
    const childCount = childCommon.countChilds();
    const childCommonQs = childCommon.Qs;
    const childCommonIdxs = ChildCommon.idxs;

    if(childCount < 2)
        return;

    // 配偶者確認欄を表示する
    if(isYesAction){
        childCommonQs[childCommonIdxs.isSameParents.form].style.display = "";
    }else{
        // 子共通の配偶者の子確認欄を非表示/「いいえ」にチェックを入れる/健在確認欄を表示する（子共通のイベント設定がまだのためdispatchEventは不可）
        childCommon.inputs[childCommonIdxs.isSameParents.input[no]].checked = true;
        childCommonQs[childCommonIdxs.isSameParents.form].style.display = "none";
        childCommonQs[childCommonIdxs.isLive.form].style.display ="";
    }
}

/**
 * 配偶者のラジオボタンのイベントハンドラー
 */
class SpouseRbHandler extends CommonRbHandler{
    // 相続時存在
    static isExist(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, SIsExist.input[yes],
            ()=>{
                // yesAction
                // エラー要素に日本在住を追加して、次へボタンを無効にして、手続時存在を表示する
                pushInvalidElAndSDIfHidden(instance, inputs[SIsJapan.input[yes]], Qs[SIsLive.form]);
                // 氏名欄トグル
                toggleName(instance, true);
                // 子共通トグル
                toggleChildCommonQs(true);
            },
            ()=>{
                // noAction
                // 氏名欄トグル
                toggleName(instance, false);
                // エラー要素を初期化
                iniErrMsgEls(errMsgEls[SName.form]);
                // isLive以降の質問を初期化
                const rbIdxs = getSequentialNumArr(SIsLive.input[yes], SIsJapan.input[no])
                breakQ(null, instance, SIsLive.form, SIsJapan.form, rbIdxs)
                // 子共通トグル
                toggleChildCommonQs(false);
            }
        )
    }

    // 手続時存在（trueのとき、相続人判定へ、falseのとき数次相続判定へ）
    static isLive(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        const rbidxs = getSequentialNumArr(SIsRefuse.input[yes], SIsJapan.input[no]);
        this.handleYesNo(rbIdx, SIsLive.input[yes],
            ()=>{
                changeCourse(
                    instance, inputs[SIsJapan.input[yes]], // pushInvalidElの引数
                    SIsRemarriage.form, SIsJapan.form, rbidxs, null, // iniQsの引数
                    Qs[SIsRefuse.form] // slideDownAfterDelayの引数
                );
            },
            ()=>{
                changeCourse(
                    instance, inputs[SIsStepChild.input[yes]],
                    SIsRemarriage.form, SIsJapan.form, rbidxs, null,
                    Qs[SIsRefuse.form]
                );
                iniErrMsgEls([errMsgEls[SIsRemarriage.form], errMsgEls[SIsStepChild.form]]);
            }
        )
    }

    // 相続放棄
    static isRefuse(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, SIsRefuse.input[yes],
            ()=>{
                // 氏名が入力されているときは次へボタンを有効化して、日本在住を初期化
                const rbidxs = getSequentialNumArr(SIsRemarriage.input[yes], SIsJapan.input[no]);
                breakQ(inputs[SName.input], instance, SIsRemarriage.form, SIsJapan.form, rbidxs);
            },
            ()=>{
                //isLiveがtrueのとき
                if(inputs[SIsLive.input[yes]].checked){
                    // 次へボタンを無効化、日本在住欄を表示する
                    pushInvalidElAndSDIfHidden(instance, inputs[SIsJapan.input[yes]], Qs[SIsJapan.form]);
                }else if(inputs[SIsLive.input[no]].checked){
                    // 数次相続チェック
                    pushInvalidElAndSDIfHidden(instance, inputs[SIsStepChild.input[no]], Qs[SIsRemarriage.form]);
                    iniErrMsgEls([errMsgEls[SIsRemarriage.form], errMsgEls[SIsStepChild.form]]);
                }
            }
        )
    }

    //配偶者存在
    static isSpouse(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, SIsRemarriage.input[yes],
            ()=>{
                // システム対応外パターン
                notAvailablePattern(
                    instance, inputs[SIsStepChild.input[no]], // pushInvelidEl
                    SIsStepChild.form, SIsStepChild.form, SIsStepChild.input, null, // iniQs
                    errMsgEls[SIsRemarriage.form] // displayNotAvailable
                );
            },
            ()=>{
                //エラーを非表示にする/被相続人以外の子を表示する
                iniErrMsgEls([errMsgEls[SIsRemarriage.form], errMsgEls[SIsStepChild.form]]);
                slideDownIfHidden(Qs[SIsStepChild.form]);
            }
        )
    }

    //被相続人以外の子を表示する
    static isStepChild(instance, rbIdx){
        const {inputs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, SIsStepChild.input[yes],
            ()=>{
                // システム対応外パターン
                notAvailablePattern(
                    instance, inputs[SIsStepChild.input[no]],
                    null, null, null, null,
                    errMsgEls[SIsStepChild.form]
                )
            },
            ()=>{
                //エラーを非表示にする/名前が入力されているときは次へボタンを有効化する
                iniErrMsgEls(errMsgEls[SIsStepChild.form]);
                breakQ(inputs[SName.input], instance);
            }
        )
    }
}

/**
 * 配偶者項目のラジオボタンイベントを設定する
 * @param {Spouse} instance 対象の配偶者
 * @param {number} rbIdx 押されたラジオボタンのインデックス
 */
function setSpouseRbsEvent(instance, rbIdx){
    //相続時存在
    if(SIsExist.input.includes(rbIdx)) SpouseRbHandler.isExist(instance, rbIdx);
    //手続時存在
    else if(SIsLive.input.includes(rbIdx)) SpouseRbHandler.isLive(instance, rbIdx);
    //相続放棄
    else if(SIsRefuse.input.includes(rbIdx)) SpouseRbHandler.isRefuse(instance, rbIdx);
    //配偶者存在
    else if(SIsRemarriage.input.includes(rbIdx)) SpouseRbHandler.isSpouse(instance, rbIdx);
    //被相続人以外の子存在
    else if(SIsStepChild.input.includes(rbIdx)) SpouseRbHandler.isStepChild(instance, rbIdx);
    //日本在住
    else SpouseRbHandler.isJapan(instance, SName.input);
}

/**
 * 子の配偶者のラジオボタンのイベントハンドラー
 */
class ChildSpouseRbHandler extends SpouseRbHandler{
    // 相続時存在
    static isExist(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, SIsExist.input[yes],
            ()=>{
                // yesAction
                // 次へボタンを無効化/手続時存在を表示する
                pushInvalidElAndSDIfHidden(instance, inputs[SIsJapan.input[yes]], Qs[SIsLive.form]);
            },
            ()=>{
                // noAction
                // isLive以降の質問を初期化
                const rbIdxs = getSequentialNumArr(SIsLive.input[yes], SIsJapan.input[no]);
                breakQ(inputs[SName.input], instance, SIsLive.form, SIsJapan.form, rbIdxs);
            }
        )
    }
}

/**
 * 配偶者項目のラジオボタンイベントを設定する
 * @param {Spouse} instance 対象の配偶者
 * @param {number} rbIdx 押されたラジオボタンのインデックス
 */
function setChildSpouseRbsEvent(instance, rbIdx){
    //相続時存在
    if(SIsExist.input.includes(rbIdx)) ChildSpouseRbHandler.isExist(instance, rbIdx);
    //手続時存在
    else if(SIsLive.input.includes(rbIdx)) ChildSpouseRbHandler.isLive(instance, rbIdx);
    //相続放棄
    else if(SIsRefuse.input.includes(rbIdx)) ChildSpouseRbHandler.isRefuse(instance, rbIdx);
    //配偶者存在
    else if(SIsRemarriage.input.includes(rbIdx)) ChildSpouseRbHandler.isSpouse(instance, rbIdx);
    //被相続人以外の子存在
    else if(SIsStepChild.input.includes(rbIdx)) ChildSpouseRbHandler.isStepChild(instance, rbIdx);
    //日本在住
    else ChildSpouseRbHandler.isJapan(instance, SName.input);
}

/**
 * 親のindexを取得する
 * @param {Child|GrandChild|Collateral} instance 
 * @param {Spouse|ChildSpouse|Ascendant} parent 
 */
function getParentIndex(instance, parent){
    const {inputs, constructor} = parent;
    const isParent = inputs[constructor.idxs.isExist.input[yes]].checked;
    if(isParent){
        const parentIndex = inputs[constructor.idxs.index.input].value.trim(); // 親のindex
        instance.inputs[instance.constructor.idxs.target2.input].value = parentIndex;
    }else{
        basicLog("getParentIndex", null, "親の確認欄で「はい」が選択されましたが、親のisExistがtrueではありません。");
    }
}

/**
 * 兄弟姉妹全員と反する値に対してアラート表示する
 */
class AlertForContradictionToCollateralCommon{

    static alertTitle = "※確認です※";

    static messageTemplate(commonQ, commonA, indivisualQ, indivisualA){
        return `${this.alertTitle}\n「兄弟姉妹全員」の「${commonQ}」に対して「${commonA}」がチェックされてますが、各兄弟姉妹の「${indivisualQ}」に対して「${indivisualA}」がチェックされてます。`;
    }

    static process(isAlert, common, commonIdx, inds, indIdx, commonQ, commonA, indQ, indA){
        const commonData = common.inputs[commonIdx].checked;
        const indData = inds.every(x => x.inputs[indIdx].checked);
        if(commonData && indData){
            if(!isAlert)
                return true;

            alert(this.messageTemplate(commonQ, commonA, indQ, indA));
        }
        return false
    }

    static isSameParents(isAlert = true){
        return this.process(
            isAlert,
            collateralCommons[0], 
            CoCIsSameParents.input[no], 
            collaterals, 
            ColIsSameParents.input[yes],
            "全員被相続人と同じ両親ですか？", 
            "異父母の人がいる", 
            "被相続人と同じ両親ですか？", 
            "はい",
        )
    }

    static isLive(isAlert = true){
        return this.process(
            isAlert,
            collateralCommons[0], 
            CoCIsLive.input[no], 
            collaterals, 
            ColIsLive.input[yes],
            "現在も全員ご健在ですか？", 
            "亡くなっている子がいる", 
            "現在もご健在ですか？", 
            "はい"
        )
    }

    static isRefuse(isAlert = true){
        return this.process(
            isAlert,
            collateralCommons[0], 
            CoCIsRefuse.input[yes], 
            collaterals, 
            ColIsRefuse.input[no],
            "家庭裁判所で相続放棄をした方はいますか？", 
            "いる", 
            "家庭裁判所で相続放棄をされてますか？", 
            "いいえ"
        )
    }

    static isJapan(isAlert = true){
        return this.process(
            isAlert,
            collateralCommons[0], 
            CoCIsJapan.input[no], 
            collaterals, 
            ColIsJapan.input[yes],
            "現在もご健在の方は全員日本に住民票がありますか？",
            "海外に居住している人がいる",
            "住民票は日本にありますか？",
            "はい"
        )
    }
}

/**
 * 子供全員と反する値に対してアラート表示する
 */
class AlertForContradictionToChildCommon{

    static alertTitle = "※確認です※";

    static messageTemplate(commonQ, commonA, indivisualQ, indivisualA){
        return `${this.alertTitle}\n「３．子供全員」の「${commonQ}」に対して「${commonA}」がチェックされてますが、４．の各子の「${indivisualQ}」に対して「${indivisualA}」がチェックされてます。`;
    }

    static process(isAlert, common, commonIdx, inds, indIdx, commonQ, commonA, indQ, indA){
        const commonData = common.inputs[commonIdx].checked;
        const indData = inds.every(x => x.inputs[indIdx].checked);
        if(commonData && indData){
            if(!isAlert)
                return true;

            alert(this.messageTemplate(commonQ, commonA, indQ, indA));
        }
        return false
    }

    static isSameParents(isAlert = true){
        return this.process(
            isAlert,
            childCommon, 
            ChCIsSameParents.input[no], 
            childs, 
            CIsSameParents.input[yes],
            "全員配偶者との子ですか？", 
            "前配偶者との子がいる", 
            "配偶者との子ですか？", 
            "はい",
        )
    }

    static isLive(isAlert = true){
        return this.process(
            isAlert,
            childCommon, 
            ChCIsLive.input[no], 
            childs, 
            CIsLive.input[yes],
            "現在も全員ご健在ですか？", 
            "亡くなっている子がいる", 
            "現在もご健在ですか？", 
            "はい"
        )
    }

    static isRefuse(isAlert = true){
        return this.process(
            isAlert,
            childCommon, 
            ChCIsRefuse.input[yes], 
            childs, 
            CIsRefuse.input[no],
            "家庭裁判所で相続放棄をした方はいますか？", 
            "いる", 
            "家庭裁判所で相続放棄をされてますか？", 
            "いいえ"
        )
    }

    static isJapan(isAlert = true){
        return this.process(
            isAlert,
            childCommon, 
            ChCIsJapan.input[no], 
            childs, 
            CIsJapan.input[yes],
            "現在もご健在の方は全員日本に住民票がありますか？",
            "海外に居住している子がいる",
            "住民票は日本にありますか？",
            "はい"
        )
    }
}

/**
 * 子の欄のラジオボタンのイベントハンドラー
 */
class ChildRbHandler extends CommonRbHandler{
    // 配偶者の子
    static isSameParents(instance, rbIdx){
        const {inputs, Qs} = instance;
        // 初回入力のとき、保留していたイベントを発生させる
        if(window.getComputedStyle(Qs[CIsLive.form]).display === "none")
            dispatchIniChangeEvent(instance, true);

        // 手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(Qs[CIsLive.form]);
        this.handleYesNo(rbIdx, CIsSameParents.input[yes],
            ()=>{
                // 続柄を設定する
                getParentIndex(instance, spouse);
                // 子供全員と矛盾回答チェック
                AlertForContradictionToChildCommon.isSameParents();
            },
            ()=>{
                // 続柄を削除する
                inputs[CTarget2.input].value = "";
            }
        )
    }

    // 手続時存在
    static isLive(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, CIsLive.input[yes],
            ()=>{
                // 次へボタンをトグル/falseのときに表示する欄を初期化/相続放棄欄を表示する
                const rbIdxs = getSequentialNumArr(CIsExist.input[yes], CIsChild.input[no]);
                changeCourse(
                    instance, inputs[CIsJapan.input[yes]],
                    CIsExist.form, CCount.form, rbIdxs, Qs[CCount.form],
                    Qs[CIsRefuse.form]
                )
                // 子供全員との矛盾回答チェック
                AlertForContradictionToChildCommon.isLive();
            },
            ()=>{
                // trueのときに表示する質問欄を初期化/相続時存在欄を表示する
                const rbIdxs = CIsRefuse.input.concat(CIsAdult.input, CIsJapan.input);
                changeCourse(
                    instance, inputs[CCount.input],
                    CIsRefuse.form, CIsJapan.form, rbIdxs, null,
                    Qs[CIsExist.form]
                )
            }
        )
    }

    // 相続時存在
    static isExist(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, CIsExist.input[yes],
            ()=>{
                // 次へボタンのトグル/falseのときに表示する欄を初期化する/相続放棄欄を表示
                changeCourse(
                    instance, inputs[CCount.input],
                    CIsChild.form, CCount.form, CIsChild.input, inputs[CCount.input],
                    Qs[CIsRefuse.form]
                )
            },
            ()=>{
                // 次へボタンのトグル/trueのときに表示する欄を初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(CIsRefuse.input[yes], CIsChild.input[no]);
                changeCourse(
                    instance, inputs[CCount.input],
                    CIsRefuse.form, CCount.form, rbIdxs, inputs[CCount.input],
                    Qs[CIsChild.form]
                )
            }
        )
    }

    // 相続放棄
    static isRefuse(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, CIsRefuse.input[yes],
            ()=>{
                // 氏名欄にエラーがないときは次へボタンを有効化する、falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(CIsSpouse.input[yes], CIsJapan.input[no], CCount.input);
                breakQ(inputs[CName.input], instance, CIsSpouse.form, CIsJapan.form, rbIdxs, inputs[CCount.input]);
            },
            ()=>{
                // 手続時存在trueのとき
                if(inputs[CIsLive.input[yes]].checked){
                    // エラー要素を追加と次へボタンを無効化、成人欄を表示
                    pushInvalidElAndSDIfHidden(instance, inputs[CIsJapan.input[yes]], Qs[CIsAdult.form]);
                }else if(inputs[CIsExist.input[yes]].checked){
                    // 死亡時存在trueのとき
                    // エラー要素を追加と次へボタンを無効化、配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(instance, inputs[CCount.input], Qs[CIsSpouse.form]);
                }
                AlertForContradictionToChildCommon.isRefuse();
            }            
        )
    }

    // 配偶者確認
    static isSpouse(el){
        slideDownIfHidden(el);
    }

    // 子供存在
    static isChild(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, CIsChild.input[yes],
            ()=>{
                // 子の人数欄を表示、初期値１
                inputs[CCount.input].value = "1";
                slideDownIfHidden(Qs[CCount.form]);
            },
            ()=>{
                //子の人数欄を非表示/エラーメッセージを初期化する
                slideUp(Qs[CCount.form]);
                iniErrMsgEls(errMsgEls[CCount.form]);
            }
        )
        // 共通で次のボタントグル操作
        breakQ(
            inputs[CName.input], instance,
            null, null, null, rbIdx === CIsChild.input[yes]? null: inputs[CCount.input]
        );
    }

    // 成人
    static isAdult(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, CIsAdult.input[yes],
            ()=>{
                // 日本在住欄を表示する
                slideDownIfHidden(Qs[CIsJapan.form]);
                iniErrMsgEls(errMsgEls[CIsAdult.form]);
            },
            ()=>{
                // システム対応外表示
                notAvailablePattern(
                    instance, inputs[CIsJapan.input[yes]],
                    CIsJapan.form, CIsJapan.form, CIsJapan.input, null,
                    errMsgEls[CIsAdult.form]
                );
            }
        )
    }

    //日本在住
    static isJapan(instance, idx){
        breakQ(instance.inputs[idx], instance);
        AlertForContradictionToChildCommon.isJapan();
    }
}

/**
 * 子項目を表示する
 * @param {Child} instance 対象の子
 * @param {number} rbIdx イベントを設定するinputのインデックス
 */
function setChildRbsEvent(instance, rbIdx){
    //同じ配偶者
    if(CIsSameParents.input.includes(rbIdx)) ChildRbHandler.isSameParents(instance, rbIdx);
    //手続時存在
    else if(CIsLive.input.includes(rbIdx)) ChildRbHandler.isLive(instance, rbIdx);
    //相続時存在
    else if(CIsExist.input.includes(rbIdx)) ChildRbHandler.isExist(instance, rbIdx);
    //相続放棄
    else if(CIsRefuse.input.includes(rbIdx)) ChildRbHandler.isRefuse(instance, rbIdx);
    //配偶者確認
    else if(CIsSpouse.input.includes(rbIdx)) ChildRbHandler.isSpouse(instance.Qs[CIsChild.form]);
    //子の存在欄
    else if(CIsChild.input.includes(rbIdx)) ChildRbHandler.isChild(instance, rbIdx);
    //成人欄
    else if(CIsAdult.input.includes(rbIdx)) ChildRbHandler.isAdult(instance, rbIdx);
    //日本在住欄
    else if(CIsJapan.input.includes(rbIdx)) ChildRbHandler.isJapan(instance, CName.input);
}

/**
 * エラー要素をチェックして次へボタンをトグル
 * @param {EveryIndivisual} instance - インスタンスオブジェクト
 * @param {Array} targets - チェック対象の要素を格納した配列
 * @param {boolean} exclude - 除外する場合はtrue、含める場合はfalse
 */
function filterAndToggleNextBtn(instance, checkTargets, exclude){
    const {noInputs, nextBtn} = instance;
    instance.noInputs = noInputs.filter(x => exclude? !checkTargets.includes(x): checkTargets.includes(x));
    nextBtn.disabled = instance.noInputs.length !== 0;
}

/**
 * 兄弟姉妹の欄のラジオボタンのイベントハンドラー
 */
class CollateralRbHandler extends CommonRbHandler{
    //同じ両親
    static isSameParents(instance, rbIdx){
        const {inputs, Qs} = instance;
        try{
            this.handleYesNo(rbIdx, ColIsSameParents.input[yes],
                ()=>{
                    //yesAction
                    // 初回入力のとき、保留していたイベントを発生させる
                    if(window.getComputedStyle(Qs[CIsLive.form]).display === "none")
                        dispatchIniChangeEvent(instance, true);
                
                    slideDownIfHidden(Qs[ColIsLive.form]);
    
                    inputs[ColTarget1.input].value = ascendants[0].inputs[AIndex.input].value.trim();
                    inputs[ColTarget2.input].value = ascendants[1].inputs[AIndex.input].value.trim();
    
                    filterAndToggleNextBtn(instance, [inputs[ColIsFather.input[yes]], inputs[ColIsFather.input[no]]], true);
                    iniQs(instance, ColIsFather.form, ColIsFather.form, ColIsFather.input, null);


                    AlertForContradictionToCollateralCommon.isSameParents();
                },
                ()=>{
                    //noAction
                    //続柄を設定する
                    inputs[ColTarget1.input].value = "";
                    inputs[ColTarget2.input].value = "";
                    pushInvalidElAndSDIfHidden(instance, inputs[ColIsFather.input[yes]], Qs[ColIsFather.form]);
                }
            )
        }catch(e){
            basiclog("CollateralRbHandler.isSameParents()", e);
        }   
    }

    //父母どっち
    static isFather(instance, rbIdx){
        const {inputs, Qs} = instance;

        try{
            // 初回入力のとき、保留していたイベントを発生させる
            if(window.getComputedStyle(Qs[ColIsLive.form]).display === "none")
                dispatchIniChangeEvent(instance, true);
            
            slideDownIfHidden(Qs[ColIsLive.form]);

            filterAndToggleNextBtn(instance, [inputs[ColIsFather.input[yes]], inputs[ColIsFather.input[no]]], true);

            this.handleYesNo(rbIdx, ColIsFather.input[yes],
                ()=>{
                    //yesAction
                    inputs[ColTarget1.input].value = ascendants[0].inputs[AIndex.input].value.trim();
                    inputs[ColTarget2.input].value = "";
                },
                ()=>{
                    //noAction
                    inputs[ColTarget1.input].value = "";
                    inputs[ColTarget2.input].value = ascendants[1].inputs[AIndex.input].value.trim();
                }
            )
        }catch(e){
            basiclog("CollateralRbHandler.isFather()", e);
        }
    }

    //手続時存在
    static isLive(instance, rbIdx){
        const {inputs, Qs} = instance;
        const rbIdxs = rbIdx === ColIsLive.input[yes] ? 
            getSequentialNumArr(ColIsExist.input[yes], ColIsChild.input[no]):
            ColIsRefuse.input.concat(ColIsRefuse.input[yes], ColIsJapan.input);
        this.handleYesNo(rbIdx, ColIsLive.input[yes],
            ()=>{
                //yesAction
                //エラーが削除されているとき、日本在住trueボタンをエラー要素を追加して次へボタンを無効化する/falseのときに表示する欄を非表示にして入力値とボタンを初期化/相続放棄欄を表示する
                changeCourse(
                    instance, inputs[ColIsJapan.input[yes]],
                    ColIsExist.form, ColIsChild.form, rbIdxs, null,
                    Qs[ColIsRefuse.form]
                )
                AlertForContradictionToCollateralCommon.isLive();
            },
            ()=>{
                //noAction
                slideUpEls(Qs[ColIsRefuse.form]);
                //相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                changeCourse(
                    instance, inputs[ColIsChild.input[no]],
                    ColIsRefuse.form, ColIsJapan.form, rbIdxs, null,
                    Qs[ColIsExist.form]
                )
            }
        )
    }

    //相続時存在
    static isExist(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, ColIsExist.input[yes],
            ()=>{
                //falseのときに表示する欄を非表示にして入力値、ボタンを初期化する/相続放棄欄を表示
                changeCourse(
                    instance, inputs[ColIsChild.input[no]],
                    ColIsSpouse.form, ColIsChild.form, ColIsSpouse.input.concat(ColIsChild.input), null,
                    Qs[ColIsRefuse.form]
                )
            },
            ()=>{
                //trueのときに表示する欄を非表示にして値とボタンを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(ColIsRefuse.input[yes], ColIsChild.input[no]);
                filterAndToggleNextBtn(instance, [inputs[ColName.input], inputs[ColIsFather.input[yes]], inputs[ColIsFather.input[no]]], false);
                iniQs(instance, ColIsRefuse.form, ColIsChild.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, ColIsRefuse.input[yes],
            ()=>{
                //氏名欄にエラーがないときは次へボタンを有効化する/falseのときに表示する欄を非表示にして値とボタンを初期化
                const rbIdxs = getSequentialNumArr(ColIsSpouse.input[yes], ColIsJapan.input[no]);
                filterAndToggleNextBtn(instance, [inputs[ColName.input], inputs[ColIsFather.input[yes]], inputs[ColIsFather.input[no]]], false);
                iniQs(instance, ColIsSpouse.form, ColIsJapan.form, rbIdxs);
                if(instance === getLastElFromArray(collaterals)){
                    if(!spouse.isHeir() && !collaterals.some(x => x.isHeir())){
                        notAvailablePattern(
                            instance, inputs[ColIsJapan.input[yes]],
                            null, null, null, null,
                            errMsgEls[ColIsRefuse.form]
                        )
                    }
                }
            },
            ()=>{
                // 手続時存在trueのとき
                if(inputs[ColIsLive.input[yes]].checked){
                    // 次へボタンを無効化/ 成人欄を表示
                    pushInvalidElAndSDIfHidden(instance, inputs[ColIsJapan.input[yes]], Qs[ColIsAdult.form]);
                    iniErrMsgEls(errMsgEls[ColIsRefuse.form]);
                }else if(inputs[ColIsExist.input[yes]].checked){
                    // 死亡時存在trueのとき
                    // 次へボタンを無効化/ 配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(instance, inputs[ColIsChild.input[no]], Qs[ColIsSpouse.form]);
                    iniErrMsgEls(errMsgEls[ColIsSpouse.form]);
                }
                AlertForContradictionToCollateralCommon.isRefuse();
            }            
        )
    }

    //配偶者確認
    static isSpouse(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, ColIsSpouse.input[yes],
            ()=>{
                //システム対応外表示
                notAvailablePattern(
                    instance, inputs[ColIsChild.input[no]],
                    ColIsChild.form, ColIsChild.form, ColIsChild.input, null,
                    errMsgEls[ColIsSpouse.form]
                )
            },
            ()=>{
                // 配偶者存在と子存在のエラー表示を初期化/ 子供存在欄を表示する
                iniErrMsgEls([errMsgEls[ColIsSpouse.form], errMsgEls[ColIsChild.form]]);
                slideDownIfHidden(Qs[ColIsChild.form]);
            }
        )
    }

    //子供存在
    static isChild(instance, rbIdx){
        const {inputs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, ColIsChild.input[yes],
            ()=>{
                //システム対応外を表示する
                notAvailablePattern(
                    instance, inputs[ColIsChild.input[no]],
                    null, null, null, null,
                    errMsgEls[ColIsChild.form]
                )
            },
            ()=>{
                filterAndToggleNextBtn(instance, [inputs[ColName.input], inputs[ColIsFather.input[yes]], inputs[ColIsFather.input[no]]], false);
                iniErrMsgEls(errMsgEls[ColIsChild.form]);
            }
        )
    }

    //成人
    static isAdult(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, ColIsAdult.input[yes],
            ()=>{
                //日本在住欄を表示する
                slideDownIfHidden(Qs[ColIsJapan.form]);
                iniErrMsgEls(errMsgEls[ColIsAdult.form]);
            },
            ()=>{
                //システム対応外を表示する
                notAvailablePattern(
                    instance, inputs[ColIsJapan.input[yes]],
                    ColIsJapan.form, ColIsJapan.form, ColIsJapan.input, null,
                    errMsgEls[ColIsAdult.form]
                );
            }
        )
    }

    //日本在住
    static isJapan(instance){
        const {inputs} = instance;
        filterAndToggleNextBtn(instance, [inputs[ColName.input], inputs[ColIsFather.input[yes]], inputs[ColIsFather.input[no]]], false);
        AlertForContradictionToCollateralCommon.isJapan();
    }
}

/**
 * 兄弟姉妹のイベント設定
 * @param {Collateral} instance 対象の兄弟姉妹
 * @param {number} rbIdx イベントを設定するinputのインデックス
 */
function setCollateralRbsEvent(instance, rbIdx){
    //同じ配偶者
    if(ColIsSameParents.input.includes(rbIdx)) CollateralRbHandler.isSameParents(instance, rbIdx);
    //父母どっち
    if(ColIsFather.input.includes(rbIdx)) CollateralRbHandler.isFather(instance, rbIdx);
    //手続時存在
    else if(ColIsLive.input.includes(rbIdx)) CollateralRbHandler.isLive(instance, rbIdx);
    //相続時存在
    else if(ColIsExist.input.includes(rbIdx)) CollateralRbHandler.isExist(instance, rbIdx);
    //相続放棄
    else if(ColIsRefuse.input.includes(rbIdx)) CollateralRbHandler.isRefuse(instance, rbIdx);
    //配偶者確認
    else if(ColIsSpouse.input.includes(rbIdx)) CollateralRbHandler.isSpouse(instance, rbIdx);
    //子の存在欄
    else if(ColIsChild.input.includes(rbIdx)) CollateralRbHandler.isChild(instance, rbIdx);
    //成人欄
    else if(ColIsAdult.input.includes(rbIdx)) CollateralRbHandler.isAdult(instance, rbIdx);
    //日本在住欄
    else if(ColIsJapan.input.includes(rbIdx)) CollateralRbHandler.isJapan(instance);
}

/**
 * 孫の欄のラジオボタンのイベントハンドラー
 */
class GrandChildRbHandler extends CommonRbHandler{
    //同じ配偶者
    static isSameParents(instance, rbIdx){
        const {inputs, Qs} = instance;
        // 手続時存在欄が表示されてないとき表示する
        slideDownIfHidden(Qs[GIsLive.form]);
        this.handleYesNo(rbIdx, GIsSameParents.input[yes],
            ()=>{
                // yesAction
                // 続柄を設定する
                const childSpouse = childSpouses.find(x => x.successFrom === instance.successFrom);
                if(childSpouse){
                    inputs[GTarget2.input].value = childSpouse.inputs[SIndex.input].value;
                }
            },
            ()=>{
                // noAction
                // 続柄を解除する
                inputs[GTarget2.input].value = "";
            }
        )
    }

    // 手続時存在
    static isLive(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, GIsLive.input[yes],
            ()=>{
                // yesAction
                // 次へボタンをトグル/falseのときに表示する欄を初期化/相続放棄欄を表示する
                const rbIdxs = getSequentialNumArr(GIsExist.input[yes], GIsChild.input[no]);
                changeCourse(
                    instance, inputs[GIsJapan.input[yes]],
                    GIsExist.form, GIsChild.form, rbIdxs, null,
                    Qs[GIsRefuse.form]
                )
            },
            ()=>{
                // noAction
                slideUpEls(Qs[GIsRefuse.form]);
                // 相続放棄欄、成人欄、日本在住欄を非表示かつボタンを初期化/相続時存在欄を表示する
                const rbIdxs = GIsRefuse.input.concat(GIsAdult.input, GIsJapan.input);
                changeCourse(
                    instance, inputs[GIsChild.input[no]],
                    GIsRefuse.form, GIsJapan.form, rbIdxs, null,
                    Qs[GIsExist.form]
                )
            }
        )
    }

    // 相続時存在
    static isExist(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, GIsExist.input[yes],
            ()=>{
                // 次へボタンをトグル/falseのときに表示する欄を初期化する/相続放棄欄を表示
                changeCourse(
                    instance, inputs[GIsChild.input[no]],
                    GIsChild.form, GIsChild.form, GIsChild.input, null,
                    Qs[GIsRefuse.form]
                )
            },
            ()=>{
                // 次へボタンをトグル/trueのときに表示する欄をを初期化/子の存在確認欄を表示
                const rbIdxs = getSequentialNumArr(GIsRefuse.input[yes], GIsChild.input[no]);
                changeCourse(
                    instance, inputs[GIsChild.input[no]],
                    GIsRefuse.form, GIsChild.form, rbIdxs, null,
                    Qs[GIsChild.form]
                )
            }
        )
    }

    //相続放棄
    static isRefuse(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, GIsRefuse.input[yes],
            ()=>{
                //次へボタンをトグル/falseのときに表示する欄を初期化
                const rbIdxs = getSequentialNumArr(GIsSpouse.input[yes], GIsJapan.input[no]);
                breakQ(inputs[GName.input], instance, GIsSpouse.form, GIsJapan.form, rbIdxs, null);
            },
            ()=>{
                //手続時存在trueのとき
                if(inputs[GIsLive.input[yes]].checked){
                    //エラー要素を追加と次へボタンを無効化して成人欄を表示
                    pushInvalidElAndSDIfHidden(instance, inputs[GIsJapan.input[yes]], Qs[GIsAdult.form]);
                }else if(inputs[GIsExist.input[yes]].checked){
                    //死亡時存在trueのとき
                    //エラー要素を追加と次へボタンを無効化して配偶者確認欄を表示
                    pushInvalidElAndSDIfHidden(instance, inputs[GIsChild.input[no]], Qs[GIsSpouse.form]);
                }
            }            
        )
    }

    // 配偶者確認
    static isSpouse(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, GIsSpouse.input[yes],
            ()=>{
                // システム対応外の表示
                notAvailablePattern(
                    instance, inputs[GIsChild.input[no]],
                    GIsChild.form, GIsChild.form, GIsChild.input, null,
                    errMsgEls[GIsSpouse.form]
                )
            },
            ()=>{
                //配偶者存在欄と子供存在欄のエラーメッセージを非表示にする/子供存在欄を表示する
                iniErrMsgEls(errMsgEls[GIsSpouse.form]);
                slideDownAndScroll(Qs[GIsChild.form]);
            }
        )
    }

    //子供存在
    static isChild(instance, rbIdx){
        const {inputs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, GIsChild.input[yes],
            ()=>{
                // システム対応外の表示
                notAvailablePattern(
                    instance, inputs[GIsChild.input[no]],
                    null, null, null, null,
                    errMsgEls[GIsChild.form]
                )
            },
            ()=>{
                //エラーメッセージを非表示にする/次へボタンのトグル
                iniErrMsgEls(errMsgEls[GIsChild.form]);
                breakQ(inputs[GName.input], instance);
            }
        )
    }

    //成人
    static isAdult(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, GIsAdult.input[yes],
            ()=>{
                // エラーメッセージの初期化/日本在住欄を表示する
                iniErrMsgEls(errMsgEls[GIsAdult.form]);
                slideDownIfHidden(instance.Qs[GIsJapan.form]);
            },
            ()=>{
                // システム対応外の表示
                notAvailablePattern(
                    instance, inputs[GIsJapan.input[yes]],
                    GIsJapan.form, GIsJapan.form, GIsJapan.input, null,
                    errMsgEls[GIsAdult.form]
                )
            }
        )

    }
}

/**
 * 孫の欄にイベントを設定する
 * 
 * 孫以降の数次や代襲は対応外のため子のイベントを承継できない
 * @param {GrandChild} instance 
 * @param {number} rbIdx イベントを設定するinputのインデックス
 */
function setGrandChildRbsEvent(instance, rbIdx){
    //同じ配偶者
    if(GIsSameParents.input.includes(rbIdx)) GrandChildRbHandler.isSameParents(instance, rbIdx);
    //手続時存在
    else if(GIsLive.input.includes(rbIdx)) GrandChildRbHandler.isLive(instance, rbIdx);
    //相続時存在
    else if(GIsExist.input.includes(rbIdx)) GrandChildRbHandler.isExist(instance, rbIdx);
    //相続放棄
    else if(GIsRefuse.input.includes(rbIdx)) GrandChildRbHandler.isRefuse(instance, rbIdx);
    //配偶者確認
    else if(GIsSpouse.input.includes(rbIdx)) GrandChildRbHandler.isSpouse(instance, rbIdx);
    //子の存在欄
    else if(GIsChild.input.includes(rbIdx)) GrandChildRbHandler.isChild(instance, rbIdx);
    //成人欄
    else if(GIsAdult.input.includes(rbIdx)) GrandChildRbHandler.isAdult(instance, rbIdx);
    //日本在住欄
    else if(GIsJapan.input.includes(rbIdx)) GrandChildRbHandler.isJapan(instance, GName.input);
}

/**
 * 尊属のラジオボタンのイベントハンドラー
 */
class AscendantRbHandler extends CommonRbHandler{
    // 手続時存在
    static isLive(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, AIsLive.input[yes],
            ()=>{
                // yesAction
                // 次へボタンを無効化/falseのときに表示した質問欄を初期化/相続放棄欄を表示
                const rbIdx = getSequentialNumArr(AIsExist.input[yes], AIsChild.input[no]);
                changeCourse(
                    instance, inputs[AIsJapan.input[yes]],
                    AIsExist.form, AIsChild.form, rbIdx, null,
                    Qs[AIsRefuse.form]
                )
            },
            ()=>{
                // noAction
                // 次へボタンを無効化/相続放棄欄以降の初期化/相続時存在欄を表示
                const rbIdxs = AIsRefuse.input.concat(AIsJapan.input);
                changeCourse(
                    instance, inputs[AIsExist.input[no]],
                    AIsRefuse.form, AIsJapan.form, rbIdxs, null,
                    Qs[AIsExist.form]
                )
            }
        )
    }

    // 相続時存在
    static isExist(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, AIsExist.input[yes],
            ()=>{
                // システム対応外を表示する
                notAvailablePattern(
                    instance, inputs[AIsExist.input[no]],
                    null, null, null, null,
                    errMsgEls[AIsExist.form]
                )
            }
            ,()=>{
                // 次へボタントグル、エラーメッセージを初期化
                const rbIdxs = getSequentialNumArr(AIsRefuse.input[yes], AIsJapan.input[no]);
                breakQ(inputs[AName.input], instance, AIsRefuse.form, AIsJapan.form, rbIdxs);
                iniErrMsgEls(errMsgEls[AIsExist.form]);
            }
        )
    }

    // 相続放棄
    static isRefuse(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, AIsRefuse.input[yes],
            ()=>{
                // 次へボタントグル、falseで表示する質問を初期化
                const rbIdxs = getSequentialNumArr(AIsSpouse.input[yes], AIsJapan.input[no]);
                breakQ(inputs[AName.input], instance, AIsSpouse.form, AIsJapan.form, rbIdxs);
            },
            ()=>{
                // 次の欄を表示する
                pushInvalidElAndSDIfHidden(instance, inputs[AIsJapan.input[yes]], Qs[AIsJapan.form]);
            }
        )
    }
    
    //配偶者存在
    static isSpouse(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, AIsSpouse.input[yes],
            ()=>{
                //システム対応外であることを表示する/エラー要素として被相続人以外の子trueを追加してボタンを無効化する、被相続人以外の子を初期化する
                // displayNotAvailable(errMsgEls[AIsSpouse.form]);
                // pushInvalidEl(instance, inputs[AIsChild.input[yes]]);
                // const rbidxs = getSequentialNumArr(AIsRemarriage.input[yes], AIsChild.input[no]);
                // iniQs(Qs, AIsRemarriage.form, AIsChild.form, AIsChild.input);
                // //エラー要素に子の存在trueを追加して次へボタンを無効化、falseで表示した質問を初期化、配偶者は母か確認欄を表示する
                // changeCourse(
                //     instance, inputs[AIsChild.input[yes]],
                //     Qs, AIsChild.form, AIsChild.form, AIsChild.input, null,
                //     Qs[AIsRemarriage.form]
                // )
            },
            ()=>{
                //エラー要素に子の存在trueを追加して次へボタンを無効化、trueで表示した質問を初期化、被相続人以外の子の欄を表示する
                // const rbIdxs = getSequentialNumArr(AIsRemarriage.input[yes], AIsChild.input[no]);
                // changeCourse(
                //     instance, inputs[AIsChild.input[yes]],
                //     Qs, AIsRemarriage.form, AIsChild.form, rbIdxs, null,
                //     Qs[AIsChild.form]
                // )
            }
        )
    }

    //配偶者と母が同じを表示する
    static isRemarriage(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, AIsRemarriage.input[yes],
            ()=>{
                // //エラー要素に被相続人以外の子をfalseを追加して次へボタンを無効化/エラー要素を初期化
                // slideDownAndScroll(Qs[AIsChild.form]);
                // iniErrMsgEls(errMsgEls[AIsRemarriage.form]);
            },
            ()=>{
                // //システム対応外であることを表示する/エラー要素として被相続人以外の子trueを追加してボタンを無効化する、被相続人以外の子を初期化する
                // displayNotAvailable(errMsgEls[AIsRemarriage.form]);
                // pushInvalidEl(instance, inputs[AIsChild.input[yes]]);
                // iniQs(Qs, AIsChild.form, AIsChild.form, AIsChild.input);
            }
        )
    }

    //被相続人以外の子を表示する
    static isChild(instance, rbIdx){
        const {inputs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, AIsChild.input[yes],
            ()=>{
                // //氏名が適切に入力されているかチェックして次へボタンを有効化判別/エラーメッセージを非表示にする
                // breakQ(inputs[AName.input], instance);
                // iniErrMsgEls(errMsgEls[AIsChild.form]);
            },
            ()=>{
                // //エラーを表示する/trueをエラー要素に追加して次へボタンを無効化する
                // displayNotAvailable(errMsgEls[AIsChild.form]);
                // pushInvalidEl(instance, inputs[AIsChild.input[yes]]);
            }
        )
    }
}

/**
 * 尊属のラジオボタンのイベント設定
 * @param {Ascendant} instance 
 * @param {number} rbIdx 押された次へボタンのインデックス
 */
function setAscendantRbsEvent(instance, rbIdx){
    //手続時存在
    if(AIsLive.input.includes(rbIdx)) AscendantRbHandler.isLive(instance, rbIdx);
    //相続時存在
    else if(AIsExist.input.includes(rbIdx)) AscendantRbHandler.isExist(instance, rbIdx);
    //相続放棄
    else if(AIsRefuse.input.includes(rbIdx)) AscendantRbHandler.isRefuse(instance, rbIdx);
    //配偶者存在（使用しない）
    else if(AIsSpouse.input.includes(rbIdx)) AscendantRbHandler.isSpouse(instance, rbIdx);
    //配偶者と母は同じ（使用しない）
    else if(AIsRemarriage.input.includes(rbIdx)) AscendantRbHandler.isRemarriage(instance, rbIdx);
    //被相続人以外の子（使用しない）
    else if(AIsChild.input.includes(rbIdx)) AscendantRbHandler.isChild(instance, rbIdx);
    //日本在住
    else AscendantRbHandler.isJapan(instance, AName.input);
}

/**
 * プラスボタンとマイナスボタンの有効化トグル
 * @param {ChildCommon|Child|CollateralCommon} instance 対象の欄のインスタンス
 * @param {number} val 増減後の値
 * @param {number} min 設定する最小値
 * @param {number} max 設定する最大値
 */
function toggleCountBtn(instance, val, min, max){
    instance.minusBtn.disabled = val > min ? false: true;
    instance.plusBtn.disabled = val > max ? true: false;
}

/**
 * 子の人数を１増加させる
 * @param {boolean} isIncrease 増加フラグ
 * @param {ChildCommon|Child|Collateral} instance  カウント欄を持つインスタンス
 * @param {number} limitCount 上限値又は下限値
 */
function adjustChildCount(isIncrease, instance, limitCount){
    const countInput = instance.inputs[instance.constructor.idxs.count.input];

    let val = parseInt(countInput.value) || 0;
    if((isIncrease && val < limitCount) || (!isIncrease && val > limitCount))
        val += isIncrease ? 1 : -1;

    countInput.value = val;
}

/**
 * 人数欄の値変更イベント用
 * @param {HTMLInputElement} el イベントが発火した要素
 * @param {EveryInstance} instance  人数欄を持つ欄
 */
function countCheck(el, instance){
    const {constructor, errMsgEls, inputs} = instance;
    let val = el.value? parseInt(el.value): "";
    el.value = val;
    let result = isNumber(val, el)? true: "false"; //整数チェック
    let msg = "";

    //整数のとき
    if(typeof result === "boolean"){
        //15人以下チェック
        if(val > 15){
            result = "false";
            msg = "上限は１５人までです";
        }else if(val === 0){
            result = "false";
            msg = "いない場合は一つ前の質問で「いいえ」を選択してください";
        }
    }else{
        msg = "入力必須です";
    }
    const countInputIdx = constructor.idxs.count.input;
    const countFormIdx = constructor.idxs.count.form;
    afterValidation(result, errMsgEls[countFormIdx], msg, inputs[countInputIdx], instance);
}

/**
 * 数字入力欄のキーダウンイベント
 * @param {event} e キーダウンイベント
 * @param {HTMLElement} nextEl 次にフォーカスする要素
 */
function handleNumInputKeyDown(e, nextEl){
    //Enterで次にフォーカス
    if(e.key === "Enter"){
        e.preventDefault();
        nextEl.focus();
    }else if(!/\d|Backspace|Delete|Tab/.test(e.key)){
        //数字又はバックスペースとデリート以外は使用不可
        e.preventDefault()
    }
}

/**
 * インスタンスが格納されている配列を取得する
 * @param {Child|ChildSpouse|GrandChild|Ascendant|Collateral} instance 
 * @returns
 */
function getInstancesFromInstance(instance){
    if(instance.constructor === Child)
        return childs;
    else if(instance.constructor === ChildSpouse)
        return childSpouses;
    else if(instance.constructor === GrandChild)
        return grandChilds;
    else if(instance.constructor === Ascendant)
        return ascendants;
    else if(instance.constructor === Collateral)
        return collaterals;

    throw new Error(`getInstancesFromInstanceでエラー\n${instance.constructor}に一致するものがありません`);
}

/**
 * 
 * @param {Child|ChildSpouse|GrandChild|Ascendant|Collateral[]} instances 
 * @param {Child|ChildSpouse|GrandChild|Ascendant|Collateral} instance 
 * @returns 
 */
function getSameNameInstanceTitles(instances, instance) {
    // 名前の入力フィールドのインデックスを取得
    const nameInputIndex = instance.constructor.idxs.name.input;
    const nameVal = instance.inputs[nameInputIndex].value;
    // 空欄のときは検証不要
    if(nameVal === "") {
        return [];
    }

    const duplicates = [];
    instances.forEach(x =>{
        if(x !== instance && x.inputs[nameInputIndex].value === nameVal)
            duplicates.push(x.fieldset.getElementsByClassName(Classes.fieldset.title)[0].textContent.trim());
    })

    return duplicates;
}

/**
 * 同じ続柄から同姓同名をチェックする
 * @param {Child|ChildSpouse|GrandChild|Ascendant|Collateral} instance 
 */
function validateSameName(instance){
    let instances = getInstancesFromInstance(instance);
    if(!instances)
        basicLog("validateSameName", null, "想定しないインスタンスが渡されました");
    
    //重複がないときは検証完了
    const duplicates = getSameNameInstanceTitles(instances, instance);
    if(duplicates.length === 0)
        return;

    alert(`※確認です※\n以下の方${duplicates.length > 1? "々": ""}と氏名が重複しますが、間違いないでしょうか？\n\n${duplicates.join('\n')}`);
}

/**
 * 全角入力欄の値変更イベントのハンドラー
 * @param {number} idx 全角入力欄のインデックス
 * @param {EveryInstance} instance 
 */
function handleFullWidthInputChange(idx, instance){
    const {errMsgEls, inputs} = instance;
    const input = inputs[idx];

    //入力値のチェック結果を取得して結果に応じた処理をする
    const result = isOnlyZenkaku(input);
    afterValidation(result, errMsgEls[idx], result, input, instance);
    
    //各続柄毎に同姓同名をチェックしていたらアラート（エラー扱いにはしない）（被相続人の配偶者は不要）
    if(!(instance instanceof Spouse))
        validateSameName(instance);
}

/**
 * 全員欄の人数欄イベント
 * @param {ChildCommon|CollateralCommon} instance 
 */
function toggleCommonFormByCount(instance){
    const {inputs, Qs, constructor, nextBtn} = instance;
    const countInput = inputs[constructor.idxs.count.input];
    const countStr = countInput.value;
    if(countStr === "")
        return;

    //１人のときは次へボタンを有効化
    const count = parseInt(countStr);
    if(count === 1){
        const rbIdxs = getSequentialNumArr(constructor.idxs.isSameParents.input[yes], constructor.idxs.isJapan.input[no]);
        breakQ(
            null, instance,
            constructor.idxs.isSameParents.form, constructor.idxs.isJapan.form, rbIdxs
        );
    }else if(count > 1){
        // ２人以上のとき
        pushInvalidEl(instance, inputs[constructor.idxs.isJapan.input[yes]]);

        if(constructor === ChildCommon){
            // 子全員欄のとき
            //入力が完了したか判別
            const isSpouse = spouse.inputs[SIsExist.input[yes]].checked;
            const isDone = [
                inputs[constructor.idxs.isSameParents.input[no]].checked && isSpouse,
                inputs[constructor.idxs.isLive.input[no]].checked,
                inputs[constructor.idxs.isRefuse.input[yes]].checked,
                inputs[constructor.idxs.isJapan.input[yes]].checked,
                inputs[constructor.idxs.isJapan.input[no]].checked,
            ].some(x => x === true);

            if(isDone){
                instance.noInputs.length = 0;
                nextBtn.disabled = false;
                return;
            }

            //配偶者がいるとき配偶者確認欄を表示する
            if(isSpouse){
                slideDownIfHidden(Qs[constructor.idxs.isSameParents.form]);
            }else if(!isSpouse && Qs[constructor.idxs.isLive.form].style.display === "none"){
                //配偶者がいないかつ健在確認欄が非表示のとき、配偶者確認欄をいいえにチェックして非表示にして健在確認欄を表示する
                inputOrCheckAndDispatchChangeEvent(inputs[constructor.idxs.isSameParents.input[no]]);
            }
        }else if(constructor === CollateralCommon){
            // 兄弟姉妹全員欄のとき
            const isDone = [
                inputs[constructor.idxs.isSameParents.input[no]].checked,
                inputs[constructor.idxs.isLive.input[no]].checked,
                inputs[constructor.idxs.isRefuse.input[yes]].checked,
                inputs[constructor.idxs.isJapan.input[yes]].checked,
                inputs[constructor.idxs.isJapan.input[no]].checked,
            ].some(x => x === true);

            if(isDone){
                instance.noInputs.length = 0;
                nextBtn.disabled = false;
                return;
            }

            slideDownIfHidden(Qs[constructor.idxs.isSameParents.form]);
        }
    }
}

/**
 * 増減ボタンのイベントハンドラー
 * @param {boolean} isIncrease 増加ボタンフラグ
 * @param {ChildCommon|Child|CollateralCommon} instance  カウント欄を持つ人
 * @param {number} minCount 設定の最小値
 * @param {number} maxCount 設定の最大値
 */
function setCountBtnEvent(isIncrease, instance, minCount, maxCount){
    const {inputs, constructor} = instance;
    const countInput = inputs[constructor.idxs.count.input];
    adjustChildCount(isIncrease, instance, (isIncrease ? maxCount : minCount));
    countCheck(countInput, instance);
    toggleCountBtn(instance, countInput.value, minCount, maxCount);
    if(constructor === ChildCommon || constructor === CollateralCommon)
        toggleCommonFormByCount(instance);
}

/**
 * カウント欄と増減ボタンにイベントを設定
 * @param {ChildCommon|Child|CollateralCommon} instance  カウント欄を持つインスタンス
 */
function setCountFormEvent(instance){
    const minCount = 1;
    const maxCount = 15;
    const {inputs, nextBtn, constructor, minusBtn, plusBtn} = instance;
    const idx = constructor.idxs.count.input;

    const input = inputs[idx];
    input.addEventListener("change", ()=>{
        countCheck(input, instance);
        toggleCountBtn(instance, parseInt(input.value), minCount, maxCount);
        //子共通又は兄弟姉妹共通のとき
        if(constructor === ChildCommon || constructor === CollateralCommon)
            toggleCommonFormByCount(instance);
    })
    input.addEventListener("keydown",(e)=>{
        handleNumInputKeyDown(e, (idx === 2? inputs[idx + 1]: nextBtn));
    })
    input.addEventListener("input", (e)=>{
        //３文字以上入力不可
        e.target.value = e.target.value.slice(0,2);
    })
    //マイナスボタン
    minusBtn.addEventListener("click", ()=>{
        setCountBtnEvent(false, instance, minCount, maxCount)
    })
    //プラスボタン
    plusBtn.addEventListener("click", ()=>{
        setCountBtnEvent(true, instance, minCount, maxCount)
    })
}

/**
 * 全角入力欄のinputイベントハンドラー
 * @param {EveryInstance} person 対象の人
 * @param {HTMLElement} el 全角入力欄
 */
function handleFullWidthInput(person, el){
    const {nextBtn, noInputs} = person;
    const result = isOnlyZenkaku(el)
    if(typeof result === "boolean"){
        person.noInputs = noInputs.filter(x => x.id !== el.id);
        nextBtn.disabled = person.noInputs.length !== 0;
    }else{
        pushInvalidEl(person, el);
    }
}

/**
 * 氏名にイベント設定
 * @param {EveryIndivisual} instance 
 * @param {HTMLInputElement} input 
 * @param {number} idx 
 */
function setNameEvent(instance, input, idx){
    input.addEventListener("change",()=>{
        handleFullWidthInputChange(idx, instance);
    })
    input.addEventListener("keydown",(e)=>{
        setEnterKeyFocusNext(e, instance.inputs[idx + 1]);
        disableNumKey(e);
    })
    input.addEventListener("input", ()=>{
        handleFullWidthInput(instance, input);
    })
}

/**
 * 個人入力欄にイベントを設定する
 * @param {EveryIndivisual} instance イベントをセットする対象の欄
 */
function setIndivisualFieldsetEvent(instance){
    const {fieldset, inputs, constructor} = instance;
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];

        //氏名欄のとき
        if(i === constructor.idxs.name.input){
            setNameEvent(instance, input, i);
        }else{
            //氏名欄以外のとき

            // enterによる送信はしない
            input.addEventListener("keydown", (e)=>{
                if(e.key === "Enter")
                    e.preventDefault();
            })

            // 被相続人の配偶者のとき
            if(fieldset.id === Ids.fieldset.decedentSpouse){
                input.addEventListener("change",()=>{
                    setSpouseRbsEvent(instance, i);
                })
            }else if(fieldset.classList.contains(Classes.fieldset.child)){
                // 子の欄のとき
    
                // 人数欄にイベントを設定
                if(i === CCount.input){
                    setCountFormEvent(instance);
                }else{
                    // 人数欄以外のとき
                    input.addEventListener("change",()=>{
                        setChildRbsEvent(instance, i);
                    })
                }
            }else if(fieldset.classList.contains(Classes.fieldset.childSpouse)){
                // 子の配偶者のとき
                input.addEventListener("change",()=>{
                    setChildSpouseRbsEvent(instance, i);
                })
            }else if(fieldset.classList.contains(Classes.fieldset.grandChild)){
                // 孫の欄のとき
                input.addEventListener("change",()=>{
                    setGrandChildRbsEvent(instance, i);
                })
            }else if(constructor === Ascendant){
                // 尊属の欄のとき
                input.addEventListener("change",()=>{
                    setAscendantRbsEvent(instance, i);
                })
            }else if(fieldset.classList.contains(Classes.fieldset.collateral)){
                // 兄弟姉妹個人欄のとき
                input.addEventListener("change", ()=>{
                    setCollateralRbsEvent(instance, i);
                })
            }
        }
    }
}

/**
 * 子全員欄のラジオボタンのインベントハンドラー
 */
class ChildCommonRbHandler extends CommonRbHandler{
    //子供存在
    static isExist(instance, rbIdx){
        const {inputs, Qs, nextBtn, errMsgEls} = instance;
        this.handleYesNo(rbIdx, ChCIsExist.input[yes],
            //yesAction
            ()=>{
                //人数の初期値を１にして人数入力欄と配偶者の子確認欄を表示する
                inputs[ChCCount.input].value = "1";
                slideDownAndScroll(Qs[ChCCount.form]);
                //次へボタンを有効にする（子１人のときは、直接その子の欄で入力させるため）
                instance.noInputs.length = 0;
                nextBtn.disabled = false;
                iniErrMsgEls(errMsgEls[ChCCount.form]);
            },
            //noAction
            ()=>{
                //trueのときに表示する欄を初期化して次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(ChCIsSameParents.input[yes], ChCIsJapan.input[no])
                breakQ(null, instance, ChCCount.form, ChCIsJapan.form, rbIdxs, inputs[ChCCount.input])
            }
        )
    }

    //同じ両親
    static isSameParents(el){
        slideDownIfHidden(el);
    }

    //手続時存在
    static isLive(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, ChCIsLive.input[yes],
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(instance, inputs[ChCIsJapan.input[yes]], Qs[ChCIsRefuse.form]);
            },
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(ChCIsRefuse.input[yes], ChCIsJapan.input[no]);
                breakQ(inputs[ChCCount.input], instance, ChCIsRefuse.form, ChCIsJapan.form, rbIdxs);
            }
        )
    }

    //相続放棄
    static isRefuse(instance, rbIdx){
        const {inputs, Qs} = instance;
        this.handleYesNo(rbIdx, ChCIsRefuse.input[yes], 
            ()=>{
                //人数欄をチェックしてエラーが無ければ次へボタンを有効化する
                const rbIdxs = ChCIsAdult.input.concat(ChCIsJapan.input);
                breakQ(inputs[ChCCount.input], instance, ChCIsAdult.form, ChCIsJapan.form, rbIdxs);
            },
            ()=>{
                //エラー要素を追加して次の質問を表示する
                pushInvalidElAndSDIfHidden(instance, inputs[ChCIsJapan.input[yes]], Qs[ChCIsAdult.form]);
            }
        )
    }

    //成人
    static isAdult(instance, rbIdx){
        const {inputs, Qs, errMsgEls} = instance;
        this.handleYesNo(rbIdx, ChCIsAdult.input[yes],
            //yesAction
            ()=>{
                slideDownIfHidden(Qs[ChCIsJapan.form]);
                iniErrMsgEls(errMsgEls[ChCIsAdult.form]);
            },
            //noAction
            ()=>{
                // システム対応外表示
                notAvailablePattern(
                    instance, inputs[ChCIsJapan.input[yes]],
                    ChCIsJapan.form, ChCIsJapan.form, ChCIsJapan.input, null,
                    errMsgEls[ChCIsAdult.form]
                );
            }
        )
    }
}

/**
 * 兄弟姉妹全員のラジオボタンイベント
 */
class CollateralCommonRbHandler extends ChildCommonRbHandler{
    static isExist(instance, rbIdx){
        const {inputs, Qs, nextBtn, errMsgEls} = instance;
        this.handleYesNo(rbIdx, CoCIsExist.input[yes],
            //yesAction
            ()=>{
                //人数の初期値を１にして人数入力欄と同じ親確認欄を表示する
                inputs[CoCCount.input].value = "1";
                slideDownAndScroll(Qs[CoCCount.form]);
                //次へボタンを有効にする（兄弟姉妹１人のときは、直接その兄弟姉妹の欄で入力させるため）
                instance.noInputs.length = 0;
                nextBtn.disabled = false;
                iniErrMsgEls([errMsgEls[CoCIsExist.form], errMsgEls[CoCCount.form]]);
            },
            //noAction
            ()=>{
                //trueのときに表示する欄を初期化して次へボタンを有効化する
                const rbIdxs = getSequentialNumArr(CoCIsSameParents.input[yes], CoCIsJapan.input[no])
                breakQ(null, instance, CoCCount.form, CoCIsJapan.form, rbIdxs, inputs[CoCCount.input])
                if(!spouse.isHeir()){
                    notAvailablePattern(instance, inputs[CoCIsJapan.input[yes]], 
                        null, null, null, null,
                        errMsgEls[CoCIsExist.form]);
                }else{
                    iniErrMsgEls(errMsgEls[CoCIsExist.form]);
                }
            }
        )
    }
}

/**
 * 子全員欄のラジオボタンのイベントを設定する
 * @param {ChildCommon} instance 子共通のインスタンス
 * @param {number} rbIdx ラジオボタンのインデックス
 */
function setChildCommonRbsEvent(instance, rbIdx){
    //子供存在
    if(ChCIsExist.input.includes(rbIdx)) ChildCommonRbHandler.isExist(instance, rbIdx);
    //同じ両親
    else if(ChCIsSameParents.input.includes(rbIdx)) ChildCommonRbHandler.isSameParents(instance.Qs[ChCIsLive.form]);
    //手続時生存
    else if(ChCIsLive.input.includes(rbIdx)) ChildCommonRbHandler.isLive(instance, rbIdx);
    //相続放棄
    else if(ChCIsRefuse.input.includes(rbIdx)) ChildCommonRbHandler.isRefuse(instance, rbIdx);
    //成人
    else if(ChCIsAdult.input.includes(rbIdx)) ChildCommonRbHandler.isAdult(instance, rbIdx);
    //日本在住
    else ChildCommonRbHandler.isJapan(instance, ChCCount.input);
}

/**
 * 兄弟姉妹共通欄のラジオボタンのイベントを設定する
 * @param {CollateralCommon} instance 兄弟姉妹共通のインスタンス
 * @param {number} rbIdx ラジオボタンのインデックス
 */
function setCollateralCommonRbsEvent(instance, rbIdx){
    //子供存在
    if(CoCIsExist.input.includes(rbIdx)) CollateralCommonRbHandler.isExist(instance, rbIdx);
    //同じ両親
    else if(CoCIsSameParents.input.includes(rbIdx)) CollateralCommonRbHandler.isSameParents(instance.Qs[CoCIsLive.form]);
    //手続時生存
    else if(CoCIsLive.input.includes(rbIdx)) CollateralCommonRbHandler.isLive(instance, rbIdx);
    //相続放棄
    else if(CoCIsRefuse.input.includes(rbIdx)) CollateralCommonRbHandler.isRefuse(instance, rbIdx);
    //成人
    else if(CoCIsAdult.input.includes(rbIdx)) CollateralCommonRbHandler.isAdult(instance, rbIdx);
    //日本在住
    else CollateralCommonRbHandler.isJapan(instance, CoCCount.input);
}

/**
 * 全員欄のイベントを設定する
 * @param {ChildCommon|CollateralCommon} instance  全員欄のインスタンス
 */
function setCommonFieldsetEvent(instance){
    const {inputs, constructor} = instance;
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];
        //人数欄のとき
        if(i === constructor.idxs.count.input){
            setCountFormEvent(instance);
        }else{
            // 人数欄以外
            // enterによる送信はしない
            input.addEventListener("keydown", (e)=>{
                if(e.key === "Enter")
                    e.preventDefault();
            })

            // 子全員
            if(constructor === ChildCommon){
                input.addEventListener("change", ()=>{
                    setChildCommonRbsEvent(instance, i);
                })
            }else if(constructor === CollateralCommon){
                //兄弟姉妹全員
                input.addEventListener("change", ()=>{
                    setCollateralCommonRbsEvent(instance, i);
                })
            }else{
                throw new Error(`setCommonFieldsetEventでエラー\n想定しないインスタンスが渡されました\ninstance=${instance}`);
            }
        }
    }
}

/**
 * チェックして無効化する
 * @param {HTMLInputElement} targetRadio 
 * @param {HTMLInputElement} otherRadio 
 */
function checkAndDisable(targetRadio, otherRadio = null){
    if(!targetRadio)
        basicLog("checkAndDisable", null, "共通データを個人に反映する処理でアクセスできない引数(targetRadio)が渡されました");

    targetRadio.checked = true;
    targetRadio.disabled = true;

    if(otherRadio)
        otherRadio.disabled = true;
}

/**
 * 子共通で入力された値を各個別フォームに初期値として反映させて初期表示を変更する
 * @param {Child|Collateral[]} indivisuals 
 * @param {ChildCommon|CollateralCommon} common
 */
function reflectCommonData(indivisuals, common){
    const commonIdxs = common.constructor.idxs;
    const indivisualIdxs = indivisuals[0].constructor.idxs;
    common.inputs.forEach((x, i) =>{
        if(i === commonIdxs.isSameParents.input[yes] && x.checked){
            indivisuals.forEach(a => {
                checkAndDisable(
                    a.inputs[indivisualIdxs.isSameParents.input[yes]], 
                    a.inputs[indivisualIdxs.isSameParents.input[no]]
                );
            });
        }else if(i === commonIdxs.isLive.input[yes] && x.checked){
            indivisuals.forEach(a => {
                checkAndDisable(
                    a.inputs[indivisualIdxs.isLive.input[yes]],
                    a.inputs[indivisualIdxs.isLive.input[no]]
                )
            });
        }else if(i === commonIdxs.isRefuse.input[no] && x.checked){
            indivisuals.forEach(a => {
                checkAndDisable(
                    a.inputs[indivisualIdxs.isRefuse.input[no]],
                    a.inputs[indivisualIdxs.isRefuse.input[yes]],
                )
            });
        }else if(i === commonIdxs.isAdult.input[yes] && x.checked){
            indivisuals.forEach(a => {
                checkAndDisable(
                    a.inputs[indivisualIdxs.isAdult.input[yes]],
                    a.inputs[indivisualIdxs.isAdult.input[no]]
                )
            });
        }else if(i === commonIdxs.isJapan.input[yes] && x.checked){
            indivisuals.forEach(a => {
                checkAndDisable(
                    a.inputs[indivisualIdxs.isJapan.input[yes]],
                    a.inputs[indivisualIdxs.isJapan.input[no]]
                )
            });
        }
    })
}

/**
 * 個人欄のfieldsetの初期化
 * @param {EveryIndivisual|EveryIndivisual[]} instances 初期化対象のインスタンス（複数可）
 */
function iniIndivisualFieldsets(instances){
    if(!instances)
        throw new Error(`iniIndivisualFieldsetsでエラー\n引数が適切ではありません\ninstances=${instances}`);

    if(!Array.isArray(instances))
        instances = [instances];

    for(let i = 0, len = instances.length; i < len; i++){
        const instance = instances[i];
        const {fieldset, Qs, nextBtn, errMsgEls} = instance;
        iniAllInputs(fieldset);
        iniErrMsgEls(errMsgEls);
        // 最初のラジオボタンによる質問欄は表示する
        for(let j = 1, len = Qs.length; j < len; j++){
            const Q = Qs[j];
            Q.style.display = j === 1? "block": "none";
        }

        nextBtn.disabled = true;
    }
}

/**
 * 子個人または兄弟姉妹個人のfieldsetを再生成する
 * @param {string} relation "child"または"collateral"
 * @param {number} count 人数
 */
function regenerateChildOrCollateralFieldsets(relation, count){
    // 最初のフィールドセット以外削除
    const fieldsets = document.getElementsByClassName(`${relation}Fieldset`);
    removeAllExceptFirst(fieldsets);

    // 最初のフィールドセット以降を生成
    for(let i = 1; i < count; i ++){
        //直前のfieldsetをコピー/属性を更新/コピー元の直後に挿入
        const preFieldset = getLastElFromArray(fieldsets);
        const nextFieldset = createChildOrCollateralFieldset(preFieldset, relation, i);
        preFieldset.after(nextFieldset);
    }

    // フォームセットの合計数を更新
    document.getElementById(`id_${relation}-TOTAL_FORMS`).value = count;
}

/**
 * 子個人または兄弟姉妹個人のインスタンスを再生成する
 * @param {string} relation (child, collateral)
 * @param {number} newCount 新しく入力された子又は兄弟姉妹の数
 */
function regenerateChildOrCollateralInstances(relation, newCount){
    relation === "child"? childs.length = 0: collaterals.length = 0;
    for(let i = 0; i < newCount; i++){
        if(relation === "child")
            new Child(`id_child-${i}-fieldset`);
        else
            new Collateral(`id_collateral-${i}-fieldset`);
    }
}

/**
 * 初期値に応じたイベントを発生させる
 * @param {Child|Collateral} instance 初期値を反映させる人 
 */
function dispatchIniChangeEvent(instance, onHold=false){
    try{
        const {inputs, constructor} = instance;
    
        // 親確認欄が未入力のときは実行しない（親確認欄が入力されたときに実行する）
        if(inputs[constructor.idxs.isSameParents.input[yes]].checked === false
            && inputs[constructor.idxs.isSameParents.input[no]].checked === false)
            return;

        const isRefuseNoInput = inputs[constructor.idxs.isRefuse.input[no]];
        let isRefuseNo = isRefuseNoInput.checked;
        for(let i = 0, len = inputs.length; i < len; i++){
            // 無限ループ防止
            if(onHold && constructor.idxs.isSameParents.input.includes(i))
                continue;

            if(constructor === Collateral && onHold && constructor.idxs.isFather.input.includes(i))
                continue;

            const input = inputs[i];
            if(input.checked || (input === isRefuseNoInput && isRefuseNo))
                input.dispatchEvent(new Event("change"));
        }
    
        if(isRefuseNo)
            isRefuseNoInput.checked = true;

    }catch(e){
        throw new Error(`dispatchIniChangeEventでエラー\n${constructor.name}の子供全員の値に基づくイベント発生中にエラーが発生しました`);
    }
}

/**
 * 子共通又は兄弟姉妹共通欄のデータを取得する
 * @param {ChildCommon|CollateralCommon} commonInstance 
 * @param {Object} indivisualIdxs
 * @param {Object} commonIdxs 
 * @returns 子共通又は兄弟姉妹共通のデータ
 */
function getCommonData(commonInstance, indivisualIdxs, commonIdxs){
    const inputs = commonInstance.inputs;
    const iniData = {
        isSameParents: {
            idx: indivisualIdxs.isSameParents.input[yes],
            checked: inputs[commonIdxs.isSameParents.input[yes]].checked ? true: false
        },
        isLiveTrue: {
            idx: indivisualIdxs.isLive.input[yes],
            checked: inputs[commonIdxs.isLive.input[yes]].checked ? true: false 
        },
        isRefuseFalse: { 
            idx: indivisualIdxs.isRefuse.input[no], 
            checked: inputs[commonIdxs.isRefuse.input[no]].checked ? true: false 
        },
        isAdultTrue: { 
            idx: indivisualIdxs.isAdult.input[yes],
            checked: inputs[commonIdxs.isAdult.input[yes]].checked ? true: false 
        },
        isJapanTrue: {
            idx: indivisualIdxs.isJapan.input[yes],
            checked: inputs[commonIdxs.isJapan.input[yes]].checked ? true: false 
        }
    }
    return iniData;
}

/**
 * １つのラジオボタンのイベントを発火させる
 * @param {HTMLElement} rb ラジオボタン要素
 */
function dispatchSingleRbEvent(rb){
    if(rb.checked){
        const event = new Event("change");
        rb.dispatchEvent(event);
    }
}

/**
 * 親確認欄を「いいえ」にして無効化する
 * ・非表示処理はない
 * @param {Child} instances 
 */
function disableIsSameParents(instances){
    const isSameParentsIdxs = instances[0].constructor.idxs.isSameParents.input;
    instances.forEach(x => {
        const inputs = x.inputs;
        inputs[isSameParentsIdxs[no]].checked = true;
        inputs[isSameParentsIdxs[yes]].disabled = true;
        inputs[isSameParentsIdxs[no]].disabled = true;
    })
}

/**
 * ユーザーが入力しているか判別する
 * @param {HTMLElement[]} inputs 
 */
function isUserInputted(inputs){
    for(let i = 0, len = inputs.length; i < len; i++){
        const input = inputs[i];
        if(input.disabled)
            continue;

        const inputType = input.type;
        if(inputType === "text" && input.value !== "" || inputType === "radio" && input.checked)
            return true;
    }

    return false;
}

/**
 * ユーザーの入力があるフォームか判別する（１人目は常に初期化され未入力のため判定不要）
 * @param {Child|Collateral} instances 
 * @param {Child|Collateral} targetInstance 
 */
function getIsUserInputted(instances, targetInstance){
    if(instances.indexOf(targetInstance) > 0)
        return isUserInputted(targetInstance.inputs);

    return false;
}

/**
 * fieldsetに初期値を反映させて、その初期値に応じたイベントを実行しておく
 * @param {ChildCommon|Child|CollateralCommon|Collateral} nextInstance 反映させるfieldsetのインスタンス
 */
function setIniData(nextInstance){
    const {fieldset, inputs, Qs, successFrom} = nextInstance;
    // 子または兄弟姉妹のとき
    if(fieldset.classList.contains(Classes.fieldset.child) || fieldset.classList.contains(Classes.fieldset.collateral)){
        const isChild = nextInstance.constructor === Child;
        const instances = isChild? childs: collaterals;
        const commonInstance = isChild? childCommon: collateralCommons[0];

        // 最初の欄のとき
        if([Ids.fieldset.firstChild, Ids.fieldset.firstCollateral].includes(fieldset.id)){
            // 子の場合、配偶者がいないとき、親確認欄を非表示にしていいえにチェックを入れておく
            if(fieldset.id === Ids.fieldset.firstChild && spouse.inputs[SIsExist.input[no]].checked)
                disableIsSameParents(childs);

            // 全員欄のデータを反映させる
            reflectCommonData(instances, commonInstance);
        }

        // ユーザーが未入力のとき、初期値に基づくイベントを発生させる
        if(!getIsUserInputted(instances, nextInstance))
            dispatchIniChangeEvent(nextInstance);
    }else if(fieldset.classList.contains(Classes.fieldset.grandChild)){
        //孫個人の欄のとき
        //対象の子の配偶者欄がいいえまたは未入力（代襲）のとき、配偶者確認欄にいいえをチェックして非表示にして健在確認欄を表示する
        if(successFrom.inputs[CIsSpouse.input[yes]].checked === false){
            Qs[GIsSameParents.form].style.display = "none";
            inputOrCheckAndDispatchChangeEvent(inputs[GIsSameParents.input[no]]);
        }
    }else{
        // 兄弟姉妹全員欄のとき
        // 兄弟姉妹がいないが押されている、かつ配偶者が相続人ではないときシステム対応外表示
        const isExistNoInput = inputs[ChCIsExist.input[no]];
        if(isExistNoInput.checked && !spouse.isHeir())
            isExistNoInput.dispatchEvent(new Event("change"));
    }
}

/**
 * 完了fieldsetの戻るボタンのクリックイベントハンドラー
 * @param {event} e 
 */
function handleSubmitBtnFieldsetPreBtnClick(e){
    //完了fieldsetを非表示にする
    const submitBtnFieldset = document.getElementById("submitBtnFieldset");
    const lastHr = getLastElByAttribute("hr", "tag");
    slideUp(lastHr);
    slideUp(submitBtnFieldset);
    lastHr.remove();
    //一つ前のfieldsetを有効化する
    const preFieldset = getLastElFromArray(reqInstance).fieldset;
    preFieldset.disabled = false;
    scrollToTarget(preFieldset);
    //一つ前のfieldsetを最初の項目にフォーカスする
    getLastElFromArray(reqInstance).inputs[0].focus();
    enablePreGuide(true);
    //このイベントを削除する
    const preBtn = submitBtnFieldset.getElementsByClassName("preBtn")[0];
    preBtn.removeEventListener("click", handleSubmitBtnFieldsetPreBtnClick);
}

/**
 * 対象の続柄を初期化する
 * @param {EveryIndivisual} instances 
 * @param {string} className 
 * @param {string} totalFormId 
 */
function iniTargetRelation(instances, className, totalFormId, isAscendant=false){
    if(instances.length > 0){
        if(!isAscendant)
            removeAllExceptFirst(Array.from(className));
        iniIndivisualFieldsets(instances[0]);
        instances.length = 0;
        document.getElementById(totalFormId).value = 0;
    }
}

/**
 * 最後の入力欄の続柄に応じて必要ない続柄のフィールドセットと
 * インスタンスを初期化してデータが送信されないようにする
 * @param {Child|ChildSpouse|GrandChild|Ascendant|Collateral} fromInstance 
 */
function beforeSubmit(fromInstance){

    // 卑属関連の初期化
    function iniChildRelated(isChild){
        iniTargetRelation(childSpouses, Classes.fieldset.childSpouse, Ids.totalForm.childSpouse);
        iniTargetRelation(grandChilds, Classes.fieldset.grandChild, Ids.totalForm.grandChild);

        if(isChild)
            iniTargetRelation(childs, Classes.fieldset.child, Ids.totalForm.child);
    }

    // 尊属と傍系の初期化
    function iniAscendantAndCollateral(isCollateral){
        iniTargetRelation(ascendants, Classes.fieldset.ascendant, Ids.totalForm.ascendant);

        if(isCollateral)
            iniTargetRelation(collaterals, Classes.fieldset.collateral, Ids.totalForm.collateral);
    }

    // 子のとき、子の相続人、尊属、傍系を初期化
    if(fromInstance === getLastElFromArray(childs)){
        iniChildRelated(false);
        iniAscendantAndCollateral(true);
    }else if([getLastElFromArray(childSpouses), getLastElFromArray(grandChilds)].includes(fromInstance)){
        // 子の相続人のとき、尊属、傍系を初期化する
        iniAscendantAndCollateral(true);
    }else if(fromInstance === getLastElFromArray(ascendants)){
        // 尊属のとき、傍系を初期化/ 子がいないとき、子関連も初期化
        iniAscendantAndCollateral(false);

        if(childCommon.countChilds() === 0)
            iniChildRelated(true);
    }else if(fromInstance === getLastElFromArray(collaterals)){
        // 兄弟姉妹のとき、かつ子がいないとき、子関連を初期化
        if(childCommon.countChilds() === 0)
            iniChildRelated(true);
    }else{
        throw new Error(`beforeSubmitでエラー\n想定しないフォームからsubmitされました\nfromInstance=${fromInstance}`);
    }
        
    // 入力値が送信されるように全ての要素を有効化する
    enableAllInputsAndSelects();
}

/**
 * 完了fieldsetを有効化する
 * 
 * inputFieldやGuideのデータは１つ前のfieldsetのもののままにする
 * @param {EveryIndivisual} fromInstance 
 */
function enableSubmitBtnFieldset(fromInstance){
    //完了fieldsetを表示する
    const submitBtnFieldset = document.getElementById("submitBtnFieldset");
    displayNextFieldset(submitBtnFieldset);
    //最後のガイドのactiveを削除／キャレットを非表示、チェックを表示
    inactiveGuide(true);
    //戻るボタンにイベントを設定
    const preBtn = submitBtnFieldset.getElementsByClassName("preBtn")[0];
    preBtn.addEventListener("click", handleSubmitBtnFieldsetPreBtnClick);
    //完了ボタンにフォーカスを移動する
    const nextBtn = submitBtnFieldset.getElementsByClassName("nextBtn")[0];
    const handleSubmitBtnFieldsetNextBtnClick  = () => beforeSubmit(fromInstance);
    nextBtn.addEventListener("click", handleSubmitBtnFieldsetNextBtnClick)
    nextBtn.focus();
}

/**
 * 両親（祖父母を含む）のindexを更新して父（祖父）を返す
 * @param {string} fatherId 
 * @param {string} motherId 
 */
function updateParentsExistingIndex(fatherId, motherId){
    const father = ascendants.find(x => x.fieldset.id === fatherId);
    const mother = ascendants.find(x => x.fieldset.id === motherId);
    father.inputs[AIndex.input].value = UpdateTitle.getNumbering({instance: father});
    mother.inputs[AIndex.input].value = UpdateTitle.getNumbering({instance: mother});
    return father
}

/**
 * 父母のインスタンスを生成、または既存のインスタンスを返す
 * 
 * ・フィールドセットのタイトルとindexを更新する
 * @returns {Ascendant} 父のインスタンス
 */
function getFatherAndMotherInstance(fromInstance){
    //タイトルを更新する
    UpdateTitle.ascendants(fromInstance, true);
    
    //既存のインスタンスがあるとき
    if(ascendants.length > 0)
        return updateParentsExistingIndex(Ids.fieldset.father, Ids.fieldset.mother);

    const father = new Ascendant(Ids.fieldset.father);
    new Ascendant(Ids.fieldset.mother);

    return father;
}

/**
 * 子、子の配偶者、孫の初期化
 * ・フィールドセットを１つにする
 * ・フィールドセットの初期化
 * ・インスタンスを全削除
 * ・トータルフォームを１にする
 * @param {boolean} isChild 子を初期化対象にするかのフラグ
 */
function iniChildRelated(isChild){
    try{
        if(isChild)
            removeAllExceptFirst(document.getElementsByClassName(Classes.fieldset.child));
        removeAllExceptFirst(document.getElementsByClassName(Classes.fieldset.childSpouse));
        removeAllExceptFirst(document.getElementsByClassName(Classes.fieldset.grandChild));
    
        const targetInstances = [...(isChild ? [childs] : []), childSpouses, grandChilds];
        targetInstances.forEach(x => {
            if(x.length > 0)
                iniIndivisualFieldsets(x[0]);
            x.length = 0;
        });
    
        const targetTotalForms = [...(isChild ? [Ids.totalForm.child] : []), Ids.totalForm.childSpouse, Ids.totalForm.grandChild];
        targetTotalForms.forEach(x => document.getElementById(x).value = 1);
    }catch(e){
        throw new Error(`iniChildRelatedでエラー\nerror=${e.message}\nisChild=${isChild}`);
    }
}


/**
 * 子共通欄から父欄を表示するときの処理
 * @returns 父のインスタンス
 */
function childCommonToFather(fromInstance){
    // 子、子の配偶者、孫を初期化
    iniChildRelated(true);
    return getFatherAndMotherInstance(fromInstance);
}

/**
 * 子の相続人のインスタンスを配列に入れてソートして、その結果を返す
 * @returns ソートされた子の相続人のインスタンスが格納された配列
 */
function getSortedChildsHeirsInstance(){
    try{
        const childsHeirs = [...childSpouses, ...grandChilds];
        const childIndexMap = new Map(childs.map((child, index) => [child, index]));
        childsHeirs.sort((a, b) => {
            const indexA = childIndexMap.get(a.successFrom);
            const indexB = childIndexMap.get(b.successFrom);
            if (indexA === indexB)
                return (a instanceof ChildSpouse) ? -1 : 1;
            return indexA - indexB;
        });
        return childsHeirs;
    }catch(e){
        throw new Error(`getSortedChildsHeirsInstanceでエラー\n＞子の相続人のインスタンスの並び替えの処理でエラー\n${e.message}`);
    }
}

/**
 * 子の相続人のindexとtarget（孫はtarget1）を入力する
 * @param {ChildSpouse|GrandChild} instance 
 * @param {HTMLElement} fieldset 
 * @param {boolean} isSpouse 
 */
function inputChildsHeirsIndexAndTarget(instance, fieldset, isSpouse){
    const els = fieldset.querySelectorAll("input[type='hidden']");
    if(els.length === 0)
        throw new Error(`inputChildsHeirsIndexAndTargetでエラー\n＞${instance.constructor.name}にinput[type='hidden']がありません`)

    for(let j = 0, len = els.length; j < len; j++){
        const el = els[j];
        if(el.id.includes("index")){
            const title = fieldset.getElementsByClassName(Classes.fieldset.title)[0].textContent;
            el.value = title.match(/[^．]+/)[0];
        }else{
            // 子の配偶者のときはtarget、孫のときはtarget1またはtarget2
            if(isSpouse){
                el.value = instance.successFrom.inputs[CIndex.input].value.trim();
            }else{
                if(el.id.includes("target1")){
                    el.value = instance.successFrom.inputs[CIndex.input].value.trim();
                }
            } 
        }
    }
}

/**
 * 子の相続人のfieldsetのタイトルと属性（id,name,class,for）を更新する
 * @param {ChildSpouse|GrandChild[]} instances 子の相続人のインスタンスが格納された配列
 */
function updateChildsHeirFieldsets(instances){
    const fieldsets = document.getElementsByClassName(Classes.fieldset.childHeir);
    let childSpouseIdx = 0; //子の配偶者のインデックス（id用）
    let grandChildIdx = 0; //孫のインデックス（id用）
    let preChildIdx; //１つ前の死亡している子のインデックス
    let countSuccessFrom = 0; //数次相続の数をカウントする（タイトルの本番に使用するため）
    let countHeir = 0; //死亡している子ごとに相続人をカウントする（タイトルの枝番に使用するため）
    for(let i = 0, len = instances.length; i < len; i++){
        try{
            const instance = instances[i];
            const fieldset = fieldsets[i];
            const isSpouse = instance.constructor.name === "ChildSpouse";
            const zokugara = isSpouse? "配偶者": "子"; //タイトル用
            const newIdx = isSpouse? childSpouseIdx: grandChildIdx; //属性に付与するインデックス
            //既存の子の配偶者欄のfieldsetのタイトルを変更する
            const titleEl = fieldset.querySelector(".fieldsetTitle");
            const childIdx = childs.indexOf(instance.successFrom); //子のインデックスを取得する
            //子のインデックスが１つ前のものと同じ時、その子の相続人のインデックスを加算する
            if(childIdx === preChildIdx){
                countHeir += 1;
            }else{
                //異なるとき、その子の相続人のインデックスを１に戻す、孫のインデックスも１に戻す、数次相続の数を１増やす
                countHeir = 1;
                countSuccessFrom += 1;
            }
            preChildIdx = childIdx;
            UpdateTitle.childsHeirs(titleEl, instance.successFrom, zokugara, countSuccessFrom, countHeir);
            //inputとbuttonのname、id、クラスを更新する
            updateAttribute(fieldset, "[id], [name], [for]", /(-)(\d+)/, newIdx);
            inputChildsHeirsIndexAndTarget(instance, fieldset, isSpouse);
            isSpouse? childSpouseIdx += 1: grandChildIdx += 1;
        }catch(e){
            throw new Error(`updateChildsHeirFieldsetsでエラー\n＞${i}番目の子の相続人のフィールドセットの属性を更新中にエラー\n${e.message}`)
        }
    }
    return fieldsets;
}

/**
 * 子の相続人のインスタンスを生成する
 * ・生成したインスタンスのidのインデックスは後で更新するため0固定でOK
 * @param {boolean} isSpouse 子の配偶者フラグ
 * @param {number} idx 対象の子のchildsにおけるインデックス
 */
function createChildsHeirInstance(isSpouse, idx){
    if(isSpouse){
        const newInstance = new ChildSpouse(Ids.fieldset.firstChildSpouse);
        newInstance.successFrom = childs[idx];
    }else{
        for(let i = 0, len = parseInt(childs[idx].inputs[CCount.input].value); i < len; i++){
            const newInstance =  new GrandChild(Ids.fieldset.firstGrandChild);
            newInstance.successFrom = childs[idx];
        }
    }
}

/**
 * テンプレを複製して最後に挿入していく
 * @param {EveryInstance} instances 
 * @param {HTMLElement} preEl 
 * @param {object} templates {"インスタンスのクラス名": そのインスタンスの最初のフィールドセット}
 */
function createFieldsetFromTemplate(instances, preEl, templates){    
    for(let i = 0, len = instances.length; i < len; i++){
        const instanceClassName = instances[i].constructor.name;
        if(!templates[instanceClassName])
            basicLog("createFieldsetFromTemplate", null, `${instanceClassName}のテンプレがありません`);

        const newElement = templates[instanceClassName].cloneNode(true);
        preEl.after(newElement);
        preEl = newElement;
    }
}

/**
 * フィールドセットのテンプレートを返す
 * @param {Array<{name: string, id: string, regex: RegExp}>} fieldsConfig
 *      各フィールドの設定オブジェクトの配列。
 *      `name` - テンプレートの名前。
 *      `id` - HTML要素のID。
 * @returns {Object} 各テンプレートに対応するクローンされたノードを持つオブジェクト。
 */
function getFieldsetTemplates(fieldsConfig){
    const templates = {}
    fieldsConfig.forEach(({ name, id })=> {
        const el = document.getElementById(id);
        if(!el)
            throw new Error(`getFieldsetTemplatesでエラー\n$idが{id}の要素はありません`);

        templates[name] = el.cloneNode(true);
    })

    return templates;
}

/**
 * 子の相続人のfieldsetを全て削除して、ソートされた子の相続人のインスタンスのインデックス順にfieldsetを生成する
 * 
 * 子の配偶者又は孫がいないときは、テンプレ元のfieldsetを復活させる
 * @param {(ChildSpouse|GrandChild)[]} childsHeirs 被相続人の子の相続人のインスタンスが格納されたインスタンス
 */
function createChildsHeirsFieldset(childsHeirs){
    const instanceNameOne = "ChildSpouse";
    const instanceNameTwo = "GrandChild";
    try{
        const templates = getFieldsetTemplates(
            [
                {name:instanceNameOne, id:Ids.fieldset.firstChildSpouse},
                {name:instanceNameTwo, id:Ids.fieldset.firstGrandChild}
            ]
        )

        const childSpouseFields = Array.from(document.getElementsByClassName(Classes.fieldset.childSpouse));
        const grandChildFields = Array.from(document.getElementsByClassName(Classes.fieldset.grandChild));
        removeAll(childSpouseFields.concat(grandChildFields));

        const prefieldset = getLastElFromArray(childs).fieldset;
        createFieldsetFromTemplate(childsHeirs, prefieldset, templates);

        document.getElementById(Ids.totalForm.childSpouse).value = childSpouses.length;
        document.getElementById(Ids.totalForm.grandChild).value = grandChilds.length;

        if(childSpouses.length === 0)
            getLastElFromArray(document.getElementsByClassName(Classes.fieldset.grandChild)).after(templates[instanceNameOne]);
        if(grandChilds.length === 0)
            getLastElFromArray(document.getElementsByClassName(Classes.fieldset.childSpouse)).after(templates[instanceNameTwo]);
    }catch(e){
        throw new Error(`createChildsHeirsFieldsetでエラー\n＞子の相続人のフィールドセットの生成中にエラー\n${e.message}`)
    }
}

/**
 * 子の相続人のインスタンスとfieldsetを紐付ける
 * @param {ChildSpouse|GrandChild} instances 
 * @param {HTMLCollection} fieldsets 
 */
function linkChildsHeirInstanceAndFieldset(instances, fieldsets){
    for(let i = 0, len = instances.length; i < len; i++){
        const instance = instances[i];
        const fieldset = fieldsets[i];
        try{
            instance.fieldset = fieldset;
            instance.Qs = Array.from(fieldset.getElementsByClassName("Q"));
            instance.inputs = Array.from(fieldset.getElementsByTagName("input"));
            instance.preBtn = fieldset.getElementsByClassName("preBtn")[0];
            instance.nextBtn = fieldset.getElementsByClassName("nextBtn")[0];
            instance.errMsgEls = Array.from(fieldset.getElementsByClassName("errorMessage"));
            instance.noInputs = Array.from(fieldset.getElementsByTagName("input"));
            if(instance.constructor === ChildSpouse)
                instance.noInputs = instance.noInputs.filter((_, i) =>
                                        i !== ChildSpouse.idxs.index.input && 
                                        i !== ChildSpouse.idxs.target.input);
            else
                instance.noInputs = instance.noInputs.filter((_, i) => 
                                        i !== GrandChild.idxs.index.input && 
                                        i !== GrandChild.idxs.target1.input && 
                                        i !== GrandChild.idxs.target2.input);

        }catch(e){
            throw new Error(`linkChildsHeirInstanceAndFieldsetでエラー\n＞${i}番目の子の相続人のインスタンスの再constructo中にエラー\n${e.message}`)
        }
    }
}

/**
 * アラートと入力値の修正
 * @param {HTMLElement} input 
 * @param {string} formTitle 
 * @param {string} q 
 * @param {string} a 
 */
function alertAndFixData(input, formTitle, q, a){
    inputOrCheckAndDispatchChangeEvent(input);
    
    const title = "一部入力を変更しました";
    const message = `${formTitle}の「${q}」を「${a}」に変更しました`;
    showAlert(title, message, "warning");
}

/**
 * 子供全員欄の矛盾回答より先の質問を代理入力してイベント発生させる
 * @param {HTMLInputElement[]} inputs 
 * @param {boolean} isSameParents 
 * @param {boolean} isLive 
 * @param {boolean} isRefuse
 * @param {boolean} isJapan
 */
function fixChildCommonFollowingData(inputs, { isSameParents=false, isLive=false, isRefuse=false } = {}){

    if(isSameParents){
        fixAfterIsSameParents();
        return;
    }

    if(isLive){
        fixAfterIsLive();
        return;
    }

    if(isRefuse)
        fixAfterIsRefuse();

    function fixAfterIsSameParents(){
        if(childs.every(x => x.inputs[CIsLive.input[yes]].checked)){
            inputOrCheckAndDispatchChangeEvent(inputs[ChCIsLive.input[yes]]);
            disableInstancesSpecificInputs(childs, CIsLive.input);
            fixChildCommonFollowingData(inputs, { isLive : true });
        }else{
            inputOrCheckAndDispatchChangeEvent(inputs[ChCIsLive.input[no]]);
        }
    }

    function fixAfterIsLive(){
        if(childs.every(x => x.inputs[CIsRefuse.input[no]].checked)){
            inputOrCheckAndDispatchChangeEvent(inputs[ChCIsRefuse.input[no]]);
            disableInstancesSpecificInputs(childs, CIsRefuse.input);
            fixChildCommonFollowingData(inputs, { isRefuse : true });
        }else{
            inputOrCheckAndDispatchChangeEvent(inputs[ChCIsRefuse.input[yes]]);
        }
    }

    function fixAfterIsRefuse(){
        // 全員成人にチェック（未成年がいるときはシステム対応外になり、そもそもここの処理が実行されないため）
        inputOrCheckAndDispatchChangeEvent(inputs[ChCIsAdult.input[yes]]);
        disableInstancesSpecificInputs(childs, CIsAdult.input);

        // 全員日本在住か判別してtrueまたはfalseにチェック
        if(childs.every(x => x.inputs[CIsJapan.input[yes]].checked)){
            inputOrCheckAndDispatchChangeEvent(inputs[ChCIsJapan.input[yes]]);
            disableInstancesSpecificInputs(childs, CIsJapan.input);
        }else{
            inputOrCheckAndDispatchChangeEvent(inputs[ChCIsJapan.input[no]]);
        }
    }
}

/**
 * 子供全員欄の矛盾回答より先の質問を代理入力してイベント発生させる
 * @param {HTMLInputElement[]} inputs 
 * @param {boolean} isSameParents 
 * @param {boolean} isLive 
 * @param {boolean} isRefuse
 * @param {boolean} isJapan
 */
function fixCollateralCommonFollowingData(inputs, { isSameParents=false, isLive=false, isRefuse=false } = {}){

    if(isSameParents){
        fixAfterIsSameParents();
        return;
    }

    if(isLive){
        fixAfterIsLive();
        return;
    }

    if(isRefuse)
        fixAfterIsRefuse();

    function fixAfterIsSameParents(){
        if(collaterals.every(x => x.inputs[ColIsLive.input[yes]].checked)){
            inputOrCheckAndDispatchChangeEvent(inputs[CoCIsLive.input[yes]]);
            disableInstancesSpecificInputs(collaterals, ColIsLive.input);
            fixChildCommonFollowingData(inputs, { isLive : true });
        }else{
            inputOrCheckAndDispatchChangeEvent(inputs[CoCIsLive.input[no]]);
        }
    }

    function fixAfterIsLive(){
        if(collaterals.every(x => x.inputs[ColIsRefuse.input[no]].checked)){
            inputOrCheckAndDispatchChangeEvent(inputs[CoCIsRefuse.input[no]]);
            disableInstancesSpecificInputs(collaterals, ColIsRefuse.input);
            fixChildCommonFollowingData(inputs, { isRefuse : true });
        }else{
            inputOrCheckAndDispatchChangeEvent(inputs[CoCIsRefuse.input[yes]]);
        }
    }

    function fixAfterIsRefuse(){
        // 全員成人にチェック（未成年がいるときはシステム対応外になり、そもそもここの処理が実行されないため）
        inputOrCheckAndDispatchChangeEvent(inputs[CoCIsAdult.input[yes]]);
        disableInstancesSpecificInputs(collaterals, ColIsAdult.input);

        // 全員日本在住か判別してtrueまたはfalseにチェック
        if(collaterals.every(x => x.inputs[ColIsJapan.input[yes]].checked)){
            inputOrCheckAndDispatchChangeEvent(inputs[CoCIsJapan.input[yes]]);
            disableInstancesSpecificInputs(collaterals, ColIsJapan.input);
        }else{
            inputOrCheckAndDispatchChangeEvent(inputs[CoCIsJapan.input[no]]);
        }
    }
}

/**
 * 全インスタンスの特定のinputを無効化する
 * @param {EveryInstance} instances 
 * @param {number|number[]} idxs 
 */
function disableInstancesSpecificInputs(instances, idxs){
    if(!Array.isArray)
        idxs = [idxs];

    instances.forEach(x =>{
        idxs.forEach(y => x.inputs[y].disabled = true)
    });
}

/**
 * 子供全員または兄弟姉妹全員欄の矛盾データを修正する
 */
function alertAndfixChildCommonData(){
    try{
        const inputs = childCommon.inputs;
        const formTitle = "「３．子供全員」";
        if(AlertForContradictionToChildCommon.isSameParents(false)){
            alertAndFixData(inputs[ChCIsSameParents.input[yes]], formTitle, "全員配偶者との子ですか？", "はい");
            disableInstancesSpecificInputs(childs, CIsSameParents.input);
            fixChildCommonFollowingData(inputs, { isSameParents: true });
        }
        if(AlertForContradictionToChildCommon.isLive(false)){
            alertAndFixData(inputs[ChCIsLive.input[yes]], formTitle, "現在も全員ご健在ですか？", "はい");
            disableInstancesSpecificInputs(childs, CIsLive.input);
            fixChildCommonFollowingData(inputs, { isLive: true });
        }
        if(AlertForContradictionToChildCommon.isRefuse(false)){
            alertAndFixData(inputs[ChCIsRefuse.input[no]], formTitle, "家庭裁判所で相続放棄をした方はいますか？", "いない");
            disableInstancesSpecificInputs(childs, CIsRefuse.input);
            fixChildCommonFollowingData(inputs, { isRefuse: true });
        }
        if(AlertForContradictionToChildCommon.isJapan(false)){
            alertAndFixData(inputs[ChCIsJapan.input[yes]], formTitle, "現在もご健在の方は全員日本に住民票がありますか？", "はい");
            disableInstancesSpecificInputs(childs, CIsJapan.input);
        }
    }catch(e){
        throw new Error(`alertAndfixChildCommonDataでエラー\n${e}`);
    }
}

/**
 * 兄弟姉妹全員または兄弟姉妹全員欄の矛盾データを修正する
 */
function alertAndfixCollateralCommonData(){
    try{
        const inputs = collateralCommons[0].inputs;
        const formTitle = UpdateTitle.getFieldsetTitle({instance: collateralCommons[0]});
        if(AlertForContradictionToCollateralCommon.isSameParents(false)){
            alertAndFixData(inputs[CoCIsSameParents.input[yes]], formTitle, "全員被相続人と同じ両親ですか？", "はい");
            disableInstancesSpecificInputs(collaterals, ColIsSameParents.input);
            fixCollateralCommonFollowingData(inputs, { isSameParents: true });
        }
        if(AlertForContradictionToCollateralCommon.isLive(false)){
            alertAndFixData(inputs[CoCIsLive.input[yes]], formTitle, "現在も全員ご健在ですか？", "はい");
            disableInstancesSpecificInputs(collaterals, ColIsLive.input);
            fixCollateralCommonFollowingData(inputs, { isLive: true });
        }
        if(AlertForContradictionToCollateralCommon.isRefuse(false)){
            alertAndFixData(inputs[CoCIsRefuse.input[no]], formTitle, "家庭裁判所で相続放棄をした方はいますか？", "いない");
            disableInstancesSpecificInputs(collaterals, ColIsRefuse.input);
            fixCollateralCommonFollowingData(inputs, { isRefuse: true });
        }
        if(AlertForContradictionToCollateralCommon.isJapan(false)){
            alertAndFixData(inputs[CoCIsJapan.input[yes]], formTitle, "現在もご健在の方は全員日本に住民票がありますか？", "はい");
            disableInstancesSpecificInputs(collaterals, ColIsJapan.input);
        }
    }catch(e){
        throw new Error(`alertAndfixCollateralCommonDataでエラー\n${e}`);
    }
}

/**
 * 最後の子の欄から次に表示する欄を判別する
 * @returns 次に表示する人又はtrue（trueを返すとき完了fieldsetを表示する）
 */
function selectChildTo(fromInstance){
    // 次の子がいるとき
    if(fromInstance !== getLastElFromArray(childs))
        return getNextChild(fromInstance); 

    // 子供共通と反する回答があったときの修正処理
    alertAndfixChildCommonData();

    // 子の相続人のインスタンスとfieldsetを初期化
    iniChildRelated(false);

    /**
     * 子の中に相続人がいることを確認しながら数次または代襲があれば
     * インスタンスを生成してフラグを取得する（インスタンスは全て最初のフィールドセットに紐づける）
    */
    let isDone = false; //完了フラグ
    let isChildSpouse = false; //子の配偶者フラグ
    let isGrandChild = false; //孫フラグ
    for(let i = 0, len = childs.length; i < len; i++){
        const inputs = childs[i].inputs;
        const isLive = inputs[CIsLive.input[yes]].checked;
        const isNotRefuse = inputs[CIsRefuse.input[no]].checked;
        const isSpouse = inputs[CIsSpouse.input[yes]].checked;
        const isChild = inputs[CIsChild.input[yes]].checked;

        // 子に相続人がいるか判定
        if(isLive && isNotRefuse){
            isDone = true;
        }else if(isNotRefuse){
            // 数次があるか判定
            if(isSpouse){
                isChildSpouse = true;
                createChildsHeirInstance(true, i);
            }
            if(isChild){
                isGrandChild = true;
                createChildsHeirInstance(false, i);
            }
        }else if(isChild){
            // 代襲があるか判定
            isGrandChild = true;
            createChildsHeirInstance(false, i);
        }
    }
    /**
     * 数次または代襲があるとき
     * １，インスタンスをソートする
     * ２，fieldsetの生成と削除
     * ３，fieldsetのタイトルと属性値を更新する
     * ４，インスタンスとfieldsetを紐付ける
     */
    if(isChildSpouse || isGrandChild){
        const sortedChildsHeirsInstances = getSortedChildsHeirsInstance();
        createChildsHeirsFieldset(sortedChildsHeirsInstances);
        const childsHeirsFieldsets = updateChildsHeirFieldsets(sortedChildsHeirsInstances);
        linkChildsHeirInstanceAndFieldset(sortedChildsHeirsInstances, childsHeirsFieldsets);
        // 最初の子の相続人を返す（子の配偶者と孫が同じ子に紐づく場合は、子の配偶者を返す）
        if(isChildSpouse && isGrandChild)
            return childs.indexOf(
                grandChilds[0].successFrom) < childs.indexOf(childSpouses[0].successFrom)? 
                    grandChilds[0]:
                    childSpouses[0];
        if(isChildSpouse)
            return childSpouses[0];  
        if(isGrandChild)
            return grandChilds[0];
    }

    // 子の相続人がいない、かつ子に相続人がいるとき、入力完了フラグを返す
    if(isDone)
        return true;

    // 卑属に相続人がいないとき、父母のインスタンスを返す
    return getFatherAndMotherInstance(fromInstance);
}

/**
 * 次の子の相続人を返す
 * ・子の配偶者と孫から次のfieldsetと一致するfieldsetを持つ人を探す
 * @param {ChildSpouse|GrandChild} fromInstance 
 * @returns 次の子の相続人又はnull
 */
function getNextChildsHeir(fromInstance){
    const childHeirs = getSortedChildsHeirsInstance();
    const nextIdx = childHeirs.indexOf(fromInstance) + 1;

    if(nextIdx === 0)
        throw new Error(`getNextChildsHeirでエラー\n${childHeirs}の中に${fromInstance}が存在しません`);

    return childHeirs[nextIdx];
}

/**
 * 子の最後の相続人から次へ表示する欄を判別する
 * @returns 卑属が相続人のときはtrue、違うときは父インスタンス
 */
function selectChildsHeirTo(fromInstance){
    // 次の子の相続人がいるとき
    if(fromInstance !== getLastElFromArray(getSortedChildsHeirsInstance()))
        return getNextChildsHeir(fromInstance);

    //子、子の配偶者、孫の中に手続時生存trueかつ相続放棄falseが１人以上いるとき、完了fieldsetを表示する
    const descendants = childs.concat(childSpouses, grandChilds);
    const isLiveAndNotRefuse = x => {
        const {inputs, constructor} = x;
        const isLive = inputs[constructor.idxs.isLive.input[yes]].checked;
        const isRefuse = inputs[constructor.idxs.isRefuse.input[no]].checked;
        return isLive && isRefuse;
    };

    if(descendants.some(isLiveAndNotRefuse)){
        return true;
    }

    //いないとき、父母インスタンスを生成して父インスタンスを返す
    return getFatherAndMotherInstance(fromInstance);
}

/**
 * 全員欄から個人へ
 * @param {ChildCommon|CollateralCommon} fromInstance 続柄全員欄のインスタンス
 * @param {number} count 人数
 * @param {string} relation "child"または"collateral"
 * @returns 
 */
function commonToIndivisual(fromInstance, count, relation){
    const instances = relation === "child"? childs: collaterals;
    // フォームの初期化
    if(instances.length > 0)
        iniIndivisualFieldsets(instances[0]);
    
    // 兄弟姉妹のとき、フィールドセットを初期化
    if(relation === "collateral")
        UpdateTitle.mainNumber(fromInstance, document.getElementById(Ids.fieldset.firstCollateral), "－");

    //fieldsetとインスタンスの再生
    regenerateChildOrCollateralFieldsets(relation, count);
    regenerateChildOrCollateralInstances(relation, count);

    return instances[0];
}

/**
 * 兄弟姉妹共通欄から返すデータを判別する
 * @param {CollateralCommon} fromInstance 
 */
function selectCollateralCommonTo(fromInstance){
    // 兄弟姉妹がいるとき、兄弟姉妹１を返す
    const count = collateralCommons[0].countCollaterals();
    if(count > 0)
        return commonToIndivisual(fromInstance, count, "collateral");

    // 兄弟姉妹がいないとき、配偶者が手続時生存trueかつ相続放棄falseであれば完了フラグを返す
    if(spouse.isHeir())
        return true;

    // 不正操作のため処理しない
    return null;
}

/**
 * 配列から特定の要素（複数可）を削除する
 * @param {[]} arr
 * @param {*} els 
 */
function removeSpecificElsFromArray(arr, els){
    if(!Array.isArray(els))
        els = [els]

    els.forEach(x => {
        const idx = arr.findIndex(y => x === y);
        if(idx !== -1)
            arr.splice(idx, 1);
    })
}

/**
 * 父母（祖父母）のインスタンスとフィールドセットを初期化する
 * @param {Ascendant} instances 
 * @param {string} fatherId 
 * @param {string} motherId 
 */
function iniParents(instances, fatherId, motherId){
    const father = instances.find(x => x.fieldset.id === fatherId);
    const mother = instances.find(x => x.fieldset.id === motherId);
    if(father && mother){
        iniIndivisualFieldsets([father, mother]);
        removeSpecificElsFromArray(instances, [father, mother]);
    }

    if(father && !mother || !father && mother)
        throw new Error(`iniParentsでエラー\n父母のインスタンスが正常に生成されてません\nfather=${father}, mother=${mother}`);
}
/**
 * 母から母方の祖父のときの処理
 * @returns 母方の祖父インスタンス
 */
function motherToMotherGF(){
    // 父方の祖父母を初期化する
    iniParents(ascendants, Ids.fieldset.fatherGF, Ids.fieldset.fatherGM);
    // タイトルを更新する
    UpdateTitle.motherGparentsFieldset(true);
    // 祖父のインスタンスを返す
    return toGFCommon(Ids.fieldset.mother, Ids.fieldset.motherGF, Ids.fieldset.motherGM);
}

/**
 * 母から兄弟姉妹全員を表示するとき
 * @param {Ascendant} fromInstance 母、父方の祖母、母方の祖母のいずれか
 * @param {number} correctAscendantsCount 2=母から、4=父方の祖母、その他は母方の祖母
 * @returns 兄弟姉妹全員欄のインスタンス
 */
function toCollateralCommon(fromInstance, correctAscendantsCount){
    // 引数の値エラー
    if(![2, 4, null].includes(correctAscendantsCount))
        throw new Error(`toCollateralCommonでエラー\ncorrectAscendantsCountは2, 4, nullのいずれかを入力してください\ncorrectAscendantsCount=${correctAscendantsCount}`);

    // 尊属のインスタンスの数を確定させてフィールドセットを初期化
    if(correctAscendantsCount && ascendants.length > correctAscendantsCount){
        iniIndivisualFieldsets(ascendants.slice(correctAscendantsCount));
        ascendants.length = correctAscendantsCount;
    }
    
    // 兄弟姉妹全員インスタンスが存在するとき、既存のインスタンスを返す
    const instance = collateralCommons.length > 0?
        collateralCommons[0]:
        new CollateralCommon(Ids.fieldset.collateralCommon);
    
    // フィールドセットのタイトルを更新
    UpdateTitle.mainNumber(fromInstance, instance.fieldset, "．");

    return instance;
}

/**
 * 祖父母のインスタンスを生成/targetを設定/ascendantsを並び替え/祖父を返す
 * @param {Ascendant} parent 父または母のインスタンス
 * @param {string} gfId 父方または母方の祖父のid
 * @param {string} gmId 父方または母方の祖母のid
 * @returns 祖父のインスタンス
 */
function createGParentsInstance(parent, gfId, gmId){
    const gf = new Ascendant(gfId);
    const gm = new Ascendant(gmId);
    
    [gf, gm].forEach(x => x.inputs[ATarget.input].value = parent.inputs[AIndex.input].value);
    sortAscendantsByFieldsetId();

    return gf;
}

/**
 * 既存の祖父母のtaregetとindexを更新して祖父を返す
 * @param {Ascendant} parent 父または母のインスタンス
 * @param {Ascendant} gf 父方または母方の祖父
 * @param {Ascendant} gm 父方または母方の祖母
 * @returns 祖父のインスタンス
 */
function updateGParentsIndexAndTarget(parent, gf, gm){
    [gf, gm].forEach(x => {
        x.inputs[AIndex.input].value = UpdateTitle.getNumbering({instance: x});
        x.inputs[ATarget.input].value = parent.inputs[AIndex.input].value;
    });

    return gf;
}

/**
 * ascendantsをfieldset.idに含まれる数字に基づいて昇順にソートします。
 */
function sortAscendantsByFieldsetId(){
    const regex = /id_ascendant-(\d+)-fieldset/;
    ascendants.sort((a, b) => {
        // fieldset.id から数字を抽出
        const numA = parseInt(a.fieldset.id.match(regex)[1]);
        const numB = parseInt(b.fieldset.id.match(regex)[1]);

        return numA - numB; // 数値で比較して昇順にソート
    });
}

/**
 * 祖父を返す
 * @returns 祖父インスタンス
 */
function toGFCommon(parentId, gfId, gmId){
    // 既存の祖父母を検索
    const existingGF = ascendants.find(x => x.fieldset.id === gfId);
    const existingGM = ascendants.find(x => x.fieldset.id === gmId);
    if(existingGF && !existingGM || !existingGF && existingGM)
        throw new Error(`toGFCommonでエラー\n祖父母の一方のインスタンスが正常に生成されていません\nexistingGM=${existingGF}, existingGM=${existingGM}`)

    const parent = ascendants.find(x => x.fieldset.id === parentId);
    if(!parent)
        throw new Error(`toGFCommonでエラー\nfieldsetのidが${parentId}に一致する要素がascendantsにありません。`);

    // 既存の祖父のインスタンスを返す
    if(existingGF)
        return updateGParentsIndexAndTarget(parent, existingGF, existingGM);

    // 祖父母インスタンスを生成する
    return createGParentsInstance(parent, gfId, gmId);
}

/**
 * 母欄から返すデータを判別する
 * @returns 次に入力してもらう人のインスタンスまたはtrue（完了フラグ）
 */
function selectMotherTo(fromInstance){
    const fatherInputs = ascendants.find(x => x.fieldset.id === Ids.fieldset.father).inputs;
    const motherInputs = ascendants.find(x => x.fieldset.id === Ids.fieldset.mother).inputs;
    
    // 父が被相続人より先に死亡しているとき父方の祖父母を返す
    const isFatherExistFalse = fatherInputs[AIsExist.input[no]].checked;
    if(isFatherExistFalse)
        return toGFCommon(Ids.fieldset.father, Ids.fieldset.fatherGF, Ids.fieldset.fatherGM);

    // 父が生存している、かつ母が被相続人より先に死亡しているとき、母方の祖父を返す
    const isFatherLive = fatherInputs[AIsLive.input[yes]].checked;
    const isMotherExistFalse = motherInputs[AIsExist.input[no]].checked;
    if(isFatherLive && isMotherExistFalse)
        return motherToMotherGF();

    // 父母両方が相続放棄しているとき、兄弟姉妹全員を返す
    const isFatherRefuse = fatherInputs[AIsRefuse.input[yes]].checked;
    const isMotherRefuse = motherInputs[AIsRefuse.input[yes]].checked;
    if(isFatherRefuse && isMotherRefuse)
        return toCollateralCommon(fromInstance, 2);

    // いずれにも該当しないとき、入力完了フラグを返す
    return true;
}

/**
 * 父方の祖母から次に表示する欄を判別する
 * @param {Ascendant} fromInstance 父方の祖母のインスタンス
 * @returns 次に表示する欄またはtrue（完了フラグ）
 */
function selectFatherGMTo(fromInstance){
    const mother = ascendants.find(x => x.fieldset.id === Ids.fieldset.mother);
    const fatherGF = ascendants.find(x => x.fieldset.id === Ids.fieldset.fatherGF);
    const fatherGM = ascendants.find(x => x.fieldset.id === Ids.fieldset.fatherGM);
    if(!mother || !fatherGF || !fatherGM)
        throw new Error(`selectFatherGMToでエラー\nインスタンスが正常に生成されていません\nmother=${mother}\nfatherGF=${fatherGF}\nfatherGM=${fatherGM}`);

    const motherInputs = mother.inputs;
    const fatherGfatherInputs = fatherGF.inputs;
    const fatherGmotherInputs = fatherGM.inputs;

    const motherIsExistNo = motherInputs[AIsExist.input[no]].checked;
    const motherIsRefuseYes = motherInputs[AIsRefuse.input[yes]].checked;
    const fatherIsGFExistNo = fatherGfatherInputs[AIsExist.input[no]].checked;
    const fatherIsGFRefuseYes = fatherGfatherInputs[AIsRefuse.input[yes]].checked;
    const fatherIsGMExistNo = fatherGmotherInputs[AIsExist.input[no]].checked;
    const fatherIsGMRefuseYes = fatherGmotherInputs[AIsRefuse.input[yes]].checked;

    // 母が死亡しているとき、母方の祖父を返す
    if(motherIsExistNo){
        UpdateTitle.motherGparentsFieldset(false);
        return toGFCommon(Ids.fieldset.mother, Ids.fieldset.motherGF, Ids.fieldset.motherGM);
    }

    // 尊属に相続人がいないとき、兄弟姉妹全員欄を返す
    if((fatherIsGFExistNo || fatherIsGFRefuseYes) && (fatherIsGMExistNo || fatherIsGMRefuseYes) && motherIsRefuseYes)
        return toCollateralCommon(fromInstance, 4);
    
    // 完了フラグを返す
    return true;
}

/**
 * 子共通欄から次に表示する欄を判別する
 * @returns 次に表示するインスタンス
 */
function selectChildCommonTo(fromInstance){
    const childCount = childCommon.countChilds();
    if(childCount > 0)
        return commonToIndivisual(fromInstance, childCount, "child");

    return childCommonToFather(fromInstance);
}

/**
 * 前の子にtarget2をセットして次の子のインスタンスを返す
 * @param {Child} fromInstance 前の子のインスタンス
 */
function getNextChild(fromInstance){
    const {inputs, constructor} = fromInstance;
    inputs[constructor.idxs.target2.input].value = 
        inputs[constructor.idxs.isSameParents.input[yes]].checked? "２": "";

    return childs[childs.indexOf(fromInstance) + 1];
}

/**
 * 母方の祖母から次に表示する欄を判別する
 * @returns 次に表示するインスタンス
 */
function selectMotherGMTo(fromInstance){
    const isDone = ascendants.some(x => x.inputs[AIsLive.input[yes]].checked && x.inputs[AIsRefuse.input[no]].checked);
    if(isDone)
        return true;

    //尊属の中に相続人がいないとき、兄弟姉妹共通を表示する
    return toCollateralCommon(fromInstance, null);
}

/**
 * 尊属から次に表示するインスタンスを返す
 * @param {Ascendant} fromInstance 
 */
function selectAscendantTo(fromInstance){
    const preFieldsetId = fromInstance.fieldset.id;
    // 父、父方の祖父、母方の祖父のとき、次のインデックスのインスタンスを返す
    if([Ids.fieldset.father, Ids.fieldset.fatherGF, Ids.fieldset.motherGF].includes(preFieldsetId))
        return ascendants[ascendants.indexOf(fromInstance) + 1];
    // 母のとき
    if(preFieldsetId === Ids.fieldset.mother)
        return selectMotherTo(fromInstance);
    // 父方の祖母のとき
    if(preFieldsetId === Ids.fieldset.fatherGM)
        return selectFatherGMTo(fromInstance);
    // 母方の祖母のとき
    if(preFieldsetId === Ids.fieldset.motherGM)
        return selectMotherGMTo(fromInstance);
}

/**
 * 兄弟姉妹個人欄の次のインスタンスを取得する
 * @param {CollateralCommon} fromInstance 
 * @returns {Collateral} 次の兄弟姉妹のインスタンス
 */
function selectCollateralTo(fromInstance){
    if(fromInstance === getLastElFromArray(collaterals)){
        // 兄弟姉妹全員欄と反する回答があったときの修正処理
        alertAndfixCollateralCommonData();
        return true;
    }

    //１つ前が最後以外の兄弟姉妹個人のインスタンスのとき
    const nextIdx = collaterals.indexOf(fromInstance) + 1;
    if(nextIdx === 0)
        throw new Error(`selectCollateralToでエラー\n次のインスタンスがありません\nfromInstance=${fromInstance}`);

    return collaterals[nextIdx];
}

/**
 * 次に回答してもらう人を判別して、インスタンスを生成する
 * @param {EveryInstance} fromInstance 前の人
 * @returns 次に回答してもらう人を返す|trueのとき入力完了|falseのとき該当なし（エラー）
 */
function getNextRelation(fromInstance){
    //１つ前が被相続人インスタンスのとき、配偶者インスタンスを返す
    if(fromInstance === decedents[0])
        return spouse;
    //１つ前が配偶者インスタンスのとき、子共通インスタンスを返す
    if(fromInstance === spouses[0])
        return childCommon;
    //１つ前が子共通欄のとき
    if(fromInstance === childCommons[0])
        return selectChildCommonTo(fromInstance);
    // １つ前が子の欄のとき
    if(childs.includes(fromInstance))
        return selectChildTo(fromInstance);
    // １つ前が子の相続人の欄のとき
    if(childSpouses.concat(grandChilds).includes(fromInstance))
        return selectChildsHeirTo(fromInstance);
    // １つ前が尊属の欄のとき
    if(ascendants.includes(fromInstance))
        return selectAscendantTo(fromInstance);
    //１つ前が兄弟姉妹共通インスタンスのとき
    if(collateralCommons.includes(fromInstance))
        return selectCollateralCommonTo(fromInstance);
    //１つ前が兄弟姉妹のインスタンスのとき
    if(collaterals.includes(fromInstance))
        return selectCollateralTo(fromInstance);
    //該当がないとき
    throw new Error(`getNextRelationでエラー\nfromInstance(${fromInstance})に一致する続柄がありません`);
}

/**
 * イベント設定と初期値設定
 * @param {EveryInstance} nextInstance 次の入力欄
 */
function setEventAndIniData(nextInstance){
    // 入力してきたインスタンスを取得する
    reqInstance.push(nextInstance);;
    
    // 子全員または兄弟姉妹全員のとき
    const {constructor} = nextInstance;
    if([ChildCommon, CollateralCommon].includes(constructor))
        setCommonFieldsetEvent(nextInstance);
    else
        //個人のとき
        setIndivisualFieldsetEvent(nextInstance);

    // 子、孫、兄弟姉妹のとき
    if([Child, GrandChild, CollateralCommon, Collateral].includes(constructor))
        setIniData(nextInstance);
}

/**
 * 次の項目と次のガイドを有効化して前の項目を無効化する
 * @param fromInstance 直前に入力されていた欄
 */
function oneStepFoward(fromInstance){
    try{
        // 次に表示すべきフィールドセットとインスタンスを用意する
        const nextInstance = getNextRelation(fromInstance);
        if(!nextInstance)
            return;

        // 前のfieldsetを無効化
        fromInstance.fieldset.disabled = true;

        // 次の入力欄がboolかつtrueのとき
        if(typeof nextInstance === "boolean" && nextInstance){
            // 入力完了のとき完了fieldsetを表示する
            enableSubmitBtnFieldset(fromInstance);
            return;
        }

        // 有効化対象のイベントの設定、初期値の設定やイベント発生をする
        setEventAndIniData(nextInstance);

        // 次のfieldsetを表示と要素を取得
        const {fieldset: nextFieldset, preBtn: nextPreBtn, nextBtn: nextNextBtn} = nextInstance;
        displayNextFieldset(nextFieldset);
        
        // ガイドを更新
        updateGuide(fromInstance, nextInstance);
        
        // 戻るボタンにイベントを設定
        const oneStepBackHandler = oneStepBack(nextInstance);
        nextPreBtn.addEventListener("click", oneStepBackHandler);

        // 次へボタンにイベントを設定
        oneStepFowardHandler = function () {oneStepFoward(nextInstance)};
        nextNextBtn.addEventListener("click", oneStepFowardHandler);
    }catch(e){
        basicLog("oneStepFoward", e);
    }
}

/**
 * チェック結果に応じて処理を分岐する
 * @param {boolean or string} isValid チェック結果
 * @param {HTMLElement} errMsgEl エラーメッセージを表示する要素
 * @param {boolean or string} message エラーメッセージ
 * @param {HTMLElement} el チェック対象の要素
 * @param {EveryInstance} person 対象の人
 */
function afterValidation(isValid, errMsgEl, message, el, person){
    //エラー要素から削除
    const {nextBtn, noInputs} = person;
    person.noInputs = noInputs.filter(x => x.id !== el.id);
    //チェック結果がtrueのとき
    if(typeof isValid === "boolean"){
        //エラーメッセージを隠す
        errMsgEl.style.display = "none";
        //次へボタンを有効化判別
        nextBtn.disabled = person.noInputs.length !== 0;  
    }else{
        //エラーメッセージを表示する
        errMsgEl.innerHTML = message;
        errMsgEl.style.display = "block";
        //配列に取得
        person.noInputs.push(el);
        //次へのボタンを無効化
        nextBtn.disabled = true;
        el.value = "";
    }
}

/**
 * 将来の年月を検証する
 * @param {string|number} year 
 * @param {string|number} month 
 * @returns 
 */
function validateFutureDate(year, month){

    const intYear = parseInt(year.substring(0, 4));
    const intMonth = parseInt(month);
    // 現在の日付を取得
    const currentDate = dayjs().tz("Asia/Tokyo");

    // 現在の年と月を取得
    const currentYear = currentDate.year();
    const currentMonth = currentDate.month() + 1; // getMonthは0から始まるため、1を加える
    // 引数で与えられた年月と現在の年月を比較
    if(intYear > currentYear || (intYear === currentYear && intMonth > currentMonth)) {
        // 与えられた年月が未来の場合
        return "到来している年月を選択してください";
    }
    return true;
}

/**
 * 年月の検証ハンドラー
 * @param {*} inputs 
 * @param {*} input 
 * @returns 
 */
function handleYearAndMonthValidation(inputs, input){
    const result = isBlank(input);
    if(typeof result === "string")
        return result;

    return validateFutureDate(inputs[DDeathYear].value, inputs[DDeathMonth].value);
}

/**
 * 被相続人欄のバリデーションリスト
 * @param {HTMLElement} inputs
 * @param {number} index 
 */
function decedentValidation(inputs, index){
    const input = inputs[index];
    //氏名のときは全角チェック、その他は空欄チェック
    if(index === DName)
        return isOnlyZenkaku(input);
    else if([DDeathYear, DDeathMonth].includes(index))
        return handleYearAndMonthValidation(inputs, input);
    else
        return isBlank(input);
}

/**
 * 被相続人欄にイベント設定
 */
function setDecedentEvent(){
    // 被相続人の入力欄にイベントを設定する
    const {inputs, nextBtn, errMsgEls, noInputs} = decedent;
    for(let i = 0, len = inputs.length; i < len; i++){
        //indexとtargetは処理不要
        if(i === DIndex)
            break;

        // 氏名欄
        const input = inputs[i];
        const nextInput = inputs[i + 1]
        if(i === DName){
            // keydown
            input.addEventListener("keydown",(e)=>{
                // enterで次の欄にフォーカスさせるのと数字入力を禁止
                setEnterKeyFocusNext(e, nextInput);
                disableNumKey(e);
            })
            // input
            input.addEventListener("input", (e)=>{
                // 全角入力チェックして次へボタン操作
                handleFullWidthInput(decedent, input);
            })
        }else{
            // 氏名欄以外、enterによる送信はしない
            input.addEventListener("keydown", (e)=>{
                if(e.key === "Enter")
                    e.preventDefault();
            })
        }

        //change
        input.addEventListener("change", async (e)=>{
            //入力値のチェック結果を取得
            const el = e.target;
            const result = decedentValidation(inputs, i);
            //チェック結果に応じて処理を分岐
            afterValidation(result, errMsgEls[i], result, el, decedent);

            //住所又は本籍地のの都道府県のとき、市町村データを取得する
            if(el === inputs[DPrefecture] || el === inputs[DDomicilePrefecture]){
                const val = el.value;
                await getCityData(val, nextInput, decedent);
            }
        })
    }
    // 次へボタンのclick
    nextBtn.addEventListener("click",(e)=>{
        //被相続人欄の入力値を全てチェックする
        for(let i = 0, len = inputs.length; i < len; i++){
            //indexとtargetは処理不要
            if(i === DIndex)
                break;

            const input = inputs[i];
            const result = decedentValidation(inputs, i)
            afterValidation(result, errMsgEls[i], result, input, decedent);
        }

        //エラーがあるときは、処理を中止してエラーの要素にフォーカスする
        if(noInputs.length > 0){
            e.preventDefault();
            noInputs[0].focus();
        }
        
        //チェックを通ったときは、次へ入力欄を表示する
        oneStepFoward(decedent);
    })


    inputs[DName].focus(); // 最初は氏名欄にフォーカスする
}

/**
 * イベント
 */
// 最初の画面表示後の処理
window.addEventListener("load", async ()=>{
    try{
        updateSideBar(); // サイドバーの設定
        setDecedentEvent(); // 被相続人欄にイベントを設定する
        await loadData(); // データをロードする
        const submit = document.getElementById("submitBtn");
        submit.addEventListener("submit", ()=>{
            submit.disabled = true
        });
    }catch(e){
        basicLog("load", e);
    }
})

//画面のサイズが変更されたとき
window.addEventListener('resize', () => {
    //サイドバーの高さを調整する
    setSidebarHeight();
});

//被相続人ガイド
Guide.btns[0].addEventListener("click", scrollToTargetHandler)

//定数、関数定義
const can = document.getElementById("canvas");
const ctx = can.getContext("2d");
const scoreNumElm = document.getElementById("scoreNum");
const hiScoreNumElm = document.getElementById("hiScoreNum");
const linesNumElm = document.getElementById("linesNum");
const levelsNumElm = document.getElementById("levelsNum");
//console.log(scoreNumElm.innerText);

//設定を保持するオブジェクト（いじらないでね♡）
const setting = {
    scHeightTile:18,
    scWidthTile:10,
    scTileSize:16,
    scScaleMult:2,
    scBGcolor:"rgb(0,0,0)",
    scBGgridColor:"rgb(255,255,255,0.5)",
    scBGgridWidth:1,
    isBGimage:false,
    BGimageSource:null,
    /*
    BGimageSource:[
        "HTMLImgElm-1",
        "HTMLImgElm-2",
        "HTMLImgElm-3",
    ],
    */
    gameOverSprash:[
        {
            str:"GAEM OVER",
            size:16
        },
        {
            str:"Press R to Retry",
            size:8
        }
    ],
    pauseSprash:[
        {
            str:"PAUSE",
            size:16
        },
        {
            str:"Press R to Reset",
            size:8
        }
    ],
    maxFallSpeedFrame:10,
    minFallSpeedFrame:60,
    perSpeedUpLine:10,
    perSpeedUpframe:2,
    SRSlist:[
        [0,0],
        [-1,-1],
        [-1,0],
        [-1,1],
        [0,1],
        [1,1],
        [1,0],
        [1,-1],
        [0,-1]
    ],
    SRSlistForI:[
        [0,0],
        [-2,0],
        [-1,0],
        [-1,1],
        [0,1],
        [1,1],
        [1,0],
        [1,-1],
        [2,0]
    ],
    shape:[
        [//I
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0]
        ],
        [//O
            [1,1],
            [1,1]
        ],
        [//T
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ],
        [//S
            [0,1,1],
            [1,1,0],
            [0,0,0]
        ],
        [//Z
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ],
        [//J
            [0,1,0],
            [0,1,0],
            [1,1,0]
        ],
        [//L
            [0,1,0],
            [0,1,0],
            [0,1,1]
        ]/*,
        [//十字
            [0,1,0],
            [1,1,1],
            [0,1,0]
        ],
        [//壺
            [0,1,0,1,0],
            [1,1,0,1,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ]*/
    ],
    kindOfShape:7,
    nextListLength:7,
    showingNextListLength:6,
    scoreDigit:6,
    stringsColor:"rgb(0,224,224)",
    stringSize:16
};
//設定を変更
setting.kindOfShape = setting.shape.length;
setting.stringSize = setting.scTileSize;
//1タイルあたりの大きさ
const TILESIZE = setting.scTileSize;
//盤面の大きさ設定
const SCREEN_WIDTH = setting.scWidthTile*TILESIZE + 4*TILESIZE;
const SCREEN_HEIGHT = setting.scHeightTile*TILESIZE;
can.width = SCREEN_WIDTH * setting.scScaleMult;
can.height = SCREEN_HEIGHT * setting.scScaleMult;
ctx.scale(setting.scScaleMult,setting.scScaleMult);
ctx.imageSmoothingEnabled = false;
//FPS関連
let FPS = 0;
let lastTimeStamp = 0;
let deltaTime = 0;
//本体関連
let nowFallSpeedFrameCounter = 0;
let nowFallSpeedFrame = setting.minFallSpeedFrame;
let level = 1;
let isLevelMAX = false;
let BGimageOK = setting.isBGimage;
let hiScore = 100000;
let score = 0;//(10**(setting.scoreDigit))-50;
let deletedLines = 0;
let isPause = false;
let isGameOver = false;
const nextMinoArrays = [];
const canReadableGMimageKeys = [];

class Assets {
    constructor(){
        this.assetsStatus = {
        };
        this.assets = {
        };
    }
    /**
     * @param {String} key 呼び出しキー
     * @param {String} elementID htmlエレメントIDの名前
     */
    loadAsset(key,elementID){
        this.assetsStatus[key] = false;
        const element = document.getElementById(elementID);

        if (!element){
            console.error(`Asset '${elementID}' is not exist in HTML.`);
            this.assetsStatus[key] = "not found";
            this.assets[key] = null;
            return;
        }

        this.assets[key] = element

        if (element.complete){
            console.log(`Asset '${elementID}' are already loaded.`);
            this.assetsStatus[key] = "complete";
        } else {
            
            this.assetsStatus[key] = "loading";
            
            element.addEventListener("load" , () => {
                this.assetsStatus[key] = "complete";
                console.log(`Loaded asset '${elementID}'.`);
            });
        }

    }
    /**
     * @param {String} key エレメントのキー
     * @returns {String} ステートメント（"complete" , "loading" , "not found" , "not_exist"）
     */
    getAssetsStatus(key){
        if (!(key in this.assetsStatus)) return "not_exist";
        return this.assetsStatus[key];
    }

}
class KeyManage {
    constructor(){
        this.isKeyManager = true;
        this.keyPressing = {
            KeyZ:false,
            KeyX:false,
            KeyQ:false,
            KeyW:false,
            ArrowLeft:false,
            ArrowRight:false,
            ArrowUp:false,
            ArrowDown:false,
            KeyP:false,
            Space:false,
            KeyR:false
        };
        this.lastKeyPressing = {
            KeyZ:false,
            KeyX:false,
            KeyQ:false,
            KeyW:false,
            ArrowLeft:false,
            ArrowRight:false,
            ArrowUp:false,
            ArrowDown:false,
            KeyP:false,
            Space:false,
            KeyR:false
        };
        this.pulseKeyPressing = {
            KeyZ:false,
            KeyX:false,
            KeyQ:false,
            KeyW:false,
            ArrowLeft:false,
            ArrowRight:false,
            ArrowUp:false,
            ArrowDown:false,
            KeyP:false,
            Space:false,
            KeyR:false
        };
    }

    setKeyState(key,value){
        this.keyPressing[key] = value;
    }

    applyKeyState(){
        for (const k in this.lastKeyPressing){
            this.pulseKeyPressing[k] = (this.keyPressing[k] && !this.lastKeyPressing[k]);
        }
        for (const k in this.keyPressing){
            this.lastKeyPressing[k] = this.keyPressing[k];
        }
    }

}
class Tetromino {
    constructor(){
        this.shapes = null;
        this.tx = 0;
        this.ty = 0;
        this.type = 0;
        this.bord = null;
        this.firstMoved = true;
    }
    setBordArray(bord){
        this.bord = bord;
    }
    /**
     * @param {Array} bord 盤面
     * @param {Boolean} isRight 右回転か？
     * @return {Boolean} 成功したかどうか
     */
    rotate(isRight,bord = this.bord){
        if (this.shapes[0].length > 0){
            this.shapes = rotateArr(this.shapes,isRight);

            const SRS = this.type == 1 ? setting.SRSlistForI : setting.SRSlist;
            for (const vec of SRS){
                //console.log(vec);
                if (!this.collisionCheck(vec)){
                    this.tx += vec[0];
                    this.ty += vec[1];
                    return true;
                }
            }

            this.shapes = rotateArr(this.shapes,!isRight);
            return false;

        } else {
            console.error("Tetromino : rotate : this.shapes is not correct shapes!");
        }
    }
    /**
     * @param {Array} bord 盤面
     * @param {Array} vec ずらすベクトル
     * @return {Boolean} あたったかどうか
     */
    collisionCheck(vec = [0,0],bord = this.bord){
        if(!bord || bord.length <= 0 || bord[0].length <= 0) return true;

        const bordHeight = bord.length;
        const bordWidth = bord[0].length;

        if (this.shapes === null) {
            console.error("Tetorimino : collisionCheck : wrong tetorimino wrong.");
            return false;
        }

        for (let iy = 0; iy<this.shapes.length; iy++){
            for (let ix = 0; ix<this.shapes[0].length; ix++){
                
                const clm = this.shapes[iy][ix];

                if (clm <= 0) continue;

                const ntx = vec[0] + this.tx + ix;
                const nty = vec[1] + this.ty + iy;

                if (ntx < 0 || ntx >= bordWidth || nty < 0 || nty >= bordHeight){
                    return true;
                }

                if (bord[nty][ntx] > 0) return true;

            }
        }

        return false;

    }
    /**
     * @param {Array} shapeArr テトリミノのカタチ
     */
    setShapes(type){

        if (type < 1 || type > setting.kindOfShape){
            console.error("Tetromino : setShapes : Illegal shape index!");
            this.shapes = null;
            return;
        }
        const shapeArr = setting.shape[type-1];
        this.type = type;

        if (!this.bord || this.bord.length <= 0 || this.bord[0].length <= 0){
            console.error("Tetromino : setShapes : this.bord is something wrong!");
            this.shapes = null;
            return;
        } else {
            this.tx = Math.floor(this.bord[0].length/2);
            this.ty = 0;
        }

        if (!shapeArr || shapeArr.length <= 0 || shapeArr[0].length <= 0) {
            console.error("Tetromino : setShapes : shapeArr format is incorrect!");
            this.shapes = null;
        } else {
            this.type = type;
            this.shapes = structuredClone(shapeArr);
            this.shapes = this.shapes.map(row => row.map(clm => clm*type));
            this.firstMoved = true;
            //場所調整
            this.tx -= Math.floor(this.shapes.length/2);

        }
    }
    /**
     * @param {Array} bord 盤面
     * @return {Boolean} 置かれているマスに置かざるを得なかったか
     */
    putMino(bord = this.bord){
        
        let ouch = false;

        if (this.shapes === null) {
            console.error("Tetorimino : putMino : wrong tetorimino wrong.");
            return false;
        }
        if (!bord || bord.length <= 0 || bord[0].lrngth <= 0) {
            console.error("Tetromino : putMino : wrong bord struct!");
            return false;
        }

        for (let iy = 0; iy<this.shapes.length; iy++){
            for (let ix = 0; ix<this.shapes[iy].length; ix++){
                const clm = this.shapes[iy][ix];

                if (clm <= 0) continue;

                const ntx = this.tx + ix;
                const nty = this.ty + iy;

                if (ntx < 0 || ntx >= setting.scWidthTile || nty < 0 || nty >= setting.scHeightTile) {
                    console.warn(`Illegal Tile Position! [ ${ntx} , ${nty} ]`);
                    continue;
                }
                if(clm <= 0){
                    continue;
                } else {
                    if (bord[nty][ntx] > 0) ouch = true;
                    bord[nty][ntx] = clm;
                }
            }
        }

        return ouch;

    }
    /**
     * @param {Array} vec 動かすベクトル
     * @return {Boolean} 成功したかどうか
     */
    moveMino(vec,bord = this.bord){
        this.firstMoved = false;
        if (this.collisionCheck([vec[0],vec[1]],bord)) {
            //console.log(`pos : ${[this.tx,this.ty]}`);
            return false;
        }
        this.tx += vec[0];
        this.ty += vec[1];
        return true;
    }
    /**
     * @param {Array} vec 動かすベクトル
     */
    moveMinoWithAuto(vec,bord = this.bord){
        if (!this.moveMino(vec,bord)){
            if (!this.putMino()){
                this.setShapes(getNewNext());
            } else {
                isGameOver = true;
            }

            const lineCounter = mino.countLine();

            //100 , 200 , 400 , 800 (, 1600 , 3200 , 6400 , 12800 , ... ) 
            if (lineCounter > 0) score += 100 * 2**(lineCounter-1);

            if (score >= 10**(setting.scoreDigit)) score = 10**setting.scoreDigit-1;

            deletedLines += lineCounter;

        }
    }
    /**
     * @param {Array} bord 盤面
     * @returns {Number} 消したライン数
     */
    countLine(bord = this.bord){
        if(!bord || bord.length <= 0 || bord[0].length <= 0) return 0;
        
        const bordWidth = bord[0].length;
        const prevBordLength = bord.length;
        
        const newBord = bord.filter(row => !row.every( clm => clm > 0 ));
        //console.log(`prev.length : ${prevBordLength} , new.length : ${newBord.length}`);
        const lineCounter = prevBordLength - newBord.length;

        for (let i = 0; i<lineCounter; i++){
            newBord.unshift(Array(bordWidth).fill(0));
        }

        bord.splice(0,bord.length, ...newBord);
        
        return lineCounter;

    }
}
//アセットコンテナ
const assetContainer = new Assets();
//
const key = new KeyManage();
//
const mino = new Tetromino();
//関数群
const randFloat = (st,en) => (en-st)*Math.random()+st;
const randInt = (st,en) => Math.floor((en-st+1)*Math.random())+st;
const meregeColor = (C,T,d) => {
    const div = Math.max(0,Math.min(1,d));
    return [
        C[0] + (T[0]-C[0])*div,
        C[1] + (T[1]-C[1])*div,
        C[2] + (T[2]-C[2])*div
    ];
};

const bord = Array.from({length : setting.scHeightTile} , () => Array(setting.scWidthTile).fill(0) );
mino.setBordArray(bord);
initNext();
//mino.setShapes(randInt(1,setting.kindOfShape));
mino.setShapes(getNewNext());

//初期化
Promise.all([

    assetContainer.loadAsset("minoImg","minoAssets"),
    loadBGimage(),
    window.addEventListener("keydown" , (event) => {
        key.setKeyState(event.code,true);
        //console.log(`${event.code} downned.`);
    }),
    window.addEventListener("keypress" , (event) => {
        key.setKeyState(event.code,true);
        //console.log(`${event.code} pressed.`);
    }),
    window.addEventListener("keyup" , (event) => {
        key.setKeyState(event.code,false);
        //console.log(`${event.code} upped.`);
    }),

]).then(() => {
    requestAnimationFrame(initwait);
}).catch((error) => {
    console.error(`Happened an Error! : ${error}`);
});
//レンダリングマシン
const render = {
    nowCTX : ctx,
    nowCAN : can,
    setAlpha(alpha){
        this.nowCTX.globalAlpha = alpha;
    },
    drawOneBlock(tx,ty,type){
        if (assetContainer.getAssetsStatus("minoImg") != "complete") {
            console.warn(`image 'minoImg' is not loaded! condition:${assetContainer.getAssetsStatus("minoImg")}`);
        } else {
            
            this.nowCTX.drawImage(
                assetContainer.assets.minoImg,
                ((type-1)%7)*16+16,
                0,
                16,
                16,
                tx*TILESIZE,
                ty*TILESIZE,
                TILESIZE,
                TILESIZE
            );

        }
    },
    drawOneBlockScaled(px,py,w,h,type){
        if (assetContainer.getAssetsStatus("minoImg") != "complete") {
            console.warn(`image 'minoImg' is not loaded! condition:${assetContainer.getAssetsStatus("minoImg")}`);
        } else {
            
            this.nowCTX.drawImage(
                assetContainer.assets.minoImg,
                ((type-1)%7)*16+16,
                0,
                16,
                16,
                px,
                py,
                w,
                h
            );

        }

    },
    drawOneShapeScaled(px,py,w,h,shape){
        if (!shape || shape.length <= 0 || shape[0].length <= 0){
            console.error("render : drawOneShapeScaled : wrong shape's struct");
            return;
        }
        
        for (let iy = 0; iy<shape.length; iy++){
            for (let ix = 0; ix<shape[0].length; ix++){
                
                const clm = shape[iy][ix];
                
                if (clm <= 0) continue;
                
                this.drawOneBlockScaled(px+ix*w,py+iy*h,w,h,clm);
            }
        }
    },
    drawOneShape(tx,ty,shape){
        if (!shape || shape.length <= 0 || shape[0].length <= 0){
            console.error("render : drawOneShape : wrong shape's struct");
            return;
        }
        
        for (let iy = 0; iy<shape.length; iy++){
            for (let ix = 0; ix<shape[0].length; ix++){
                
                const clm = shape[iy][ix];
                
                if (clm <= 0) continue;
                
                this.drawOneBlock(tx+ix,ty+iy,clm);
            }
        }
    },
    renderGrid(){
        this.nowCTX.save();
        this.nowCTX.fillStyle = setting.scBGcolor;
        this.nowCTX.strokeStyle = setting.scBGgridColor;
        this.nowCTX.lineWidth = setting.scBGgridWidth;
        
        this.nowCTX.beginPath();
        this.nowCTX.moveTo(0,0);
        this.nowCTX.lineTo(TILESIZE*setting.scWidthTile,0);
        this.nowCTX.lineTo(TILESIZE*setting.scWidthTile,TILESIZE*setting.scHeightTile);
        this.nowCTX.lineTo(0,TILESIZE*setting.scHeightTile);
        this.nowCTX.stroke();

        for(let iy = 0; iy<setting.scHeightTile; iy++){
            
            this.nowCTX.beginPath();
            this.nowCTX.moveTo(0,iy*TILESIZE);
            this.nowCTX.lineTo(TILESIZE*setting.scWidthTile,iy*TILESIZE);
            this.nowCTX.stroke();

        }
        for(let ix = 0; ix<setting.scWidthTile; ix++){
            
            this.nowCTX.beginPath();
            this.nowCTX.moveTo(ix*TILESIZE,0);
            this.nowCTX.lineTo(ix*TILESIZE,TILESIZE*setting.scHeightTile);
            this.nowCTX.stroke();

        }

        this.nowCTX.restore();
    },
    clearScreen(){
        this.nowCTX.save();

    
        this.nowCTX.fillStyle = setting.scBGcolor;
        this.nowCTX.fillRect(0,0,this.nowCAN.width,this.nowCAN.height);
        if (BGimageOK){
            const imageIDX = Math.min(level,canReadableGMimageKeys.length)-1;
            const imageKey = canReadableGMimageKeys[imageIDX];
            const image = assetContainer.assets[imageKey];

            this.nowCTX.drawImage(
                image,
                0,
                0,
                SCREEN_WIDTH,
                SCREEN_HEIGHT
            );

        }
        this.nowCTX.restore();
    },
    drawbord(bord){

        if (!bord || bord.length <= 0 || bord[0].length <= 0){
            console.error("render : drawBord : Illegal bord Struct");
            return;
        }
        this.nowCTX.save();

        for (let iy = 0; iy < bord.length; iy++){
            for (let ix = 0; ix < bord[iy].length; ix++){
                this.drawOneBlock(ix,iy,bord[iy][ix]);
            }
        }
        
        this.nowCTX.restore();
    },
    drawNext(){

        const stx = setting.scWidthTile+1;
        const sty = setting.stringSize + TILESIZE/2;

        const stxSC = (stx)*TILESIZE;
        const stySC = sty;
        const size = TILESIZE/2;
        
        this.nowCTX.save();

        this.nowCTX.font = `${setting.stringSize}px monospace`;
        this.nowCTX.fillStyle = setting.stringsColor;
        
        this.nowCTX.fillText("NEXT:",stxSC,TILESIZE);

        this.nowCTX.restore();
        
        /*
            for (let i = 0; i<setting.showingNextListLength; i++){
                //console.log([setting.scWidthTile+1,TILESIZE*5*i]);
                this.drawOneShape(
                    stx,
                    sty + 5*i,
                    setting.shape[nextMinoArrays[i]-1].map(row => row.map(clm => clm*nextMinoArrays[i]))
                );
            }
            return ;
        */

        for (let i = 0; i<setting.showingNextListLength; i++){
            //console.log([setting.scWidthTile+1,TILESIZE*5*i]);
            this.drawOneShapeScaled(
                stxSC,
                stySC + 5*i*size,
                size,
                size,
                setting.shape[nextMinoArrays[i]-1].map(row => row.map(clm => clm*nextMinoArrays[i]))
            );
        }

    },
    drawString(str,px,py,size,style){
        this.nowCTX.save();

        this.nowCTX.textAlign = "left";
        this.nowCTX.textBaseLine = "hanging";

        const s = Math.floor(Math.max(0,size));

        this.nowCTX.font = `${s}px monospace`;
        this.nowCTX.fillStyle = style;

        this.nowCTX.fillText(str,px,py);

        this.nowCTX.restore();
    },
    drawRect(px,py,width,height,style){
        this.nowCTX.save();

        const w = Math.max(0,width);
        const h = Math.max(0,height);

        this.nowCTX.fillStyle = style;

        this.nowCTX.fillRect(px,py,w,h);

        this.nowCTX.restore();
    }
};
/**
 * 配列の回転
 * @param {Array} arr ミノ配列
 * @param {Boolean} flag 右回転か
 */
function rotateArr(arr,flag){
    //行と列を交換（転置作業）
    const rotated = arr[0].map( (_,i) => arr.map( r => r[i] ) );

    if (flag){
        return rotated.map( r => r.reverse() );
    } else {
        return rotated.reverse();
    }

}
//変数の初期化
function initVariables(){

    nowFallSpeedFrameCounter = 0;
    nowFallSpeedFrame = setting.minFallSpeedFrame;
    level = 1;
    isLevelMAX = false;
    hiScore = 10000;
    score = 0;
    deletedLines = 0;
    isPause = false;
    isGameOver = false;

    bord.map(row => row.fill(0));
    nextMinoArrays.length = 0;

    mino.setBordArray(bord);
    initNext();
    //mino.setShapes(randInt(1,setting.kindOfShape));
    mino.setShapes(getNewNext());
    //console.log(nextMinoArrays);

}
//背景画像があれば読み込み
function loadBGimage(){
    if (!setting.isBGimage){
        return ;
    } else {
        const srcList = setting.BGimageSource;
        //厳格なチェックにすることで停止を予防したい
        if (Array.isArray(srcList)){
            for (let idx = 0; idx<srcList.length; idx++){
                const src = srcList[idx];
                if (typeof(src) === "string" && src.trim() !== ""){
                    //process

                    assetContainer.loadAsset(`image-${idx}`,src);

                    canReadableGMimageKeys.push(`image-${idx}`);

                } else {
                    console.warn(`setting.BGimageSource[${idx}] is not string or empty!`);
                    BGimageOK = false;
                }
            }
        } else {
            console.warn("loadBGimage : setting.BGimageSource is invaild type!");
            BGimageOK = false;
        }
    }
}
//メイン関数
function main(currentTime = performance.now()){

    if (lastTimeStamp == 0){
        lastTimeStamp = currentTime;
    }
    deltaTime = Math.min(30,currentTime - lastTimeStamp);
    lastTimeStamp = currentTime;
    FPS = 1000 / deltaTime;

    key.applyKeyState();

    const frameProgress = Math.min(1 , deltaTime / ( 1000 / 60 ) );

    if (!isGameOver && (key.pulseKeyPressing.Space || key.pulseKeyPressing.KeyP)){
        isPause = !isPause;
    }
    if (!isPause && !isGameOver){
        nowFallSpeedFrameCounter += frameProgress;
        if(mino.firstMoved && mino.collisionCheck([0,0])){
            isGameOver = true;
        }
        //console.log(`nowFallSpeedCounter : ${nowFallSpeedFrameCounter}`);
        if (nowFallSpeedFrameCounter >= nowFallSpeedFrame){
            //console.log("mino fall");
            mino.moveMinoWithAuto([0,1]);
            
            nowFallSpeedFrameCounter = 0;

        }

        if (!isLevelMAX && deletedLines >= setting.perSpeedUpLine*level){
            if (nowFallSpeedFrame - setting.perSpeedUpframe > setting.maxFallSpeedFrame) {
                nowFallSpeedFrame -= setting.perSpeedUpframe;
                level++;
            } else {
                isLevelMAX = true;
                nowFallSpeedFrame = setting.maxFallSpeedFrame;
            }
            //console.log(nowFallSpeedFrame);
        }
        //console.log(`mino position [ ${mino.tx} , ${mino.ty} ]`);
        //console.log(`mino type : ${mino.type} mino shape : `);
        //console.log(mino.shapes);

        if(key.pulseKeyPressing.KeyA || key.pulseKeyPressing.ArrowLeft){
            //console.log("mov Left");
            mino.moveMino([-1,0]);
        } else if(key.pulseKeyPressing.KeyD || key.pulseKeyPressing.ArrowRight){
            //console.log("mov Right");
            mino.moveMino([1,0]);
        } else if(key.pulseKeyPressing.KeyS || key.pulseKeyPressing.ArrowDown){
            //console.log("mov Down");
            mino.moveMinoWithAuto([0,1]);
        } else if(key.pulseKeyPressing.ArrowUp){
            while (mino.moveMino([0,1]));
            mino.moveMinoWithAuto([0,1]);
        }

        if(key.pulseKeyPressing.KeyQ || key.pulseKeyPressing.KeyZ){
            mino.rotate(false);
        } else if(key.pulseKeyPressing.KeyW || key.pulseKeyPressing.KeyX){
            mino.rotate(true);
        }
    
        //console.log(nextMinoArrays);

    } else {
        if (key.pulseKeyPressing.KeyR){
            initVariables();
        }
    }

    //画面キレキレイ
    render.clearScreen();
    //格子線描画
    render.renderGrid();
    //ネクスト表示
    render.drawNext();
    //盤面表示
    render.drawbord(mino.bord);
    //今動いているミノ表示
    render.drawOneShape(mino.tx,mino.ty,mino.shapes);
    //ゴーストミノ表示
    const [mx,my] = [mino.tx,mino.ty];
    while (mino.moveMino([0,1]));
    render.setAlpha(0.5);
    render.drawOneShape(mino.tx,mino.ty,mino.shapes);
    render.setAlpha(1);
    [mino.tx,mino.ty] = [mx,my];
    //FPS表示
    render.drawRect(
        render.nowCAN.width/setting.scScaleMult - TILESIZE*4,
        render.nowCAN.height/setting.scScaleMult - TILESIZE,
        
        TILESIZE*4,
        TILESIZE,
        "rgb(64,64,64,0.5)"
    );
    render.drawString(
        `FPS:${Math.floor(FPS*10)/10}`,
        render.nowCAN.width/setting.scScaleMult - TILESIZE*4,
        render.nowCAN.height/setting.scScaleMult,
        TILESIZE,
        "rgb(0,224,0)"
    );

    updateScore();

    if (isPause){
        render.drawRect(0,0,TILESIZE*setting.scWidthTile,TILESIZE*setting.scHeightTile,"rgb(0,0,0,0.5)");
        let lastSize = 0;
        for (let i = 0; i<setting.pauseSprash.length; i++){

            const strSize = setting.pauseSprash[i].size;
            const string = setting.pauseSprash[i].str;

            render.drawString(
                string,
                TILESIZE*setting.scWidthTile/2 - strSize*(string.length/2),
                TILESIZE*setting.scHeightTile/2 + lastSize,
                strSize*2,
                "rgb(224, 224, 0)"
            );

            lastSize += strSize;
        }
    } else if (isGameOver){
        render.drawRect(0,0,TILESIZE*setting.scWidthTile,TILESIZE*setting.scHeightTile,"rgb(0,0,0,0.5)");
        let lastSize = 0;
        for (let i = 0; i<setting.gameOverSprash.length; i++){

            const strSize = setting.gameOverSprash[i].size;
            const string = setting.gameOverSprash[i].str;

            render.drawString(
                string,
                TILESIZE*setting.scWidthTile/2 - strSize*(string.length/2),
                TILESIZE*setting.scHeightTile/2 + lastSize,
                strSize*2,
                "rgb(224, 0, 0)"
            );

            lastSize += strSize;
        }
        /*
        render.drawString(
            "GAME OVER",
            TILESIZE*setting.scWidthTile/2 - setting.stringSize*4.5,
            TILESIZE*setting.scHeightTile/2,
            setting.stringSize*2,
            "rgb(224, 0, 0)"
        );
        render.drawString(
            "Press R to Retry",
            TILESIZE*setting.scWidthTile/2 - setting.stringSize*4.5,
            TILESIZE*setting.scHeightTile/2,
            setting.stringSize*2,
            "rgb(224, 0, 0)"
        );
        */
        
    }

    requestAnimationFrame(main);

}
//スコア表示の更新
function updateScore(){

    if (score >= hiScore) hiScore = score;

    const scoreStr = String(score).padStart(setting.scoreDigit,'\u00A0');
    const hiScoreStr = String(hiScore).padStart(setting.scoreDigit,'\u00A0');
    const linesStr = String(deletedLines).padStart(setting.scoreDigit,'\u00A0');
    
    const levelsStr = isLevelMAX ?  
        "MAX".padStart(setting.scoreDigit,'\u00A0') :
        String(level).padStart(setting.scoreDigit,'\u00A0');

    scoreNumElm.innerText = scoreStr;
    hiScoreNumElm.innerText = hiScoreStr;
    linesNumElm.innerText = linesStr;
    levelsNumElm.innerText = levelsStr;

    if (isLevelMAX) levelsNumElm.style = "color:red;"; 

}
//ネクストの生成
function genNewNext(){
    let newMino = randInt(1,setting.kindOfShape);

    while(nextMinoArrays.includes(newMino) && setting.kindOfShape >= setting.nextListLength){
        newMino = randInt(1,setting.kindOfShape);
    }

    if (nextMinoArrays.length >= setting.nextListLength){
        console.warn(`genNewNext : too many next list! length : ${nextMinoArrays.length}`);
    } else {
        nextMinoArrays.push(newMino);
    }

}
//ネクストの取得＆生成
function getNewNext(){
    const newMino = nextMinoArrays.shift();
    genNewNext();
    return newMino;
}
//ネクスト初期化
function initNext(){
    for (let i = 0; i<setting.nextListLength; i++){
        genNewNext();
    }
}
//初期化処理
function initwait(){
    console.log("initting...");
    if (Object.values(assetContainer.assetsStatus).includes("loading")) {
        requestAnimationFrame(initwait);
    } else {
        console.log("initalize done!");
        requestAnimationFrame(main);
    }
}
/*
 * P5js Example:
 * @name Multiple Objects
 * @description Create a Jitter class, instantiate multiple objects,
 * and move it around the screen. 
 */

var p5cs;
//var isAnimate = false;

//FACE VARIABLESSSSS
let ctracker; // face tracker
let videoInput; // video input

var isTalking = false;

//EYES
var eyeL_X = 150;
var eyeL_Y = 150;
var eyeL_Size = 50;
var eyeL_mod = 1; //CHANGE THIS
var pupilL_offsetX = 0; //CHANGE THIS
var pupilL_offsetY = 0; //CHANGE THIS

var eyeOffset = 150

var eyeR_X = eyeL_X + eyeOffset;
var eyeR_Y = eyeL_Y;
var eyeR_Size = eyeL_Size;
var eyeR_mod = 1; //CHANGE THIS
var pupilR_offsetX = pupilL_offsetX;
var pupilR_offsetY = pupilL_offsetY;

var highlightOffset = 8;

//SMILE
var smileL_X = eyeL_X + eyeOffset / 3;
var smileL_Y = eyeL_Y + 40;
var smileR_X = smileL_X + 50;
var smileR_Y = smileL_Y;

var smileOffset = 0; //CHANGE THIS

var ctrlL_X = smileL_X;
var ctrlL_Y = smileL_Y + smileOffset;
var ctrlR_X = smileR_X;
var ctrlR_Y = ctrlL_Y;

//MOUTH
var mouth_X = eyeL_X + eyeOffset / 2;
var mouth_Y = eyeL_Y + 40;
var mouth_Size = 30;
var mouth_modX = 1; //CHANGE THIS
var mouth_modY = 0.2;

//LEFT BROW
var browL_X = eyeL_X - (eyeL_Size / 2);
var browL_Y = eyeL_Y - eyeL_Size;
var browWidth = eyeL_Size;

var browLOffset = 0; //CHANGE THIS
var frownLOffset = 0; //CHANGE THIS

var browL_Ctrl_X = browL_X;
var browL_Ctrl_Y = browL_Y - browLOffset;

//RIGHT BROW
var browR_X = eyeR_X - (eyeL_Size / 2);
var browR_Y = eyeR_Y - eyeL_Size;

var browROffset = 0; //CHANGE THIS
var frownROffset = 0; //CHANGE THIS

var browR_Ctrl_X = browR_X;
var browR_Ctrl_Y = browR_Y - browROffset;

var cal = [];
var positions = [];

var calEyeL;
var calEyeR;
var calPupilX;
var calPupilY;
var calSmile;
var calTalk;
var calMouthX;
var calMouthY;
var calBrowLCurve;
var calFrownL;
var calBrowRCurve;
var calFrownR;

var curEyeL;
var curEyeR;
var curPupilX;
var curPupilY;
var curSmile;
var curTalk;
var curMouthX;
var curMouthY;
var curBrowLCurve;
var curFrownL;
var curBrowRCurve;
var curFrownR;

var isRecording = false;
var isReplaying = false;
var isTesting = true;

var record_counter = 0;
var replay_counter = 0;

var record_data = [];

var isSpeech = false;
var myRec = new p5.SpeechRec();

function setup() {

    p5cs = createCanvas(800, 600);
    p5cs.position(windowWidth, windowHeight);

    // setup camera capture
    videoInput = createCapture();
    videoInput.size(800, 600);
    videoInput.position(windowWidth, 110);
    //console.log(window.WIDTH)
    //videoInput.loop();

    // setup tracker
    ctracker = new clm.tracker();
    ctracker.init(pModel);
    ctracker.start(videoInput.elt);

    document.getElementById("myBtn").addEventListener("click", calibrate);
    document.getElementById("startRecord").addEventListener("click", startRecord);
    document.getElementById("stopRecord").addEventListener("click", stopRecord);
    document.getElementById("startReplay").addEventListener("click", startReplay);
    document.getElementById("test").addEventListener("click", stopRecord);

    // init Three.js
    init();
}

function draw() {
    // moved into animate function inside three.js script
    // so the order will be correct
    // p5 canvas update -> three.js texture update -> three.js render
}

function drawFace() {
    //clear();
    positions = ctracker.getCurrentPosition();
    if (positions) {
        curEyeL = Math.abs(positions[26][1] - positions[24][1]);
        curEyeR = Math.abs(positions[31][1] - positions[29][1]);
        curPupilX = positions[27][0] - positions[23][0];
        curPupilY = positions[27][1] - positions[23][1];
        curSmile = positions[44][1];
        curTalk = Math.abs(positions[60][1] - positions[57][1]);
        curMouthX = Math.abs(positions[44][0] - positions[50][0]);
        curMouthY = Math.abs(positions[60][1] - positions[57][1]);
        curBrowLCurve = Math.abs(positions[19][1] - positions[20][1]);
        curFrownL = positions[22][1];
        curBrowRCurve = Math.abs(positions[15][1] - positions[16][1]);
        curFrownR = positions[18][1];

        //distort drawing based on facial positions

        eyeL_mod = curEyeL / calEyeL;
        eyeL_mod = constrain(eyeL_mod, 0, 2);
        eyeR_mod = curEyeR / calEyeR;
        eyeR_mod = constrain(eyeR_mod, 0, 2);
        pupilL_offsetX = curPupilX / calPupilX;
        pupilL_offsetY = curPupilY / calPupilY;
        //pupilL_offsetY = constrain(pupilL_offsetY, -10, 10);
        smileOffset = (curSmile - calSmile) * -1;
        smileOffset = constrain(smileOffset, -15, 15);
        if (smileOffset > 4) {
            smileOffset = 10;
        }
        //console.log("SMILE: "+ smileOffset);
        if (curTalk > (calTalk * 1.1)) {
            isTalking = true;
        } else {
            isTalking = false;
        }
        mouth_modX = curMouthX / calMouthX;
        mouth_modX = constrain(mouth_modX, 0, 2);
        mouth_modY = curMouthY / calMouthY;
        mouth_modY = constrain(mouth_modY, 0, 1.5);
        browLOffset = curBrowLCurve / calBrowLCurve * 10;
        browLOffset= constrain(browLOffset, -10, 10);
        browROffset = curBrowRCurve / calBrowRCurve * 10;
        browROffset= constrain(browROffset, -10, 10);
        frownLOffset = (curFrownL - calFrownL) * 2;
        frownLOffset = constrain(frownLOffset, -20, 20);
        frownROffset = (curFrownR - calFrownR) * 2;
        frownROffset = constrain(frownROffset, -20, 20);
        
        if(isRecording){
            console.log("RECORDING");
            //record_data = [];
            //record_counter = 0; // THIS SHOULD BE TRIGGERED BY THE BUTTON
            var record_object = {
                'eyeL_mod' : eyeL_mod,
                'eyeR_mod' : eyeR_mod,
                'pupilL_offsetX' : pupilL_offsetX,
                'pupilL_offsetY' : pupilL_offsetY,
                'smileOffset' : smileOffset,
                'isTalking': isTalking,
                'mouth_modX' : mouth_modX,
                'mouth_modY' : mouth_modY,
                'browLOffset' : browLOffset,
                'browROffset' : browROffset,
                'frownLOffset' : frownLOffset,
                'frownROffset' : frownROffset
            }
            record_data.push(record_object); 
            console.log("recording: "+record_counter); 
            console.log(record_data[record_counter]);
            record_counter++;
        }

        if(isReplaying){
            console.log("REPLAYING!!");
            eyeL_mod = record_data[replay_counter].eyeL_mod;
            eyeR_mod = record_data[replay_counter].eyeR_mod;
            pupilL_offsetX = record_data[replay_counter].pupilL_offsetX;
            pupilL_offsetY = record_data[replay_counter].pupilL_offsetY;
            smileOffset = record_data[replay_counter].smileOffset;
            isTalking = record_data[replay_counter].isTalking;
            mouth_modX = record_data[replay_counter].mouth_modX;
            mouth_modY = record_data[replay_counter].mouth_modY;
            browLOffset = record_data[replay_counter].browLOffset;
            browROffset = record_data[replay_counter].browROffset;
            frownLOffset = record_data[replay_counter].frownLOffset;
            frownROffset = record_data[replay_counter].frownROffset;

            if(replay_counter<record_counter-1){
                replay_counter++;
                console.log("replay: "+replay_counter);
            } else {
                replay_counter = 0;
            }
        }
        //console.log("current: "+positions[27]);
        //console.log("CAL: "+cal[27]);
    }



    //left eye
    noStroke();
    fill(255);
    ellipse(eyeL_X, eyeL_Y, eyeL_Size, eyeL_Size * eyeL_mod);
    fill(0);
    ellipse(eyeL_X + pupilL_offsetX, eyeL_Y + pupilL_offsetY, eyeL_Size * 0.5, eyeL_Size * 0.5);
    fill(255);
    ellipse(eyeL_X + pupilL_offsetX, eyeL_Y - highlightOffset + pupilL_offsetY, eyeL_Size * 0.2, eyeL_Size * 0.2);

    //right eye
    fill(255);
    ellipse(eyeR_X, eyeR_Y, eyeR_Size, eyeR_Size * eyeR_mod);
    fill(0);
    ellipse(eyeR_X + pupilR_offsetX, eyeR_Y + pupilR_offsetY, eyeR_Size * 0.5, eyeR_Size * 0.5);
    fill(255);
    ellipse(eyeR_X + pupilR_offsetX, eyeR_Y - highlightOffset + pupilR_offsetY, eyeR_Size * 0.2, eyeR_Size * 0.2);

    //smile
    if (!isTalking) {
        noFill();
        stroke(114, 48, 38);
        strokeWeight(8);
        ctrlL_Y = smileL_Y + smileOffset;
        ctrlR_Y = ctrlL_Y;
        bezier(smileL_X, smileL_Y, ctrlL_X, ctrlL_Y, ctrlR_X, ctrlR_Y, smileR_X, smileR_Y);
    }

    //mouth
    if (isTalking) {
        noStroke();
        fill(114, 48, 38);
        ellipse(mouth_X, mouth_Y, mouth_Size * mouth_modX, mouth_Size * mouth_modY);
    }

    //left brow
    noFill();
    stroke(0);
    strokeWeight(15);
    browL_Ctrl_Y = browL_Y - browLOffset;
    bezier(browL_X, browL_Y, browL_Ctrl_X, browL_Ctrl_Y, browL_Ctrl_X + browWidth, browL_Ctrl_Y + frownLOffset, browL_X + browWidth, browL_Y + frownLOffset);

    //right brow

    noFill();
    stroke(0);
    strokeWeight(15);
    browR_Ctrl_Y = browR_Y - browROffset;
    bezier(browR_X, browR_Y + frownROffset, browR_Ctrl_X, browR_Ctrl_Y + frownROffset, browR_Ctrl_X + browWidth, browR_Ctrl_Y, browR_X + browWidth, browR_Y);

    if(isSpeech){
        fill(0);
        stroke(255);
        strokeWeight(10);
        textSize(64);
        text(myRec.resultString, 80,480);
    }
}

function calibrate() {

    cal = positions;
    console.log("CALIBRATED!");

    calEyeL = Math.abs(cal[26][1] - cal[24][1]);
    calEyeR = Math.abs(cal[31][1] - cal[29][1]);
    calPupilX = cal[27][0] - cal[23][0];
    calPupilY = cal[27][1] - cal[23][1];
    calSmile = cal[44][1];
    calTalk = Math.abs(cal[60][1] - cal[57][1]);
    calMouthX = Math.abs(cal[44][0] - cal[50][0]);
    calMouthY = Math.abs(cal[60][1] - cal[57][1]);
    calBrowLCurve = Math.abs(cal[19][1] - cal[20][1]);
    calFrownL = cal[22][1];
    calBrowRCurve = Math.abs(cal[15][1] - cal[16][1]);
    calFrownR = cal[18][1];
}

function startRecord(){
    isRecording = true;
    isReplaying = false;
    isTesting = false;
    isSpeech=false;
    record_counter = 0;
    record_data=[];
    myRec.start();
}

function stopRecord(){
    isRecording = false;
    isReplaying = false;
    isTesting = true;
    isSpeech=false;
}

function startReplay(){
    isRecording = false;
    isReplaying = true;
    isTesting = false;
    showResult();
}

function showResult(){
    if(myRec.resultValue==true) {
        //background(192, 255, 192);
        console.log(myRec.resultString);
        isSpeech=true;
    }
}

if(positions){
    setInterval(calibrate,5000);
}
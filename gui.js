//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg
let x_size,y_size,edgeGapX,edgeGapY;
let globalScale = 1;

let fullscreen = false;
function fullscreenGUI(){
  console.log("FS");

  if (fullscreen){
    //reset
    document.getElementById('gui_div').style.top = "2%";
    document.getElementById('gui_div').style.right = "2";
    document.getElementById('gui_div').style.width = "49%";
    document.getElementById('gui_div').style.height = "32%";
    globalScale = 1;
    fullscreen = false
  } else {
    //make fs
    document.getElementById('gui_div').style.top = "4%";
    document.getElementById('gui_div').style.right = ".5%";
    document.getElementById('gui_div').style.width = "99%";
    document.getElementById('gui_div').style.height = "96%";
    globalScale = 2;
    fullscreen = true
  }
  x_size = document.getElementById('gui_div').offsetWidth *.99;
  y_size = document.getElementById('gui_div').offsetHeight *.97;
  gui.resizeCanvas(x_size, y_size);

  edgeGapX = x_size * (1-globalScale) * 0.5 ;
  edgeGapY = y_size * (1-globalScale) * 0.5 ;
}
const gui_sketch = function(my) {

  x_size = document.getElementById('gui_div').offsetWidth *.99;
  y_size = document.getElementById('gui_div').offsetHeight *.97;
  my.dimRatio = 0.5

  my.setup = function() {
    my.createCanvas(x_size, y_size);
    
    //slow down draw rate
    my.frameRate(30)

    // COLOR VARS
    whiteColor = color(255);
    blackColor = color(0);
    transparentColor = color(0,0);
    my.color1 = color(255,40,0);
    my.color2 = color(220,229,234);
    my.color3 = color(140,146,150);
    bgColorShift = 100;

    my.background(my.color2)
    my.background(bgColorShift)
    bgshift = 3;
    my.noStroke();
    // my.button = createButton('Add Elements');
    // my.button.parent('gui_div'); //'p5 is the name of the div to draw into'
    // my.button.position(10, 14);
    // my.button.size(10, 14);
    // my.button.mousePressed(buttonPress);

    // my.startSeq = createButton('PLAY seq');
    // my.startSeq.parent('gui_div'); //'p5 is the name of the div to draw into'
    // my.startSeq.position(10, 40);
    // my.startSeq.mousePressed(
    //   function() {seq = setInterval( mySeq, 400 )}
    // );
    // my.stopSeq = createButton('STOP seq');
    // my.stopSeq.parent('gui_div'); //'p5 is the name of the div to draw into'
    // my.stopSeq.position(10, 60);
    // my.stopSeq.mousePressed(
    //   function() {clearInterval(seq)}
    // );
    my.angleMode(DEGREES);
    my.textStyle(BOLD);
    my.textAlign (CENTER, CENTER);
    buttonPress();  
  }//setup


  let dragging = false;
  let forceDraw = false;
  let currElement = 0;
  let currKey = 'none';

  let createHorzDivision, createVertDivision, currVertDiv, currHorzDiv;
  let vertDivisions = [];
  let horzDivisions = [];
  
  // UI ELEMENTS DEFAULT VALUES
  let SCALE = 1;
  let x0 = 50;
  let y0 = 180;
  let r = 40; // button size
  let rKnob = 40; // knob size
  // slider
  let sliderThickness = 15;
  let sliderLength=100;
  let sliderSensitivity = .008;
  // radio
  let boxSize = 30;
  let seqBoxSize = 30;
  let seqUpdateState = 'ON';
  let seqUpdateStarted = false;
  // knob
  let ogY = 0;
  let yScale = 0.009; // alters sensitivity of turning the knob
  let ogValue = 0;

  let fillervar = 0;  
  let buttonPress = function() {
    // for testing
    console.log('buton pres')
    my.addElement({type:"knob",label:"SL1",mapto:"fakevar",min:0,max:2,value:1,size:.5})
    my.addElement({type:"knob",label:"SL2",mapto:"fakevar",min:0,max:3,value:2,size:1})
    my.addElement({type:"knob",label:"SL3",mapto:"fakevar",min:1,max:2,value:1,size:2})
    my.addElement({type:"radio",label:"radio",mapto:"fillervar",radioOptions:['a','b','c','d','e']})
    my.addElement({type:"slider",label:"kVOL",mapto:"fillervar",size:1})
    my.addElement({type:"toggle",label:"togl",mapto:"fillervar",size:2})
    my.addElement({type:"momentary",label:"momn",mapto:"fillervar"})
  }

  let addKeyboard = function() {
    my.addElement("keyboard","keyboard");
  }

  my.keyPressed = function() {currKey = keyCode;}
  my.keyReleased = function() {currKey = 'none';}

  let lastValues = [];
  let lastNumElements = 0;
  function checkIfValuesChanged(){
    // check if elements list changed size
    let numElements = elements.length;
    if (numElements != lastNumElements){
      lastNumElements = numElements;
      return true;
    }

    // build array of current values from all elements
    let currValues = []
    for (let i = 0; i < elements.length; i++) {
      currValues.push(elements[i].value);
    }
    // console.log("OLD #: "+lastNumElements)
    // console.log("NEW #: "+numElements)
    // check all values against lastValues array
    for (let i = 0; i < lastValues.length; i++) {
      if (currValues[i] != lastValues[i]){
        lastValues = currValues;
        return true;
      }
    }

    // if nothing changed
    return false;
  }
  
  let needsUpdate = true;

  my.draw = function() { //drwwwwwww
    // draw grid
    my.push();
    my.strokeWeight(1);
    my.stroke(my.color3);
    my.fill(my.color3);
    let yOffset = 100
    for (let i = 0; i < 20; i++) {
        my.line(0,i*yOffset,5,i*yOffset);
    }
    for (let i = 0; i < 20; i++) {
        my.line(i*yOffset,0,i*yOffset,5);
    }
    my.noStroke();
    my.textSize(7);
    my.textStyle(NORMAL);
    my.text('100',yOffset,10)
    my.pop();

    //divisions
    my.push();
    my.rect(0,0,6,y_size);
    my.rect(0,0,x_size,6);
    my.stroke(my.color3);
    for (let i=0; i < vertDivisions.length; i++){
        my.line(vertDivisions[i],0,vertDivisions[i],y_size);
    }
    for (let i=0; i < horzDivisions.length; i++){
        my.line(0, horzDivisions[i], x_size, horzDivisions[i]);
    }
    my.pop();


  // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    for (let i = 0; i < elements.length; i++) {
    // UPDATE KNOB VALUE
      if (elements[i].type == 'knob' || elements[i].type == 'dial'){
        if (dragging && currElement==i) {
          console.log('\nVAL: '+elements[i].value)
          console.log('ogV: '+ogValue)
          let dy = elements[i].y - my.mouseY - ogY; // mouse units
          let dyScaled = dy*yScale; // mouse units + scaled for sensitivity
          let dyConverted = -elements[i].min+dyScaled*(elements[i].max-elements[i].min) + elements[i].min; // convert to 'value' units
          console.log('dyC: '+dyConverted)
          elements[i].value = dyConverted + ogValue; // convert to value units
          if (elements[i].value >= elements[i].max) {
            elements[i].value = elements[i].max;
          }
          else if (elements[i].value <= elements[i].min) {
            elements[i].value = elements[i].min;
          }
        }
      } 
    // UPDATE SLIDER VALUE
      else if (elements[i].type == 'slider' || elements[i].type == 'fader'){
        if (dragging && currElement==i) {
          var dy = elements[i].y - my.mouseY - ogY;
          var dyScaled = dy*(sliderSensitivity/elements[i].size); // scale for sensitivity based on size
          elements[i].value = dyScaled - ogValue; // update value
          if (elements[i].value >= elements[i].max) {
            elements[i].value = elements[i].max;
          }
          else if (elements[i].value <= elements[i].min) {
            elements[i].value = elements[i].min;
          }
        }
      } 
    
    // TOGGLE VALUE GETS UPDATED IN mousePressed()

    // UPDATE MOMENTARY BUTTON VALUE
      else if (elements[i].type == 'momentary' ){
        if (currElement == i && dragging){
          elements[i].value = 1;
        } else {
          elements[i].value = 0;
        }
      }
    // RADIO BUTTON VALUE GETS UPDATED IN mousePressed()
      else if (elements[i].type == 'radio'){
        // CURRENTLY ASSUMING ONLY 4 OPTIONS
        my.push();
        my.translate(elements[i].x, elements[i].y);
        
        my.fill(my.color2);
        my.stroke(my.color1);
        my.rect(-boxSize/2,-2*boxSize,boxSize,boxSize);
        my.rect(-boxSize/2,-boxSize,boxSize,boxSize);
        my.rect(-boxSize/2,0,boxSize,boxSize);
        my.rect(-boxSize/2,boxSize,boxSize,boxSize);
        
        my.textSize(11);
        my.noStroke();
        my.fill(my.color1);
        my.text("SIN", 0,-1.5*boxSize);
        my.text("SAW", 0,-0.5*boxSize);
        my.text("TRI", 0,0.5*boxSize);
        my.text("SQR", 0,1.5*boxSize);
        // FILL IN ACTIVE BUTTON
        let active = elements[i].value;
        let factor = active - 3;
        my.fill(my.color1);
        my.rect(-boxSize/2,factor*boxSize,boxSize,boxSize);
        my.fill(my.color2);
        for (let i = 1; i <= 4; i++) {
          if (active == i) {
            let txts = ["SIN","SAW","TRI","SQR"];
            let txt = txts[i-1];
            my.text(txt, 0,(factor+.5)*boxSize);

          } 
        }
        my.pop();

        // MAP TO CONTROLS
        eval(elements[i].mapto +'= ' + elements[i].value + ';');
      }
      else if (elements[i].type == 'keyboard'){
        // draw element
        my.push();
        my.fill(255);
        my.stroke(my.color1);
        my.strokeWeight(2);
        // let textColor = my.color3;
        // if (currElement == i && dragging){
        //   my.stroke(my.color1);
        //   textColor = my.color1;
        //   my.strokeWeight(3);
        // }

        my.translate(elements[i].x, elements[i].y);
        let keys = [  '49','50','51','52','53','54','55','56','57','48','189','187'] // 1 thru 0 row of keys
        let xShift = 0;
        //   2 4   7 9 -
        //  1 3 5 6 8 0 +
        let whiteKeys = [1,3,5,6,8,10,12];
        let blackKeys = [2,4,7,9,11];
        for (let j = 0; j < 7; j++) {
          i = whiteKeys[j]-1;
          my.fill(255);
          if (currKey == keys[i]) {
            my.fill(my.color1);
          }
          xShift = 60*j;
          my.rect(xShift, 60, 60, -140);
        }
        my.translate(40,0)
        for (let j = 0; j < 5; j++) {
          i = blackKeys[j]-1;
          my.fill(0);
          if (currKey == keys[i]) {
            my.fill(my.color1);
          }
          xShift = 60*(i-j-1);
          my.rect(xShift, 0, 35, -80);
        }
      }
      else if (elements[i].type == 'sequencer'){
        // draw element
        my.translate(20,100);
        my.push();
        my.fill(my.color2);
        my.stroke(my.color1);
        let seqBoxSize = 30;
        for (let track =0; track < 4; track++){
          my.push();
          my.fill(my.color1);
          my.noStroke();
          my.text('TRK',seqBoxSize/2,track*seqBoxSize);
          my.pop();
          for (let step =0; step < 8; step++){
            let x = (step+1)*seqBoxSize;
            let y = track*seqBoxSize;
            if (dragging == true){
              let stepState = elements[i].value[track][step];
              if ((my.mouseX > x && my.mouseX < x+boxSize) && (my.mouseY > y && my.mouseY < y+boxSize)){
                console.log(elements[i].value)
                if (seqUpdateStarted) {
                  let newval = 1;
                  if (seqUpdateState == 'OFF'){
                    newval = 0;
                  }
                  elements[i].value[track][step] = newval;
                  stepState = newval;
                } else {
                  seqUpdateStarted = true;
                  seqUpdateState = 'ON';
                  if (stepState == 1){
                    seqUpdateState = 'OFF';
                  }
                }
                my.fill(my.color2);
                if (stepState == 1) {
                  my.fill(my.color1);
                }
              }
            }
            my.rect((step+1)*seqBoxSize,track*seqBoxSize,seqBoxSize);
          }
        }
        my.pop();
      } 
      else if (elements[i].type == 'idk'){
        // draw element
      } 
    }
    redraw();
    // update for next round
    // needsUpdate = checkIfValuesChanged();
  }// draw


  my.mousePressed = function() {
    console.log('click');
    currElement = "none";
    dragging = true; // start dragging
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == "knob" || elements[i].type == 'dial'){
        console.log('checking')
        if (dist(my.mouseX, my.mouseY, elements[i].x, elements[i].y) < r) { 
          ogY = y0 - my.mouseY;
          ogValue = elements[i].value;
          currElement = i;
          break
        }
      } 
      else if (elements[i].type == "slider" || elements[i].type == 'fader'){
        if (Math.abs(elements[i].x - my.mouseX) <= (sliderThickness/2)){
          if (Math.abs(elements[i].y - my.mouseY) <= (sliderLength/2+10)){
            ogY = y0 - my.mouseY;
            ogValue = -elements[i].value;
            currElement = i;
            break
          }
        }
      } 
      else if (elements[i].type == "toggle"){
        if (dist(my.mouseX, my.mouseY, elements[i].x, elements[i].y) < r) { 
          elements[i].value = 1 - elements[i].value;
          currElement = i;
          break
        }
      }
      else if (elements[i].type == "momentary"){
        if (dist(my.mouseX, my.mouseY, elements[i].x, elements[i].y) < r) { 
          currElement = i;
          break
        }
      }
      else if (elements[i].type == "radio"){
        if (Math.abs(elements[i].x - my.mouseX) <= (boxSize/2)){
          let numBoxes = elements[i].radioOptions.length;
          let boxID = 1;
          let mousePosY = my.mouseY - elements[i].y;
          let lowerBound = -boxSize*(numBoxes/2);
          let upperBound = lowerBound + boxSize;
          for (let j=0; j < numBoxes; j++){
            if (upperBound >= mousePosY && mousePosY >= lowerBound){
              elements[i].value = boxID;
              break
            }
            boxID += 1;
            upperBound += boxSize;
            lowerBound += boxSize;
          }
        } 
      }
      else if (elements[i].type == "sequencer"){
        if (my.mouseX >= (elements[i].x) && my.mouseX <= (seqBoxSize*9 + elements[i].x)){
          if (my.mouseY >= (elements[i].y) && my.mouseX <= (seqBoxSize*4 + elements[i].y)){
            currElement = i;
            break
          }
        }
      }
    }// for loop
    // grid edges
    if (my.mouseX <= 6){
      createVertDivision = true;
      console.log('v');
    } else if (my.mouseY <= 6){
      console.log('h');
      createHorzDivision = true;
    }
    console.log('curE: '+currElement);
  }// mousePressed
    
  
  my.mouseReleased = function() {
    // console.log('\nmouse released');
    // console.log(createVertDivision);
    // Stop dragging
    dragging = false;
    if (createVertDivision == true) {
      createVertDivision = false;
      vertDivisions.push(currVertDiv);
    } else if (createHorzDivision == true) {
      createHorzDivision = false;
      horzDivisions.push(currHorzDiv);
    }
  }
  // my.my.color1 = function(val) {
  //   my.color1 = color(val)
  // }
  let elements = [];

  let UserElement = function(type,label,mapto,x,y,min,max,value,prev,size,showLabel,showValue, radioOptions,horizontal) {
    this.type = type; // str: type of element
    this.label = label; // str: name and unique ID
    this.mapto = mapto; // str: variable it is controlling

    this.x = x; // #: pos
    this.y = y; // #: pos
    this.min = min; // #: units of what its mapped to
    this.max = max; // #; units of what its mapped to
    this.value = value; // #: current value
    this.prev = prev; // #:cprevious value
    this.size = size; // #
    this.showLabel = showLabel; // bool
    this.showValue = showValue; // bool
    this.showValue = showValue; // bool

    this.radioOptions = radioOptions; // array
    this.horizontal = horizontal; // bool: for slider or radio buttons
  }
  

  my.addElement = function({type,label,mapto, x,y,min,max,value,prev,size,showLabel,showValue,radioOptions,horizontal}) {
    // console.log(elements);
    // forceDraw = true; // so that the canvas will update even tho we are not clicking it
    // NEW OR UPDATE EXISTING?
    let update = false;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        console.log('UPDATE element');
        update = true;
        // UPDATE VALS
        if (type != undefined) {elements[i].type = type;}
        if (mapto != undefined) {elements[i].mapto = mapto;}
        if (x != undefined) {elements[i].x = x;}
        if (y != undefined) {elements[i].y = y;}
        if (min != undefined) {elements[i].min = min;}
        if (max != undefined) {elements[i].max = max;}
        if (value != undefined) {elements[i].value = value;}
        if (size != undefined) {elements[i].size = size;}
        if (showLabel != undefined) {elements[i].showLabel = showLabel;}
        if (showValue != undefined) {elements[i].showValue = showValue;}
        if (radioOptions != undefined) {elements[i].radioOptions = radioOptions;}
        if (horizontal != undefined) {elements[i].horizontal = horizontal;}
        break
      }
      else {
        console.log('NEW element');
      }
    }

    if (update == false){
      let xGap = 100;
      // default default values
      if (x == undefined) {x = x0 + elements.length*xGap;}
      if (y == undefined) { y = y0;}
      if (min == undefined) {min=0;}
      if (max == undefined) {max=1;}
      if (value == undefined) {value=(max-min)/2;}
      if (prev == undefined) {prev="";}
      if (size == undefined) {size=1;}
      if (showLabel == undefined) {showLabel=true;}
      if (showValue == undefined) {showValue=true;}
      if (radioOptions == undefined) {radioOptions=["!!!"];}
      if (horizontal == undefined) {horizontal=false;}

      if (type == 'toggle') {
        value = 0;
      }
      else if (type == 'radio') {
        min = 1;
        max = radioOptions.length;
        value = 1;
      }
      else if (type == 'sequencer') {
        // 8 x 4track
        value = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
      }
      elements.push(new UserElement(type,label,mapto,x,y,min,max,value,prev,size,showLabel,showValue,radioOptions,horizontal));
      console.log(elements);
    }

    return elements[elements.length - 1];
  }//addElement

  my.removeElement = function(label) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        elements.splice(i,1);
      }
    }
  }//removeElement

  my.scaleX = function(val){
    return val;
    // return (val/100) * m;
  }
  my.scaleY = function(val){
    return val;
    return (val/100) * x_size * my.dimRatio;
  }

  function redraw() { //rdrwwwwwww
    my.background(my.color2);
    my.scale(globalScale);
    my.fill(my.color1);
    for (let i = 0; i < elements.length; i++) {
      // DRAW KNOB
      if (elements[i].type == 'knob' || elements[i].type == 'dial'){
          my.push();
          my.translate( my.scaleX(elements[i].x), my.scaleY(elements[i].y) );
          let sz = elements[i].size;
          my.stroke(my.color3);
          my.fill(transparentColor);  
          my.strokeWeight(6);
          my.arc(0, 0, 2*rKnob*sz, 2*rKnob*sz,120,60);
          my.stroke(my.color1);
          let valueNorm = (elements[i].value - elements[i].min) / (elements[i].max-elements[i].min) ; // normalize between 0-1
          let valueInDegrees = valueNorm * 300 - 240; // range is -240 to 60 deg
          my.arc(0, 0, 2*rKnob*sz, 2*rKnob*sz,120,valueInDegrees+.01);

          if (dragging && currElement==i) {
            my.stroke(my.color1);
          }
          // my.ellipse(0, 0, r*1.8, r*1.8);
          my.rotate(valueInDegrees);

          my.push();
          my.stroke(my.color2);
          my.strokeWeight(12);
          my.line(0, 0, rKnob*sz, 0);
          my.pop();

          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          // LABEL
          my.fill(my.color3);
          my.noStroke();
          let roundto = 0;
          if (elements[i].max <= .1) {
            roundto = 3
          } else if (elements[i].max <= 1) {
            roundto = 2
          } else if (elements[i].max <= 10) {
            roundto = 1
          }
          my.textSize(13);
          my.text(round(elements[i].value,roundto), elements[i].x, elements[i].y+rKnob*sz-2);
          my.text(elements[i].label, elements[i].x, elements[i].y+rKnob*sz+13);
          // MAP TO CONTROLS
          eval(elements[i].mapto +'= ' + elements[i].value + ';');
      }  
    // END KNOB
    // DRAW SLIDER
      else if (elements[i].type == 'slider' || elements[i].type == 'fader'){
        my.push(); 
        let sz = elements[i].size;
        my.translate(elements[i].x, elements[i].y);
        // full slider line
        my.stroke(my.color3);
        my.strokeCap(SQUARE);
        my.strokeWeight(14*sz);
        my.line(0,sliderLength*sz/2, 0,-sliderLength*sz/2);
        // active slider line
        my.stroke(my.color1);
        let valueNorm = (elements[i].value - elements[i].min) / (elements[i].max-elements[i].min) ; // normalize between 0-1
        let convertedVal = valueNorm * sliderLength*sz;
        my.line(0,sliderLength*sz/2,0,sliderLength*sz/2-convertedVal);
        // middle line
        my.strokeWeight(2*sz);
        my.stroke(my.color2);
        my.line(0,.9*sliderLength*sz/2, 0,-.9*sliderLength*sz/2);

        // control point
        my.strokeWeight(14*sz);
        my.stroke(my.color2);
        let knobSize = 5*sz
        let knobOffset = knobSize + 2 + 1*sz;
        my.line(0,.9*(sliderLength*sz/2)-.9*convertedVal-knobOffset,0,.9*(sliderLength*sz/2)-.9*convertedVal+knobOffset);
        my.stroke(my.color1);
        my.line(0,.9*(sliderLength*sz/2)-.9*convertedVal-knobSize,0,.9*(sliderLength*sz/2)-.9*convertedVal+knobSize);

        // LABEL
        my.fill(my.color3);
        my.noStroke();
        let txt = elements[i].label;
        my.textSize((2+sz)*4); // scales text based on num of char
        my.text(txt, 0, -sliderLength*sz/2-10);

        let roundto = 0;
        if (elements[i].max <= .1) {
          roundto = 3
        } else if (elements[i].max <= 1) {
          roundto = 2
        } else if (elements[i].max <= 10) {
          roundto = 1
        }
        my.textSize((5+sz)*2); // scales text based on num of char
        my.text(round(elements[i].value,roundto), 0, sliderLength*sz/2+10);
        my.pop();
        // MAP TO CONTROLS
        eval(elements[i].mapto +'= ' + elements[i].value + ';');
      }
    // END SLIDER
    // DRAW TOGGLE BUTTON
      else if (elements[i].type == 'toggle' ){
        my.push(); // ASSUME ON STATE
        my.stroke(my.color1);
        my.strokeWeight(4);
        let textColor = my.color1;
        if (elements[i].value == 0) { // OFF STATE
          my.stroke(my.color3);
          my.strokeWeight(2);
          textColor = my.color3;
        }
        my.translate(elements[i].x, elements[i].y);
        my.fill(my.color2);
        my.ellipse(0, 0, r*2, r*2);
        my.fill(textColor);
        my.noStroke();
        let toggleText = elements[i].label;
        my.textSize(85/toggleText.length); // scales text based on num of chars
        my.text(toggleText, 0, 1);
        my.pop();
        // MAP TO CONTROLS
        eval(elements[i].mapto +'= ' + elements[i].value + ';');
      }
    // END TOGGLE
    // DRAW MOMENTARY BUTTON
      else if (elements[i].type == 'momentary' ){
        my.push(); // ASSUME OFF STATE
        my.fill(my.color2);
        my.stroke(my.color3);
        my.strokeWeight(2);
        let textColor = my.color3;
        if (elements[i].value == 1){ // ON STATE
          my.stroke(my.color1);
          textColor = my.color1;
          my.strokeWeight(4);
        }
        my.translate(elements[i].x, elements[i].y);
        my.ellipse(0, 0, r*2, r*2);
        my.fill (textColor);
        my.noStroke();
        let text = elements[i].label;
        my.textSize(85/text.length); // scales text based on num of chars
        my.text(text, 0, 1);
        my.pop();
        // MAP TO CONTROLS
        eval(elements[i].mapto +'= ' + elements[i].value + ';');
      }
    // END MOMENTARY
    // DRAW RADIO BUTTON
      else if (elements[i].type == 'radio'){
        my.push();
        my.translate(elements[i].x, elements[i].y);
        
        my.fill(my.color2);
        my.stroke(my.color1);
        let numBoxes = elements[i].radioOptions.length
        let yBoxInit = - Math.floor(numBoxes/2); // y scale for where to start drawing
        if (numBoxes % 2 != 0){
          yBoxInit += -0.5 // extra offset if numBoxes is odd
        }
        let yBox = yBoxInit;
        for (let j=0; j < numBoxes; j++){
          my.rect(-boxSize/2,yBox*boxSize,boxSize,boxSize);
          yBox = yBox + 1; // adjust y scale
        }
        my.textSize(11);
        my.noStroke();
        my.fill(my.color1);
        yBox = yBoxInit + 0.5; // reset to original value, add offset to center text
        for (let j=0; j < numBoxes; j++){
          my.text(elements[i].radioOptions[j], 0, yBox*boxSize);
          yBox = yBox + 1; // adjust y scale
        }
        // FILL IN ACTIVE BUTTON
        let active = elements[i].value - 1; // adjust for 0-indexing
        yBox = yBoxInit + active;
        my.fill(my.color1);
        my.rect(-boxSize/2,yBox*boxSize,boxSize,boxSize);
        my.fill(my.color2);
        let txt = elements[i].radioOptions[active];
        my.text(txt, 0,(yBox+.5)*boxSize);
        my.pop();
        // MAP TO CONTROLS
        eval(elements[i].mapto +'= ' + elements[i].value + ';');
      }
    }  
  }
}



var gui = new p5(gui_sketch, document.getElementById('gui_div'));
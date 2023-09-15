//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg
import p5 from 'p5';

let x_size,y_size,edgeGapX,edgeGapY;
let globalScale = 1;

let fullscreen = false;
const gui_sketch = function(my) {

  // let x_size = document.getElementById('gui_div').offsetWidth *.985;
  // let y_size = document.getElementById('gui_div').offsetHeight *.99;

  let x_size = 400;
  let y_size = 300;

  my.fitDrawing = function(div){
    x_size = document.getElementById(div).offsetWidth *.985;
    y_size = document.getElementById(div).offsetHeight *.985;
    my.scaleOutput()
  }

  my.scaleOutput = function() {
    my.createCanvas(x_size, y_size);
    my.dimRatio = y_size / x_size;
    
    //slow down draw rate
    my.frameRate(30)

    my.background(220,229,234)
    my.noStroke();
    
    my.angleMode(my.DEGREES);
    my.textStyle(my.BOLD);
    my.textAlign (my.CENTER, my.CENTER);
    buttonPress();  
    // my.fullscreenGUI()
    redraw();
  }//setup

  let whiteColor = my.color(255,255,255);
  let blackColor = my.color(0,0,0);
  let transparentColor = my.color(0,0,0);

  // COLOR VARS
  my.color1 = my.color(255,40,255);
  my.color2 = my.color(170,176,180);
  my.color3 = my.color(220,229,234);

  let dragging = false;
  let forceDraw = false;
  let currElement = 0;
  let currKey = 'none';

  let createHorzDivision, createVertDivision, currVertDiv, currHorzDiv;
  let vertDivisions = [];
  let horzDivisions = [];
  let lines = [];
  
  // UI ELEMENTS DEFAULT VALUES
  let SCALE = 1;
  let x0 = 15;
  let y0 = 50;
  let rBtn = 40; // button size
  let rKnob = 40; // knob size
  // slider
  let sliderWidth = 10;
  let sliderLength=100;
  let sliderSensitivity = .008;
  // radio
  let radioBox = 30;
  let seqBoxSize = 30;
  let seqUpdateState = 'ON';
  let seqUpdateStarted = false;
  // knob
  let ogY = 0;
  let ogX = 0;
  let sensitivityScale = 0.006; // alters sensitivity of turning the knob
  let ogValue = 0;
  // keybaord
  let keypattern = [0,1,0,1,0,0,1,0,1,0,1,0];

  let fillervar = 0;  
  let buttonPress = function() {
    // for testing
    //console.log('buton pres')
  }

  my.keyPressed = function() {currKey = my.keyCode;}
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
    let valuesChanged = didValuesChange();
    // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    for (let i = 0; i < elements.length; i++) {
    // UPDATE KNOB VALUE
      if (elements[i].type == 'knob' || elements[i].type == 'dial'){
        if (dragging && currElement==i) {
          elements[i].prev = elements[i].value; // store prev val
          let dx = elements[i].x*globalScale - my.mouseX - ogX; // mouse units
          let dy = elements[i].y*globalScale - my.mouseY - ogY; // mouse units
          let dxScaled = -dx * sensitivityScale; // mouse units + scaled for sensitivity
          let dyScaled = dy * sensitivityScale; // mouse units + scaled for sensitivity
          let dxConverted = dxScaled*(elements[i].max-elements[i].min) -elements[i].min + elements[i].min; // convert to 'value' units
          let dyConverted = dyScaled*(elements[i].max-elements[i].min) -elements[i].min + elements[i].min; // convert to 'value' units
          elements[i].value = dxConverted + dyConverted + ogValue; // convert to value units
          if (elements[i].value >= elements[i].max) {
            elements[i].value = elements[i].max;
          }
          else if (elements[i].value <= elements[i].min) {
            elements[i].value = elements[i].min;
          }
        }
      } 
    // UPDATE SLIDER VALUE
      else if (elements[i].type == 'slider' || elements[i].type == 'fader' ){
        if (dragging && currElement==i) {
          elements[i].prev = elements[i].value; // store prev val
          let dx = elements[i].x*globalScale - my.mouseX - ogX; // mouse units
          var dy = elements[i].y*globalScale - my.mouseY - ogY; // mouse units
          let dxScaled = -dx * (sliderSensitivity/elements[i].size); // mouse units + scaled for sensitivity
          let dyScaled = dy * (sliderSensitivity/elements[i].size); // mouse units + scaled for sensitivity
          elements[i].value = dxScaled + dyScaled - ogValue; // update value
          if (elements[i].value >= elements[i].max) {
            elements[i].value = elements[i].max;
          }
          else if (elements[i].value <= elements[i].min) {
            elements[i].value = elements[i].min;
          }
        }
      } 
    
    // TOGGLE VALUE GETS UPDATED IN mousePressed()
      else if (elements[i].type == 'toggle' ){
        elements[i].prev = elements[i].value; // store prev val
      }

    // UPDATE MOMENTARY BUTTON VALUE
      else if (elements[i].type == 'momentary' ){
        elements[i].prev = elements[i].value; // store prev val
        if (currElement == i && dragging){
          elements[i].value = 1;
        } else {
          elements[i].value = 0;
        }
      }
    // RADIO BUTTON VALUE GETS UPDATED IN mousePressed()
      else if (elements[i].type == 'radio' ){
        elements[i].prev = elements[i].value; // store prev val
      }

    // UPDATE KEYBOARD VALUES
      else if (elements[i].type == 'keyboard'){
        // draw element
        my.push();
        my.fill(255);
        my.stroke(elements[i].color);
        my.strokeWeight(2);
        // let textColor = my.color2;
        // if (currElement == i && dragging){
        //   my.stroke(elements[i].color);
        //   textColor = elements[i].color;
        //   my.strokeWeight(3);
        // }

        my.translate(elements[i].x, elements[i].y);
        let keys = [  '49','50','51','52','53','54','55','56','57','48','189','187'] // 1 thru 0 row of keys
        
        let blackKeyOffset = [1,2,4,5,6];
        let whiteKeyWidth = elements[i].width / elements[i].keys;

        let k = 0
        // WHITE KEYS
        let wCount = 0;
        for (let j = 0; j < elements[i].keys; j++) {
          if (k >= 12) {k = k - 12};
          if (keypattern[k] == 0) {
            //console.log('white')
            my.fill(255);
            if (currKey == keys[j]) {
              my.fill(elements[i].color);
            }
            let xShift = whiteKeyWidth*wCount;
            wCount++;
            my.rect(xShift, 0, whiteKeyWidth, elements[i].height);
          } 
          k++;
        }
        // BLACK KEYS
        let bCount = 0;
        let bOctave = 0;
        for (let j = 0; j < elements[i].keys; j++) {
          if (k >= 12) {k = k - 12};
          if (keypattern[k] == 1) {
            //console.log('black')
            my.fill(0);
            if (currKey == keys[j]) {
              my.fill(elements[i].color);
            }
            let b = blackKeyOffset[bCount];
            bCount++;
            
            if (bCount >= 5) {
              bOctave++;
              bCount = bOctave *7;
            }
            
            let xShift = whiteKeyWidth*(b-1) + whiteKeyWidth*.7;
            my.rect(xShift, 0, whiteKeyWidth*.6, elements[i].height*.6);
          }
          k++;
        }
        my.ellipse(0,0,10)

      }
      else if (elements[i].type == 'sequencer'){
        // draw element
        my.translate(20,100);
        my.push();
        my.fill(my.color3);
        my.stroke(elements[i].color);
        let seqBoxSize = 30;
        for (let track =0; track < 4; track++){
          my.push();
          my.fill(elements[i].color);
          my.noStroke();
          my.text('TRK',seqBoxSize/2,track*seqBoxSize);
          my.pop();
          for (let step =0; step < 8; step++){
            let x = (step+1)*seqBoxSize;
            let y = track*seqBoxSize;
            if (dragging == true){
              let stepState = elements[i].value[track][step];
              if ((my.mouseX > x && my.mouseX < x+seqBoxSize) && (my.mouseY > y && my.mouseY < y+seqBoxSize)){
                //console.log(elements[i].value)
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
                my.fill(my.color3);
                if (stepState == 1) {
                  my.fill(elements[i].color);
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
    if (valuesChanged == true) {redraw();}
  }// draw
  function didValuesChange() {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].prev != elements[i].value) {
        elements[i].prev = elements[i].value; // store prev val
        return true
      }
    }
    return false
  }

  my.mousePressed = function() {
    //console.log('click');
    currElement = "none";
    dragging = true; // start dragging
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == "knob" || elements[i].type == 'dial'){
        if (my.dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rKnob*globalScale*elements[i].size) { 
          ogX = elements[i].x*globalScale - my.mouseX;
          ogY = elements[i].y*globalScale - my.mouseY;
          ogValue = elements[i].value;
          currElement = i;
          break
        }
      } 
      else if (elements[i].type == "slider" || elements[i].type == 'fader'){
        let horizontalDim = sliderWidth*2*globalScale*elements[i].size/2;
        let verticalDim = sliderLength*globalScale*elements[i].size/2+10;
        if (elements[i].horizontal == true){
          horizontalDim = sliderLength*globalScale*elements[i].size/2+10;
          verticalDim = sliderWidth*2*globalScale*elements[i].size/2;
        }
        if (Math.abs(elements[i].x*globalScale - my.mouseX) <= (horizontalDim)){
          if (Math.abs(elements[i].y*globalScale - my.mouseY) <= (verticalDim)){
            ogX = elements[i].x*globalScale - my.mouseX;
            ogY = elements[i].y*globalScale - my.mouseY;
            ogValue = -elements[i].value;
            currElement = i;
            break
          }
        }
      } 
      else if (elements[i].type == "toggle"){
        if (my.dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rBtn*globalScale*elements[i].size) { 
          elements[i].value = 1 - elements[i].value;
          currElement = i;
          break
        }
      }
      else if (elements[i].type == "momentary"){
        if (my.dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rBtn*globalScale*elements[i].size) { 
          currElement = i;
          break
        }
      }
      else if (elements[i].type == "radio"){
        let scaling = globalScale*elements[i].size
        if (Math.abs(elements[i].x*globalScale - my.mouseX) <= (radioBox*scaling/2)){
          let numBoxes = elements[i].radioOptions.length;
          let boxID = 1;
          let mousePosY = my.mouseY - elements[i].y*globalScale;
          let lowerBound = -radioBox*scaling*(numBoxes/2);
          let upperBound = lowerBound + radioBox*scaling;
          for (let j=0; j < numBoxes; j++){
            if (upperBound >= mousePosY && mousePosY >= lowerBound){
              elements[i].value = boxID;
              break
            }
            boxID += 1;
            upperBound += radioBox*scaling;
            lowerBound += radioBox*scaling;
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
      //console.log('v');
    } else if (my.mouseY <= 6){
      //console.log('h');
      createHorzDivision = true;
    }
    //console.log('curE: '+currElement);
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
  
  let elements = [];

  let UserElement = function(type,label,mapto,x,y,min,max,value,prev,size,color,showLabel,showValue, bipolar, radioOptions,horizontal) {
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
    this.bipolar = bipolar; // bool

    this.radioOptions = radioOptions; // array
    this.horizontal = horizontal; // bool: for slider or radio buttons

    this.color = color;
    
    /// METHOD VERSION
    // this.type = function(type){
    //   this.type = type; // str: type of element
    // }
    // this.label = function(label){
    //   this.label = label; // str: name and unique ID
    // }
    // this.mapto = function(mapto){
    //   this.mapto = mapto; // str: variable it is controlling
    // }
    
    // this.x = function(x){
    //   this.x = my.ScaleX(x);
    // }
    // this.y = function(y){
    //   this.y = my.ScaleY(y);
    // }

    // this.min = min; // #: units of what its mapped to
    // this.max = max; // #; units of what its mapped to
    // this.value = value; // #: current value
    // this.prev = prev; // #:cprevious value
    // this.size = size; // #
    // this.showLabel = showLabel; // bool
    // this.showValue = showValue; // bool
    // this.bipolar = bipolar; // bool

    // this.radioOptions = radioOptions; // array
    // this.horizontal = horizontal; // bool: for slider or radio buttons

    // this.color = color;

    this.position = function(x,y){
      this.x = my.scaleX(x);
      this.y = my.scaleY(y);
      redraw();
    }
  }
  
  my.addElement = function({type,label,mapto, x,y,min,max,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    // console.log(elements);
    // forceDraw = true; // so that the canvas will update even tho we are not clicking it
    // NEW OR UPDATE EXISTING?
    let update = false;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        //console.log('UPDATE element');
        update = true;
        // UPDATE VALS
        if (type != undefined) {elements[i].type = type;}
        if (mapto != undefined) {elements[i].mapto = mapto;}
        if (x != undefined) {elements[i].x = my.scaleX(x);}
        if (y != undefined) {elements[i].y = my.scaleX(y);}
        if (min != undefined) {elements[i].min = min;}
        if (max != undefined) {elements[i].max = max;}
        if (value != undefined) {elements[i].value = value;}
        if (size != undefined) {elements[i].size = size;}
        if (color != undefined) {elements[i].color = color;}
        if (showLabel != undefined) {elements[i].showLabel = showLabel;}
        if (showValue != undefined) {elements[i].showValue = showValue;}
        if (bipolar != undefined) {elements[i].bipolar = bipolar;}
        if (radioOptions != undefined) {elements[i].radioOptions = radioOptions;}
        if (horizontal != undefined) {elements[i].horizontal = horizontal;}
        elements[i].prev = undefined;
        redraw();
        break
      }
      else {
        //console.log('NEW element');
      }
    }

    if (update == false){
      let xGap = 15;
      // default default values
      if (x == undefined) {
        x = x0 + elements.length*xGap;
        x = Math.min(x,100);
      }
      if (y == undefined) { y = y0;}
      if (min == undefined) {min=0;}
      if (max == undefined) {max=1;}
      if (value == undefined) {value=(max-min)/2;}
      prev = value;
      if (prev == undefined) {prev="";}
      if (size == undefined) {size=1;}
      if (color == undefined) {color = my.color1;}
      if (showLabel == undefined) {showLabel=true;}
      if (showValue == undefined) {showValue=true;}
      if (bipolar == undefined) {bipolar=false;}
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
      elements.push(new UserElement(type,label,mapto,my.scaleX(x),my.scaleY(y),min,max,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal));
      //console.log(elements);
    }

    redraw();

    return elements[elements.length - 1];
  }//addElement

  my.removeElement = function(label) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        elements.splice(i,1);
      }
    }
    redraw();
  }//removeElement

  my.removeElements = function() {
    elements = []
    redraw();
  }//removeElements

  my.elementGrid = function(type,xcount,ycount) {
    let x0 = 50;
    let y0 = 50;
    for (let i=0; i < xcount; i++){
      for (let j=0; j < ycount; j++){
        let label = "grid"+elements.length+"_"+(i*j+j);
        let value = Math.random()*2
        //console.log('label: '+label)
        my.addElement({x:x0+i*24,y:y0+j*24,type:type,label:label,mapto:"fakevar",min:0,max:2,value:value,size:.3,showLabel:false,showValue:false})

      }
    }
    // eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
    // eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
  }
  my.scaleX = function(val){
    val = Math.min((Math.max(0,val)),100);
    return (val/100) * x_size;
  }
  my.scaleY = function(val){
    val = Math.min((Math.max(0,val)),100);
    return (val/100) * y_size;
  }

  function redraw() { //rdrwwwwwww
    my.background(my.color3);

    my.scale(globalScale);
    // draw grid
    my.push();
    my.fill(my.color2);
    my.noStroke();
    my.textSize(7);
    my.textStyle(my.NORMAL);
    let yOffset = y_size / (4*globalScale)
    let xOffset = x_size / (4*globalScale)
    let vals = [25,50,75,100];
    my.text(0,5,5)
    for (let i = 1; i < 5; i++) {
      my.text(vals[i-1],i*xOffset - i*2,5)
    }
    for (let i = 1; i < 5; i++) {
      my.text(vals[i-1],5,i*yOffset - i)
    }
    my.pop();

    //divisions
    my.push();
    my.stroke(my.color2);
    for (let i=0; i < lines.length; i++){
      let a = lines[i][0];
      let b = lines[i][1];
      let c = lines[i][2];
      let d = lines[i][3];
      my.push();
      my.stroke(lines[i][4]);
      my.line(a,b,c,d);
      my.pop();
    }
    my.pop();
    
    for (let i = 0; i < elements.length; i++) {
      // DRAW KNOB
      my.fill(elements[i].color);
      if (elements[i].type == 'line') my.drawLine(i)
      else if (elements[i].type == 'knob' || elements[i].type == 'dial'){
          my.push();
          my.translate(elements[i].x, elements[i].y);
          let sz = elements[i].size;
          // background circle
          my.strokeWeight(6);
          my.fill(my.color3);  
          my.stroke(my.color3);
          my.ellipse(0, 0, 2.2*rKnob*sz);
          // full arc
          my.strokeCap(my.SQUARE);
          my.stroke(my.color2);
          my.fill(transparentColor);  
          my.arc(0, 0, 2*rKnob*sz, 2*rKnob*sz,120,60);
          // active arc
          my.stroke(elements[i].color);
          let valueNorm = (elements[i].value - elements[i].min) / (elements[i].max-elements[i].min) ; // normalize between 0-1
          let valueInDegrees = valueNorm * 300 - 240; // range is -240 to 60 deg
          let bipolarOffset = 0;
          let start = 120;
          let end = valueInDegrees+.01
          if (elements[i].bipolar == true){
            start = 270;
            if (end < -90){
              let startCopy = start;
              start = end;
              end = startCopy;
            }
          }
          my.arc(0, 0, 2*rKnob*sz, 2*rKnob*sz,start,end);
          

          // dial lines
          if (elements[i].bipolar == true){
            my.push();
            my.fill(my.color3);
            my.noStroke();
            my.rect(-1.5,0,3,-rKnob*1.1);
            my.pop();
          }
          my.strokeCap(my.ROUND);
          my.rotate(valueInDegrees);
          my.push();
          my.stroke(my.color3);
          my.strokeWeight(12);
          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          
          // LABEL
          my.push();
          my.fill(my.color2);
          my.noStroke();
          if (elements[i].showValue == true) {
            let roundto = 0;
            if (elements[i].max <= .1) {
              roundto = 3
            } else if (elements[i].max <= 1) {
              roundto = 2
            } else if (elements[i].max <= 10) {
              roundto = 1
            }
            my.textSize(13);
            my.text(my. round(elements[i].value,roundto), elements[i].x, elements[i].y+rKnob*sz-2);
          }
          if (elements[i].showLabel == true) {
            my.text(elements[i].label, elements[i].x, elements[i].y+rKnob*sz+13);
          }
          my.pop();
          
          // MAP TO CONTROLS
          mapToControls(elements[i].mapto, elements[i].value);
      }  
    // END KNOB
    // DRAW SLIDER
      else if (elements[i].type == 'slider' || elements[i].type == 'fader'){
        my.push(); 
        let sz = elements[i].size;
        my.translate(elements[i].x, elements[i].y);
        if (elements[i].horizontal == true){
          my.rotate(90);
        }
        my.rectMode(my.CENTER);  
        // full slider line
        my.strokeCap(my.SQUARE);
        my.noStroke();
        // background box
        my.fill(my.color3);
        my.rect(0, 0, 15*sz*2, sliderLength*sz*1.4);
        // full line
        my.fill(my.color2);
        my.rect(0, 0,sliderWidth*sz, sliderLength*sz);

        // active line
        my.strokeWeight(sliderWidth*sz);
        my.stroke(elements[i].color);
        let valueNorm = (elements[i].value - elements[i].min) / (elements[i].max-elements[i].min) ; // normalize between 0-1
        let convertedVal = valueNorm * sliderLength*sz;
        let bipolarOffset = 0;

        if (elements[i].bipolar == true){
          bipolarOffset = sliderLength*sz/2;
        }
        my.line(0,sliderLength*sz/2 - bipolarOffset,0,sliderLength*sz/2-convertedVal);
        
        // middle line
        my.strokeWeight(2*sz);
        my.stroke(my.color3);
        my.line(0,.9*sliderLength*sz/2, 0,-.9*sliderLength*sz/2);

        if (elements[i].bipolar == true){
          my.push();
          my.fill(my.color3)
          my.noStroke();
          my.rect(0,0,sliderWidth*1.1,2)
          my.pop();
        }
        // control point
        my.push();
        let sliderKnobSize = 8*sz
        my.fill(elements[i].color);
        my.stroke(my.color3);
        my.rect(
          0, 
          .95*(sliderLength*sz/2) -.95*convertedVal,
          sliderWidth*2, 
          sliderKnobSize);
        my.pop();

        // LABEL
        my.fill(my.color2);
        my.noStroke();
        if (elements[i].horizontal == true){
          my.rotate(-90)
        }
        if (elements[i].showLabel == true) {
          let txt = elements[i].label;
          my.textSize((2+sz)*4); // scales text based on num of char
          let labelX = 0;
          let labelY = -sliderLength*sz/2-10;
          if (elements[i].horizontal == true){
            my.text(txt, labelY - 5, labelX);
          } else {
            my.text(txt, labelX, labelY);
          }
        }
        if (elements[i].showValue == true) {
          let roundto = 0;
          if (elements[i].max <= .1) {
            roundto = 3
          } else if (elements[i].max <= 1) {
            roundto = 2
          } else if (elements[i].max <= 10) {
            roundto = 1
          }
          my.textSize((5+sz)*2); // scales text based on num of char
          let labelX = 0;
          let labelY = sliderLength*sz/2+10;
          if (elements[i].horizontal == true){
            my.text(my.round(elements[i].value,roundto), labelY+5,labelX);
          } else {
            my.text(my.round(elements[i].value,roundto), labelX,labelY);
          }
        }
        my.pop();
        // MAP TO CONTROLS
        mapToControls(elements[i].mapto, elements[i].value);
      }
    // END SLIDER
    // DRAW TOGGLE BUTTON
      else if (elements[i].type == 'toggle' ){
        my.push(); // ASSUME ON STATE
        let sz = elements[i].size;
        my.translate(elements[i].x, elements[i].y);
        // background circle
        my.fill(my.color3);  
        my.ellipse(0, 0, 2.2*rBtn*sz);
        // setting up color variables
        my.stroke(elements[i].color);
        my.strokeWeight(4);
        let textColor = elements[i].color;
        if (elements[i].value == 0) { // OFF STATE
          my.stroke(my.color2);
          my.strokeWeight(2);
          textColor = my.color2;
        }
        my.fill(my.color3);
        my.ellipse(0, 0, sz*rBtn*2, sz*rBtn*2);
        my.fill(textColor);
        my.noStroke();
        if (elements[i].showLabel == true) {
          let toggleText = elements[i].label;
          my.textSize(sz*85/toggleText.length); // scales text based on num of chars
          my.text(toggleText, 0, 1);
        }
        my.pop();
        // MAP TO CONTROLS
        mapToControls(elements[i].mapto, elements[i].value);
      }
    // END TOGGLE
    // DRAW MOMENTARY BUTTON
      else if (elements[i].type == 'momentary' ){
        my.push(); // ASSUME OFF STATE
        let sz = elements[i].size;
        my.translate(elements[i].x, elements[i].y);
        // background circle
        my.fill(my.color3);  
        my.ellipse(0, 0, 2.2*rBtn*sz);
        // setting up color variables
        my.fill(my.color3);
        my.stroke(my.color2);
        my.strokeWeight(2);
        let textColor = my.color2;
        if (elements[i].value == 1){ // ON STATE
          my.stroke(elements[i].color);
          textColor = elements[i].color;
          my.strokeWeight(4);
        }
        my.ellipse(0, 0, sz*rBtn*2, sz*rBtn*2);
        my.fill (textColor);
        my.noStroke();
        if (elements[i].showLabel == true) {
          let text = elements[i].label;
          my.textSize(sz*85/text.length); // scales text based on num of chars
          my.text(text, 0, 1);
        }
        my.pop();
        // MAP TO CONTROLS
        mapToControls(elements[i].mapto, elements[i].value);
      }
    // END MOMENTARY
    // DRAW RADIO BUTTON
      else if (elements[i].type == 'radio'){
        my.push();
        let sz = elements[i].size;
        let rBoxSz = radioBox * sz;
        my.translate(elements[i].x, elements[i].y);
        // boxes
        my.fill(my.color2);
        my.stroke(my.color3);
        my.strokeWeight(2);
        let numBoxes = elements[i].radioOptions.length
        let yBoxInit = - Math.floor(numBoxes/2); // y scale for where to start drawing
        if (numBoxes % 2 != 0){
          yBoxInit += -0.5 // extra offset if numBoxes is odd
        }
        // background rect
        my.push();
        my.rectMode(my.CENTER);
        my.fill(my.color3);  
        my.noStroke();
        my.rect(0, 0, rBoxSz+10*sz,rBoxSz*numBoxes+10*sz);
        my.pop();
        // DRAW BOXES
        let yBox = yBoxInit;
        for (let j=0; j < numBoxes; j++){
          let x = -rBoxSz/2;
          let y = yBox*rBoxSz;
          if (elements[i].horizontal == true){
            x = y;
            y = -rBoxSz/2;
          }
          my.rect(x,y,rBoxSz,rBoxSz);
          yBox = yBox + 1; // adjust y scale
        }
        // BOX LABELS
        my.textSize(11);
        my.noStroke();
        my.fill(my.color3);
        if (elements[i].showLabel == true) {
          yBox = yBoxInit + 0.5; // reset to original value, add offset to center text
          for (let j=0; j < numBoxes; j++){
            let x = 0;
            let y = yBox*rBoxSz;
            if (elements[i].horizontal == true){
              x = y;
              y = 0;
            } 
            my.text(elements[i].radioOptions[j], x, y);
            yBox = yBox + 1; // adjust y scale
          } 
        }
        // FILL IN ACTIVE BUTTON
        let active = elements[i].value - 1; // adjust for 0-indexing
        yBox = yBoxInit + active;
        my.fill(elements[i].color);
        my.stroke(my.color3);
        my.strokeWeight(2);
        let x = -rBoxSz/2;
        let y = yBox*rBoxSz;
        if (elements[i].horizontal == true){
          x = y;
          y = -rBoxSz/2;
        }
        my.rect(x,y,rBoxSz,rBoxSz);
        my.noStroke();
        my.fill(my.color3);
        if (elements[i].showLabel == true) {
          let txt = elements[i].radioOptions[active];
          let x = 0;
          let y = (yBox+.5)*rBoxSz;
          if (elements[i].horizontal == true){
            x = y;
            y = 0;
          }
          my.text(txt, x,y);
        }
        my.pop();
        // MAP TO CONTROLS
        mapToControls(elements[i].mapto, elements[i].value);
      }
    }  
  } //redraw

  let lineNumber = 0

  //******** LINES ********//
  my.line2 = function(x1,y1,x2,y2,stroke=1,color,label=null) {
    x1 = my.scaleY(x1)
    x2 = my.scaleY(x2)
    y1 = my.scaleY(y1)
    y2 = my.scaleY(y2)
    //my.line(x1,y1,x2,y2)
    if (color == undefined){
      color = my.color2;
    }
    //lines.push([x1,y1,x2,y2,stroke,color])

    let type = 'line'
    if (label == null) label = 'line' + lineNumber
    lineNumber+=1
    let mapto = 'mapto'
    let x=[x1,x2]
    let y=[y1,y2]
    let min = 0
    let max = 0
    let size = stroke

    elements.push(new UserElement(type,label,'mapto',x,y,0,0,0,0,size,0,0,0,0,0));
    redraw()
    return elements[elements.length - 1];
  } //line2

  my.lineX = function(x,color) {
    x = my.scaleX(x)
    my.line(x,0,x,y_size)
    if (color === undefined){
      color = my.color2;
    }
    lines.push([x,0,x,y_size,color])
    redraw()
  }

  my.lineY = function(y,color) {
    y = my.scaleY(y)
    my.line(0,y,x_size,y)
    if (color == undefined){
      color = my.color2;
    }
    lines.push([0,y,x_size,y,color])
    redraw()
  }

  my.drawLine = function(i){
    my.stroke( elements[i].color )
    my.strokeWeight( elements[i].size )
    my.line(elements[i].x[0],elements[i].y[0],elements[i].x[1],elements[i].y[1])
  }


  function mapToControls(mapto, value) {
    try {
       eval(mapto + '.rampTo(value, 0.1)');
      //eval(mapto +'= ' + value + ';'); //old
    } catch (error) {
      if (mapto == ""){
        console.error("ERROR: 'mapto' variable is empty");
      } else {
        console.error("ERROR: invalid 'mapto' variable: "+mapto);
      }
    }
  } 

  my.fullscreenGUI = function(){
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
    x_size = document.getElementById('gui_div').offsetWidth;
    y_size = document.getElementById('gui_div').offsetHeight;
    //console.log()
    // gui.dimRatio = y_size / x_size;
    my.resizeCanvas(x_size, y_size);
    //my.background(100);
    redraw();

    edgeGapX = x_size * (1-globalScale) * 0.5 ;
    edgeGapY = y_size * (1-globalScale) * 0.5 ;
  }//fullscreen

  let Keyboard = function(label,type,mapto,x,y,width,height,keys,color,showLabel) {
    this.label = label; // str: name and unique ID
    this.type = type; // str: name and unique ID
    this.mapto = mapto; // str: variable it is controlling

    this.x = x; // #: pos
    this.y = y; // #: pos
    this.width = width; // #: w 
    this.height = height; // #: h
    this.keys = keys; // #: current value
    this.color = color; // #
    this.showLabel = showLabel; // bool

    this.position = function(x,y){
      this.x = my.scaleX(x);
      this.y = my.scaleY(y);
      redraw();
    }
  }//Keyboard

  my.addKeyboard = function({label,type,mapto,x,y,width,height,keys,color,showLabel}) {
    // NEW OR UPDATE EXISTING?
    let update = false;
    // for (let i = 0; i < elements.length; i++) {
    //   if (elements[i].label == label) {
    //     console.log('UPDATE element');
    //     update = true;
    //     // UPDATE VALS
    //     if (type != undefined) {elements[i].type = type;}
    //     if (mapto != undefined) {elements[i].mapto = mapto;}
    //     if (x != undefined) {elements[i].x = my.scaleX(x);}
    //     if (y != undefined) {elements[i].y = my.scaleX(y);}
    //     if (min != undefined) {elements[i].min = min;}
    //     if (max != undefined) {elements[i].max = max;}
    //     if (value != undefined) {elements[i].value = value;}
    //     if (size != undefined) {elements[i].size = size;}
    //     if (color != undefined) {elements[i].color = color;}
    //     if (showLabel != undefined) {elements[i].showLabel = showLabel;}
    //     if (showValue != undefined) {elements[i].showValue = showValue;}
    //     if (bipolar != undefined) {elements[i].bipolar = bipolar;}
    //     if (radioOptions != undefined) {elements[i].radioOptions = radioOptions;}
    //     if (horizontal != undefined) {elements[i].horizontal = horizontal;}
    //     elements[i].prev = undefined;
    //     redraw();
    //     break
    //   }
    //   else {
    //     console.log('NEW keyboard');
    //   }
    // }
    if (update == false){
      // default default values
      type = "keyboard";
      if (x == undefined) {x = 0;}
      if (y == undefined) { y = 0;}
      if (keys == undefined) {keys=12;}
      if (width == undefined) {width=keys*30;}
      if (height == undefined) {height=100;}
      if (color == undefined) {color=my.color1;}
      if (showLabel == undefined) {showLabel=false;}
      elements.push(new Keyboard(label,type,mapto,my.scaleX(x),my.scaleY(y),width,height,keys,color,showLabel));
    }

    redraw();
    return elements[elements.length - 1];
  }//addKeyboard

  my.scaleValue = function(input,inLow,inHigh,outLow,outHigh,curve){
    //console.log(input, outLow, outHigh, curve);
    let val = (input-inLow) * (1/(inHigh-inLow));
    val = Math.pow(val, curve);
    return val*(outHigh-outLow) + outLow;
  }
}

export default gui_sketch;

//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg
let x_size,y_size,edgeGapX,edgeGapY;
let globalScale = 1;

let fullscreen = false;
// function fullscreenGUI(){
//   console.log("FS");

//   if (fullscreen){
//     //reset
//     document.getElementById('gui_div').style.top = "2%";
//     document.getElementById('gui_div').style.right = "2";
//     document.getElementById('gui_div').style.width = "49%";
//     document.getElementById('gui_div').style.height = "32%";
//     globalScale = 1;
//     fullscreen = false
//   } else {
//     //make fs
//     document.getElementById('gui_div').style.top = "4%";
//     document.getElementById('gui_div').style.right = ".5%";
//     document.getElementById('gui_div').style.width = "99%";
//     document.getElementById('gui_div').style.height = "96%";
//     globalScale = 2;
//     fullscreen = true
//   }
//   x_size = document.getElementById('gui_div').offsetWidth;
//   y_size = document.getElementById('gui_div').offsetHeight;
//   console.log()
//   // gui.dimRatio = y_size / x_size;
//   gui.resizeCanvas(x_size, y_size);
//   gui.background(100);

//   edgeGapX = x_size * (1-globalScale) * 0.5 ;
//   edgeGapY = y_size * (1-globalScale) * 0.5 ;
// }//fullscreen

const gui_sketch = function(my) {

  x_size = document.getElementById('gui_div').offsetWidth *.985;
  y_size = document.getElementById('gui_div').offsetHeight *.99;

  my.setup = function() {
    my.createCanvas(x_size, y_size);
    my.dimRatio = y_size / x_size;
    
    //slow down draw rate
    my.frameRate(30)

    // COLOR VARS
    whiteColor = color(255);
    blackColor = color(0);
    transparentColor = color(0,0);
    my.color1 = color(255,40,0);
    my.color2 = color(220,229,234);
    my.color3 = color(170,176,180);
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
    my.fullscreenGUI()
  }//setup


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
  let yScale = 0.009; // alters sensitivity of turning the knob
  let ogValue = 0;

  let fillervar = 0;  
  let buttonPress = function() {
    // for testing
    console.log('buton pres')
    // my.addElement({type:"knob",label:"SL1",mapto:"fakevar",min:0,max:2,value:1,size:1,showLabel:true,showValue:true})
    // my.addElement({type:"knob",label:"SL12",mapto:"fakevar",min:0,max:2,value:1,size:1,showLabel:true,showValue:true,bipolar:true})
    // // my.addElement({type:"knob",label:"SL2",mapto:"fakevar",min:0,max:3,value:2,size:1})
    // // my.addElement({type:"knob",label:"SL3",mapto:"fakevar",min:1,max:2,value:1,size:2})
    // my.addElement({type:"radio",label:"radio",mapto:"fillervar",size:1,radioOptions:['a','b','c','d','e']})
    // my.addElement({type:"slider",label:"sVOL",mapto:"fillervar",size:1})
    // my.addElement({type:"slider",label:"hor",mapto:"fillervar",size:1,horizontal:true})
    // // my.addElement({type:"slider",label:"s2VOL",mapto:"fillervar",size:1,bipolar:true})
    // // my.addElement({type:"slider",label:"kVOL2",mapto:"fillervar",size:.5})
    // my.addElement({type:"toggle",label:"togl",mapto:"fillervar",size:1})
    // my.addElement({type:"momentary",label:"momn",mapto:"fillervar",size:1})
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
    let valuesChanged = didValuesChange();
    my.push();
    my.fill(color(255,0,55));
    my.ellipse(55,55,55,55);
    my.pop();
    // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    for (let i = 0; i < elements.length; i++) {
    // UPDATE KNOB VALUE
      if (elements[i].type == 'knob' || elements[i].type == 'dial'){
        if (dragging && currElement==i) {
          elements[i].prev = elements[i].value; // store prev val
          let dy = elements[i].y*globalScale - my.mouseY - ogY; // mouse units
          let dyScaled = dy*yScale; // mouse units + scaled for sensitivity
          let dyConverted = -elements[i].min+dyScaled*(elements[i].max-elements[i].min) + elements[i].min; // convert to 'value' units
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
      else if (elements[i].type == 'slider' || elements[i].type == 'fader' ){
        if (dragging && currElement==i) {
          elements[i].prev = elements[i].value; // store prev val
          var dy = elements[i].y*globalScale - my.mouseY - ogY;
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
        // let textColor = my.color3;
        // if (currElement == i && dragging){
        //   my.stroke(elements[i].color);
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
        my.stroke(elements[i].color);
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
    if (valuesChanged == true) {redraw();}
  }// draw
  function didValuesChange() {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].prev != elements[i].value) {
        elements[i].prev = elements[i].value; // store prev val
        return true
      }
    }
    //console.log('NO CHANGE xxxxxx')
    return false
  }

  my.mousePressed = function() {
    console.log('click');
    currElement = "none";
    dragging = true; // start dragging
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == "knob" || elements[i].type == 'dial'){
        if (dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rKnob*globalScale*elements[i].size) { 
          ogY = elements[i].y*globalScale - my.mouseY;
          ogValue = elements[i].value;
          currElement = i;
          break
        }
      } 
      else if (elements[i].type == "slider" || elements[i].type == 'fader'){
        if (Math.abs(elements[i].x*globalScale - my.mouseX) <= (sliderWidth*2*globalScale*elements[i].size/2)){
          if (Math.abs(elements[i].y*globalScale - my.mouseY) <= (sliderLength*globalScale*elements[i].size/2+10)){
            ogY = elements[i].y*globalScale - my.mouseY;
            ogValue = -elements[i].value;
            currElement = i;
            break
          }
        }
      } 
      else if (elements[i].type == "toggle"){
        if (dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rBtn*globalScale*elements[i].size) { 
          elements[i].value = 1 - elements[i].value;
          currElement = i;
          break
        }
      }
      else if (elements[i].type == "momentary"){
        if (dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rBtn*globalScale*elements[i].size) { 
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

    this.color = my.color1;

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
        console.log('UPDATE element');
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
        break
      }
      else {
        console.log('NEW element');
      }
    }

    if (update == false){
      let xGap = 15;
      // default default values
      if (x == undefined) {
        x = x0 + elements.length*xGap;
        x = Math.min(x,100);
        x = my.scaleX(x);
      }
      if (y == undefined) { y = my.scaleY(y0);}
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
      elements.push(new UserElement(type,label,mapto,x,y,min,max,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal));
      console.log(elements);
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
  }//removeElement

  my.scaleX = function(val){
    if( val < 0 ) val = 0;
    else if ( val>100 ) val = 100;
    return (val/100) * x_size;
  }
  my.scaleY = function(val){
    if( val < 0 ) val = 0;
    else if ( val>100 ) val = 100;
    return (val/100) * y_size;
  }

  function redraw() { //rdrwwwwwww
    my.background(my.color2);

    my.push();
    my.fill(color(0,255,0));
    my.ellipse(55,55,55,55);
    my.pop();

    my.scale(globalScale);

    // draw grid
    my.push();
    my.fill(my.color3);
    my.noStroke();
    my.textSize(7);
    my.textStyle(NORMAL);
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
    // my.rect(0,0,6,y_size);
    // my.rect(0,0,x_size,6);
    my.stroke(my.color3);
    // for (let i=0; i < vertDivisions.length; i++){
    //     my.line(vertDivisions[i],0,vertDivisions[i],y_size);
    // }
    // for (let i=0; i < horzDivisions.length; i++){
    //     my.line(0, horzDivisions[i], x_size, horzDivisions[i]);
    // }
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
          my.fill(my.color2);  
          my.stroke(my.color2);
          my.ellipse(0, 0, 2.2*rKnob*sz);
          // full arc
          my.strokeCap(SQUARE);
          my.stroke(my.color3);
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
              startCopy = start;
              start = end;
              end = startCopy;
            }
          }
          my.arc(0, 0, 2*rKnob*sz, 2*rKnob*sz,start,end);
          

          // dial lines
          if (elements[i].bipolar == true){
            my.push();
            my.fill(my.color2);
            my.noStroke();
            my.rect(-1.5,0,3,-rKnob*1.1);
            my.pop();
          }
          my.strokeCap(ROUND);
          my.rotate(valueInDegrees);
          my.push();
          my.stroke(my.color2);
          my.strokeWeight(12);
          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          
          // LABEL
          my.push();
          my.fill(my.color3);
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
            my.text(round(elements[i].value,roundto), elements[i].x, elements[i].y+rKnob*sz-2);
          }
          if (elements[i].showLabel == true) {
            my.text(elements[i].label, elements[i].x, elements[i].y+rKnob*sz+13);
          }
          my.pop();
          
          // MAP TO CONTROLS
          //eval(elements[i].mapto +'= ' + elements[i].value + ';'); //old
          eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
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
        my.rectMode(CENTER);  
        // full slider line
        my.strokeCap(SQUARE);
        my.noStroke();
        // background box
        my.fill(my.color2);
        my.rect(0, 0, 15*sz*2, sliderLength*sz*1.4);
        // full line
        my.fill(my.color3);
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
        my.stroke(my.color2);
        my.line(0,.9*sliderLength*sz/2, 0,-.9*sliderLength*sz/2);

        if (elements[i].bipolar == true){
          my.push();
          my.fill(my.color2)
          my.noStroke();
          my.rect(0,0,sliderWidth*1.1,2)
          my.pop();
        }
        // control point
        my.push();
        let sliderKnobSize = 8*sz
        my.fill(my.color1);
        my.stroke(my.color2);
        my.rect(
          0, 
          .95*(sliderLength*sz/2) -.95*convertedVal,
          sliderWidth*2, 
          sliderKnobSize);
        my.pop();

        // LABEL
        my.fill(my.color3);
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
            my.text(round(elements[i].value,roundto), labelY+5,labelX);
          } else {
            my.text(round(elements[i].value,roundto), labelX,labelY);
          }
        }
        my.pop();
        // MAP TO CONTROLS
        eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
      }
    // END SLIDER
    // DRAW TOGGLE BUTTON
      else if (elements[i].type == 'toggle' ){
        my.push(); // ASSUME ON STATE
        let sz = elements[i].size;
        my.translate(elements[i].x, elements[i].y);
        // background circle
        my.fill(my.color2);  
        my.ellipse(0, 0, 2.2*rBtn*sz);
        // setting up color variables
        my.stroke(elements[i].color);
        my.strokeWeight(4);
        let textColor = my.color1;
        if (elements[i].value == 0) { // OFF STATE
          my.stroke(my.color3);
          my.strokeWeight(2);
          textColor = my.color3;
        }
        my.fill(my.color2);
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
        eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
      }
    // END TOGGLE
    // DRAW MOMENTARY BUTTON
      else if (elements[i].type == 'momentary' ){
        my.push(); // ASSUME OFF STATE
        let sz = elements[i].size;
        my.translate(elements[i].x, elements[i].y);
        // background circle
        my.fill(my.color2);  
        my.ellipse(0, 0, 2.2*rBtn*sz);
        // setting up color variables
        my.fill(my.color2);
        my.stroke(my.color3);
        my.strokeWeight(2);
        let textColor = my.color3;
        if (elements[i].value == 1){ // ON STATE
          my.stroke(elements[i].color);
          textColor = my.color1;
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
        eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
      }
    // END MOMENTARY
    // DRAW RADIO BUTTON
      else if (elements[i].type == 'radio'){
        my.push();
        let sz = elements[i].size;
        let rBoxSz = radioBox * sz
        my.translate(elements[i].x, elements[i].y);
        // boxes
        my.fill(my.color3);
        my.stroke(my.color2);
        my.strokeWeight(2);
        let numBoxes = elements[i].radioOptions.length
        let yBoxInit = - Math.floor(numBoxes/2); // y scale for where to start drawing
        if (numBoxes % 2 != 0){
          yBoxInit += -0.5 // extra offset if numBoxes is odd
        }
        // background circle
        my.push();
        my.rectMode(CENTER);
        my.fill(my.color2);  
        my.noStroke();
        my.rect(0, 0, rBoxSz+10*sz,rBoxSz*numBoxes+10*sz);
        my.pop();
        let yBox = yBoxInit;
        for (let j=0; j < numBoxes; j++){
          my.rect(-rBoxSz/2,yBox*rBoxSz,rBoxSz,rBoxSz);
          yBox = yBox + 1; // adjust y scale
        }
        my.textSize(11);
        my.noStroke();
        my.fill(my.color2);
        if (elements[i].showLabel == true) {
          yBox = yBoxInit + 0.5; // reset to original value, add offset to center text
          for (let j=0; j < numBoxes; j++){
            my.text(elements[i].radioOptions[j], 0, yBox*rBoxSz);
            yBox = yBox + 1; // adjust y scale
          }
        }
        // FILL IN ACTIVE BUTTON
        let active = elements[i].value - 1; // adjust for 0-indexing
        yBox = yBoxInit + active;
        my.fill(my.color1);
        my.stroke(my.color2);
        my.strokeWeight(2);
        my.rect(-rBoxSz/2,yBox*rBoxSz,rBoxSz,rBoxSz);
        my.noStroke();
        my.fill(my.color2);
        if (elements[i].showLabel == true) {
          let txt = elements[i].radioOptions[active];
          my.text(txt, 0,(yBox+.5)*rBoxSz);
        }
        my.pop();
        // MAP TO CONTROLS
        eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
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
      color = my.color3;
    }
    //lines.push([x1,y1,x2,y2,stroke,color])

    let type = 'line'
    if (label == null) label = 'line' + lineNumber
    lineNumber+=1
    mapto = 'mapto'
    x=[x1,x2]
    y=[y1,y2]
    let min = 0
    let max = 0
    let size = stroke

    elements.push(new UserElement(type,label,'mapto',x,y,0,0,0,0,size,0,0,0,0,0));

    redraw()

    return elements[elements.length - 1];
  }
  my.lineX = function(x,color) {
    x = my.scaleX(x)
    my.line(x,0,x,y_size)
    if (color === undefined){
      color = my.color3;
    }
    lines.push([x,0,x,y_size,color])
    redraw()
  }

  my.lineY = function(y,color) {
    y = my.scaleY(y)
    my.line(0,y,x_size,y)
    if (color == undefined){
      color = my.color3;
    }
    lines.push([0,y,x_size,y,color])
    redraw()
  }

  my.drawLine = function(i){
    my.stroke( elements[i].color )
    my.strokeWeight( elements[i].size )
    my.line(elements[i].x[0],elements[i].y[0],elements[i].x[1],elements[i].y[1])
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
    console.log()
    // gui.dimRatio = y_size / x_size;
    my.resizeCanvas(x_size, y_size);
    //my.background(100);
    redraw();

    edgeGapX = x_size * (1-globalScale) * 0.5 ;
    edgeGapY = y_size * (1-globalScale) * 0.5 ;
  }//fullscreen
}




var gui = new p5(gui_sketch, document.getElementById('gui_div'));
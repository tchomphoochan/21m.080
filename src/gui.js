//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg
import p5 from 'p5';

let x_size,y_size;
let globalScale = 1;
let fullscreen = false;

const gui_sketch = function(my) {
  // constraining apsect ratio to 2:1 (w:h)
  my.createCanvas(20, 20);
  let divID = my.canvas.parentElement.id;
  let myID = document.getElementById(my.canvas.parentElement.id);
  my.resizeCanvas(myID.width,myID.height)

  //console.log(myID,myID.clientWidth,myID.clientHeight)

  let x_size = document.getElementById(divID).offsetWidth// *.985;
  let y_size = document.getElementById(divID).offsetHeight// *.985;
  let originalSize = y_size;

  my.fitDrawing = function(div){
    x_size = document.getElementById(div).offsetWidth// *.985;
    y_size = document.getElementById(div).offsetHeight// *.985;
    originalSize = y_size;
    my.setup()
  }

  my.setup = function() {
    my.createCanvas(x_size, y_size);

    //slow down draw rate
    my.frameRate(30)

    // my.color VARS
    my.color1 = new guiColor(my.color(255,40,0)); // main color
    my.color2 = my.color(170,176,180); // secondary color
    my.color3 = my.color(220,229,234); // background
    my.color4 = my.color(30); // text

    // DEFAULT STYLING
    my.background(my.color3)
    my.noStroke();
    my.angleMode( my.DEGREES );
    my.textStyle( my.BOLD );
    my.textAlign ( my.CENTER ,  my.CENTER );
    
    // INITIALIZE DRAWING
    setNewDimensions();
    my.redrawGUI();
  }//setup

  // ******** INITIALIZE VARS ******** //
  
  // UI ELEMENTS DEFAULT VALUES
  let dragging = false;
  let currElement = 0;
  let lines = [];
  let masterSensitivity = 1;
  let x0 = 10;
  let y0 = 50;
  // buttons
  let rBtn = 40; // button size
  // slider
  let sliderWidth = 10;
  let sliderLength=100;
  let sliderSensitivity = .008*masterSensitivity;
  // radio
  let radioBox = 30;
  let seqUpdateState = 'ON';
  let seqUpdateStarted = false;
  // knob
  let rKnob = 40; // knob size
  let ogY = 0;
  let ogX = 0;
  let sensitivityScale = 0.006*masterSensitivity; // alters sensitivity of turning the knob
  let ogValue = 0;
  // keybaord
  let keypattern = [0,1,0,1,0,0,1,0,1,0,1,0]; // blackk and white key pattern for an octave
  let keyOn = [false,null]; // state of any key being pressed and element index of keyboard that was pressed
  my.activeKeyboardIndex = null;
  my.keyMapping = [  '49','50','51','52','53','54','55','56','57','48','189','187'] // 1 thru 0 row of keys

//******** my.draw() AND my.redrawGUI() ********//
  my.draw = function() { // only updates values of elements and if they change it calls redrawGUI()
    let valuesChanged = didValuesChange();
    // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    for (let i = 0; i < elements.length; i++) {
    // UPDATE KNOB VALUE
      if (elements[i].type == 'knob' || elements[i].type == 'dial'){
        if (dragging && currElement==i) {
          elements[i].prev = elements[i].value; // store prev val
          let dx = (elements[i].x*globalScale - my.mouseX - ogX) * -1; // mouse units
          let dy = elements[i].y*globalScale - my.mouseY - ogY; // mouse units
          let dxSum = dx**2 * Math.sign(dx)  + dy**2 * Math.sign(dy) 
          let dxAmplitude = Math.sqrt(Math.abs(dxSum)) * Math.sign(dxSum);
          let temp = dxAmplitude * sensitivityScale + ogValue
          //clip to 0-1
          elements[i].value = temp>1 ? 1 : temp<0 ? 0 : temp
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

          //clip to 0-1
          elements[i].value = elements[i].value>1 ? 1 : elements[i].value<0 ? 0 : elements[i].value
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
        // if (elements[i].active == true){
        //   my.activeKeyboardIndex = i;
        //   my.turnOffOtherKeyboards();
        // }
      } 
    }
    if (valuesChanged == true) {my.redrawGUI();}
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

  my.redrawGUI = function() { //can't name it redraw because p5 already has a custom function w that name
    my.background(my.color3);

    my.scale(globalScale);

    if (fullscreen == false){
      // draw grid only on non-fullscreen
      my.push();
      my.fill(30,120);
      my.noStroke();
      my.textSize(.03*y_size);
      my.textStyle( my.NORMAL );
      let yOffset = y_size / (4*globalScale)
      let xOffset = x_size / (4*globalScale)
      let vals = [25,50,75,100];
      my.text(0,6,6)
      for (let i = 1; i < 5; i++) {
        my.text(vals[i-1],x_size*.012 +i*xOffset*.97,6)
      }
      my.textAlign ( my.LEFT ,  my.CENTER );
      for (let i = 1; i < 5; i++) {
        my.text(vals[i-1],1,y_size*.015 +i*yOffset*.97)
      }
      my.stroke(my.color2);
      my.noFill();
      my.rect(0,0,x_size/globalScale,y_size/globalScale);
      my.pop();
    }

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
      // SET CURRENT ELEMENT COLOR
      let currentColor;
      try {
        currentColor = elements[i].color.val;
      } catch (error) {
        currentColor = elements[i].color;
      }
      // DRAW KNOB
      my.fill(currentColor);
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
          my.strokeCap( my.SQUARE    );
          my.stroke(my.color2);
          my.noFill();  
          my.arc(0, 0, 2*rKnob*sz, 2*rKnob*sz,120,60);
          // active arc
          my.stroke(currentColor);
          //keep value from 0-1 here
          let valueNorm = (elements[i].value - elements[i].min) / (elements[i].max-elements[i].min) ; // normalize between 0-1
          //console.log(valueNorm)
          //let valueInDegrees = valueNorm * 300 - 240; // range is -240 to 60 deg
          let valueInDegrees = elements[i].value * 300 - 240; // range is -240 to 60 deg
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
          my.strokeCap( my.ROUND );
          my.rotate(valueInDegrees);
          my.push();
          my.stroke(my.color3);
          my.strokeWeight(12);
          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          my.line(0, 0, rKnob*sz, 0);
          my.pop();
          
          //calc current value
          let scaledValue = scaleOutput( elements[i].value, 0, 1, elements[i].min, elements[i].max, elements[i].curve)
          // LABEL
          my.push();
          my.fill(my.color4);
          my.noStroke();
          if (elements[i].showValue == true) {
            let roundto = 0;
            if (elements[i].max-elements[i].min <= .1) {
              roundto = 3
            } else if (elements[i].max-elements[i].min <= 1) {
              roundto = 2
            } else if (elements[i].max-elements[i].min <= 10) {
              roundto = 1
            }
            scaledValue = my.round(scaledValue,roundto)
            my.textSize(13);
            my.text( scaledValue, elements[i].x, elements[i].y+rKnob*sz-2);
          }
          if (elements[i].showLabel == true) {
            my.text(elements[i].label, elements[i].x, elements[i].y+rKnob*sz+13);
          }
          my.pop();
          
          // MAP TO CONTROLS
          mapToControls(elements[i].mapto, scaledValue, elements[i].callback);
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
        my.rectMode( my.CENTER );  
        // full slider line
        my.strokeCap( my.SQUARE  );
        my.noStroke();
        // background box
        my.fill(my.color3);
        my.rect(0, 0, 15*sz*2, sliderLength*sz*1.4);
        // full line
        my.fill(my.color2);
        my.rect(0, 0,sliderWidth*sz, sliderLength*sz);

        // active line
        my.strokeWeight(sliderWidth*sz);
        my.stroke(currentColor);
        let convertedVal = elements[i].value * sliderLength*sz
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
          my.rect(0,0,sliderWidth*1*sz,2)
          my.pop();
        }
        // control point
        my.push();
        let sliderKnobSize = 8*sz
        my.fill(currentColor);
        my.stroke(my.color3);
        my.rect(
          0, 
          .95*(sliderLength*sz/2) -.95*convertedVal,
          sliderWidth*1.5*sz, 
          sliderKnobSize);
        my.pop();

        // LABEL
        my.fill(my.color4);
        my.noStroke();
        if (elements[i].horizontal == true){
          my.rotate(-90)
        }
        if (elements[i].showLabel == true) {
          let txt = elements[i].label;
          my.textSize((2+sz)*4); // scales text based on num of char
          let labelX = 0;
          let labelY = sliderLength*sz/2+10;
          if (elements[i].horizontal == true){
            my.text(txt, labelY + 25, labelX);
          } else {
            my.text(txt, labelX, labelY + 15);
          }
        }

        //calc current value
        let scaledValue = scaleOutput( elements[i].value, 0, 1, elements[i].min, elements[i].max, elements[i].curve)

        if (elements[i].showValue == true) {
          let roundto = 0;
          if (elements[i].max <= .1) {
            roundto = 3
          } else if (elements[i].max <= 1) {
            roundto = 2
          } else if (elements[i].max <= 10) {
            roundto = 1
          }
          scaledValue = my.round(scaledValue, roundto)

          my.textSize((5+sz)*2); // scales text based on num of char
          let labelX = 0;
          let labelY = sliderLength*sz/2+10;
          if (elements[i].horizontal == true){
            my.text( scaledValue, labelY+5,labelX);
          } else {
            my.text( scaledValue, labelX,labelY);
          }
        }
        my.pop();
        // MAP TO CONTROLS
        mapToControls(elements[i].mapto, scaledValue, elements[i].callback);
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
        my.stroke(currentColor);
        my.strokeWeight(4);
        let textColor = currentColor;
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
        mapToControls(elements[i].mapto, elements[i].value, elements[i].callback);
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
          my.stroke(currentColor);
          textColor = currentColor;
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
        mapToControls(elements[i].mapto, elements[i].value, elements[i].callback);
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
        my.rectMode( my.CENTER );
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
        my.fill(currentColor);
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
        mapToControls(elements[i].mapto, elements[i].value, elements[i].callback);
      }
    // END RADIO
    // DRAW KEYBOARD
      else if (elements[i].type == 'keyboard'){
        // draw element
        my.push();
        my.translate(elements[i].x, elements[i].y);
        if (elements[i].active == true){ // highlight when 'active'
          my.noFill();
          my.stroke(currentColor);
          my.strokeWeight(12);
        }
        my.rect(0,0,elements[i].width,elements[i].height)
        my.fill(255);
        my.stroke(0);
        my.strokeWeight(2);
        let whiteKeyWidth = elements[i].wkWidth;

        let k = 0;
        // WHITE KEYS
        let wCount = 0;
        for (let j = 0; j < elements[i].keys; j++) {
          if (k >= 12) {k = k - 12};
          if (keypattern[k] == 0) {
            my.fill(255);
            if (elements[i].value === my.keyMapping[j]) {
              my.fill(currentColor);
            }
            let xShift = whiteKeyWidth*wCount;
            wCount++;
            my.rect(xShift, 0, whiteKeyWidth, elements[i].height);
          } 
          k++;
        }
        // BLACK KEYS
        let blackKeyOffset = [1,3,6,8,10];
        k = 0;
        let bCount = 0; // how many black keys have been drawn
        for (let j = 0; j < elements[i].keys; j++) {
          if (k >= 12) {k = k - 12};
          if (keypattern[k] == 1) {
            // draw black key
            bCount++;
            // SET EITHER BLACK OR ACTIVE COLOR
            my.fill(0); 
            if (elements[i].value === my.keyMapping[j]) {
              my.fill(currentColor);
            }
            // DRAW KEY RECTANGLE
            let bOctave = Math.floor(bCount/6)
            let xShift = whiteKeyWidth*(7/12)*blackKeyOffset[(bCount-1)%5] + whiteKeyWidth*7*bOctave; 
            my.rect(xShift, 0, (whiteKeyWidth*7/12), elements[i].height*.6);
          }
          k++;
        }
        my.ellipse(0,0,6);
        my.pop();
      }
    }  
  } //redraw

  function mapToControls(mapto, value, cb) {
    //look for method to map to
    let defined = 0

    if(mapto === undefined) {
      defined = 1
    } else{
      try { eval(mapto + '.rampTo(' + value + ', .1)');}
      catch (e) { console.log('invalid mapto', e)}
    }

     if(cb === undefined) {
      defined = 2
    } else{
      try { cb(value) }
      catch (e) { console.log('invalid callback', cb, e)}
    }

    if( defined == 0){ console.log('no mapto or callback defined')}
    
    /*** still thinking about the best way of implementing
    if( mapto.charAt(mapto.length-1) === ')' ){
      try {
        mapto = mapto.slice(0,-1)
        eval(mapto + value + ', .1)');
        //console.log(mapto + (value) + ')')
      //eval(mapto +'= ' + value + ';'); //old
      } catch (error) {
        if (mapto == ""){
        } else {
          console.error("ERROR: invalid 'mapto' variable: "+ mapto);
        }
      }
    } 
    else{ //map to as attribute
      try {
        eval(mapto + '= ' + value + ';'); //old
        //console.log(mapto + '= ' + value + ';')
      } catch (error) {
        if (mapto == ""){
        } else {
          console.error("ERROR: invalid 'mapto' variable: "+ mapto);
        }
      }
    }
    ****/
  } 

//******** MOUSE CLICKS AND KEY PRESSES ********//
  my.mousePressed = function() {
    currElement = "none";
    dragging = true; // start dragging
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == "knob" || elements[i].type == 'dial'){
        if (my.dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rKnob*globalScale*elements[i].size) { 
          ogX = elements[i].x*globalScale - my.mouseX;
          ogY = elements[i].y*globalScale - my.mouseY;
          ogValue = elements[i].value;
          currElement = i;
          //eval(elements[i].callback);
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
            //eval(elements[i].callback);
            break
          }
        }
      } 
      else if (elements[i].type == "toggle"){
        if (my.dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rBtn*globalScale*elements[i].size) { 
          elements[i].value = 1 - elements[i].value;
          currElement = i;
          //eval(elements[i].callback);
          break
        }
      }
      else if (elements[i].type == "momentary"){
        if (my.dist(my.mouseX, my.mouseY, elements[i].x*globalScale, elements[i].y*globalScale) < rBtn*globalScale*elements[i].size) { 
          currElement = i;
          //eval(elements[i].callback);
          break
        }
      }
      else if (elements[i].type == "radio"){
        let scaling = globalScale*elements[i].size
        
        let numBoxes = elements[i].radioOptions.length;
        let boxID = 1;

        if (elements[i].horizontal == true){
          if (Math.abs(elements[i].y*globalScale - my.mouseY) <= (radioBox*scaling/2)){
            let mousePosX = my.mouseX - elements[i].x*globalScale;
            let leftBound = -radioBox*scaling*(numBoxes/2);
            let rightBound = leftBound + radioBox*scaling;
            for (let j=0; j < numBoxes; j++){
              if (leftBound <= mousePosX && mousePosX <= rightBound){
                elements[i].value = boxID;
                //eval(elements[i].callback);
                break
              }
              boxID += 1;
              leftBound += radioBox*scaling;
              rightBound += radioBox*scaling;
            }
          } 
        } 
        else {
          if (Math.abs(elements[i].x*globalScale - my.mouseX) <= (radioBox*scaling/2)){
            let mousePosY = my.mouseY - elements[i].y*globalScale;
            let lowerBound = -radioBox*scaling*(numBoxes/2);
            let upperBound = lowerBound + radioBox*scaling;
            for (let j=0; j < numBoxes; j++){
              if (upperBound >= mousePosY && mousePosY >= lowerBound){
                elements[i].value = boxID;
                //eval(elements[i].callback);
                break
              }
              boxID += 1;
              upperBound += radioBox*scaling;
              lowerBound += radioBox*scaling;
            }
          } 
        }
      }
      else if (elements[i].type == "keyboard"){
        if (my.mouseX >= (elements[i].x) && my.mouseX <= (elements[i].width + elements[i].x)){
          if (my.mouseY >= (elements[i].y) && my.mouseY <= (elements[i].height + elements[i].y)){
            // INSIDE KEYBOARD
            my.activeKeyboardIndex = i;
            elements[i].active = true;
            my.turnOffOtherKeyboards();
            keyboardOn(whichKeyIsClicked(my.activeKeyboardIndex), i);
            currElement = i;
            break
          }
        }
      }
    }
  }// mousePressed

  my.mouseReleased = function() { 
    // Stop dragging
    dragging = false;
    // turn keyboard note off if its on
    if (keyOn[0] == true) {
      keyboardOff();
    }
  }
  window.addEventListener('keydown', keyPressed);

  function keyPressed(e){ // when computer key is pressed
    if (my.activeKeyboardIndex != null && keyOn[0] == false) {
      keyboardOn((e.keyCode).toString(), my.activeKeyboardIndex);
    }
  }
  my.keyReleased = function() { // when computer key is released
    if (keyOn[0] == true) {
      keyboardOff();
    }
  }

//******** GETTING AND SENDING KEYBOARD NOTES ********//
  function whichKeyIsClicked(keyboardIndex) { // returns index of key (0 - numKeys), used for mouse clicks not keypresses
    let i = keyboardIndex;
    let blackKeyPressed = false; // so that pressing a black key doesnt also press the white key "underneath"
    let whiteKeyWidth = elements[i].wkWidth;
    // BLACK KEYS
    let blackKeyOffset = [1,3,6,8,10];
    let k = 0;
    let bCount = 0; // how many black keys have been drawn
    for (let j = 0; j < elements[i].keys; j++) {
      if (k >= 12) {k = k - 12};
      if (keypattern[k] == 1) {
        // check black key
        let bOctave = Math.floor(j/12)
        let xShift = whiteKeyWidth*(7/12)*k + whiteKeyWidth*7*bOctave; 
        if ((elements[i].x+xShift) <= my.mouseX && my.mouseX <= (elements[i].x+xShift+whiteKeyWidth*7/12)) {
          if ((elements[i].y) <= my.mouseY && my.mouseY <= (elements[i].y+elements[i].height*.6)) {
            blackKeyPressed = true;
            return my.keyMapping[j];
          }
        }
      }
      k++;
    }
    // WHITE KEYS
    let wCount = 0;
    k = 0;
    for (let j = 0; j < elements[i].keys; j++) {
      if (k >= 12) {k = k - 12};
      if (keypattern[k] == 0) {
        let xShift = whiteKeyWidth*wCount;
        wCount++;
        if ((elements[i].x+xShift) <= my.mouseX && my.mouseX <= (elements[i].x+xShift+whiteKeyWidth)) {
          if ((elements[i].y) <= my.mouseY && my.mouseY <= (elements[i].y+elements[i].height)) {
            if (blackKeyPressed == false){
                return my.keyMapping[j];
            }
          }
        }
      } 
      k++;
    }
    return "none"
  } // whichKeyIsClicked

  function keyboardOn(keyID, keyboardID) { // handles computer key presses and mouse clicks
    elements[keyboardID].value = keyID; // returns key being pressed
    if (elements[keyboardID].value == undefined) {
      elements[keyboardID].value = 'none';
      console.error("Key Mapping Error: key is not defined in gui.keyMapping array")
      return;
    }
    keyOn = [true,keyboardID];

    // SEND MIDI NOTE ON HERE, key value is elements[keyOn[1]].value, need to convert it to MIDI number though
  }
  function keyboardOff() { // handles end of computer key presses and mouse clicks
    elements[keyOn[1]].value = "none"; // turn off key
    keyOn = [false,null];
    my.redrawGUI();

    // SEND MIDI NOTE OFF HERE, key value is elements[keyOn[1]].value, need to convert it to MIDI number though
  }
  my.turnOffOtherKeyboards = function(all=false){
    if (all == true){
      my.activeKeyboardIndex = null;
    }
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == 'keyboard'){
        if (i != my.activeKeyboardIndex){
          elements[i].active = false;
        }
      }
    }
    if (all == true){
      my.redrawGUI();
    }
  }


//******** Element Custom Objects ********//
  let elements = [];

  let UserElement = function(type,label,mapto,callback,x,y,min=0,max=1,curve=1,value=.5,prev=value,size=1,color=my.color1,showLabel=true,showValue=true,bipolar=false, radioOptions="",horizontal=false) {
    this.type = type; // str: type of element
    this.label = label; // str: name and unique ID

    this.mapto = mapto; // str: variable it is controlling

    if (typeof callback === "function"){
      this.callback = callback; // function
    } else {
      //this.callback = callback(x); // function
    }

    this.x = x; // #: pos
    this.y = y; // #: pos
    this.min = min; // #: units of what its mapped to
    this.max = max; // #; units of what its mapped to
    this.curve = curve; // #; units of what its mapped to
    this.value = value; // #: current value
    this.prev = prev; // #:cprevious value
    this.size = size; // #
    this.color = color; // p5 color() object
    this.showLabel = showLabel; // bool
    this.showValue = showValue; // bool
    
    this.bipolar = bipolar; // bool
    this.radioOptions = radioOptions; // array
    this.horizontal = horizontal; // bool: for slider or radio buttons

    this.position = function(x,y){
      this.x = my.scaleX(x);
      this.y = my.scaleY(y);
      my.redrawGUI();
    }
  }
  
  my.addElement = function(type,label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal) {
    let update = false;
    // for (let i = 0; i < elements.length; i++) {
    //   if (elements[i].label == label) {
    //     update = true;
    //     // UPDATE VALS
    //     if (mapto != undefined) {elements[i].mapto = mapto;}
    //     if (x != undefined) {elements[i].x = my.scaleX(x);}
    //     if (y != undefined) {elements[i].y = my.scaleX(y);}
    //     if (min != undefined) {elements[i].min = min;}
    //     if (max != undefined) {elements[i].max = max;}
    //     if (curve != undefined) {elements[i].curve = curve;}
    //     if (value != undefined) {elements[i].value = value;}
    //     if (size != undefined) {elements[i].size = size;}
    //     if (color != undefined) {elements[i].color = color;}
    //     if (showLabel != undefined) {elements[i].showLabel = showLabel;}
    //     if (showValue != undefined) {elements[i].showValue = showValue;}
    //     if (bipolar != undefined) {elements[i].bipolar = bipolar;}
    //     if (radioOptions != undefined) {elements[i].radioOptions = radioOptions;}
    //     if (horizontal != undefined) {elements[i].horizontal = horizontal;}
    //     elements[i].prev = undefined;
    //     my.redrawGUI();
    //     break
    //   }
    // }
    if (label==undefined){
      console.error("label parameter is undefined")
    } else {
      if (update == false){
        if (x == undefined) {x = x0 + (elements.length%5)*20;}
        if (y == undefined) { y = y0;}
        elements.push(new UserElement(type,label,mapto,callback,my.scaleX(x),my.scaleY(y),min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal));
      }
      my.redrawGUI();
      return elements[elements.length - 1];
    }
  }//addElement

  my.Knob = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    return my.addElement("knob",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.Dial = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    return my.addElement("knob",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.Slider = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    return my.addElement("slider",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.Fader = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    return my.addElement("slider",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.Toggle = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    if (value == undefined) {value=0;}
    return my.addElement("toggle",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.Momentary = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    if (value == undefined) {value=0;}
    return my.addElement("momentary",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.Button = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    if (value == undefined) {value=0;}
    return my.addElement("momentary",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }
  my.RadioButtons = function({label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal}) {
    if (value == undefined) {value=1;}
    return my.addElement("radio",label,mapto,callback,x,y,min,max,curve,value,prev,size,color,showLabel,showValue,bipolar,radioOptions,horizontal);
  }

//******** Element Helper Functions ********//
  my.removeElement = function(label) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        elements.splice(i,1);
      }
    }
    my.redrawGUI();
  }//removeElement

  my.removeElements = function() {
    elements = []
    my.redrawGUI();
  }//removeElements

  // NOT FULLY WORKING !!!
  my.elementGrid = function(type,xcount,ycount) {
    let x0 = 50;
    let y0 = 50;
    for (let i=0; i < xcount; i++){
      for (let j=0; j < ycount; j++){
        let label = "grid"+elements.length+"_"+(i*j+j);
        let value = Math.random()*2
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

//******** Keyboard Element Custom Object ********//
  let Keyboard = function(label,type,mapto,x,y,value,width,height,keys,color,showLabel,wkWidth,active) {
    this.label = label; // str: name and unique ID
    this.type = type; // str: name and unique ID
    this.mapto = mapto; // str: variable it is controlling

    this.x = x; // #: pos left
    this.y = y; // #: pos top
    this.value = value; // str: current key pressed
    this.width = width; // #: w 
    this.height = height; // #: h
    this.keys = keys; // #: current value
    this.color = color; // #
    this.showLabel = showLabel; // bool
    this.wkWidth = wkWidth; // bool
    this.active = active; // bool

    this.position = function(x,y){
      this.x = my.scaleX(x);
      this.y = my.scaleY(y);
      my.redrawGUI();
    }
  }

  my.addKeyboard = function({label,type,mapto,x,y,width,height,keys,color,showLabel,active}) {
    // NEW OR UPDATE EXISTING?
    let update = false;

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        update = true;
        // UPDATE VALS
        if (mapto != undefined) {elements[i].mapto = mapto;}
        if (x != undefined) {elements[i].x = my.scaleX(x);}
        if (y != undefined) {elements[i].y = my.scaleY(y);}
        if (width != undefined) {elements[i].width = my.scaleX(width);}
        if (height != undefined) {elements[i].height = my.scaleY(height);}
        if (keys != undefined) {
          elements[i].keys = keys;
          let numWhiteKeys = calculateNumWhiteKeys(keys);
          elements[i].wkWidth = my.scaleX(width) / numWhiteKeys;
        }
        if (color != undefined) {elements[i].color = color;}
        if (showLabel != undefined) {elements[i].showLabel = showLabel;}
        if (active != undefined) {
          elements[i].active = active;
          if (active == true) {
            my.activeKeyboardIndex = i;
            my.turnOffOtherKeyboards()
          } else {
            my.activeKeyboardIndex = null;
          }
        }
        my.redrawGUI();
        break
      }
    }

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
      if (active == undefined) {active=false;}
      let numWhiteKeys = calculateNumWhiteKeys(keys);
      let wkWidth = my.scaleX(width) / numWhiteKeys;
      let value = null;
      elements.push(new Keyboard(label,type,mapto,my.scaleX(x),my.scaleY(y),value,my.scaleX(width),my.scaleY(height),keys,color,showLabel,wkWidth,active));
    }
    my.redrawGUI();
    return elements[elements.length - 1];

    function calculateNumWhiteKeys(keys){
      let numWhiteKeys = 0;
      let k = 0;
      for (let j=0; j < keys; j++) {
        if (k >= 12) {k = k - 12};
        if (keypattern[k] == 0) {
          numWhiteKeys++;
        }
        k++
      }
      return numWhiteKeys
    }
  }//addKeyboard

//******** LINES ********//
  let lineNumber = 0
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
    my.redrawGUI()
    return elements[elements.length - 1];
  } //line2
  my.lineX = function(x,color) {
    x = my.scaleX(x)
    my.line(x,0,x,y_size)
    if (color === undefined){
      color = my.color2;
    }
    lines.push([x,0,x,y_size,color])
    my.redrawGUI()
  }
  my.lineY = function(y,color) {
    y = my.scaleY(y)
    my.line(0,y,x_size,y)
    if (color == undefined){
      color = my.color2;
    }
    lines.push([0,y,x_size,y,color])
    my.redrawGUI()
  }
  my.drawLine = function(i){
    // SET COLOR
    let currentColor;
    try {
      currentColor = elements[i].color.val;
    } catch (error) {
      currentColor = elements[i].color;
    }
    my.stroke( currentColor )
    my.strokeWeight( elements[i].size )
    my.line(elements[i].x[0],elements[i].y[0],elements[i].x[1],elements[i].y[1])
  }



//******** SCALING & FULLSCREEN ********//

  my.fullscreenGUI = function(){
    if (fullscreen){
      //reset
      document.getElementById(divID).style.top = "2%";
      document.getElementById(divID).style.right = "2";
      document.getElementById(divID).style.width = "49%";
      document.getElementById(divID).style.height = "32%";
      fullscreen = false
    } else {
      //make fs
      document.getElementById(divID).style.top = "4%";
      document.getElementById(divID).style.right = ".5%";
      document.getElementById(divID).style.width = "99%";
      document.getElementById(divID).style.height = "96%";
      document.getElementById(divID).style.background = "white";
      fullscreen = true
    }
    setNewDimensions();
  }//fullscreen

  window.addEventListener('resize', function(event) {
    setNewDimensions();
  }, true); 

  function setNewDimensions() {
    // keeps aspect ratio at 2:1 and determines if height or width is constraining dimension in div
    x_size = document.getElementById(divID).offsetWidth;
    y_size = document.getElementById(divID).offsetHeight;
    if (2*y_size > x_size) {
      x_size = document.getElementById(divID).offsetWidth;
      y_size = .5 * x_size;
    } else {
      x_size = 2 * y_size;
    }
    let newSize = y_size;
    let deltaSize = newSize / originalSize;
    my.resizeCanvas(x_size, y_size);
    globalScale = deltaSize;
    my.redrawGUI();
  }


//******** USER CUSTOMIZATION ********//
  my.sensitivity = function(masterSensitivity=1){
    // 1 is default, <1 makes it less sensitive, >1 more sensitive
    sliderSensitivity = .008*masterSensitivity;
    sensitivityScale = .006*masterSensitivity; 
  }
  let guiColor = function(val) {
    // color Object so it can be referenced and then update on all elements
    this.val = val; 
  }
  my.setColor1 = function(r,g,b,a){
    if (g==undefined){
      my.color1.val = my.color(r);
    }
    else if (a==undefined){
      my.color1.val = my.color(r,g,b);
    } else {
      my.color1.val = my.color(r,g,b,a);
    }
    my.redrawGUI();
  }
  my.setColor2 = function(r,g,b,a){
    if (g==undefined){
      my.color2 = my.color(r);
    }
    else if (a==undefined){
      my.color2 = my.color(r,g,b);
    } else {
      my.color2 = my.color(r,g,b,a);
    }
    my.redrawGUI();
  }
  my.setBackgroundColor = function(r,g,b,a){
    if (g==undefined){
      my.color3 = my.color(r);
    }
    else if (a==undefined){
      my.color3 = my.color(r,g,b);
    } else {
      my.color3 = my.color(r,g,b,a);
    }
    my.redrawGUI();
  }
  my.setTextColor = function(r,g,b,a){
    if (g==undefined){
      my.color4 = my.color(r);
    }
    else if (a==undefined){
      my.color4 = my.color(r,g,b);
    } else {
      my.color4 = my.color(r,g,b,a);
    }
    my.redrawGUI();
  }

//******** OTHER ********//
  const scaleOutput = function(input,inLow,inHigh,outLow,outHigh,curve){
    if( curve === undefined ) curve = 1;
    let val = (input-inLow) * (1/(inHigh-inLow));
    val = Math.pow(val, curve);
    return val*(outHigh-outLow) + outLow;
  }
} // END OF GUI p5 INSTANCE

export default gui_sketch;
//example of P5.js code in p mode
//https://youtu.be/Su792jEauZg
import p5 from 'p5';

let globalScale = 1;
let fullscreen = false;


const gui_sketch = function (p) {
  // constraining apsect ratio to 2:1 (w:h)
  p.createCanvas();
  let div = p.canvas.parentElement;
  let width = div.width;
  let height = div.height;
  p.elements = {};

  p.windowResized = function () {
    let prevWidth = width;
    let prevHeight = height;
    width = div.offsetWidth;
    height = div.offsetHeight;
    let scaleWidth = width / prevWidth;
    let scaleHeight = height / prevHeight;
    p.resizeCanvas(width, height);
    p.background(p.color3);
    for (let element of Object.values(p.elements)) {
      console.log(element);
      p.scale(scaleWidth, scaleHeight);
      eval(element);
    }
  };

  p.setup = function () {
    p.createCanvas(div.offsetWidth, div.offsetHeight);

    //slow down draw rate
    p.frameRate(30)

    // p.color VARS
    p.color1 = new guiColor(p.color(255, 40, 0)); // main color
    p.color2 = p.color(170, 176, 180); // secondary color
    p.color3 = p.color(220, 229, 234); // background
    p.color4 = p.color(30); // text

    // DEFAULT STYLING
    p.background(p.color3);
    p.noStroke();
    //p.angleMode(p.DEGREES);
    p.textStyle(p.BOLD);
    //p.textAlign(p.CENTER, p.CENTER); remove!

    // INITIALIZE DRAWING unneccessary
    //setNewDimensions();
    //p.redrawGUI();
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
  let sliderLength = 100;
  let sliderSensitivity = .008 * masterSensitivity;
  // radio
  let radioBox = 30;
  let seqUpdateState = 'ON';
  let seqUpdateStarted = false;
  // knob
  let rKnob = 40; // knob size
  let ogY = 0;
  let ogX = 0;
  let sensitivityScale = 0.006 * masterSensitivity; // alters sensitivity of turning the knob
  let ogValue = 0;
  // keybaord
  let keypattern = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]; // blackk and white key pattern for an octave
  let keyOn = [false, null]; // state of any key being pressed and element index of keyboard that was pressed
  p.activeKeyboardIndex = null;
  p.keyMapping = ['49', '50', '51', '52', '53', '54', '55', '56', '57', '48', '189', '187'] // 1 thru 0 row of keys

  //******** p.draw() AND p.redrawGUI() ********//
  p.draw = function () { // only updates values of elements and if they change it calls redrawGUI()
    //draw elements
    for (let element of Object.values(elements)) {
      try {
        element.draw();
      } catch {
        //not our element
      }
    }
    let valuesChanged = didValuesChange();
    // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    for (let i = 0; i < elements.length; i++) {
      // UPDATE KNOB VALUE
      if (elements[i].type == 'knob' || elements[i].type == 'dial') {
        if (dragging && currElement == i) {
          elements[i].prev = elements[i].value; // store prev val
          let dx = (elements[i].x * globalScale - p.mouseX - ogX) * -1; // mouse units
          let dy = elements[i].y * globalScale - p.mouseY - ogY; // mouse units
          let dxSum = dx ** 2 * Math.sign(dx) + dy ** 2 * Math.sign(dy)
          let dxAmplitude = Math.sqrt(Math.abs(dxSum)) * Math.sign(dxSum);
          let temp = dxAmplitude * sensitivityScale + ogValue
          //clip to 0-1
          elements[i].value = temp > 1 ? 1 : temp < 0 ? 0 : temp
        }
      }
      // UPDATE SLIDER VALUE
      else if (elements[i].type == 'slider' || elements[i].type == 'fader') {
        if (dragging && currElement == i) {
          elements[i].prev = elements[i].value; // store prev val
          let dx = elements[i].x * globalScale - p.mouseX - ogX; // mouse units
          var dy = elements[i].y * globalScale - p.mouseY - ogY; // mouse units
          let dxScaled = -dx * (sliderSensitivity / elements[i].size); // mouse units + scaled for sensitivity
          let dyScaled = dy * (sliderSensitivity / elements[i].size); // mouse units + scaled for sensitivity

          elements[i].value = dxScaled + dyScaled - ogValue; // update value

          //clip to 0-1
          elements[i].value = elements[i].value > 1 ? 1 : elements[i].value < 0 ? 0 : elements[i].value
        }
      }

      // TOGGLE VALUE GETS UPDATED IN mousePressed()
      else if (elements[i].type == 'toggle') {
        elements[i].prev = elements[i].value; // store prev val
      }

      // UPDATE MOMENTARY BUTTON VALUE
      else if (elements[i].type == 'momentary') {
        elements[i].prev = elements[i].value; // store prev val
        if (currElement == i && dragging) {
          elements[i].value = 1;
        } else {
          elements[i].value = 0;
        }
      }
      // RADIO BUTTON VALUE GETS UPDATED IN mousePressed()
      else if (elements[i].type == 'radio') {
        elements[i].prev = elements[i].value; // store prev val
      }
      // UPDATE KEYBOARD VALUES
      else if (elements[i].type == 'keyboard') {
        // if (elements[i].active == true){
        //   p.activeKeyboardIndex = i;
        //   p.turnOffOtherKeyboards();
        // }
      }
    }
    if (valuesChanged == true) { p.redrawGUI(); }
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

  // p.redrawGUI = function () { //can't name it redraw because p5 already has a custom function w that name
  //   p.background(p.color3);

  //   p.scale(globalScale);

  //   if (fullscreen == false) {
  //     // draw grid only on non-fullscreen
  //     p.push();
  //     p.fill(30, 120);
  //     p.noStroke();
  //     p.textSize(.03 * y_size);
  //     p.textStyle(p.NORMAL);
  //     let yOffset = y_size / (4 * globalScale)
  //     let xOffset = x_size / (4 * globalScale)
  //     let vals = [25, 50, 75, 100];
  //     p.text(0, 6, 6)
  //     for (let i = 1; i < 5; i++) {
  //       p.text(vals[i - 1], x_size * .012 + i * xOffset * .97, 6)
  //     }
  //     p.textAlign(p.LEFT, p.CENTER);
  //     for (let i = 1; i < 5; i++) {
  //       p.text(vals[i - 1], 1, y_size * .015 + i * yOffset * .97)
  //     }
  //     p.stroke(p.color2);
  //     p.noFill();
  //     p.rect(0, 0, x_size / globalScale, y_size / globalScale);
  //     p.pop();
  //   }

  //   //divisions
  //   p.push();
  //   p.stroke(p.color2);
  //   for (let i = 0; i < lines.length; i++) {
  //     let a = lines[i][0];
  //     let b = lines[i][1];
  //     let c = lines[i][2];
  //     let d = lines[i][3];
  //     p.push();
  //     p.stroke(lines[i][4]);
  //     p.line(a, b, c, d);
  //     p.pop();
  //   }
  //   p.pop();

  //   for (let i = 0; i < elements.length; i++) {
  //     // SET CURRENT ELEMENT COLOR
  //     let currentColor;
  //     try {
  //       currentColor = elements[i].color.val;
  //     } catch (error) {
  //       currentColor = elements[i].color;
  //     }
  //     // DRAW KNOB
  //     p.fill(currentColor);
  //     if (elements[i].type == 'line') p.drawLine(i)
  //     else if (elements[i].type == 'knob' || elements[i].type == 'dial') {
  //       p.push();
  //       p.translate(elements[i].x, elements[i].y);
  //       let sz = elements[i].size;
  //       // background circle
  //       p.strokeWeight(6);
  //       p.fill(p.color3);
  //       p.stroke(p.color3);
  //       p.ellipse(0, 0, 2.2 * rKnob * sz);
  //       // full arc
  //       p.strokeCap(p.SQUARE);
  //       p.stroke(p.color2);
  //       p.noFill();
  //       p.arc(0, 0, 2 * rKnob * sz, 2 * rKnob * sz, 120, 60);
  //       // active arc
  //       p.stroke(currentColor);
  //       //keep value from 0-1 here
  //       let valueNorm = (elements[i].value - elements[i].min) / (elements[i].max - elements[i].min); // normalize between 0-1
  //       //console.log(valueNorm)
  //       //let valueInDegrees = valueNorm * 300 - 240; // range is -240 to 60 deg
  //       let valueInDegrees = elements[i].value * 300 - 240; // range is -240 to 60 deg
  //       let bipolarOffset = 0;
  //       let start = 120;
  //       let end = valueInDegrees + .01
  //       if (elements[i].bipolar == true) {
  //         start = 270;
  //         if (end < -90) {
  //           let startCopy = start;
  //           start = end;
  //           end = startCopy;
  //         }
  //       }
  //       p.arc(0, 0, 2 * rKnob * sz, 2 * rKnob * sz, start, end);

  //       // dial lines
  //       if (elements[i].bipolar == true) {
  //         p.push();
  //         p.fill(p.color3);
  //         p.noStroke();
  //         p.rect(-1.5, 0, 3, -rKnob * 1.1);
  //         p.pop();
  //       }
  //       p.strokeCap(p.ROUND);
  //       p.rotate(valueInDegrees);
  //       p.push();
  //       p.stroke(p.color3);
  //       p.strokeWeight(12);
  //       p.line(0, 0, rKnob * sz, 0);
  //       p.pop();
  //       p.line(0, 0, rKnob * sz, 0);
  //       p.pop();

  //       //calc current value
  //       let scaledValue = scaleOutput(elements[i].value, 0, 1, elements[i].min, elements[i].max, elements[i].curve)
  //       // LABEL
  //       p.push();
  //       p.fill(p.color4);
  //       p.noStroke();
  //       if (elements[i].showValue == true) {
  //         let roundto = 0;
  //         if (elements[i].max - elements[i].min <= .1) {
  //           roundto = 3
  //         } else if (elements[i].max - elements[i].min <= 1) {
  //           roundto = 2
  //         } else if (elements[i].max - elements[i].min <= 10) {
  //           roundto = 1
  //         }
  //         scaledValue = p.round(scaledValue, roundto)
  //         p.textSize(13);
  //         p.text(scaledValue, elements[i].x, elements[i].y + rKnob * sz - 2);
  //       }
  //       if (elements[i].showLabel == true) {
  //         p.text(elements[i].label, elements[i].x, elements[i].y + rKnob * sz + 13);
  //       }
  //       p.pop();

  //       // MAP TO CONTROLS
  //       mapToControls(elements[i].mapto, scaledValue);
  //     }
  //     // END KNOB
  //     // DRAW SLIDER
  //     else if (elements[i].type == 'slider' || elements[i].type == 'fader') {
  //       p.push();
  //       let sz = elements[i].size;
  //       p.translate(elements[i].x, elements[i].y);
  //       if (elements[i].horizontal == true) {
  //         p.rotate(90);
  //       }
  //       p.rectMode(p.CENTER);
  //       // full slider line
  //       p.strokeCap(p.SQUARE);
  //       p.noStroke();
  //       // background box
  //       p.fill(p.color3);
  //       p.rect(0, 0, 15 * sz * 2, sliderLength * sz * 1.4);
  //       // full line
  //       p.fill(p.color2);
  //       p.rect(0, 0, sliderWidth * sz, sliderLength * sz);

  //       // active line
  //       p.strokeWeight(sliderWidth * sz);
  //       p.stroke(currentColor);
  //       let convertedVal = elements[i].value * sliderLength * sz
  //       let bipolarOffset = 0;

  //       if (elements[i].bipolar == true) {
  //         bipolarOffset = sliderLength * sz / 2;
  //       }
  //       p.line(0, sliderLength * sz / 2 - bipolarOffset, 0, sliderLength * sz / 2 - convertedVal);

  //       // middle line
  //       p.strokeWeight(2 * sz);
  //       p.stroke(p.color3);
  //       p.line(0, .9 * sliderLength * sz / 2, 0, -.9 * sliderLength * sz / 2);

  //       if (elements[i].bipolar == true) {
  //         p.push();
  //         p.fill(p.color3)
  //         p.noStroke();
  //         p.rect(0, 0, sliderWidth * 1 * sz, 2)
  //         p.pop();
  //       }
  //       // control point
  //       p.push();
  //       let sliderKnobSize = 8 * sz
  //       p.fill(currentColor);
  //       p.stroke(p.color3);
  //       p.rect(
  //         0,
  //         .95 * (sliderLength * sz / 2) - .95 * convertedVal,
  //         sliderWidth * 1.5 * sz,
  //         sliderKnobSize);
  //       p.pop();

  //       // LABEL
  //       p.fill(p.color4);
  //       p.noStroke();
  //       if (elements[i].horizontal == true) {
  //         p.rotate(-90)
  //       }
  //       if (elements[i].showLabel == true) {
  //         let txt = elements[i].label;
  //         p.textSize((2 + sz) * 4); // scales text based on num of char
  //         let labelX = 0;
  //         let labelY = -sliderLength * sz / 2 - 10;
  //         if (elements[i].horizontal == true) {
  //           p.text(txt, labelY - 5, labelX);
  //         } else {
  //           p.text(txt, labelX, labelY);
  //         }
  //       }

  //       //calc current value
  //       let scaledValue = scaleOutput(elements[i].value, 0, 1, elements[i].min, elements[i].max, elements[i].curve)

  //       if (elements[i].showValue == true) {
  //         let roundto = 0;
  //         if (elements[i].max <= .1) {
  //           roundto = 3
  //         } else if (elements[i].max <= 1) {
  //           roundto = 2
  //         } else if (elements[i].max <= 10) {
  //           roundto = 1
  //         }
  //         scaledValue = p.round(scaledValue, roundto)

  //         p.textSize((5 + sz) * 2); // scales text based on num of char
  //         let labelX = 0;
  //         let labelY = sliderLength * sz / 2 + 10;
  //         if (elements[i].horizontal == true) {
  //           p.text(scaledValue, labelY + 5, labelX);
  //         } else {
  //           p.text(scaledValue, labelX, labelY);
  //         }
  //       }
  //       p.pop();
  //       // MAP TO CONTROLS
  //       mapToControls(elements[i].mapto, scaledValue);
  //     }
  //     // END SLIDER
  //     // DRAW TOGGLE BUTTON
  //     else if (elements[i].type == 'toggle') {
  //       p.push(); // ASSUME ON STATE
  //       let sz = elements[i].size;
  //       p.translate(elements[i].x, elements[i].y);
  //       // background circle
  //       p.fill(p.color3);
  //       p.ellipse(0, 0, 2.2 * rBtn * sz);
  //       // setting up color variables
  //       p.stroke(currentColor);
  //       p.strokeWeight(4);
  //       let textColor = currentColor;
  //       if (elements[i].value == 0) { // OFF STATE
  //         p.stroke(p.color2);
  //         p.strokeWeight(2);
  //         textColor = p.color2;
  //       }
  //       p.fill(p.color3);
  //       p.ellipse(0, 0, sz * rBtn * 2, sz * rBtn * 2);
  //       p.fill(textColor);
  //       p.noStroke();
  //       if (elements[i].showLabel == true) {
  //         let toggleText = elements[i].label;
  //         p.textSize(sz * 85 / toggleText.length); // scales text based on num of chars
  //         p.text(toggleText, 0, 1);
  //       }
  //       p.pop();
  //       // MAP TO CONTROLS
  //       mapToControls(elements[i].mapto, elements[i].value);
  //     }
  //     // END TOGGLE
  //     // DRAW MOMENTARY BUTTON
  //     else if (elements[i].type == 'momentary') {
  //       p.push(); // ASSUME OFF STATE
  //       let sz = elements[i].size;
  //       p.translate(elements[i].x, elements[i].y);
  //       // background circle
  //       p.fill(p.color3);
  //       p.ellipse(0, 0, 2.2 * rBtn * sz);
  //       // setting up color variables
  //       p.fill(p.color3);
  //       p.stroke(p.color2);
  //       p.strokeWeight(2);
  //       let textColor = p.color2;
  //       if (elements[i].value == 1) { // ON STATE
  //         p.stroke(currentColor);
  //         textColor = currentColor;
  //         p.strokeWeight(4);
  //       }
  //       p.ellipse(0, 0, sz * rBtn * 2, sz * rBtn * 2);
  //       p.fill(textColor);
  //       p.noStroke();
  //       if (elements[i].showLabel == true) {
  //         let text = elements[i].label;
  //         p.textSize(sz * 85 / text.length); // scales text based on num of chars
  //         p.text(text, 0, 1);
  //       }
  //       p.pop();
  //       // MAP TO CONTROLS
  //       mapToControls(elements[i].mapto, elements[i].value);
  //     }
  //     // END MOMENTARY
  //     // DRAW RADIO BUTTON
  //     else if (elements[i].type == 'radio') {
  //       p.push();
  //       let sz = elements[i].size;
  //       let rBoxSz = radioBox * sz;
  //       p.translate(elements[i].x, elements[i].y);
  //       // boxes
  //       p.fill(p.color2);
  //       p.stroke(p.color3);
  //       p.strokeWeight(2);
  //       let numBoxes = elements[i].radioOptions.length
  //       let yBoxInit = - Math.floor(numBoxes / 2); // y scale for where to start drawing
  //       if (numBoxes % 2 != 0) {
  //         yBoxInit += -0.5 // extra offset if numBoxes is odd
  //       }
  //       // background rect
  //       p.push();
  //       p.rectMode(p.CENTER);
  //       p.fill(p.color3);
  //       p.noStroke();
  //       p.rect(0, 0, rBoxSz + 10 * sz, rBoxSz * numBoxes + 10 * sz);
  //       p.pop();
  //       // DRAW BOXES
  //       let yBox = yBoxInit;
  //       for (let j = 0; j < numBoxes; j++) {
  //         let x = -rBoxSz / 2;
  //         let y = yBox * rBoxSz;
  //         if (elements[i].horizontal == true) {
  //           x = y;
  //           y = -rBoxSz / 2;
  //         }
  //         p.rect(x, y, rBoxSz, rBoxSz);
  //         yBox = yBox + 1; // adjust y scale
  //       }
  //       // BOX LABELS
  //       p.textSize(11);
  //       p.noStroke();
  //       p.fill(p.color3);
  //       if (elements[i].showLabel == true) {
  //         yBox = yBoxInit + 0.5; // reset to original value, add offset to center text
  //         for (let j = 0; j < numBoxes; j++) {
  //           let x = 0;
  //           let y = yBox * rBoxSz;
  //           if (elements[i].horizontal == true) {
  //             x = y;
  //             y = 0;
  //           }
  //           p.text(elements[i].radioOptions[j], x, y);
  //           yBox = yBox + 1; // adjust y scale
  //         }
  //       }
  //       // FILL IN ACTIVE BUTTON
  //       let active = elements[i].value - 1; // adjust for 0-indexing
  //       yBox = yBoxInit + active;
  //       p.fill(currentColor);
  //       p.stroke(p.color3);
  //       p.strokeWeight(2);
  //       let x = -rBoxSz / 2;
  //       let y = yBox * rBoxSz;
  //       if (elements[i].horizontal == true) {
  //         x = y;
  //         y = -rBoxSz / 2;
  //       }
  //       p.rect(x, y, rBoxSz, rBoxSz);
  //       p.noStroke();
  //       p.fill(p.color3);
  //       if (elements[i].showLabel == true) {
  //         let txt = elements[i].radioOptions[active];
  //         let x = 0;
  //         let y = (yBox + .5) * rBoxSz;
  //         if (elements[i].horizontal == true) {
  //           x = y;
  //           y = 0;
  //         }
  //         p.text(txt, x, y);
  //       }
  //       p.pop();
  //       // MAP TO CONTROLS
  //       mapToControls(elements[i].mapto, elements[i].value);
  //     }
  //     // END RADIO
  //     // DRAW KEYBOARD
  //     else if (elements[i].type == 'keyboard') {
  //       // draw element
  //       p.push();
  //       p.translate(elements[i].x, elements[i].y);
  //       if (elements[i].active == true) { // highlight when 'active'
  //         p.noFill();
  //         p.stroke(currentColor);
  //         p.strokeWeight(12);
  //       }
  //       p.rect(0, 0, elements[i].width, elements[i].height)
  //       p.fill(255);
  //       p.stroke(0);
  //       p.strokeWeight(2);
  //       let whiteKeyWidth = elements[i].wkWidth;

  //       let k = 0;
  //       // WHITE KEYS
  //       let wCount = 0;
  //       for (let j = 0; j < elements[i].keys; j++) {
  //         if (k >= 12) { k = k - 12 };
  //         if (keypattern[k] == 0) {
  //           p.fill(255);
  //           if (elements[i].value === p.keyMapping[j]) {
  //             p.fill(currentColor);
  //           }
  //           let xShift = whiteKeyWidth * wCount;
  //           wCount++;
  //           p.rect(xShift, 0, whiteKeyWidth, elements[i].height);
  //         }
  //         k++;
  //       }
  //       // BLACK KEYS
  //       let blackKeyOffset = [1, 3, 6, 8, 10];
  //       k = 0;
  //       let bCount = 0; // how many black keys have been drawn
  //       for (let j = 0; j < elements[i].keys; j++) {
  //         if (k >= 12) { k = k - 12 };
  //         if (keypattern[k] == 1) {
  //           // draw black key
  //           bCount++;
  //           // SET EITHER BLACK OR ACTIVE COLOR
  //           p.fill(0);
  //           if (elements[i].value === p.keyMapping[j]) {
  //             p.fill(currentColor);
  //           }
  //           // DRAW KEY RECTANGLE
  //           let bOctave = Math.floor(bCount / 6)
  //           let xShift = whiteKeyWidth * (7 / 12) * blackKeyOffset[(bCount - 1) % 5] + whiteKeyWidth * 7 * bOctave;
  //           p.rect(xShift, 0, (whiteKeyWidth * 7 / 12), elements[i].height * .6);
  //         }
  //         k++;
  //       }
  //       p.ellipse(0, 0, 6);
  //       p.pop();
  //     }
  //   }
  // } //redraw

  function mapToControls(mapto, value) {
    //look for method to map to
    if (mapto.charAt(mapto.length - 1) === ')') {
      try {
        mapto = mapto.slice(0, -1)
        eval(mapto + value + ', .1)');
        //console.log(mapto + (value) + ')')
        //eval(mapto +'= ' + value + ';'); //old
      } catch (error) {
        if (mapto == "") {
        } else {
          console.error("ERROR: invalid 'mapto' variable: " + mapto);
        }
      }
    }
    else { //map to as attribute
      try {
        eval(mapto + '= ' + value + ';'); //old
        //console.log(mapto + '= ' + value + ';')
      } catch (error) {
        if (mapto == "") {
        } else {
          console.error("ERROR: invalid 'mapto' variable: " + mapto);
        }
      }
    }
  }

  //******** MOUSE CLICKS AND KEY PRESSES ********//
  p.mousePressed = function () {
    currElement = "none";
    dragging = true; // start dragging
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == "knob" || elements[i].type == 'dial') {
        if (p.dist(p.mouseX, p.mouseY, elements[i].x * globalScale, elements[i].y * globalScale) < rKnob * globalScale * elements[i].size) {
          ogX = elements[i].x * globalScale - p.mouseX;
          ogY = elements[i].y * globalScale - p.mouseY;
          ogValue = elements[i].value;
          currElement = i;
          eval(elements[i].callback);
          break
        }
      }
      else if (elements[i].type == "slider" || elements[i].type == 'fader') {
        let horizontalDim = sliderWidth * 2 * globalScale * elements[i].size / 2;
        let verticalDim = sliderLength * globalScale * elements[i].size / 2 + 10;
        if (elements[i].horizontal == true) {
          horizontalDim = sliderLength * globalScale * elements[i].size / 2 + 10;
          verticalDim = sliderWidth * 2 * globalScale * elements[i].size / 2;
        }
        if (Math.abs(elements[i].x * globalScale - p.mouseX) <= (horizontalDim)) {
          if (Math.abs(elements[i].y * globalScale - p.mouseY) <= (verticalDim)) {
            ogX = elements[i].x * globalScale - p.mouseX;
            ogY = elements[i].y * globalScale - p.mouseY;
            ogValue = -elements[i].value;
            currElement = i;
            eval(elements[i].callback);
            break
          }
        }
      }
      else if (elements[i].type == "toggle") {
        if (p.dist(p.mouseX, p.mouseY, elements[i].x * globalScale, elements[i].y * globalScale) < rBtn * globalScale * elements[i].size) {
          elements[i].value = 1 - elements[i].value;
          currElement = i;
          eval(elements[i].callback);
          break
        }
      }
      else if (elements[i].type == "momentary") {
        if (p.dist(p.mouseX, p.mouseY, elements[i].x * globalScale, elements[i].y * globalScale) < rBtn * globalScale * elements[i].size) {
          currElement = i;
          eval(elements[i].callback);
          break
        }
      }
      else if (elements[i].type == "radio") {
        let scaling = globalScale * elements[i].size

        let numBoxes = elements[i].radioOptions.length;
        let boxID = 1;

        if (elements[i].horizontal == true) {
          if (Math.abs(elements[i].y * globalScale - p.mouseY) <= (radioBox * scaling / 2)) {
            let mousePosX = p.mouseX - elements[i].x * globalScale;
            let leftBound = -radioBox * scaling * (numBoxes / 2);
            let rightBound = leftBound + radioBox * scaling;
            for (let j = 0; j < numBoxes; j++) {
              if (leftBound <= mousePosX && mousePosX <= rightBound) {
                elements[i].value = boxID;
                eval(elements[i].callback);
                break
              }
              boxID += 1;
              leftBound += radioBox * scaling;
              rightBound += radioBox * scaling;
            }
          }
        }
        else {
          if (Math.abs(elements[i].x * globalScale - p.mouseX) <= (radioBox * scaling / 2)) {
            let mousePosY = p.mouseY - elements[i].y * globalScale;
            let lowerBound = -radioBox * scaling * (numBoxes / 2);
            let upperBound = lowerBound + radioBox * scaling;
            for (let j = 0; j < numBoxes; j++) {
              if (upperBound >= mousePosY && mousePosY >= lowerBound) {
                elements[i].value = boxID;
                eval(elements[i].callback);
                break
              }
              boxID += 1;
              upperBound += radioBox * scaling;
              lowerBound += radioBox * scaling;
            }
          }
        }
      }
      else if (elements[i].type == "keyboard") {
        if (p.mouseX >= (elements[i].x) && p.mouseX <= (elements[i].width + elements[i].x)) {
          if (p.mouseY >= (elements[i].y) && p.mouseY <= (elements[i].height + elements[i].y)) {
            // INSIDE KEYBOARD
            p.activeKeyboardIndex = i;
            elements[i].active = true;
            p.turnOffOtherKeyboards();
            keyboardOn(whichKeyIsClicked(p.activeKeyboardIndex), i);
            currElement = i;
            break
          }
        }
      }
    }
  }// mousePressed

  p.mouseReleased = function () {
    // Stop dragging
    dragging = false;
    // turn keyboard note off if its on
    if (keyOn[0] == true) {
      keyboardOff();
    }
  }
  window.addEventListener('keydown', keyPressed);

  function keyPressed(e) { // when computer key is pressed
    if (p.activeKeyboardIndex != null && keyOn[0] == false) {
      keyboardOn((e.keyCode).toString(), p.activeKeyboardIndex);
    }
  }
  p.keyReleased = function () { // when computer key is released
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
    let blackKeyOffset = [1, 3, 6, 8, 10];
    let k = 0;
    let bCount = 0; // how many black keys have been drawn
    for (let j = 0; j < elements[i].keys; j++) {
      if (k >= 12) { k = k - 12 };
      if (keypattern[k] == 1) {
        // check black key
        let bOctave = Math.floor(j / 12)
        let xShift = whiteKeyWidth * (7 / 12) * k + whiteKeyWidth * 7 * bOctave;
        if ((elements[i].x + xShift) <= p.mouseX && p.mouseX <= (elements[i].x + xShift + whiteKeyWidth * 7 / 12)) {
          if ((elements[i].y) <= p.mouseY && p.mouseY <= (elements[i].y + elements[i].height * .6)) {
            blackKeyPressed = true;
            return p.keyMapping[j];
          }
        }
      }
      k++;
    }
    // WHITE KEYS
    let wCount = 0;
    k = 0;
    for (let j = 0; j < elements[i].keys; j++) {
      if (k >= 12) { k = k - 12 };
      if (keypattern[k] == 0) {
        let xShift = whiteKeyWidth * wCount;
        wCount++;
        if ((elements[i].x + xShift) <= p.mouseX && p.mouseX <= (elements[i].x + xShift + whiteKeyWidth)) {
          if ((elements[i].y) <= p.mouseY && p.mouseY <= (elements[i].y + elements[i].height)) {
            if (blackKeyPressed == false) {
              return p.keyMapping[j];
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
    keyOn = [true, keyboardID];

    // SEND MIDI NOTE ON HERE, key value is elements[keyOn[1]].value, need to convert it to MIDI number though
  }
  function keyboardOff() { // handles end of computer key presses and mouse clicks
    elements[keyOn[1]].value = "none"; // turn off key
    keyOn = [false, null];
    p.redrawGUI();

    // SEND MIDI NOTE OFF HERE, key value is elements[keyOn[1]].value, need to convert it to MIDI number though
  }
  p.turnOffOtherKeyboards = function (all = false) {
    if (all == true) {
      p.activeKeyboardIndex = null;
    }
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == 'keyboard') {
        if (i != p.activeKeyboardIndex) {
          elements[i].active = false;
        }
      }
    }
    if (all == true) {
      p.redrawGUI();
    }
  }


  //******** Element Custom Objects ********//
  let elements = [];

  let UserElement = function (type, label, mapto, callback, x, y, min = 0, max = 1, curve = 1, value = .5, prev = value, size = 1, color = p.color1, showLabel = true, showValue = true, bipolar = false, radioOptions = "", horizontal = false) {
    this.type = type; // str: type of element
    this.label = label; // str: name and unique ID

    this.mapto = mapto; // str: variable it is controlling
    if (typeof callback == "function") {
      this.callback = callback(); // function
    } else {
      this.callback = callback; // function
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

    this.position = function (x, y) {
      this.x = p.scaleX(x);
      this.y = p.scaleY(y);
      p.redrawGUI();
    }
  }

  // p.addElement = function (type, label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal) {
  //   let update = false;
  //   for (let i = 0; i < elements.length; i++) {
  //     if (elements[i].label == label) {
  //       update = true;
  //       // UPDATE VALS
  //       if (mapto != undefined) { elements[i].mapto = mapto; }
  //       if (x != undefined) { elements[i].x = p.scaleX(x); }
  //       if (y != undefined) { elements[i].y = p.scaleX(y); }
  //       if (min != undefined) { elements[i].min = min; }
  //       if (max != undefined) { elements[i].max = max; }
  //       if (curve != undefined) { elements[i].curve = curve; }
  //       if (value != undefined) { elements[i].value = value; }
  //       if (size != undefined) { elements[i].size = size; }
  //       if (color != undefined) { elements[i].color = color; }
  //       if (showLabel != undefined) { elements[i].showLabel = showLabel; }
  //       if (showValue != undefined) { elements[i].showValue = showValue; }
  //       if (bipolar != undefined) { elements[i].bipolar = bipolar; }
  //       if (radioOptions != undefined) { elements[i].radioOptions = radioOptions; }
  //       if (horizontal != undefined) { elements[i].horizontal = horizontal; }
  //       elements[i].prev = undefined;
  //       p.redrawGUI();
  //       break
  //     }
  //   }
  //   if (label == undefined) {
  //     console.error("label parameter is undefined")
  //   } else {
  //     if (update == false) {
  //       if (x == undefined) { x = x0 + (elements.length % 5) * 20; }
  //       if (y == undefined) { y = y0; }
  //       elements.push(new UserElement(type, label, mapto, callback, p.scaleX(x), p.scaleY(y), min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal));
  //     }
  //     p.redrawGUI();
  //     return elements[elements.length - 1];
  //   }
  // }//addElement

  p.Knob = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    p.addElement("knob", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.Dial = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    p.addElement("knob", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.Slider = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    p.addElement("slider", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.Fader = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    p.addElement("slider", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.Toggle = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    if (value == undefined) { value = 0; }
    p.addElement("toggle", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.Momentary = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    if (value == undefined) { value = 0; }
    p.addElement("momentary", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.Button = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    if (value == undefined) { value = 0; }
    p.addElement("momentary", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }
  p.RadioButtons = function ({ label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal }) {
    if (value == undefined) { value = 1; }
    p.addElement("radio", label, mapto, callback, x, y, min, max, curve, value, prev, size, color, showLabel, showValue, bipolar, radioOptions, horizontal);
  }

  //******** Element Helper Functions ********//
  p.removeElement = function (label) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        elements.splice(i, 1);
      }
    }
    p.redrawGUI();
  }//removeElement

  p.removeElements = function () {
    elements = []
    p.redrawGUI();
  }//removeElements

  // NOT FULLY WORKING !!!
  p.elementGrid = function (type, xcount, ycount) {
    let x0 = 50;
    let y0 = 50;
    for (let i = 0; i < xcount; i++) {
      for (let j = 0; j < ycount; j++) {
        let label = "grid" + elements.length + "_" + (i * j + j);
        let value = Math.random() * 2
        p.addElement({ x: x0 + i * 24, y: y0 + j * 24, type: type, label: label, mapto: "fakevar", min: 0, max: 2, value: value, size: .3, showLabel: false, showValue: false })

      }
    }
    // eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
    // eval(elements[i].mapto + '.rampTo(elements[i].value, 0.1)');
  }
  // p.scaleX = function (val) {
  //   val = Math.min((Math.max(0, val)), 100);
  //   return (val / 100) * x_size;
  // }
  // p.scaleY = function (val) {
  //   val = Math.min((Math.max(0, val)), 100);
  //   return (val / 100) * y_size;
  // }

  //******** Keyboard Element Custom Object ********//
  let Keyboard = function (label, type, mapto, x, y, value, width, height, keys, color, showLabel, wkWidth, active) {
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

    this.position = function (x, y) {
      this.x = p.scaleX(x);
      this.y = p.scaleY(y);
      p.redrawGUI();
    }
  }

  p.addKeyboard = function ({ label, type, mapto, x, y, width, height, keys, color, showLabel, active }) {
    // NEW OR UPDATE EXISTING?
    let update = false;

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].label == label) {
        update = true;
        // UPDATE VALS
        if (mapto != undefined) { elements[i].mapto = mapto; }
        if (x != undefined) { elements[i].x = p.scaleX(x); }
        if (y != undefined) { elements[i].y = p.scaleY(y); }
        if (width != undefined) { elements[i].width = p.scaleX(width); }
        if (height != undefined) { elements[i].height = p.scaleY(height); }
        if (keys != undefined) {
          elements[i].keys = keys;
          let numWhiteKeys = calculateNumWhiteKeys(keys);
          elements[i].wkWidth = p.scaleX(width) / numWhiteKeys;
        }
        if (color != undefined) { elements[i].color = color; }
        if (showLabel != undefined) { elements[i].showLabel = showLabel; }
        if (active != undefined) {
          elements[i].active = active;
          if (active == true) {
            p.activeKeyboardIndex = i;
            p.turnOffOtherKeyboards()
          } else {
            p.activeKeyboardIndex = null;
          }
        }
        p.redrawGUI();
        break
      }
    }

    if (update == false) {
      // default default values
      type = "keyboard";
      if (x == undefined) { x = 0; }
      if (y == undefined) { y = 0; }
      if (keys == undefined) { keys = 12; }
      if (width == undefined) { width = keys * 30; }
      if (height == undefined) { height = 100; }
      if (color == undefined) { color = p.color1; }
      if (showLabel == undefined) { showLabel = false; }
      if (active == undefined) { active = false; }
      let numWhiteKeys = calculateNumWhiteKeys(keys);
      let wkWidth = p.scaleX(width) / numWhiteKeys;
      let value = null;
      elements.push(new Keyboard(label, type, mapto, p.scaleX(x), p.scaleY(y), value, p.scaleX(width), p.scaleY(height), keys, color, showLabel, wkWidth, active));
    }
    p.redrawGUI();
    return elements[elements.length - 1];

    function calculateNumWhiteKeys(keys) {
      let numWhiteKeys = 0;
      let k = 0;
      for (let j = 0; j < keys; j++) {
        if (k >= 12) { k = k - 12 };
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
  p.line2 = function (x1, y1, x2, y2, stroke = 1, color, label = null) {
    x1 = p.scaleY(x1)
    x2 = p.scaleY(x2)
    y1 = p.scaleY(y1)
    y2 = p.scaleY(y2)
    //p.line(x1,y1,x2,y2)
    if (color == undefined) {
      color = p.color2;
    }
    //lines.push([x1,y1,x2,y2,stroke,color])

    let type = 'line'
    if (label == null) label = 'line' + lineNumber
    lineNumber += 1
    let mapto = 'mapto'
    let x = [x1, x2]
    let y = [y1, y2]
    let min = 0
    let max = 0
    let size = stroke

    elements.push(new UserElement(type, label, 'mapto', x, y, 0, 0, 0, 0, size, 0, 0, 0, 0, 0));
    p.redrawGUI()
    return elements[elements.length - 1];
  } //line2
  // p.lineX = function (x, color) {
  //   x = p.scaleX(x)
  //   p.line(x, 0, x, y_size)
  //   if (color === undefined) {
  //     color = p.color2;
  //   }
  //   lines.push([x, 0, x, y_size, color])
  //   p.redrawGUI()
  // }
  // p.lineY = function (y, color) {
  //   y = p.scaleY(y)
  //   p.line(0, y, x_size, y)
  //   if (color == undefined) {
  //     color = p.color2;
  //   }
  //   lines.push([0, y, x_size, y, color])
  //   p.redrawGUI()
  // }
  // p.drawLine = function (i) {
  //   // SET COLOR
  //   let currentColor;
  //   try {
  //     currentColor = elements[i].color.val;
  //   } catch (error) {
  //     currentColor = elements[i].color;
  //   }
  //   p.stroke(currentColor)
  //   p.strokeWeight(elements[i].size)
  //   p.line(elements[i].x[0], elements[i].y[0], elements[i].x[1], elements[i].y[1])
  // }



  //******** SCALING & FULLSCREEN ********//

  // p.fullscreenGUI = function () {
  //   if (fullscreen) {
  //     //reset
  //     document.getElementById(divID).style.top = "2%";
  //     document.getElementById(divID).style.right = "2";
  //     document.getElementById(divID).style.width = "49%";
  //     document.getElementById(divID).style.height = "32%";
  //     fullscreen = false
  //   } else {
  //     //make fs
  //     document.getElementById(divID).style.top = "4%";
  //     document.getElementById(divID).style.right = ".5%";
  //     document.getElementById(divID).style.width = "99%";
  //     document.getElementById(divID).style.height = "96%";
  //     document.getElementById(divID).style.background = "white";
  //     fullscreen = true
  //   }
  //   setNewDimensions();
  // }//fullscreen

  // window.addEventListener('resize', function (event) {
  //   setNewDimensions();
  // }, true);

  // function setNewDimensions() {
  //   // keeps aspect ratio at 2:1 and determines if height or width is constraining dimension in div
  //   x_size = document.getElementById(divID).offsetWidth;
  //   y_size = document.getElementById(divID).offsetHeight;
  //   if (2 * y_size > x_size) {
  //     x_size = document.getElementById(divID).offsetWidth;
  //     y_size = .5 * x_size;
  //   } else {
  //     x_size = 2 * y_size;
  //   }
  //   let newSize = y_size;
  //   let deltaSize = newSize / originalSize;
  //   p.resizeCanvas(x_size, y_size);
  //   globalScale = deltaSize;
  //   p.redrawGUI();
  // }


  //******** USER CUSTOMIZATION ********//
  p.sensitivity = function (masterSensitivity = 1) {
    // 1 is default, <1 makes it less sensitive, >1 more sensitive
    sliderSensitivity = .008 * masterSensitivity;
    sensitivityScale = .006 * masterSensitivity;
  }
  let guiColor = function (val) {
    // color Object so it can be referenced and then update on all elements
    this.val = val;
  }
  p.setColor1 = function (r, g, b, a) {
    if (g == undefined) {
      p.color1.val = p.color(r);
    }
    else if (a == undefined) {
      p.color1.val = p.color(r, g, b);
    } else {
      p.color1.val = p.color(r, g, b, a);
    }
    p.redrawGUI();
  }
  p.setColor2 = function (r, g, b, a) {
    if (g == undefined) {
      p.color2 = p.color(r);
    }
    else if (a == undefined) {
      p.color2 = p.color(r, g, b);
    } else {
      p.color2 = p.color(r, g, b, a);
    }
    p.redrawGUI();
  }
  p.setBackgroundColor = function (r, g, b, a) {
    if (g == undefined) {
      p.color3 = p.color(r);
    }
    else if (a == undefined) {
      p.color3 = p.color(r, g, b);
    } else {
      p.color3 = p.color(r, g, b, a);
    }
    p.redrawGUI();
  }
  p.setTextColor = function (r, g, b, a) {
    if (g == undefined) {
      p.color4 = p.color(r);
    }
    else if (a == undefined) {
      p.color4 = p.color(r, g, b);
    } else {
      p.color4 = p.color(r, g, b, a);
    }
    p.redrawGUI();
  }

  //******** OTHER ********//
  const scaleOutput = function (input, inLow, inHigh, outLow, outHigh, curve) {
    if (curve === undefined) curve = 1;
    let val = (input - inLow) * (1 / (inHigh - inLow));
    val = Math.pow(val, curve);
    return val * (outHigh - outLow) + outLow;
  }
} // END OF GUI p5 INSTANCE

export default gui_sketch;
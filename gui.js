//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg
const gui_sketch = function(my) {

  my.x_size = document.getElementById('gui_div').offsetWidth;
  my.y_size = document.getElementById('gui_div').offsetHeight;

  my.setup = function() {
    // COLOR VARS
    whiteColor = color(255);
    blackColor = color(0);
    transparentColor = color(0,0);
    elementColor1 = color(255,40,0);
    elementColor1active = color(190,10,0);
    elementColor2 = color(220,229,234);
    elementColor3 = color(0,85);


    my.createCanvas(my.x_size, my.y_size);
    // my.canvas.parent('visuals'); //'visuals is the name of the div to draw into'

    //slow down draw rate
    my.frameRate(30)

    my.background(elementColor2)
    my.noStroke();
    my.fill(40, 200, 40);

    my.button = createButton('Add Element');
    my.button.parent('gui_div'); //'p5 is the name of the div to draw into'
    my.button.position(0, 0);

    my.button.mousePressed(buttonPress);
    

  }

  //create a list to operate on
  // my.circleList = []

  // my.circly = function(size){
  //   this.size = size
  // }

  // my.addCircle = function(size=5){
  //   my.circleList.push(new my.circly(size))
  //   console.log('added circle size', size)
  // }

  // my.clearCircles = function() {
  //   my.circleList = [];
  //   console.log('cleared circles')
  // }

  // my.y=20;
  // my.y_direction = 0;

  let dragging = false;
  let rollover = false;
  
  let currElement = 0;
  
  // New UI Element Default Values
  let x0 = 50;
  let y0 = 180;
  let normalizedValue = 50;
  let r = 40; // element size
  let sliderThickness = 15;
  let sliderLength=100;
  
  // Knob Control Variables
  let liveY = 0;
  let ogY = 0;
  let valueScale = 50/180 // x/180 where x is 1/2 of output range
  let yScale = 1.2; // alters sensitivity of turning the knob
  let count = 0;
  let ogValue = -90;
    
  let buttonPress = function() {
    my.addElement("knob","LABEL");
    my.addElement("slider","LABEL");
    my.addElement("toggle","LABEL");
  }

  my.draw = function() {
    my.angleMode(DEGREES);
    my.textStyle(BOLD);
    my.textAlign (CENTER, CENTER);
    // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    my.fill(elementColor1);
    my.background(elementColor2);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == 'knob'){
        // ADJUST KNOB ANGLE WHILE DRAGGING
        if (dragging && currElement==i) {
          var dy = elements[currElement].y - my.mouseY - ogY;
          var angleY = dy*yScale;
          elements[currElement].value = angleY - ogValue;
          if (elements[currElement].value >= 45) {
            elements[currElement].value = 45;
          }
          else if (elements[currElement].value <= -225) {
            elements[currElement].value = -225;
          }
        }
        // highlight active knob
        my.push();
        my.stroke(elementColor3);
        my.fill(transparentColor);
        my.translate(elements[i].x, elements[i].y);
        my.strokeWeight(3);
        my.arc(0, 0, r*2.3, r*2.3,135,45);
        my.stroke(elementColor1);
        my.arc(0, 0, r*2.3, r*2.3,135,elements[i].value+.01  );
        my.strokeWeight(2);
        // my.rotate(elements[i].value);
        // // my.strokeWeight(13);
        // // my.line(r*.5, 0, r*.75, 0);
        // my.ellipse(r, 0, 15,15);


        my.fill (elementColor2);
        my.stroke(elementColor3);
        if (dragging && currElement==i) {
          my.fill (elementColor1);
          my.noStroke();
        }
        my.ellipse(0, 0, r*1.8, r*1.8);
        my.rotate(elements[i].value);
        my.stroke(elementColor3);
        my.strokeWeight(12);
        my.line(r*.25, 0, r*.6, 0);
        my.pop();

        // label
        my.fill(0);
        let normalizedValue  = int((elements[i].value + 90) * valueScale) + 50;
        // let valToGain = normalizedValue * 0.1; 
        // // volume.gain.value = valToGain;
        my.text(normalizedValue, elements[i].x, elements[i].y+r+15);
        my.text(elements[i].label, elements[i].x, elements[i].y+r+30);

      } 
      else if (elements[i].type == 'slider'){
        // ADJUST SLIDER VAL WHILE DRAGGING
        if (dragging && currElement==i) {
          var dy = elements[currElement].y - my.mouseY - ogY;
          var angleY = dy*.006;
          elements[currElement].value = angleY - ogValue;
          if (elements[currElement].value >= 1) {
            elements[currElement].value = 1;
          }
          else if (elements[currElement].value <= 0) {
            elements[currElement].value = 0;
          }
        }
        my.push(); 
        my.translate(elements[i].x, elements[i].y);
        // full slider line
        my.stroke(elementColor3);
        my.strokeWeight(7);
        my.line(0,sliderLength/2, 0,-sliderLength/2);
        // active slider line
        my.stroke(elementColor1);
        let convertedVal = elements[i].value * sliderLength;
        my.line(0,sliderLength/2,0,sliderLength/2-convertedVal);
        // control point
        my.fill(elementColor2);
        my.strokeWeight(2);
        if (dragging && currElement==i) {
          my.fill(elementColor1);
          my.strokeWeight(4);
        }
        let cpSize = 15;
        my.ellipse(0,(sliderLength/2)-convertedVal,cpSize,cpSize);

        // if (dragging && currElement==i) {
        //   my.fill(elementColor1);
        // }
        // my.rect(0,0,sliderThickness,-sliderLength)

        // my.fill(elementColor1);
        // my.stroke(elementColor1);
        //   if (dragging && currElement==i) {
        //   my.stroke(elementColor1);
        //   my.fill(elementColor2);
        // }
        // let convertedVal = elements[i].value * sliderLength;
        // my.rect(0,-convertedVal-4,sliderThickness,8,4)

        // // label
        my.fill(0);
        my.noStroke();
        let normalizedValue  = int((elements[i].value + 90) * valueScale) + 50;
        // let valToGain = normalizedValue * 0.1;
        // // volume.gain.value = valToGain;
        my.text(normalizedValue, 0, sliderLength/2+20);
        my.text(elements[i].label, 0, sliderLength/2+35);
        my.pop();
      } 
      else if (elements[i].type == 'toggle' ){
        // draw element
        my.push();
        my.stroke(elementColor1);
        my.strokeWeight(2);
        // let toggleText = "OFF";
        if (currElement == i){
          currElement = "none";
          elements[i].value = 1 - elements[i].value;
        }
        let textColor = elementColor1;
        if (elements[i].value == 0){
          my.stroke(elementColor1);
          // toggleText = "ON";
        }
        else if (elements[i].value == 1) {
          my.stroke(elementColor3);
          textColor = elementColor3;
        }
        my.translate(elements[i].x, elements[i].y);
        my.fill(elementColor2);
        my.ellipse(0, 0, r*2, r*2);
        my.fill (textColor);
        my.noStroke();
        let toggleText = elements[i].label;
        my.textSize(85/toggleText.length);
        my.text(toggleText, 0, 1);
        my.pop();
      }
      else if (elements[i].type == 'idk'){
        // draw element
      }
    }
  }


  my.mousePressed = function() {
    console.log('\nmosue pressed');
    console.log(my.mouseX);
    console.log(my.mouseY);
    for (let i = 0; i < elements.length; i++) {
      // if mouse is inside knob
      if (elements[i].type == "knob"){
        if (dist(my.mouseX, my.mouseY, elements[i].x, elements[i].y) < r) { 
          dragging = true; // start dragging
          ogY = y0 - my.mouseY;
          ogValue = -elements[i].value;
          currElement = i;
          console.log('curE: '+currElement);
          break
        }
      } 
      else if (elements[i].type == "toggle"){
        if (dist(my.mouseX, my.mouseY, elements[i].x, elements[i].y) < r) { 
          dragging = true; // start dragging
          ogY = y0 - my.mouseY;
          ogValue = -elements[i].value;
          currElement = i;
          console.log('curE: '+currElement);
          break
        }
      }
      else if (elements[i].type == "slider"){
        if (Math.abs(elements[i].x - my.mouseX) <= (sliderThickness/2)){
          if (Math.abs(elements[i].y - my.mouseY) <= (sliderLength/2+10)){
            dragging = true; // start dragging
            ogY = y0 - my.mouseY;
            ogValue = -elements[i].value;
            currElement = i;
            console.log('curE: '+currElement);
          }
        }
      } 
    }
  }
    
  
  my.mouseReleased = function() {
    console.log('\nmosue released');
    // Stop dragging
      dragging = false;
  }

  let UserElement = function(type,label,x,y,minval,maxval,value,size) {
    this.type = type;
    this.label = label;
    this.x = x;
    this.y = y;
    this.minval = minval;
    this.maxval = maxval;
    this.value = value;
    this.size = size;
  }
  
  let elements = [];

  my.addElement = function(type,label,x='default',y='default',minval=0,maxval=1,value=0.5,size=1) {
    // calculate default values
    let xGap = 100;
    if (x == 'default') {
      x = x0 + elements.length*xGap;
    } 
    if (y == 'default') {
      y = y0;
    }
    if (type == 'toggle') {
      value = 0;
    }
    // change default initial value based on type of element?
    // maybe also change default range to -1,1 for some elements
    elements.push(new UserElement(type,label,x,y,minval,maxval,value,size));
    if (type == "slider"){
      // slider = createSlider(0, 255, 100);
      // slider.parent('p5'); //'p5 is the name of the div to draw into'
      // slider.position(x, y);
    }
    else if (type == 'toggle') {
      let toggleText = "OFF";
      my.push();
      my.fill (255,0,0);
      my.translate(x, y);
      my.ellipse(0, 0, r*2, r*2);
      my.fill(0);
      my.text(toggleText, 0, 0);
      my.pop();
    }
  }

}

var gui = new p5(gui_sketch, document.getElementById('gui_div'))

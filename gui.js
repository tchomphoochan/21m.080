//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg

const gui_sketch = function(my) {

  my.x_size = document.getElementById('gui_div').offsetWidth;
  my.y_size = document.getElementById('gui_div').offsetHeight;

  my.setup = function() {

    my.createCanvas(my.x_size, my.y_size);
    // my.canvas.parent('visuals'); //'visuals is the name of the div to draw into'

    //slow down draw rate
    my.frameRate(30)

    my.background(255)
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
  let sliderThickness = 20;
  let sliderLength=100;
  
  // Knob Control Variables
  let liveY = 0;
  let ogY = 0;
  let valueScale = 50/180 // x/180 where x is 1/2 of output range
  let yScale = 1.2; // alters sensitivity of turning the knob
  let count = 0;
  let ogValue = -90;
    
  let buttonPress = function() {
    addElement("knob","LABEL");
    addElement("slider","LABEL");
    addElement("toggle","LABEL");
  }

  my.draw = function() {
    
    // my.x = 0;
    // my.y_direction = my.y < 30 ? 0 : my.y>my.y_size ? 1 : my.y_direction
    // my.y = my.y_direction==0 ? my.y+20 : my.y-20

    // for(var i=0;i<my.circleList.length;i++){
    //   my.x+= my.circleList[i].size;
    //   my.circle(my.x, my.y, my.circleList[i].size + my.random(0,my.circleList[i].size))
    //   my.x+= my.circleList[i].size;
    // }

    my.angleMode(DEGREES);
    
    // ITERATE THRU ALL ELEMENTS and UPDATE THEM IF NEEDED
    my.fill(200);
    my.background(255);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == 'knob'){
        // ADJUST KNOB ANGLE WHILE DRAGGING
        if (dragging && currElement==i) {
          var dy = elements[currElement].y - mouseY - ogY;
          var angleY = dy*yScale;
          elements[currElement].value = angleY - ogValue;
          if (elements[currElement].value >= 90) {
            elements[currElement].value = 90;
          }
          else if (elements[currElement].value <= -270) {
            elements[currElement].value = -270;
          }
        }
        // highlight active knob
        my.push();
        if (dragging && currElement==i) {
          my.fill (245,155 ,155);
        }
        my.translate(elements[i].x, elements[i].y);
        my.ellipse(0, 0, r*2, r*2);
        my.rotate(elements[i].value);
        my.line(0, 0, r, 0);
        my.pop();
        // label
        my.textAlign(CENTER);
        my.textStyle(BOLD);
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
          var dy = elements[currElement].y - mouseY - ogY;
          var angleY = dy*.006;
          elements[currElement].value = angleY - ogValue;
          if (elements[currElement].value >= 1) {
            elements[currElement].value = 1;
          }
          else if (elements[currElement].value <= 0) {
            elements[currElement].value = 0;
          }
        }
        push();
        fill(255);
        stroke(0);
        translate(elements[i].x-(sliderThickness/2), elements[i].y+(sliderLength/2));
        rect(0,0,sliderThickness,-sliderLength)
        fill(0);
        if (dragging && currElement==i) {
          fill(255,0,0);
        }
        let convertedVal = elements[i].value * sliderLength;
        rect(0,0,sliderThickness,-convertedVal)
        // label
        textAlign(CENTER);
        textStyle(BOLD);
        fill(0);
        let normalizedValue  = int((elements[i].value + 90) * valueScale) + 50;
        // let valToGain = normalizedValue * 0.1;
        // // volume.gain.value = valToGain;
        text(normalizedValue, elements[i].x, elements[i].y+r+15);
        text(elements[i].label, elements[i].x, elements[i].y+r+30);
        pop();
      } 
      else if (elements[i].type == 'toggle' ){
        // draw element
        push();
        let toggleText = "OFF";
        if (currElement == i){
          currElement = "none";
          elements[i].value = 1 - elements[i].value;
        }
        if (elements[i].value == 0){
          fill (0,255,0);
          toggleText = "ON";
        }
        else if (elements[i].value == 1) {
          fill (255,0,0);
        }
        translate(elements[i].x, elements[i].y);
        ellipse(0, 0, r*2, r*2);
        fill(0);
        text(toggleText, 0, 0);
        fill(120);
        pop();
      }
      else if (elements[i].type == 'idk'){
        // draw element
      }
    }
  }


  let mousePressed = function() {
    for (let i = 0; i < elements.length; i++) {
      // if mouse is inside knob
      if (elements[i].type == "knob"){
        if (dist(mouseX, mouseY, elements[i].x, elements[i].y) < r) { 
          dragging = true; // start dragging
          ogY = y0 - mouseY;
          ogValue = -elements[i].value;
          currElement = i;
          console.log('curE: '+currElement);
          break
        }
      } 
      else if (elements[i].type == "toggle"){
        if (dist(mouseX, mouseY, elements[i].x, elements[i].y) < r) { 
          dragging = true; // start dragging
          ogY = y0 - mouseY;
          ogValue = -elements[i].value;
          currElement = i;
          console.log('curE: '+currElement);
          break
        }
      }
      else if (elements[i].type == "slider"){
        if (Math.abs(elements[i].x - mouseX) <= (sliderThickness/2)){
          if (Math.abs(elements[i].y - mouseY) <= (sliderLength/2)){
            dragging = true; // start dragging
            ogY = y0 - mouseY;
            ogValue = -elements[i].value;
            currElement = i;
            console.log('curE: '+currElement);
          }
        }
      } 
    }
  }
    
  
  let mouseReleased = function() {
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

  let addElement = function(type,label,x='default',y='default',minval=0,maxval=1,value=0.5,size=1) {
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
      push();
      fill (255,0,0);
      translate(x, y);
      ellipse(0, 0, r*2, r*2);
      fill(0);
      text(toggleText, 0, 0);
      pop();
    }
  }

}

var gui = new p5(gui_sketch, document.getElementById('gui_div'))

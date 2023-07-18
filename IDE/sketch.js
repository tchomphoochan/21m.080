function setup() {
  var canvas = createCanvas(600, 400);
      canvas.parent('p5'); //'p5 is the name of the div to draw into'

  noStroke();
  fill(40, 200, 40);

  //slow down draw rate
  frameRate(1)
}

//create a list to operate on
circleList = []

function circly(size){
  this.size = size
}

function addCircle(size){
  circleList.push(new circly(size))
}

var y=20;
var y_direction = 0;

function draw() {
  background(255,255,255)

  let x = 20;
  y_direction = y < 30 ? 0 : y>360 ? 1 : y_direction
  y = y_direction==0 ? y+20 : y-20

  for(var i=0;i<circleList.length;i++){
    circle(x, y, circleList[i].size + random(0,10))
    x+=20;
  }
}

//change draw rate when mouse is pressed
function mousePressed() { frameRate(20)}
function mouseReleased() { frameRate(1)}

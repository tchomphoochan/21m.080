function setup() {
  var canvas = createCanvas(600, 400);
      canvas.parent('visuals'); //'visuals is the name of the div to draw into'

  noStroke();
  fill(40, 200, 40);

  //slow down draw rate
  frameRate(30)
  // console.log('sketch.js setup')
}

class Particle {
    constructor(){
      this.x = random(0,width);
      this.y = random(0,height);
      this.r = random(1,8);
      this.xSpeed = random(-2,2);
      this.ySpeed = random(-1,1.5);
    }

    createParticle() {
      noStroke();
      fill('rgba(255, 99, 71, 0.5)');
      circle(this.x,this.y,this.r);
    }

    moveParticle() {
      if(this.x < 0 || this.x > width)
        this.xSpeed*=-1;
      if(this.y < 0 || this.y > height)
        this.ySpeed*=-1;
      this.x+=this.xSpeed;
      this.y+=this.ySpeed;
    }

    joinParticles(particles) {
      particles.forEach(element =>{
        let dis = dist(this.x,this.y,element.x,element.y);
        if(dis<85) {
          stroke('rgba(255,255,255,0.04)');
          line(this.x,this.y,element.x,element.y);
        }
      });
    }
  }

let particles = [];

function addParticle(){
  for(let i = 0;i<width/10;i++){
    particles.push(new Particle());
  }
  console.log('added space particles')
}

function setDrawRate(rate) {
  frameRate(rate)
  console.log('set draw rate to', rate)
}

//create a list to operate on
let circleList = []

function circly(size){
  this.size = size
}

function addCircle(size){
  circleList.push(new circly(size))
  console.log('added circle size', size)
}

function clearCircles() {
  circleList = [];
  console.log('cleared circles')
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
  for(let i = 0;i<particles.length;i++) {
    particles[i].createParticle();
    particles[i].moveParticle();
    particles[i].joinParticles(particles.slice(i));
  }
  // console.log('draw')
}

//change draw rate when mouse is pressed
function mousePressed() { frameRate(50)}
function mouseReleased() { frameRate(30)}

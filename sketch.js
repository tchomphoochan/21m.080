function setup() {
  //var canvas = createCanvas(600, 400);
      //canvas.parent('visuals'); //'visuals is the name of the div to draw into'

  //noStroke();
  //fill(40, 200, 40);

  //slow down draw rate
  frameRate(30)
  // console.log('sketch.js setup')
}



function setDrawRate(rate) {
  frameRate(rate)
  console.log('set draw rate to', rate)
}


function draw() {
  // background(255,255,255)

  // let x = 20;
  // y_direction = y < 30 ? 0 : y>360 ? 1 : y_direction
  // y = y_direction==0 ? y+20 : y-20

  // for(var i=0;i<circleList.length;i++){
  //   circle(x, y, circleList[i].size + random(0,10))
  //   x+=20;
  // }
  // for(let i = 0;i<particles.length;i++) {
  //   particles[i].createParticle();
  //   particles[i].moveParticle();
  //   particles[i].joinParticles(particles.slice(i));
  // }
  // // console.log('draw')
}

//change draw rate when mouse is pressed
//function mousePressed() { frameRate(50)}
//function mouseReleased() { frameRate(30)}

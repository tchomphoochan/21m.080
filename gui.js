//example of P5.js code in my mode
//https://youtu.be/Su792jEauZg

const gui_sketch = function(my) {

  my.x_size = document.getElementById('gui_div').offsetWidth;
  my.y_size = document.getElementById('gui_div').offsetHeight;

   my.setup = function() {
    my.createCanvas(my.x_size, my.y_size);
    //my.canvas.parent('scope_div'); //'visuals is the name of the div to draw into'


     my.noStroke();
     my.fill(40, 200, 40);

    //slow down draw rate
     my.frameRate(30)

     my.stroke(50,50,50);
  }

  //create a list to operate on
    my.circleList = []

  my.circly = function(size){
    this.size = size
  }

  my.addCircle = function(size=5){
    my.circleList.push(new my.circly(size))
    console.log('added circle size', size)
  }

  my.clearCircles = function() {
    my.circleList = [];
    console.log('cleared circles')
  }

  my.y=20;
  my.y_direction = 0;

  my.draw = function() {
    my.background(255,255,255)

    my.x = 0;
    my.y_direction = my.y < 30 ? 0 : my.y>my.y_size ? 1 : my.y_direction
    my.y = my.y_direction==0 ? my.y+20 : my.y-20

    for(var i=0;i<my.circleList.length;i++){
      my.x+= my.circleList[i].size;
      my.circle(my.x, my.y, my.circleList[i].size + my.random(0,my.circleList[i].size))
      my.x+= my.circleList[i].size;
    }
  }

}

var gui = new p5(gui_sketch, document.getElementById('gui_div'))

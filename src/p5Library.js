import p5 from 'p5';

export function initialize(p, div, backgroundColor = false) {
    p.div = div;
    p.createCanvas(div.offsetWidth, div.offsetHeight);
    p.width = div.offsetWidth;
    p.height = div.offsetHeight;
    p.elements = {};
    if (backgroundColor) {
        p.backgroundColor = backgroundColor;
        p.background(backgroundColor);
    }
}

p5.prototype.initialize = function (div, backgroundColor) {
    initialize(this, div, backgroundColor);
};

export function divResized(p, newWidth = false, newHeight = false) {
    p.resizeCanvas(0, 0);
    let prevWidth = p.width;
    let prevHeight = p.height;
    p.width = newWidth ? newWidth : p.div.offsetWidth;
    p.height = newHeight ? newHeight : p.div.offsetHeight;
    let scaleWidth = p.width / prevWidth;
    let scaleHeight = p.height / prevHeight;
    console.log(document.getElementById("Canvas1").offsetHeight);
    p.resizeCanvas(p.width, p.height);
    for (let element of Object.values(p.elements)) {
        try {
            element.resize(scaleWidth, scaleHeight);
        } catch {
            p.scale(scaleWidth, scaleHeight);
            eval(element);
        }
    }
};

p5.prototype.divResized = function () {
    divResized(this);
};

export function drawElements(p) {
    p.background(p.backgroundColor ? p.backgroundColor : [255, 255, 255]);
    for (let element of Object.values(p.elements)) {
        try {
            element.draw();
        } catch {
            //doesn't have draw function
        }
    }
}

p5.prototype.drawElements = function () {
    drawElements(this);
};

export class Knob {
    constructor(p, options = { id: "myKnob", x: 100, y: 100, size: 100, mapto: null }) {
        this.p = p;
        this.id = options.id;
        this.x = options.x;
        this.y = options.y;
        this.size = options.size;
        this.mapto = options.mapto || null;
        this.value = 0;
        this.startAngle = 5 * this.p.PI / 8;
        this.endAngle = 3 * this.p.PI / 8 + 2 * this.p.PI;
        this.dragging = false;
        p.elements[this.id] = this;
    }

    resize(scaleWidth, scaleHeight) {
        this.x *= scaleWidth;
        this.y *= scaleHeight;
        //this.size *= Math.sqrt(scaleWidth ** 2 + scaleHeight ** 2);
    }

    draw() {
        // Calculate the angle based on the knob's value
        let angle = this.p.map(this.value, 0, 1, this.startAngle, this.endAngle);

        // Draw the knob background
        this.p.noFill();
        this.p.stroke(0);
        this.p.strokeWeight(this.size * .06);
        this.p.arc(this.x, this.y, this.size, this.size, this.startAngle, this.endAngle);

        // Display the ID string beneath the knob
        this.p.textSize(this.size * .09);
        this.p.strokeWeight(0.0001 * this.size);
        this.p.textAlign(this.p.CENTER, this.p.TOP);
        this.p.fill(0);
        this.p.text(this.id, this.x, this.y + this.size / 2 + this.size * .05);

        // Display the knob value inside the removed part of the knob
        this.p.fill(0);
        this.p.text(this.value.toFixed(2), this.x, this.y + this.size / 2 - this.size * .05); // Display the value in the center of the knob

        // Draw the knob value indicator as a line
        let indicatorLength = this.size / 2 - this.size * .06; // Length of the indicator line
        let indicatorX = this.x + this.p.cos(angle) * indicatorLength;
        let indicatorY = this.y + this.p.sin(angle) * indicatorLength;
        this.p.stroke(255, 0, 0); // Red indicator
        this.p.strokeWeight(5);
        this.p.line(this.x, this.y, indicatorX, indicatorY);

        this.p.mouseDragged = () => {
            let d = this.p.dist(this.x, this.y, this.p.mouseX, this.p.mouseY);
            if (d < this.size / 2 || this.dragging) {
                this.dragging = true;
                if (this.p.movedY < 0 && this.value <= 1) {
                    this.value += .01;
                }
                else if (this.p.movedY > 0 && this.value >= 0) {
                    this.value -= .01;
                }
            }
        }

        this.p.mouseReleased = () => {
            this.dragging = false;
        }
    }
}

p5.prototype.Knob = function (id, x, y, size) {
    return new Knob(this, id, x, y, size);
};
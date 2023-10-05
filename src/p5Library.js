import p5 from 'p5';

export function initialize(p, div, backgroundColor = false) {
    p.div = div;
    p.createCanvas(div.offsetWidth, div.offsetHeight);
    p.width = div.offsetWidth;
    p.height = div.offsetHeight;
    p.elements = {};
    if (backgroundColor) {
        p.background(backgroundColor);
    }
}

p5.prototype.initialize = function (div, backgroundColor) {
    initialize(this, div, backgroundColor);
};

export function divResized(p, backgroundColor = false) {
    let prevWidth = p.width;
    let prevHeight = p.height;
    p.width = p.div.offsetWidth;
    p.height = p.div.offsetHeight;
    let scaleWidth = p.width / prevWidth;
    let scaleHeight = p.height / prevHeight;
    p.resizeCanvas(p.width, p.height);
    if (backgroundColor) {
        p.background(backgroundColor);
    }
    for (let element of Object.values(p.elements)) {
        p.scale(scaleWidth, scaleHeight);
        eval(element);
    }
};

p5.prototype.divResized = function (backgroundColor) {
    divResized(this, backgroundColor);
};

export function drawElements(p) {
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
    constructor(p, id, x, y, size) {
        this.p = p;
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.value = 0;
        this.startAngle = 5 * this.p.PI / 8;
        this.endAngle = 3 * this.p.PI / 8;
        this.dragging = false;
        p.elements[id] = this;
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
        this.p.strokeWeight(0.001 * this.size);
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
        //console.log(this.p.mouseIsPressed);

        this.p.mouseDragged = () => {
            let d = this.p.dist(this.x, this.y, this.p.mouseX, this.p.mouseY);
            if (d < this.size / 2 || this.dragging) {
                this.dragging = true;
                if (this.p.movedY < 0) {
                    console.log("increase");
                    this.value += .01;
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
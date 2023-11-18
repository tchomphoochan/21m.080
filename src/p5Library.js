import p5 from 'p5';

export function initialize(p, div, backgroundColor = false) {
    p.div = div;
    p.createCanvas(div.offsetWidth, div.offsetHeight);
    p.width = div.offsetWidth;
    p.height = div.offsetHeight;
    p.elements = {};
    p.p5Elements = {};
    if (backgroundColor) {
        p.backgroundColor = backgroundColor;
        p.background(backgroundColor);
    }
}

p5.prototype.initialize = function (div, backgroundColor) {
    initialize(this, div, backgroundColor);
};

export function divResized(p, maxClicked, canvasLength) {
    let prevWidth = p.width;
    let prevHeight = p.height;
    p.resizeCanvas(0, 0);
    let canvasesCont = document.getElementById("canvases");
    let controlsCont = document.getElementById("controls");
    let flexCont = document.getElementById('flex');
    if (maxClicked === '+h') {
        p.height = canvasesCont.offsetHeight - controlsCont.offsetHeight;
        p.width = p.div.offsetWidth;
    }
    else if (maxClicked === '-h') {
        p.height = canvasesCont.offsetHeight / canvasLength - controlsCont.offsetHeight;
        p.width = p.div.offsetWidth;
    }
    else if (maxClicked === '+w') {
        p.width = flexCont.offsetWidth;
        p.height = p.div.offsetHeight;
    }
    else if (maxClicked === '-w') {
        p.width = flexCont.offsetWidth / 2;
        p.height = prevHeight;
    }
    else {
        p.width = p.div.offsetWidth;
        p.height = p.div.offsetHeight;
    }
    let scaleWidth = p.width / prevWidth;
    let scaleHeight = p.height / prevHeight;
    p.resizeCanvas(p.width, p.height);
    for (let element of Object.values(p.elements)) {
        try {
            element.resize(scaleWidth, scaleHeight);
        } catch {
            p.scale(scaleWidth, scaleHeight);
            eval(element);
        }
    }
    p.drawElements();
};

p5.prototype.divResized = function (maxClicked = false, canvasLength = null) {
    divResized(this, maxClicked, canvasLength);
};

function drawGrid(p) {
    let margin = 10;
    let spacingX = Math.ceil((p.width - 2 * margin) / 3) - 5;
    let spacingY = Math.ceil((p.height - 2 * margin) / 3) - 5;
    p.textSize(12);
    let isBlack = p.red(p.backgroundColor) === 0 && p.green(p.backgroundColor) === 0 && p.blue(p.backgroundColor) === 0;
    p.fill(isBlack ? 255 : 0);
    p.noStroke();
    for (let i = 0; i < 4; i++) {
        let x = margin + i * spacingX;
        let y = margin + i * spacingY;
        p.text(x, x, margin);
        p.text(y, margin, y);
    }
}

export function drawElements(p) {
    p.background(p.backgroundColor ? p.backgroundColor : [255, 255, 255]);
    drawGrid(p);
    for (let element of Object.values(p.elements)) {
        element.draw();
    }
    for (let p5Element of Object.values(p.p5Elements)) {
        eval(p5Element);
    }
}

p5.prototype.drawElements = function () {
    drawElements(this);
};

export class Knob {
    constructor(p, options = {}) {
        this.p = p;
        this.id = options.id || "myKnob";
        this.x = options.x || p.width / 2;
        this.y = options.y || p.height / 2;
        this.size = options.size || .2 * p.width;
        this.min = options.min || 0;
        this.max = options.max || 1;
        this.mapto = options.mapto || null;
        this.value = (this.max + this.min) / 2;
        this.startAngle = 5 * this.p.PI / 8;
        this.endAngle = 3 * this.p.PI / 8 + 2 * this.p.PI;
        this.dragging = false;
        p.elements[this.id] = this;
    }
    setValue() {
        if (this.mapto) eval(`${this.mapto}=${this.value}`);
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
        this.p.strokeWeight(this.size * .06);
        this.p.line(this.x, this.y, indicatorX, indicatorY);

        this.p.mouseDragged = () => {
            let d = this.p.dist(this.x, this.y, this.p.mouseX, this.p.mouseY);
            if (d < this.size / 2 || this.dragging) {
                this.dragging = true;
                if (this.p.movedY < 0 && this.value < this.max) {
                    console.log("before:", this.value);
                    this.value += .01;
                    console.log("after:", this.value);
                }
                else if (this.p.movedY > 0 && this.value > this.min) {
                    console.log("insid3");
                    this.value -= .01;
                }
                this.setValue();
            }
        }

        this.p.mouseReleased = () => {
            this.dragging = false;
        }
    }
}

p5.prototype.Knob = function () {
    return new Knob(this);
};
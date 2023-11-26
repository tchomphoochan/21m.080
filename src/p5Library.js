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

function resizeP5(string, scaleWidth, scaleHeight) {
    var regex = /(\w+)\.(\w+)\((.*?)\)/;
    var match = string.match(regex);

    if (match) {
        // Extract the canvas, function name, and items inside the parentheses
        var canvasName = match[1]
        var functionName = match[2];
        let items = match[3].split(',').map(item => item.trim());

        // New values
        for (let i = 0; i < (functionName === 'arc' ? 4 : items.length); i++) {
            if (functionName === 'circle' && i > 1) {
                items[i] *= (scaleWidth + scaleHeight) / 2;
            }
            else {
                if (i % 2 === 0) {
                    items[i] *= scaleWidth;
                }
                else {
                    items[i] *= scaleHeight;
                }
            }
        }

        // Replace the items with new values
        return string.replace(match[0], canvasName + '.' + functionName + '(' + items.join(', ') + ')');
    }
    return string;
}

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
        p.width = prevWidth;
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
    for (let [key, element] of Object.entries(p.elements)) {
        if (typeof (element) === "string") {
            p.elements[key] = resizeP5(element, scaleWidth, scaleHeight);
        }
        else {
            element.resize(scaleWidth, scaleHeight);
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
        if (typeof (element) === "string") {
            eval(element);
        }
        else {
            element.draw();
        }
    }
}

p5.prototype.drawElements = function () {
    drawElements(this);
};

export class Knob {
    constructor(p, options) {
        this.p = p;
        this.id = options.id || "myKnob";
        this.x = options.x || p.width / 2;
        this.y = options.y || p.height / 2;
        this.size = options.size || .2 * p.width;
        this.min = options.min || 0;
        this.max = options.max || 1;
        this.mapto = options.mapto || null;
        this.value = this.mapto ? eval(`${this.mapto}.value`) : (this.max + this.min) / 2;
        this.incr = (this.max - this.min) / 100;
        this.startAngle = 5 * this.p.PI / 8;
        this.endAngle = 3 * this.p.PI / 8 + 2 * this.p.PI;
        this.dragging = false;
        let i = 1;
        //no id can be the same
        while (this.id in p.elements) {
            this.id += i;
            i++;
        }
        p.elements[this.id] = this;
    }
    setValue() {
        if (this.mapto) eval(`${this.mapto}.value=${this.value}`);
    }

    resize(scaleWidth, scaleHeight) {
        this.x *= scaleWidth;
        this.y *= scaleHeight;
        this.size *= (scaleWidth + scaleHeight) / 2;
    }

    draw() {
        // Calculate the angle based on the knob's value
        let angle = this.p.map(this.value, this.min, this.max, this.startAngle, this.endAngle);

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
                    if (this.value + this.incr > this.max) this.value = this.max;
                    else this.value += this.incr;
                }
                else if (this.p.movedY > 0 && this.value > this.min) {
                    if (this.value - this.incr < this.min) this.value = this.min;
                    else this.value -= this.incr;
                }
                this.setValue();
            }
        }

        this.p.mouseReleased = () => {
            this.dragging = false;
        }
    }
}

p5.prototype.Knob = function (options = {}) {
    return new Knob(this, options);
};
import { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

function Canvas(props) {
    var sketch = function (p) {
        p.x = 100;
        p.y = 100;

        p.setup = function () {
            p.createCanvas(200, 200);
            p.background(51);
        };

        p.draw = function () {
            p.fill(255, 0, 200, 25);
        };
    };
    let myp5 = new p5(sketch, "container1");

}

export default Canvas;
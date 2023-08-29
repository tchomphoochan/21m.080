import { useState, useEffect } from 'react';
import p5 from 'p5';

function Canvas(props) {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const sketch = (p) => {
            let div;

            p.setup = function () {
                div = document.getElementById(props.id);
                p.createCanvas(div.offsetWidth, div.offsetHeight);
            };

            p.draw = function () {
                // Your drawing code here
            };

            p.windowResized = function () {
                p.resizeCanvas(div.offsetWidth, div.offsetHeight);
            };
        };
        window[props.id] = new p5(sketch, props.id);

    }, [props.id]);

    const maxClicked = () => {
        setIsMaximized(!isMaximized);
        props.onMaximize(props.id);
    };

    return (
        <span className="p5-container">
            <span className="span-container" >
                <div>{props.id}</div>
                <span>
                    <button className="button-container" onClick={maxClicked}>
                        {isMaximized ? '-' : '+'}
                    </button>
                </span>
            </span>
            <div id={props.id} className='canvas-container'></div>
        </span>
    );

}

export default Canvas;
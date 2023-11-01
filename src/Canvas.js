import { useState, useEffect } from 'react';
import p5 from 'p5';
import { initialize, divResized, drawElements, Knob } from './p5Library';

window.Knob = Knob;
window.divResized = divResized;
function Canvas(props) {
    const [isMaximized, setIsMaximized] = useState(false);
    useEffect(() => {
        const sketch = (p) => {
            let grey = p.color(220, 229, 234);
            let div;

            p.setup = function () {
                div = document.getElementById(props.id);
                p.initialize(div, grey);
            };

            p.draw = function () {
                p.drawElements();
            };

            p.windowResized = function () {
                p.divResized();
            };
        };
        window.sketch = sketch;
        window[props.id] = new p5(sketch, props.id);

    }, [props.id]);

    const maxClicked = () => {
        setIsMaximized(!isMaximized);
        props.onMaximize(props.id);
        //eval(`${props.id}.divResized()`);
    };

    let css = props.maximized && !(props.maximized === props.id) ? 'minimize' : "p5-container";

    return (
        <span className={css}>
            <span className="span-container" >
                <div style={{ marginLeft: "5px" }}>{props.id}</div>
                {props.maxOption &&
                    <span>
                        <button className="button-container" onClick={maxClicked}>
                            {isMaximized ? '-' : '+'}
                        </button>
                    </span>
                }
            </span>
            <div id={props.id} className='canvas-container'></div>
        </span>
    );

}

export default Canvas;
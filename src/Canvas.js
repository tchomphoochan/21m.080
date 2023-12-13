import { useState, useEffect } from 'react';

import { initialize, divResized, drawElements, Knob, Fader, Button, Toggle, RadioButton } from './p5Library';
window.Knob = Knob;
window.Fader = Fader;
window.Button = Button;
window.Toggle = Toggle;
window.RadioButton = RadioButton;

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

    }, [props.id]);

    const maxClicked = () => {
        setIsMaximized(!isMaximized);
        props.onMaximize(props.id);
        try {
            window[props.id].divResized(isMaximized ? "-h" : "+h", props.canvasLength);
        } catch (error) {
            console.log(error);
        }
    };

    let css = props.maximized && !(props.maximized === props.id) ? 'minimize' : "p5-container";

    return (
        <span className={css}>
            <span className="span-container" >
                <div style={{ marginLeft: "5px" }}>{props.id}</div>
                {props.canvasLength > 1 &&
                    <span id="controls">
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
import { useState, useEffect } from 'react';
import p5 from 'p5';
import { initialize, divResized, drawElements, Knob } from './p5Library';

window.Knob = Knob;
function Canvas(props) {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const sketch = (p) => {
            let div;
            let grey = p.color(220, 229, 234);

            p.setup = function () {
                div = document.getElementById(props.id);
                p.initialize(div, grey);
            };

            p.draw = function () {
                p.drawElements(grey);
            };

            p.windowResized = function () {
                p.divResized(grey);
            };
        };
        window.sketch = sketch;
        //window[props.id] = new p5(sketch, props.id);

    }, [props.id]);

    const maxClicked = () => {
        setIsMaximized(!isMaximized);
        props.onMaximize(props.id);
    };

    return (
        <span className="p5-container">
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
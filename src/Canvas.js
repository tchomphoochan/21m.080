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

        window[eval(props.id)] = new p5(sketch);
    }, [props.id]);

    // const maxClicked = () => {
    //     setIsMaximized(!isMaximized);
    //     props.onMaximize(props.id);
    // };

    const delClicked = () => {
        props.onDelete(props.id);
    };

    return (
        <>
            <span className="span-container" style={{ marginTop: "-14px" }}>
                <p>{props.id}</p>
                <span>
                    {/* <button className="button-container" >
                        {isMaximized ? 'restore' : '+'}
                    </button> */}
                    <button className="button-container" onClick={delClicked}>x</button>
                </span>
            </span>
            <div id={props.id} className='p5Div'></div>
        </>
    );

}

export default Canvas;
import { useRef } from "react";
import Sketch from "react-p5";

function Canvas(props) {
    const canvasParentRef = useRef();
    let a = 300;
    let b = 300;
    let setup = (p5, canvasParentRef) => {
        //const containerWidth = canvasParentRef.current.clientWidth;
        let xyz = p5.createCanvas(p5.windowWidth / 2, props.height).parent(canvasParentRef);
    };
    let draw = (p5) => {
        p5.background("rgb(100%,0%,10%)");
    };
    return (
        <div className="flex-child" ref={canvasParentRef}>
            <Sketch setup={(p5) => setup(p5, canvasParentRef.current)} draw={draw} />
        </div>
    );
}

export default Canvas;
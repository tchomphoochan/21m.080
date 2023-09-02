// import { useState, useEffect } from "react";
import Editor from '../Editor.js';

const Template = (props) => {
    return (
        <>
            <div className="description-container">
                <div className="title">{props.title}</div>
                <div style={{ overflowWrap: "break-word" }}>{props.intro}</div>
            </div>
            <Editor page={props.page} starterCode={props.starterCode} canvases={props.canvases} />
            <div className="description-container">
                <div style={{ overflowWrap: "break-word" }}>{props.description}</div>
            </div>
        </>
    );
};

export default Template;

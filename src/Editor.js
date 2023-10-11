//4 
import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';

import p5 from 'p5';
import * as Tone from 'tone';
import Canvas from "./Canvas.js";
import gui_sketch from "./gui.js";
import { Oscilloscope, Spectroscope } from './oscilloscope';
import MidiKeyboard from './MidiKeyboard.js';
const midi = require('./Midi.js');
//Save history in browser
const stateFields = { history: historyField };


function Editor(props) {

    window.p5 = p5;
    window.gui_sketch = gui_sketch;
    window.Tone = Tone;
    window.Oscilloscope = Oscilloscope;
    window.Spectroscope = Spectroscope;
    window.gui_sketch = gui_sketch;
    window.setMidiInput = midi.setMidiInput;
    window.setNoteOnHandler = midi.midiHandlerInstance.setNoteOnHandler.bind(midi.midiHandlerInstance);
    window.setNoteOffHandler = midi.midiHandlerInstance.setNoteOffHandler.bind(midi.midiHandlerInstance);
    window.setCCHandler = midi.midiHandlerInstance.setCCHandler.bind(midi.midiHandlerInstance);

    var curLineNum = 0;

    // Save history in browser
    const serializedState = localStorage.getItem(`${props.page}EditorState`);
    const value = localStorage.getItem(`${props.page}Value`) || props.starterCode;

    const [height, setHeight] = useState(false);
    const [code, setCode] = useState(value); //full string of user code
    var vars = {}; //current audioNodes
    var varNames = [];
    const [liveMode, setLiveMode] = useState(true); //live mode is on by default
    const [refresh, setRefresh] = useState(false);
    const [disabled, setDisabled] = useState(false); //do we want to disable codebox?

    const canvases = props.canvases;
    const [codeMinimized, setCodeMinimized] = useState(false);
    const [p5Minimized, setP5Minimized] = useState(false);
    const [maximized, setMaximized] = useState('');

    useEffect(() => {
        const container = document.getElementById('container');
        if (container) {
            setHeight(`${container.clientHeight}px`);
        }
    }, []);

    function removeComments() {
        // Regular expression to match single-line and multi-line comments
        const commentRegex = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;

        // Remove comments from the code using the regular expression
        const cleanedCode = code.replace(commentRegex, '');
        return cleanedCode;
    }

    function updateCode(string) {
        let acorn = require('acorn');
        let walk = require('acorn-walk');
        let ast = null;
        try {
            ast = acorn.parse(string, { ecmaVersion: 'latest' });
        } catch (error) {
            console.log("Error parsing code: ", error);
        }

        let incr = 0; //tracks index while editing string
        let varNames = []; //Names of All varnames
        let length1 = 'globalThis.'.length;
        let length2 = " = null".length;

        //Take action when we see a VariableDeclaration Node
        const visitors = {
            VariableDeclaration(node, state, c) {
                //remove kind (let/var/const)
                let kind = node.kind;
                string = string.substring(0, node.start + incr) + string.substring(node.start + incr + kind.length);
                incr -= kind.length;
                //Continue walk to search for identifiers
                for (const declaration of node.declarations) {
                    let name = declaration.id.name;
                    let start = declaration.start;
                    let end = declaration.end;
                    //Add globalThis to string & name to varNames
                    string = string.substring(0, start + incr) + "globalThis." + string.substring(start + incr);
                    incr += length1;
                    varNames.push(name);
                    //In case of no assignment, set to var to null
                    let init = declaration.init;
                    if (!init) {
                        string = string.substring(0, end + incr) + " = null" + string.substring(end + incr);
                        incr += length2;
                    }
                    else {
                        if (init.body) {
                            c(init.body, state);
                        }
                        // let val = string.substring(init.start + incr, init.end + incr);
                        // for (let canvas of canvases) {
                        //     if (val.includes(canvas)) {
                        //         p5Code += `${canvas}.elements[${name}]="${val}"\n`;
                        //     }
                        // }
                    }
                }
            },

            FunctionDeclaration(node, state, c) {
                let name = node.id.name;
                let start = node.start + incr;
                let end = node.id.end + incr;
                let newCode = `globalThis.${name} = function`;
                incr += newCode.length - (end - start);
                string = string.substring(0, start) + newCode + string.substring(end);
                c(node.body, state);
            },

            ClassDeclaration(node, state, c) {
                let name = node.id.name;
                let start = node.start + incr;
                let end = node.id.end + incr;
                let newCode = `globalThis.${name} = class`;
                incr += newCode.length - (end - start);
                string = string.substring(0, start) + newCode + string.substring(end);
                c(node.body, state);
            }
        }

        try {
            walk.recursive(ast, null, visitors);
        } catch (error) {
            console.log("Error parsing code: ", error);
        }
        return string;
    }

    function evaluate(string) {
        try {
            eval(string);
            //eval(p5Code);
        } catch (error) {
            console.log("Error Evaluating Code", error);
        }
    }

    function updateVars() {
        let cleanedCode = removeComments();
        //REMINDER: Issue may arise from scheduled sounds
        for (const varName of varNames) {
            //Remove all sounds that have been redefined 
            if (liveMode) {
                //var isPlaying = true;
                if (varName in vars) {
                    try {
                        vars[varName].stop();
                    } catch (error) {
                        // isPlaying = false;
                    }
                    // if (isPlaying) {
                    //     eval(`${varName}.start()`);
                    // }
                }
            }

            let val;
            //Add name if var in smaller scope (not yet defined)
            try {
                val = eval(varName);
            } catch (error) {
                vars[varName] = null;
            }

            //Add name, val pairs of ONLY audionodes to vars dictionary 
            try {
                let isAudioNode = val.context || val instanceof AudioContext;
                if (isAudioNode) {
                    vars[varName] = val;
                }
            } catch (error) {

            }

        }

        //Remove all vars that have been deleted from full code
        if (liveMode) {
            for (const [key, val] of Object.entries(vars)) {
                if (!(key in vars)) {
                    if (!(cleanedCode.includes(key))) {
                        try {
                            val.stop();
                        } catch (error) {
                            //val not playing sound
                        }
                    }
                    else {
                        vars[key] = val;
                    }
                }
            }
        }
    }

    function traverse(string) {
        const updatedString = updateCode(string);
        evaluate(updatedString);
        updateVars();
    }

    function evaluateLine() {
        try {
            var line = code.split('\n')[curLineNum - 1];
            traverse(line);
        } catch (error) {
            console.log(error);
        }
    }

    function evaluateBlock() {
        try {
            const lines = code.split("\n");
            var linepos = curLineNum - 1;
            var line = lines[linepos];
            while (line !== undefined && line.replace(/\s/g, "") !== '') {
                linepos -= 1;
                line = lines[linepos];
            }
            var start = linepos + 1;
            linepos = curLineNum;
            line = lines[linepos];
            while (line !== undefined && line.replace(/\s/g, "") !== '') {
                linepos += 1;
                line = lines[linepos];
            }
            traverse(lines.slice(start, linepos).join('\n'));
        } catch (error) {
            console.log(error);
        }
    }


    //save history in browser and update code value
    const handleCodeChange = (value, viewUpdate) => {
        if (refresh) {
            setRefresh(false);
        }
        localStorage.setItem(`${props.page}Value`, value);
        setCode(value);
        //viewUpdate.view.dom.clientHeight = document.getElementById('main').clientHeight;
        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem(`${props.page}EditorState`, JSON.stringify(state));
    };

    //Handle Live Mode Key Funcs
    const handleKeyDown = (event) => {
        if (liveMode) {
            if (event.altKey && event.shiftKey && event.key === 'Enter') {
                // if (prevLineNum !== curLineNum) {
                //     setRemoveEnter(true);
                // }
                evaluateBlock();
            }
            // else if (event.ctrlKey) {
            //     setPrevLineNum(curLineNum);
            // }
            else if (event.altKey && event.key === 'Enter') {
                evaluateLine();
            }
        }
    };


    const handleStatistics = (data) => {
        curLineNum = data.line.number;
    }

    //Handle Mode Changes + Play & Stop
    const playClicked = () => {
        setLiveMode(false);
        stopClicked();
        traverse(code);

    }
    const liveClicked = () => {
        if (liveMode) {
            setLiveMode(false);
        }
        else {
            setLiveMode(true);
        }

    }
    const stopClicked = () => {
        for (const key in vars) {
            let variable = vars[key];
            try {
                variable.stop();
            } catch (error) {
                //No action needed
            }
        }
        vars = {};
    }

    const midiDown = (callBack) => {
        midiUp(callBack);
        return Object.keys(vars)[vars.length - 1];
    }

    const midiUp = (callBack) => {
        traverse(callBack);
    }

    //Handle refresh/max/min buttons
    const refreshClicked = () => {
        setRefresh(true);
        localStorage.setItem(`${props.page}Value`, props.starterCode);
    }
    const codeMinClicked = () => {
        setCodeMinimized(!codeMinimized);
    }

    const canvasMinClicked = () => {
        setP5Minimized(!p5Minimized);
    }

    const handleMaximizeCanvas = (canvasId) => {
        if (maximized === canvasId) {
            setMaximized('');
        }
        else {
            setMaximized(canvasId);
        }
    };

    const liveCSS = liveMode ? 'button-container active' : 'button-container';

    const liveCSS = liveMode ? 'button-container active' : 'button-container';

    return (
        <div className="flex-container" >
            {!codeMinimized &&
                <div className="flex-child" >
                    <span className="span-container">
                        <span className="span-container">
                            <button className="button-container" onClick={playClicked}>Play</button>
                            <button className={liveCSS} onClick={liveClicked}>Live</button>
                            <button className="button-container" onClick={stopClicked}>Stop</button>
                        </span>

                        <span className="span-container">
                            <MidiKeyboard />
                            <span className="span-container">
                                <MidiKeyboard midUp={midiUp} midiDown={midiDown} disabled={disabled} setDisabled={setDisabled} />
                                <button className="button-container" onClick={refreshClicked}>Starter Code</button>
                                {!p5Minimized &&
                                    <button className="button-container" onClick={codeMinClicked}>-</button>
                                }
                                <button className="button-container" onClick={canvasMinClicked}>{p5Minimized ? '<=' : '+'}</button>
                            </span>

                        </span>
                        <div id="container" >
                            {height !== false &&
                                <CodeMirror
                                    id="codemirror"
                                    value={refresh ? props.starterCode : value}
                                    initialState={
                                        serializedState
                                            ? {
                                                json: JSON.parse(serializedState || ''),
                                                fields: stateFields,
                                            }
                                            : undefined
                                    }
                                    options={{
                                        mode: 'javascript',
                                    }}
                                    extensions={[javascript({ jsx: true })]}
                                    onChange={handleCodeChange}
                                    onKeyDown={handleKeyDown}
                                    onStatistics={handleStatistics}
                                    height={height}
                                />
                            }
                        </div>
                </div>
            }
            {!p5Minimized &&
                <div className="flex-child">
                    <span className="span-container">
                        {codeMinimized &&
                            <button className="button-container" onClick={codeMinClicked}>{"=>"}</button>
                        }
                    </span>
                    {canvases.map((id) => (
                        (!maximized || maximized === id) && (
                            <Canvas key={id} id={id} onMaximize={handleMaximizeCanvas} maxOption={canvases.length > 1} />
                        )
                    ))}
                </div>
            }
        </div>
    );
}

export default Editor;
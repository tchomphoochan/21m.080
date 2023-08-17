//5:25
import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';

import p5 from 'p5';
import Canvas from "./Canvas.js";
import * as midiMain from './midiCoder/midi_main.js';

import * as midiControl from "./midiCoder/midi_control.js";
import * as seqControl from './midiCoder/seq_control.js'
import * as algControl from "./midiCoder/algorithm_control.js";
import * as starterCode from "./midiCoder/starterCode.js"
import * as midiMath from './midiCoder/midi_math.js';

Object.keys(midiMain).forEach((key) => {
    window[key] = midiMain[key];
});
Object.keys(midiControl).forEach((key) => {
    window[key] = midiControl[key];
});
Object.keys(seqControl).forEach((key) => {
    window[key] = seqControl[key];
});
Object.keys(algControl).forEach((key) => {
    window[key] = algControl[key];
});
Object.keys(starterCode).forEach((key) => {
    window[key] = starterCode[key];
});
Object.keys(midiMath).forEach((key) => {
    window[key] = midiMath[key];
});

// console.log(Seq);
// setMidiInput = setMidiInput;

// window.Seq = Seq;

var curLineNum = 0;

//Save history in browser
const stateFields = { history: historyField };


function Editor() {
    window.setupClock();
    // eval('import * as midiControl from "./midiCoder/midi_control.js";    import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from "./midiCoder/seq_control.js"; import { makingIf, startTern } from "./midiCoder/algorithm_control.js";    import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"; import {floor, ceil, peak, cos, round, trunc, abs} from "./midiCoder/midi_math.js";');
    // eval('console.log(Seq)');
    const imports = 'import { midi, onMIDISuccess, onMIDIFailure, setMidiInput, setMidiOutput, getMidiIO, handleMidiInput, outputMidiID, midiMap, ccMap, stopMap, mute, muted, toggleMute } from "./midiCoder/midi_control.js"; import * as midiControl from "./midiCoder/midi_control.js";    import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from "./midiCoder/seq_control.js"; import { makingIf, startTern } from "./midiCoder/algorithm_control.js";    import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"; import {floor, ceil, peak, cos, round, trunc, abs} from "./midiCoder/midi_math.js";'; // Add your required imports here

    window.p5 = p5;

    //Save history in browser
    const serializedState = localStorage.getItem('myEditorState');
    const value = localStorage.getItem('myValue') || '//Start coding here!';
    const storedCanvases = localStorage.getItem('canvases');


    const [code, setCode] = useState(value); //full string of user code
    const [vars, setVars] = useState({}); //current audioNodes
    const [liveMode, setLiveMode] = useState(false);
    const [middleButton, setMiddleButton] = useState("button-container");
    const [canvases, setCanvases] = useState([]);
    const [canvasRendered, setCanvasRendered] = useState(false);
    const [addClicked, setAddClicked] = useState(false);
    const [canvasName, setCanvasName] = useState('');


    useEffect(() => {
        localStorage.setItem('canvases', '');
        const storedCanvases = localStorage.getItem('canvases');
        if (storedCanvases) {
            renderP5Div();
            const prevCanvases = JSON.parse(storedCanvases);
            setCanvases(prevCanvases);
            console.log(prevCanvases);
            for (const id of prevCanvases) {
                addDiv(id);
            }
        }
    }, []);

    function removeComments() {
        // Regular expression to match single-line and multi-line comments
        const commentRegex = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;

        // Remove comments from the code using the regular expression
        const cleanedCode = code.replace(commentRegex, '');
        return cleanedCode;
    }

    function traverse(string) {
        let cleanedCode = removeComments();
        let acorn = require('acorn');
        let walk = require('acorn-walk');
        let ast = acorn.parse(string, { ecmaVersion: 'latest' });

        let incr = 0; //tracks index while editing string
        // let p5Instances = {};
        let varNames = []; //Names of All varnames
        let variables = {}; //Name, val pairs of ONLY audioNodes
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

                }
            },
        }

        walk.recursive(ast, null, visitors);
        console.log(canvases);
        // console.log(document.querySelector('container'));
        eval(string);

        //REMINDER: Issue may arise from scheduled sounds
        for (const varName of varNames) {
            //Add name, val pairs of ONLY audionodes to variables dictionary 
            let val = eval(varName);
            try {
                let isAudioNode = val.context || val instanceof AudioContext;
                if (isAudioNode) {
                    variables[varName] = val;
                }
            } catch (error) {
                //Variable isn't an audioNode
            }

            //Remove all sounds that have been redefined
            if (liveMode) {
                if (varName in vars) {
                    try {
                        vars[varName].stop();
                    } catch (error) {
                        //val not playing sound
                    }
                }
            }
        }

        //Remove all sounds that have been deleted from full code
        if (liveMode) {
            for (const [key, val] of Object.entries(vars)) {
                if (!(key in variables)) {
                    if (!(cleanedCode.includes(key))) {
                        try {
                            val.stop();
                        } catch (error) {
                            //val not playing sound
                        }
                    }
                    else {
                        variables[key] = val;
                    }
                }
            }
        }
        setVars(variables);

    }

    //save history in browser and update code value
    const handleCodeChange = (value, viewUpdate) => {
        localStorage.setItem('myValue', value);
        setCode(value);

        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem('myEditorState', JSON.stringify(state));
    };

    //Handle Live Mode Key Funcs
    const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (liveMode) {
                try {
                    //Add code to get codeBlock instead
                    traverse(code);
                } catch (error) {
                    console.error('Error evaluating code:', error);
                }
            }
        }
    };

    const handleStatistics = (data) => {
        // console.log(data.line.number);
        curLineNum = data.line.number;
    }


    // const handleClick = (event) => {
    //     evaluateLine();
    // };

    // function evaluateLine() {
    // try {
    // 	let lines = code.split('\n');
    //     let curLine = lines[curLineNum-1]
    //     eval(curLine);
    // 	// runCode(line);
    // } catch (e) {
    // 	console.error(e);
    // }
    // }

    //Handle Mode Changes + Play & Stop
    const playClicked = () => {
        stopClicked();
        traverse(code);

    }
    const liveClicked = () => {
        if (liveMode) {
            setLiveMode(false);
            setMiddleButton("button-container");
        }
        else {
            setLiveMode(true);
            setMiddleButton("button-container middle-clicked");
        }

    }
    const stopClicked = () => {
        setLiveMode(false);
        setMiddleButton("button-container");
        for (const key in vars) {
            let variable = vars[key];
            try {
                variable.stop();
            } catch (error) {
                //No action needed
            }
        }
        setVars({});
    }

    const addCanvas = () => {
        setAddClicked(true);
    }

    const handleCanvasNameChange = (event) => {
        setCanvasName(event.target.value);
    };

    const submitName = (event) => {
        if (event.key === 'Enter') {
            renderCanvas(canvasName);
            setCanvasName('');
            setAddClicked(false);
        }
    };

    function renderP5Div() {
        if (!canvasRendered) {
            const p5Div = document.createElement('div');
            p5Div.classList.add("flex-child");
            p5Div.id = 'p5';
            document.getElementById('main').appendChild(p5Div);
            setCanvasRendered(true);
        }
    }

    function renderCanvas(name) {
        renderP5Div();
        addDiv(name);
        const varName = eval(name);
        window.varName = new p5(getSketch(name), name);
        setCanvases((prevArray) => [...prevArray, name]);
        localStorage.setItem('canvases', JSON.stringify([...canvases, name]));
    }

    function addDiv(id) {
        const parentDiv = document.getElementById('p5');
        const p5Div = document.createElement('div');
        p5Div.classList.add('p5Div');
        p5Div.id = id;
        p5Div.style.marginTop = '2px';
        const optionsDiv = document.createElement('span');
        optionsDiv.classList.add('span-container');
        const label = document.createElement('p');
        label.innerText = id;
        const maxButton = document.createElement('button');
        maxButton.innerText = 'max';
        maxButton.classList.add('button-container');
        const delButton = document.createElement('button');
        delButton.innerText = 'del';
        delButton.classList.add('button-container');
        optionsDiv.appendChild(label);
        optionsDiv.appendChild(maxButton);
        optionsDiv.appendChild(delButton);
        parentDiv.appendChild(optionsDiv);
        parentDiv.appendChild(p5Div);
    }

    function getSketch(id) {
        var sketch = function (p) {
            p.div = document.getElementById(id);
            p.x = 100;
            p.y = 100;

            p.setup = function () {
                p.createCanvas(p.div.offsetWidth, p.div.offsetHeight);
            };

            p.draw = function () {
            };

            p.windowResized = function () {
                p.resizeCanvas(p.div.offsetWidth, p.div.offsetHeight);
            }
        };
        return sketch;
    }

    //window.addEventListener("resize", updateCanvases);

    return (
        <div id="main" className="flex-container">
            <div className="flex-child">
                <span className="span-container">
                    <button className="button-container" onClick={playClicked}>Play</button>
                    <button className={middleButton} onClick={liveClicked}>Live</button>
                    <button className="button-container" onClick={stopClicked}>Stop</button>
                    {addClicked ? (
                        <input
                            type="text"
                            placeholder="Enter Canvas Name"
                            value={canvasName}
                            onChange={handleCanvasNameChange}
                            onKeyDown={submitName}
                        />
                    ) : (
                        <button className="button-container" onClick={addCanvas}>Add Canvas</button>
                    )}
                </span>
                <CodeMirror
                    value={value}
                    initialState={serializedState
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
                    //onClick={handleClick}
                    onStatistics={handleStatistics}
                    height='890px'
                />
            </div>
        </div>
    );
}

export default Editor;




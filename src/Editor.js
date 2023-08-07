//14:06
import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';

import Canvas from "./Canvas.js";
import * as midiMain from './midiCoder/midi_main.js';

import * as midiControl from "./midiCoder/midi_control.js";
import * as seqControl from './midiCoder/seq_control.js'
import * as algControl from "./midiCoder/algorithm_control.js";
import * as starterCode from  "./midiCoder/starterCode.js"
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

const stateFields = { history: historyField };
var curLineNum = 0;

function Editor() {
    window.setupClock();
    // eval('import * as midiControl from "./midiCoder/midi_control.js";    import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from "./midiCoder/seq_control.js"; import { makingIf, startTern } from "./midiCoder/algorithm_control.js";    import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"; import {floor, ceil, peak, cos, round, trunc, abs} from "./midiCoder/midi_math.js";');
    // eval('console.log(Seq)');
    const imports = 'import { midi, onMIDISuccess, onMIDIFailure, setMidiInput, setMidiOutput, getMidiIO, handleMidiInput, outputMidiID, midiMap, ccMap, stopMap, mute, muted, toggleMute } from "./midiCoder/midi_control.js"; import * as midiControl from "./midiCoder/midi_control.js";    import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from "./midiCoder/seq_control.js"; import { makingIf, startTern } from "./midiCoder/algorithm_control.js";    import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"; import {floor, ceil, peak, cos, round, trunc, abs} from "./midiCoder/midi_math.js";'; // Add your required imports here
    const serializedState = localStorage.getItem('myEditorState');
    const value = localStorage.getItem('myValue') || '//Start coding here!';
    // const codeMirrorRef = useRef(null);
    const [code, setCode] = useState(value);
    const [vars, setVars] = useState({});
    const [liveMode, setLiveMode] = useState(false);
    const [middleButton, setMiddleButton] = useState("button-container");

    function removeComments(code) {
        // Regular expression to match single-line and multi-line comments
        const commentRegex = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;

        // Remove comments from the code using the regular expression
        const cleanedCode = code.replace(commentRegex, '');

        return cleanedCode;
    }

    function traverse(string) {
        string = removeComments(string);
        let acorn = require('acorn');
        let walk = require('acorn-walk');
        let ast = acorn.parse(string, { ecmaVersion: 'latest' });
        let incr = 0;
        let varNames = [];
        let variables = {};
        let length = 'globalThis.'.length;
        const visitors = {
            VariableDeclaration(node, state, c) {
                let kind = node.kind;
                string = string.substring(0, node.start + incr) + string.substring(node.start + incr + kind.length);
                incr -= kind.length;
                //Continue walk to search for identifiers
                for (const declaration of node.declarations) {
                    let name = declaration.id.name;
                    let start = declaration.start;
                    let end = declaration.end;
                    string = string.substring(0, start + incr) + "globalThis." + string.substring(start + incr);
                    incr += length;
                    varNames.push(name);
                    //In case of no assignment, set to null
                    if (!declaration.init) {
                        string = string.substring(0, end + incr) + " = null" + string.substring(end + incr);
                    }
                }
            },
        }

        walk.recursive(ast, null, visitors);
        eval(string);

        //REMINDER: Issue may arise from scheduled sounds
        for (const varName of varNames) {
            let val = eval(varName);
            //Add name value pairs to variables dictionary for all audioNodes
            try {
                let isAudioNode = val.context || val instanceof AudioContext;
                if (isAudioNode) {
                    variables[varName] = val;
                }
            } catch (error) {
                //Variable isn't an audioNode
            }

            //Remove all sounds that have been changed
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

        //Remove all sounds that have been deleted
        if (liveMode) {
            for (const [key, val] of Object.entries(vars)) {
                if (!(key in variables)) {
                    if (!(code.includes(key))) {
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
        console.log(variables);
        setVars(variables);
    }

    const handleCodeChange = (value, viewUpdate) => {
        localStorage.setItem('myValue', value);
        setCode(value);

        // console.log(viewUpdate);
        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem('myEditorState', JSON.stringify(state));
    };

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

    const handleStatistics = (data) =>{
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

    return (
        <div className="flex-container">
            <div className="flex-child">
                <div className="flex-container">
                    <button className="button-container" onClick={playClicked}>Play</button>
                    <button className={middleButton} onClick={liveClicked}>Live</button>
                    <button className="button-container" onClick={stopClicked}>Stop</button>
                </div>
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
                        extraKeys: {
                            //'Ctrl-Enter': evaluateLine,
                            // 'Shift-Enter': evaluateCode,
                            // 'Ctrl-.': stopEverything,
                            // 'Alt-Enter': evaluateBlock,
                        },
                    }}
                    extensions={[javascript({ jsx: true })]}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    onClick={handleClick}
                    onStatistics={handleStatistics}
                />
            </div>
            <div>
                <Canvas height={200} />
            </div>
        </div>
    );
}

export default Editor;

/*
IDENTIFY: Variable name changes, deletions, Additions
*/


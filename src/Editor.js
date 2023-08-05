//6:15
import React, { useState, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { ViewUpdate } from '@codemirror/view';

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

    const handleCodeChange = (value, viewUpdate) => {
        localStorage.setItem('myValue', value);
        setCode(value);

        // console.log(viewUpdate);
        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem('myEditorState', JSON.stringify(state));
    };

    const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            try {
                eval(code);
                //runCode(code);
            } catch (error) {
                console.error('Error evaluating code:', error);
            }
        }
    };

    const handleStatistics = (data) =>{
        // console.log(data.line.number);
        curLineNum = data.line.number;
    }


    const handleClick = (event) => {
        evaluateLine();
    };

    function evaluateLine() {
	try {
		let lines = code.split('\n');
        let curLine = lines[curLineNum-1]
        eval(curLine);
		// runCode(line);
	} catch (e) {
		console.error(e);
	}
}

    return (
        <div className="flex-container">
            <div className="flex-child">
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


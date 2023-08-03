//7:00
import React, { useState, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';

import Canvas from "./Canvas.js";

const stateFields = { history: historyField };

function Editor() {
    const serializedState = localStorage.getItem('myEditorState');
    const value = localStorage.getItem('myValue') || '//Start coding here!';

    const [code, setCode] = useState(value);
    const [vars, setVars] = useState({});
    const [liveMode, setLiveMode] = useState(false);
    const [middleButton, setMiddleButton] = useState("button-container");

    function isPlayingSound(audioNode) {
        return audioNode.context.currentTime < audioNode.stopTime;
    }

    function traverse(code) {
        let acorn = require('acorn');
        let walk = require('acorn-walk');
        let ast = acorn.parse(code, { ecmaVersion: 'latest' });
        let varNames = new Set();
        let variables = {};
        let incr = 0;
        let length = 'globalThis.'.length;
        const visitors = {
            VariableDeclaration(node, state, c) {
                let kind = node.kind;
                code = code.substring(0, node.start + incr) + code.substring(node.start + incr + kind.length);
                incr -= kind.length;
                //Continue walk to search for identifiers
                for (const declaration of node.declarations) {
                    let name = declaration.id.name;
                    let start = declaration.start;
                    let end = declaration.end;
                    code = code.substring(0, start + incr) + "globalThis." + code.substring(start + incr);
                    incr += length;
                    varNames.add(name);
                    //In case of no assignment, set to null
                    if (!declaration.init) {
                        code = code.substring(0, end + incr) + " = null" + code.substring(end + incr);
                    }
                }
            },
        }

        walk.recursive(ast, null, visitors);
        console.log(varNames);
        eval(code);

        //will fix later
        // for (const varName of varNames) {
        //     try {
        //         let val = eval(varName);
        //         console.log(val);
        //         if (liveMode) {
        //             if (varName in vars && isPlayingSound(vars[varName])) {
        //                 vars[varName].stop();
        //             }
        //         }
        //         if (isPlayingSound(val)) {
        //             variables[varName] = val;
        //         }
        //     } catch (error) {
        //         console.log("Error stoping variable in live mode.", error);
        //     }
        // }
        //console.log(variables);
        //setVars(variables);
    }

    const handleCodeChange = (value, viewUpdate) => {
        localStorage.setItem('myValue', value);
        setCode(value);

        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem('myEditorState', JSON.stringify(state));
    };

    const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            try {
                traverse(code);
            } catch (error) {
                console.error('Error evaluating code:', error);
            }
        }
    };

    const playClicked = () => {
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
                console.log("Error stopping all variables.", error);
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
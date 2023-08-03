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

    function isPlayingSound(audioNode) {
        return audioNode.context.currentTime < audioNode.stopTime;
    }

    function traverse(code, prevVars = null) {
        let acorn = require('acorn');
        let walk = require('acorn-walk');
        let ast = acorn.parse(code, { ecmaVersion: 'latest' });
        console.log(ast);
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
        console.log(code);
        eval(code);

        for (const varName of varNames) {
            try {
                let val = eval(varName);
                if (prevVars && isPlayingSound(prevVars[varName])) {
                    prevVars[varName].stop();
                }
                if (isPlayingSound(val)) {
                    variables[varName] = val;
                }
            } catch (error) {
                //no need for action
            }
        }
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
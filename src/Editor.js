//13:40
import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';

import Canvas from "./Canvas.js";

const stateFields = { history: historyField };

function Editor() {
    const serializedState = localStorage.getItem('myEditorState');
    const value = localStorage.getItem('myValue') || '//Start coding here!';

    let acorn = require("acorn");

    const [code, setCode] = useState(value);
    const [vars, setVars] = useState();
    const [ast, setAst] = useState();

    const handleCodeChange = (value, viewUpdate) => {
        localStorage.setItem('myValue', value);
        setCode(value);

        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem('myEditorState', JSON.stringify(state));
    };

    const handleKeyDown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            // Evaluate the code when the user presses ctrl+enter
            const ast = acorn.parse(code, { ecmaVersion: 'latest' });
            setAst(ast);
            console.log(ast);
            console.log("tokenizer:")

            try {
                //runCode(code);
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
                    initialState={
                        serializedState
                            ? {
                                json: JSON.parse(serializedState || ''),
                                fields: stateFields,
                            }
                            : undefined
                    }
                    onChange={handleCodeChange}
                    theme={dracula}
                    height='100vh'
                    mode="javascript"
                    extensions={[javascript({ jsx: true })]}
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
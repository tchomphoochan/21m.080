import React, { useState, useEffect } from 'react';
//import axios from "axios";
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';

import { Sketch } from '@p5-wrapper/react';

const stateFields = { history: historyField };

function Editor() {
    const serializedState = localStorage.getItem('myEditorState');
    const value = localStorage.getItem('myValue') || '//Start coding here!';

    const [code, setCode] = useState(value);
    const [elements, setElements] = useState([])

    useEffect(() => {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if ("createOscillator();" in lines[i]) {

            }
        }
    }, []);


    return (
        <>
            <div className="leftpage-container">
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
                    onChange={(value, viewUpdate) => {
                        localStorage.setItem('myValue', value);
                        setCode(value);

                        const state = viewUpdate.state.toJSON(stateFields);
                        localStorage.setItem('myEditorState', JSON.stringify(state));
                    }}
                    theme={dracula}
                    height='100vh'
                    mode="javascript"
                    extensions={[javascript({ jsx: true })]}
                />
                <button onClick={run}>Run</button>
            </div>
            <div className="rightpage-container">

            </div>
        </>
    );
}

export default Editor;


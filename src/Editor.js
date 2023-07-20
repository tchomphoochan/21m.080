//8:45
import React, { useState, useEffect, useRef } from 'react';
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

    useEffect(() => {
        return () => {
            try {
                eval(code); // Evaluate the Web Audio code entered by the user
            } catch (error) {
                console.error('Error evaluating Web Audio code:', error);
            }
        };
    }, [code]);


    const handleCodeChange = (value, viewUpdate) => {
        localStorage.setItem('myValue', value);
        setCode(value);

        const state = viewUpdate.state.toJSON(stateFields);
        localStorage.setItem('myEditorState', JSON.stringify(state));
    };

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
                    onChange={handleCodeChange}
                    theme={dracula}
                    height='100vh'
                    mode="javascript"
                    extensions={[javascript({ jsx: true })]}
                />
            </div>
            <div className="rightpage-container">

            </div>
        </>
    );
}

export default Editor;


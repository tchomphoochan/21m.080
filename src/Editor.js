import React, { useState } from 'react';
import axios from "axios";
import CodeMirror from '@uiw/react-codemirror';
import { historyField } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';

const stateFields = { history: historyField };

function Editor() {
    const serializedState = localStorage.getItem('myEditorState');
    const value = localStorage.getItem('myValue') || '//Start coding here!';

    const [code, setCode] = useState(value);

    const submitCode = () => {
        axios.post('http://localhost:80/javascript', { code }).then(({ data }) => {
            console.log(data)
        });
    };

    return (
        <div>
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
                height="100vh"
                extensions={[javascript({ jsx: true })]}
            />
            <div onClick={submitCode}>Submit</div>
        </div>
    );
}

export default Editor;


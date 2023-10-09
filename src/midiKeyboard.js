import { useState, useEffect } from 'react';
import keyboard from './Icons/keyboard.png';

function MidiKeyboard(props) {
    const [midiOn, setMidiOn] = useState(false);
    //const [notesOn, setNotesOn] = useState({});
    var notesOn = {};

    var octave = 4;
    var keyToNote = {
        65: { "midi": 60, "pitch": "C" },
        87: { "midi": 61, "pitch": "C#/Db" },
        83: { "midi": 62, "pitch": "D" },
        69: { "midi": 63, "pitch": "D#/Eb" },
        68: { "midi": 64, "pitch": "E" },
        70: { "midi": 65, "pitch": "F" },
        84: { "midi": 66, "pitch": "F#/Gb" },
        71: { "midi": 67, "pitch": "G" },
        89: { "midi": 68, "pitch": "G#/Ab" },
        72: { "midi": 69, "pitch": "A" },
        85: { "midi": 70, "pitch": "A#/Bb" },
        74: { "midi": 71, "pitch": "B" },
        75: { "midi": 72, "pitch": "B#/Cb" },
    };

    useEffect(() => {
        if (midiOn) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }

        // Cleanup: Remove the event listener when the component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [midiOn]);

    // function noteToFrequency(note) {
    //     return 440 * Math.pow(2, (note - 69) / 12);
    // }

    function keyDownCallBack(midiNote, pitch) {
        try {
            //let audioNode = props.midiDown(`keyDown(${midiNote})`);
            let audioNode = eval(`keyDown(${midiNote})`);
            //setNotesOn((prevNotesOn) => ({ ...prevNotesOn, [pitch]: `keyUp(${audioNode})` }));
            notesOn[pitch] = audioNode;
        } catch {

        }
    }

    function handleKeyDown(event) {
        const keyCode = event.keyCode;
        try {
            let note = keyToNote[keyCode];
            let midiNote = note["midi"] + (octave - 4) * 12;
            let pitch = note["pitch"] + `${octave}`;
            if (midiNote <= 127) {
                keyDownCallBack(midiNote, pitch);
            }
        } catch {
            if (keyCode === 37) {
                decreaseOctave();
            } else if (keyCode === 39) {
                increaseOctave();
            }
        }
    }

    function keyUpCallBack(audioNode) {
        try {
            console.log(audioNode);
            //props.midiUp(func);
            eval();
        } catch {
        }
    }

    function handleKeyUp(event) {
        const keyCode = event.keyCode;
        try {
            let pitch = keyToNote[keyCode]["pitch"] + `${octave}`;
            console.log(notesOn);
            let audioNode = notesOn[pitch];
            keyUpCallBack(audioNode);
            //removeAudioNode(pitch);
        } catch {
            //not midi note OR not playing
        }
    }

    function removeAudioNode(pitch) {
        // setNotesOn((prevNotesOn) => {
        //     const { [pitch]: omit, ...restNotes } = prevNotesOn;
        //     return restNotes;
        // });
        delete notesOn[pitch];
    }

    function increaseOctave() {
        if (octave < 10) {
            octave++;
        }
    }

    function decreaseOctave() {
        if (octave > -1) {
            octave--;
        }
    }

    const midiClicked = () => {
        setMidiOn(!midiOn);
        props.setDisabled(!props.disabled);
    }

    //const buttonCSS = noteOn ? "button-container active" : "invisible-button";
    const keyboardCSS = midiOn ? 'icon active' : 'icon inactive';
    return (
        <div className='span-container'>
            {Object.keys(notesOn).map((pitch, index) => (
                <div key={index}>{pitch}</div>
            ))}
            <button className="invisible-button" onClick={midiClicked} >
                <img className={keyboardCSS} src={keyboard} alt="Keyboard" />
            </button>
        </div>
    );
}

export default MidiKeyboard;
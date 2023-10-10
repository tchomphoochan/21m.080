import { useState, useEffect } from 'react';
import keyboard from './Icons/keyboard.png';
const midi = require('./Midi.js');

function MidiKeyboard() {
    const [midiOn, setMidiOn] = useState(false);
    const [noteOn, setNoteOn] = useState(false);
    const [midiInputs, setMidiInputs] = useState([]);
    const [currInput, setCurrInput] = useState('');

    let activeKeys = {}

    var octave = 3;
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
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

    function noteToFrequency(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    function playOscillator(midiNote) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // You can change the oscillator type
        oscillator.frequency.setValueAtTime(noteToFrequency(midiNote), audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        setNoteOn(false);
    }

    function handleKeyDown(event) {
        const keyCode = event.keyCode;

        if(!activeKeys[keyCode]){
            activeKeys[keyCode] = true

            try {
                let note = keyToNote[keyCode];
                let midiNote = note["midi"] + (octave - 4) * 12;
                let pitch = note["pitch"] + `${octave}`;
                if (midiNote <= 127 ) {
                    midi.midiHandlerInstance.handleNoteOn(midiNote,100)
                    activeKeys.push(pitch)
                    // setNoteOn(pitch);
                    // playOscillator(midiNote);
                }
            } catch {
                if (keyCode === 37) {
                    decreaseOctave();
                } else if (keyCode === 39) {
                    increaseOctave();
                }
            }
        }
    }

    function handleKeyUp(event) {
        const keyCode = event.keyCode;
        activeKeys[keyCode] = false

        try {
            let note = keyToNote[keyCode];
            let midiNote = note["midi"] + (octave - 4) * 12;
            let pitch = note["pitch"] + `${octave}`;
            if (midiNote <= 127) {
                midi.midiHandlerInstance.handleNoteOff(midiNote,0)
                // setNoteOn(pitch);
                // playOscillator(midiNote);
            }
        } catch {
        }
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
    }

    const buttonCSS = noteOn ? "button-container active" : "invisible-button";
    const keyboardCSS = midiOn ? 'icon active' : 'icon inactive';
    return (
        <button className={buttonCSS} onClick={midiClicked} >
            {noteOn !== false ? (
                <div>{noteOn}</div>
            ) : (
                <img className={keyboardCSS} src={keyboard} alt="Keyboard" />
            )}
        </button>
    );
}

export default MidiKeyboard;
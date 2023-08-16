import React from 'react';
import Editor from './Editor.js'


// import { midi, onMIDISuccess, onMIDIFailure, setMidiInput, setMidiOutput, getMidiIO,
// 	handleMidiInput, outputMidiID, midiMap, ccMap, stopMap, mute, muted, toggleMute } from "./midiCoder/midi_control.js";
// import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from './midiCoder/seq_control.js'
// import { makingIf, startTern } from "./midiCoder/algorithm_control.js";
// import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"
// import {floor, ceil, peak, cos, round, trunc, abs} from './midiCoder/midi_math.js';

function App() {

  return (
    <Editor />
  );
}
export default App;

/*
<title>CodeMirror</title>
  <script src="../plugin/codemirror5/lib/codemirror.js"></script>
  <link rel="stylesheet" type="text/css" href="../plugin/codemirror5/lib/codemirror.css">
  <script src="../plugin/codemirror5/mode/javascript/javascript.js"></script>
*/
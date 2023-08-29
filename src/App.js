import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './Editor.js';
import Navbar from './Navbar.js';
import NotFound from "./pages/NotFound.js";

// import { midi, onMIDISuccess, onMIDIFailure, setMidiInput, setMidiOutput, getMidiIO,
// 	handleMidiInput, outputMidiID, midiMap, ccMap, stopMap, mute, muted, toggleMute } from "./midiCoder/midi_control.js";
// import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from './midiCoder/seq_control.js'
// import { makingIf, startTern } from "./midiCoder/algorithm_control.js";
// import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"
// import {floor, ceil, peak, cos, round, trunc, abs} from './midiCoder/midi_math.js';

function App() {
  const [page, setPage] = useState('Home');

  useEffect(() => {

  }, []);

  // window.addEventListener('beforeunload', () => {
  //   localStorage.setItem("projects", JSON.stringify(projects));
  //   localStorage.setItem("currProject", JSON.stringify(currProject));
  // });

  return (
    <div className="outer-container">
      <Navbar page={page} setPage={setPage} />
      <Router>
        <Routes>
          <Route path="/" element={<Editor canvases={["Canvas1", "Canvas2", "Canvas3"]} />} />
        </Routes>
      </Router>
    </div>
  );
}
export default App;

/*
<title>CodeMirror</title>
  <script src="../plugin/codemirror5/lib/codemirror.js"></script>
  <link rel="stylesheet" type="text/css" href="../plugin/codemirror5/lib/codemirror.css">
  <script src="../plugin/codemirror5/mode/javascript/javascript.js"></script>
*/
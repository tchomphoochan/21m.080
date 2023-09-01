import React, { useEffect, useState } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './Editor.js';
import Navbar from './Navbar.js';
import Template from './pages/Template.js';

// import { midi, onMIDISuccess, onMIDIFailure, setMidiInput, setMidiOutput, getMidiIO,
// 	handleMidiInput, outputMidiID, midiMap, ccMap, stopMap, mute, muted, toggleMute } from "./midiCoder/midi_control.js";
// import { Seq, seqs_dict, checkSeqs, _, stopEverything, reset} from './midiCoder/seq_control.js'
// import { makingIf, startTern } from "./midiCoder/algorithm_control.js";
// import { createStarterText, starterCode } from  "./midiCoder/starterCode.js"
// import {floor, ceil, peak, cos, round, trunc, abs} from './midiCoder/midi_math.js';

function App() {
  const location = useLocation();
  const initialPage = location.pathname.substring(1);
  const [page, setPage] = useState(initialPage || 'Home');
  const [assignments, setAssignments] = useState({});
  const [examples, setExamples] = useState({});

  const exampleFiles = [
    'Oscillator',
  ];
  const assignmentFiles = [];

  useEffect(() => {
    const importFiles = async (files, folder) => {
      const fetchedAssignments = {};

      for (const fileName of files) {
        try {
          const descriptionRes = await fetch(`${process.env.PUBLIC_URL}/${folder}/${fileName}.txt`);
          const starterCodeRes = await fetch(`${process.env.PUBLIC_URL}/${folder}/${fileName}.js`);

          if (!descriptionRes.ok || !starterCodeRes.ok) {
            throw new Error('Fetching files failed');
          }

          const description = await descriptionRes.text();
          const starterCode = await starterCodeRes.text();

          fetchedAssignments[fileName] = {
            description,
            starterCode,
            canvases: [fileName],
          };
        } catch (error) {
          console.error(`Error importing ${fileName}:`, error);
        }
      }
      return fetchedAssignments;
    };

    (async () => {
      const assignments = await importFiles(assignmentFiles, 'assignments');
      const examples = await importFiles(exampleFiles, 'examples');

      setAssignments(assignments);
      setExamples(examples);
    })();
  }, []);

  return (
    <div className="outer-container">
      <Navbar assignments={assignments} examples={examples} page={page} setPage={setPage} />
      <Routes>
        <Route path="/" element={<Editor page={page} starterCode={"//Start Coding Here!"} canvases={["Canvas1", "Canvas2", "Canvas3"]} />} />
        {Object.entries(assignments).map(([title, props]) => (
          <Route path={`/${title}`} element={<Template title={title} description={props.description} starterCode={props.starterCode} canvases={props.canvases} />} />
        ))}
        {Object.entries(examples).map(([title, props]) => (
          <Route path={`/${title}`} element={<Template title={title} description={props.description} starterCode={props.starterCode} canvases={props.canvases} />} />
        ))}
      </Routes>
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
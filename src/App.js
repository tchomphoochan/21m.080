import React, { useEffect, useState } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './Editor.js';
import Navbar from './Navbar.js';
import Template from './pages/Template.js';
import TableOfContents from './pages/TableOfContents.js';
import { marked } from 'marked';

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
  const [markdownContent, setMarkdownContent] = useState("");

  const exampleFiles = [
    'Oscillator',
  ];
  const assignmentFiles = [];

  const homeStarterCode = `/*
  Alt-Enter: Evaluate Line in Live Mode
  Alt-Shift-Enter: Evaluate Block in Live Mode
*/`;

  useEffect(() => {
    const importFiles = async (files, folder) => {
      const fetchedAssignments = {};

      for (const fileName of files) {
        try {
          const introRes = await fetch(`${process.env.PUBLIC_URL}/${folder}/${fileName}/Intro.txt`);
          const starterCodeRes = await fetch(`${process.env.PUBLIC_URL}/${folder}/${fileName}/StarterCode.js`);
          const descriptionRes = await fetch(`${process.env.PUBLIC_URL}/${folder}/${fileName}/Description.txt`);

          if (!introRes.ok || !starterCodeRes.ok || !descriptionRes.ok) {
            throw new Error('Fetching files failed');
          }

          const intro_raw = await introRes.text();
          const intro = marked(intro_raw);
          const starterCode = await starterCodeRes.text();
          const description_raw = await descriptionRes.text();
          const description = marked(description_raw);

          fetchedAssignments[fileName] = {
            intro,
            starterCode,
            description,
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
      <Navbar page={page} setPage={setPage} />
      <Routes>
        <Route path="/" element={<Editor page={page} starterCode={homeStarterCode} canvases={["Canvas1", "Canvas2", "Canvas3"]} />} />
        <Route path="/TableOfContents" element={<TableOfContents assignments={assignments} examples={examples} setPage={setPage} />} />
        {Object.entries(assignments).map(([title, props]) => (
          <Route path={`/${title}`} element={<Template title={title} intro={props.intro} starterCode={props.starterCode} description={props.description} canvases={props.canvases} />} />
        ))}
        {Object.entries(examples).map(([title, props]) => (
          <Route path={`/${title}`} element={<Template title={title} intro={props.intro} starterCode={props.starterCode} description={props.description} canvases={props.canvases} />} />
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
//http-server -o midi.html -p 8000
var midi = null;  // global MIDIAccess object
var outputIds = [];
var pop = false;
var dialOffset = 21;
var padOffset = 36;
var lastNoteVal = 0;
var enableInd = 0;
var selectedSeq = null;
var globalClock = 0;
var beatsPerMeasure = 4;
var beat = 0;
var noteOns = [];
var _ = -999999999;
var midiClock = false;
var clockWorker = null;
var tempo = 60;
var mute = false;
var mapping = false;

//send note offs when tab is closed
addEventListener("unload", (event) => {stopEverything();});

var context = new (window.AudioContext || window.webkitAudioContext);
Tone.context = context;

function onMIDISuccess(midiAccess) {
	console.log("MIDI ready!");
	midi = midiAccess;  // store in the global
	Tone.Transport.start()

	initializeCodeBox();
	setupClock();

}
function onMIDIFailure(msg) {
	console.error(`Failed to get MIDI access - ${msg}`);
}

function setMidiInput(inputID) {
	//in case only one id is inputted, turn into array
	if(!Array.isArray(inputID)){ 
		inputID = [inputID];
	}

	//reset inputs
	midi.inputs.forEach(function(key, val){
		console.log(key)
		key.onmidimessage = null;
	})

	for(var id of inputID){
		if(id in midi_input_ids & midi.inputs.get(midi_input_ids[id]) != null){
			midi.inputs.get(midi_input_ids[id]).onmidimessage = handleMidiInput;
			console.log("MIDI input set to: " + midi_input_names[id]);
		} else {
			console.warn('Invalid input ID');
		}
	}
}
function setMidiOutput(outputID) {
	if (Array.isArray(outputID)) {
		console.warn('Can only handle one MIDI output. Please enter one ID.')
	}
	if(outputID in midi_output_ids & midi.outputs.get(midi_output_ids[outputID]) != null){
		outputMidiID = midi_output_ids[outputID];
		console.log("MIDI output set to: " + midi_output_names[outputID]);
	} else {
		console.warn('Invalid output ID');
	}
}

function setupClock() {
	if (window.Worker) {
		clockWorker = new Worker('clockWorker.js');

		clockWorker.onmessage = (event) => {
			if (!midiClock) {
				onClock();
			}
			const currentTime = event.data;
			// clockElement.textContent = currentTime.toLocaleTimeString();
		};

		clockWorker.postMessage({ type: 'start', interval: 1 / (tempo / 60) * 1000 / 24 });

		//   clockElement.textContent = currentTime.toLocaleTimeString();

		// clockWorker.postMessage('start');
	} else {
		// Fallback for browsers that don't support Web Workers
		console.warn("browser doesn't support internal clock");
		// setInterval(() => {
		//   const currentTime = new Date();
		//   clockElement.textContent = currentTime.toLocaleTimeString();
		// }, 1000);
	}
}

function changeTempo(tempo) {
	var interval = 1 / (tempo / 60) * 1000 / 24;
	clockWorker.postMessage({ type: 'changeInterval', interval: interval });
}

function handleMidiInput(message) {
	if (message.data[1] != null) {
		document.getElementById("lastMidi").innerHTML = [message.data[0], message.data[1], message.data[2]];
	}
	if (midiClock) {
		getMIDIClock(message);
	}
	midiReset(message);
	handleNote(message);
}

function onClock() {
	//start new seqs
	if (globalClock % (24 * beatsPerMeasure) == 0) {
		// console.log(seqsToStart);
		// console.log(seqs);
		for (var key in seqsToStart) {
			if (key in seqs_dict) {
				seqs_dict[key].stop();
			}
			seqs_dict[key] = seqsToStart[key];
			seqs_dict[key].start();
		}
		seqsToStart = {};
	}
	// console.log('tick');
	globalClock += 1;
	checkSeqs();
	if (mapping != false & globalClock % 10 == 0) {
		console.log('sending');
		const message = [mapping[0], mapping[1], 1];    // 0x80 note off + channel, midi pitch num, velocity
		var output = midi.outputs.get(outputMidiID);
		output.send(message);
	}
}

function getMIDIClock(message) {
	var command = message.data[0];
	if (command == 248) {
		onClock();
	}
	if (globalClock % 24 == 0) {
		beat += 1;
	}

}

function midiReset(message) {
	var command = message.data[0];
	if (command == 250) {
		console.log("midi start");
		reset();
	} else if (command == 255) {
		console.log("midi reset");
		reset();
	}

}

function handleNote(message){
	var command = message.data[0];
	var note = message.data[1];
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
	if (command>=144){ //may be higher than 144 depending on channel number
		for (var key in seqs_dict) {
		var seq = seqs_dict[key];
		if(seq.repopulating){
			seq.newVals.push(note);
		}
		if(seq.inserting){
			seq.vals.push(note);
		}
		
	}
	}
}

function midiMap(num) {
	mapping = [0x90, num];
	mute = true;
}

function ccMap(num) {
	mapping = [0xB0, num];
	mute = true;
}

function stopMap() {
	//stop last message just in case
	const noteOffMessage = [0x80, mapping[1], 0];    // 0x80 note off + channel, midi pitch num, velocity
	var output = midi.outputs.get(outputMidiID);
	output.send(noteOffMessage);

	mapping = false;
	mute = false;
}

function mute() {
	mute = true;
}

function unmute() {
	mute = false;
}

function toggleMute() {
	mute = !mute;
}

function checkChannel(channel) {
	if (channel > 16) {
		console.warn("Cannot have a channel larger than 16. Using channel 1.");
		channel = 1;
	} else if (channel <= 0) {
		channel = 1;
	}
	return channel
}


function checkSeqs() {
	for (var key in seqs_dict) {
		var seq = seqs_dict[key];
		if (seq.timeForNext()) {
			seq.callback();
			seq.executeStep();
		}
		if(seq.restarted){
			seqsToStart[key] = seq;
			seq.restarted = false;
		}
	}
}

function reset() {
	for (var key in seqs_dict) {
		seqs_dict[key].reset();
	}
	globalClock = 0;
}

document.getElementById("play-button").addEventListener("click", async function () {
	if (Tone.Transport.state !== 'started') {
		await Tone.start();
		Tone.Transport.start();
		console.log('started');
	} else {
		Tone.Transport.stop();
	}
});

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

var seqs = []
var seqs_dict = {};

class Seq {
	constructor(vals, durs = 1 / 4, channel = 0) {
		this.vals = vals;
		this.durs = durs;
		this.noteInd = 0;
		this.dursInd = 0;
		this.noteInc = 1;
		this.durInc = 1;
		this.repopulating = false;
		this.inserting = false;
		this.stopped = false;
		this.nextValTime = globalClock
		this.channel = channel;
		this.velocity = 127;
		this.controllerNum = 7; //volume
		this.restarted = false;
		this.monitor = true;
		this.newVals = [];
		// this.waitingToStart = true;
		this.lastNoteSent = null;
		if (channel > 16) {
			console.warn("Cannot have a channel larger than 16. Setting channel to 1.");
			this.channel = 1;
		}
		this.stepFunc = this.sendNote;
	}

	executeStep() {
		this.stepFunc();

		// this.vals is the values in the array, show the array in the console but make the font of the note that is currently playing bigger
		var vals = this.vals.slice();
		vals[this.noteInd] = " [" + vals[this.noteInd] + "] ";
		// console.log('values: ' + vals);
		// console.log('durations: ' + this.durs);
		
		var html = 'values: ';
		for (var i = 0; i < vals.length; i++) {
			if (i == vals.length - 1) {
				html += vals[i];
				break;
			}
			html += vals[i] + ', ';
		}
		html += '<br>';
		// html += 'durations: ' + this.durs + '<br>';

		html += 'durations: ';
		var durss = '';
		for (var i = 0; i < this.durs.length; i++) {
			if (i == this.durs.length - 1) {
				durss += this.durs[i];
				break;
			}
			durss += this.durs[i] + ', ';
		}

		if (durss == '') {
			durss = '0.25';
		}

		html += durss;

		document.getElementById('console').innerHTML = html;
		

	}
		
		
	

	sendNoteOff(noteNum) {
		if (noteNum == null | noteNum < 0) {
			return;
		}
		var channel = checkChannel(this.channel);
		const noteOffMessage = [0x80 + channel - 1, noteNum, 0];    // 0x80 note off + channel, midi pitch num, velocity
		var output = midi.outputs.get(outputMidiID);
		output.send(noteOffMessage);
	}

	//called for every note right before execution
	transform(x) {
		return x;
	}

	sendNote() {
		this.sendNoteOff(this.lastNoteSent, this.channel);

		var noteNum = this.nextVal();
		var velocity = this.velocity;
		// this.lastNoteSent = noteNum;

		if (noteNum == null) {
			return;
		}
		noteNum = this.transform(noteNum);
		if (noteNum < 0) {
			return;
		}

		if (mute) {
			return;
		}

		var channel = checkChannel(this.channel);
		const noteOnMessage = [0x90 + channel - 1, noteNum, velocity];    // 0x90 note on + channel, midi pitch num, velocity
		var output = midi.outputs.get(outputMidiID);
		output.send(noteOnMessage);

		this.lastNoteSent = noteNum;

		//for console logging
		var bar = Math.floor(globalClock / (beatsPerMeasure * 24));
		var beat = Math.floor(globalClock / 24) - bar * beatsPerMeasure + 1;
		bar = bar + 1; //want bar 0 to be bar 1
		if(this.monitor) console.log('bar: ' + bar + ' beat: ' + beat + ' pitch: ' + noteNum, ' velocity: ' + velocity);
	}

	sendCC() {
		var val = this.transform(this.nextVal());
		var paramNum = this.controllerNum;
		var channel = checkChannel(this.channel);
		const ccMessage = [0xB0 + channel - 1, paramNum, val];    // 0xB0 CC + channel, controller number, data

		if (mute) {
			return;
		}

		var output = midi.outputs.get(outputMidiID);
		output.send(ccMessage);
		console.log(ccMessage);
	}

	timeForNext() {
		if (this.stopped) {
			return false;
		}
		if (this.nextValTime <= globalClock) {
			return true;
		} else {
			return false;
		}
	}

	nextVal() {
		if (this.vals.length === 0) {
			this.noteInd = 0;
			return null;
		}
		var note = this.vals[this.noteInd]
		//this.noteInd = (this.noteInd + 1) % this.vals.length
		//below removes increment and moves this to updateNoteIndex()
		this.updateNoteIndex() 
		while(this.noteInd < 0) this.noteInd+=this.vals.length //handle negative indexes
		this.noteInd = (this.noteInd) % this.vals.length 

		var nextStep = null;
		if (typeof this.durs !== 'number') {
			nextStep = this.durs[this.dursInd];
		} else {
			nextStep = this.durs;
		}
		this.nextValTime = globalClock + nextStep * 24 * 4;

		//take care of incrementing durssation index in case where durss is an array
		this.updateDurIndex()
		if (typeof this.durs !== 'number') {
			this.dursInd = (this.dursInd ) % this.durs.length
		}

		return note
	}

	updateNoteIndex() {this.noteInd += this.noteInc}
	updateDurIndex() {this.durInd += this.durInc}

	repopulate() {
		this.newVals = [];
		this.repopulating = true;
	}

	stopPop() {
		if(this.noteInd>=this.newVals.length){
			this.noteInd = this.newVals.length-1;
		}
		this.vals = this.newVals;
		this.repopulating = false;
	}

	appendNote(note) {
		this.vals.push(note);
	}

	// insertNoteAt(arrayInd) {
	// 	this.inserting = arrayInd;
	// }

	// insertNote(note) {
	// 	this.vals.splice(this.inserting, 0, note);
	// 	this.inserting = false;
	// }

	stop() {
		this.stopped = true;
		this.sendNoteOff(this.lastNoteSent, this.channel);
	}

	start() {
		this.stopped = false;
	}

	reset() {
		// console.log('reset');
		this.noteInd = 0;
		this.dursInd = 0;
		this.nextValTime = 0; //this.nextValTime - globalClock;
		this.sendNoteOff(this.lastNoteSent, this.channel);
		this.restarted = true;
		this.stop();
	}

	// addFunction(funcName, func) {
	// 	this[funcName] = func;
	// }

	addFunction(func) {
		this['callback'] = func;
	}

	callback() {
		//console.log('here');
		return;
	}

}

function changeTimeSig(timeSig) {
	reset();
}

//for user to access
// function sendMidiMessage(note, velocity, channel) {
// 	sendNote(note, velocity, channel);
// }

seqsToStart = {}

function runCode(code) {
	var result = eval(code);
	var assignments = code.match(/(\s+(\w+)\s*=\s*([^;]+))|((\w+)\s*=\s*([^;]+))/g);
	if (assignments) {
		for (var i = 0; i < assignments.length; i++) {
			var assignment = assignments[i].match(/(\w+)\s*=\s*([^;]+)/);

			if (assignment) {
				var variableName = assignment[1];
				//if it's a sequencer, add to list
				try {
					if (eval(variableName) instanceof Seq) {
						seqsToStart[variableName] = eval(variableName);
					}
				} catch {
				}
			}
		}
	}

}


function evaluateBlock() {
	try {
		var positions = [];
		let linepos = editor.getCursor().line;
		var line = editor.getLine(linepos);
		while (line.replace(/\s/g, "") != '') {
			positions.push(linepos);
			linepos = linepos - 1;
			line = editor.getLine(linepos);
			if (line == undefined) {
				break;
			}
		}
		linepos = editor.getCursor().line + 1
		line = editor.getLine(linepos)
		if (line != undefined) {
			while (line.replace(/\s/g, "") != '') {
				positions.push(linepos);
				linepos = linepos + 1;
				line = editor.getLine(linepos);
				if (line == undefined) {
					break;
				}
			}
		}
		positions.sort();
		var codeToRun = ';'
		for (var position of positions) {
			codeToRun += editor.getLine(position) + '\n';
		}
		runCode(codeToRun);
	} catch (e) {
		console.error(e);
	}

}

function evaluateLine() {
	try {
		let pos = editor.getCursor()
		var line = editor.getLine(pos.line)
		runCode(line);
	} catch (e) {
		console.error(e);
	}

}

function evaluateCode() {
	var code = editor.getValue();
	try {
		runCode(code);
	} catch (e) {
		console.error(e);
	}
}

function stopEverything() {
	for (var key in seqs_dict) {
		seqs_dict[key].stop();
	}
	seqs_dict = {};
}

midi_input_ids = {};
midi_output_ids = {};
midi_input_names = {};
midi_output_names = {};
editor = null;
function initializeCodeBox() {
	title = '//Web Audio live coding interface\n';
	subtitle = '//Works with web audio API and tone.js\n\n';
	instructions = '//To run code:\n//Ctrl-Enter: Run selected line\n//Alt-Enter: Run selected block\n'
	midiInputs = '//MIDI Inputs:\n';
	midiOutputs = '//MIDI Outputs:\n';
	inputID = null;
	outputID = null;

	var num = 1;
	for (var output of midi.outputs) {
		midiOutputs += '//' + num + ': ' + output[1].name + '\n'; //+ '\', ID: \'' + output[1].id + '\'\n';
		outputID = output[1].id;
		midi_output_ids[num]=outputID;
		midi_output_names[num] = output[1].name;
		num += 1;
	}

	num = 1;
	for (var input of midi.inputs) {
		midiInputs += '//' + num + ': ' + input[1].name + '\n'; // + '\', ID: \'' + input[1].id + '\'\n';
		inputID = input[1].id;
		midi_input_ids[num]=inputID;
		midi_input_names[num] = input[1].name;
		num += 1;
	}

	audioCodeExample = [ 
		'osc = context.createOscillator()\nosc.start()\n',
		'volume = context.createGain()\n',
		'volume.gain.value = 0.1\n',
		'osc.connect( volume )\n\n',
		'volume.connect( context.destination )\n'
		];
	code = ''
	for (i=0;i<audioCodeExample.length;i++) code = code + audioCodeExample[i]

	editor = CodeMirror(document.body, {
		extraKeys: {
			'Ctrl-Enter': evaluateLine,
			//'Shift-Enter': evaluateCode,
			'Ctrl-.': stopEverything,
			'Alt-Enter': evaluateBlock
		},
		value: title + subtitle + '\n' + instructions + '\n' + code + '\n',
		mode: "javascript"
	});
	editor.setSize()
}

function addToEditor(stringToAdd){
	var lineCount = editor.lineCount(); // Get the total number of lines
	var lastLine = editor.getLine(lineCount - 1); // Get the content of the last line
	var lastLineEnd = editor.posFromIndex(editor.indexFromPos({ line: lineCount - 1, ch: 0 })) + lastLine.length; // Calculate the end position of the last line

	var newLineContent = stringToAdd; // The content of the new line

	// Add the new line at the end
	editor.replaceRange("\n" + newLineContent, editor.posFromIndex(lastLineEnd));

	// Update line numbers
	editor.refresh();
}

function replaceLastLine(stringToReplace){
	var lineCount = editor.lineCount(); // Get the total number of lines
	var lastLine = lineCount - 1; // Index of the last line
	var lastLineText = editor.getLine(lastLine); // Get the content of the last line
	var lastLineStart = { line: lastLine, ch: 0 }; // Start position of the last line
	var lastLineEnd = { line: lastLine, ch: lastLineText.length }; // End position of the last line
	
	// Replace the entire contents of the last line with the new content
	editor.replaceRange(stringToReplace, lastLineStart, lastLineEnd);

	// Update line numbers
	editor.refresh();
}

function createForLoop(){
	var curStr = 'for('
	addToEditor(curStr);
}

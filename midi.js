// import ctx from '/node_modules/src/zyklus';
// require('node_modules/zyklus');
//http-server -o index.html -p 8000
var midi = null;  // global MIDIAccess object
var outputIds = [];
var midiState = Array(128).fill(0);
var pop = false;
var noteInd = 0;
var curSeq = [60, 60, 60, 60];
var newSeq = [];
var tempo = 150;
var durInd = 0;
var secsPerBeat = 60 / tempo;
var curSeqDurs = new Array(8).fill(1); //1 is quarter note, .5 is eight, .25 is sixteenth
var newSeqDurs = [];
Tone.Transport.bpm.value = tempo * 4;
var midiDict = {};
var dialOffset = 21;
var padOffset = 36;
var lastNoteVal = 0;
var enableInd = 0;
var curSeqEnable = new Array(8).fill(1);
var outputMidiID = 'output-1';
var selectedSeq = null;
const range = (start, end, length = end - start + 1) =>
	Array.from({ length }, (_, i) => start + i)

function onMIDISuccess(midiAccess) {
	console.log("MIDI ready!");
	midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
	console.log(midi);
	midiAccess.inputs.get('input-1').onmidimessage = getMIDIMessage;
	for (var output of midiAccess.outputs) {
		outputIds.push(output[1].id);
		console.log(output[1])
		if(output[1].name==="LoopMIDI Port"){
			outputMidiID = output[1].id;
			// console.log(output[1].id);
		}
	}
	Tone.Transport.start()
	// populateHTMLList();
	// document.getElementById("curSeq").innerHTML = curSeq;
	// document.getElementById("curSeqDurs").innerHTML = curSeqDurs;
	// document.getElementById("curSeqEnable").innerHTML = curSeqEnable;

}
function onMIDIFailure(msg) {
	console.error(`Failed to get MIDI access - ${msg}`);
}

// const clock = ctx
//   .createClock((time, duration, tick) => {
//     console.log(time, duration, tick);
//   }, 0.2)
//   .start();

function getMIDIMessage(message) {
	var command = message.data[0];
	var note = message.data[1];
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

	if(note!=null){
		document.getElementById("lastMidi").innerHTML = [command, note, velocity];
	}

	// if (command !== 248) {
	// 	console.log(command);
	// 	console.log(note);
	// 	console.log(velocity);
	// }

	switch (command) {
		case 144: // noteOn
			if (velocity > 0) {
				console.log(note);
				//midi monitor
				midiState[note - 1] = 1;
				// document.getElementById("midimonitor").getElementsByTagName("li")[note - 1].innerHTML = "1";
				// document.getElementById("midimonitor").getElementsByTagName("li")[note - 1].style.color = "red";

				//populate array
				// if (pop) {
				// 	if (newSeq.length < curSeq.length) {
				// 		newSeq.push(note);
				// 	} else {
				// 		pop = false;
				// 	}
				for(let i = 0; i<seqs.length;i++){
					if(seqs[i].repopulating===true){
						seqs[i].addNote(note);
					}else if(seqs[i].inserting!==false){
						seqs[i].insertNote(note);
					}
				}
				

					// document.getElementById("newSeq").innerHTML = newSeq;
				}
			// } else {
			// 	midiState[note - 1] = 0;
			// 	// document.getElementById("midimonitor").getElementsByTagName("li")[note - 1].style.color = "black";
			// 	// document.getElementById("midimonitor").getElementsByTagName("li")[note - 1].innerHTML = "0";
			// }
			break;
		case 128: // noteOff
			midiState[note - 1] = 0;
			// document.getElementById("midimonitor").getElementsByTagName("li")[note - 1].style.color = "black";
			// document.getElementById("midimonitor").getElementsByTagName("li")[note - 1].innerHTML = "0";
			break;
		case 176: //capture
			switch (note) {
				case 117:
					if (velocity === 127) {
						pop = !pop;
						newSeq = [];
						// document.getElementById("newSeq").innerHTML = newSeq;
					}
					break;
				case 21: case 22: case 23: case 24: case 25: case 26: case 27: case 28: case 29: //TODO: please rewrite this
					if(selectedSeq!==null){
						if(selectedSeq<seqs.length){
							// console.log(selectedSeq);
							if((note-21)<seqs[selectedSeq].notes.length){
								seqs[selectedSeq].notes[note-21] = velocity;
							}
						}
					}
					// var ind = note - dialOffset;
					// curSeqDurs[ind] = Math.round((velocity / 127 * 3.75 + .25)/.25)*.25;
					// break;
			}
		case 153: // noteOff
			if(seqs.length>note-36 & note>=36){
				console.log(note);
				selectedSeq = note-36;
				document.getElementById("selectedSeq").innerHTML = selectedSeq;
			}
			// if(note>=36 & note<=39){
			// 	var ind = note - padOffset;
			// 	// console.log(ind);
			// 	curSeqEnable[ind] = curSeqEnable[ind]===1 ? 0 : 1;
			// 	// console.log(velocity/127*4)

			// }
			// if(note>=44 & note<=47){
			// 	var ind = note - padOffset;
			// 	// console.log(ind-4);
			// 	curSeqEnable[ind-4] = curSeqEnable[ind-4]===1 ? 0 : 1;
			// 	// console.log(velocity/127*4)

			// }
			// break;
	}
}

function sendNote(midiAccess, noteNum, velocity) {
	const noteOnMessage = [0x90, noteNum, velocity];    // note on, midi pitch num, full velocity
	// console.log(noteNum);
	var output = midiAccess.outputs.get(outputMidiID);
	// console.log(outputMidiID);
	output.send(noteOnMessage);
}

// const noteLoop = new Tone.Loop(time => {
// 	// console.log(time); //Tone.Time(time).toNotation())
// if (Tone.Time(time) >= curSeqDurs[durInd]*secsPerBeat + lastNoteVal) {
// 	// console.log(curSeqEnable);
// }
// }, "16n").start(0);

const controlLoop = new Tone.Loop(time => {
	// document.getElementById("curSeqDurs").innerHTML = curSeqDurs;
	// document.getElementById("curSeqEnable").innerHTML = curSeqEnable;
	
	if (Tone.Time(time) >= curSeqDurs[noteInd]*secsPerBeat + lastNoteVal) {
		noteInd += 1;
		noteInd = noteInd % curSeq.length;
		// for(let i = 0; i<seqs.length;i++){
		// 	console.log(seqs[i].notes);
		// }
		// sendNote(midi, curSeq[noteInd], curSeqEnable[noteInd] * 127);
		// console.log(seqs_dict)
		for(var key in seqs_dict){ //let i = 0; i<seqs_dict.length;i++){
			// console.log(key)
			if(seqs_dict[key].timeForNext()){
				let note = seqs_dict[key].nextNote()
				sendNote(midi, note, 127);
				// console.log(seqs_dict[key].notes);
				console.log(note)
			}
		}
		if (newSeq.length === curSeq.length && noteInd === 0) {
			curSeq = newSeq;
			newSeq = [];
			// pop = false;
			// document.getElementById("curSeq").innerHTML = curSeq;
			// document.getElementById("newSeq").innerHTML = newSeq;
		}
		lastNoteVal = Tone.Time(time)
	}
}, "16n").start(0);
//can you assign rate to variable and update

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

// function populateHTMLList() {
// 	let list = document.getElementById("midimonitor");
// 	midiState.forEach((item) => {
// 		let li = document.createElement("li");
// 		li.innerText = item;
// 		list.appendChild(li);
// 	})
// }

var seqs = []
var seqs_dict = {};

// class Seq{
// 	constructor(notes){
// 		this.seq = new SeqStruct(notes);
// 		seqs.push(this.seq)
// 	}

// 

class Seq {
	constructor(notes, dur=1){
		this.notes = notes;
		this.dur = dur;
		this.noteInd = 0;
		this.durInd = 0;
		this.timeSinceLast = 0;
		this.repopulating = false;
		this.inserting = false;
		this.stopped = false;
		// seqs.push(this);
	}

	timeForNext(){
		if(this.stopped){
			return false;
		}
		var nextStep = null;
		if(typeof this.dur !== 'number'){
			nextStep = this.dur[this.durInd];
		}else{
			nextStep = this.dur;
		}
		this.timeSinceLast += 1;
		if(this.timeSinceLast===nextStep){
			return true;
		}else{
			return false;
		}
	}

	nextNote(){
		if(this.notes.length===0){
			this.noteInd=0;
			return null;
		}
		var note = this.notes[this.noteInd]
		this.noteInd = (this.noteInd+1)%this.notes.length

		//take care of incrementing duration index in case where dur is an array
		if(typeof this.dur !== 'number'){
			this.durInd = (this.durInd+1)%this.dur.length
		}
		this.timeSinceLast=0;
		return note
	}

	repopulate(){
		this.notes = [];
		this.repopulating = true;
	}

	stopPop(){
		this.repopulating = false;
	}

	addNote(note){
		this.notes.push(note);
	}

	insertNoteAt(arrayInd){
		this.inserting = arrayInd;
	}

	insertNote(note){
		this.notes.splice(this.inserting, 0, note);
		this.inserting=false;
	}

	stop(){
		this.stopped=true;
	}
	
	start(){
		this.stopped=false;
	}

	static addFunction(funcName, func){
		this.prototype[funcName] = func;
	}
}

var evalEnv = {};

function evaluateLine(){
	try{
	let  pos = editor.getCursor()
	var line = editor.getLine( pos.line )
	eval(line);
	}catch (e) {
		console.error(e);
	 }

}

function matchFunction(funcName){		
	variables = [];
	var stops = code.match(new RegExp('(\w+)\.'+funcName+'\(\);)')); ///((\w+)\.stop\(\);)/g) 
	if(stops){
	for (var i = 0; i < stops.length; i++) {
		var stop = stops[i].match(new RegExp('(\w+)\.'+funcName+'\(\);)'));
		if(stop){
			variableName=stop[2];
			variables.push(variableName);
		}
	}
}
return variables;

}

function evaluateCode() {
   var code = editor.getValue();
   try {
		var result = eval(code);
	
	//  console.log(evalEnv);
	//  var assignment = code.match(/var|let\s+(\w+)\s*=\s*([^;]+)/g);
	 
	//  console.log(assignment);
	//  if(assignments){
	// 	for (var i = 0; i < assignments.length; i++) {
	// 	  var variableName = assignments[i][2];
	// 	  var variableValue = eval(assignments[i][3]);
	// 	  console.log("var name: " + variableName + " val: " + variableValue);
	// 	  evalEnv[variableName] = variableValue;
	// 	}

	//  }

   //  // update evalEnv with new variable assignments
   var assignments = code.match(/(\s+(\w+)\s*=\s*([^;]+))|((\w+)\s*=\s*([^;]+))/g);
   //  // Update evalEnv with new variable assignments and updates
    if (assignments) {
      for (var i = 0; i < assignments.length; i++) {
         var assignment = assignments[i].match(/(\w+)\s*=\s*([^;]+)/);

         if (assignment) {
            var variableName = assignment[1];
				var variable = assignment[2];
            //  var variableValue = eval(assignment[3]);
				seqs_dict[variableName] = eval(variableName);
				// console.log(seqs_dict)
					// seqs.push(eval(variableName))     
        }
      }
	}

	// stops = matchFunction("stop");
	// for(var i = 0; i < stops.length; i++){
	// 	if(variableName in seqs_dict){
	// 		console.log(variableName);
	// 		delete seqs_dict[variableName];
	// 	}
	// }
	
    
  } catch (e) {
    console.error(e);
  }
}

var editor = CodeMirror(document.body,{ //getElementById('editor'), {
  // your CodeMirror configuration options here
  extraKeys: {
    'Ctrl-Enter': evaluateCode,
	 'Shift-Enter': evaluateLine,
  },
  value: "a = new Seq([55, 60, 67, 71]);\n",
  mode: "javascript"
});


// window.onload = function() {
// 	const cm = CodeMirror( document.body, {
// 	value: "let a = new Seq([55, 60, 67, 71]);\n",
// 	mode: "javascript"
// })
// }

// cm.setOption( 'extraKeys', {
// 'Ctrl-Enter': function( cm ) {
// 	const code = cm.getValue()

// 	console.log( 'the code is:', code )
// 	eval( code )
// }
// })

export const starterCode = [
	'osc = context.createOscillator()\nosc.start()\n',
	'volume = context.createGain()\n',
	'volume.gain.value = .1',
	'gui.addElement("knob","VOL",volume.gain.value)',
	'osc.connect( volume )\n',
	'volume.connect( context.destination )\n\n',
	'\n\n\n\n\n',


	'//audio objects',
	'vco = new Tone.Oscillator().start()',
	'vcf = new Tone.Filter()',
	'vca = new Tone.Multiply()',
	'output = new Tone.Multiply(0.1).toDestination()',
	'',
	'//audio connections',
	'vco.connect( vcf )',
	'vcf.connect( vca )',
	'vca.connect( output )',
	'',
	'//for testing',
	'vco.connect(output)',
	'vco.disconnect(output)',
	'',
	'//control objects',
	'vco_freq = new Tone.Signal()',
	'vco_tune = new Tone.Signal()',
	'vcf_cutoff = new Tone.Signal()',
	'vca_env = new Tone.Envelope()',
	'vcf_env = new Tone.Envelope()',
	'vcf_envDepth = new Tone.Multiply()',
	'',
	'///control connections',
	'vco_freq.connect( vco.frequency )',
	'vco_tune.connect( vco.frequency )',
	'vcf_cutoff.connect( vcf.frequency )',
	'vcf_env.connect( vcf_envDepth )',
	'vcf_envDepth.connect( vcf.frequency )',
	'vca_env.connect( vca.factor )',
	'',
	'//control params - for connecting to gui',
	'//MAY NEED TO ENTER EACH LINE SEPARATELY!!!',
	'vco.type = "square" //sine, square, sawtooth, triangle',
	'vco_tune.value = 100 //from 0 to 500, exponential?',
	'vcf_cutoff.value = 100 //from 50 to 1000, exponential?',
	'vcf_envDepth.value = 1000 //from 100 to 10000, exponential',
	'vca_env.release = .8 //in seconds',
	'vcf_env.release = .4 //in seconds',
	'',
	'//simple sequence',
	'pitch_seq = [1,8,2,4,3,2].map(x=> (x+1)/x * vco_tune.value )',
	'index = 0;',
	'',
	'mySeq = function(){',
	'  vco_freq.value = pitch_seq[index]',
	'  index++',
	'  if( index >= pitch_seq.length ) index = 0',
	'  console.log( vco_freq.value )',
	'  vca_env.triggerAttackRelease(0.01)',
	'  vcf_env.triggerAttackRelease(0.01)',
	'}',
	'',
	'//start sequence - make sure to stop first!',
	'seq = setInterval( mySeq, 400 )',
	'',
	'//stop sequence',
	'clearInterval( seq )',
	'',
	'//gui elements',
	'gui.addElement("knob","KNOB")',
	'gui.addElement("slider","SLIDER")',
	'gui.addElement("toggle","TOGGLE")'
];

//inputs and outputs are the available midi ports
export function createStarterText(midiText){
	var instructions = [
		'To run code:',
		'Ctrl-Enter: Run selected line',
		'Alt-Enter: Run selected block'
		]
	var text = instructions.reduce(
		function (output, str) { return output + '\n' + str ;}
		);

	var code = starterCode.reduce(
		function (output, str) { return output + '\n' + str ;}
		);

	return '/*\n' + text + '\n\n' + midiText + '*/\n\n' + code
}
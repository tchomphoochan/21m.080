export const starterCode = [
	'gui.setBackgroundColor(0,0,0);',
	'gui.setColor1(0,0,255);\n\n',

	'gui.Knob({label:"knob"})\n',
	'\n',
	'key1 = gui.addKeyboard({label:"K1",mapto:"fakevar",x:10,y:25,width:30,height:60,keys:16})\n',
	'key2 = gui.addKeyboard({label:"K2",mapto:"fakevar",x:50,y:25,width:30,height:60,keys:16})\n',
	
	
	'\n\n\n',
    

	'osc = context.createOscillator()\nosc.start()\n',

	'volume = context.createGain()\n',
	'volume.gain.value = .1\n',

	'gui.removeElement("VOL")\n',

	'osc.connect( volume )\n',
	'volume.connect( context.destination )\n\n',
	'\n\n\n\n\n',


	'//audio objects',
	'vco = new Tone.Oscillator().start()',
	'vcf = new Tone.Filter()',
	'vca = new Tone.Multiply()',
	'output = new Tone.Multiply(0.1).toDestination()',
	'',
	'osc = new Tone.Oscillator()',
	'osc.type = "square5"',
	'osc.start()',
	'gain = new Tone.Multiply()',
	'volume_knob = gui.addElement({type:"knob",label:"VOL",mapto:"gain.factor"})',
	'osc.connect( gain )',
	'gain.toDestination()',
	'env = new Tone.Envelope()',
	'env.connect( gain.factor )',
	'',
	'nextBeat2 = function(){',
	'  env.triggerAttackRelease(0.1)',
	'}',
	'',
	'seq = setInterval(nextBeat2, 1000)',
	'clearInterval( seq )',
	'',
	'scope = new Oscilloscope( "display-box" )',
	'env.connect( scope.analyserNode )',
	'scope.start()',
	'scope.setFftSize( 4096*8)',
	'',
	'spectrum = new Spectroscope("visual")',
	'gain.connect( spectrum.analyserNode )',
	'spectrum.start()',
	'spectrum.setFftSize( 128*32)',
	'',
	'env.attack = .005',
	'env.decay = 0.01',
	'env.release = .5',
	'env.sustain = 1'
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
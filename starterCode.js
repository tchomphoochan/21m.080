export const starterCode = [
	'gui.color1 = color(0,0,255);',
	'color1(0,0,255);\n',

	'osc = new Tone.Oscillator()',
	'osc.start()',
	'gain = new Tone.Multiply()\n',

	'volume_knob = gui.addElement({type:"knob",label:"VOL",mapto:"gain.factor"})\n',
	'gui.removeElement("VOL")\n',
	'osc.connect( gain )\n',
	'gain.toDestination()\n',
	'\n\n',

	'scope = new Oscilloscope( "visual" )',
	'scope.start()',
	'gain.connect( scope.analyserNode )',
	'scope.setFftSize( 512)'
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
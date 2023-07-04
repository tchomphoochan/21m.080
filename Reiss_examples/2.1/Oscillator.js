//Define variables
var context = new AudioContext()
var Tone = new OscillatorNode(context)
var Amplitude = new GainNode(context,{gain: 0.2 })

//Set up audio graph
Tone.connect(Amplitude) 
Amplitude.connect(context.destination) 
Tone.start()

//​User​interface​callbacks
Frequency.oninput = ()=> Tone.frequency.value = Frequency.value 
Volume.oninput = ()=> Amplitude.gain.value = Volume.value 
Type.onchange = ()=> Tone.type = Type.value
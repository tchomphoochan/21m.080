let vco = new Tone.Oscillator().start()
let vcf
let output = new Tone.Multiply(0.05).toDestination()
vco.connect( output )
vco.start()
vco.frequency.value = 220
vco.type = "square"

let scope = new Oscilloscope('Oscillator')
vco.connect( scope.analyserNode )
scope.start()
scope.setFftSize( 1024*2 )
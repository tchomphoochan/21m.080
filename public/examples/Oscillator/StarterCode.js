let vco = new Tone.Oscillator(440)
let output = new Tone.Multiply(0.05).toDestination()
vco.connect( output )
vco.start()
vco.frequency = 220
vco.type = "square"
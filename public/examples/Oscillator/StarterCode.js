vco = new Tone.Oscillator(110)
vco.start().toDestination()
vco.frequency = 220
vco.type = "square"
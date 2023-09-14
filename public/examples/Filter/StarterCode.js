const vco = new Tone.Oscillator({frequency:110, type:"sawtooth")
const vcf = new Tone.Filter()
const output = new Tone.Multiply(0.05).toDestination()
vco.start()
vco.connect( vcf )
vcf.connect( output )
vcf.frequency.value = 1000
vcf.Q.value = 0.9
vcf.rolloff.value = -24
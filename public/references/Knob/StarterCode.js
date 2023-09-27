let vco = new Tone.Oscillator(440).start()
let output = new Tone.Multiply(0.02).toDestination()
vco.connect( output ), vco.frequency.value = 220, vco.type = "square"

const gui = new p5(gui_sketch, Knob)
let vco_freq = gui.Knob({
  label:'frequency', 
  mapto:'vco.frequency',
  min: 100,
  max: 400,
  curve: 2,
  size: 1.5
})

vco_freq.position(50,50)
vco_freq.size = 1
let vco = new Tone.Oscillator(100).start()
let vcf = new Tone.Filter(1000)
let vca = new Tone.Multiply(.5)
let output = new Tone.Multiply(0.05).toDestination()
vco.connect(vcf), vcf.connect( vca ), vca.connect( output )

const gui = new p5( gui_sketch, GUI )
let freq_knob = gui.Knob({
  label:'freq',
  mapto: 'vco.frequency',
  x: 15, y: 30, size:1.5,
  min:20, max: 500, scale: 2
})
let vcf_fader = gui.Slider({
  label:'cutoff',
  mapto: 'vcf.frequency',
  x: 50, y: 70, size: 1.5,
  min:50, max: 5000, scale: 2,
  horizontal: true
})
let rolloff_radio = new gui.RadioButton({
  label:'rolloff',
  radioOptions: [-12,-24,-48],
  callback: function(x){vcf.rolloff = x},
  x: 60, y:30,
  horizontal: true
})
let enable_toggle = new gui.Toggle({
  label:'ratio2',
  mapto: 'vca.factor',
  size: .5,
  x: 80, y:20
})
let env = new Tone.Envelope()
env.connect(vca.factor)
let env_trigger = gui.Button({
  label:'trig',
  callback: function(){ env.triggerAttackRelease(0.1)},
  size: .5,
  x: 80, y:50
})
let wave_radio = gui.RadioButton({
  label:'waveform',
  radioOptions: ['sine','sawtooth','square','triangle'],
  callback: function(x){ vco.type = x},
  size: 1,
  x: 40, y:30
})
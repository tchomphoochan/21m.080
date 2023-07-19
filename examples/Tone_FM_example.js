vco = new Tone.Oscillator().start()
mod = new Tone.Oscillator().start()
mod_depth = new Tone.Gain()
vca = new Tone.AmplitudeEnvelope()
output = new Tone.Volume(-24).toDestination()

vco.connect(vca)
vca.connect(output)
mod.connect( mod_depth)
mod_depth.connect(vco.frequency)

mod.frequency.value = 200
mod_depth.gain.value = 3000

//trigger envelope manually
vca.triggerAttack("+.5",1)
vca.triggerAttackRelease(.5)
vca.triggerRelease()

//Tone.js loop function
seqA = new Tone.Loop(time=>{
  vca.triggerAttackRelease(.1)
  console.log(time)
}, "4n").start(0)

seqA.stop()
Tone.Transport.stop()
Tone.Transport.start()

//javascript set interval
seq = setInterval(function(){triggerNote()}, 50)
clearInterval(seq)

triggerNote = function(){
    vca.triggerAttackRelease(.1)
}


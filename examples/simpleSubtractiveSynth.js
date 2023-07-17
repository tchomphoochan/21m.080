osc = context.createOscillator()
filter = context.createBiquadFilter()
vca = context.createGain()
osc.connect(filter)
filter.connect(vca)
vca.connect(context.destination)

osc.type = "square"
osc.frequency.value = 200

vca.gain.value = 0.05
filter.type = 'lowpass'
filter.frequency.value = 300
filter.Q.value = .96

osc.start()

index = 0
notes= [60,62,67,55,_,55,57]

mtof = function(note){return (440 / 32) * (2 ** ((note - 9) / 12)); }
updateIndex= function(){ index = index >= notes.length-1 ? 0 : index+1}

triggerNote = function(attack,decay){
  let now = context.currentTime
  osc.frequency.value = mtof(notes[index])
  updateIndex()
  if(osc.frequency.value < 50) return //rest
  vca.gain.linearRampToValueAtTime(.1, now+attack)
  vca.gain.setTargetAtTime(0, now + attack, 1/decay)
  filter.frequency.setValueAtTime(osc.frequency.value*8, now)
  filter.frequency.setTargetAtTime(osc.frequency.value, now + attack, 0.1)
}

triggerNote(.01,2)
console.log(index)

setInterval(function(){triggerNote(.01,2)}, 250)

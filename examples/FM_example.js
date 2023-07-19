//output
out = context.destination
output = context.createGain()
output.gain.value = .1
output.connect(out)


car = context.createOscillator()
car_gain = context.createGain()
mod = context.createOscillator()
mod_gain = context.createGain()

car.connect( car_gain )
mod.connect( mod_gain )
car_gain.connect( output )
mod_gain.connect( car.frequency )

freq = 110
ratio = 1.5
car.frequency.value = freq
mod.frequency.value = ratio*freq
mod_gain.gain.value = 3000

car.start()
mod.start()

triggerNote = function(val,attack, decay){
  setFreq(val)
 let now = context.currentTime
 mod_gain.gain.exponentialRampToValueAtTime(3000,attack+now)
 mod_gain.gain.setTargetAtTime(1000,attack+now,decay) 
  car_gain.gain.exponentialRampToValueAtTime(1,attack+now)
  car_gain.gain.setTargetAtTime(0,attack+now,1/decay)
}

triggerNote(190,.2, 2)

setFreq = function(val){
 car.frequency.value = val
 mod.frequency.value = val*ratio
}

getFreq = function(){
 val= Math.random()*10
 val = Math.floor(val)
 val = val*50 + 100
  console.log(val)
  return val
}

seq = setInterval(function(){triggerNote(getFreq(),.1,.9)},250)
clearInterval(seq)
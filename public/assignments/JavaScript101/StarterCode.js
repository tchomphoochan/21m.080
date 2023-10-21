/**** A - Variables, values, and objects *****/
//let, const, and var all let you define variables
//if in doubt, just use let

//define an oscillator object, and refer to is as vco:
let vco = new Tone.Oscillator()

//we can also just store numbers:
let val = 100

//DON'T redefine objects! But updating numbers is ok:
val = 200

/**** B - Executing and Debugging *****/
//execute a line by putting your cursor on it and typing option/alt-enter
let vco = new Tone.Oscillator()

//open the javascript console and inspect the vco
console.log( vco )
//hint: try using the oscillators .get() method
console.log( vco.get() )

//if we redefine vco it loses its reference:
//execute these line by line and look at the frequency in the console
vco.frequency.value = 100
console.log( vco.get() )
let vco = new Tone.Oscillator()
console.log( vco.get() )


/**** C - Methods and Functions *****/

//properties use the '=' operator
vco.frequency.value = 100
vco.type = 'square'
//methods use parentheses
vco.start()
vco.stop()
//look at examples to find available properties and methods

//methods and functions MAY use arguments inside the parentheses.
//again, look at examples or references

//define functions - execute this block:
let myFunction = function(myArgument){
  console.log( myArgument) 
}

//then call the function by executing the following lines:
myFunction( 100 )
myFunction( 'foo' )
myFunction( vco )

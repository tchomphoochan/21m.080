import { instantiateFaustModuleFromFile, LibFaust, FaustCompiler, FaustMonoDspGenerator } from "https://unpkg.com/@grame/faustwasm@0.0.32/dist/esm/index.js"

let audioCtx;
let node;

const code = `import("stdfaust.lib");
pluck = hgroup("[1]Pluck",gate : ba.impulsify*gain)
with
{
    gain = hslider("gain[style:knob]",1,0,1,0.01);
    gate = button("gate");
};

string = hgroup("String[0]",+~(de.fdelay4(maxDelLength,delLength-1) : filter : *(damping)))
with{
    freq = hslider("[0]freq",440,50,5000,1);
    damping = hslider("[1]Damping[style:knob]",0.99,0,1,0.01);
    maxDelLength = 960;
    filter = _ <: _,_' :> /(2);
    delLength = ma.SR/freq;
};

process = vgroup("Karplus Strong",pluck : string);
`

async function main() 
{
	// Setup AudioContext
  	audioCtx = new AudioContext();
  	await audioCtx.resume()

    // Setup Faust
  	const faustModule = await instantiateFaustModuleFromFile("https://unpkg.com/@grame/faustwasm@0.0.32/libfaust-wasm/libfaust-wasm.js")
  	const libFaust = new LibFaust(faustModule)
  	const compiler = new FaustCompiler(libFaust)
  	const generator = new FaustMonoDspGenerator()

  	// Compile Faust code and create an AudioNode
  	await generator.compile(compiler, "dsp", code, "")
  	node = await generator.createNode(audioCtx)
  	node.connect(audioCtx.destination)

}
main();

function noteon(){
    // Get user input
    const freqValue = parseFloat(document.getElementById("freq").value);
    const dampingValue = parseFloat(document.getElementById("damping").value);
    const gainValue = parseFloat(document.getElementById("gain").value);

    // Set parameters
    if (!isNaN(freqValue)) 
    {
        node.setParamValue("/Karplus_Strong/String/freq", freqValue);
    }
    if (!isNaN(dampingValue)) 
    {
        node.setParamValue("/Karplus_Strong/String/Damping", dampingValue);
    }
    if (!isNaN(gainValue)) 
    {
        node.setParamValue("/Karplus_Strong/Pluck/gain", gainValue);
    }
    node.setParamValue("/Karplus_Strong/Pluck/gate", 1);
}

function noteoff(){
    node.setParamValue("/Karplus_Strong/Pluck/gate", 0);
}

document.querySelector("#pluck").onmousedown = noteon
document.querySelector("#pluck").onmouseup= noteoff

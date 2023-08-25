/**
 * Based on: https://github.com/Sambego/oscilloscope.js
 */
/****************************************



OSCILLOSCOPE


****************************************/

export const Oscilloscope = function(_target) {
    //var _drawWave, _bufferLength, _dataArray;

    //this.target = document.querySelector(target);
    this.target = document.getElementById(_target)

    // Set the dimensions based on the target container
    this.width = this.target.offsetWidth;
    this.height = this.target.offsetHeight;

    // Create the oscilloscope wave element
    this.wave = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    this.wave.setAttribute('class', 'oscilloscope__wave');

    // Create the oscilloscope svg element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', this.height);
    this.svg.setAttribute('class', 'oscilloscope__svg');
    this.svg.appendChild(this.wave);

    // Append the svg element to the target container
    this.target.appendChild(this.svg);

    // Add the audio context or create a new one
    const context = Tone.context.rawContext;
    this.audioContext = Tone.context.rawContext;

    // Indicates if the oscilloscope is running
    this.running = false;

    // Is the oscilloscope analyser-node connected to the audio-context' destination
    this.hasAudio = false;

     // Create the oscilloscope analyser-node
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 1024; // Default fftSize
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.yScaling = 1; //
    this.xScaling = 2;
    this.enableTrigger = 1;
    this.threshold = 128;

    // Set-up the analyser-node which we're going to use to get the oscillation wave
    this.setFftSize = function(val){
        if (Math.log2(val) % 1 !== 0) {
            val = Math.pow(2, Math.floor(Math.log2(val)))
            console.log("FFT size must be a power of two.")
        }
        console.log("Setting FFT size to ", val)
        
        this.analyserNode.fftSize = val;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }.bind(this);

    /**
     * Draw the oscillation wave
     */
    this.drawWave = function() {
    var path = 'M';

    this.analyserNode.getByteTimeDomainData(this.dataArray);

    // Find the index of the first positive zero-crossing point
    var firstOverThreshold = 0;
    let _threshold = this.threshold;
    if(Math.abs(_threshold) <= 1) _threshold  = threshold*128 + 127;

    for (var i = 1; i < this.bufferLength; i++) {

        let asign = this.dataArray[i] > _threshold;
        let bsign = this.dataArray[i-1] <= _threshold;
        if (Math.abs(asign - bsign) == 0) {
            firstOverThreshold = i;
            break;
        }
    }

    if ( this.enableTrigger == 0) firstOverThreshold = 0;

    let x = this.width;
    let y = this.height / 2;

    const maxValue = Math.max(...this.dataArray);
    const minValue = Math.min(...this.dataArray);

    ////scale y axis. . . not implemented
    // if(this.yScaling > 1) this.yScaling *= 0.99;
    // if(maxValue > this.yScaling) this.yScaling = maxValue;
    // if(Math.abs(minValue) > this.yScaling) this.yScaling = Math.abs(minValue);

    for (var i = 0; i < this.bufferLength-firstOverThreshold; i++) {
        let val = (255-this.dataArray[i+firstOverThreshold]) * (1/this.yScaling);
        x = (((this.width + (this.width / this.bufferLength)) / this.bufferLength) * (i));
        x = x * this.xScaling;
        y = ((this.height / 2) * (val / 128.0));


        // Check if the x-coordinate is beyond the width of the scope
        if (x > this.width-10) break; // Exit the loop if x exceeds width

        path += `${x} ${y}, `;
    }

    x += 1
    y = this.height / 2;

    path += `${x} ${y}, `;

    this.wave.setAttribute('d', path);

    if (this.running) {
        //console.log(this.dataArray)
        window.requestAnimationFrame(this.drawWave);
    }
}.bind(this);


    /**
     * Start the oscilloscope
     */
    this.start = function() {
        this.running = true;

        window.requestAnimationFrame(this.drawWave);
    }.bind(this);
};

/**
 * Stop the oscilloscope
 */
Oscilloscope.prototype.stop = function() {
    this.running = false;
};

/**
 * Connect the analyser-node to another audio-node
 * @param  {audioNode} node An audio-node to connect to
 */
Oscilloscope.prototype.connect = function(node) {
    this.analyserNode.connect(node);
};

/**
 * Connect the analyser-node to the audio-context' destination
 */
Oscilloscope.prototype.toggleAudio = function() {
    if (!!this.hasAudio) {
        this.analyserNode.disconnect();
    } else {
        this.analyserNode.connect(this.audioContext.destination);
    }

    this.hasAudio = !this.hasAudio;
};

//based on https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
var Oscilloscope2 = function(_target) {
    //this.target = document.querySelector(target);
    this.target = document.getElementById(_target)

    // Set the dimensions based on the target container
    this.width = this.target.offsetWidth;
    this.height = this.target.offsetHeight;

    const scope_canvas = document.createElement('canvas');

    // Set attributes for the canvas element (width and height)
    scope_canvas.width = this.width; // Set the desired width
    scope_canvas.height = this.height; // Set the desired height

    // Append the canvas to the container
    this.target.appendChild(scope_canvas);

    // Get the 2D rendering context
    const canvasCtx = scope_canvas.getContext('2d');

    // Clear the canvas using clearRect
    canvasCtx.clearRect(0, 0, this.width, this.height);

    // Add the audio context or create a new one
    this.audioContext = context || new window.AudioContext();

    // Indicates if the oscilloscope is running
    this.running = false;

    // Is the oscilloscope analyser-node connected to the audio-context' destination
    this.hasAudio = false;

     // Create the oscilloscope analyser-node
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 128; // Default fftSize
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.yScaling = 1; //
    this.xScaling = 2;

    // Set-up the analyser-node which we're going to use to get the oscillation wave
    this.setFftSize = function(val){
        if (Math.log2(val) % 1 !== 0) {
            val = Math.pow(2, Math.floor(Math.log2(val)))
            console.log("FFT size must be a power of two.")
        }
        console.log("Setting FFT size to ", val)
        
        this.analyserNode.fftSize = val;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }.bind(this);

    this.draw = function() {

        const drawVisual = requestAnimationFrame(this.draw);

        this.analyserNode.getByteTimeDomainData(this.dataArray);

        canvasCtx.fillStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, this.width, this.height);

        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = "rgb(255, 255, 255)";
        canvasCtx.beginPath();

        const sliceWidth = this.width / this.bufferLength;
        let x = 0;

        // Find the index of the first positive zero-crossing point
        var firstOverThreshold = 0;
        for (var i = 1; i < this.bufferLength; i++) {
            if (this.dataArray[i] > 128 && this.dataArray[i - 1] <= 128) {
                firstOverThreshold = i;
                break;
            }
        }

        if ( this.enableTrigger == 0) firstOverThreshold = 0;

        for (let i = 0; i < this.bufferLength-firstOverThreshold; i++) {

            let v = this.dataArray[i+firstOverThreshold] * (1/this.yScaling);
            v = (255 - v) / 128.0;

            const y = v * (this.height / 2);

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth * this.xScaling;

          // Check if the x-coordinate is beyond the width of the scope
            if (x > this.width-10) break; // Exit the loop if x exceeds width
        }

        canvasCtx.lineTo(this.width, this.height / 2);
        canvasCtx.stroke();
    }.bind(this);

    this.draw();

}


/****************************************



SPECTROSCOPE


****************************************/

export const Spectroscope = function(_target) {
    //var _drawWave, _bufferLength, _dataArray;

    //this.target = document.querySelector(target);
    this.target = document.getElementById(_target)

    // Set the dimensions based on the target container
    this.width = this.target.offsetWidth;
    this.height = this.target.offsetHeight;

    // Create the oscilloscope wave element
    this.wave = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    this.wave.setAttribute('class', 'oscilloscope__wave');

    // Create the oscilloscope svg element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', this.height);
    this.svg.setAttribute('class', 'oscilloscope__svg');
    this.svg.appendChild(this.wave);

    // Append the svg element to the target container
    this.target.appendChild(this.svg);

    // Add the audio context or create a new one
    const context = Tone.context.rawContext;
    this.audioContext = Tone.context.rawContext;

    // Indicates if the oscilloscope is running
    this.running = false;

    // Is the oscilloscope analyser-node connected to the audio-context' destination
    this.hasAudio = false;

     // Create the oscilloscope analyser-node
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 4096; // Default fftSize
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.yScaling = 1; //
    this.xScaling = 2;
    this.enableTrigger = 0;
    this.threshold = 128;

    // Set-up the analyser-node which we're going to use to get the oscillation wave
    this.setFftSize = function(val){
        if (Math.log2(val) % 1 !== 0) {
            val = Math.pow(2, Math.floor(Math.log2(val)))
            console.log("FFT size must be a power of two.")
        }
        console.log("Setting FFT size to ", val)
        
        this.analyserNode.fftSize = val;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }.bind(this);

    /**
     * Draw the oscillation wave
     */
    this.drawWave = function() {
    var path = 'M';

    this.analyserNode.getByteFrequencyData(this.dataArray);

    // Find the index of the first positive zero-crossing point
    var firstOverThreshold = 0;
    let _threshold = this.threshold;
    if(Math.abs(_threshold) <= 1) _threshold  = threshold*128 + 127;
    
    for (var i = 1; i < this.bufferLength; i++) {

        let asign = this.dataArray[i] > _threshold;
        let bsign = this.dataArray[i-1] <= _threshold;
        if (Math.abs(asign - bsign) == 0) {
            firstOverThreshold = i;
            break;
        }
    }

    if ( this.enableTrigger == 0) firstOverThreshold = 0;

    let x = this.width;
    let y = this.height / 2;

    const maxValue = Math.max(...this.dataArray);
    const minValue = Math.min(...this.dataArray);

    ////scale y axis. . . not implemented
    // if(this.yScaling > 1) this.yScaling *= 0.99;
    // if(maxValue > this.yScaling) this.yScaling = maxValue;
    // if(Math.abs(minValue) > this.yScaling) this.yScaling = Math.abs(minValue);

    for (var i = 0; i < this.bufferLength-firstOverThreshold; i++) {
        let val = (255-this.dataArray[i+firstOverThreshold]) * (1/this.yScaling);
        x = (((this.width + (this.width / this.bufferLength)) / this.bufferLength) * (i));
        x = x * this.xScaling;
        y = ((this.height / 2) * (val / 128.0));


        // Check if the x-coordinate is beyond the width of the scope
        if (x > this.width-10) break; // Exit the loop if x exceeds width

        path += `${x} ${y}, `;
    }

    x += 1
    y = this.height;

    path += `${x} ${y}, `;

    this.wave.setAttribute('d', path);

    if (this.running) {
        //console.log(this.dataArray)
        window.requestAnimationFrame(this.drawWave);
    }
}.bind(this);


    /**
     * Start the oscilloscope
     */
    this.start = function() {
        this.running = true;

        window.requestAnimationFrame(this.drawWave);
    }.bind(this);
};
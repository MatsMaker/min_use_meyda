var _this;
var Audio = function Audio(bufferSize) {
  if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
    window.AudioContext = webkitAudioContext;
  }

  if (navigator.hasOwnProperty('webkitGetUserMedia') && !navigator.hasOwnProperty('getUserMedia')) {
    navigator.getUserMedia = webkitGetUserMedia;
    if (!AudioContext.prototype.hasOwnProperty('createScriptProcessor')) {
      AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
    }
  }

  this.context = new AudioContext();

  this.synthesizer = {};
  this.synthesizer.out = this.context.createGain();

  this.meyda = Meyda.createMeydaAnalyzer({
    audioContext: this.context,
    source: this.synthesizer.out,
    bufferSize: bufferSize,
    windowingFunction: 'blackman'
  });
  _this = this;
  this.initializeMicrophoneSampling();
};

Audio.prototype.initializeMicrophoneSampling = function () {
  var errorCallback = function errorCallback(err) {
    // We should fallback to an audio file here, but that's difficult on mobile
    var elvis = document.getElementById('elvisSong');
    var stream = _this.context.createMediaElementSource(elvis);
    stream.connect(_this.context.destination);
    _this.meyda.setSource(stream);
  };

  try {
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
    var constraints = { video: false, audio: true };
    var successCallback = function successCallback(mediaStream) {
      window.mediaStream = mediaStream;
      document.getElementById('elvisSong').style.display = 'none';
      console.log('User allowed microphone access.');
      console.log('Initializing AudioNode from MediaStream');
      var source = _this.context.createMediaStreamSource(window.mediaStream);
      console.log('Setting Meyda Source to Microphone');
      _this.meyda.setSource(source);
      console.groupEnd();
    };

    try {
      console.log('Asking for permission...');
      navigator.getUserMedia(constraints, successCallback, errorCallback);
    } catch (e) {
      var p = navigator.mediaDevices.getUserMedia(constraints);
      p.then(successCallback);
      p.catch(errorCallback);
    }
  } catch (e) {
    errorCallback();
  }
};

Audio.prototype.get = function (features) {
  return _this.meyda.get(features);
};



var bufferSize = 1024;
var a = new Audio(bufferSize);

var features = null;
setInterval(function () {
  features = a.get(['amplitudeSpectrum', 'spectralCentroid', 'spectralRolloff', 'loudness', 'energy'/*, 'rms'*/]);
  console.log(features);
}, 100);

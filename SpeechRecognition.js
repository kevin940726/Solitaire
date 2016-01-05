Object.prototype.filter = Array.prototype.filter;
Object.prototype.reduce = Array.prototype.reduce;

var SpeechRecognition = function(result) {
    this.NativeSpeechRocognition = window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition ||
        window.oSpeechRecognition;

    if (!this.NativeSpeechRocognition) {
        this.support = false;
        console.log("Broweser not support!");
        return null;
    }

    this.recognition = new this.NativeSpeechRocognition();

    this.recognition.result = result;
    this.recognition.speaking = false;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'cmn-Hant-TW';

    this.recognition.onstart = this.onstart;
    this.recognition.onresult = this.onresult;

    return this.recognition;
};

SpeechRecognition.prototype.onstart = function() {
    console.log("Speech Recognition Start!");
    this.speaking = true;
    this.interimTranscript = "";
    this.transcript = "";
};

SpeechRecognition.prototype.onresult = function(event) {
    this.interimTranscript = event.results.reduce(function(final, word) {
        return final + word[0].transcript;
    }, "");

    this.transcript = event.results.filter(function(result) {
        return result.isFinal;
    }).reduce(function(final, word) {
        return final + word[0].transcript;
    }, "");

    if (this.result) {
        this.result.value = this.transcript ? this.transcript : this.interimTranscript;
    }

    return this;
};

module.exports = SpeechRecognition;

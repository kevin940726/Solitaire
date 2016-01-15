(function() {
    "use strict";

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
        var results = Array.from(event.results);

        this.interimTranscript = results.reduce(function(final, word) {
            return final + word[0].transcript;
        }, "");

        this.transcript = results.filter(function(result) {
            return result.isFinal;
        }).reduce(function(final, word) {
            return final + word[0].transcript;
        }, "");

        if (this.result) {
            this.result.value = this.transcript ? this.transcript : this.interimTranscript;
        }

        return this;
    };

    var SpeechSynthesis = function() {
        this.NativeSpeechSynthesisUtterance = window.SpeechSynthesisUtterance ||
            window.webkitSpeechSynthesisUtterance ||
            window.mozSpeechSynthesisUtterance ||
            window.msSpeechSynthesisUtterance ||
            window.oSpeechSynthesisUtterance;

        if (!this.NativeSpeechSynthesisUtterance) {
            this.support = false;
            console.log("Broweser not support!");
            return null;
        }

        this.utterance = new this.NativeSpeechSynthesisUtterance();

        this.utterance.lang = 'cmn-Hant-TW';

        this.utterance.onstart = this.onstart;

        return this.utterance;
    };

    exports.SpeechRecognition = SpeechRecognition;
    exports.SpeechSynthesis = SpeechSynthesis;
})();

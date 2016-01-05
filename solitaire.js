var dict = require("./dict-solitaire-edition.json");
var SpeechRecognition = require("./SpeechRecognition.js");

String.prototype.removeTone = function() {
    return this.trim().replace(/(ˊ|ˇ|ˋ|˙)/, '');
};

Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
};

window.solitaire = function(text, callback) {
    var lastBopomofo = dict.find(function(d) {
        return d.title === text;
    }).bopomofo.split(" ").slice(-1)[0];

    var re = new RegExp("^" + lastBopomofo);
    var result = dict.filter(function(d) {
        return d.bopomofo.search(re) === 0;
    });
    if (!result.length) {
        re = new RegExp("^" + lastBopomofo.removeTone() + "(ˊ|ˇ|ˋ|˙)? ");
        result = dict.filter(function(d) {
            return d.bopomofo.search(re) === 0;
        });
    }

    result = result.map(function(d) {
        return d.title;
    }).getRandom();

    document.getElementById("records").innerHTML += '<li class="com">' + result + '</li>';

    callback();
};

var speech = new SpeechRecognition(document.getElementById("result"));

speech.start();
speech.onend = function() {
    console.log("Speech Recognition End.");

    if (!this.transcript) {
        console.log("Time out!");
        return;
    }

    document.getElementById("records").innerHTML += '<li class="player">' + this.transcript + '</li>';

    window.solitaire(this.transcript, function() {
        speech.start();
    });
};

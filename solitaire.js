var dict = require("./dict-solitaire-edition.json");
var SpeechRecognition = require("./SpeechRecognition.js");

String.prototype.removeTone = function() {
    return this.trim().replace(/(ˊ|ˇ|ˋ|˙)/, '');
};

Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
};

var Solitaire = function() {
    this.status = "ready";
    this.lastBopomofo = "";
    
};

window.solitaire = function(text, callback) {
    var word = dict.find(function(d) {
        return d.title === text;
    });

    if (!word) {
        toStatus("ready", "err");
        return;
    }

    if (speech.lastBopomofo) {
        var firstBopomofo = word.bopomofo.split(" ")[0];
        if (firstBopomofo !== speech.lastBopomofo && firstBopomofo.removeTone() !== speech.lastBopomofo.removeTone()) {
            toStatus("ready", "nomatch");
            return;
        }
    }

    var lastBopomofo = word.bopomofo.split(" ").slice(-1)[0];

    var re = new RegExp("^" + lastBopomofo + " ");
    var result = dict.filter(function(d) {
        return d.bopomofo.search(re) === 0;
    });
    if (!result.length) {
        re = new RegExp("^" + lastBopomofo.removeTone() + "(ˊ|ˇ|ˋ|˙)? ");
        result = dict.filter(function(d) {
            return d.bopomofo.search(re) === 0;
        });
    }

    result = result.getRandom();
    speech.lastBopomofo = result.bopomofo.split(" ").splice(-1)[0];

    callback(result.title);
};

var addRecord = function(type, text) {
    document.getElementById("records").innerHTML += '<li class="' + type + '"><span>' + text + '</span></li>';

    var scrollDistance = document.body.scrollHeight - document.body.scrollTop - window.innerHeight;
    var scroll = window.setInterval(function() {
        window.scrollBy(0, scrollDistance / 10);

        if (document.body.scrollHeight - document.body.scrollTop - window.innerHeight <= 0)
            clearInterval(scroll);
    }, 50);

};


var toStatus = function(status, msg) {
    if (status === "ready") {
        speech.speaking = false;
        document.querySelector('#microphone-btn .icon-microphone').src = "src/microphone-outline.svg";

        if (msg === "err") {
            addRecord('system', "查無此字！");
        }
        else if (msg === "nomatch") {
            addRecord('system', "接龍失敗！");
        }
        else if (msg === "timeout") {
            addRecord('system', "時間到！請重新開始。");
        }
    }
    else if (status === "on") {
        document.querySelector('#microphone-btn .icon-microphone').src = "src/microphone.svg";
    }
    else if (status === "off") {
        speech.speaking = false;
        document.querySelector('#microphone-btn .icon-microphone').src = "src/microphone-off.svg";

        if (msg === "pause") {
            addRecord('system', "接龍暫停！");
        }
    }
};

var speech = new SpeechRecognition(document.getElementById("text"));

speech.onend = function() {
    console.log("Speech Recognition End.");
    this.speaking = false;

    toStatus("waiting");

    if (!this.transcript) {
        console.log("Time out!");
        toStatus("ready", "timeout");
        return;
    }
    else if (this.transcript === "off") {
        toStatus("off", "pause");
        return;
    }

    addRecord('player', this.transcript);

    window.solitaire(this.transcript, function(result) {
        addRecord('com', result);
        speech.start();
    });
};


document.getElementById("microphone-btn").addEventListener('click', function(event) {
    event.preventDefault();

    if (!speech.speaking) {
        toStatus("on");

        speech.start();
    }
    else {
        speech.transcript = "off";

        speech.abort();
    }

});

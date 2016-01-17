var dict = require("./dict-solitaire-edition.json");
var SpeechRecognition = require("./SpeechRecognition.js").SpeechRecognition;
var Solitaire = require("./Solitaire.js");

var speech = new SpeechRecognition(document.getElementById("text"));
var solitaire = new Solitaire(dict);

var microphone = document.getElementById("microphone-btn").getElementsByTagName("img")[0];
var recordsList = document.getElementById("records");
var volume = document.getElementById("mute-btn").getElementsByTagName("img")[0];

// microphone icon change observer
Object.observe(solitaire, function(changes) {
    changes.filter(function(change) {
        return change.name === "status";
    }).map(function(change) {
        return solitaire.status;
    }).map(function(status) {
        if (status === "off")
            microphone.src = "src/microphone-off.svg";
        else if (status === "on")
            microphone.src = "src/microphone.svg";
        else if (status === "waiting")
            microphone.src = "src/microphone-waiting.svg";
        else
            microphone.src = "src/microphone-outline.svg";
    });
});

// add record list observer
Array.observe(solitaire.records, function(changes) {
    changes.map(function(change) {
        return solitaire.records[change.index];
    }).map(function(record) {
        if (record)
        recordsList.innerHTML += '<li class="' + record.turn + '"><a' + (record.turn === 'com' ? ' href="https://www.moedict.tw/' + record.word + '" target="_blank"' : '') + '>' + record.word + '</a></li>';
    });

    var scrollDistance = document.body.scrollHeight - document.body.scrollTop - window.innerHeight;
    var scroll = window.setInterval(function() {
        window.scrollBy(0, scrollDistance / 10);

        if (document.body.scrollHeight - document.body.scrollTop - window.innerHeight <= 0)
            clearInterval(scroll);
    }, 50);
});

window.submitWord = function(isSpeech) {
    if (!isSpeech)
        speech.transcript = speech.result.value;

    console.log("Speech Recognition End.");
    speech.speaking = false;

    if (solitaire.status === "off") {
        return;
    }

    solitaire.setStatus("waiting");

    if (!speech.transcript) {
        console.log("Time out!");
        solitaire.setStatus("ready", "時間到！");
        return;
    }

    // console.log(this.transcript);
    solitaire.startRound(speech.transcript, function(result) {
        // console.log(result);
        if (!isSpeech) {
            solitaire.setStatus("ready");
        }
        else {
            solitaire.setStatus("on");

            speech.start();
        }
    });
};

speech.onend = function() {
    window.submitWord(true);
};

document.getElementById("microphone-btn").addEventListener('click', function(event) {
    event.preventDefault();

    if (!speech.speaking) {
        solitaire.setStatus("on");

        speech.start();
    }
    else {
        solitaire.setStatus("off", "接龍暫停。");

        speech.abort();
    }

});

document.getElementById("mute-btn").addEventListener('click', function(event) {
    event.preventDefault();


    window.mute = !window.mute;
    volume.src = window.mute ? 'src/mute.svg' : 'src/volume.svg';
});

document.getElementById("reload-btn").addEventListener('click', function(event) {
    event.preventDefault();

    speech.abort();
    solitaire.reset();
    document.getElementById("text").value = "";
    recordsList.innerHTML = "";
    microphone.src = "src/microphone-outline.svg";
});

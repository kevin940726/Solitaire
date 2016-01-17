var SpeechSynthesis = require("./SpeechRecognition.js").SpeechSynthesis;

String.prototype.removeTone = function() {
    return this.trim().replace(/(ˊ|ˇ|ˋ|˙)/, '');
};

Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
};

var Solitaire = function(dict) {

    this.status = "ready";
    this.msg = "";
    this.lastBopomofo = "";
    this.records = [];
    this.dict = dict;
    this.utterance = new SpeechSynthesis();

    return this;
};

Solitaire.prototype.reset = function() {
    this.status = "ready";
    this.msg = "";
    this.lastBopomofo = "";
    this.records.splice(0, this.records.length);
    return this;
};

Solitaire.prototype.setStatus = function(status, msg) {
    this.status = status;

    if (msg) {
        this.msg = msg;

        this.records.push({
            turn: 'system',
            word: msg,
            type: status
        });
    }

    return this;
};

Solitaire.prototype.receiveWord = function(text, callback) {
    var record = {
        turn: 'player',
        word: text,
        type: "regular"
    };

    if (this.records.find(function(r) {
        return r.word === text;
    })) {
        record.type = "duplicate";
        this.records.push(record);
        this.setStatus("ready", "不可以重複！");
        return;
    }

    var word = this.dict.find(function(d) {
        return d.title === text;
    });

    if (!word) {
        record.type = "noMatch";
        this.records.push(record);
        this.setStatus("ready", "辭典裡沒有這個詞啦！");
        return;
    }

    if (this.lastBopomofo) {
        var firstBopomofo = word.bopomofo.split(" ")[0];
        if (firstBopomofo !== this.lastBopomofo) {
            record.type = "breakTone";
            if (firstBopomofo.removeTone() !== this.lastBopomofo.removeTone()) {
                record.type = "fail";
                this.records.push(record);
                this.setStatus("ready", "接錯字了哦～");
                return;
            }
        }
    }

    this.records.push(record);

    if (callback) callback(word);

    return this;
};

Solitaire.prototype.sendWord = function(word, callback) {
    var solitaire = this;

    var record = {
        turn: 'com',
        word: word.title,
        type: "regular"
    };

    var lastBopomofo = word.bopomofo.split(" ").slice(-1)[0];

    var re = new RegExp("^" + lastBopomofo + " ");
    var result = this.dict.filter(function(d) {
        return d.bopomofo.search(re) === 0;
    }).filter(function(d) {
        return !solitaire.records.find(function(r) {
            return r.word === d.title;
        });
    });

    if (!result.length) {
        re = new RegExp("^" + lastBopomofo.removeTone() + "(ˊ|ˇ|ˋ|˙)? ");
        result = this.dict.filter(function(d) {
            return d.bopomofo.search(re) === 0;
        });
        record.type = "breakTone";
    }
    if (!result.length) {
        record.type = "fail";
        this.setStatus("ready", "我接不下去了啦！");
        return;
    }

    result = result.getRandom();
    record.word = result.title;
    this.lastBopomofo = result.bopomofo.split(" ").splice(-1)[0];

    this.records.push(record);

    this.utterance.text = record.word;

    if (!window.mute) {
        window.speechSynthesis.speak(this.utterance);
        this.utterance.onend = function() {
            callback(record.word);
        };
    }
    else {
        callback(record.word);
    }

    return this;
};

Solitaire.prototype.startRound = function(text, callback) {
    var s = this;

    s.receiveWord(text, function(word) {
        s.sendWord(word, callback);
    });

    return s;
};

module.exports = Solitaire;

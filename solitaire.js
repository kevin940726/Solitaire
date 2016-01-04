var dict = require("./dict-solitaire-edition.json");

String.prototype.removeTone = function() {
    return this.trim().replace(/(ˊ|ˇ|ˋ|˙)/, '');
};

Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
};

window.solitaire = function(text) {
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

    console.log(result);
};

var dict = require("./dict-revised.json");
var fs = require("fs");

var dict = dict.filter(function(d) {
    return d.heteronyms[0].bopomofo && /^[\u4E00-\u9FFF]+$/.test(d.title) && d.title.length > 1;
}).map(function(d) {
    return {
        title: d.title,
        bopomofo: d.heteronyms[0].bopomofo
    };
});

fs.writeFile("dict-solitaire-edition.json", JSON.stringify(dict, null, "\t"), "utf-8", function() {
    console.log("Done.");
});

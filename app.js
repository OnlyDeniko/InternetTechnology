const http = require("http");
var express = require("express");
var app = express();
var fs = require('fs');

let fileContent = fs.readFileSync("questions.json", "utf8");
let obj = JSON.parse(fileContent);
let forms = ""

function generateSection(elemet) {
    let current = "<div class =\"question\"> <h3>" + elemet["question"] + "</h3>";
    elemet["answers"].forEach(e => {
        current += "<div class=\"answer\"> <input name=\"q1\"  type=\"radio\"/>"+ e["answer"] + "</div>";
    })
    current += "</div>";
    return current;
}

obj.forEach(element => {
   forms += generateSection(element); 
});

app.get("", function(req, res){
    res.header('Content-Type','text/html');
    fs.readFile("index.html", "utf8", function(error, data){
        data = data.replace("{forms}", forms);
        res.end(data);
    })
} );

app.listen(3000);
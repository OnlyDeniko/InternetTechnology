const http = require("http");
var express = require("express");
var app = express();
var connection = require("./db");

const bodyParser = require("body-parser");
var fs = require('fs');

const urlencodedParser = bodyParser.urlencoded({extended: false});

let fileContent = fs.readFileSync("questions.json", "utf8");
let obj = JSON.parse(fileContent);
let forms = "<form name=\"quiz\"  method=\"post\" class=\"quizform\">"

function generateSection(elemet, i) {
    let current = "<div class =\"question\"> <h3>" + elemet["question"] + "</h3>";
    elemet["answers"].forEach(e => {
        current += "<div class=\"answer\"> <input name=\"q"+i+"\" value=\"" + e['answer'] + "\" type=\"checkbox\"/>"+ e["answer"] + "</div>";
    })
    current += "</div>";
    return current;
}

obj.forEach((e, i) => {
   forms += generateSection(e, i); 
});

forms += "<input type=\"submit\" value=\"Отправить\" /></form>";

app.post("/test", urlencodedParser, function(req, res){
    if (!req.body) return express.sendStatus(400);
    let correct = true
    var userAns = []
    var trueAns = []
    for (let i = 0; i < obj.length; ++i) {
        var tmp = []
        obj[i]["answers"].forEach(e => {
            if (e["correct"]) {
                tmp.push(e["answer"]);
            }
        });
        trueAns.push(tmp)

        tmp = []
        if (typeof req.body["q" + i] !== "object") {
            tmp.push(req.body["q" + i])
        } else {
            tmp = req.body["q" + i]
        }
        userAns.push(tmp);
    }
    var result = [];
    for (let i = 0; i < userAns.length; i++) {
        if (userAns[i].join() != trueAns[i].join()){
            correct = false;
            break;
        }
    }
    if (correct) {
        res.send("<h1> Всё правильно!!! </h1>")
    } else {
        res.send("<h1> Всё в говне!!! </h1>")
    }
});

app.get("/test", urlencodedParser, function(req, res){
    res.header('Content-Type','text/html');
    fs.readFile("index.html", "utf8", function(error, data){
        data = data.replace("{forms}", forms);
        res.end(data);
    })
});


app.listen(3000);
const http = require("http");
var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var fs = require('fs');
const { response } = require("express");

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
    if (!req.body) return response.sendStatus(400);
    let correct = true
    for (let i = 0; i < obj.length; ++i) {
        let answer = []
        obj[i]["answers"].forEach(e => {
            if (e["correct"]) {
                answer.push(e["answer"]);
            }
        });
        let userAns = []
        if (!req.body["q" + i]) {
            correct = false;
            continue;
        }
        if (typeof req.body["q" + i] !== "object") {
            userAns.push(req.body["q" + i]);
        } else {
            userAns = req.body["q" + i];
        }
    
        if (userAns.length != answer.length) {
            correct = false;
            continue;
        }
        userAns.sort();
        answer.sort();
        for(let j = 0; j < userAns.length; j++) {
            if (userAns[j] != answer[j]) {
                correct = false;
                break;
            }
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
} );


app.listen(3000);
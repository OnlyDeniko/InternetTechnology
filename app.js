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
forms += "<label>Имя пользователя</label><br>"
forms += "<input type=\"text\" name=\"userName\" />"

function generateSection(elemet, i) {
    let current = "<div class =\"question\"> <li>" + elemet["question"] + "</li>";
    elemet["answers"].forEach(e => {
        current += "<div class=\"answer\"> <input name=\"q"+i+"\" value=\"" + e['answer'] + "\" type=\"checkbox\"/>"+ e["answer"] + "</div>";
    })
    current += "</div>";
    return current;
}

forms += "<ol>"
obj.forEach((e, i) => {
    forms += generateSection(e, i); 
});
forms += "</ol>"

forms += "<input type=\"submit\" value=\"Завершить ответ\" /></form>";

app.post("/", urlencodedParser, function(req, res){
    if (!req.body) return express.sendStatus(400);
    let correct = true
    var userAns = []
    var trueAns = []
    const textInsert = 'INSERT INTO quiz(username, question, answer) VALUES($1, $2, $3) RETURNING *'
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
        // QUERY TO DB
        values = [req.body.userName, obj[i]["question"], tmp]
        connection.query(textInsert, values, (err, res) => {
            if (err) {
                console.log(err.stack)
            } else {
                console.log(res.rows)
            }
        })
    }
    for (let i = 0; i < userAns.length; i++) {
        if (userAns[i].length != trueAns[i].length) {
            correct = false;
            break;
        }
        for (let j = 0; j < userAns[i].length; j++) {
            if (userAns[i][j] != trueAns[i][j]) {
                correct = false;
                break;
            }
        }
        if (!correct){
            break;
        }
    }
    if (correct) {
        res.send("<h1> Всё правильно!!! </h1>")
    } else {
        res.send("<h1> Всё в говне!!! </h1>")
    }
});

app.get("/", urlencodedParser, function(req, res){
    res.header('Content-Type','text/html');
    fs.readFile("index.html", "utf8", function(error, data){
        data = data.replace("{forms}", forms);
        res.end(data);
    })
});

app.listen(3000);
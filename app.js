const http = require("http");
var express = require("express");
var app = express();
var connection = require("./db");

const bodyParser = require("body-parser");
var fs = require('fs');

const urlencodedParser = bodyParser.urlencoded({extended: false});

let fileContent = fs.readFileSync("questions.json", "utf8");
let obj = JSON.parse(fileContent);
let forms = "<form name=\"quiz\" action=\"/curResult\" method=\"post\" class=\"quizform\">"
forms += "<label>Имя пользователя</label><br>"
forms += "<input type=\"text\" name=\"userName\"/>"

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

app.post("/curResult", urlencodedParser, function(req, res){
    if (!req.body) return express.sendStatus(400);
    let correct = true
    let userAns = []
    let trueAns = []
    const textInsert = 'INSERT INTO quiz(username, question, answer, date) VALUES($1, $2, $3, $4)'
    let now = new Date();
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
        values = [req.body.userName, obj[i]["question"], tmp, now]
        connection.query(textInsert, values, (err, res) => {
            if (err) {
                console.log(err.stack)
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
    let responseText = "";
    if (correct) {
        responseText += "<h1> Всё правильно!!! </h1>";
    } else {
        responseText += "<h1> Есть ошибки!!! </h1>";
    }
    responseText += "<table border=\"2\"><tr><th>Вопрос</th><th>Результат</th></tr>";
    for (let i = 0; i < userAns.length; i++) {
        responseText += "<tr>"
        responseText += "<td>" + obj[i]["question"] + "</td>"
        let can = true
        for(let j = 0; j < Math.min(userAns[i].length, trueAns[i].length); j++) {
            if (userAns[i][j] != trueAns[i][j]){
                can = false
                break
            }
        }
        if (userAns[i].length != trueAns[i].length){
            can = false
        }
        if (can) {
            responseText += "<td>Правильно</td>"
        } else {
            responseText += "<td>Неправильно</td>"
        }
        responseText += "</tr>"
    }
    responseText += "</table>";
    responseText += "<form name=\"Username\" action=\"/results\" method=\"post\">"
    responseText += "<label>Имя пользователя</label><br>"
    responseText += "<input type=\"text\" name=\"userName\" value=\"" + req.body.userName + "\"/>"
    responseText += "<input type=\"submit\"  value=\"Посмотреть прошлые результаты\" /></form>";

    res.send(responseText)
});

app.get("/", urlencodedParser, function(req, res){
    res.header('Content-Type','text/html');
    fs.readFile("index.html", "utf8", function(error, data){
        data = data.replace("{forms}", forms);
        res.end(data);
    })
});

app.post("/results", urlencodedParser, function(req, res) {
    let textInsert = 'SELECT * FROM quiz WHERE username=\'' + req.body.userName + '\''
    if (req.body.userName == "") {
        textInsert = 'SELECT * FROM quiz'
    }    
    connection.query(textInsert).then ( ans => {
        ans = ans.rows
        let responseText = "<table border=\"2\"><tr><th>Вопрос</th><th>Ответ</th><th>Дата</th></tr>";
        for (let i = 0; i < ans.length; i++) {
            responseText += "<tr>"
            responseText += "<td>" + ans[i]["question"] + "</td>"
            responseText += "<td>" + ans[i]["answer"] + "</td>"
            responseText += "<td>" + ans[i]["date"] + "</td>"
            responseText += "</tr>"
        }
        responseText += "</table>";
        res.send(responseText)
    })
});
app.listen(3000);
const http = require("http");
http.createServer(function(request,response){
    response.end("PIDARASI!!!");
}).listen(3000, function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});
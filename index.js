import express from "express";
import path from "path";
import sha256 from "js-sha256";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

// const sha256 = require('js-sha256');

// function shaLink() {
//     var link = sha256(String(Math.random()));
//     link = link.padStart(65, "/");
//     console.log(link);
// }

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.set("view engine", "ejs");
const __dirname = path.resolve();
var PORT = 3000;

app.use("/public", express.static("public"));
app.use('/favicon.ico', express.static('style/images/favicon.ico'));
app.use(fileUpload({}));


// app.get(("/"), (req, res) => {
//     res.render("auth");
// })

app.get(("/"), (req, res) => {
    res.render("auth", {notification: ""});
})

app.post("/", urlencodedParser, (req, res) => {
    if (req.body.user != "admin" && req.body.pass != "1") {
        console.log("Login attempt");
        res.render("auth", {notification: "Incorrect login or password"});
        
    }
    if (req.body.user == "admin" && req.body.pass == "1") {
        console.log(`Logged in: ${req.body.user}`);
        res.render("panel", {username: req.body.user});
    }
})

app.get('/form', function (req, res) {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.write('<form action="/upload" method="POST" enctype="multipart/form-data" >');
    res.write('<input type="file" name="photo">');
    res.write('<input type="submit">');
    res.write('</form>');
    res.end();
})
app.post('/upload', function(req, res) {
    req.files.photo.mv('public/'+req.files.photo.name);
    res.end(req.files.photo.name);
    console.log(req.files.photo); // the uploaded file object
  });

function startServer() {
    try {
        app.listen(PORT, () => {console.log(`Server has been started on address: http://localhost:${PORT}/`)});// \nPanel on address:\nhttp://localhost:${PORT}${link}\n
    } 
    catch (error) {console.log(error)};
}


startServer()




// req = запрос с браузера
// res = ответ от браузера


// app.get(("/"), (req, res) => {
//     res.render("main");
// })

// app.get("/", (req, res) => {
//     // res.send("login"); отправить на страницу
//     app.get("/login", (req, res) => {
//         app.use('/style',express.static('./style'));
//         res.sendFile(path.resolve("./login.html"));
//     })
// })



// document.getElementById("check").onclick = function() {
//     let login = document.getElementById("login").value;
//     let password = document.getElementById("passwd").value;

//     if (sha256(login) == "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b" && sha256(password) == "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b") {
//         alert("Yes!")
//     }
//     else alert("Incorrect login or password!");
// }

// console.log(sha256("1"));

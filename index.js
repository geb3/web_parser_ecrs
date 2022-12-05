import express from "express";
import path from "path";
import sha256 from "js-sha256";
import bodyParser from "body-parser";
import {dateTime} from './public/scripts/log.js';
import {users} from "./users.js"

var PORT = process.env.PORT ?? 3000;

var app = express();
var __dirname = path.resolve();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
app.use("/public", express.static("public"));
app.use('/favicon.ico', express.static('style/images/favicon.ico'));
app.use(dateTime);

function startServer() {
    try {
        app.listen(PORT, () => {console.log(`Server has been started on address: http://localhost:${PORT}/`)});
    } 
    catch (error) {console.log(error)};
}

// const sha256 = require('js-sha256');

// function shaLink() {
//     var link = sha256(String(Math.random()));
//     link = link.padStart(65, "/");
//     console.log(link);
// }
startServer()



app.get(("/"), (req, res) => {
    res.render("auth", {notification: ""});
})
app.get(("/panel"), (req, res) => {
    res.render("auth", {notification: ""});
})



function checkUsers(userName, userPass) {
    for (let i = 0; i != (Object.keys(users).length); i++) {
        if (userName == Object.keys(users)[i] && userPass == users[Object.keys(users)[i]]) {
            return 1;
        }
    }
    return 0;
}

app.post("/panel", urlencodedParser, (req, res) => {
    let access = checkUsers(req.body.user, req.body.pass);
    if (access == 1) {
        console.log(`${req.dateTime} Logged in: ${req.body.user}`);
        res.render("panel", {username: req.body.user});
    }
    if (access == 0) {
        console.log(`${req.dateTime} Login attempt`);
        res.render("auth", {notification: "Incorrect login or password"});
    }
})










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

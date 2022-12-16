import express from "express";
import fileUpload from 'express-fileupload';
import path from "path";
// import sha256 from "js-sha256";
import bodyParser from "body-parser";
import {dateTime} from './public/scripts/log.js';
import {users} from "./users.js";
import {rules} from "./public/scripts/parser/rules/rules.js";
import {parametersJson} from "./public/scripts/parser/parameters/parameters.js";
import {statusJson} from "./public/scripts/parser/status/status.js";
import serverRoutes from "./routes/server.js";
import fs from 'fs';


var PORT = process.env.PORT ?? 3000;


var app = express();
var __dirname = path.resolve();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
app.use("/public", express.static("public"));
app.use('/favicon.ico', express.static('style/images/favicon.ico'));
app.use(dateTime);
app.use(serverRoutes);
app.use(fileUpload({}));


function startServer() {
    try {
        app.listen(PORT, () => {console.log(`Server has been started on address: http://localhost:${PORT}/`)});
    } 
    catch (error) {console.log(error)};
}

startServer()



app.get(("/"), (req, res) => {
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

function previewFormat(rules) {
    let id = Object.keys(rules["id"]);
    let previewJson = [];
    id.forEach((id) => {
        previewJson += `\nid: ${id} {\n\t${Object.values(rules["id"][id])}\n}`;
    })
    previewJson = previewJson.replace(/,/g, '\n\t');
    return previewJson;
}

app.post("/panel", urlencodedParser, (req, res) => {
    let access = checkUsers(req.body.user, req.body.pass);
    if (access == 1) {
        console.log(`${req.dateTime} Logged in: ${req.body.user}`);
        res.render("panel", {info: `Logged in ${req.body.user}`, preview: `Preview Rules`});
    }
    if (access == 0) {
        console.log(`${req.dateTime} Login attempt`);
        res.render("auth", {notification: "Incorrect login or password"});
    }
})



app.post('/upload', function(req, res) {
    if (req.files == null) {
        console.log(`${req.dateTime} File not Uploaded`);
        res.render("panel", {info: "File not Uploaded", preview: `Preview Rules`});
    }
    else {
        console.log(`${req.dateTime} File Upload in Server Сompleted`)
        req.files.xlsx.mv('public/scripts/parser/upload_file/' + "table_data.xlsx");
        res.render("panel", {info: "File Upload in Server Completed", preview: `Preview Rules`});
    }
});



app.post("/rules", urlencodedParser, (req, res) => {
    if (req.body.url == "" || req.body.rule_2 == "" || req.body.rule_3 == "") {
        console.log(`${req.dateTime} Rules not Transmitted`)
        res.render("panel", {info: "Rules not Transmitted", preview: `Preview Rules:\n${previewFormat(rules)}`});        
    }
    else {
        // const jsonRules = JSON.stringify({"rule_1": req.body.rule_1, "rule_2": req.body.rule_2,"rule_3": req.body.rule_3});
        let lastId = Object.keys(rules["id"]).length - 1;
        let id = Object.keys(rules["id"])[String(lastId)];
        id++;
        rules["id"][id] = {"url": req.body.url, "rule_2": req.body.rule_2,"rule_3": req.body.rule_3};
        fs.writeFileSync('./public/scripts/parser/rules/rules.json', JSON.stringify(rules));
        console.log(`${req.dateTime} Rule Added with ID: ${id}`);
        res.render("panel", {info: `Rule Added with ID: ${id}`, preview: `Preview Rules:\n${previewFormat(rules)}`});
    }
})


app.post("/start", urlencodedParser, (req, res) => {
    if (req.body.timeoutParser == "") {
        console.log(`${req.dateTime} Launch Interval is not Selected`);
        res.render("panel", {info: "Launch Interval is not Selected", preview: `Preview Rules`});
    }
    else {
        fs.writeFileSync('./public/scripts/parser/parameters/parameters.json', JSON.stringify({"timeout": req.body.timeoutParser}));
        console.log(`${req.dateTime} Launch Parser`);
        res.render("panel", {info: "Waiting...", preview: `Preview Rules`});
    }
})


app.post("/previewRules", urlencodedParser, (req, res) => {
    res.render("panel", {info: "Preview Rules", preview: `Preview Rules:\n${previewFormat(rules)}`});
})

app.post("/previewRulesJson", urlencodedParser, (req, res) => {
    res.json(rules)
})

app.post("/deleteRules", urlencodedParser, (req, res) => {
    if (req.body.deleteRules == "") {
        let lastId = Object.keys(rules["id"]).length -1;
        let id = Object.keys(rules["id"])[String(lastId)];
        delete rules["id"][id];
        fs.writeFileSync('./public/scripts/parser/rules/rules.json', JSON.stringify(rules));
        res.render("panel", {info: `Last Rule with ID: ${id} has been Removed`, preview: `Preview Rules:\n${previewFormat(rules)}`});
        console.log(`${req.dateTime} Last Rule with ID: ${id} has been Removed`);
    }
    if (req.body.deleteRules != "") {
        let id = req.body.deleteRules;
        delete rules["id"][id];
        fs.writeFileSync('./public/scripts/parser/rules/rules.json', JSON.stringify(rules));
        res.render("panel", {info: `Rule with ID: ${id} has been Deleted`, preview: `Preview Rules:\n${previewFormat(rules)}`});
        console.log(`${req.dateTime} Rule with ID: ${id} has been Deleted`);
    }
})

app.post("/users/data", urlencodedParser, (req, res) => {
    res.json(users)
})

app.post("/downloadRules", urlencodedParser, (req, res) => {
    const file = `./public/scripts/parser/rules/rules.json`;
    res.download(file);
    console.log(`${req.dateTime} Client Downloaded the .json File`);
})

app.post("/uploadRules", urlencodedParser, (req, res) => {
    if (req.files == null) {
        res.render("panel", {info: "File not Uploaded", preview: `Preview Rules`});
        console.log(`${req.dateTime} File not Uploaded`);
    }
    else {
        req.files.xlsx.mv('public/scripts/parser/check/' + "rules.json");
        res.render("panel", {info: "File Upload in Server Completed", preview: `Preview Rules:\n${previewFormat(rules)}`});
        console.log(`${req.dateTime} File Upload in Server Сompleted`)
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

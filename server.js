const express = require("express");
const path = require("path");
const app = express();
const fs = require('fs')
const cors = require('cors')
const {Util, ParserClient} = require('./backend')
const formidable = require('formidable');
require("dotenv").config()

app.use(express.static(path.join(__dirname, "frontend/build")))
app.use(cors())
app.use(express.json())

const client = new ParserClient(path.join(__dirname, './tables/table_data.xlsx'))
client.start().catch(console.error)


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/build", "index.html"))
})

app.post('/api/login', (req, res) => {
    const users = JSON.parse(fs.readFileSync(Util.checkPath(path.join(__dirname, 'users.json'), 'file', 'users.json'))
    )
    let login = req.body[0].replace(/ /g, "")
    if (users[login]){
        if (users[login] === req.body[1]) {
            console.log('User', `'${login}'`, 'logged in')
            res.send(true)
        }
        else res.send(false)
    }
    else {
        res.send(false)
    }


})

app.get('/api/lastStarted', (req, res) => {
    res.send({date: client.lastStarted})
})

app.post('/api/save', (req, res) => {
    client.saveMany(req.body)
    res.sendStatus(200)
})

app.post('/api/preview', async (req, res) => {
    let resp = await client.preview(req.body).catch(e => {
        console.log(`Error while parsing ${req.body.url}`, e)
    })
    res.send(resp)

})

app.post('/api/restart', (req, res) => {
    client.interval = Number(req.body.interval) * 24 * 60 *60 *1000
    client.startIntervalParser(false).catch(console.error)
})

app.post('/api/upload', (req, res) => {
    console.log("table.xlsx had been uploaded")
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        fs.rename(files.file.filepath, Util.checkPath(path.join(__dirname, '/tables'), 'directory', 'uploaded file') + '/table_data.xlsx', err => {
            if (err) console.error(err)
        })
    })
    res.sendStatus(200)
})

app.get('/api/forceStart', (req, res) => {
    client.startIntervalParser(false)
})

app.get('/api/interval', (req, res) => {
    res.send({data: client.interval})
})

app.get('/api/rules', async (req, res) => {
    await client.getRules().then((data) => {
        res.send(data)
    })
})

app.get('/api/download/table_data.xlsx', (req, res) => {
    res.download(Util.checkPath(path.join(__dirname, 'tables/table_data.xlsx'), 'file', 'table_data.xlsx'))
})

app.listen(8080)
console.log('app listens http://localhost:8080')
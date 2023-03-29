"use strict";
const process = require("node:process")
const path = require("path")
const proxyHandler = require("./backend/ProxyHandler")
const Util = require("./backend/lib/Util");
const fs = require('fs')

if (process.argv[2]) {
    if (process.argv[2] === "update_proxies") {
        proxyHandler.bind(path.join(__dirname, "proxies/http.txt"),
        path.join(__dirname, "proxies/socks4.txt"),
        path.join(__dirname, "proxies/socks5.txt"))
    }
    if (process.argv[2] === "adduser") {
        const usersConf = require('./users.json')
        usersConf[process.argv[3]] = process.argv[4]
        fs.writeFileSync(Util.checkPath(path.join(__dirname, 'users.json'), 'file', 'users.json'), JSON.stringify(usersConf))
        console.log('user added successfully!')
        process.exit(0)
    }
}



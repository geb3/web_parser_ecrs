"use strict";
const Util = require("./lib/Util");
const fs = require("fs")
const path = require("path");
const { networkInterfaces } = require('os')
const axios = require("axios")
require("dotenv").config()
const ProxyAgent = require("proxy-agent")

class ProxyHandler {
    proxiesObject;
    constructor(proxiesJsonPath = "", ping_host_url = "") {
        this.ip = process.env.EXTERNAL_IP? process.env.EXTERNAL_IP : this._getIp()
        this.ping_host_url = ping_host_url? ping_host_url : "http://77.246.158.157:8080"
        this.validProxies = []

        this.absolute_json_path = proxiesJsonPath
            ? proxiesJsonPath
            : Util.checkPath(path.join(__dirname, "../proxies/proxies.json"), "file", "proxies.json")
        this._getProxyFile().catch(console.error)
    }

    async _getProxyFile() {
        this.proxiesObject = JSON.parse(fs.readFileSync(this.absolute_json_path, "utf-8").toString())
        if (this.proxiesObject.constructor === Array) this.validProxies = [...this.proxiesObject]
        else this.proxiesObject = this.proxiesObject.proxies;
    }

    _getIp(){
       return [].concat(...Object.values(networkInterfaces()))
            .filter(details => details.family === 'IPv4' && !details.internal)
            .pop().address
    }

    getRandomProxy() {
        return this.validProxies[Math.floor(Math.random() * (this.validProxies.length - 1))]
    }

    async getRandomValidProxy() {
        let isWorking
        while (!isWorking) {
            if (this.validProxies.length === 0){
                console.warn("no valid proxies")
                return null
            }
            let proxy_index = Math.floor(Math.random() * (this.validProxies.length - 1))
            let res = await axios.get(this.ping_host_url, {
                httpAgent: new ProxyAgent(this.validProxies[proxy_index]),
                withCredentials: true,
                timeout: 2000
            }).catch(() => console.log("not valid proxy"))
            if (res?.data) return this.validProxies[proxy_index];
            else this.validProxies.splice(proxy_index, 1);
            isWorking = res?.data;
        }
    }

    async validateProxies() {
        return new Promise( async (resolve, reject) => {
            let requests = []
            for (let i = 0; i <= 2; i ++) {
                switch (i){
                    case 0:
                        for (let proxy of this.proxiesObject["http"]){
                            let vProxy = this._validateProxy(proxy)
                            requests.push(this._addToCheckListProxy(this.ping_host_url, "http", vProxy.ip, vProxy.port))
                        }
                        break;
                    case 1:
                        for (let proxy of this.proxiesObject["socks4"]){
                            let vProxy = this._validateProxy(proxy)
                            requests.push(this._addToCheckListProxy(this.ping_host_url, "socks4", vProxy.ip, vProxy.port))
                        }
                        break;
                    case 2:
                        for (let proxy of this.proxiesObject["socks5"]){
                            let vProxy = this._validateProxy(proxy)
                            requests.push(this._addToCheckListProxy(this.ping_host_url, "socks5", vProxy.ip, vProxy.port))
                        }
                        break;
                }
            }
            axios.all(requests).then(() => {this.constructor._save(this.validProxies); resolve(true)})
        })
    }

    _addToCheckListProxy(pingHostUrl, proxyProtocol, proxyIp, proxyPort) {
        return axios.get(pingHostUrl, {
            httpAgent: new ProxyAgent(`${proxyProtocol}://${proxyIp}:${proxyPort}`),
            withCredentials: true,
            timeout: 1000
        }).then((res) => {if(res.data.ip !== this.ip) this.validProxies.push(`${proxyProtocol}://${proxyIp}:${proxyPort}`);else console.warn(`DEAD ${proxyProtocol}://${proxyIp}:${proxyPort}`)})
            .catch(() => {console.warn(`DEAD ${proxyProtocol}://${proxyIp}:${proxyPort}`)})
    }

    _validateProxy(proxy) {
        let separator = ":"
        let separator_index = proxy.search(separator)
        return ({
            ip: proxy.substring(0, separator_index),
            port: proxy.substring(separator_index + 1, proxy.length)
        })
    }

    static bind(httpFilePath, socks4Path, socks5Path) {

        let absolute_paths = [
            Util.checkPath(httpFilePath, "file", "http.txt"),
            Util.checkPath(socks4Path, "file", "socks4.txt"),
            Util.checkPath(socks5Path, "file", "socks5.txt")
        ]
        let read = []
        try {
            for (let path of absolute_paths) {
                read.push(fs.readFileSync(path, "utf-8").toString().split("\r\n"))
            }
        }
        catch (e) {
            console.error("Error when bindling proxies", e.stack)
        }
        let bounded_data = {
            proxies: {
                http: read[0],
                socks4: read[1],
                socks5: read[2]
            }
        }
        this._save(bounded_data)

    }
    static _save(data) {
        try {
            let absolute_path = Util.checkPath(path.join(__dirname, "../proxies/proxies.json"), "file", "proxies.json")
            fs.writeFileSync(absolute_path, JSON.stringify(data))
            console.log("Proxies list updated successfully!")
        }
        catch (e) {
            console.error("cat\t save proxies bounded object", e.stack)
        }
    }
}
module.exports = ProxyHandler
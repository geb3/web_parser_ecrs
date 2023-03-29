"use strict";
const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const useProxy = require("puppeteer-page-proxy")
const ProxyHandler = require("./ProxyHandler");

class Parser {
    browser;
    page;
    proxies;
    constructor(withProxying, tableInstance) {
        this.withProxying = withProxying
        this.tableInstance = tableInstance
        this.parseRes = []
        this.proxy_handler = new ProxyHandler()
        this.counter = 0
        this.closedBrowser = false
    }

    async _start() {
        return this.browser = await puppeteer.launch(
            {
                headless: false,
                defaultViewport: null,
                args: ['--disable-web-security']
            }
        );
        // this.page = await this.browser.newPage();
    }
    async scrape(scrapeRules, browser) {
        return new Promise(async (resolve, reject) => {
            let page
            // const proxy = await this.proxy_handler.getRandomProxy()
            // console.log(proxy)
            // if (!this.browser) {
            //     console.log("no browser")
            //     await this._start()
            // }
            if (!scrapeRules || !scrapeRules.tag ) reject('no data to parse')
            if (!scrapeRules.url) reject('no url to scrape')
            page = await browser.newPage();

            await this._changeUserAgent(page).catch(e =>{
                console.log(`Error while parsing ${scrapeRules.url}`, e)
                reject(e)
            })

            let selector
            if (!scrapeRules.attribute || scrapeRules.attribute === '') selector = `${scrapeRules.tag}`
            else selector = `${scrapeRules.tag}[${scrapeRules.attribute}]`

            if (this.withProxying) {
                const proxy = await this.proxy_handler.getRandomProxy()
                console.log(proxy)
                await useProxy(page, proxy)
            }
            try {
                await page.goto(scrapeRules.url, {waitUntil: "domcontentloaded", timeout: 30000})
            } catch (e) {
                console.log(`Error while parsing ${scrapeRules.url}`, e)
                reject(e)
            }


            // page.on("response", res => {
            //     console.log(res.status(), res.url())
            //     if (res.status() === 404) reject(404)
            //     if (res.status() === 500) reject(500)
            // })
            try {
                await page.waitForSelector(selector)
                let res = await page.evaluate((selector) => {
                    let priceNode = Array.from(document.querySelectorAll(`${selector}`))
                    return priceNode.map(el => el.innerText)
                }, selector)
                await page.close()
                resolve(res)
            }
            catch (e) {
                console.log(`Error while parsing ${scrapeRules.url}`, e)
                reject(e)
            }
        })
    }

    async kill() {
        await this.browser.close()
        if (this.browser.process() != null) this.browser.process().kill('SIGINT')
    }

    async preview (scrapeRule, browser) {
        return new Promise(async resolve => {
            await this.scrape(scrapeRule, browser).then((res) => {resolve(String(res[0].replace(/\..*$/g, '')).replace(/\D+/g, ''))})
                .catch(() => {resolve("err")})
        })

    }

    async retry(rule, browser) {
        console.log("retrying...")
        this.counter ++
        console.log(this.counter)
        if (this <= 5) {
            try {
                setTimeout(() => this.scrape(rule, browser), 2000)
            } catch (e) {
                console.error(e)
            }
        }

    }

    async scrapeMany(rules = [], browser) {
        this.parseRes = []
        // if (!this.browser) await this._start()
       let rulesArr = rules
        if (!this.proxy_handler.validProxies.length) await this.proxy_handler.validateProxies()
        for (let [i,rule] of Object.entries(rulesArr)) {
            this.counter = 0
            if (rule.tag || rule.tag !=="") {
                try {
                    await this.scrape(rule, browser)
                        .then((res) =>{
                            let temp = {}
                            temp[rule.name] = String(res[0].replace(/\..*$/g, '')).replace(/\D+/g, '')
                            temp["data"] = String(res[0].replace(/\..*$/g, '')).replace(/\D+/g, '')
                            temp["cellNumber"] = rule.cellNumber
                            this.parseRes.push(temp)
                        })
                } catch (e) {
                    console.error(`Can't scrape ${rule.url}`, e);
                    if (this.counter <= 5) {
                        await this.retry(rule, browser)
                    }
                }
            }
        }
        return this.parseRes
    }

    async _changeUserAgent(page) {
        await page.setUserAgent(userAgent.toString())
    }
}

module.exports = Parser
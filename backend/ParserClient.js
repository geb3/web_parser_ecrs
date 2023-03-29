const Table = require("./Table");
const Parser = require("./Parser");
const puppeteer = require("puppeteer");

class ParserClient {
    parser
    constructor(table_file_path, interval) {
        this.TableInstance = new Table(table_file_path)
        if (interval) {
            this.interval = Number(interval) * 24 * 60 *60 *1000
        }
        else this.interval = 10 * 24 * 60 * 60 * 1000
        this.lastStarted = new Date()
        this.browser = null;
    }
    async start(){
        return this.browser = await puppeteer.launch(
            {
                headless: true,
                defaultViewport: null,
                args: ['--disable-web-security']
            }
        );
    }
    preview(rule) {
            console.log("getting preview...")
            let parser = new Parser(false, this.TableInstance)
            return parser.preview(rule, this.browser)
        }
    async startIntervalParser(withProxying) {
        console.log("stating parser with big amount of urls...")
        this.lastStarted = new Date()
        let rules = await this.getRules()
        this.parser = new Parser(withProxying, this.TableInstance)
        this.parser.scrapeMany(rules, this.browser).then((d) => this.save(d, 'price')).catch(console.error)
        setInterval(() => this.parser.scrapeMany(rules, this.browser).then((d) => this.save(d, 'price')).catch(console.error), Number(this.interval))
    }
    async getRules(){
        return this.TableInstance.readRules().catch(e => console.error('fail when parsing table...'))
    }
    save(data, name) {
        console.log("saving new data...")
        console.log(data)
        this.TableInstance.saveData(name, data)
    }
    saveMany(data) {
        console.log("saving big amount of data...")
        for (let [key, value] of Object.entries(data)) {
            if (!value.url) data.splice(key, 1)
        }
        this.TableInstance.saveArrayData(data)
    }
}
module.exports = ParserClient
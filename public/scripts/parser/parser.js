import fs from 'fs';
import path from "path";
import cheerio from "cheerio";
import axios from 'axios';
import XlsxPopulate from "xlsx-populate";


const __dirname = path.resolve();
// const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
// const rulesJson = loadJSON('./rules/rules.json');
// const parametersJson = loadJSON('./parameters/parameters.json');

// console.log(rulesJson, parametersJson);

// parse(urls[0]);

function statusParse(arrlength, done) {
    fs.writeFileSync(__dirname + '/public/scripts/parser/status/status.json', JSON.stringify({"Done": String(done), "Quantity": String(arrlength)}));
    console.log("File Create!");
}


async function workTable() {
    var urls = [];
    const urlsReturn = await XlsxPopulate.fromFileAsync(__dirname + "/public/scripts/parser/upload_file/table_data.xlsx").then(workbook => {       
            for (let colums = 2; typeof workbook.sheet("Лист1").cell(`A${colums}`).value() != "undefined"; colums++) {
                const url = workbook.sheet("Лист1").cell(`A${colums}`).value();
                urls.push(url);
            }
            return urls;
        });
    return urlsReturn;
}

const urls = await workTable();

function parser(urls) {
    var getHTML = async (url) => {
        const {data} = await axios.get(url);
        return cheerio.load(data);
    }
    
    async function parse(url) {
        const $ = await getHTML(String(url));
        return $;
    }

    let i = 0;
    const interval = setInterval(() => {
        const $ = parse(urls[i]);
        console.log($);
        if (typeof urls[i] == "undefined") clearInterval(interval);
    }, 2000)
    
}

console.log(urls);
statusParse(String(urls.length), String(1));
parser(urls);


// statusParse(String(urls.length), "1");



// export function dateTime(req, res, next) {
//     let Data = new Date().toLocaleDateString();
//     let Time = new Date().toLocaleTimeString().slice(0,-3);
//     req.dateTime = String(Data + " " + Time);
//     next();
// }
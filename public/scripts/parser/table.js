import fs from 'fs';
import path from "path";
import cheerio from "cheerio";
import axios from 'axios';
import XlsxPopulate from "xlsx-populate";


const __dirname = path.resolve();
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const rulesJson = loadJSON('./rules/rules.json');
const parametersJson = loadJSON('./parameters/parameters.json');

console.log(rulesJson, parametersJson);

var getHTML = async (url) => {
    const {data} = await axios.get(url);
    return cheerio.load(data);
}

XlsxPopulate.fromFileAsync(__dirname + "/public/scripts/parser/upload_file/table_data.xlsx")
    .then(workbook => {
        var urls = [];         
        for (let colums = 2; typeof workbook.sheet("Лист1").cell(`A${colums}`).value() != "undefined"; colums++) {
            const url = workbook.sheet("Лист1").cell(`A${colums}`).value();
            urls.push(url);
        }
        async function parse(url) {
            const $ = await getHTML(String(url));
            console.log($);
        }
        
        console.log(urls);
        parse(urls[0]);
    });
    



// export function dateTime(req, res, next) {
//     let Data = new Date().toLocaleDateString();
//     let Time = new Date().toLocaleTimeString().slice(0,-3);
//     req.dateTime = String(Data + " " + Time);
//     next();
// }
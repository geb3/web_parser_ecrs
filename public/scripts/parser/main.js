import fs from 'fs';
import $ from "cheerio";

const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const rulesJson = loadJSON('./rules/rules.json');
const parametersJson = loadJSON('./parameters/parameters.json');

console.log(rulesJson, parametersJson);

// export function dateTime(req, res, next) {
//     let Data = new Date().toLocaleDateString();
//     let Time = new Date().toLocaleTimeString().slice(0,-3);
//     req.dateTime = String(Data + " " + Time);
//     next();
// }
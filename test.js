import {rules} from "./public/scripts/parser/rules/rules.js";
import cheerio from "cheerio";
import axios from 'axios';

// const url = "https://snipp.ru/html-css/input-file-style";

// console.log(url.split('/').slice(0, 3).join('/'));
// console.log(rules);

var getHTML = async (url) => {
    const {data} = await axios.get(url);
    return cheerio.load(data);
}

async function parse() {
    let id = "4";
    let url = rules["id"][id]["Url"];
    const tag = rules["id"][id]["Tag"];
    const attribute = rules["id"][id]["Attribute"];

    console.log(url + "\n" + tag + "\n" + attribute);


    const $ = await getHTML(String(url));
    const result = await $("bdi").eq(0).text();
    
    console.log(result + "\n");
    console.log(result.replace(/[^\d]/g, ''));
}

// let id = Object.keys(rules["id"]);
// id.forEach((el) => {
//     let obj = Object.values(rules["id"][el]);
//     console.log(obj);
// })
parse();






// console.log(delete rules["id"]);
// delete rules["id"][lastId];
// console.log(rules);
import cheerio from "cheerio";
import axios from 'axios';
import {rules} from "../rules/rules.js";
import {parametersPreview} from "./parametersPreview.js";

var getHTML = async (url) => {
    const {data} = await axios.get(url);
    return cheerio.load(data);
}

async function parse() {
    const url = rules["id"][parametersPreview["idRules"]]["Url"];
    const tag = rules["id"][parametersPreview["idRules"]]["Tag"];
    let attribute = rules["id"][parametersPreview["idRules"]]["Attribute"];

    if (parametersPreview["eqElement"] == "") {
        const $ = await getHTML(String(url));
        const result = await $(`${tag}[${attribute}]`).text();
        parametersPreview["idRules"] = "1";
        parametersPreview["eqElement"] = "";
        return result
    }
    else {
        const $ = await getHTML(String(url));
        const result = await $(`${tag}[${attribute}]`).eq(Number(parametersPreview["eqElement"])).text();
        parametersPreview["idRules"] = "1";
        parametersPreview["eqElement"] = "";
        return result.replace(/[^\d]/g, '')
    }
}

export const previewParse = await parse();
import axios from "axios";
const address = "localhost:8080"
export default class RulesService {
    static async getRulesData() {
        // let data = [
        //     {
        //         name: "Стационарный двумерный сканер Mercury 8500 P2D Mirror Black",
        //         url: "https://online-kassa.ru/kupit/shtrih-m-01f/",
        //         tag: "span",
        //         attribute: "itemprop=\"price\"",
        //     },
        //     {
        //         name: "Эвотор Power Без ФН",
        //         url: "https://www.kkm.ru/shop/fiskalnyy_registrator_shtrikh_nano_f-63784/",
        //         tag: "span",
        //         attribute: "itemprop=\"price\"",
        //         eqElement: "0"
        //     },
        //     {
        //         name: "ККТ \"ЭЛВЕС-ФР-Ф\" черный без ФН",
        //         url: "https://www.atol.ru/catalog/smart-terminal-atol-stb-5/",
        //         tag: "span",
        //         attribute: "data-test=\"222\""
        //     },
        //     {
        //         name: "Эвотор Power ФН36",
        //         url: "https://kasscenter.ru/product/atol-sigma-10/",
        //         tag: "bdi",
        //         attribute: ""
        //     }]
        // console.log(data)
        // return new Promise((resolve, reject) => {
        //     setTimeout(() => {resolve(data)}, 5000)
        // })
        let res = await axios.get(`/api/rules`).catch(console.error)
        return res.data
    }

}
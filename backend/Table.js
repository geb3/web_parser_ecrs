"use strict";
const Utils = require("./lib/Util");
const Queue = require("queue");
const XlsxPopulate = require('xlsx-populate');

class Table {
    constructor(filepath) {
        if (!filepath) throw new Error('no path for table')
        this.filePath = Utils.checkPath(filepath, 'file', 'xlsx_table');
        this.queue = new Queue({results: [], autostart: true, concurrency: 1})
        this._addQueueListeners()
        this.data = []
    }

    _addQueueListeners () {
        this.queue.on('error', (err, job) => {
            console.log('job', job.toString(), 'finished with err', err)
        })
    }


    addJob(promise_func) {

    }

    //todo: сказать про текст ссылок

    readRules() {
        return new Promise((resolve, reject) => {
            XlsxPopulate.fromFileAsync(this.filePath)
                .then(workbook => {
                    let columns = ["A", "B", "C", "D", "E", "F", "G"]
                    let temporary_values = {
                        url: [],
                        id: [],
                        article: [],
                        name: [],
                        price: [],
                        tag: [],
                        attribute: [],
                        cellNumber: []
                    }
                    for (let colum_letter of columns) {
                        let flag = false
                        let col_num = 2
                        while (!flag) {
                            try {
                                if (colum_letter === "A" && workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value()) {
                                    let temp = workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value()
                                    if (String(temp).startsWith("htt")) {
                                        temporary_values.url.push(String(temp))
                                    }
                                    col_num++
                                } else if (col_num - 1 <= temporary_values.url.length && colum_letter !== "A") {
                                    temporary_values.cellNumber.push(col_num)
                                    switch (colum_letter) {
                                        case "B":
                                            temporary_values.id.push(String(workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value() ?? "-"))
                                            break
                                        case "C":
                                            temporary_values.article.push(String(workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value() ?? "-"))
                                            break
                                        case "D":
                                            temporary_values.name.push(String(workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value() ?? "-"))
                                            break
                                        case "E":
                                            temporary_values.price.push(String(workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value() ?? "-"))
                                            break
                                        case "F":
                                            temporary_values.tag.push(String(workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value() ?? ""))
                                            break
                                        case "G":
                                            temporary_values.attribute.push(String(workbook.sheet("Лист1").cell(`${colum_letter}${col_num}`).value() ?? ""))
                                            break
                                    }
                                    col_num++
                                } else {

                                    flag = true
                                }
                            } catch (e) {
                                reject(e)
                            }
                        }

                    }
                    let amount
                    let firstly = true
                    this.data = []
                    temporary_values.cellNumber.splice(3, temporary_values.cellNumber.length - 3)
                    if (temporary_values.cellNumber.length < temporary_values.url.length){
                        for (let i = (temporary_values.url.length - temporary_values.cellNumber.length); i > 0; i-- ){
                            temporary_values.cellNumber.push(temporary_values.cellNumber[temporary_values.cellNumber.length - 1] + 1)
                        }
                    }
                    if (temporary_values.cellNumber.length > temporary_values.url.length) {
                        for (let i = (temporary_values.cellNumber.length - temporary_values.url.length); i > 0; i --){
                            temporary_values.cellNumber.splice(i - 1, 1)
                        }
                    }
                    temporary_values.cellNumber.sort((a, b) => {return a - b})
                    for (let [key, value] of Object.entries(temporary_values)) {
                        if (firstly && key === "url") {
                            amount = value.length
                            while (amount) {
                                this.data.push({})
                                amount--
                            }
                            firstly = false
                        }
                        for (let [i, v] of Object.entries(value)) {
                            this.data[i][key] = v
                        }
                    }
                    resolve(this.data)
                })
        })
    }
    saveArrayData(arr) {
        this.queue.push(() => {
            return new Promise((resolve, reject) => {
                let xlsxData = []
                for (let rule of arr) {
                    let tempArr = []
                    tempArr.push(rule.url, rule.id, rule.article, rule.name, rule.price, rule.tag, rule.attribute)
                    xlsxData.push(tempArr)
                }
                XlsxPopulate.fromFileAsync(this.filePath).then(workbook => {
                    const r = workbook.sheet('Лист1').range(`A2:G${arr.length + 1}`)
                    const D = workbook.sheet('Лист1').range(`A${arr.length + 2}:G130`)
                    r.value(xlsxData)
                    D.value(" ")
                    resolve(workbook.toFileAsync(this.filePath))
                })
            })
        })
    }
    saveData(data_name, data) {
        this.queue.push(() => {
            return new Promise((resolve, reject) => {
                if (Object.keys(data).length === 0) return reject("no data")
                let dictionary = {}
                dictionary["url"] = "A"
                dictionary["id"] = "B"
                dictionary["article"] = "C"
                dictionary["name"] = "D"
                dictionary["price"] = "E"
                dictionary["tag"] = "F"
                dictionary["attribute"] = "G"
                XlsxPopulate.fromFileAsync(this.filePath).then(workbook => {
                    for (let [key, value] of Object.entries(data)) {
                        workbook.sheet("Лист1").cell(`${dictionary[data_name]}${value.cellNumber}`).value(`${value.data}`)
                    }
                    resolve(workbook.toFileAsync(this.filePath))
                })
            })
        })
    }
}
module.exports = Table
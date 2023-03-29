import axios from "axios";
const address = "localhost:8080"
export default class ParserService {
    static async sendForceStart() {
        await axios.get(`/api/forceStart`).catch(console.error)
            .then(() => {return true})
    }
    static async sendForceRestart(interval){
        await axios.post(`/api/restart`, interval).catch(console.error)
            .then((res) => {return res.data})
    }
    static async getPreview(rule){
        let res = await axios.post(`/api/preview`, rule).catch(console.error)
        return res.data
    }
    static async save(rules){
        await axios.post(`/api/save`, rules)
        return true
    }
    static async getInterval() {
        let res = await axios.get(`/api/interval`).catch(console.error)
        return res.data
    }
    static async getLastStarted() {
        let res = await axios.get(`/api/lastStarted`).catch(console.error)
        return res.data
    }
}
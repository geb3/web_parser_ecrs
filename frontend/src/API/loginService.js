import axios from "axios";
const address = "localhost:8080"
export default class LoginService {
    static async checkLoginData(data) {
        console.log('here')
        let res = await axios.post(`/api/login`, data).catch(console.error)
        return res.data
        // return new Promise((resolve, reject) => {
        //     setTimeout(() => {resolve(true)}, 5000)
        // })
    }
}
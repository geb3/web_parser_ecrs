import axios from "axios";
const address = "localhost:8080"
export default class FilesService {
    static async uploadFile(file) {
        await axios.post(`/api/upload`, file).catch(console.error)
    }
}
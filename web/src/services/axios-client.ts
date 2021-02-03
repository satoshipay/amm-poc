import axios from "axios"
import config from "../config"

const axiosClient = axios.create({
  baseURL: config.tssURL,
})

export default axiosClient

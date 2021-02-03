import axios from "axios"

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_TSS_URL || "http://localhost:3001",
})

export default axiosClient

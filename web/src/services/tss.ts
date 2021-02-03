import axios from "./axios-client"

const baseUrl = ""

export async function getContracts() {
  const response = await axios.get(baseUrl)
  return response.data
}

export async function getContract(hash: string) {
  const response = await axios.get(`${baseUrl}/${hash}`)
  return response.data
}

export async function runContract(hash: string, data: any) {
  try {
    const response = await axios.post(`${baseUrl}/contract/${hash}`, data)
    console.log(response)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(error.response.data)
    } else if (error.request) {
      console.error(error.request)
    } else {
      console.error("Error", error.message)
    }
    throw Error
  }
}

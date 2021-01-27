import { Server } from "stellar-sdk"

export type Config = ReturnType<typeof getConfig>

const config = {
  baseUrl: "http://localhost:3001",
  horizon: "https://stellar-horizon.satoshipay.io/",
  horizonTestnet: "https://stellar-horizon-testnet.satoshipay.io/",
  port: 3001,
  testnet: true,
}

function getConfig() {
  return config
}

export default config

export const horizonServers = {
  mainnet: new Server(config.horizon),
  testnet: new Server(config.horizonTestnet),
}

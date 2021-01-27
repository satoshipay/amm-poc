import { Server } from "stellar-sdk"

export type Config = ReturnType<typeof getConfig>

const config = {
  baseUrl: "http://localhost:3001",
  horizon: "https://stellar-horizon.satoshipay.io/",
  horizonTestnet: "https://stellar-horizon-testnet.satoshipay.io/",
  port: 3001,
  signingAccountSecret: process.env.SIGNING_ACCOUNT || "SAEOFJZDDHJX5SPSN23JYF3XK2UWP6LDO4LVT5XDG274WHWF7FZBYDO6",
  testnet: true,
  turretAccountSecret: process.env.TURRET_ACCOUNT || "SADEOKHGP5I4KBPP5AOMJWPY32AEP7A6POGKQN74NLO3MGTQT7J36FOA",
}

function getConfig() {
  return config
}

export default config

export const horizonServers = {
  mainnet: new Server(config.horizon),
  testnet: new Server(config.horizonTestnet),
}

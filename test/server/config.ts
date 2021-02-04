import { fail } from "assert"
import { Server } from "stellar-sdk"

export type Config = ReturnType<typeof getConfig>

const config = {
  baseUrl: "http://localhost:3001",
  horizon: "https://stellar-horizon.satoshipay.io/",
  horizonTestnet: "https://stellar-horizon-testnet.satoshipay.io/",
  port: 3001,
  signingAccountSecret: process.env.SIGNING_SECRET_KEY || process.env.TURRET_SECRET_KEY,
  testnet: true,
  turretAccountSecret: process.env.TURRET_SECRET_KEY || fail("TURRET_SECRET_KEY not set"),
}

function getConfig() {
  return config
}

export default config

export const horizonServers = {
  mainnet: new Server(config.horizon),
  testnet: new Server(config.horizonTestnet),
}

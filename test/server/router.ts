import BodyParser from "koa-body"
import Router from "koa-router"
import { Keypair } from "stellar-sdk"
import { AMMRequestBody } from "../../src/types"
import { Config } from "./config"

let contract: any = null
try {
  contract = require("../contract/main.js")
} catch (error) {
  throw Error("No compiled contract found! Please copy a compiled contract to `/test/contract/main.js`.")
}
const contractFields = require("../contract/fields.json")

export default function createRouter(config: Config) {
  const router = new Router()

  const turretAccount = Keypair.fromSecret(config.turretAccountSecret)
  const signerAccount = Keypair.fromSecret(config.signingAccountSecret)

  router.use(
    BodyParser({
      urlencoded: true,
    })
  )

  router.get("/", async ({ params, request, response }) => {
    const result = {
      turret: turretAccount.publicKey(),
      runFee: "0.1",
      uploadFee: "10",
      network: config.testnet ? "TESTNET" : "PUBLIC",
      contracts: [
        {
          contract: "my_contract_hash",
          signer: signerAccount.publicKey(),
          fields: contractFields,
        },
      ],
    }

    response.body = result
  })

  router.get("/contract/:hash", async ({ params, request, response }) => {
    response.body = {
      turret: turretAccount.publicKey(),
      signer: signerAccount.publicKey(),
      fee: "0.005",
      fields: contractFields,
    }
  })

  router.post("/contract/:hash", async ({ params, request, response }) => {
    const requestBody = JSON.parse(request.body) as AMMRequestBody.Any

    const input = { request: requestBody, signers: [""] }
    const xdr = await contract(input)

    const signature = signerAccount.sign(xdr).toString("base64")
    const signer = signerAccount.publicKey()

    const result = { xdr, signer, signature }
    response.body = result
  })

  router.get("/status/live", (ctx) => {
    ctx.status = 200
  })

  return router
}

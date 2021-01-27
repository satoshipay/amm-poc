import BodyParser from "koa-body"
import Router from "koa-router"
import * as path from "path"
import { Keypair, Networks, Transaction } from "stellar-sdk"
import { AMMRequestBody, TSSContract, TSSContractInput } from "../../src/types"
import { Config } from "./config"

let contract: TSSContract<AMMRequestBody.Any>

try {
  contract = require(path.join(__dirname, "../contract/main.js"))
} catch (error) {
  if (error.code === "MODULE_NOT_FOUND") {
    throw Error("No compiled contract found! Please link or copy a compiled contract to `test/contract/main.js`.\n")
  } else {
    throw error
  }
}
const contractFields = require(path.join(__dirname, "../contract/fields.json"))

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
    const input: TSSContractInput<AMMRequestBody.Any> = {
      request: request.body as AMMRequestBody.Any,
      signers: [signerAccount.publicKey()]
    }
    const xdr = await contract(input)
    const transaction = new Transaction(xdr, Networks.TESTNET)

    const signature = transaction.getKeypairSignature(signerAccount)
    const signer = signerAccount.publicKey()

    const result = { xdr, signer, signature }
    response.body = result
  })

  router.get("/status/live", (ctx) => {
    ctx.status = 200
  })

  return router
}

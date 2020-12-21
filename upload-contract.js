const axios = require("axios")
const config = require("./webpack.config")
const fs = require("fs")
const FormData = require("form-data")
const path = require("path")
const { Asset, Operation, TransactionBuilder, Server, Keypair, Networks } = require("stellar-sdk")
const webpack = require("webpack")

function btoa(input) {
  return Buffer.from(input).toString("base64")
}

async function run() {
  const args = process.argv.slice(2)
  const entry = args[0]
  const fieldsSource = args[1]
  const turrets = args[2]
  const testnet = args[3] === "true"
  const uploadPaymentSigningKey = args[4]
  const horizonURL = testnet
    ? "https://stellar-horizon-testnet.satoshipay.io/"
    : "https://stellar-horizon.satoshipay.io/"
  if (!entry) {
    throw Error("No contract specified!")
  } else if (!fieldsSource) {
    throw Error("No fields source specified!")
  } else if (!turrets) {
    throw Error("No turrets specified!")
  } else if (!uploadPaymentSigningKey) {
    throw Error("No signing key for the upload payment specified!")
  }

  const fileName = path.basename(entry, "ts") + "js" || "main.js"

  const webpackInstance = webpack({
    ...config,
    output: { ...config.output, filename: fileName },
    entry: path.resolve(__dirname, entry),
    mode: "production",
  })

  await new Promise((resolve, reject) =>
    // compile contract
    webpackInstance.run((error, result) => {
      if (result.compilation.errors.length) {
        reject(result.compilation.errors)
        console.error(result.compilation.errors)
      } else {
        resolve()
      }
    })
  )

  const contractFilePath = path.resolve(config.output.path, fileName)

  const fields = require(path.resolve(__dirname, fieldsSource))
  const fieldsBase64 = btoa(JSON.stringify(fields))

  const turretList = turrets.split(",").map((t) => t.trim())
  for (const turretURL of turretList) {
    // create payment tx for upload_fee
    try {
      // fetch upload_fee from turret
      const response = await axios.get(turretURL)
      const { turret, uploadFee } = response.data
      console.log("response.data", response.data)

      const server = new Server(horizonURL)
      const keypair = Keypair.fromSecret(uploadPaymentSigningKey)
      const account = await server.loadAccount(keypair.publicKey())
      const baseFee = await server.fetchBaseFee()

      const transaction = new TransactionBuilder(account, {
        fee: baseFee * 3,
        networkPassphrase: testnet ? Networks.TESTNET : Networks.PUBLIC,
      })
        .addOperation(
          Operation.payment({
            destination: turret,
            asset: Asset.native(),
            amount: uploadFee,
          })
        )
        .setTimeout(30000)
        .build()

      transaction.sign(keypair)

      const uploadFeePaymentXDR = transaction.toXDR("base64")

      const formData = new FormData()
      formData.append("contract", fs.createReadStream(contractFilePath))
      formData.append("fields", fieldsBase64)
      formData.append("payment", uploadFeePaymentXDR)

      const postURL = turretURL.replace(/\/$/, "") + "/contract"
      console.log("posting to turret", postURL)
      const postResponse = await axios.post(postURL, formData, {
        headers: formData.getHeaders(),
      })

      console.log("postResponse", postResponse)
    } catch (error) {
      console.error(error)
    }
  }
}

run()

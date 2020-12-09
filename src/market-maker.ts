import HttpError from "http-errors"

import * as actions from "./actions/index"
import { AMMRequestBody, TSSContract } from "./types"

const contract: TSSContract<AMMRequestBody.Any> = async function contract(
  { request, signers }
) {
  const handler = actions[request.action]

  if (handler) {
    const transaction = await handler(request, signers)
    return transaction.toEnvelope().toXDR("base64")
  } else {
    throw HttpError(400, `Unknown action: ${request.action}`)
  }
}

export default contract

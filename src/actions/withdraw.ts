import { Transaction } from "stellar-sdk"
import { config, horizon } from "../config"
import { AMMRequestBody } from "../types"

async function withdrawLiquidity(request: AMMRequestBody.Withdraw, signers: string[]): Promise<Transaction> {
  // FIXME: Restrict client account ID to non-AMM & non-turret accounts
  // TODO
  throw Error("Not yet implemented")
}

export default withdrawLiquidity

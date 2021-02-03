import { Transaction } from "stellar-sdk"
import { AMMRequestBody } from "../types"

async function performTrade(request: AMMRequestBody.Deposit, signers: string[]): Promise<Transaction> {
  // FIXME: Restrict client account ID to non-AMM & non-turret accounts
  // TODO
  throw Error("Not yet implemented")
}

export default performTrade

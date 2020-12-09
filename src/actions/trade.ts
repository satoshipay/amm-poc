import { Transaction } from "stellar-sdk"
import { AMMRequestBody } from "../types"

async function performTrade(request: AMMRequestBody.Trade, signers: string[]): Promise<Transaction> {
  // TODO: Calculate rate for this trade
  // TODO: Create tx:
  //   • Tx source: Contract account
  //   • Payment: user -> contract, <max tx fee> XLM
  //   • Payment: user -> contract, <in.amount> <in.asset>
  //   • Payment: contract -> user, <out.amount> <out.asset>
}

export default performTrade

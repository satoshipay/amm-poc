import { fail } from "assert"
import BigNumber from "big.js"
import {
  AccountResponse,
  Operation,
  Transaction,
  TransactionBuilder
} from "stellar-sdk"
import { fetchLiquidityAccount } from "../caches"
import { config, horizon } from "../config"
import { AMMRequestBody } from "../types"
import { assertMinAccountBalance, getMarketBalancePair, pickBalance } from "../util/account"
import { parseAssetIdentifier } from "../util/assets"

async function swap(request: AMMRequestBody.Swap, signers: string[]): Promise<Transaction> {
  // FIXME: Restrict client account ID to non-AMM & non-turret accounts

  const [contractAccount, clientAccount] = await Promise.all([
    fetchLiquidityAccount(),
    horizon.loadAccount(request.client)
  ])

  const trade = prepareTrade(contractAccount, request)

  const builder = new TransactionBuilder(contractAccount, {
    fee: String(config.transactionFeeStroops),
    networkPassphrase: config.network
  })

  // Payment: user -> contract, <in.amount> <in.asset>
  builder.addOperation(Operation.payment({
    amount: String(trade.in.amount),
    asset: trade.in.asset,
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  // Payment: contract -> user, <out.amount> <out.asset>
  builder.addOperation(Operation.payment({
    amount: String(trade.out.amount),
    asset: trade.out.asset,
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  return builder.setTimeout(config.transactionTimeout).build()
}

export default swap

function prepareTrade(account: AccountResponse, request: AMMRequestBody.Swap) {
  const balancePair = getMarketBalancePair(account)

  const trade = {
    in: config.assetPair[0].equals(parseAssetIdentifier(request.in.asset)) ? {
      amount: "amount" in request.in && request.in.amount ? BigNumber(request.in.amount) : undefined,
      asset: config.assetPair[0],
      balance: BigNumber(balancePair[0])
    } : config.assetPair[1].equals(parseAssetIdentifier(request.in.asset)) ? {
      amount: "amount" in request.in && request.in.amount ? BigNumber(request.in.amount) : undefined,
      asset: config.assetPair[1],
      balance: BigNumber(balancePair[1])
    } : fail(`Unknown asset: ${request.in.asset}`),
    out: config.assetPair[0].equals(parseAssetIdentifier(request.out.asset)) ? {
      amount: "amount" in request.out && request.out.amount ? BigNumber(request.out.amount) : undefined,
      asset: config.assetPair[0],
      balance: BigNumber(balancePair[0])
    } : config.assetPair[1].equals(parseAssetIdentifier(request.out.asset)) ? {
      amount: "amount" in request.out && request.out.amount ? BigNumber(request.out.amount) : undefined,
      asset: config.assetPair[1],
      balance: BigNumber(balancePair[1])
    } : fail(`Unknown asset: ${request.out.asset}`)
  }

  if (!trade.in.amount && !trade.out.amount) {
    throw Error(`Neither amount to spent nor amount to receive specified`)
  } else if (trade.in.amount && trade.out.amount) {
    throw Error(`Both amount to spent and amount to receive specified`)
  }

  const rate = trade.in.balance.div(trade.out.balance)

  trade.in.amount = trade.in.amount || new BigNumber(trade.out.amount.mul(rate).mul(1 - config.fees.swap.percentage / 100))
  trade.out.amount = trade.out.amount || new BigNumber(trade.in.amount.div(rate).mul(1 - config.fees.swap.percentage / 100))

  return trade
}

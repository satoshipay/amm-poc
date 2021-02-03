import { fail } from "assert"
import BigNumber from "big.js"
import {
  AccountResponse,
  Asset,
  Horizon,
  Networks,
  Operation,
  Server,
  Transaction,
  TransactionBuilder
} from "stellar-sdk"
import { AMMRequestBody } from "../types"
import { parseAssetIdentifier } from "../util/assets"

const config = {
  assetPair: [
    parseAssetIdentifier(process.env.ASSET_ONE || fail("ASSET_ONE not set. Expected <pubkey>:<code>")),
    parseAssetIdentifier(process.env.ASSET_TWO || fail("ASSET_TWO not set. Expected <pubkey>:<code>")),
  ] as const,
  horizonUrl: process.env.HORIZON_URL || fail("HORIZON_URL not set"),
  liquidityAccountId: process.env.ACCOUNT_ID || fail("ACCOUNT_ID not set"),
  network: Networks.TESTNET,
  tradingFee: new BigNumber(process.env.TRADING_FEE || "1.0"),
  tradingFeeAsset: process.env.TRADING_FEE_ASSET ? parseAssetIdentifier(process.env.TRADING_FEE_ASSET) : Asset.native(),
  transactionFeeStroops: Number.parseInt(process.env.TX_FEE_STROOPS || fail("TX_FEE_STROOPS not set"), 10),
  transactionTimeout: 15
}

const horizon = new Server(config.horizonUrl)
const fetchLiquidityAccount = createCachedAccountFetcher(config.liquidityAccountId)

async function performTrade(request: AMMRequestBody.Swap, signers: string[]): Promise<Transaction> {
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

  // Payment: user -> contract, <max tx fee> XLM
  builder.addOperation(Operation.payment({
    amount: String(config.tradingFee),
    asset: config.tradingFeeAsset,
    destination: config.liquidityAccountId,
    source: clientAccount.id
  }))

  // Payment: user -> contract, <in.amount> <in.asset>
  builder.addOperation(Operation.payment({
    amount: String(trade.in.amount),
    asset: trade.in.asset,
    destination: config.liquidityAccountId,
    source: clientAccount.id
  }))

  // Payment: contract -> user, <out.amount> <out.asset>
  builder.addOperation(Operation.payment({
    amount: String(trade.out.amount),
    asset: trade.out.asset,
    destination: clientAccount.id,
    source: config.liquidityAccountId
  }))

  return builder.setTimeout(config.transactionTimeout).build()
}

export default performTrade

function createCachedAccountFetcher(accountId: string) {
  let cachedData: AccountResponse | undefined
  let lastFetchTime = 0

  return async function fetchAccount(): Promise<AccountResponse> {
    if (Date.now() - lastFetchTime > 100 || !cachedData) {
      cachedData = await horizon.loadAccount(accountId)
      lastFetchTime = Date.now()
    }
    return cachedData
  }
}

function matchBalance(balance: Horizon.BalanceLine, asset: Asset): boolean {
  if (balance.asset_type === "native") {
    return asset.isNative()
  } else {
    return (
      balance.asset_code === config.assetPair[0].code &&
      balance.asset_issuer === config.assetPair[0].issuer
    )
  }
}

function prepareTrade(account: AccountResponse, request: AMMRequestBody.Swap) {
  const balancePair = [
    account.balances.find(balance => matchBalance(balance, (config.assetPair[0])) || fail(`Market maker's account does not hold ${config.assetPair[0].getCode()}`)).balance,
    account.balances.find(balance => matchBalance(balance, (config.assetPair[1])) || fail(`Market maker's account does not hold ${config.assetPair[1].getCode()}`)).balance
  ] as const

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

  trade.in.amount = trade.in.amount || new BigNumber(trade.out.amount.mul(rate))
  trade.out.amount = trade.out.amount || new BigNumber(trade.in.amount.div(rate))

  return trade
}

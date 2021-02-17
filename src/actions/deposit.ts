import BigNumber from "big.js"
import { AccountResponse, Asset, Operation, Transaction, TransactionBuilder } from "stellar-sdk"
import { fetchLiquidityAccount } from "../caches"
import { config, horizon } from "../config"
import { AMMRequestBody } from "../types"
import { getMarketBalancePair, getPoolTokenTotal, poolSupplyDataEntryKey } from "../util/account"
import { parseAssetIdentifier } from "../util/assets"

async function depositLiquidity(request: AMMRequestBody.Deposit, signers: string[]): Promise<Transaction> {
  // FIXME: Restrict client account ID to non-AMM & non-turret accounts

  const [contractAccount, clientAccount] = await Promise.all([
    fetchLiquidityAccount(),
    horizon.loadAccount(request.client)
  ])

  const deposit = prepareDeposit(contractAccount, request)

  const builder = new TransactionBuilder(contractAccount, {
    fee: String(config.transactionFeeStroops),
    networkPassphrase: config.network
  })

  builder.addOperation(Operation.payment({
    amount: String(deposit.depositAmounts[0]),
    asset: config.assetPair[0],
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: String(deposit.depositAmounts[1]),
    asset: config.assetPair[1],
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: String(deposit.liquidityTokens),
    asset: config.liquidityProviderAsset,
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  builder.addOperation(Operation.manageData({
    name: poolSupplyDataEntryKey,
    value: String(getPoolTokenTotal(contractAccount).add(deposit.liquidityTokens))
  }))

  // Payment: user -> contract, tx fees
  builder.addOperation(Operation.payment({
    amount: String(BigNumber(5 * config.transactionFeeStroops * 1e-7).round(7)),
    asset: Asset.native(),
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  return builder.setTimeout(config.transactionValidity).build()
}

export default depositLiquidity

function prepareDeposit(account: AccountResponse, request: AMMRequestBody.Deposit) {
  const balancePair = getMarketBalancePair(account)
  const supply = getPoolTokenTotal(account)

  const depositIntent = {
    amount: BigNumber(request.amount),
    asset: parseAssetIdentifier(request.asset)
  }

  if (!depositIntent.asset.equals(config.assetPair[0]) && !depositIntent.asset.equals(config.assetPair[1])) {
    throw Error(`Invalid deposit asset: ${depositIntent.asset.getCode()}`)
  }

  const depositAmounts = [
    depositIntent.asset.equals(config.assetPair[0])
      ? depositIntent.amount
      : depositIntent.amount.mul(balancePair[0]).div(balancePair[1]).round(7),
    depositIntent.asset.equals(config.assetPair[0])
      ? depositIntent.amount.mul(balancePair[1]).div(balancePair[0]).round(7)
      : depositIntent.amount
  ] as const

  const liquidityTokens = depositAmounts[0].mul(supply).div(balancePair[0])

  const deposit = {
    depositAmounts,
    liquidityTokens: liquidityTokens.round(2, 0 /* round down */)
  } as const

  return deposit
}

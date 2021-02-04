import BigNumber from "big.js"
import { AccountResponse, Asset, Operation, Transaction, TransactionBuilder } from "stellar-sdk"
import { withdraw } from "."
import { fetchLiquidityAccount } from "../caches"
import { config, horizon } from "../config"
import { AMMRequestBody } from "../types"
import { getMarketBalancePair, getPoolTokenTotal, pickBalance, poolSupplyDataEntryKey } from "../util/account"
import { parseAssetIdentifier } from "../util/assets"

async function withdrawLiquidity(request: AMMRequestBody.Withdraw, signers: string[]): Promise<Transaction> {
  // FIXME: Restrict client account ID to non-AMM & non-turret accounts

  const [contractAccount, clientAccount] = await Promise.all([
    fetchLiquidityAccount(),
    horizon.loadAccount(request.client)
  ])

  const withdrawal = prepareWithdrawal(contractAccount, request)

  const builder = new TransactionBuilder(contractAccount, {
    fee: String(config.transactionFeeStroops),
    networkPassphrase: config.network
  })

  builder.addOperation(Operation.payment({
    amount: String(withdrawal.liquidityTokens),
    asset: config.liquidityProviderAsset,
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: String(withdrawal.poolTokens[0]),
    asset: config.assetPair[0],
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: String(withdrawal.poolTokens[1]),
    asset: config.assetPair[1],
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  builder.addOperation(Operation.manageData({
    name: poolSupplyDataEntryKey,
    value: getPoolTokenTotal(contractAccount).sub(withdrawal.liquidityTokens).toString()
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

export default withdrawLiquidity

function prepareWithdrawal(account: AccountResponse, request: AMMRequestBody.Withdraw) {
  const balancePair = getMarketBalancePair(account)
  const supply = getPoolTokenTotal(account)

  const withdrawal = {
    liquidityTokens: BigNumber(request.amount).round(7),
    poolTokens: [
      balancePair[0].mul(BigNumber(request.amount).div(supply)).round(7),
      balancePair[1].mul(BigNumber(request.amount).div(supply)).round(7)
    ]
  } as const

  return withdrawal
}

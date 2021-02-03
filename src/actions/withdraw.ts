import BigNumber from "big.js"
import { AccountResponse, Operation, Transaction, TransactionBuilder } from "stellar-sdk"
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
    amount: withdrawal.liquidityTokens,
    asset: config.liquidityProviderAsset,
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: withdrawal.poolTokens[0].toString(),
    asset: config.assetPair[0],
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: withdrawal.poolTokens[1].toString(),
    asset: config.assetPair[1],
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  builder.addOperation(Operation.manageData({
    name: poolSupplyDataEntryKey,
    value: getPoolTokenTotal(contractAccount).sub(withdrawal.liquidityTokens).toString()
  }))

  return builder.setTimeout(config.transactionTimeout).build()
}

export default withdrawLiquidity

function prepareWithdrawal(account: AccountResponse, request: AMMRequestBody.Withdraw) {
  const balancePair = getMarketBalancePair(account)
  const supply = getPoolTokenTotal(account)

  const withdrawal = {
    liquidityTokens: request.amount,
    poolTokens: [
      balancePair[0].mul(BigNumber(request.amount).div(supply)),
      balancePair[1].mul(BigNumber(request.amount).div(supply))
    ]
  } as const

  return withdrawal
}

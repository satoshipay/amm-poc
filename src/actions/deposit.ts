import BigNumber from "big.js"
import { AccountResponse, Operation, Transaction, TransactionBuilder } from "stellar-sdk"
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
    amount: deposit.depositAmounts[0].toString(),
    asset: config.assetPair[0],
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: deposit.depositAmounts[1].toString(),
    asset: config.assetPair[1],
    destination: contractAccount.id,
    source: clientAccount.id
  }))

  builder.addOperation(Operation.payment({
    amount: deposit.liquidityTokens.toString(),
    asset: config.liquidityProviderAsset,
    destination: clientAccount.id,
    source: contractAccount.id
  }))

  builder.addOperation(Operation.manageData({
    name: poolSupplyDataEntryKey,
    value: getPoolTokenTotal(contractAccount).add(deposit.liquidityTokens).toString()
  }))

  return builder.setTimeout(config.transactionTimeout).build()
}

export default depositLiquidity

function prepareDeposit(account: AccountResponse, request: AMMRequestBody.Deposit) {
  const balancePair = getMarketBalancePair(account)
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
      : depositIntent.amount.mul(balancePair[0]).div(balancePair[1]),
    depositIntent.asset.equals(config.assetPair[0])
      ? depositIntent.amount.mul(balancePair[1]).div(balancePair[0])
      : depositIntent.amount
  ] as const

  const postDepositPoolBalances = [
    balancePair[0].add(depositAmounts[0]),
    balancePair[1].add(depositAmounts[1])
  ] as const

  const deposit = {
    depositAmounts,
    liquidityTokens: postDepositPoolBalances[0].mul(postDepositPoolBalances[1]).div(depositAmounts[0].mul(depositAmounts[1]))
  } as const

  return deposit
}

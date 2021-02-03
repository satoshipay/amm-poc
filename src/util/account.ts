import { fail } from "assert"
import BigNumber from "big.js"
import { AccountResponse, Asset, Horizon } from "stellar-sdk"
import { config } from "../config"

export function assertMinAccountBalance(account: AccountResponse, asset: Asset, minBalance: BigNumber) {
  const balance = pickBalance(account, asset)

  if (!balance) {
    throw Error(`Account ${account.id} does not have a ${asset.getCode()} balance`)
  } else if (BigNumber(balance.balance).lt(minBalance)) {
    throw Error(`Account ${account.id} does not own enough ${asset.getCode()}. Needs minimum ${minBalance}, has ${BigNumber(balance.balance)}`)
  }
}

export function getMarketBalancePair(account: AccountResponse): [BigNumber, BigNumber] {
  const balancePair = [
    (pickBalance(account, config.assetPair[0]) || fail(`Market maker's account does not hold ${config.assetPair[0].getCode()}`)).balance,
    (pickBalance(account, config.assetPair[1]) || fail(`Market maker's account does not hold ${config.assetPair[1].getCode()}`)).balance
  ] as const

  return [BigNumber(balancePair[0]), BigNumber(balancePair[1])]
}

function matchBalance(balance: Horizon.BalanceLine, asset: Asset): boolean {
  if (balance.asset_type === "native") {
    return asset.isNative()
  } else {
    return (
      balance.asset_code === asset.code &&
      balance.asset_issuer === asset.issuer
    )
  }
}

export function pickBalance(account: AccountResponse, asset: Asset): Horizon.BalanceLine | null {
  return account.balances.find(balance => matchBalance(balance, asset))
}

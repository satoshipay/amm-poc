import BigNumber from "big.js"
import { AccountResponse, Horizon } from "stellar-sdk"
import config from "../config"
import { findMatchingBalanceLine } from "./stellar"

export type BalancePair = [BigNumber, BigNumber]

export function getMarketBalancePair(balances: Horizon.BalanceLine[]): [BigNumber, BigNumber] {
  const balance1 = findMatchingBalanceLine(balances, config.assetOne)
  const balance2 = findMatchingBalanceLine(balances, config.assetTwo)

  if (balance1 && balance2) {
    return [BigNumber(balance1.balance), BigNumber(balance2.balance)]
  } else {
    return [BigNumber(0), BigNumber(0)]
  }
}

export const poolSupplyDataEntryKey = "pool.supply"

export function getPoolTokenTotal(account: AccountResponse): BigNumber {
  return account.data_attr[poolSupplyDataEntryKey]
    ? BigNumber(Buffer.from(account.data_attr[poolSupplyDataEntryKey], "base64").toString("utf8"))
    : BigNumber(0)
}

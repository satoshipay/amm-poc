import { AccountResponse } from "stellar-sdk"
import { config, horizon } from "./config"

export const fetchLiquidityAccount = createCachedAccountFetcher(config.liquidityAccountId)

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

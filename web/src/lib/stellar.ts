import { Asset, Horizon, Server, ServerApi } from "stellar-sdk"

export function balancelineToAsset(balanceline: Horizon.BalanceLine): Asset {
  return balanceline.asset_type === "native"
    ? Asset.native()
    : new Asset(balanceline.asset_code, balanceline.asset_issuer)
}

/** Reversal of stringifyAsset() */
export function parseAssetID(assetID: string) {
  if (assetID === "XLM") {
    return Asset.native()
  } else {
    const [issuer, code] = assetID.split(":")
    return new Asset(code, issuer)
  }
}

export function stringifyAsset(assetOrTrustline: Asset | Horizon.BalanceLine) {
  if (assetOrTrustline instanceof Asset) {
    const asset: Asset = assetOrTrustline
    return asset.isNative() ? "XLM" : `${asset.getIssuer()}:${asset.getCode()}`
  } else {
    const line: Horizon.BalanceLine = assetOrTrustline
    return line.asset_type === "native" ? "XLM" : `${line.asset_issuer}:${line.asset_code}`
  }
}

export function getAssetsFromBalances(balances: Horizon.BalanceLine[]) {
  return balances.map((balance) =>
    balance.asset_type === "native"
      ? Asset.native()
      : new Asset((balance as Horizon.BalanceLineAsset).asset_code, (balance as Horizon.BalanceLineAsset).asset_issuer)
  )
}

export function findMatchingBalanceLine(balances: Horizon.BalanceLine[], asset: Asset) {
  const matchingBalanceLine = balances.find((balance) => {
    if (balance.asset_type === "native") {
      return asset.isNative()
    } else {
      return balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer()
    }
  })
  return matchingBalanceLine
}

export function getHorizonURL(horizon: Server) {
  return horizon.serverURL.toString()
}

export function offerAssetToAsset(offerAsset: ServerApi.OfferAsset) {
  return offerAsset.asset_type === "native"
    ? Asset.native()
    : new Asset(offerAsset.asset_code as string, offerAsset.asset_issuer as string)
}

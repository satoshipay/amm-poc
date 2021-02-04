import { Asset } from "stellar-sdk"

export function parseAssetIdentifier(identifier: string): Asset {
  const [issuer, code] = identifier.split(":")
  return new Asset(code, issuer)
}

export function stringifyAsset(asset: Asset): string {
  return `${asset.code}:${asset.issuer}`
}

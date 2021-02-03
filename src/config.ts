import { fail } from "assert"
import BigNumber from "big.js"
import { Asset, Networks, Server } from "stellar-sdk"
import { parseAssetIdentifier } from "./util/assets"

export const config = {
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

export const horizon = new Server(config.horizonUrl)

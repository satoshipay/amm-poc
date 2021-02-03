import { fail } from "assert"
import { Networks, Server } from "stellar-sdk"
import { parseAssetIdentifier } from "./util/assets"

export const config = {
  assetPair: [
    parseAssetIdentifier(process.env.ASSET_ONE || fail("ASSET_ONE not set. Expected <pubkey>:<code>")),
    parseAssetIdentifier(process.env.ASSET_TWO || fail("ASSET_TWO not set. Expected <pubkey>:<code>")),
  ] as const,
  fees: {
    swap: {
      percentage: process.env.SWAP_FEE_PERCENT ? Number.parseFloat(process.env.SWAP_FEE_PERCENT) : fail("process.env.SWAP_FEE_PERCENT not set")
    }
  },
  horizonUrl: process.env.HORIZON_URL || fail("HORIZON_URL not set"),
  liquidityAccountId: process.env.ACCOUNT_ID || fail("ACCOUNT_ID not set"),
  liquidityProviderAsset: parseAssetIdentifier(process.env.LP_ASSET || fail("LP_ASSET not set. Expected <pubkey>:<code>")),
  network: Networks.TESTNET,
  transactionFeeStroops: Number.parseInt(process.env.TX_FEE_STROOPS || fail("TX_FEE_STROOPS not set"), 10),
  transactionTimeout: 15
}

export const horizon = new Server(config.horizonUrl)

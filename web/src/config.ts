import { fail } from "assert"
import { parseAssetID } from "./lib/stellar"

const config = {
  marketMakerAccountIdMainnet: process.env.REACT_APP_MARKET_MAKER_ACCOUNT_ID_MAINNET,
  marketMakerAccountIdTestnet:
    process.env.REACT_APP_MARKET_MAKER_ACCOUNT_ID_TESTNET || "GCDXHFRLT3NRSCYGONQ3UUT7IZOG4LW2M4SKFOYKVIZHEWH76BEBJSXB",
  tssURL: process.env.REACT_APP_TSS_URL || "http://localhost:3001",
  assetOne: parseAssetID(process.env.REACT_APP_ASSET_ONE || fail("REACT_APP_ASSET_ONE not set")),
  assetTwo: parseAssetID(process.env.REACT_APP_ASSET_TWO || fail("REACT_APP_ASSET_TWO not set")),
  liquidityProviderAsset: parseAssetID(process.env.REACT_APP_ASSET_LP || fail("REACT_APP_ASSET_LP not set")),
  swapFeePercent: process.env.REACT_APP_SWAP_FEE_PERCENT
    ? Number.parseFloat(process.env.REACT_APP_SWAP_FEE_PERCENT)
    : fail("process.env.REACT_APP_SWAP_FEE_PERCENT not set"),
}

export default config

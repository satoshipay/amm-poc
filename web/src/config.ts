const config = {
  marketMakerAccountIdMainnet: process.env.REACT_APP_MARKET_MAKER_ACCOUNT_ID_MAINNET,
  marketMakerAccountIdTestnet:
    process.env.REACT_APP_MARKET_MAKER_ACCOUNT_ID_TESTNET || "GCDXHFRLT3NRSCYGONQ3UUT7IZOG4LW2M4SKFOYKVIZHEWH76BEBJSXB",
  tssURL: process.env.REACT_APP_TSS_URL || "http://localhost:3001",
}

export default config

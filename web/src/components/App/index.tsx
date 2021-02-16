import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Typography from "@material-ui/core/Typography"
import BigNumber from "big.js"
import React, { useState } from "react"
import { AccountResponse, Keypair, Server } from "stellar-sdk"
import config from "../../config"
import { findMatchingBalanceLine } from "../../lib/stellar"
import { getPoolTokenTotal } from "../../lib/utils"
import Balances from "../Balances"
import Header from "../Header"
import LiquidityArea from "../Liquidity"
import SecretKeyInput from "../SecretKeyInput"

function App() {
  const [accountKey, setSelectedAccountKey] = useState<string | null>(null)
  const [ammAccountResponse, setAmmAccountResponse] = React.useState<AccountResponse | null>(null)
  const [userAccountResponse, setAccountResponse] = React.useState<AccountResponse | null>(null)

  const [error, setError] = React.useState<string | null>(null)

  const horizonURL = "https://stellar-horizon-testnet.satoshipay.io"
  const horizon = React.useMemo(() => new Server(horizonURL), [horizonURL])
  const keypair = React.useMemo(() => (accountKey ? Keypair.fromSecret(accountKey) : null), [accountKey])

  React.useEffect(() => {
    const fetchAccount = () => {
      const ammAccount = config.marketMakerAccountIdTestnet

      if (!ammAccount) {
        throw Error("No market maker account ID provided.")
      }

      horizon
        .loadAccount(ammAccount)
        .then(setAmmAccountResponse)
        .catch((e) => {
          console.error(e)
          setAccountResponse(null)
        })
    }

    fetchAccount()

    const interval = setInterval(fetchAccount, 5000)
    return () => clearInterval(interval)
  }, [horizon])

  React.useEffect(() => {
    const fetchAccount = () => {
      if (keypair) {
        horizon
          .loadAccount(keypair.publicKey())
          .then(setAccountResponse)
          .catch((e) => {
            // tslint:disable-next-line: no-console
            console.error(e)
            setAccountResponse(null)
          })
      }
    }

    fetchAccount()

    const interval = setInterval(fetchAccount, 5000)
    return () => clearInterval(interval)
  }, [keypair, horizon])

  const poolTokenTotal = React.useMemo(() => {
    if (ammAccountResponse) {
      return getPoolTokenTotal(ammAccountResponse)
    } else {
      return BigNumber(0)
    }
  }, [ammAccountResponse])

  const showLiquidity = React.useMemo(() => {
    const userBalances = userAccountResponse?.balances
    if (!userBalances) {
      return false
    } else if (!findMatchingBalanceLine(userBalances, config.assetOne)) {
      setError(`User account has no trustline for asset ${config.assetOne}`)
      return false
    } else if (!findMatchingBalanceLine(userBalances, config.assetTwo)) {
      setError(`User account has no trustline for asset ${config.assetTwo}`)
      return false
    } else if (!findMatchingBalanceLine(userBalances, config.liquidityProviderAsset)) {
      setError(`User account has no trustline for asset ${config.liquidityProviderAsset}`)
      return false
    } else {
      return true
    }
  }, [userAccountResponse])

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Header />
        <SecretKeyInput onAccountSelect={setSelectedAccountKey} />
        {ammAccountResponse && userAccountResponse && keypair && (
          <>
            <Balances ammBalances={ammAccountResponse.balances} userBalances={userAccountResponse.balances} />
            {showLiquidity ? (
              <LiquidityArea
                accountKeypair={keypair}
                ammBalances={ammAccountResponse.balances}
                poolTokenTotal={poolTokenTotal}
                horizon={horizon}
                testnet
              />
            ) : (
              <Typography color="error">{error}</Typography>
            )}
          </>
        )}
      </Container>
    </>
  )
}

export default App

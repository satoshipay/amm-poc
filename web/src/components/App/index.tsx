import React, { useState } from "react"
import { AccountResponse, Keypair, Server } from "stellar-sdk"
import Balances from "../Balances"
import Header from "../Header"
import LiquidityArea from "../Liquidity"
import SecretKeyInput from "../SecretKeyInput"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import config from "../../config"

function App() {
  const [accountKey, setSelectedAccountKey] = useState<string | null>(null)
  const [ammAccountResponse, setAmmAccountResponse] = React.useState<AccountResponse | null>(null)
  const [userAccountResponse, setAccountResponse] = React.useState<AccountResponse | null>(null)
  const [testnet, setTestnet] = useState<boolean>(true)

  const horizonURL = React.useMemo(
    () => (testnet ? "https://stellar-horizon-testnet.satoshipay.io" : "https://stellar-horizon.satoshipay.io"),
    [testnet]
  )
  const horizon = React.useMemo(() => new Server(horizonURL), [horizonURL])
  const keypair = React.useMemo(() => (accountKey ? Keypair.fromSecret(accountKey) : null), [accountKey])

  React.useEffect(() => {
    const fetchAccount = () => {
      const ammAccount = testnet ? config.marketMakerAccountIdTestnet : config.marketMakerAccountIdMainnet

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
  }, [horizon, testnet])

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

  return (
    <>
      <CssBaseline />
      <Container>
        <Header testnet={testnet} toggleTestnet={() => setTestnet(!testnet)} />
        <SecretKeyInput onAccountSelect={setSelectedAccountKey} />
        {ammAccountResponse && userAccountResponse && keypair && (
          <>
            <Balances ammBalances={ammAccountResponse.balances} userBalances={userAccountResponse.balances} />
            <LiquidityArea
              accountKeypair={keypair}
              ammBalances={ammAccountResponse.balances}
              userBalances={userAccountResponse.balances}
              horizon={horizon}
              testnet={testnet}
            />
          </>
        )}
      </Container>
    </>
  )
}

export default App

import { Typography } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import BigNumber from "big.js"
import React from "react"
import { Networks, Transaction } from "stellar-sdk"
import config from "../../../config"
import { BalancePair } from "../../../lib/utils"
import { runContract } from "../../../services/tss"
import AssetSelector from "../../AssetSelector"
import AssetTextField from "../../AssetTextField"

function calculateWithdraw(amount: string, balancePair: BalancePair, supply: BigNumber) {
  const withdrawal = {
    liquidityTokens: BigNumber(amount).round(7),
    poolTokens: [
      balancePair[0].mul(BigNumber(amount).div(supply)).round(7),
      balancePair[1].mul(BigNumber(amount).div(supply)).round(7),
    ] as BalancePair,
  }

  return withdrawal
}

interface Props {
  accountID: string
  balancePair: BalancePair
  poolTokenTotal: BigNumber
  submitTransaction: (transaction: Transaction) => void
  testnet: boolean
}

function WithdrawLiquidityView(props: Props) {
  const { accountID, balancePair, poolTokenTotal, submitTransaction, testnet } = props
  const [amount, setAmount] = React.useState("")
  const [expectedTokens, setExpectedTokens] = React.useState<BalancePair | null>(null)

  const networkPassphrase = testnet ? Networks.TESTNET : Networks.PUBLIC

  const selectableAssets = [config.liquidityProviderAsset]

  React.useEffect(() => {
    if (amount) {
      try {
        const result = calculateWithdraw(amount, balancePair, poolTokenTotal)
        setExpectedTokens(result.poolTokens)
      } catch (error) {
        console.error(error)
      }
    } else {
      setExpectedTokens(null)
    }
  }, [amount, balancePair, poolTokenTotal])

  const onWithdrawClick = React.useCallback(() => {
    runContract("to-the-moon", {
      action: "withdraw",
      amount: String(amount),
      client: accountID,
    })
      .then((response) => {
        const { signature, signer, xdr } = response
        const tx = new Transaction(xdr, networkPassphrase)
        tx.addSignature(signer, signature)
        submitTransaction(tx)
      })
      .catch(console.error)
  }, [accountID, amount, networkPassphrase, submitTransaction])

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={selectableAssets}
            disabled
            disableUnderline
            testnet={testnet}
            value={config.liquidityProviderAsset}
          />
        }
        fullWidth
        label="Pool Tokens"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {expectedTokens && (
        <Box textAlign="center" style={{ marginTop: 16 }}>
          <Typography variant="h6">Estimated returns</Typography>
          <Typography>
            {String(expectedTokens[0])} {config.assetOne.code}
          </Typography>
          <Typography>
            {String(expectedTokens[1])} {config.assetTwo.code}
          </Typography>
        </Box>
      )}
      <Button color="primary" disabled={!amount} onClick={onWithdrawClick} variant="outlined" style={{ marginTop: 16 }}>
        Withdraw
      </Button>
    </Box>
  )
}

export default WithdrawLiquidityView

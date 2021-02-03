import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import { stringifyAsset } from "../../../lib/stellar"
import { runContract } from "../../../services/tss"
import AssetSelector from "../../AssetSelector"
import AssetTextField from "../../AssetTextField"

interface Props {
  accountID: string
  balances: Horizon.BalanceLine[]
  testnet: boolean
}

function ProvideLiquidityView(props: Props) {
  const { accountID, balances, testnet } = props

  const [amount, setAmount] = React.useState("")
  const [asset, setAsset] = React.useState<Asset>(Asset.native())

  const onProvideClick = React.useCallback(() => {
    runContract("to-the-moon", {
      action: "deposit",
      amount: String(amount),
      asset: stringifyAsset(asset),
      client: accountID,
    })
      .then(console.log)
      .catch(console.error)
  }, [accountID, amount, asset])

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={balances}
            disableUnderline
            showXLM
            testnet={testnet}
            onChange={(asset) => setAsset(asset)}
            value={asset}
          />
        }
        fullWidth
        label="Deposit"
        placeholder="Amount of tokens you want to deposit"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button color="primary" disabled={!amount} variant="outlined" style={{ marginTop: 16 }} onClick={onProvideClick}>
        Provide
      </Button>
    </Box>
  )
}

export default ProvideLiquidityView

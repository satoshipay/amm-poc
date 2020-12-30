import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import AssetInputField from "../../AssetTextField"
import AssetSelector from "../../AssetSelector"
import Box from "@material-ui/core/Box"

interface Props {
  balances: Horizon.BalanceLine[]
  testnet: boolean
}

function WithdrawLiquidityView(props: Props) {
  const { balances, testnet } = props
  const [amount, setAmount] = React.useState("")
  const [asset, setAsset] = React.useState<Asset | undefined>()

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetInputField
        assetCode={
          <AssetSelector
            assets={balances}
            disableUnderline
            testnet={testnet}
            onChange={(a) => setAsset(a)}
            value={asset}
          />
        }
        fullWidth
        label="Pool Tokens"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </Box>
  )
}

export default WithdrawLiquidityView

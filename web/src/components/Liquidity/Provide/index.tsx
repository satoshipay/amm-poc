import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import AssetTextField from "../../AssetTextField"
import AssetSelector from "../../AssetSelector"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"

interface Props {
  balances: Horizon.BalanceLine[]
  testnet: boolean
}

function ProvideLiquidityView(props: Props) {
  const { balances, testnet } = props
  const [amount1, setAmount1] = React.useState("")
  const [amount2, setAmount2] = React.useState("")

  const [asset1, setAsset1] = React.useState<Asset>(Asset.native())
  const [asset2, setAsset2] = React.useState<Asset | undefined>(undefined)

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={balances}
            disableUnderline
            showXLM
            testnet={testnet}
            onChange={(asset) => setAsset1(asset)}
            value={asset1}
          />
        }
        fullWidth
        label="Deposit"
        placeholder="Amount of first asset you want to deposit"
        value={amount1}
        onChange={(e) => setAmount1(e.target.value)}
      />
      <Typography variant="h5" style={{ margin: 16 }}>
        +
      </Typography>
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={balances}
            disabledAssets={[asset1]}
            disableUnderline
            onChange={(asset) => setAsset2(asset)}
            showXLM
            testnet={testnet}
            value={asset2}
          />
        }
        fullWidth
        label="Deposit"
        placeholder="Amount of second asset you want to deposit"
        value={amount2}
        onChange={(e) => setAmount2(e.target.value)}
      />
    </Box>
  )
}

export default ProvideLiquidityView

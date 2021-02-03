import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import AssetTextField from "../../AssetTextField"
import AssetSelector from "../../AssetSelector"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import { runContract } from "../../../services/tss"
import { stringifyAsset } from "../../../lib/stellar"

interface Props {
  accountID: string
  balances: Horizon.BalanceLine[]
  testnet: boolean
}

function SwapLiquidityView(props: Props) {
  const { accountID, balances, testnet } = props
  const [amountIn, setAmountIn] = React.useState("")
  const [amountOut, setAmountOut] = React.useState("")

  const [assetIn, setAssetIn] = React.useState<Asset>(Asset.native())
  const [assetOut, setAssetOut] = React.useState<Asset | undefined>(undefined)

  const onProvideClick = React.useCallback(() => {
    if (!assetIn || !assetOut) {
      return
    }

    runContract("to-the-moon", {
      action: "swap",
      client: accountID,
      in: {
        asset: stringifyAsset(assetIn),
        amount: amountIn ? amountIn : undefined,
      },
      out: {
        asset: stringifyAsset(assetOut),
        amount: amountOut ? amountOut : undefined,
      },
    })
      .then(console.log)
      .catch(console.error)
  }, [accountID, amountIn, amountOut, assetIn, assetOut])

  const disabled = !amountIn || !assetIn || !assetOut

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={balances}
            disableUnderline
            showXLM
            testnet={testnet}
            onChange={(asset) => setAssetIn(asset)}
            value={assetIn}
          />
        }
        fullWidth
        label="In"
        placeholder="Amount of asset you want to trade"
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
      />
      <Typography variant="h5" style={{ margin: 16 }}>
        +
      </Typography>
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={balances}
            disabledAssets={[assetIn]}
            disableUnderline
            onChange={(asset) => setAssetOut(asset)}
            showXLM
            testnet={testnet}
            value={assetOut}
          />
        }
        disabled
        fullWidth
        label="Out"
        placeholder="Amount of second asset you want to deposit"
        value={amountOut}
        onChange={(e) => setAmountOut(e.target.value)}
      />
      <Button color="primary" disabled={disabled} variant="outlined" style={{ marginTop: 16 }} onClick={onProvideClick}>
        Provide
      </Button>
    </Box>
  )
}

export default SwapLiquidityView

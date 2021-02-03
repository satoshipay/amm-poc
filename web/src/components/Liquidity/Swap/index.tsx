import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import AssetTextField from "../../AssetTextField"
import AssetSelector from "../../AssetSelector"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import { runContract } from "../../../services/tss"
import { stringifyAsset } from "../../../lib/stellar"
import SwapVertIcon from "@material-ui/icons/SwapVert"

interface Props {
  accountID: string
  balances: Horizon.BalanceLine[]
  testnet: boolean
}

function SwapLiquidityView(props: Props) {
  const { accountID, balances, testnet } = props
  const [amount, setAmount] = React.useState("")

  const [assetIn, setAssetIn] = React.useState<Asset | undefined>(Asset.native())
  const [assetOut, setAssetOut] = React.useState<Asset | undefined>(undefined)

  const [mode, setMode] = React.useState<"in" | "out">("in")

  const swapMode = React.useCallback(() => {
    setMode((prev) => {
      if (prev === "in") {
        return "out"
      } else {
        return "in"
      }
    })
  }, [])

  const onProvideClick = React.useCallback(() => {
    if (!assetIn || !assetOut) {
      return
    }

    runContract("to-the-moon", {
      action: "swap",
      client: accountID,
      in: {
        asset: stringifyAsset(assetIn),
        amount: mode === "in" ? amount : undefined,
      },
      out: {
        asset: stringifyAsset(assetOut),
        amount: mode === "out" ? amount : undefined,
      },
    })
      .then(console.log)
      .catch(console.error)
  }, [accountID, amount, assetIn, assetOut, mode])

  const disabled = !amount || !assetIn || !assetOut

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
            value={mode === "in" ? assetIn : assetOut}
          />
        }
        fullWidth
        label={mode === "in" ? "Amount 'In'" : "Amount 'Out'"}
        placeholder={
          mode === "in" ? "Amount of the asset you want to put in" : "Amount of the asset you want to get out"
        }
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button
        color="secondary"
        startIcon={<SwapVertIcon />}
        onClick={swapMode}
        variant="outlined"
        style={{
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        Switch In/Out
      </Button>
      <Box display="flex" flexDirection="row">
        <Typography variant="h6" style={{ marginRight: 8 }}>
          {mode === "in" ? "Asset you want to get" : "Asset you want to put in"}:
        </Typography>
        <AssetSelector
          assets={balances}
          disabledAssets={assetIn && [assetIn]}
          disableUnderline
          onChange={(asset) => setAssetOut(asset)}
          showXLM
          testnet={testnet}
          value={mode === "in" ? assetOut : assetIn}
        />
      </Box>

      <Button color="primary" disabled={disabled} variant="outlined" style={{ marginTop: 16 }} onClick={onProvideClick}>
        Swap Assets
      </Button>
    </Box>
  )
}

export default SwapLiquidityView

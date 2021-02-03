import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import SwapVertIcon from "@material-ui/icons/SwapVert"
import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import { findMatchingBalanceLine, stringifyAsset } from "../../../lib/stellar"
import { runContract } from "../../../services/tss"
import AssetSelector from "../../AssetSelector"
import AssetTextField from "../../AssetTextField"
import BigNumber from "big.js"

interface Props {
  accountID: string
  ammBalances: Horizon.BalanceLine[]
  userBalances: Horizon.BalanceLine[]
  testnet: boolean
}

function SwapView(props: Props) {
  const { accountID, ammBalances, testnet } = props
  const [amount, setAmount] = React.useState("")

  const [assetIn, setAssetIn] = React.useState<Asset | undefined>(Asset.native())
  const [assetOut, setAssetOut] = React.useState<Asset | undefined>(undefined)

  const [mode, setMode] = React.useState<"in" | "out">("in")

  const returnedAmount = React.useMemo(() => {
    if (assetIn && assetOut) {
      const balanceIn = findMatchingBalanceLine(ammBalances, assetIn)?.balance
      const balanceOut = findMatchingBalanceLine(ammBalances, assetOut)?.balance

      if (balanceIn && balanceOut) {
        const rate = new BigNumber(balanceIn).div(balanceOut)

        return mode === "in" ? new BigNumber(amount).mul(rate).toFixed(2) : new BigNumber(amount).div(rate).toFixed(2)
      }
    }

    return "0"
  }, [ammBalances, amount, assetIn, assetOut, mode])

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
            assets={ammBalances}
            disableUnderline
            showXLM
            testnet={testnet}
            onChange={(asset) => setAssetIn(asset)}
            value={mode === "in" ? assetIn : assetOut}
          />
        }
        fullWidth
        label={mode === "in" ? "From" : "To"}
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
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={ammBalances}
            disableUnderline
            onChange={(asset) => setAssetOut(asset)}
            showXLM
            testnet={testnet}
            value={mode === "in" ? assetOut : assetIn}
          />
        }
        disabled
        fullWidth
        label={mode === "in" ? "To" : "From"}
        placeholder={
          mode === "in" ? "Amount of the asset you want to put in" : "Amount of the asset you want to get out"
        }
        type="number"
        value={returnedAmount}
      />
      <Button color="primary" disabled={disabled} variant="outlined" style={{ marginTop: 16 }} onClick={onProvideClick}>
        Swap Assets
      </Button>
    </Box>
  )
}

export default SwapView

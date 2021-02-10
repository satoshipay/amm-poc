import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import SwapVertIcon from "@material-ui/icons/SwapVert"
import BigNumber from "big.js"
import React from "react"
import { Asset, Networks, Transaction } from "stellar-sdk"
import config from "../../../config"
import { stringifyAsset } from "../../../lib/stellar"
import { BalancePair } from "../../../lib/utils"
import { runContract } from "../../../services/tss"
import AssetSelector from "../../AssetSelector"
import AssetTextField from "../../AssetTextField"

function calculateSwap(tradeIn: boolean, amount: string, assetIn: Asset, assetOut: Asset, balancePair: BalancePair) {
  const trade = {
    in: config.assetOne.equals(assetIn)
      ? {
          amount: tradeIn ? BigNumber(amount) : undefined,
          asset: config.assetOne,
          balance: BigNumber(balancePair[0]),
        }
      : config.assetTwo.equals(assetIn)
      ? {
          amount: tradeIn ? BigNumber(amount) : undefined,
          asset: config.assetTwo,
          balance: BigNumber(balancePair[1]),
        }
      : fail(`Unknown asset: ${assetIn}`),
    out: config.assetOne.equals(assetOut)
      ? {
          amount: !tradeIn ? BigNumber(amount) : undefined,
          asset: config.assetOne,
          balance: BigNumber(balancePair[0]),
        }
      : config.assetTwo.equals(assetOut)
      ? {
          amount: !tradeIn ? BigNumber(amount) : undefined,
          asset: config.assetTwo,
          balance: BigNumber(balancePair[1]),
        }
      : fail(`Unknown asset: ${assetOut}`),
  }

  const rate = trade.out.amount
    ? trade.in.balance.div(trade.out.balance.sub(trade.out.amount))
    : BigNumber(1).div(trade.out.balance.div(trade.in.balance.sub(trade.in.amount!)))

  trade.in.amount = trade.in.amount || new BigNumber(trade.out.amount!.mul(rate).mul(1 - config.swapFeePercent / 100))
  trade.out.amount = trade.out.amount || new BigNumber(trade.in.amount.div(rate).mul(1 - config.swapFeePercent / 100))

  trade.in.amount = trade.in.amount.round(7)
  trade.out.amount = trade.out.amount.round(7)

  return trade
}

interface Props {
  accountID: string
  balancePair: BalancePair
  submitTransaction: (transaction: Transaction) => void
  testnet: boolean
}

function SwapView(props: Props) {
  const { accountID, balancePair, submitTransaction, testnet } = props
  const networkPassphrase = testnet ? Networks.TESTNET : Networks.PUBLIC

  const [amount, setAmount] = React.useState("")
  const [returnedAmount, setReturnedAmount] = React.useState("")

  const [assetIn, setAssetIn] = React.useState<Asset>(config.assetOne)
  const [assetOut, setAssetOut] = React.useState<Asset>(config.assetTwo)

  const selectableAssets = [config.assetOne, config.assetTwo]

  const [mode, setMode] = React.useState<"in" | "out">("in")

  React.useEffect(() => {
    if (amount && assetIn && assetOut) {
      const result = calculateSwap(mode === "in", amount, assetIn, assetOut, balancePair)
      setReturnedAmount(mode === "in" ? String(result.out.amount) : String(result.in.amount))
    } else {
      setReturnedAmount("")
    }
  }, [amount, assetIn, assetOut, balancePair, mode])

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
    if (assetIn && assetOut && amount) {
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
        .then((response) => {
          const { signature, signer, xdr } = response
          const tx = new Transaction(xdr, networkPassphrase)
          tx.addSignature(signer, signature)
          submitTransaction(tx)
        })
        .catch(console.error)
    }
  }, [accountID, amount, assetIn, assetOut, mode, networkPassphrase, submitTransaction])

  const disabled = !amount || !assetIn || !assetOut

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={selectableAssets}
            disableUnderline
            testnet={testnet}
            onChange={(asset) => {
              setAssetIn(asset)
              const otherAsset = selectableAssets.find((a) => !a.equals(asset))
              if (otherAsset) setAssetOut(otherAsset)
            }}
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
            assets={selectableAssets}
            disabled
            disableUnderline
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

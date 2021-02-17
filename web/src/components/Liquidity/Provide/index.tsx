import { Typography } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import CircularProgress from "@material-ui/core/CircularProgress"
import BigNumber from "big.js"
import React from "react"
import { Asset, Networks, Transaction } from "stellar-sdk"
import config from "../../../config"
import { usePromiseTracker } from "../../../lib/promises"
import { stringifyAsset } from "../../../lib/stellar"
import { BalancePair } from "../../../lib/utils"
import { runContract } from "../../../services/tss"
import AssetSelector from "../../AssetSelector"
import AssetTextField from "../../AssetTextField"

function calculateDeposit(
  asset: Asset,
  amount: string,
  balancePair: [BigNumber, BigNumber],
  poolTokenTotal: BigNumber
) {
  const depositIntent = {
    amount: BigNumber(amount),
    asset,
  }

  const depositAmounts = [
    depositIntent.asset.equals(config.assetOne)
      ? depositIntent.amount
      : depositIntent.amount.mul(balancePair[0]).div(balancePair[1]).round(7),
    depositIntent.asset.equals(config.assetOne)
      ? depositIntent.amount.mul(balancePair[1]).div(balancePair[0]).round(7)
      : depositIntent.amount,
  ] as const

  const liquidityTokens = depositAmounts[0].mul(poolTokenTotal).div(balancePair[0])

  const deposit = {
    depositAmounts,
    liquidityTokens: liquidityTokens.round(2, 0 /* round down */),
  } as const

  return deposit
}

interface Props {
  accountID: string
  balancePair: BalancePair
  submitTransaction: (transaction: Transaction) => Promise<unknown>
  testnet: boolean
  poolTokenTotal: BigNumber
}

function ProvideLiquidityView(props: Props) {
  const { accountID, balancePair, submitTransaction, testnet, poolTokenTotal } = props

  const networkPassphrase = testnet ? Networks.TESTNET : Networks.PUBLIC
  const selectableAssets = [config.assetOne, config.assetTwo]

  const [userAmount, setUserAmount] = React.useState("")
  const [calculatedAmount, setCalculatedAmount] = React.useState("")
  const [asset1, setAsset1] = React.useState<Asset>(config.assetOne)
  const [asset2, setAsset2] = React.useState<Asset>(config.assetTwo)
  const [estimatedLPT, setEstimatedLPT] = React.useState("")
  const submission = usePromiseTracker()

  React.useEffect(() => {
    if (userAmount) {
      try {
        const result = calculateDeposit(asset1, userAmount, balancePair, poolTokenTotal)

        if (asset1.equals(config.assetOne)) {
          setCalculatedAmount(String(result.depositAmounts[1]))
        } else {
          setCalculatedAmount(String(result.depositAmounts[0]))
        }

        setEstimatedLPT(String(result.liquidityTokens))
      } catch (error) {
        console.error(error)
      }
    } else {
      setCalculatedAmount("")
      setEstimatedLPT("")
    }
  }, [userAmount, asset1, balancePair, poolTokenTotal])

  const onProvideClick = React.useCallback(() => {
    submission.track(
      runContract("to-the-moon", {
        action: "deposit",
        amount: String(userAmount),
        asset: stringifyAsset(asset1),
        client: accountID,
      })
        .then((response) => {
          const { signature, signer, xdr } = response
          const tx = new Transaction(xdr, networkPassphrase)
          tx.addSignature(signer, signature)

          return submitTransaction(tx)
        })
        .catch(console.error)
    )
  }, [accountID, userAmount, asset1, networkPassphrase, submitTransaction, submission])

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={selectableAssets}
            disableUnderline
            testnet={testnet}
            onChange={(asset) => {
              setAsset1(asset)
              const otherAsset = selectableAssets.find((a) => !a.equals(asset))
              if (otherAsset) setAsset2(otherAsset)
            }}
            value={asset1}
          />
        }
        fullWidth
        label={`Amount ${asset1.getCode()}`}
        placeholder="Amount of tokens you want to deposit"
        type="number"
        value={userAmount}
        onChange={(e) => setUserAmount(e.target.value)}
      />
      <Typography variant="h5" style={{ marginTop: 16 }}>
        +
      </Typography>
      <AssetTextField
        assetCode={
          <AssetSelector assets={selectableAssets} disabled disableUnderline testnet={testnet} value={asset2} />
        }
        disabled
        fullWidth
        label={`Amount ${asset2.getCode()}`}
        placeholder="Amount of tokens you want to deposit"
        type="number"
        value={calculatedAmount}
      />
      {estimatedLPT && (
        <Typography style={{ margin: "24px 0 16px" }} variant="h6">
          Estimated return: {estimatedLPT} {config.liquidityProviderAsset.code}
        </Typography>
      )}
      <Button
        color="primary"
        disabled={!userAmount}
        startIcon={submission.state === "pending" ? <CircularProgress size={16} /> : null}
        variant="outlined"
        style={{ marginTop: 16 }}
        onClick={onProvideClick}
      >
        Provide
      </Button>
    </Box>
  )
}

export default ProvideLiquidityView

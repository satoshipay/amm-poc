import { Typography } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import BigNumber from "big.js"
import React from "react"
import { Asset, Networks, Transaction } from "stellar-sdk"
import config from "../../../config"
import { stringifyAsset } from "../../../lib/stellar"
import { BalancePair } from "../../../lib/utils"
import { runContract } from "../../../services/tss"
import AssetSelector from "../../AssetSelector"
import AssetTextField from "../../AssetTextField"

function calculateDeposit(asset: Asset, amount: string, balancePair: [BigNumber, BigNumber]) {
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

  const postDepositPoolBalances = [
    balancePair[0].add(depositAmounts[0]),
    balancePair[1].add(depositAmounts[1]),
  ] as const

  const liquidityTokens = postDepositPoolBalances[0]
    .mul(postDepositPoolBalances[1])
    .div(depositAmounts[0].mul(depositAmounts[1]))

  const deposit = {
    depositAmounts,
    liquidityTokens: liquidityTokens.round(2, 0 /* round down */),
  } as const

  return deposit
}

interface Props {
  accountID: string
  balancePair: BalancePair
  submitTransaction: (transaction: Transaction) => void
  testnet: boolean
}

function ProvideLiquidityView(props: Props) {
  const { accountID, balancePair, submitTransaction, testnet } = props

  const networkPassphrase = testnet ? Networks.TESTNET : Networks.PUBLIC

  const selectableAssets = [config.assetOne, config.assetTwo]

  const [userAmount, setUserAmount] = React.useState("")
  const [calculatedAmount, setCalculatedAmount] = React.useState("")
  const [asset1, setAsset1] = React.useState<Asset>(config.assetOne)
  const [asset2, setAsset2] = React.useState<Asset>(config.assetTwo)
  const [estimatedLPT, setEstimatedLPT] = React.useState("")

  React.useEffect(() => {
    if (userAmount) {
      try {
        const result = calculateDeposit(asset1, userAmount, balancePair)

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
  }, [userAmount, asset1, balancePair])

  const onProvideClick = React.useCallback(() => {
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

        submitTransaction(tx)
      })
      .catch(console.error)
  }, [accountID, userAmount, asset1, networkPassphrase, submitTransaction])

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
        <Typography variant="h6" style={{ marginTop: 16 }}>
          Estimated return: {estimatedLPT} {config.liquidityProviderAsset.code}
        </Typography>
      )}
      <Button
        color="primary"
        disabled={!userAmount}
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

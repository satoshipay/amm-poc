import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import React from "react"
import { runContract } from "../../../services/tss"

interface Props {
  accountID: string
}

function WithdrawLiquidityView(props: Props) {
  const { accountID } = props
  const [amount, setAmount] = React.useState("")

  const onWithdrawClick = React.useCallback(() => {
    runContract("to-the-moon", {
      action: "withdraw",
      amount: String(amount),
      client: accountID,
    })
  }, [accountID, amount])

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <TextField
        fullWidth
        label="Pool Tokens"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button color="primary" disabled={!amount} onClick={onWithdrawClick} variant="outlined" style={{ marginTop: 16 }}>
        Withdraw
      </Button>
    </Box>
  )
}

export default WithdrawLiquidityView

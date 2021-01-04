import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import React from "react"

interface Props {}

function WithdrawLiquidityView(props: Props) {
  const [amount, setAmount] = React.useState("")

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <TextField fullWidth label="Pool Tokens" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Button color="primary" variant="outlined" style={{ marginTop: 16 }}>
        Withdraw
      </Button>
    </Box>
  )
}

export default WithdrawLiquidityView

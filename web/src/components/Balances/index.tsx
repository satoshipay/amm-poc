import React from "react"
import { Horizon } from "stellar-sdk"
import Box from "@material-ui/core/Box"
import Paper from "@material-ui/core/Paper"
import makeStyles from "@material-ui/core/styles/makeStyles"
import Typography from "@material-ui/core/Typography"

const useStyles = makeStyles({
  root: {
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
  },
  balanceContainer: {
    padding: 8,
  },
})

interface Props {
  balances: Horizon.BalanceLine[]
}

function Balances(props: Props) {
  const { balances } = props
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Typography variant="h4">Balances</Typography>
      <Box className={classes.balanceContainer}>
        {balances.map((balance) => (
          <Typography key={balance.asset_type} variant="body1">
            {balance.asset_type === "native" ? "XLM" : balance.asset_code}: {balance.balance}
          </Typography>
        ))}
      </Box>
    </Paper>
  )
}

export default Balances

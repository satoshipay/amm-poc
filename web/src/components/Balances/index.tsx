import Box from "@material-ui/core/Box"
import Divider from "@material-ui/core/Divider"
import List from "@material-ui/core/List"
import Paper from "@material-ui/core/Paper"
import makeStyles from "@material-ui/core/styles/makeStyles"
import Typography from "@material-ui/core/Typography"
import React from "react"
import { Horizon } from "stellar-sdk"
import { stringifyAsset } from "../../lib/stellar"

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
  },
  balanceContainer: {
    padding: 8,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
})

function BalanceList(props: { balances: Horizon.BalanceLine[] }) {
  const classes = useStyles()

  return (
    <List className={classes.list}>
      {props.balances.map((balance) => (
        <Typography key={stringifyAsset(balance)} variant="body1">
          {balance.asset_type === "native" ? "XLM" : balance.asset_code}: {balance.balance}
        </Typography>
      ))}
    </List>
  )
}

interface Props {
  userBalances: Horizon.BalanceLine[]
  ammBalances: Horizon.BalanceLine[]
}

function Balances(props: Props) {
  const { ammBalances, userBalances } = props
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Box className={classes.balanceContainer}>
        <Typography variant="h5">User Balances</Typography>
        <BalanceList balances={userBalances} />
      </Box>
      <Divider flexItem orientation="vertical" />
      <Box className={classes.balanceContainer}>
        <Typography variant="h5">AMM Balances</Typography>
        <BalanceList balances={ammBalances} />
      </Box>
    </Paper>
  )
}

export default Balances

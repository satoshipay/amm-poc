import React from "react"
import { Horizon } from "stellar-sdk"
import ProvideLiquidityView from "./Provide"
import WithdrawLiquidityView from "./Withdraw"
import SwapView from "./Swap"
import Box from "@material-ui/core/Box"
import Paper from "@material-ui/core/Paper"
import makeStyles from "@material-ui/core/styles/makeStyles"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"

interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`scrollable-auto-tabpanel-${index}`} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  )
}

const useStyles = makeStyles({
  root: {
    marginTop: 8,
    padding: 8,
  },
})

interface Props {
  accountID: string
  ammBalances: Horizon.BalanceLine[]
  userBalances: Horizon.BalanceLine[]
  testnet: boolean
}

function LiquidityArea(props: Props) {
  const { accountID, ammBalances, userBalances, testnet } = props
  const classes = useStyles()

  const [selectedTab, setSelectedTab] = React.useState(0)

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue)
  }

  return (
    <Paper className={classes.root}>
      <Tabs
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        variant="fullWidth"
        value={selectedTab}
      >
        <Tab label="Swap" />
        <Tab label="Provide Liquidity" />
        <Tab label="Withdraw Liquidity" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <SwapView accountID={accountID} ammBalances={ammBalances} userBalances={userBalances} testnet={testnet} />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <ProvideLiquidityView accountID={accountID} balances={ammBalances} testnet={testnet} />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        <WithdrawLiquidityView accountID={accountID} />
      </TabPanel>
    </Paper>
  )
}

export default LiquidityArea

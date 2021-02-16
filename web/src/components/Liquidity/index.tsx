import Box from "@material-ui/core/Box"
import Paper from "@material-ui/core/Paper"
import makeStyles from "@material-ui/core/styles/makeStyles"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import BigNumber from "big.js"
import React from "react"
import { Horizon, Keypair, Server, Transaction } from "stellar-sdk"
import { getMarketBalancePair } from "../../lib/utils"
import CustomizedSnackbar, { Notification } from "../Alert"
import ProvideLiquidityView from "./Provide"
import SwapView from "./Swap"
import WithdrawLiquidityView from "./Withdraw"

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
  accountKeypair: Keypair
  ammBalances: Horizon.BalanceLine[]
  poolTokenTotal: BigNumber
  horizon: Server
  testnet: boolean
}

function LiquidityArea(props: Props) {
  const { accountKeypair, ammBalances, horizon, poolTokenTotal, testnet } = props
  const classes = useStyles()

  const accountID = accountKeypair.publicKey()
  const [selectedTab, setSelectedTab] = React.useState(0)
  const [notification, setNotification] = React.useState<Notification | null>(null)

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue)
  }

  const submitTransaction = (transaction: Transaction) => {
    transaction.sign(accountKeypair)
    console.debug("Submitting transaction:", transaction)

    return horizon
      .submitTransaction(transaction)
      .then(() => showNotification({ message: "Transaction submitted to network", severity: "success" }))
      .catch((error) => {
        console.error(error)
        showNotification({ message: "Transaction submission failed", severity: "error" })
        throw error
      })
  }

  const showNotification = (notification: Notification) => {
    setNotification(notification)
  }

  const balancePair = React.useMemo<[BigNumber, BigNumber]>(() => getMarketBalancePair(ammBalances), [ammBalances])

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
        <SwapView
          accountID={accountID}
          balancePair={balancePair}
          submitTransaction={submitTransaction}
          testnet={testnet}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <ProvideLiquidityView
          accountID={accountID}
          balancePair={balancePair}
          poolTokenTotal={poolTokenTotal}
          submitTransaction={submitTransaction}
          testnet={testnet}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        <WithdrawLiquidityView
          accountID={accountID}
          balancePair={balancePair}
          poolTokenTotal={poolTokenTotal}
          submitTransaction={submitTransaction}
          testnet={testnet}
        />
      </TabPanel>
      <CustomizedSnackbar notification={notification} />
    </Paper>
  )
}

export default LiquidityArea

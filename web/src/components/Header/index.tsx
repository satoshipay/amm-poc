import Box from "@material-ui/core/Box"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Switch from "@material-ui/core/Switch"
import Typography from "@material-ui/core/Typography"
import React from "react"

interface Props {
  testnet: boolean
  toggleTestnet: () => void
}

function Header(props: Props) {
  return (
    <Box display="flex" justifyContent="space-between" margin="8px">
      <Typography color="primary" variant="h3">
        DSwap
      </Typography>
      <FormControlLabel
        control={<Switch checked={props.testnet} onChange={props.toggleTestnet} name="testnet" />}
        label="Testnet"
      />
    </Box>
  )
}

export default Header

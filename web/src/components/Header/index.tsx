import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import React from "react"

function Header() {
  return (
    <Box display="flex" justifyContent="space-between" margin="24px 8px">
      <Typography color="primary" variant="h3">
        DSwap
      </Typography>
      <Box display="flex" alignItems="center">
        <Typography color="textSecondary" style={{ textTransform: "uppercase" }} variant="h5">
          Testnet
        </Typography>
      </Box>
    </Box>
  )
}

export default Header

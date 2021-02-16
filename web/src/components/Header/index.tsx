import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import React from "react"

function Header() {
  return (
    <Box display="flex" justifyContent="space-between" margin="8px">
      <Typography color="primary" variant="h3">
        DSwap
      </Typography>
    </Box>
  )
}

export default Header

import React, { useState } from "react"
import { Keypair } from "stellar-sdk"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Paper from "@material-ui/core/Paper"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import makeStyles from "@material-ui/styles/makeStyles"

const useStyles = makeStyles({
  root: {
    padding: 16,
  },
  button: {
    margin: 8,
  },
  textFieldContainer: {
    padding: 8,
  },
})

interface Props {
  onAccountSelect: (account: string) => void
}

function SecretKeyInput(props: Props) {
  const classes = useStyles()

  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>("")

  const validate = () => {
    try {
      Keypair.fromSecret(value)
      return null
    } catch (error) {
      return error
    }
  }

  const connect = () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError.message)
    } else {
      setError(null)
      props.onAccountSelect(value)
    }
  }

  return (
    <Paper className={classes.root}>
      <Typography color="textPrimary" variant="h6">
        Choose the account that you want to use.
      </Typography>
      <Box className={classes.textFieldContainer} display="flex">
        <TextField
          error={Boolean(error)}
          label={error ? error : "Secret Key"}
          margin="normal"
          onChange={(e) => setValue(e.target.value.toLocaleUpperCase())}
          placeholder="SABC..."
          value={value}
          fullWidth
        />
        <Button className={classes.button} color="primary" onClick={connect} size="small" variant="outlined">
          Connect
        </Button>
      </Box>
    </Paper>
  )
}

export default SecretKeyInput

import React from "react"
import Snackbar from "@material-ui/core/Snackbar"
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert"
import { makeStyles, Theme } from "@material-ui/core/styles"

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}))

export interface Notification {
  message: string
  severity: AlertProps["severity"]
}

interface Props {
  notification: Notification | null
}

function CustomizedSnackbar(props: Props) {
  const classes = useStyles()

  const [locNotification, setLocNotification] = React.useState<Notification | null>(props.notification)

  React.useEffect(() => {
    setLocNotification(props.notification)
  }, [props.notification])

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    setLocNotification(null)
  }

  return (
    <div className={classes.root}>
      {locNotification && (
        <Snackbar open autoHideDuration={3000} onClose={handleClose}>
          <Alert severity={locNotification.severity}>{locNotification.message}</Alert>
        </Snackbar>
      )}
    </div>
  )
}

export default CustomizedSnackbar

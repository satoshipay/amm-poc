import React from "react"
import InputAdornment from "@material-ui/core/InputAdornment"
import TextField, { TextFieldProps } from "@material-ui/core/TextField"

type AssetTextFieldProps = TextFieldProps & {
  assetCode: React.ReactNode
  assetStyle?: React.CSSProperties
}

export const AssetTextField = React.memo(function PriceInput(props: AssetTextFieldProps) {
  const { assetCode, assetStyle, ...textfieldProps } = props
  return (
    <TextField
      {...textfieldProps}
      inputProps={{
        pattern: "[0-9]*",
        inputMode: "decimal",
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment
            disableTypography
            position="end"
            style={{
              pointerEvents: typeof assetCode === "string" ? "none" : undefined,
              ...assetStyle,
            }}
          >
            {assetCode}
          </InputAdornment>
        ),
        ...textfieldProps.InputProps,
      }}
      style={{
        ...textfieldProps.style,
      }}
    />
  )
})

export default AssetTextField

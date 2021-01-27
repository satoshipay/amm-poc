import React from "react"
import { Asset, Horizon } from "stellar-sdk"
import { balancelineToAsset, stringifyAsset } from "../../lib/stellar"
import ListItemText from "@material-ui/core/ListItemText"
import MenuItem from "@material-ui/core/MenuItem"
import { makeStyles } from "@material-ui/core/styles"
import TextField, { TextFieldProps } from "@material-ui/core/TextField"

interface AssetItemProps {
  asset: Asset
  disabled?: boolean
  testnet: boolean
  // key + value props are expected here from React/Material-ui validation mechanisms
  key: string
  value: string
}

const AssetItem = React.memo(
  React.forwardRef(function AssetItem(props: AssetItemProps, ref: React.Ref<HTMLLIElement>) {
    const { testnet, ...reducedProps } = props

    return (
      <MenuItem {...reducedProps} key={props.key} ref={ref} value={props.value}>
        <ListItemText>{props.asset.getCode()}</ListItemText>
      </MenuItem>
    )
  })
)

const useAssetSelectorStyles = makeStyles({
  helperText: {
    maxWidth: 100,
    whiteSpace: "nowrap",
  },
  input: {
    minWidth: 72,
  },
  select: {
    fontSize: 18,
    fontWeight: 400,
  },
  unselected: {
    opacity: 0.5,
  },
})

interface AssetSelectorProps {
  autoFocus?: TextFieldProps["autoFocus"]
  assets: (Asset | Horizon.BalanceLine)[]
  children?: React.ReactNode
  className?: string
  disabledAssets?: Asset[]
  disableUnderline?: boolean
  helperText?: TextFieldProps["helperText"]
  inputError?: string
  label?: TextFieldProps["label"]
  margin?: TextFieldProps["margin"]
  minWidth?: number | string
  name?: string
  onChange?: (asset: Asset) => void
  showXLM?: boolean
  style?: React.CSSProperties
  testnet: boolean
  value?: Asset
}

function AssetSelector(props: AssetSelectorProps) {
  const { onChange } = props
  const classes = useAssetSelectorStyles()

  const assets = React.useMemo(
    () => [
      Asset.native(),
      ...props.assets.map((asset) =>
        "code" in asset && "issuer" in asset ? (asset as Asset) : balancelineToAsset(asset)
      ),
    ],
    [props.assets]
  )

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<{ name?: any; value: any }>, child: React.ComponentElement<AssetItemProps, any>) => {
      const matchingAsset = assets.find((asset) => asset.equals(child.props.asset))

      if (matchingAsset) {
        if (onChange) {
          onChange(matchingAsset)
        }
      } else {
        // tslint:disable-next-line no-console
        console.error(
          `Invariant violation: Trustline ${child.props.asset.getCode()} selected, but no matching asset found.`
        )
      }
    },
    [assets, onChange]
  )

  return (
    <TextField
      autoFocus={props.autoFocus}
      className={props.className}
      error={Boolean(props.inputError)}
      helperText={props.helperText}
      label={props.inputError ? props.inputError : props.label}
      margin={props.margin}
      onChange={handleChange as any}
      name={props.name}
      placeholder="Select an asset"
      select
      style={{ flexShrink: 0, ...props.style }}
      value={props.value ? props.value.getCode() : ""}
      FormHelperTextProps={{
        className: classes.helperText,
      }}
      InputProps={{
        classes: {
          root: classes.input,
        },
        style: {
          minWidth: props.minWidth,
        },
      }}
      SelectProps={{
        classes: {
          root: props.value ? undefined : classes.unselected,
          select: classes.select,
        },
        displayEmpty: !props.value,
        disableUnderline: props.disableUnderline,
        renderValue: () => (props.value ? props.value.getCode() : "Select"),
      }}
    >
      {props.value ? null : (
        <MenuItem disabled value="">
          Select an asset
        </MenuItem>
      )}
      {props.showXLM ? (
        <AssetItem
          asset={Asset.native()}
          disabled={props.disabledAssets && props.disabledAssets.some((someAsset) => someAsset.isNative())}
          key={stringifyAsset(Asset.native())}
          testnet={props.testnet}
          value={Asset.native().getCode()}
        />
      ) : null}
      {assets
        .filter((asset) => !asset.isNative())
        .map((asset) => (
          <AssetItem
            asset={asset}
            disabled={props.disabledAssets && props.disabledAssets.some((someAsset) => someAsset.equals(asset))}
            key={stringifyAsset(asset)}
            testnet={props.testnet}
            value={asset.getCode()}
          />
        ))}
    </TextField>
  )
}

export default React.memo(AssetSelector)

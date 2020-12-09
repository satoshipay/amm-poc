type Amount = string
type AssetCode = Uppercase<string>
type AssetId = `${AssetCode}:${PublicKey}` | "native"
type PublicKey = `G${Uppercase<string>}`

export interface TSSContract<RequestBody> {
  /**
   * @returns Transaction envelope XDR, encoded as base64
   */
  (input: TSSContractInput<RequestBody>): Promise<string>
}

interface TSSContractInput<RequestBody> {
  request: RequestBody
  signers: string[]
}

export namespace AMMRequestBody {
  export enum Action {
    trade = "trade"
  }

  export interface Trade {
    action: Action.trade
    in: {
      amount: Amount
      asset: AssetId
    }
    out: {
      amount: Amount
      asset: AssetId
    }
  }

  export type Any = Trade
}

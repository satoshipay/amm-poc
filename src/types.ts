import { Transaction } from "stellar-sdk"

type AccountID = string
type Amount = string
type AssetCode = Uppercase<string>
type AssetId = `${PublicKey}:${AssetCode}` | "native"
type PublicKey = `G${Uppercase<string>}`

export interface TSSContract<RequestBody> {
  /**
   * @returns Transaction envelope XDR, encoded as base64
   */
  (input: TSSContractInput<RequestBody>): Promise<string>
}

export interface TSSContractInput<RequestBody> {
  request: RequestBody
  signers: string[]
}

export interface ContractActionHandler<RequestBody> {
  (request: RequestBody, signers: string[]): Promise<Transaction>
}

export namespace AMMRequestBody {
  export enum Action {
    deposit = "deposit",
    swap = "swap",
    withdraw = "withdraw"
  }

  export interface Deposit {
    action: Action.deposit
    /**
     * The amount of one pool asset you are going to deposit.
     * The amount of the other asset will be calculated based on this one.
     */
    amount: Amount
    /** Must be one of the pool's two assets. */
    asset: AssetId
    client: AccountID
  }

  export type Swap = {
    action: Action.swap
    client: AccountID
  } & (
    {
      in: {
        asset: AssetId
      }
      out: {
        amount: Amount
        asset: AssetId
      }
    } | {
      in: {
        amount: Amount
        asset: AssetId
      }
      out: {
        asset: AssetId
      }
    }
  )

  export interface Withdraw {
    action: Action.withdraw
    /** The amount of liquidity tokens to redeem. */
    amount: Amount
    client: AccountID
  }

  export type Any = Deposit | Swap | Withdraw
}

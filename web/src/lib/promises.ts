import React from "react"

export type PromiseState = "pending" | "resolved" | "rejected"

export function usePromiseTracker() {
  const [state, setState] = React.useState<PromiseState | "initial">("initial")

  const track = React.useCallback(<T>(promise: Promise<T>) => {
    setState("pending")

    promise.then(
      (result) => {
        setState("resolved")
        return result
      },
      (error) => {
        setState("rejected")
        throw error
      }
    )
    return promise
  }, [])

  return {
    state,
    track,
    unresolved: state === "initial" || state === "pending",
  }
}

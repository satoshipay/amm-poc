# Known Issues

### Only one tx per ledger

As the smart contract will fetch the latest pool account data and use that latest on-ledger sequence number to base the next transaction's sequence number on, the smart contract is only able to perform one transaction per ledger. All subsequent transactions in the same ledger will fail with a sequence number error.

The txs also need to use the pool account as source account, since every swap affects the rate applied to the next swap. So the rate of a swap X+1 is only valid if swap X that the X+1 rate is based on does actually succeed. This is why we need to use the pool account as the source account for swap txs.


## Issues if we could have multiple txs per ledger

### Swaps are exploitable

The exchange rate for a swap is calculated based on on-ledger balances of the pool account. Naturally, they are only updated once every 5s.

If you want to swap a large amount, the rate will be worse than for a smaller amount, as you are about to shift the relation of the pool's balances towards a shortage of the asset you are buying.

Instead of performing one large swap, you can perform a number of smaller swaps within the same 5s ledger, totalling the same amount in the end. The smart contract will authorize all these small swaps at the same low rate as it only becomes aware of the shifted demand/offer after the ledger has closed.

### Swaps are not reliable

Swaps are not reliable as the source account for swap txs is the pool account. Due to sequence number issues it is only safe to use if there is never more than one tx per ledger. Users might not be able to swap because previous swap txs in the same ledger fail.


## Mitigations

### Ephemeral ledger state (research topic)

TSS servers would need to create transactions, pass it to the user for signing, then have it passed back and submit txs to horizon themselves. TSS servers would then keep track of an optimistically updated version of the latest ledger state and provide it to their smart contracts.

Would provide

* Multiple txs per ledger
* Safe (non-exploitable) swaps

Furthermore all payments to smart contract accounts would need to be paid from transit accounts co-signed by the TSS servers. They would essentially act as payment channels. Thanks to being co-signer of these accounts, TSS servers could be sure that payments are covered by sufficient balances.

This would offer

* Reliable multiple txs per ledger

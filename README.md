# Automated Market Maker - Proof of Concept

Primitive prototype of an AMM for Stellar built using [Turing Signing Servers](https://tss.stellar.buzz/).

## Usage

## Known limitations

## Build

```
npm run build
```

## Run locally

```
npm run test-server
```

Execute the contract via

```
curl -X POST http://localhost:3001/contract/test -H 'Content-Type: application/json' --data '{"action":"trade", …}'
```

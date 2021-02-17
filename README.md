# Automated Market Maker - Proof of Concept

Primitive prototype of an AMM for Stellar built using [Turing Signing Servers](https://tss.stellar.buzz/).

## Usage

## Known issues

👉 [**Known issues**](./KNOWN-ISSUES.md)

## Build

```
# Production build
npm run build

# Development build
npm run build:dev
```

## Run locally

Make sure you have built the latest version of the contract.
Run a small local test server with a simple API that allows invoking the contract as if this server was a TSS signing server with the deployed contract.

```
npm run test-server
```

Execute the contract via

```
curl -X POST http://localhost:3001/contract/test -H 'Content-Type: application/json' --data '{"action":"trade", …}'
```

Launch the web UI via

```
cd web
npm start
```

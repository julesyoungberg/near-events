#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

CONTRACT_NAME=events
ACCOUNT_ID=jyoungberg.testnet
CONTRACT_ID="$CONTRACT_NAME.$ACCOUNT_ID"
INITIAL_BALANCE=5
WASM_FILE=./build/release/factory.wasm

echo
echo ---------------------------------------------------------
echo "Step 1: Build the contract (may take a few seconds)"
echo ---------------------------------------------------------
echo

npm run build:release

echo
echo
echo ---------------------------------------------------------
echo "Step 2: Deploying the Factory contract"
echo ---------------------------------------------------------
echo

near deploy --accountId=${CONTRACT_ID} --wasmFile=${WASM_FILE}

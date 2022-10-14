#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

CONTRACT_NAME=events
ACCOUNT_ID=jyoungberg.testnet
CONTRACT_ID="$CONTRACT_NAME.$ACCOUNT_ID"
INITIAL_BALANCE=5

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Create the Factory contract account"
echo ---------------------------------------------------------
echo

near create-account ${CONTRACT_ID} \
    --masterAccount ${ACCOUNT_ID} \
    --initialBalance ${INITIAL_BALANCE}

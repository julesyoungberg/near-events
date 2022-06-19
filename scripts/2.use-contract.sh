#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 0: Check for environment variable with contract name"
echo ---------------------------------------------------------
echo

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$CONTRACT" ] || echo "Found it! \$CONTRACT is set to [ $CONTRACT ]"

echo
echo

near view $CONTRACT get_event_names

echo
echo

near call $CONTRACT create_event \
    '{"name": "spaceparty", "details":{"date":"3000000000000000000", "location":"space", "title":"space party", "description": "come dance and chat with friends", "image_url":""}}' \
    --accountId $CONTRACT --deposit 3 --gas 100000000000000

echo
echo

near view $CONTRACT get_event_names

echo
exit 0

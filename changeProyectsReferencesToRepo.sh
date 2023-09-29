#!/bin/bash
# example: ./changeVersionToPublish.sh 1.0.0

version=$(jq -r .version ./contracts/package.json)

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph-dev\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \"$version\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph-dev\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \"$version\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph-dev\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \"$version\"/g"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \"$version\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \"$version\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \"$version\"/g"
elif [[ "$OSTYPE" == "msys" ]]; then
  # Windows
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \"$version\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \"$version\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \"$version\"/g"
fi
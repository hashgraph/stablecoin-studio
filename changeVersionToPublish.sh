#!/bin/bash
# example: ./changeVersionToPublish.sh 1.0.0
echo "The new version to publish is: $1 and the OS is: $OSTYPE"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"version\": \".*\"/\"version\": \"$1\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \"$1\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \"$1\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \"$1\"/g"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"version\": \".*\"/\"version\": \"$1\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \"$1\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \"$1\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \"$1\"/g"
elif [[ "$OSTYPE" == "msys" ]]; then
  # Windows
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"version\": \".*\"/\"version\": \"$1\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \"$1\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \"$1\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \"$1\"/g"
fi
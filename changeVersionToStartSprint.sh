#!/bin/bash
# example: ./changeVersionToStartSprint.sh 1.0.0
echo "The new version to start sprint is: $1 and the OS is: $OSTYPE"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \".\/..\/sdk\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \".\/..\/contracts\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \".\/..\/hashconnect\/lib\"/g"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \".\/..\/sdk\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \".\/..\/contracts\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \".\/..\/hashconnect\/lib\"/g"
elif [[ "$OSTYPE" == "msys" ]]; then
  # Windows
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph\/stablecoin-npm-sdk\": \".\/..\/sdk\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph\/stablecoin-npm-contracts\": \".\/..\/contracts\"/g" 
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/hashconnect\": \".*\"/\"@hashgraph\/hashconnect\": \".\/..\/hashconnect\/lib\"/g"
fi
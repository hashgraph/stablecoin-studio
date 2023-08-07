#!/bin/bash
# to execute: ./changeVersionToPublish.sh 1.0.0
echo "El parámetro es: $1"

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"version\": \".*\"/\"version\": \"$1\"/g"

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph-dev\/stablecoin-npm-sdk\": \"$1\"/g"

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph-dev\/stablecoin-npm-contracts\": \"$1\"/g" 

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/hashconnect\": \".*\"/\"@hashgraph-dev\/hashconnect\": \"$1\"/g"
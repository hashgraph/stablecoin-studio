
#!/bin/bash

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-sdk\": \".*\"/\"@hashgraph-dev\/stablecoin-npm-sdk\": \".\/..\/sdk\"/g"

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/stablecoin-npm-contracts\": \".*\"/\"@hashgraph-dev\/stablecoin-npm-contracts\": \".\/..\/contracts\"/g" 

find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph-dev\/hashconnect\": \".*\"/\"@hashgraph-dev\/hashconnect\": \".\/..\/hashconnect\/lib\"/g"




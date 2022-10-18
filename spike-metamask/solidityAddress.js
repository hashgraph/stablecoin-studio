import { AccountId } from "@hashgraph/sdk";
// Cast Hedera ID to Solidity Address
console.log(
  "tokenId: " + AccountId.fromString("0.0.48648355").toSolidityAddress()
);
console.log(
  "proxy: " + AccountId.fromString("0.0.48648337").toSolidityAddress()
);

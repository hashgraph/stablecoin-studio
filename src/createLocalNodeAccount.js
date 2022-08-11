const HederaSDK = require('@hashgraph/sdk');
const {Hbar} = require("@hashgraph/sdk");

const edKey = "302e020100300506032b657004220420b50db9e93d9dfc0ad37380a05b8dac0bc8de1f34c6868fd738b5a5210e287db7";

async function main() {
    const client = HederaSDK.Client
        .forNetwork({
          '127.0.0.1:50211': '0.0.3'
        })
        .setOperator('0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137');

    const tx = await new HederaSDK.AccountCreateTransaction()
        .setKey(HederaSDK.PrivateKey.fromString(edKey))
        .setInitialBalance(new HederaSDK.Hbar(1000000))
        .execute(client);
    const receipt = await tx.getReceipt(client);
    console.log(`Don't forget to update your .env file...`);
    console.log(`HEDERA_NETWORK=local`);
    console.log(`OPERATOR_ID=${receipt.accountId.toString()}`);
    console.log(`OPERATOR_KEY=302e020100300506032b657004220420b50db9e93d9dfc0ad37380a05b8dac0bc8de1f34c6868fd738b5a5210e287db7`);
}
main();


const HederaSDK = require('@hashgraph/sdk');
const dotenv = require("dotenv");
const {AccountId} = require("@hashgraph/sdk");
dotenv.config({ path: '../.env' });

async function main() {
    const client = HederaSDK.Client
        .forNetwork({
          '127.0.0.1:50211': '0.0.3'
        })
        .setOperator('0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137');

    console.log(`Checking balance for ${process.env.OPERATOR_ID} (from .env`);

    const balance = await new HederaSDK.AccountBalanceQuery()
        .setAccountId(AccountId.fromString(process.env.OPERATOR_ID))
        .execute(client);
    console.log(balance.hbars.toString());
}
main();


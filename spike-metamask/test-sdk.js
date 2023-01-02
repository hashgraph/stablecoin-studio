
import { AccountId, AccountInfoQuery, Client, Hbar, PrivateKey, TokenCreateTransaction } from '@hashgraph/sdk';
import { PublicKey } from '@hashgraph/cryptography';
import Long from 'long';

const OPERATOR_ID = AccountId.fromString("0.0.30917952");
const OPERATOR_KEY = PrivateKey.fromString("634da975de171336cf59672de59f6ad10db7c3c7fe8e426889c15f58275e3f54");


const OPERATOR_ID2 = AccountId.fromString("0.0.28540472");
const OPERATOR_KEY2 = PrivateKey.fromString("f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69");

// Pre-configured client for test network (testnet)
const client = Client.forTestnet()

//Set the operator with the operator ID and operator key
client.setOperator(OPERATOR_ID, OPERATOR_KEY);
const web3 = new Web3;

const transaction = await new TokenCreateTransaction()
     .setTokenName("Your Token Name")
     .setTokenSymbol("F")
     .setTreasuryAccountId(OPERATOR_ID)
     .setInitialSupply(Long.fromString('1111111111111111'))
     .setDecimals(17)
     .setSupplyKey(OPERATOR_KEY)
     .setAdminKey(OPERATOR_KEY)
     .setMaxTransactionFee(new Hbar(30))
     .setAutoRenewAccountId(OPERATOR_ID2)
     .freezeWith(client);


//Sign the transaction with the token adminKey and the token treasury account private key
const signTx = await transaction.sign(OPERATOR_KEY2);

//Sign the transaction with the client operator private key and submit to a Hedera network
const txResponse = await signTx.execute(client);

//Get the receipt of the transaction
const receipt = await txResponse.getReceipt(client);

//Get the token ID from the receipt
const tokenId = receipt.tokenId;

console.log("The new token ID is " + tokenId);

//Create the account info query
const query = new AccountInfoQuery()
    .setAccountId(AccountId.fromString('0.0.46824819'));

//Sign with client operator private key and submit the query to a Hedera network
const accountInfo = await query.execute(client);

//Print the account info to the console
console.log(accountInfo);



accountInfo.tokenRelationships.__map.forEach(element => {
     console.log(element.tokenId)
     console.log(element.balance.toString())
});

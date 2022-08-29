import { TokenCreateTransaction,DelegateContractId, Hbar,  Client,  AccountId, PrivateKey, ContractFunctionParameters,
  PublicKey, ContractCreateTransaction, FileCreateTransaction, FileAppendTransaction, ContractId, TokenId,TokenSupplyType,
  ContractExecuteTransaction } from "@hashgraph/sdk";

import { HederaERC20__factory, HTSTokenOwner__factory, ERC1967Proxy__factory } from "../typechain-types";

import dotenv from "dotenv";

dotenv.config();

export async function deployContractsWithSDK(name:string, symbol:string, decimals:number=6,
                                             initialSupply:number=0, maxSupply:number, 
                                             memo:string, freeze:boolean=false) {

  console.log(`Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`);                                        

  let account    = process.env.OPERATOR_ID;
  let privateKey = process.env.OPERATOR_PRIVATE_KEY;
  let publicKey  = process.env.OPERATOR_PUBLIC_KEY;                                      

  const clientSdk = getClient(account!, privateKey!);

  console.log(`Deploying ${HederaERC20__factory.name} contract... please wait.`);
  let tokenContract = await deployContractSDK(HederaERC20__factory, 10, privateKey, clientSdk);

  console.log(`Deploying ${ERC1967Proxy__factory.name} contract... please wait.`);
  let parameters = new ContractFunctionParameters()
                        .addAddress(tokenContract!.toSolidityAddress())
                        .addBytes(new Uint8Array([]));
  let proxyContract = await deployContractSDK(ERC1967Proxy__factory, 10, privateKey, clientSdk, parameters);
  parameters = new ContractFunctionParameters();    
  await contractCall(proxyContract, 'initialize', parameters, clientSdk, 60000);
  
  console.log(`Deploying ${HTSTokenOwner__factory.name} contract... please wait.`);
  const tokenOwnerContract = await deployContractSDK(HTSTokenOwner__factory, 10, privateKey, clientSdk);

  console.log("Creating token... please wait.");
  const hederaToken = await createToken(tokenOwnerContract, name,  symbol, decimals, initialSupply, maxSupply, memo, freeze, account!, privateKey!, publicKey!, clientSdk);

  console.log("Setting up contract... please wait.");
  parameters = new ContractFunctionParameters()
                    .addAddress(tokenOwnerContract!.toSolidityAddress())
                    .addAddress(TokenId.fromString(hederaToken!.toString()).toSolidityAddress());    
  await contractCall(proxyContract, 'setTokenAddress', parameters, clientSdk, 60000);

  parameters = new ContractFunctionParameters()
                    .addAddress(proxyContract!.toSolidityAddress())
  await contractCall(tokenOwnerContract, 'setERC20Address', parameters, clientSdk, 60000);

  return proxyContract?.toSolidityAddress();
}

async function contractCall(contractId:any, 
                            functionName:string, 
                            functionParameters:ContractFunctionParameters, 
                            clientOperator: any,
                            gas: any) {
  const contractTx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction(functionName, functionParameters)
      .setGas(gas)
      .execute(clientOperator);
  let record = await contractTx.getRecord(clientOperator);

  return record.contractFunctionResult;
}

function getClient(account:string, privateKey:string) {
  const network = process.env.HEDERA_NETWORK;
  const client = Client.forName(network!);
  client.setOperator(
    account,
    privateKey
  );
  return client;
}

async function createToken(
  contractId: any,
  name:string, 
  symbol:string,
  decimals:number=6,
  initialSupply:number=0,
  maxSupply:number,
  memo:string,
  freeze:boolean=false,
  accountId: string,
  privateKey: string,
  publicKey: string,
  clientSdk:any
) {
 
  let transaction = new TokenCreateTransaction()
    .setMaxTransactionFee(new Hbar(15))
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setDecimals(decimals)
    .setInitialSupply(initialSupply)
    .setMaxSupply(maxSupply)
    .setSupplyType(TokenSupplyType.Finite)
    .setTokenMemo(memo)
    .setFreezeDefault(freeze)
    .setTreasuryAccountId(AccountId.fromString(contractId.toString()))
    .setAdminKey(PublicKey.fromString(publicKey))
    .setFreezeKey(PublicKey.fromString(publicKey))
    .setWipeKey(PublicKey.fromString(publicKey))
    .setSupplyKey(DelegateContractId.fromString(contractId))
    .freezeWith(clientSdk);
  const transactionSign = await transaction.sign(
    PrivateKey.fromStringED25519(privateKey)
  );
  const txResponse = await transactionSign.execute(
    clientSdk
  );
  const receipt = await txResponse.getReceipt(clientSdk);
  const tokenId = receipt.tokenId;
  console.log( `Token ${name} created tokenId ${tokenId} - tokenAddress ${tokenId?.toSolidityAddress()}   `);
  return tokenId;
}

async function deployContractSDK(
  factory: any,
  chunks: any,
  privateKey: any,
  clientOperator: any,
  constructorParameters?: any
) {
  const bytecodeFileId = await fileCreate(
    factory.bytecode,
    chunks,
    PrivateKey.fromStringED25519(privateKey),
    clientOperator
  );

  const transaction = new ContractCreateTransaction()
    .setGas(181_000)
    .setBytecodeFileId(bytecodeFileId)
    .setMaxTransactionFee(new Hbar(30))
    .setAdminKey(PrivateKey.fromStringED25519(privateKey));
    if (constructorParameters) {
      transaction.setConstructorParameters(constructorParameters);
    }
  transaction.freezeWith(clientOperator);
  const contractCreateSign = await transaction.sign(
    PrivateKey.fromStringED25519(privateKey)
  );
  const txResponse = await contractCreateSign.execute(clientOperator);
  const receipt = await txResponse.getReceipt(clientOperator);

  const contractId = receipt.contractId;
  console.log( ` ${factory.name } - contractId ${contractId} -contractId ${contractId?.toSolidityAddress()}   `);
  return contractId;
}

async function fileCreate(
  bytecode: any,
  chunks: any,
  signingPrivateKey: any,
  clientOperator: any
) {
  const fileCreateTx = new FileCreateTransaction()
    .setKeys([signingPrivateKey])
    .freezeWith(clientOperator);
  const fileSign = await fileCreateTx.sign(signingPrivateKey);
  const fileSubmit = await fileSign.execute(clientOperator);
  const fileCreateRx = await fileSubmit.getReceipt(clientOperator);

  const bytecodeFileId = fileCreateRx.fileId || "";
  const fileAppendTx = new FileAppendTransaction()
    .setFileId(bytecodeFileId)
    .setContents(bytecode)
    .setMaxChunks(chunks)
    .setMaxTransactionFee(new Hbar(2))
    .freezeWith(clientOperator);
  const fileAppendSign = await fileAppendTx.sign(signingPrivateKey);
  const fileAppendSubmit = await fileAppendSign.execute(clientOperator);
  const fileAppendRx = await fileAppendSubmit.getReceipt(clientOperator);
  return bytecodeFileId;
};

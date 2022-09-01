import { TokenCreateTransaction,DelegateContractId, Hbar,  Client,  AccountId, PrivateKey, ContractFunctionParameters,
  PublicKey, ContractCreateTransaction, FileCreateTransaction, FileAppendTransaction, TokenId,TokenSupplyType,
  ContractExecuteTransaction, AccountCreateTransaction } from "@hashgraph/sdk";

import { HederaERC20__factory, HTSTokenOwner__factory, HederaERC1967Proxy__factory } from "../typechain-types";

import Web3 from "web3";

const web3 = new Web3;

const hre = require("hardhat");
const hreConfig = hre.network.config;

export async function deployContractsWithSDK(name:string, symbol:string, decimals:number=6,
                                             initialSupply:number=0, maxSupply:number, 
                                             memo:string, freeze:boolean=false) {

  console.log(`Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`);                                        

  const account = hreConfig.accounts[0].account;
  const privateKey = hreConfig.accounts[0].privateKey;
  const publicKey = hreConfig.accounts[0].publicKey;

  const clientSdk = getClient();   
  const OPERATOR_ID = hreConfig.accounts[0].account;
  const OPERATOR_KEY = hreConfig.accounts[0].privateKey; 
  clientSdk.setOperator(OPERATOR_ID, OPERATOR_KEY);

  console.log(`Deploying ${HederaERC20__factory.name} contract... please wait.`);
  let tokenContract = await deployContractSDK(HederaERC20__factory, 10, privateKey, clientSdk);

  console.log(`Deploying ${HederaERC1967Proxy__factory.name} contract... please wait.`);
  let parameters = new ContractFunctionParameters()
                        .addAddress(tokenContract!.toSolidityAddress())
                        .addBytes(new Uint8Array([]));
  let proxyContract = await deployContractSDK(HederaERC1967Proxy__factory, 10, privateKey, clientSdk, parameters);
  let parametersContractCall: any[] = [];    
  await contractCall(proxyContract, 'initialize', parametersContractCall, clientSdk, 200000, HederaERC20__factory.abi);
  
  console.log(`Deploying ${HTSTokenOwner__factory.name} contract... please wait.`);
  const tokenOwnerContract = await deployContractSDK(HTSTokenOwner__factory, 10, privateKey, clientSdk);

  console.log("Creating token... please wait.");
  const hederaToken = await createToken(tokenOwnerContract, name,  symbol, decimals, initialSupply, maxSupply, String(proxyContract), freeze, account!, privateKey!, publicKey!, clientSdk);

  console.log("Setting up contract... please wait.");
  parametersContractCall = [tokenOwnerContract!.toSolidityAddress(),TokenId.fromString(hederaToken!.toString()).toSolidityAddress()];    
  await contractCall(proxyContract, 'setTokenAddress', parametersContractCall, clientSdk, 80000, HederaERC20__factory.abi);

  parametersContractCall = [proxyContract!.toSolidityAddress()];
  await contractCall(tokenOwnerContract, 'setERC20Address', parametersContractCall, clientSdk, 60000, HTSTokenOwner__factory.abi);

  console.log("Associate administrator account to token... please wait.");
  parametersContractCall = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
  await contractCall(proxyContract, 'associateToken', parametersContractCall, clientSdk, 1300000, HederaERC20__factory.abi); 

  return proxyContract;
}

export async function contractCall(contractId:any, 
                            functionName:string, 
                            parameters:any[], 
                            clientOperator: any,
                            gas: any,
                            abi: any) {

  const functionCallParameters = encodeFunctionCall(functionName, parameters, abi);                            
  
  const contractTx = await new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunctionParameters(functionCallParameters)
      .setGas(gas)
      .setNodeAccountIds([
        AccountId.fromString('0.0.3')
      ])
      .execute(clientOperator);
  let record = await contractTx.getRecord(clientOperator);  

  const results = decodeFunctionResult(abi, functionName, record.contractFunctionResult?.bytes);
    
  return results;
}

function encodeFunctionCall(functionName: any, parameters: any[], abi: any) {
  const functionAbi = abi.find((func: { name: any; type: string; }) => (func.name === functionName && func.type === "function"));
  const encodedParametersHex = web3.eth.abi.encodeFunctionCall(functionAbi, parameters).slice(2);
  return Buffer.from(encodedParametersHex, 'hex');
}

function decodeFunctionResult(abi:any, functionName:any, resultAsBytes:any) {
  
  const functionAbi = abi.find((func: { name: any; }) => func.name === functionName);
  const functionParameters = functionAbi?.outputs;
  const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
  const result = web3.eth.abi.decodeParameters(functionParameters || [], resultHex);
  
  const jsonParsedArray = JSON.parse(JSON.stringify(result));    
  
  return jsonParsedArray;
}

export function getClient() {
  switch (hre.network.name) {
    case "previewnet":
      return Client.forPreviewnet();
      break;
    case "mainnet":
      return Client.forMainnet();
      break;
    default:
    case "testnet":
      return Client.forTestnet();
      break;  
  }
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
    .setWipeKey(DelegateContractId.fromString(contractId))
    .setSupplyKey(DelegateContractId.fromString(contractId))
    .setNodeAccountIds([
      AccountId.fromString('0.0.3'),
      AccountId.fromString('0.0.5'),
      AccountId.fromString('0.0.6'),
      AccountId.fromString('0.0.7'),
      AccountId.fromString('0.0.8'),
      AccountId.fromString('0.0.9')
    ])
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
    .setNodeAccountIds([
      AccountId.fromString('0.0.3'),
      AccountId.fromString('0.0.5'),
      AccountId.fromString('0.0.6'),
      AccountId.fromString('0.0.7'),
      AccountId.fromString('0.0.8'),
      AccountId.fromString('0.0.9')
    ])
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
    .setNodeAccountIds([
      AccountId.fromString('0.0.3'),
      AccountId.fromString('0.0.5'),
      AccountId.fromString('0.0.6'),
      AccountId.fromString('0.0.7'),
      AccountId.fromString('0.0.8'),
      AccountId.fromString('0.0.9')
    ])
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
    .setNodeAccountIds([
      AccountId.fromString('0.0.3'),
    ])
    .freezeWith(clientOperator);
  const fileAppendSign = await fileAppendTx.sign(signingPrivateKey);
  const fileAppendSubmit = await fileAppendSign.execute(clientOperator);
  const fileAppendRx = await fileAppendSubmit.getReceipt(clientOperator);
  return bytecodeFileId;
};

export async function createECDSAAccount(client:any, amount:number) {
  let privateECDSAKey;

  do {
      privateECDSAKey = PrivateKey.generateECDSA();
    } while (privateECDSAKey.toStringRaw().length < 64);

  const response = await new AccountCreateTransaction()
  .setKey(privateECDSAKey)
  .setInitialBalance(new Hbar(amount))
  .execute(client);
  const receipt = await response.getReceipt(client);
  const account = receipt.accountId;
  let accountId = account!.toString();
  let privateKey = '0x'.concat(privateECDSAKey.toStringRaw());
  return { accountId, privateKey, privateECDSAKey };
}
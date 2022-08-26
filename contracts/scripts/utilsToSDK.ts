require("@hashgraph/hardhat-hethers");
import {hethers} from "@hashgraph/hethers";

import { TokenCreateTransaction,DelegateContractId, Hbar,  Client,  AccountId, PrivateKey,
  PublicKey, ContractCreateTransaction, FileCreateTransaction, FileAppendTransaction, ContractId, TokenId,
} from "@hashgraph/sdk";

import { Interface } from "@ethersproject/abi";
import { HederaERC20__factory, HTSTokenOwner__factory } from "../typechain-types";
//no mas de 18 decimales
export async function deployContracts(name:string, 
                                      symbol:string,
                                      decimals:number=6,
                                      initialSupply:number=0,
                                      maxSupply:number,
                                      memo:string,
                                      freeze:boolean=false) {
  console.log(`Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`);                                        
    

  let account = "0.0.28540472";
  let privateKey = "302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69";


  let wall = createWallet();
  const clientSdk = getClientSdk();

  let tokenContract = await deployContractHethers( HederaERC20__factory,wall)

  const tokenOwnerContract = await deployContractSDK(
    HTSTokenOwner__factory,
    10,
    privateKey,
    clientSdk,
  );
  

  


/*
    
  const tokenOwnerContract = await deployContractSDK(
    htsTokenOwnerBytecode,
    10,
    hreConfig.accounts[0].privateKey,
    clientOperatorForProperties
  );
  
  const hederaToken = await createToken(
    tokenOwnerContract,
    hreConfig.accounts[0].account,
    hreConfig.accounts[0].privateKey,
    hreConfig.accounts[0].publicKey
  );

  const tokenOwnerConnection = await hre.hethers.getContractAt(
    "HTSTokenOwner",
    tokenOwnerContract?.toSolidityAddress()
  );

  await tokenOwnerConnection.setERC20Address(deployedProxy.address, {
    gasLimit: 120000,
  });

  
  await contractProxy.setTokenAddress(
  //@ts-ignore
    ContractId.fromString(tokenOwnerContract).toSolidityAddress(),
  //@ts-ignore  
    TokenId.fromString(hederaToken.toString()).toSolidityAddress(),
    { gasLimit: 200000 }
  );
  await contractProxy.initialize({ gasLimit: 350000 });  
  return deployedProxy.address;
*/
}


function getClientSdk() {
  const clientSdk = Client.forTestnet();
  clientSdk.setOperator(
    "0.0.28540472",
    "302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69"
  );
  return clientSdk;
}

function createWallet() {
  const eoaAccount: any = {
    account: "0.0.28540472",
    privateKey: "302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69",
    isED25519Type: true
  };
  let wall = new hethers.Wallet(eoaAccount, hethers.providers.getDefaultProvider('testnet'));
  return wall;
}

async function createToken(
  contractId: any,
  accountId: string,
  privateKey: string,
  publicKey: string
) {
  const clientOperatorForProperties = Client.forTestnet();
  clientOperatorForProperties.setOperator(accountId, privateKey);

  let transaction = new TokenCreateTransaction()
    .setMaxTransactionFee(new Hbar(15))
    .setTokenName("tokenName")
    .setTokenSymbol("tokenSymbol")
    .setDecimals(2)
    .setTreasuryAccountId(AccountId.fromString(contractId.toString()))
    .setAdminKey(PublicKey.fromString(publicKey))
    .setFreezeKey(PublicKey.fromString(publicKey))
    .setWipeKey(PublicKey.fromString(publicKey))
    .setSupplyKey(DelegateContractId.fromString(contractId))
    .freezeWith(clientOperatorForProperties);
  const transactionSign = await transaction.sign(
    PrivateKey.fromStringED25519(privateKey)
  );
  const txResponse = await transactionSign.execute(
    clientOperatorForProperties
  );
  const receipt = await txResponse.getReceipt(clientOperatorForProperties);
  const tokenId = receipt.tokenId;
  return tokenId;
}

async function deployContractSDK(
  factory: any,
  chunks: any,
  privateKey: any,
  clientOperator: any,
  

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

async function  deployContractHethers(contractFactory:any,wallet:any){

  const factory = new hethers.ContractFactory(contractFactory.abi, contractFactory.bytecode, wallet);
  const contract = await factory.deploy({ gasLimit: 200000 });
  await contract.deployTransaction.wait();
  console.log( ` ${contractFactory.name } - address ${contract.address}`);
  return contract;
  
};

/*
getProvider(){
//Network y un account
}

getContractConection(){
  //recibir un wallet , un nombre de contrato y una direccion.
  //devolvera un contrato conectado 
}
/*
async function deployContractProxyWithHethers(account, bytecode, abiInterface, tokenContractId) {
  const wallet = await getWallet(account.accountId, '0x'.concat(account.privateECDSAKey.toStringRaw()));
  const factory = new hethers.ContractFactory(abiInterface, bytecode, wallet);
  const contract = await factory.deploy(tokenContractId,
                                        '0x',
                                        { gasLimit: 200000 });
  await contract.deployTransaction.wait();
  return contract;
}
*/
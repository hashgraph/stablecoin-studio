require("@hashgraph/hardhat-hethers");
import {hethers} from "@hashgraph/hethers";

import { TokenCreateTransaction,DelegateContractId, Hbar,  Client,  AccountId, PrivateKey,
  PublicKey, ContractCreateTransaction, FileCreateTransaction, FileAppendTransaction, ContractId, TokenId,TokenSupplyType
} from "@hashgraph/sdk";


import { HederaERC20__factory, HTSTokenOwner__factory, HederaERC1967Proxy__factory } from "../typechain-types";
//no mas de 18 decimales
export async function deployContracts(name:string, 
                                      symbol:string,
                                      decimals:number=6,
                                      initialSupply:number=0,
                                      maxSupply:number,
                                      memo:string,
                                      freeze:boolean=false) {
  console.log(`Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`);                                        
    

  let account    = "0.0.28540472";
  let privateKey = "302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69";
  let publicKey  ="302a300506032b657003210032c231261223d8667d841d7ca58abd9d0701eb03238a8ee4e5cdfba6925c3109";                                      

  let wall = createWallet();
  const clientSdk = getClientSdk();

  let tokenContract = await deployContractHethers( HederaERC20__factory,wall);

  let proxyContract = await deployContractHethers(HederaERC1967Proxy__factory,wall,tokenContract.address, "0x");

  let proxyHederaERC20conection = await connectToContract(wall,proxyContract.address,HederaERC20__factory.abi);
  await proxyHederaERC20conection.initialize({ gasLimit: 350000 });  

  const tokenOwnerContract = await deployContractSDK(
    HTSTokenOwner__factory,
    10,
    privateKey,
    clientSdk,
  );

  const hederaToken = await createToken(
    tokenOwnerContract,
    name, 
    symbol,
    decimals,
    initialSupply,
    maxSupply,
    memo,
    freeze,
    account,
    privateKey,
    publicKey,
    clientSdk
  );

  await proxyHederaERC20conection.setTokenAddress(
    //@ts-ignore
      ContractId.fromString(tokenOwnerContract).toSolidityAddress(),
    //@ts-ignore  
      TokenId.fromString(hederaToken.toString()).toSolidityAddress(),
      { gasLimit: 200000 }
    );

    let tokenOwnerConnection = await connectToContract(wall,tokenOwnerContract?.toSolidityAddress(),HTSTokenOwner__factory.abi);
    await tokenOwnerConnection.setERC20Address(proxyContract.address, {
      gasLimit: 120000,
    });

    return proxyContract.address;
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

async function  deployContractHethers(contractFactory:any,wallet:any,...args:any){

  const factory = new hethers.ContractFactory(contractFactory.abi, contractFactory.bytecode, wallet);
  const contract = await factory.deploy(...args,{ gasLimit: 200000 });
  await contract.deployTransaction.wait();
  console.log( ` ${contractFactory.name } - address ${contract.address}`);
  return contract;
  
};

async function connectToContract(wallet:any, address:any, abi:any) {

  return new hethers.Contract(address, abi, wallet);
}

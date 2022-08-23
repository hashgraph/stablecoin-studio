require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { TokenCreateTransaction, Hbar, DelegateContractId,  Client,  AccountId, PrivateKey,
  PublicKey, ContractCreateTransaction, FileCreateTransaction, FileAppendTransaction, ContractId, TokenId,
} from "@hashgraph/sdk";
import * as fs from "fs";
import { Interface } from "@ethersproject/abi";

const hre = require("hardhat");
let hreConfig = hre.network.config;

const htsTokenOwnerJson = JSON.parse(
  fs.readFileSync(
    "./artifacts/contracts/HTSTokenOwner.sol/HTSTokenOwner.json",
    "utf8"
  )
);
const htsTokenOwnerAbiInterface = new Interface(htsTokenOwnerJson.abi);
const htsTokenOwnerBytecode = htsTokenOwnerJson.bytecode;

export async function deployContracts() {
  
  const hederaERC20 = await hre.hethers.getContractFactory("HederaERC20");
  const deployedhederaERC20 = await hederaERC20.deploy();
  const contractErc20 = await hre.hethers.getContractAt(
    "HederaERC20",
    deployedhederaERC20.address
  );

  const proxy = await hre.hethers.getContractFactory("HederaERC1967Proxy");
  const deployedProxy = await proxy.deploy(deployedhederaERC20.address, "0x");
  const contractProxy = await hre.hethers.getContractAt(
    "HederaERC20",
    deployedProxy.address
  );

  const clientOperatorForProperties = Client.forTestnet();
  clientOperatorForProperties.setOperator(
    hreConfig.accounts[0].account,
    hreConfig.accounts[0].privateKey
  );
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
  bytecode: any,
  chunks: any,
  privateKey: any,
  clientOperator: any
) {
  const bytecodeFileId = await fileCreate(
    bytecode,
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
}

const { ContractFunctionParameters, ContractId, AccountId } = require("@hashgraph/sdk");
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const WIPE_ROLE : string = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3';

describe("Operations to WIPE tokens", function() {
  let proxyAddress:any;
  let client:any;
  let account;
  let privateKey;
  
  before(async function  () {
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;

    client = getClient();   
    client.setOperator(account, privateKey);
         
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("TOKEN-WIPE", "TM-WP", 2, 0, 3000000, "Hedera Accelerator Stable Coin (Wipe)");    
  });

  it("Admin account can grant wipeable role to an account", async function() {  
    let params: any[] = [WIPE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 400000, HederaERC20__factory.abi);  
   
    params = [WIPE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, client, 60000, HederaERC20__factory.abi);      
 
    expect(result[0]).to.equals(true);
  });

  it("Admin account can revoke wipeable role to an account", async function() {
    let params: any[] = [WIPE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 400000, HederaERC20__factory.abi);  

    params = [WIPE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeRole', params, client, 400000, HederaERC20__factory.abi);  

    params = [WIPE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, client, 60000, HederaERC20__factory.abi);      

    expect(result[0]).to.equals(false);
  });

  it("Should can wipe 10.000 tokens from an account with 20.000 tokens", async function() {  
    let params: any[] = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(),2000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);

    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(), 1000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi);
   
    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi);  
    
    expect(parseInt(result[0])).to.equals(1000000);
  });

  it("Should fail wipe if the account has not role the Wipe", async function() {
    const client2 = getClient();     
    const account2 = hreConfig.accounts[1].account;  
    const privateKey2 = hreConfig.accounts[1].privateKey; 
    client2.setOperator(account2, privateKey2);
    
    let params: any[] = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1300000, HederaERC20__factory.abi);  
   
    params = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress(),2000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    
    params = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress(), 1000000];      
    await expect(contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
      
  });

  it("Should fail wipe 10.000 from an account with 100 tokens", async function() {

    let params: any[] = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(),100000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);

    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(), 1000000];      
    await expect(contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;   
   
  });  

  it("After a wipe operation, the total supply has decreassed", async function() {

    let params: any[] = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(),3000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    
    params = [];  
    const resultBefore = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', params, client, 60000, HederaERC20__factory.abi);

    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(), 1000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi);
   
    params = [];  
    const resultAfter = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', params, client, 60000, HederaERC20__factory.abi);  
    
    expect(parseInt(resultAfter[0])).to.equals(Number(resultBefore[0])- 1000000);
  });
  
});

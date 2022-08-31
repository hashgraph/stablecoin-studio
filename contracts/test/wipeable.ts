import { ContractFunctionParameters, ContractId, AccountId } from "@hashgraph/sdk";
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

import dotenv from "dotenv";

describe("Operations to WIPE tokens", function() {
  let proxyAddress:any;
  let client:any;
  
  before(async function  () {
    client = getClient(process.env.OPERATOR_ID!, process.env.OPERATOR_PRIVATE_KEY!);      
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("TOKEN-WIPE", "TM-WP", 2, 0, 3000000, "Hedera Accelerator Stable Coin (Wipe)"); 
   
  });
  
  it("Should can wipe 10.000 tokens from an account with 20.000 tokens", async function() {
    let params: any[] = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client, 1300000, HederaERC20__factory.abi);  
    
    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(),2000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);

    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(), 1000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi);
   
    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi);  
    
    expect(parseInt(result[0])).to.equals(1000000);
  });

  it("Should fail wipe if the account has not role the Wipe", async function() {
    const client2 = getClient(process.env.OPERATOR_ID2!, process.env.OPERATOR_PRIVATE_KEY2!);   
    let params: any[] = [AccountId.fromString(process.env.OPERATOR_ID2!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1300000, HederaERC20__factory.abi);  
   
    params = [AccountId.fromString(process.env.OPERATOR_ID2!).toSolidityAddress(),2000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    
    params = [AccountId.fromString(process.env.OPERATOR_ID2!).toSolidityAddress(), 1000000];      
    await expect(contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
      
  });

  it("Should fail wipe 10.000 from an account with 100 tokens", async function() {
    let params: any[] = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client, 1300000, HederaERC20__factory.abi);  
    
    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(),100000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);

    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(), 1000000];      
    await expect(contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;   
   
  });  

  it("After a wipe operation, the total supply has decreassed", async function() {
    let params: any[] = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client, 1300000, HederaERC20__factory.abi);  
    
    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(),3000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    
    params = [];  
    const resultBefore = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', params, client, 60000, HederaERC20__factory.abi);

    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(), 1000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi);
   
    params = [];  
    const resultAfter = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', params, client, 60000, HederaERC20__factory.abi);  
    
    expect(parseInt(resultAfter[0])).to.equals(Number(resultBefore[0])- 1000000);
  });
});

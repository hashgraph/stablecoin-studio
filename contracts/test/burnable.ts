const { ContractId}  = require( "@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;

let proxyAddress:any;
let client:any;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;

describe("Cash out tokens", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 100000, 100000, "Hedera Accelerator Stable Coin");    
  });
  it("Can cash out 100 tokens from the treasury account having 100 tokens", async function() {
    const params : any = [100000];  
    await contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 400000, HederaERC20__factory.abi);  
    const resultTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  
    expect(Number(resultTotalSupply[0])).to.equals(0);
  });
  it("Cannot cash out 101 tokens from the treasury account having 100 tokens", async function() {
    const params : any = [101000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });
  it("User without supplier_role cannot cash out tokens", async function() {
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);      
    const params : any = [10000];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'burn', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
});
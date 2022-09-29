const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;

let proxyAddress:any;
let client:any;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;

describe("Cash in tokens with maxTotalSupply", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, 100000, "Hedera Accelerator Stable Coin");    
  });
  it("Can cash in 100 tokens to an account from a token with a 100 as maxTotalSupply", async function() {
    let params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 100000];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)  
    params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress()];  
    const resultBalanceOf = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(Number(resultBalanceOf[0])).to.equals(100000);
    const resultTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi)  
    expect(Number(resultTotalSupply[0])).to.equals(100000);
  });
  it("Cannot cash in 101 tokens to an account from a token with a 100 as maxTotalSupply", async function() {
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 101000];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
  it("User without supplier_role cannot cash in tokens", async function() {
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);      
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 1000];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
  it("Cannot cash in tokens to an account not associated to the token", async function() {
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 1000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });
});

describe("Cash in tokens without maxTotalSupply", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, null, "Hedera Accelerator Stable Coin");    
  });
  it("Should cash in 10000 tokens to an account from a token without maxTotalSupply", async function() {
    const params = [AccountId.fromString(OPERATOR_ID!).toSolidityAddress(), 10000000];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    const result = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi)  
    expect(Number(result[0])).to.equals(10000000);
  });
});

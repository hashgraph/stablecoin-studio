const { ContractId, AccountId }  = require( "@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const BURN_ROLE  = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22';


let proxyAddress:any;
let client:any;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;

describe("Burn tokens", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 100000, 100000, "Hedera Accelerator Stable Coin");    
  });
  it("Can burn 10 tokens from the treasury account having 100 tokens", async function() {
    const tokensToBurn = 1000;    
    const initialTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);      
    const params : any = [tokensToBurn];  
    await contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 400000, HederaERC20__factory.abi);  
    const totalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  
    expect(Number(totalSupply[0])).to.equals(Number(initialTotalSupply[0]) - tokensToBurn); 
  });
  it("Cannot burn more tokens than the treasury account has", async function() {
    const params : any = [101000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });
  it("User without burn role cannot burn tokens", async function() {
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);      
    const params : any = [1000];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'burn', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
  it("User with granted burn role can burn tokens", async function() {
    const tokensToBurn = 1000;    
    const initialTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  
    let params : any = [BURN_ROLE, AccountId.fromString(hreConfig.accounts[1].account!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 130000, HederaERC20__factory.abi);
    const client2 = getClient();
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);      
    params = [tokensToBurn];        
    await contractCall(ContractId.fromString(proxyAddress), 'burn', params, client2, 500000, HederaERC20__factory.abi);
    const totalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi); 
    expect(Number(totalSupply[0])).to.equals(Number(initialTotalSupply[0]) - tokensToBurn); 
  });  
});
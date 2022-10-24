const { ContractId, AccountId }  = require( "@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient, grantRole, revokeRole, checkRole } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const BURN_ROLE  = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22';


let proxyAddress:any;
let client:any;
let client2:any;
let client2account: string
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 100 * 10**TokenDecimals;
const MAX_SUPPLY = 1000 * 10**TokenDecimals;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant and revoke burnable role", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2account = hreConfig.accounts[1].account;
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);  

    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    
  });

  it("Admin account can grant burnable role to an account", async function() {    
    // Admin grants burn role : success    
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(BURN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke burnable role to an account", async function() {
    // Admin revokes burn role : success    
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await revokeRole(BURN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(BURN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(false);
  });

  it("Non Admin account can not grant burnable role to an account", async function() {   
    // Non Admin grants burn role : fail       
    await expect(grantRole(BURN_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.be.throw;

  });

  it("Non Admin account can not revoke burnable role to an account", async function() {
    // Non Admin revokes burn role : fail       
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await expect(revokeRole(BURN_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.be.throw;
  });


});

describe("Burn tokens", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);

    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    
  });

  it("Can burn 10 tokens from the treasury account having 100 tokens", async function() {
    const tokensToBurn = 10 * 10**TokenDecimals;   
    
    // Retrieve original total supply
    const initialTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);      

    // burn some tokens
    const params : any = [tokensToBurn];  
    await contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 400000, HederaERC20__factory.abi);  

    // check new total supply equals the original one minus burned tokens : success
    const currentTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  
    expect(Number(currentTotalSupply[0])).to.equals(Number(initialTotalSupply[0]) - tokensToBurn); 
  });

  it("Cannot burn more tokens than the treasury account has", async function() {
    // Retrieve original total supply
    const currentTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi); 
    
    // burn more tokens than original total supply : fail
    const params : any = [currentTotalSupply[0] + 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'burn', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });

  it("User without burn role cannot burn tokens", async function() {
    // Account without burn role, burns tokens : fail
    const params : any = [1];        
    await expect(contractCall(ContractId.fromString(proxyAddress), 'burn', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });

  it("User with granted burn role can burn tokens", async function() {
    const tokensToBurn = 1;    

    // Retrieve original total supply
    const initialTotalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi);  

    // Grant burn role to account
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
      
    // Burn tokens with newly granted account and check the new total supply : success
    let params = [tokensToBurn];        
    await contractCall(ContractId.fromString(proxyAddress), 'burn', params, client2, 500000, HederaERC20__factory.abi);
    const totalSupply = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', [], client, 60000, HederaERC20__factory.abi); 
    expect(Number(totalSupply[0])).to.equals(Number(initialTotalSupply[0]) - tokensToBurn); 
  });  
  
});
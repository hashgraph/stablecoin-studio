const { ContractId, AccountId }  = require( "@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";

import { expect } from "chai";
import { deployContractsWithSDK, getClient, grantRole, revokeRole, checkRole, getTotalSupply, Burn } from "../scripts/utils";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const BURN_ROLE  = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22';


let proxyAddress:any;
let client:any ;
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
    // Generate Client (token admin) and Client 2
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2account = hreConfig.accounts[1].account;
    client2.setOperator(client2account, hreConfig.accounts[1].privateKey);  

    // Deploy Token using Client
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

describe("Burnable role functionality", function() {

  before(async function  () {
    // Generate Client (token admin) and Client 2
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2account = hreConfig.accounts[1].account;
    client2.setOperator(client2account, hreConfig.accounts[1].privateKey); 

    // Deploy Token using Client
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    
  });

  it("Can burn 10 tokens from the treasury account having 100 tokens", async function() {
    const tokensToBurn = 10 * 10**TokenDecimals;   
    
    // Retrieve original total supply
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);

    // burn some tokens
    await Burn(ContractId, proxyAddress, tokensToBurn, client);

    // check new total supply equals the original one minus burned tokens : success
    const currentTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const expectedTotalSupply = initialTotalSupply - tokensToBurn;
    expect(currentTotalSupply).to.equals(expectedTotalSupply); 
  });

  it("Cannot burn more tokens than the treasury account has", async function() {
    // Retrieve original total supply
    const currentTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    
    // burn more tokens than original total supply : fail
    await expect(Burn(ContractId, proxyAddress, currentTotalSupply + 1, client)).to.be.throw;
  });

  it("User without burn role cannot burn tokens", async function() {
    // Account without burn role, burns tokens : fail
    await expect(Burn(ContractId, proxyAddress, 1, client2)).to.be.throw;
  });

  it("User with granted burn role can burn tokens", async function() {
    const tokensToBurn = 1;    

    // Retrieve original total supply
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);

    // Grant burn role to account
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
      
    // Burn tokens with newly granted account and check the new total supply : success
    await Burn(ContractId, proxyAddress, tokensToBurn, client2);
    const totalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    expect(totalSupply).to.equals(initialTotalSupply - tokensToBurn); 
  });  
  
});
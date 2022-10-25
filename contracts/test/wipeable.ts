const { ContractId, AccountId } = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
require("@hashgraph/sdk");

import { expect } from "chai";
import { deployContractsWithSDK_2, getClient, initializeClients} from "../scripts/utils";
import {grantRole, revokeRole, checkRole, Mint, Wipe, getBalanceOf, getTotalSupply} from "../scripts/contractsMethods";

let proxyAddress:any;
let client:any ;
let OPERATOR_ID: string;
let OPERATOR_KEY: string;
let OPERATOR_PUBLIC: string;

let client2:any;
let client2account: string;
let client2privatekey: string;
let client2publickey: string;

const WIPE_ROLE  = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3';
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 0;
const MAX_SUPPLY = 6000 * 10**TokenDecimals;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant and revoke wipe role", function() {

  before(async function  () {         
    // Generate Client (token admin) and Client 2
    [client,
      OPERATOR_ID, 
      OPERATOR_KEY,
      OPERATOR_PUBLIC,
      client2,
      client2account,
      client2privatekey,
      client2publickey] = initializeClients();
  
      // Deploy Token using Client
      proxyAddress = await deployContractsWithSDK_2(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY, 
        MAX_SUPPLY, 
        TokenMemo, 
        OPERATOR_ID, 
        OPERATOR_KEY, 
        OPERATOR_PUBLIC);       
  });

  it("Admin account can grant wipe role to an account", async function() {     
    // Admin grants wipe role : success 
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
    const result = await checkRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke wipe role to an account", async function() {
    // Admin revokes wipe role : success
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
    await revokeRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
    const result = await checkRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
    expect(result).to.equals(false);
  });  

  it("Non Admin account can not grant pauser role to an account", async function() {   
    // Non Admin grants wipe role : fail       
    await expect(grantRole(WIPE_ROLE, ContractId, proxyAddress, client2, client2account)).to.be.throw;

  });

  it("Non Admin account can not revoke pauser role to an account", async function() {
    // Non Admin revokes wipe role : fail       
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
    await expect(revokeRole(WIPE_ROLE, ContractId, proxyAddress, client2, client2account)).to.be.throw;
  });

});


describe("Operations to WIPE tokens", function() {

  before(async function  () {
    // Generate Client (token admin) and Client 2
    [client,
    OPERATOR_ID, 
    OPERATOR_KEY,
    OPERATOR_PUBLIC,
    client2,
    client2account,
    client2privatekey,
    client2publickey] = initializeClients();

    // Deploy Token using Client
    proxyAddress = await deployContractsWithSDK_2(
      TokenName, 
      TokenSymbol, 
      TokenDecimals, 
      INIT_SUPPLY, 
      MAX_SUPPLY, 
      TokenMemo, 
      OPERATOR_ID, 
      OPERATOR_KEY, 
      OPERATOR_PUBLIC);     
  });

  it("wipe 10 tokens from an account with 20 tokens", async function() {  
    const TokensToMint = 20 * 10**TokenDecimals;
    const TokensToWipe = 10 * 10**TokenDecimals;

    // Mint 20 tokens
    await Mint(ContractId, proxyAddress, TokensToMint, client, OPERATOR_ID)

    // Get the initial total supply and account's balanceOf
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const initialBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);  

    // Wipe 10 tokens
    await Wipe(ContractId, proxyAddress, TokensToWipe, client, OPERATOR_ID)

    // Check balance of account and total supply : success
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const finalBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);  
    const expectedTotalSupply = initialTotalSupply - TokensToWipe;
    const expectedBalanceOf = initialBalanceOf - TokensToWipe;
    
    expect(finalTotalSupply).to.equals(expectedTotalSupply);
    expect(finalBalanceOf).to.equals(expectedBalanceOf);
  });

  it("Wiping more than account's balance", async function() {
    const TokensToMint = 20 * 10**TokenDecimals;

    // Mint 20 tokens
    await Mint(ContractId, proxyAddress, TokensToMint, client, OPERATOR_ID)

    // Get the current balance for account
    const result = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);  

    // Wipe more than account's balance : fail
    await expect(Wipe(ContractId, proxyAddress, result + 1, client, OPERATOR_ID)).to.be.throw;
   
  });  

  it("Wiping from account without the wipe role", async function() {
    const TokensToMint = 20 * 10**TokenDecimals;

    // Mint 20 tokens   
    await Mint(ContractId, proxyAddress, TokensToMint, client, OPERATOR_ID)

    // Wipe with account that does not have the wipe role: fail
    await expect(Wipe(ContractId, proxyAddress, 1, client2, OPERATOR_ID)).to.be.throw;

  });

  it("User with granted wipe role can wipe tokens", async function() {
    const TokensToMint = 20 * 10**TokenDecimals;
    const TokensToWipe = 1;    

    // Mint 20 tokens   
    await Mint(ContractId, proxyAddress, TokensToMint, client, OPERATOR_ID)

    // Retrieve original total supply
    const initialBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);  
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);

    // Grant wipe role to account
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);

    // Wipe tokens with newly granted account
    await Wipe(ContractId, proxyAddress, TokensToWipe, client2, OPERATOR_ID);

    // Check final total supply and treasury account's balanceOf : success
    const finalBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);  
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const expectedFinalBalanceOf = initialBalanceOf - TokensToWipe;
    const expectedTotalSupply = initialTotalSupply - TokensToWipe;

    expect(finalBalanceOf).to.equals(expectedFinalBalanceOf); 
    expect(finalTotalSupply).to.equals(expectedTotalSupply); 
  });   

  
  
});

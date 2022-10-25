const { ContractId, AccountId }  = require( "@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";

import { expect } from "chai";
import { deployContractsWithSDK_2, initializeClients } from "../scripts/utils";
import {grantRole, revokeRole, checkRole, Burn, getBalanceOf, getTotalSupply} from "../scripts/contractsMethods";

const BURN_ROLE  = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22';


let proxyAddress:any;
let client:any ;
let OPERATOR_ID: string;
let OPERATOR_KEY: string;
let OPERATOR_PUBLIC: string;

let client2:any;
let client2account: string;
let client2privatekey: string;
let client2publickey: string;

const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 100 * 10**TokenDecimals;
const MAX_SUPPLY = 1000 * 10**TokenDecimals;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant and revoke burnable role", function() {

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

  it("Admin account can grant burnable role to an account", async function() {    
    // Admin grants burn role : success    
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
    const result = await checkRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke burnable role to an account", async function() {
    // Admin revokes burn role : success    
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
    await revokeRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
    const result = await checkRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
    expect(result).to.equals(false);
  });

  it("Non Admin account can not grant burnable role to an account", async function() {   
    // Non Admin grants burn role : fail       
    await expect(grantRole(BURN_ROLE, ContractId, proxyAddress, client2, client2account)).to.be.throw;

  });

  it("Non Admin account can not revoke burnable role to an account", async function() {
    // Non Admin revokes burn role : fail       
    await grantRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
    await expect(revokeRole(BURN_ROLE, ContractId, proxyAddress, client2, client2account)).to.be.throw;
  });


});

describe("Burnable role functionality", function() {

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

  it("Can burn 10 tokens from the treasury account having 100 tokens", async function() {
    const tokensToBurn = INIT_SUPPLY / 10;   
    
    // Get the initial total supply and treasury account's balanceOf
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);

    // burn some tokens
    await Burn(ContractId, proxyAddress, tokensToBurn, client);

    // check new total supply and balance of treasury account : success
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const expectedTotalSupply = initialTotalSupply - tokensToBurn;

    expect(finalTotalSupply).to.equals(expectedTotalSupply); 
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
      
    // Burn tokens with newly granted account
    await Burn(ContractId, proxyAddress, tokensToBurn, client2);

    // Check final total supply and treasury account's balanceOf : success
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const expectedTotalSupply = initialTotalSupply - tokensToBurn;

    expect(finalTotalSupply).to.equals(expectedTotalSupply); 
  });  
  
});
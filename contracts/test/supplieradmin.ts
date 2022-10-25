const { ContractId, AccountId } = require("@hashgraph/sdk");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

import "@hashgraph/hardhat-hethers";


import { deployContractsWithSDK, initializeClients } from "../scripts/utils";
import {decreaseSupplierAllowance,
  grantSupplierRole,
  grantUnlimitedSupplierRole,
  increaseSupplierAllowance,
  isUnlimitedSupplierAllowance,
  resetSupplierAllowance,
  revokeSupplierRole,
  supplierAllowance,
  associateToken,
  getTotalSupply,
  getBalanceOf
} from "../scripts/contractsMethods";
import { Mint } from "scripts/contractsMethods";

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
const INIT_SUPPLY = 0;
const MAX_SUPPLY = 1000 * 10**TokenDecimals;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant, revoke, increase, decrease and reset cashin role (limited and unlimited)", function() {

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
      proxyAddress = await deployContractsWithSDK(
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

  it("Admin account can grant and revoke supplier(s) role to an account", async function() {
    const cashInLimit = 1;   

    // Admin grants limited supplier role : success
    let result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(result).to.eq(0);

    await grantSupplierRole(ContractId, proxyAddress, cashInLimit, client, client2account);

    result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(result).to.eq(cashInLimit);
    
    // Admin revokes limited supplier role : success
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);
    result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(result).to.eq(0);

    // Admin grants unlimited supplier role : success
    let isUnlimited = await isUnlimitedSupplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(isUnlimited).to.eq(false);

    await grantUnlimitedSupplierRole(ContractId, proxyAddress, client, client2account);

    isUnlimited = await isUnlimitedSupplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(isUnlimited).to.eq(true);

    // Admin revokes unlimited supplier role : success
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);
    isUnlimited = await isUnlimitedSupplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(isUnlimited).to.eq(false);
    
  });

  it("Admin account can increase, decrease and reset supplier(s) amount", async function() {   
    const cashInLimit = 1;   
    const amount = 1;  

    // Admin increases supplier allowance : success
    await grantSupplierRole(ContractId, proxyAddress, cashInLimit, client, client2account);
    await increaseSupplierAllowance(ContractId, proxyAddress, amount, client, client2account);
    let result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    let expectedAmount = cashInLimit + amount;
    expect(result).to.eq(expectedAmount);

    // Admin decreases supplier allowance : success
    await decreaseSupplierAllowance(ContractId, proxyAddress, amount, client, client2account);
    result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    expectedAmount = cashInLimit;
    expect(result).to.eq(expectedAmount);

    // Admin resets supplier allowance : success
    await resetSupplierAllowance(ContractId, proxyAddress, client, client2account);
    result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    expectedAmount = 0;
    expect(result).to.eq(expectedAmount);

    // Remove the supplier role for further testing.....
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);
  });

  it("Non Admin account can not grant nor revoke supplier(s) role to an account", async function() {      
    const cashInLimit = 1;   

    // Non admin grants limited supplier role : fail
    await expect(grantSupplierRole(ContractId, proxyAddress, cashInLimit, client2, client2account)).to.eventually.be.rejectedWith(Error);
    
    // Non admin grants unlimited supplier role : fail
    await expect(grantUnlimitedSupplierRole(ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // Non admin revokes limited supplier role : fail
    await grantSupplierRole(ContractId, proxyAddress, cashInLimit, client, client2account);
    await expect(revokeSupplierRole(ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // Non admin revokes unlimited supplier role : fail
    await grantUnlimitedSupplierRole(ContractId, proxyAddress, client, client2account);
    await expect(revokeSupplierRole(ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // Remove the supplier role for further testing.....
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);

  });

  it("Non Admin account can not increase, decrease and reset supplier(s) amount", async function() {   
    const cashInLimit = 10;   
    const amount = 1;  

    // Non Admin increases supplier allowance : fail
    await grantSupplierRole(ContractId, proxyAddress, cashInLimit, client, client2account);
    await expect(increaseSupplierAllowance(ContractId, proxyAddress, amount, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // non Admin decreases supplier allowance : fail
    await expect(decreaseSupplierAllowance(ContractId, proxyAddress, amount, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // Non Admin resets supplier allowance : fail
    await expect(resetSupplierAllowance(ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // Remove the supplier role for further testing.....
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);

  });


});

describe("Grant unlimited supplier role and test its cashin right, maxsupply limit and role immutability", function() {

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
      proxyAddress = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY, 
        MAX_SUPPLY, 
        TokenMemo, 
        OPERATOR_ID, 
        OPERATOR_KEY, 
        OPERATOR_PUBLIC);      
    
    // Grant unlimited supplier role
    await grantUnlimitedSupplierRole(ContractId, proxyAddress, client, client2account);

    // Associate account to token
    await associateToken(ContractId, proxyAddress, client2, client2account);
  });

  it("An account with unlimited supplier role can cash in 100 tokens", async function() {
    const AmountToMint = 100 * 100**TokenDecimals;

    // Get the initial total supply and account's balanceOf
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const initialBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, client2account);  

    // Cashin tokens to previously associated account
    await Mint(ContractId, proxyAddress, AmountToMint, client2, client2account);

    // Check balance of account and total supply : success
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const finalBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, client2account);  
    const expectedTotalSupply = initialTotalSupply + AmountToMint;
    const expectedBalanceOf = initialBalanceOf + AmountToMint;
    
    expect(finalTotalSupply).to.equals(expectedTotalSupply);
    expect(finalBalanceOf).to.equals(expectedBalanceOf);
  });

  it("An account with unlimited supplier role can not cash in more than maxSupply tokens", async function() {
    // Retrieve current total supply
    const TotalSupply = await getTotalSupply(ContractId, proxyAddress, client);

    // Cashin more tokens than max supply : fail 
    await expect(Mint(ContractId, proxyAddress, MAX_SUPPLY - TotalSupply + 1, client2, client2account)).to.eventually.be.rejectedWith(Error);
  }); 

  it("An account with unlimited supplier role can not be granted limited supplier role", async function() {
    // Grant limited supplier role to account with unlimited supplier role : fail
    await expect(grantSupplierRole(ContractId, proxyAddress, 1, client, client2account)).to.eventually.be.rejectedWith(Error);
  });   

  it("An account with unlimited supplier role, but revoked, can not cash in anything at all", async function() {
    // Revoke unlimited supplier role
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);

    // Cashin 1 token : fail
    await expect(Mint(ContractId, proxyAddress, 1, client2, client2account)).to.eventually.be.rejectedWith(Error);
  });

});

describe("Grant limited supplier role and test its cashin right and cashin/maxsupply limits", function() {

  const cashInLimit = 100 * 10**TokenDecimals;

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
      proxyAddress = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY, 
        MAX_SUPPLY, 
        TokenMemo, 
        OPERATOR_ID, 
        OPERATOR_KEY, 
        OPERATOR_PUBLIC);      
       
    // Associate account to token
    await associateToken(ContractId, proxyAddress, client2, client2account); 
  });

  beforeEach(async function () {
    // Reset cash in limit for account with limited supplier role
    await grantSupplierRole(ContractId, proxyAddress, cashInLimit, client, client2account);
  });

  it("An account with supplier role and an allowance of 100 tokens can cash in 100 tokens", async function() {   
    const AmountToMint = cashInLimit;

    // Get the initial total supply and account's balanceOf
    const initialTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const initialBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, client2account);  

    // Cashin tokens to previously associated account
    await Mint(ContractId, proxyAddress, AmountToMint, client2, client2account);

    // Check balance of account and total supply : success
    const finalTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);
    const finalBalanceOf = await getBalanceOf(ContractId, proxyAddress, client, client2account);  
    const expectedTotalSupply = initialTotalSupply + AmountToMint;
    const expectedBalanceOf = initialBalanceOf + AmountToMint;
    
    expect(finalTotalSupply).to.equals(expectedTotalSupply);
    expect(finalBalanceOf).to.equals(expectedBalanceOf);
  });  

  it("An account with supplier role and an allowance of 90 tokens can not cash in 91 tokens", async function() {
    const cashInDecreaseAmount = 10000;
    
    // decrease allowance
    await decreaseSupplierAllowance(ContractId, proxyAddress, cashInDecreaseAmount, client, client2account);
    
    // Cashin more token than allowed : fail
    await expect(Mint(ContractId, proxyAddress, cashInLimit - cashInDecreaseAmount + 1, client2, client2account)).to.eventually.be.rejectedWith(Error);  
  });    

  it("An account with supplier role and an allowance of (100 + maxsupply) tokens can not cash more than maxSupply tokens", async function() {
    // Increase total allowance by maxsupply
    await increaseSupplierAllowance(ContractId, proxyAddress, MAX_SUPPLY, client, client2account);

    // Cashin maxsupply + 1 token : fail
    await expect(Mint(ContractId, proxyAddress, MAX_SUPPLY + 1, client2, client2account)).to.eventually.be.rejectedWith(Error);  
  });     

  it("An account with supplier role and an allowance of 100 tokens, can mint 90 tokens but, later on, cannot mint 11 tokens", async function() {
    const amountToMintlater = 10 * 10**TokenDecimals;  

    // Cashin all allowed token minus "amountToMintLater"
    await Mint(ContractId, proxyAddress, cashInLimit - amountToMintlater, client2, client2account);

    // Cashin the remaining allowed tokens (amountToMintLater) + 1 token :fail
    await expect(Mint(ContractId, proxyAddress, amountToMintlater + 1, client2, client2account)).to.eventually.be.rejectedWith(Error);  
  });    

  it("An account with supplier role will reset allowance when unlimited supplier role is granted", async function() {
    // Grant unlimited supplier role
    await grantUnlimitedSupplierRole(ContractId, proxyAddress, client, client2account);

    // Check that supplier Allowance was not set
    const result = await supplierAllowance(ContractId, proxyAddress, client2, client2account);
    expect(result).to.eq(0);
  });   

  it("An account with supplier role, but revoked, can not cash in anything at all", async function() {
    // Revoke supplier role
    await revokeSupplierRole(ContractId, proxyAddress, client, client2account);

    // Cashin 1 token : fail
    await expect(Mint(ContractId, proxyAddress, 1, client2, client2account)).to.eventually.be.rejectedWith(Error);
  });

});


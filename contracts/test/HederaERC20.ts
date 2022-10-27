
const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

import { deployContractsWithSDK, initializeClients } from "../scripts/utils";
import {name, 
  symbol, 
  decimals, 
  initialize, 
  associateToken, 
  dissociateToken, 
  Mint, 
  Wipe,
  getTotalSupply, 
  getBalanceOf} from "../scripts/contractsMethods";

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
const TokenFactor = BigNumber.from(10).pow(TokenDecimals);
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("HederaERC20 Tests", function() {
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
        INIT_SUPPLY.toString(), 
        MAX_SUPPLY.toString(), 
        TokenMemo, 
        OPERATOR_ID, 
        OPERATOR_KEY, 
        OPERATOR_PUBLIC);    
    });   
  
  it("input parmeters check", async function() {
    // We retreive the Token basic params
    const retrievedTokenName = await name(ContractId, proxyAddress, client);
    const retrievedTokenSymbol = await symbol(ContractId, proxyAddress, client);
    const retrievedTokenDecimals = await decimals(ContractId, proxyAddress, client);
    const retrievedTokenTotalSupply = await getTotalSupply(ContractId, proxyAddress, client);

    // We check their values : success
    expect(retrievedTokenName).to.equals(TokenName);
    expect(retrievedTokenSymbol).to.equals(TokenSymbol);
    expect(retrievedTokenDecimals).to.equals(TokenDecimals);  
    expect(retrievedTokenTotalSupply.toString()).to.equals(INIT_SUPPLY.toString());   
 
  });

  it("Only Account can associate and dissociate itself when balance is 0", async function() {
    const amount = BigNumber.from(1);

    // associate a token to an account : success
    await associateToken(ContractId, proxyAddress, client2, client2account);

    // We mint tokens to that account and check supply and balance: success
    await Mint(ContractId, proxyAddress, amount, client, client2account);

    // dissociate the token from the account when balance is not 0 : fail
    await expect(dissociateToken(ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);

    // We wipe amount in account to be able to dissociate
    const Balance = await getBalanceOf(ContractId, proxyAddress, client, client2account);
    await Wipe(ContractId, proxyAddress, Balance, client, client2account);

    // dissociate the token from the account : success
    await dissociateToken(ContractId, proxyAddress, client2, client2account);

    // associate a token to an account using another account : fail
    await expect(associateToken(ContractId, proxyAddress, client, client2account)).to.eventually.be.rejectedWith(Error);

    // associate a token to an account again : success
    await associateToken(ContractId, proxyAddress, client2, client2account);

    // dissociate the token from the account using another account : fail
    await expect(dissociateToken(ContractId, proxyAddress, client, client2account)).to.eventually.be.rejectedWith(Error);

    // reset
    await dissociateToken(ContractId, proxyAddress, client2, client2account);
  });

  it("Associate and Dissociate Token", async function() {
    const amountToMint = BigNumber.from(1);

    // First we associate a token to an account
    const initialSupply =  await getTotalSupply(ContractId, proxyAddress, client);
    const initialBalance = await getBalanceOf(ContractId, proxyAddress, client, client2account);
    await associateToken(ContractId, proxyAddress, client2, client2account);

    // We mint tokens to that account and check supply and balance: success
    await Mint(ContractId, proxyAddress, amountToMint, client, client2account);
    let newSupply =  await getTotalSupply(ContractId, proxyAddress, client);
    let newBalance = await getBalanceOf(ContractId, proxyAddress, client, client2account);

    let expectedNewSupply = initialSupply.add(amountToMint);
    let expectedNewBalance = initialBalance.add(amountToMint);

    expect(expectedNewSupply.toString()).to.equals(newSupply.toString());  
    expect(expectedNewBalance.toString()).to.equals(newBalance.toString());  

    // We wipe amount in account to be able to dissociate
    await Wipe(ContractId, proxyAddress, newBalance, client, client2account);

    // We dissociate the token from the account
    await dissociateToken(ContractId, proxyAddress, client2, client2account);

    // We mint tokens to that account : fail
    await expect(Mint(ContractId, proxyAddress, amountToMint, client,client2account)).to.eventually.be.rejectedWith(Error);

    newSupply =  await getTotalSupply(ContractId, proxyAddress, client);
    newBalance = await getBalanceOf(ContractId, proxyAddress, client, client2account);
    expect(initialSupply.toString()).to.equals(newSupply.toString());  
    expect("0").to.equals(newBalance.toString());  

  });

  it("Check initialize can only be run once", async function(){
    // Initiliaze : fail
    await expect(initialize(ContractId, proxyAddress, client)).to.eventually.be.rejectedWith(Error);
  });

});

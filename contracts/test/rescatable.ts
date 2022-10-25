const  { ContractId, AccountId }  = require("@hashgraph/sdk");
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import {grantRole, revokeRole, checkRole} from "../scripts/contractsMethods";

import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
let client: any;
let client2:any;
let client2account: string
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;
const RESCUE_ROLE  = '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a';
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 20000 * 10**TokenDecimals;
const MAX_SUPPLY = 20000 * 10**TokenDecimals;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant and revoke rescatable role", function() {
  let proxyAddress:any;

  let account:string;
  let privateKey:string;

  before(async function  () {         
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
    client = getClient();
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    
    client2 = getClient();
    client2account = hreConfig.accounts[1].account;
    client2.setOperator(hreConfig.accounts[1].account, hreConfig.accounts[1].privateKey);

    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    

  });

  it("Admin account can grant and revoke rescatable role to an account", async function() {     
    // Admin grants rescue role : success 
    await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(RESCUE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke rescatable role to an account", async function() {
    // Admin revokes rescue role : success
    await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(RESCUE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(false);
  });  

  it("Non Admin account can not grant rescatable role to an account", async function() {   
    // Non Admin grants rescue role : fail       
    await expect(grantRole(RESCUE_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.eventually.be.rejectedWith(Error);

  });

  it("Non Admin account can not revoke rescatable role to an account", async function() {
    // Non Admin revokes rescue role : fail       
    await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await expect(revokeRole(RESCUE_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.eventually.be.rejectedWith(Error);
  });

});

describe("Rescatable", function() {
  let proxyAddress:any;
  const client:any = getClient();
  let account:string;
  let privateKey:string;

  before(async function  () {         
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
    client.setOperator(account, privateKey);
   
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo); 
  });

  it("Should rescue 10.000 token", async function() {
       
    let params: any[] = [];  
    const response = await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, HederaERC20__factory.abi) 
    const tokenOwnerAddress = response[0] 
   
    params = [tokenOwnerAddress];  
    await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    
    params = [10000000];  
    await contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 140000, HederaERC20__factory.abi)  
    
    params = [tokenOwnerAddress];  
    const balance = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(parseInt(balance[0])).to.equals(10000000)

    params = [AccountId.fromString(account).toSolidityAddress()];  
    const balanceAdm = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(parseInt(balanceAdm[0])).to.equals(10000000)
  });

  it("I cannot rescue 11.000 from an account with 10.000 tokens", async function() {
    let params: any[] = [];  
    await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, HederaERC20__factory.abi) 
           
    params = [11000000];      
    await expect ( contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, HederaERC20__factory.abi)).to.eventually.be.rejectedWith(Error);

  });

  it("If the rescue key is not set, the option is disabled", async function() {
    const client1:any = getClient();
    const account1 = hreConfig.accounts[1].account;
    const privateKey1 = hreConfig.accounts[1].privateKey;
    client1.setOperator(account1, privateKey1);
    
    let params: any[] = [];  
    await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client1, 1300000, HederaERC20__factory.abi) 
       
    params = [10000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, HederaERC20__factory.abi)).to.eventually.be.rejectedWith(Error);

  });
  
});

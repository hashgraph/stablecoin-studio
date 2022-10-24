const { ContractId, AccountId } = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";


import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;

let proxyAddress:any;
let client:any;
let client2:any;
let client2address:string;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 0;
const MAX_SUPPLY = 1000000;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant, revoke, increase, decrease and reset supplier role (limited and unlimited)", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2address = hreConfig.accounts[1].account;
    client2.setOperator(client2address!, hreConfig.accounts[1].privateKey);  

    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    
  });

  it("Admin account can grant and revoke supplier(s) role to an account", async function() {
    const cashInLimit = 1;   

    // Admin grants limited supplier role : success
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(cashInLimit);
    
    // Admin revokes limited supplier role : success
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(0);

    // Admin grants unlimited supplier role : success
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'isUnlimitedSupplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(result[0]).to.eq(true);

    // Admin revokes unlimited supplier role : success
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'isUnlimitedSupplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(result[0]).to.eq(false);
    
  });

  it("Admin account can increase, decrease and reset supplier(s) amount", async function() {   
    const cashInLimit = 1;   
    const amount = 1;  

    // Admin increases supplier allowance : success
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress(), amount];  
    await contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(cashInLimit + amount);

    // Admin decreases supplier allowance : success
    params = [AccountId.fromString(client2address!).toSolidityAddress(), amount];  
    await contractCall(ContractId.fromString(proxyAddress), 'decreaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(cashInLimit);

    // Admin resets supplier allowance : success
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'resetSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client2, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(0);
  });

  it("Non Admin account can not grant nor revoke supplier(s) role to an account", async function() {      
    const cashInLimit = 1;   

    // Non admin grants limited supplier role : fail
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client2, 130000, HederaERC20__factory.abi)).to.be.throw;
    
    // Non admin grants unlimited supplier role : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client2, 130000, HederaERC20__factory.abi)).to.be.throw;

    // Non admin revokes limited supplier role : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client2, 130000, HederaERC20__factory.abi)).to.be.throw;

    // Non admin revokes unlimited supplier role : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi)).to.be.throw;

    // Remove the unlimited supplier role for further testing.....
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    
  });

  it("Non Admin account can not increase, decrease and reset supplier(s) amount", async function() {   
    const cashInLimit = 1;   
    const amount = 1;  

    // Non Admin increases supplier allowance : fail
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    params = [AccountId.fromString(client2address!).toSolidityAddress(), amount];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client2, 130000, HederaERC20__factory.abi)).to.be.throw;

    // non Admin decreases supplier allowance : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress(), amount];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'decreaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi)).to.be.throw;

    // Non Admin resets supplier allowance : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'resetSupplierAllowance', params, client, 130000, HederaERC20__factory.abi)).to.be.throw;
  });


});

describe("Grant unlimited supplier role and test its cashin right, maxsupply limit and role immutability", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2address = hreConfig.accounts[1].account;
    client2.setOperator(client2address!, hreConfig.accounts[1].privateKey!);
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo); 
    
    // Grant unlimited supplier role
    const params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });

  it("An account with unlimited supplier role can cash in 100 tokens", async function() {
    // Associate account to token
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);
    
    // Cashin tokens to previously associated account : success
    params = [AccountId.fromString(client2address!).toSolidityAddress(), 100000];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi);
    expect(result[0]).to.eq(true);  
  });

  it("An account with unlimited supplier role can not cash in more than maxSupply tokens", async function() {
    // Cashin more tokens than max supply : fail
    let params = [AccountId.fromString(client2address!).toSolidityAddress(), MAX_SUPPLY + 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  }); 

  it("An account with unlimited supplier role can not be granted limited supplier role", async function() {
    // Grant limited supplier role to account with unlimited supplier role : fail
    const params : any = [AccountId.fromString(client2address!).toSolidityAddress(), 100000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi)).to.be.throw;
  });   

});


describe("Grant limited supplier role and test its cashin right and cashin/maxsupply limits", function() {

  const cashInLimit = 100000;

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2address = hreConfig.accounts[1].account;
    client2.setOperator(client2address!, hreConfig.accounts[1].privateKey!);
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, MAX_SUPPLY, TokenMemo);    

    // Associate account to token
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);  
  });

  beforeEach(async function () {
    // Reset cash in limit for account with limited supplier role
    const params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });

  it("An account with supplier role and an allowance of 100 tokens can cash in 100 tokens", async function() {   
    // Cashin the total allowance : success
    let params = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    let result = await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi);
    expect(result[0]).to.equals(true);  
  });  

  it("An account with supplier role and an allowance of 90 tokens can not cash in 91 tokens", async function() {
    // decrease allowance
    const cashInDecreaseAmount = 10000;
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInDecreaseAmount];  
    await contractCall(ContractId.fromString(proxyAddress), 'decreaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);  
    
    // Cashin more token than allowed : fail
    const cashInOverAmount = 1000;
    params = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit - cashInDecreaseAmount + cashInOverAmount];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });    

  it("An account with supplier role and an allowance of (100 + maxsupply) tokens can not cash more than maxSupply tokens", async function() {
    // Increase total allowance by maxsupplu
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress(), MAX_SUPPLY];  
    await contractCall(ContractId.fromString(proxyAddress), 'increaseSupplierAllowance', params, client, 130000, HederaERC20__factory.abi);

    // Cashin maxsupply + 1 token : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress(), MAX_SUPPLY + 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });     


  it("An account with supplier role and an allowance of 100 tokens, can mint 90 tokens but, later on, cannot mint 11 tokens", async function() {
    const amountToMintlater = 10000;  

    // Cashin all allowed token minus "amountToMintLater"
    let params = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit - amountToMintlater];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi);

    // Cashin the remaining allowed tokens (amountToMintLater) + 1 token :fail
    params = [AccountId.fromString(client2address!).toSolidityAddress(), amountToMintlater + 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;  
  });    

  it("An account with supplier role will reset allowance when unlimited supplier role is granted", async function() {
    // Grant unlimited supplier role
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);

    // Check that supplier Allowance was not set
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'supplierAllowance', params, client, 60000, HederaERC20__factory.abi);
    expect(Number(result[0])).to.eq(0);
  });   

});


describe("Revoke limited supplier role", function() {

  const cashInLimit = 100000;

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2address = hreConfig.accounts[1].account;
    client2.setOperator(client2address!, hreConfig.accounts[1].privateKey!);
  
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, null, TokenMemo);  
    
    // Grant limited supplier role
    const params : any = [AccountId.fromString(client2address!).toSolidityAddress(), cashInLimit];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });

  it("An account with supplier role and an allowance of 100 tokens, but revoked, can not cash in anything at all", async function() {
    // Revoke limited supplier role
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    
    // Associate token to account
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);

    // Cashin 1 token : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress(), 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });

});

describe("Revoke unlimited supplier role", function() {

  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    client2 = getClient();
    client2address = hreConfig.accounts[1].account;
    client2.setOperator(client2address!, hreConfig.accounts[1].privateKey!);
 
    proxyAddress = await deployContractsWithSDK(TokenName, TokenSymbol, TokenDecimals, INIT_SUPPLY, null, TokenMemo);    

    // Grant unlimited supplier role
    const params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantUnlimitedSupplierRole', params, client, 130000, HederaERC20__factory.abi);
  });

  it("An account with unlimited supplier role, but revoked, can not cash in anything at all", async function() {
    // Revoke unlimited supplier role
    let params : any = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeSupplierRole', params, client, 130000, HederaERC20__factory.abi);
    
    // Associate token to account
    params = [AccountId.fromString(client2address!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1800000, HederaERC20__factory.abi);

    // Cashin 1 token : fail
    params = [AccountId.fromString(client2address!).toSolidityAddress(), 1];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'mint', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
  });
  
});

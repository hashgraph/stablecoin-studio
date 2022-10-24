const { ContractId, AccountId } = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
require("@hashgraph/sdk");

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient, grantRole,  revokeRole, checkRole} from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
let client: any;
let client2:any;
let client2account: string
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;
const WIPE_ROLE  = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3';
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 0;
const MAX_SUPPLY = 1;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant and revoke wipe role", function() {
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

  it("Admin account can grant and revoke wipe role to an account", async function() {     
    // Admin grants wipe role : success 
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(WIPE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke pauser role to an account", async function() {
    // Admin revokes wipe role : success
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await revokeRole(WIPE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(WIPE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(false);
  });  

  it("Non Admin account can not grant pauser role to an account", async function() {   
    // Non Admin grants wipe role : fail       
    await expect(grantRole(WIPE_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.be.throw;

  });

  it("Non Admin account can not revoke pauser role to an account", async function() {
    // Non Admin revokes wipe role : fail       
    await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await expect(revokeRole(WIPE_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.be.throw;
  });

});


describe("Operations to WIPE tokens", function() {
  let proxyAddress:any;
  let client:any;
  let account;
  let privateKey;
  
  before(async function  () {
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;

    client = getClient();   
    client.setOperator(account, privateKey);
         
 
    proxyAddress = await deployContractsWithSDK("TOKEN-WIPE", "TM-WP", 2, 0, 6000000, "Hedera Accelerator Stable Coin (Wipe)");    
  });

  it("Should can wipe 10.000 tokens from an account with 20.000 tokens", async function() {  
    let params: any[] = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(),2000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);

    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(), 1000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi);
   
    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi);  
    
    expect(parseInt(result[0])).to.equals(1000000);
  });

  it("Should fail wipe if the account has not role the Wipe", async function() {
    const client2 = getClient();     
    const account2 = hreConfig.accounts[1].account;  
    const privateKey2 = hreConfig.accounts[1].privateKey; 
    client2.setOperator(account2, privateKey2);
    
    let params: any[] = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client2, 1300000, HederaERC20__factory.abi);  
   
    params = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress(),2000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    
    params = [AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress(), 1000000];      
    await expect(contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client2, 400000, HederaERC20__factory.abi)).to.be.throw;
      
  });

  it("Should fail wipe 1.000 from an account with 100 tokens", async function() {

    let params: any[] = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(),100000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);

    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(), 1000000];      
    await expect(contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi)).to.be.throw;   
   
  });  

  it("After a wipe operation, the total supply has decreassed", async function() {

    let params: any[] = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(),3000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi);
    
    params = [];  
    const resultBefore = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', params, client, 60000, HederaERC20__factory.abi);

    params = [AccountId.fromString(hreConfig.accounts[0].account).toSolidityAddress(), 1000000];      
    await contractCall(ContractId.fromString(proxyAddress), 'wipe', params, client, 400000, HederaERC20__factory.abi);
   
    params = [];  
    const resultAfter = await contractCall(ContractId.fromString(proxyAddress), 'totalSupply', params, client, 60000, HederaERC20__factory.abi);  
    
    expect(parseInt(resultAfter[0])).to.equals(Number(resultBefore[0])- 1000000);
  });
  
});

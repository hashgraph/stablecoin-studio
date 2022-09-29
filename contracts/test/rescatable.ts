const  { ContractId, AccountId }  = require("@hashgraph/sdk");
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect} from "chai";

import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const RESCUE_ROLE  = '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a';

describe("Rescatable", function() {
  let proxyAddress:any;
  const client:any = getClient();
  let account:string;
  let privateKey:string;

  before(async function  () {         
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
    client.setOperator(account, privateKey);
   
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 20000000, 20000000, "Hedera Accelerator Stable Coin"); 
  });
  it("Admin account can grant rescue role to an account", async function() {          

    let params: any[] = [RESCUE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 400000, HederaERC20__factory.abi);  
   
    params = [RESCUE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, client, 60000, HederaERC20__factory.abi);      
 
    expect(result[0]).to.equals(true);
  });
  it("Admin account can revoke rescue role to an account", async function() {    
    let params: any[] = [RESCUE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 400000, HederaERC20__factory.abi);  

    params = [RESCUE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeRole', params, client, 400000, HederaERC20__factory.abi);  

    params = [RESCUE_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, client, 60000, HederaERC20__factory.abi);      

    expect(result[0]).to.equals(false);
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
    await expect ( contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, HederaERC20__factory.abi)).to.be.throw;

  });

  it("If the rescue key is not set, the option is disabled", async function() {
    const client1:any = getClient();
    const account1 = hreConfig.accounts[1].account;
    const privateKey1 = hreConfig.accounts[1].privateKey;
    client1.setOperator(account1, privateKey1);
    
    let params: any[] = [];  
    await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client1, 1300000, HederaERC20__factory.abi) 
       
    params = [10000];  
    await expect(contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, HederaERC20__factory.abi)).to.be.throw;

  });
  
});

import { ContractId, AccountId } from "@hashgraph/sdk";
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect} from "chai";

import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat"); 

const hreConfig = hre.network.config;

describe("Rescatable", function() {
  let proxyAddress:any;
  let client:any = getClient();;
  let contractProxy: { name: (arg0: { gasLimit: number; }) => any; symbol: (arg0: { gasLimit: number; }) => any; decimals: (arg0: { gasLimit: number; }) => any; };
  let account:string;
  let privateKey:string;

  before(async function  () {
         
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
    client.setOperator(account, privateKey);

  });
  beforeEach(async function () {
    
  });
  it("Should rescue 10000 token", async function() {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 20000000, 20000000, "Hedera Accelerator Stable Coin");    
    let params: any[] = [];  
    const response = await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, HederaERC20__factory.abi) 
    const tokenOwnerAddress = response[0] 
   
    params = [tokenOwnerAddress];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    
    params = [10000000];  
    await contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 140000, HederaERC20__factory.abi)  
    
    params = [tokenOwnerAddress];  
    let balance = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(parseInt(balance[0])).to.equals(10000000)

    params = [AccountId.fromString(account).toSolidityAddress()];  
    let balanceAdm = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(parseInt(balanceAdm[0])).to.equals(10000000)
  });

  it("I cannot rescue 10.000 from an account with 100 tokens", async function() {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 100000, 20000000, "Hedera Accelerator Stable Coin");    
    let params: any[] = [];  
    const response = await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, HederaERC20__factory.abi) 
    const tokenOwnerAddress = response[0] 
   
    params = [tokenOwnerAddress];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    
    params = [10000000];  
    
    await expect ( contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, HederaERC20__factory.abi)).to.be.throw;

  });

  it("If the rescue key is not set, the option is disabled", async function() {
    let client1:any = getClient();;
    let account1 = hreConfig.accounts[1].account;
    let privateKey1 = hreConfig.accounts[1].privateKey;
    client1.setOperator(account1, privateKey1);

    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 20000, 20000, "Hedera Accelerator Stable Coin");    
    let params: any[] = [];  
    const response = await contractCall(ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client1, 1300000, HederaERC20__factory.abi) 
    const tokenOwnerAddress = response[0] 
   
    params = [tokenOwnerAddress];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    
    params = [10000];  

    await expect(contractCall(ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, HederaERC20__factory.abi)).to.be.throw;

  });
  
});

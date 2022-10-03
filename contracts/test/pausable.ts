const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";

import { expect} from "chai";

import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const PAUSER_ROLE  = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';

describe("Pausable", function() {
  let proxyAddress:any;
  const client:any = getClient();
  let account:string;
  let privateKey:string;

  before(async function  () {         
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
    client.setOperator(account, privateKey);

    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, 1, "Hedera Accelerator Stable Coin");    

  });
  it("Admin account can grant pauser role to an account", async function() {      

    let params: any[] = [PAUSER_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 400000, HederaERC20__factory.abi);  
   
    params = [PAUSER_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, client, 60000, HederaERC20__factory.abi);      
 
    expect(result[0]).to.equals(true);
  });
  it("Admin account can revoke pauser role to an account", async function() {
    let params: any[] = [PAUSER_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'grantRole', params, client, 400000, HederaERC20__factory.abi);  

    params = [PAUSER_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'revokeRole', params, client, 400000, HederaERC20__factory.abi);  

    params = [PAUSER_ROLE, AccountId.fromString(hreConfig.accounts[1].account).toSolidityAddress()];      
    const result = await contractCall(ContractId.fromString(proxyAddress), 'hasRole', params, client, 60000, HederaERC20__factory.abi);      

    expect(result[0]).to.equals(false);
  });    
});

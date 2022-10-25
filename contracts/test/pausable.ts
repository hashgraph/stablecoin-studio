const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";

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

const PAUSER_ROLE  = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';
const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const INIT_SUPPLY = 0;
const MAX_SUPPLY = 1;
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Only Admin can grant and revoke pauser role", function() {
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

  it("Admin account can grant and revoke pauser role to an account", async function() {     
    // Admin grants pauser role : success 
    await grantRole(PAUSER_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(PAUSER_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(true);

  });

  it("Admin account can revoke pauser role to an account", async function() {
    // Admin revokes pauser role : success
    await grantRole(PAUSER_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await revokeRole(PAUSER_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    const result = await checkRole(PAUSER_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    expect(result).to.equals(false);
  });  
  
  it("Non Admin account can not grant pauser role to an account", async function() {   
    // Non Admin grants pauser role : fail       
    await expect(grantRole(PAUSER_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.eventually.be.rejectedWith(Error);

  });

  it("Non Admin account can not revoke pauser role to an account", async function() {
    // Non Admin revokes pauser role : fail       
    await grantRole(PAUSER_ROLE, ContractId, proxyAddress, client, hreConfig.accounts[1].account);
    await expect(revokeRole(PAUSER_ROLE, ContractId, proxyAddress, client2, hreConfig.accounts[1].account)).to.eventually.be.rejectedWith(Error);
  });
  
});

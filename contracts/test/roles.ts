const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;


import { deployContractsWithSDK, initializeClients } from "../scripts/deploy";
import {grantRole, revokeRole, getRoles} from "../scripts/contractsMethods";
import {BURN_ROLE, 
  PAUSER_ROLE,
  RESCUE_ROLE,
  WIPE_ROLE,
  CASHIN_ROLE,
  WITHOUT_ROLE,
  DEFAULT_ADMIN_ROLE
} from "../scripts/constants";

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
const INIT_SUPPLY = BigNumber.from(0).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(1).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Roles Tests", function() {

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
      let result = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY.toString(), 
        MAX_SUPPLY.toString(), 
        TokenMemo, 
        OPERATOR_ID, 
        OPERATOR_KEY, 
        OPERATOR_PUBLIC); 
        
      proxyAddress = result[0];
    });    


    it("Getting roles", async function() {    
      // Checking roles    
      let result = await getRoles(ContractId, proxyAddress, client, client2account);

      result.forEach(
        (role: string) => {
          expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase());
        }
      );

      // Assigning roles
      await grantRole(CASHIN_ROLE, ContractId, proxyAddress, client, client2account);
      await grantRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
      await grantRole(PAUSER_ROLE, ContractId, proxyAddress, client, client2account);
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      await grantRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
      await grantRole(DEFAULT_ADMIN_ROLE, ContractId, proxyAddress, client, client2account);

      // Checking roles    
      result = await getRoles(ContractId, proxyAddress, client, client2account);

      for (let i = 0; i < result.length; i++) {
        if(i == 0) expect(result[i].toUpperCase()).to.equals(CASHIN_ROLE.toUpperCase());
        else if(i == 1) expect(result[i].toUpperCase()).to.equals(BURN_ROLE.toUpperCase());
        else if(i == 2) expect(result[i].toUpperCase()).to.equals(WIPE_ROLE.toUpperCase());
        else if(i == 3) expect(result[i].toUpperCase()).to.equals(RESCUE_ROLE.toUpperCase());
        else if(i == 4) expect(result[i].toUpperCase()).to.equals(PAUSER_ROLE.toUpperCase());
        else if(i == 5) expect(result[i].toUpperCase()).to.equals(DEFAULT_ADMIN_ROLE.toUpperCase());
        else expect(result[i].toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase());
      }

      // Revoking roles
      await revokeRole(CASHIN_ROLE, ContractId, proxyAddress, client, client2account);
      await revokeRole(BURN_ROLE, ContractId, proxyAddress, client, client2account);
      await revokeRole(PAUSER_ROLE, ContractId, proxyAddress, client, client2account);
      await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      await revokeRole(WIPE_ROLE, ContractId, proxyAddress, client, client2account);
      await revokeRole(DEFAULT_ADMIN_ROLE, ContractId, proxyAddress, client, client2account);

      // Checking roles    
      result = await getRoles(ContractId, proxyAddress, client, client2account);

      result.forEach(
        (role: string) => {
          expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase());
        }
      );
  
    });
  
  
});

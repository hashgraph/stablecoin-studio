const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;


import { deployContractsWithSDK, initializeClients } from "../scripts/deploy";
import {grantRole, revokeRole, hasRole, deleteToken } from "../scripts/contractsMethods";
import {DELETE_ROLE} from "../scripts/constants";

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

describe("Delete Tests", function() {

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


    it("Admin account can grant and revoke delete role to an account", async function() {    
      // Admin grants delete role : success    
      let result = await hasRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
      expect(result).to.equals(false);
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
      result = await hasRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
      expect(result).to.equals(true);

      // Admin revokes delete role : success    
      await revokeRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
      result = await hasRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
      expect(result).to.equals(false);
  
    });
  
    it("Non Admin account can not grant delete role to an account", async function() {   
      // Non Admin grants delete role : fail       
      await expect(grantRole(DELETE_ROLE, ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);
    });
  
    it("Non Admin account can not revoke delete role to an account", async function() {
      // Non Admin revokes delete role : fail       
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
      await expect(revokeRole(DELETE_ROLE, ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);
  
      //Reset status
      await revokeRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account)
    });

    it("An account without delete role can't delete a token", async function() {
      await expect(deleteToken(ContractId, proxyAddress, client2)).to.eventually.be.rejectedWith(Error);
    });  


    /*it("An account with delete role can delete a token", async function() {
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);

      await expect(deleteToken(ContractId, proxyAddress, client2)).not.to.eventually.be.rejectedWith(Error);

      //Reset status
      await revokeRole(DELETE_ROLE, ContractId, proxyAddress, client, client2account);
    });*/  
});

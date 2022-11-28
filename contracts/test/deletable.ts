const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;


import { deployContractsWithSDK, initializeClients, 
  getOperatorClient,
  getOperatorAccount,
  getOperatorPrivateKey,
getOperatorPublicKey,
getNonOperatorClient,
getNonOperatorAccount,
getNonOperatorPrivateKey,
getNonOperatorPublicKey
 } from "../scripts/deploy";
 import {grantRole, revokeRole, hasRole, deleteToken, Mint } from "../scripts/contractsMethods";
import {DELETE_ROLE} from "../scripts/constants";

import{clientId} from "../scripts/utils";


let proxyAddress:any;


let operatorClient: any;
let nonOperatorClient: any;
let operatorAccount: string;
let nonOperatorAccount: string;
let operatorPriKey: string;
let nonOperatorPriKey: string;
let operatorPubKey: string;
let nonOperatorPubKey: string;


let client1:any;
let client1account: string;
let client1privatekey: string;
let client1publickey: string;

let client2:any;
let client2account: string;
let client2privatekey: string;
let client2publickey: string;

const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const TokenFactor = BigNumber.from(10).pow(TokenDecimals);
const INIT_SUPPLY = BigNumber.from(1).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(10).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Delete Tests", function() {

  before(async function  () {         
    // Generate Client 1 and Client 2
    [client1,
      client1account, 
      client1privatekey,
      client1publickey,
      client2,
      client2account,
      client2privatekey,
      client2publickey] = initializeClients();

      operatorClient = getOperatorClient(client1, client2, clientId);
      nonOperatorClient = getNonOperatorClient(client1, client2, clientId);
      operatorAccount = getOperatorAccount(client1account, client2account, clientId);
      nonOperatorAccount = getNonOperatorAccount(client1account, client2account, clientId);
      operatorPriKey = getOperatorPrivateKey(client1privatekey, client2privatekey, clientId);
      operatorPubKey = getOperatorPublicKey(client1publickey, client2publickey, clientId);

      // Deploy Token using Client
      let result = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY.toString(), 
        MAX_SUPPLY.toString(), 
        TokenMemo, 
        operatorAccount, 
        operatorPriKey, 
        operatorPubKey
        );    

      proxyAddress = result[0];
    });    


    it("Admin account can grant and revoke delete role to an account", async function() {    
      // Admin grants delete role : success    
      let result = await hasRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(false);
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      result = await hasRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(true);

      // Admin revokes delete role : success    
      await revokeRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      result = await hasRole(DELETE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);
      expect(result).to.equals(false);
  
    });
  
    it("Non Admin account can not grant delete role to an account", async function() {   
      // Non Admin grants delete role : fail       
      await expect(grantRole(DELETE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
    });
  
    it("Non Admin account can not revoke delete role to an account", async function() {
      // Non Admin revokes delete role : fail       
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      await expect(revokeRole(DELETE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
  
      //Reset status
      await revokeRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });

    it("An account without delete role can't delete a token", async function() {
      await expect(deleteToken(ContractId, proxyAddress, nonOperatorClient)).to.eventually.be.rejectedWith(Error);
    });  


    it("An account with delete role can delete a token", async function() {
      // We first grant delete role to account
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);

      // We check that the token exists by minting 1
      await Mint(ContractId, proxyAddress, 1, operatorClient, operatorAccount);

      // Delete the token
      await deleteToken(ContractId, proxyAddress, nonOperatorClient);

      // We check that the token does not exist by unsucessfully trying to mint 1
      await expect(Mint(ContractId, proxyAddress, 1, operatorClient, operatorAccount)).to.eventually.be.rejectedWith(Error);

      //The status CANNOT BE revertedsince we deleted the token
    });
});

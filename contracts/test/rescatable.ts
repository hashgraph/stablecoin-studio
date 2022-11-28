const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";


var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;


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
 import {grantRole, 
  revokeRole, 
  hasRole, 
  rescue, 
  getBalanceOf, 
  associateToken
} from "../scripts/contractsMethods";
import {RESCUE_ROLE} from "../scripts/constants";

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
const INIT_SUPPLY = BigNumber.from(100).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Rescue Tests", function() {

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

    it("Admin account can grant and revoke rescue role to an account", async function() {    
      // Admin grants rescue role : success    
      let result = await hasRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(false);
  
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
  
      result = await hasRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(true);
  
      // Admin revokes rescue role : success    
      await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      result = await hasRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      expect(result).to.equals(false);
  
    });
  
    it("Non Admin account can not grant rescue role to an account", async function() {   
      // Non Admin grants rescue role : fail       
      await expect(grantRole(RESCUE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
    });
  
    it("Non Admin account can not revoke rescue role to an account", async function() {
      // Non Admin revokes rescue role : fail       
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);
      await expect(revokeRole(RESCUE_ROLE, ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount)).to.eventually.be.rejectedWith(Error);
  
      //Reset status
      await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount)
    });

    it("Should rescue 10 token", async function() {
      const AmountToRescue = BigNumber.from(10).mul(TokenFactor);

      // Get the initial balance of the token owner and client
      const initialTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, proxyAddress.toSolidityAddress(), false);
      const initialClientBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);
 
      // rescue some tokens
      await rescue(ContractId, proxyAddress, AmountToRescue, operatorClient);

      // check new balances : success
      const finalTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, proxyAddress.toSolidityAddress(), false);
      const finalClientBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, operatorAccount);

      const expectedTokenOwnerBalance = initialTokenOwnerBalance.sub(AmountToRescue);
      const expectedClientBalance = initialClientBalance.add(AmountToRescue);

      expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString());
      expect(finalClientBalance.toString()).to.equals(expectedClientBalance.toString());
    });
  
    it("we cannot rescue more tokens than the token owner balance", async function() {
      // Get the initial balance of the token owner
      const TokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, proxyAddress.toSolidityAddress(), false);

      // Rescue TokenOwnerBalance + 1 : fail
      await expect(rescue(ContractId, proxyAddress, TokenOwnerBalance.add(1), operatorClient)).to.eventually.be.rejectedWith(Error);
    });

    it("User without rescue role cannot rescue tokens", async function() {
      // Account without rescue role, rescues tokens : fail
      await expect(rescue(ContractId, proxyAddress, BigNumber.from(1), nonOperatorClient)).to.eventually.be.rejectedWith(Error);
    });
  
    it("User with granted rescue role can rescue tokens", async function() {
      const AmountToRescue = BigNumber.from(1);    

      // Retrieve original balances
      const initialTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, proxyAddress.toSolidityAddress(), false);
      const initialClientBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, nonOperatorAccount);

      // Grant rescue role to account
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount);

      // Associate account to token
      await associateToken(ContractId, proxyAddress, nonOperatorClient, nonOperatorAccount);
        
      // Rescue tokens with newly granted account
      await rescue(ContractId, proxyAddress, AmountToRescue, nonOperatorClient);

      // Check final balances : success
      const finalTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, proxyAddress.toSolidityAddress(), false);
      const finalClientBalance = await getBalanceOf(ContractId, proxyAddress, operatorClient, nonOperatorAccount);

      const expectedTokenOwnerBalance = initialTokenOwnerBalance.sub(AmountToRescue);
      const expectedClientBalance = initialClientBalance.add(AmountToRescue);

      expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString());
      expect(finalClientBalance.toString()).to.equals(expectedClientBalance.toString());
    }); 
  
});


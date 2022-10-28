const { ContractId, AccountId }  = require("@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import {BigNumber} from "ethers";


var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;


import { deployContractsWithSDK, initializeClients } from "../scripts/deploy";
import {grantRole, 
  revokeRole, 
  hasRole, 
  Rescue, 
  getBalanceOf, 
  associateToken
} from "../scripts/contractsMethods";
import {RESCUE_ROLE} from "../scripts/constants";

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
const INIT_SUPPLY = BigNumber.from(100).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Rescue Tests", function() {

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
      proxyAddress = await deployContractsWithSDK(
        TokenName, 
        TokenSymbol, 
        TokenDecimals, 
        INIT_SUPPLY.toString(), 
        MAX_SUPPLY.toString(), 
        TokenMemo, 
        OPERATOR_ID, 
        OPERATOR_KEY, 
        OPERATOR_PUBLIC);   
        
    });    

    it("Admin account can grant and revoke rescue role to an account", async function() {    
      // Admin grants rescue role : success    
      let result = await hasRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      expect(result).to.equals(false);
  
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
  
      result = await hasRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      expect(result).to.equals(true);
  
      // Admin revokes rescue role : success    
      await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      result = await hasRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      expect(result).to.equals(false);
  
    });
  
    it("Non Admin account can not grant rescue role to an account", async function() {   
      // Non Admin grants rescue role : fail       
      await expect(grantRole(RESCUE_ROLE, ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);
    });
  
    it("Non Admin account can not revoke rescue role to an account", async function() {
      // Non Admin revokes rescue role : fail       
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);
      await expect(revokeRole(RESCUE_ROLE, ContractId, proxyAddress, client2, client2account)).to.eventually.be.rejectedWith(Error);
  
      //Reset status
      await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account)
    });

    it("Should rescue 10 token", async function() {
      const AmountToRescue = BigNumber.from(10).mul(TokenFactor);

      // Get the initial balance of the token owner and client
      const initialTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, client, proxyAddress.toSolidityAddress(), false);
      const initialClientBalance = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);
 
      // rescue some tokens
      await Rescue(ContractId, proxyAddress, AmountToRescue, client);

      // check new balances : success
      const finalTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, client, proxyAddress.toSolidityAddress(), false);
      const finalClientBalance = await getBalanceOf(ContractId, proxyAddress, client, OPERATOR_ID);

      const expectedTokenOwnerBalance = initialTokenOwnerBalance.sub(AmountToRescue);
      const expectedClientBalance = initialClientBalance.add(AmountToRescue);

      expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString());
      expect(finalClientBalance.toString()).to.equals(expectedClientBalance.toString());
    });
  
    it("we cannot rescue more tokens than the token owner balance", async function() {
      // Get the initial balance of the token owner
      const TokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, client, proxyAddress.toSolidityAddress(), false);

      // Rescue TokenOwnerBalance + 1 : fail
      await expect(Rescue(ContractId, proxyAddress, TokenOwnerBalance.add(1), client)).to.eventually.be.rejectedWith(Error);
    });

    it("User without rescue role cannot rescue tokens", async function() {
      // Account without rescue role, rescues tokens : fail
      await expect(Rescue(ContractId, proxyAddress, BigNumber.from(1), client2)).to.eventually.be.rejectedWith(Error);
    });
  
    it("User with granted rescue role can rescue tokens", async function() {
      const AmountToRescue = BigNumber.from(1);    

      // Retrieve original balances
      const initialTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, client, proxyAddress.toSolidityAddress(), false);
      const initialClientBalance = await getBalanceOf(ContractId, proxyAddress, client, client2account);

      // Grant rescue role to account
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, client, client2account);

      // Associate account to token
      await associateToken(ContractId, proxyAddress, client2, client2account);
        
      // Rescue tokens with newly granted account
      await Rescue(ContractId, proxyAddress, AmountToRescue, client2);

      // Check final balances : success
      const finalTokenOwnerBalance = await getBalanceOf(ContractId, proxyAddress, client, proxyAddress.toSolidityAddress(), false);
      const finalClientBalance = await getBalanceOf(ContractId, proxyAddress, client, client2account);

      const expectedTokenOwnerBalance = initialTokenOwnerBalance.sub(AmountToRescue);
      const expectedClientBalance = initialClientBalance.add(AmountToRescue);

      expect(finalTokenOwnerBalance.toString()).to.equals(expectedTokenOwnerBalance.toString());
      expect(finalClientBalance.toString()).to.equals(expectedClientBalance.toString());
    }); 
  
});


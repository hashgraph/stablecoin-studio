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
  getOperatorE25519,
getOperatorPublicKey,
getNonOperatorClient,
getNonOperatorAccount,
getNonOperatorPrivateKey,
getNonOperatorPublicKey,
getNonOperatorE25519
 } from "../scripts/deploy";
 import {grantRole, revokeRole, getRoles, getRoleId} from "../scripts/contractsMethods";
import {BURN_ROLE, 
  PAUSE_ROLE,
  RESCUE_ROLE,
  WIPE_ROLE,
  CASHIN_ROLE,
  FREEZE_ROLE,
  DELETE_ROLE,
  WITHOUT_ROLE,
  DEFAULT_ADMIN_ROLE,
  RolesId
} from "../scripts/constants";

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
let operatorIsE25519: boolean;
let nonOperatorIsE25519: boolean;


let client1:any;
let client1account: string;
let client1privatekey: string;
let client1publickey: string;
let client1isED25519Type: boolean;


let client2:any;
let client2account: string;
let client2privatekey: string;
let client2publickey: string;
let client2isED25519Type: boolean;

const TokenName = "MIDAS";
const TokenSymbol = "MD";
const TokenDecimals = 3;
const TokenFactor = BigNumber.from(10).pow(TokenDecimals);
const INIT_SUPPLY = BigNumber.from(0).mul(TokenFactor);
const MAX_SUPPLY = BigNumber.from(1).mul(TokenFactor);
const TokenMemo = "Hedera Accelerator Stable Coin"

describe("Roles Tests", function() {

  before(async function  () {         
    // Generate Client 1 and Client 2
    [client1,
      client1account, 
      client1privatekey,
      client1publickey,
      client1isED25519Type,
      client2,
      client2account,
      client2privatekey,
      client2publickey,
      client2isED25519Type] = initializeClients();

      operatorClient = getOperatorClient(client1, client2, clientId);
      nonOperatorClient = getNonOperatorClient(client1, client2, clientId);
      operatorAccount = getOperatorAccount(client1account, client2account, clientId);
      nonOperatorAccount = getNonOperatorAccount(client1account, client2account, clientId);
      operatorPriKey = getOperatorPrivateKey(client1privatekey, client2privatekey, clientId);
      operatorPubKey = getOperatorPublicKey(client1publickey, client2publickey, clientId);
      operatorIsE25519 = getOperatorE25519(client1isED25519Type, client2isED25519Type, clientId);
      nonOperatorIsE25519 = getNonOperatorE25519(client1isED25519Type, client2isED25519Type, clientId);


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
        operatorPubKey,
        operatorIsE25519
        ); 
        
      proxyAddress = result[0];
    });    


    it("Getting roles", async function() {    
      // Checking roles    
      let result = await getRoles(ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);

      result.forEach(
        (role: string) => {
          expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase());
        }
      );

      // Assigning roles
      await grantRole(DEFAULT_ADMIN_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(CASHIN_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(BURN_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(FREEZE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await grantRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);

      // Checking roles    
      result = await getRoles(ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);

      for (let i = 0; i < result.length; i++) {
        if(i == RolesId.Cashin) expect(result[i].toUpperCase()).to.equals(CASHIN_ROLE.toUpperCase());
        else if(i == RolesId.Burn) expect(result[i].toUpperCase()).to.equals(BURN_ROLE.toUpperCase());
        else if(i == RolesId.Delete) expect(result[i].toUpperCase()).to.equals(DELETE_ROLE.toUpperCase());
        else if(i == RolesId.Freeze) expect(result[i].toUpperCase()).to.equals(FREEZE_ROLE.toUpperCase());
        else if(i == RolesId.Wipe) expect(result[i].toUpperCase()).to.equals(WIPE_ROLE.toUpperCase());
        else if(i == RolesId.Rescue) expect(result[i].toUpperCase()).to.equals(RESCUE_ROLE.toUpperCase());
        else if(i == RolesId.Pause) expect(result[i].toUpperCase()).to.equals(PAUSE_ROLE.toUpperCase());
        else if(i == RolesId.Admin) expect(result[i].toUpperCase()).to.equals(DEFAULT_ADMIN_ROLE.toUpperCase());
        else expect(result[i].toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase());
      }

      // Revoking roles
      await revokeRole(CASHIN_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(BURN_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(PAUSE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(RESCUE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(WIPE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(FREEZE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(DELETE_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);
      await revokeRole(DEFAULT_ADMIN_ROLE, ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);

      // Checking roles    
      result = await getRoles(ContractId, proxyAddress, operatorClient, nonOperatorAccount, nonOperatorIsE25519);

      result.forEach(
        (role: string) => {
          expect(role.toUpperCase()).to.equals(WITHOUT_ROLE.toUpperCase());
        }
      );
  
    });

    it("Getting roles Id", async function() {    
      // Retrieving roles    
      let roleAdmin = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Admin);
      let roleCashin = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Cashin);
      let roleBurn = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Burn);
      let rolePause = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Pause);
      let roleWipe = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Wipe);
      let roleRescue = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Rescue);
      let roleFreeze = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Freeze);
      let roleDelete = await getRoleId(ContractId, proxyAddress, operatorClient, RolesId.Delete);

      // Checking
      expect(roleAdmin.toUpperCase()).to.equals(DEFAULT_ADMIN_ROLE.toUpperCase());
      expect(roleCashin.toUpperCase()).to.equals(CASHIN_ROLE.toUpperCase());
      expect(roleBurn.toUpperCase()).to.equals(BURN_ROLE.toUpperCase());
      expect(rolePause.toUpperCase()).to.equals(PAUSE_ROLE.toUpperCase());
      expect(roleWipe.toUpperCase()).to.equals(WIPE_ROLE.toUpperCase());
      expect(roleRescue.toUpperCase()).to.equals(RESCUE_ROLE.toUpperCase());
      expect(roleFreeze.toUpperCase()).to.equals(FREEZE_ROLE.toUpperCase());
      expect(roleDelete.toUpperCase()).to.equals(DELETE_ROLE.toUpperCase());
    });
  
  
});

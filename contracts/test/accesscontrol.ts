const { ContractId, AccountId }  = require( "@hashgraph/sdk");
import "@hashgraph/hardhat-hethers";

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;
const CASHIN_ROLE = '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c';
const BURN_ROLE  = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22';
const WIPE_ROLE = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3';
const RESCUE_ROLE = '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a';
const PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';


let proxyAddress:any;
let client:any;
const OPERATOR_ID = hreConfig.accounts[0].account;
const OPERATOR_KEY = hreConfig.accounts[0].privateKey;

describe("Account roles", function() {
  before(async function  () {
    client = getClient();      
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
  
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 100000, 100000, "Hedera Accelerator Stable Coin");    
  });
  it("An account has a list of roles", async function() {
    const params : any = [AccountId.fromString(hreConfig.accounts[0].account!).toSolidityAddress()];  
    const roles : boolean[] = await contractCall(ContractId.fromString(proxyAddress), 'accountRoles', params, client, 50000, HederaERC20__factory.abi);      
    expect(roles[0]).to.contains(CASHIN_ROLE);
    expect(roles[0]).to.contains(BURN_ROLE);
    expect(roles[0]).to.contains(WIPE_ROLE);
    expect(roles[0]).to.contains(RESCUE_ROLE);
    expect(roles[0]).to.not.contains(PAUSER_ROLE);
  });
});
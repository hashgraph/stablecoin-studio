import { ContractFunctionParameters, ContractId, AccountId } from "@hashgraph/sdk";
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

import { expect } from "chai";
import { deployContractsWithSDK, contractCall, getClient, createECDSAAccount } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

import dotenv from "dotenv";

describe("General ERC20", function() {
  let proxyAddress:any;
  let client:any;
  let contractProxy: { name: (arg0: { gasLimit: number; }) => any; symbol: (arg0: { gasLimit: number; }) => any; decimals: (arg0: { gasLimit: number; }) => any; };

  before(async function  () {
    client = getClient(process.env.OPERATOR_ID!, process.env.OPERATOR_PRIVATE_KEY!);      
  });
  beforeEach(async function () {
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, 1000, "Hedera Accelerator Stable Coin");    
  });
  it("Basic init params check", async function() {
    const account = await createECDSAAccount(client, 0);
    const parametersContractCall = [AccountId.fromString(account.accountId).toSolidityAddress(), 1000];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'mint2', parametersContractCall, client, 400000, HederaERC20__factory.abi)  
    expect(result[0]).to.equals(true);
  });
});

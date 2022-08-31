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
    proxyAddress = await deployContractsWithSDK("MIDAS", "MD", 3, 0, 5000, "Hedera Accelerator Stable Coin");    
  });
  it("Should mint 1 token", async function() {
    let params: any[] = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
    await contractCall(ContractId.fromString(proxyAddress), 'associateToken', params, client, 1300000, HederaERC20__factory.abi)  
    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress(), 1000];  
    await contractCall(ContractId.fromString(proxyAddress), 'mint', params, client, 400000, HederaERC20__factory.abi)  
    params = [AccountId.fromString(process.env.OPERATOR_ID!).toSolidityAddress()];  
    const result = await contractCall(ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, HederaERC20__factory.abi)  
    expect(parseInt(result[0])).to.equals(1000);
  });
});

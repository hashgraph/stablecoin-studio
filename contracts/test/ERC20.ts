import { ContractFunctionParameters, ContractId, AccountId} from "@hashgraph/sdk";

import { expect } from "chai";
import { deployContractsWithSDK, getClient, contractCall } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

const hre = require("hardhat");
const hreConfig = hre.network.config;

describe("General ERC20", function() {
  let deployedProxyAddress: ContractId | null;
  let account;
  let privateKey;
    
  beforeEach(async function () {
    deployedProxyAddress = await deployContractsWithSDK("TOKEN","TK",2,0,2000000,"",false);
    
  });
  
  it("Basic init params check", async function() {
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;
  
    const clientSdk = getClient();
    clientSdk.setOperator(account, privateKey);

    const parameters: any[] = [];    
   
    const nameToken = await contractCall(deployedProxyAddress, 'name', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    const symbolToken = await contractCall(deployedProxyAddress, 'symbol', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    const decimalsToken = await contractCall(deployedProxyAddress, 'decimals', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    
    expect(nameToken[0].toString()).to.equals('TOKEN');
    expect(symbolToken[0].toString()).to.equals('TK');
    expect(Number(decimalsToken[0])).to.equals(2);   
  });

  it("The balance of an account", async function() {
    account = hreConfig.accounts[0].account;
    privateKey = hreConfig.accounts[0].privateKey;  
  
    const clientSdk = getClient();
    clientSdk.setOperator(account, privateKey);

    let params: any[] = [AccountId.fromString(account!).toSolidityAddress(),1000000];      
    await contractCall(deployedProxyAddress, 'mint', params, clientSdk, 400000, HederaERC20__factory.abi);

    const parameters = [AccountId.fromString(account!).toSolidityAddress()];    
    const balanceOf = await contractCall(deployedProxyAddress, 'balanceOf', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    
    expect(parseInt(balanceOf[0])).to.equals(1000000);   

  });
});

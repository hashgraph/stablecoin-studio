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
<<<<<<< HEAD
<<<<<<< HEAD
    deployedProxyAddress = await deployContractsWithSDK("TOKEN","TK",2,0,100_000,"mytoken",false);
=======
    deployedProxyAddress = await deployContractsWithSDK("TOKEN","TK",2,0,2000000,"",false);
>>>>>>> include network in getClient, associate token to admin account y contractProxy to memo token
=======
    deployedProxyAddress = await deployContractsWithSDK("TOKEN","TK",2,0,2000000,"",false);
>>>>>>> 4ac336ed52d03ed529c97f25bfea128a6d0e2b97
    
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

<<<<<<< HEAD
<<<<<<< HEAD
    const parameters = [AccountId.fromString(account || "").toSolidityAddress()];    
=======
=======
>>>>>>> 4ac336ed52d03ed529c97f25bfea128a6d0e2b97
    let params: any[] = [AccountId.fromString(account!).toSolidityAddress(),1000000];      
    await contractCall(deployedProxyAddress, 'mint', params, clientSdk, 400000, HederaERC20__factory.abi);

    const parameters = [AccountId.fromString(account!).toSolidityAddress()];    
<<<<<<< HEAD
>>>>>>> include network in getClient, associate token to admin account y contractProxy to memo token
    const balanceOf = await contractCall(deployedProxyAddress, 'balanceOf', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    
    expect(Number(balanceOf[0])).to.equals(0);   
=======
    const balanceOf = await contractCall(deployedProxyAddress, 'balanceOf', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    
    expect(parseInt(balanceOf[0])).to.equals(1000000);   

>>>>>>> 4ac336ed52d03ed529c97f25bfea128a6d0e2b97
  });
});

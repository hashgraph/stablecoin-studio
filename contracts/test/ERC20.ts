import { ContractFunctionParameters, ContractId, AccountId} from "@hashgraph/sdk";

import { expect } from "chai";
import { deployContractsWithSDK, getClient, contractCall } from "../scripts/utils";
import { HederaERC20__factory } from "../typechain-types";

describe("General ERC20", function() {
  let deployedProxyAddress: ContractId | null;
  let account;
  let privateKey;
  let network;
  
  beforeEach(async function () {
<<<<<<< HEAD
    deployedProxyAddress = await deployContractsWithSDK("TOKEN","TK",2,0,100_000,"mytoken",false);
=======
    deployedProxyAddress = await deployContractsWithSDK("TOKEN","TK",2,0,2000000,"",false);
>>>>>>> include network in getClient, associate token to admin account y contractProxy to memo token
    
  });
  
  it("Basic init params check", async function() {
    account    = process.env.OPERATOR_ID;
    privateKey = process.env.OPERATOR_PRIVATE_KEY;  
    network    = process.env.HEDERA_NETWORK;                          
  
    const clientSdk = getClient(account!, privateKey!, network);
    const parameters: any[] = [];    
   
    const nameToken = await contractCall(deployedProxyAddress, 'name', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    const symbolToken = await contractCall(deployedProxyAddress, 'symbol', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    const decimalsToken = await contractCall(deployedProxyAddress, 'decimals', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    
    expect(nameToken[0].toString()).to.equals('TOKEN');
    expect(symbolToken[0].toString()).to.equals('TK');
    expect(Number(decimalsToken[0])).to.equals(2);   
  });

  it("The balance of an account", async function() {
    account    = process.env.OPERATOR_ID;
    privateKey = process.env.OPERATOR_PRIVATE_KEY;   
    network    = process.env.HEDERA_NETWORK;                        
  
    const clientSdk = getClient(account!, privateKey!, network);

<<<<<<< HEAD
    const parameters = [AccountId.fromString(account || "").toSolidityAddress()];    
=======
    let params: any[] = [AccountId.fromString(account!).toSolidityAddress(),1000000];      
    await contractCall(deployedProxyAddress, 'mint', params, clientSdk, 400000, HederaERC20__factory.abi);

    const parameters = [AccountId.fromString(account!).toSolidityAddress()];    
>>>>>>> include network in getClient, associate token to admin account y contractProxy to memo token
    const balanceOf = await contractCall(deployedProxyAddress, 'balanceOf', parameters, clientSdk, 36000, HederaERC20__factory.abi);
    
    expect(Number(balanceOf[0])).to.equals(0);   
  });
});

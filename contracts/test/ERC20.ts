require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");

//import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
//import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { deployContracts } from "../scripts/utils";


const hre = require("hardhat");

describe("🧰  General ERC20", function() {
  let deployedProxyAddress;
  let contractProxy: { name: (arg0: { gasLimit: number; }) => any; symbol: (arg0: { gasLimit: number; }) => any; decimals: (arg0: { gasLimit: number; }) => any; };

  beforeEach(async function () {
    deployedProxyAddress = await deployContracts();
    console.log(deployedProxyAddress);
    contractProxy = await hre.hethers.getContractAt(
      "HederaERC20",
      deployedProxyAddress
    );
  });
  it(" 🧪 Basic init params check", async function() {
    expect(await contractProxy.name({ gasLimit: 36000 })).to.equals('tokenName');
    expect(await contractProxy.symbol({ gasLimit: 36000 })).to.equals('tokenSymbol');
    expect(await contractProxy.decimals({ gasLimit: 36000 })).to.equals(2);
  });
});

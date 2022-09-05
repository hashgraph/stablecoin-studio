"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@hashgraph/sdk");
require("@hashgraph/hardhat-hethers");
require("@hashgraph/sdk");
const chai_1 = require("chai");
const utils_1 = require("../scripts/utils");
const typechain_types_1 = require("../typechain-types");
const hre = require("hardhat");
const hreConfig = hre.network.config;
describe("Rescatable", function () {
    let proxyAddress;
    let client = (0, utils_1.getClient)();
    ;
    let contractProxy;
    let account;
    let privateKey;
    before(async function () {
        account = hreConfig.accounts[0].account;
        privateKey = hreConfig.accounts[0].privateKey;
        client.setOperator(account, privateKey);
    });
    beforeEach(async function () {
    });
    it("Should rescue 10000 token", async function () {
        proxyAddress = await (0, utils_1.deployContractsWithSDK)("MIDAS", "MD", 3, 20000000, 20000000, "Hedera Accelerator Stable Coin");
        let params = [];
        const response = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, typechain_types_1.HederaERC20__factory.abi);
        const tokenOwnerAddress = response[0];
        params = [10000000];
        await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'rescueToken', params, client, 140000, typechain_types_1.HederaERC20__factory.abi);
        params = [tokenOwnerAddress];
        let balance = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, typechain_types_1.HederaERC20__factory.abi);
        (0, chai_1.expect)(parseInt(balance[0])).to.equals(10000000);
        params = [sdk_1.AccountId.fromString(account).toSolidityAddress()];
        let balanceAdm = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, typechain_types_1.HederaERC20__factory.abi);
        (0, chai_1.expect)(parseInt(balanceAdm[0])).to.equals(10000000);
    });
    it("I cannot rescue 10.000 from an account with 100 tokens", async function () {
        proxyAddress = await (0, utils_1.deployContractsWithSDK)("MIDAS", "MD", 3, 100000, 20000000, "Hedera Accelerator Stable Coin");
        let params = [];
        const response = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client, 1300000, typechain_types_1.HederaERC20__factory.abi);
        const tokenOwnerAddress = response[0];
        params = [tokenOwnerAddress];
        const result = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, typechain_types_1.HederaERC20__factory.abi);
        params = [10000000];
        await (0, chai_1.expect)((0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, typechain_types_1.HederaERC20__factory.abi)).to.be.throw;
    });
    it("If the rescue key is not set, the option is disabled", async function () {
        let client1 = (0, utils_1.getClient)();
        ;
        let account1 = hreConfig.accounts[1].account;
        let privateKey1 = hreConfig.accounts[1].privateKey;
        client1.setOperator(account1, privateKey1);
        proxyAddress = await (0, utils_1.deployContractsWithSDK)("MIDAS", "MD", 3, 20000, 20000, "Hedera Accelerator Stable Coin");
        let params = [];
        const response = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'getTokenOwnerAddress', params, client1, 1300000, typechain_types_1.HederaERC20__factory.abi);
        const tokenOwnerAddress = response[0];
        params = [tokenOwnerAddress];
        const result = await (0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'balanceOf', params, client, 60000, typechain_types_1.HederaERC20__factory.abi);
        params = [10000];
        await (0, chai_1.expect)((0, utils_1.contractCall)(sdk_1.ContractId.fromString(proxyAddress), 'rescueToken', params, client, 120000, typechain_types_1.HederaERC20__factory.abi)).to.be.throw;
    });
});

import { AccountId, ContractId } from "@hashgraph/sdk";
import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator, deployContracts,
         supplyControllerAbiInterface, clientOperatorForProperties, hederaERC1967ProxyAbiInterface,
         supplyControllerAbiInterfaceV1_1, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV2,
         supplyControllerBytecodeV2, burnTokenCreatedAccounts } from './utils.mjs';
import {getOperatorAccountBalanceSDK, createECDSAAccount, getClient} from './utils_sdk.mjs';
import { connectToContractWith, deployContractSupplyWithHethers } from './utils_hethers.mjs';
import chai from "chai";
import { hethers } from '@hashgraph/hethers';
import { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let addr1;
let accounts;
let deployedContracts;
let initialOperatorAccountBalance;
let operatorAccountBalanceAfterAccountsCreation;
let operatorAccountBalanceAfterContractsDeployment;

const abi = ["function initializeV1_1() external"];
const iface = new hethers.utils.Interface(abi);
const functionSelector = iface.getSighash("initializeV1_1");

describe("Upgradeability SupplyController", function () {
    this.timeout(400000);

    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(500, 100);
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);

        let accountClient = getClient();
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);

        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
    });
    beforeEach(async function () {
        addr1 = await createECDSAAccount(clientOperatorForProperties, 101);
    });
    it("Should allow upgradeability", async function () {
        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxySupplyUpgrader.upgradeToAndCall(supplyControllerContractV1_1.address, functionSelector, { gasLimit: 100000});
        const supplyControllerContractUpgraded = supplyControllerContractV1_1.attach(ContractId.fromString(deployedContracts.proxySupplyController.toString()).toSolidityAddress());

        expect(await supplyControllerContractUpgraded.version({ gasLimit: 30000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("Should fail if upgrade to zero address", async function () {
        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect( proxySupplyUpgrader.upgradeToAndCall(hethers.constants.AddressZero, functionSelector, { gasLimit: 100000})).to.be.reverted ;
    });
    it("Should fail if updateFunction is removed", async function () {
        const abi = ["function initializeV2() public"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV2");

        const supplyControllerContractV2 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV2, supplyControllerAbiInterfaceV2);
        const proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await expect(proxySupplyUpgrader.upgradeToAndCall(supplyControllerContractV2.address, functionSelector, { gasLimit: 100000})).to.be.reverted;
    });
    it("RBAC -ve : Should only allow the upgrader to upgrade", async function () {
        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyAddr1 = await connectToContractWith(addr1, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxySupplyAddr1.upgradeToAndCall(supplyControllerContractV1_1.address, functionSelector, { gasLimit: 100000})).to.be.reverted;
    });
    it("Using upgradeProxy() - updateTo() for Hedera, should allow upgradeability", async function () {
        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxySupplyUpgrader.upgradeTo(supplyControllerContractV1_1.address, { gasLimit: 100000})

        const proxySupplyAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterfaceV1_1);
        await proxySupplyAdmin.initializeV1_1({ gasLimit: 50000 });

        expect(await proxySupplyAdmin.version({ gasLimit: 30000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("RBAC -ve : Using upgradeProxy() - updateTo() for Hedera, should only allow the upgrader to upgrade", async function () {
        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyAddr1 = await connectToContractWith(addr1, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await expect(proxySupplyAddr1.upgradeTo(supplyControllerContractV1_1.address, { gasLimit: 100000})).to.be.reverted;
    });
    it("Using upgradeProxy() - updateTo() for Hedera, should fail if updateFunction is removed", async function () {
        const supplyControllerContractV2 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV2, supplyControllerAbiInterfaceV2);

        const proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxySupplyUpgrader.upgradeToAndCall(supplyControllerContractV2.address, functionSelector,{ gasLimit: 100000})).to.be.reverted;
    });
    it("Using upgradeProxy() - updateTo() for Hedera, should allow execution of initializer function", async function () {
        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        let proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxySupplyUpgrader.upgradeTo(supplyControllerContractV1_1.address, { gasLimit: 100000})

        proxySupplyUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterfaceV1_1);
        await proxySupplyUpgrader.initializeV1_1({ gasLimit: 50000 });

        expect(await proxySupplyUpgrader.version({ gasLimit: 30000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("Can delegate upgrader role", async function () {
        const supplyContractMaster = await connectToContractWith(accounts.masterSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await supplyContractMaster.grantRole(await supplyContractMaster.UPGRADER_ROLE({ gasLimit: 44000 }),
                                             AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 250000 });

        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyUpgrader = await connectToContractWith(addr1, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxySupplyUpgrader.upgradeToAndCall(supplyControllerContractV1_1.address, functionSelector, { gasLimit: 100000})

        const proxySupplyAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterfaceV1_1);

        expect(await proxySupplyAdmin.version({ gasLimit: 90000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("After deploying the logic contract should never be able to call initialize()", async function () {
        const proxySupplyAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, hederaERC1967ProxyAbiInterface);
        const logicContractAddress = await proxySupplyAdmin.getImplementation({ gasLimit: 50000 });
        const supplyContractV1 = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await expect(supplyContractV1.initialize(ContractId.fromString(deployedContracts.proxyContract).toSolidityAddress(),
                                                 AccountId.fromString(accounts.masterSupplyController.accountId.toString()).toSolidityAddress(),
                                                 AccountId.fromString(accounts.supplyControllerAdmin.accountId.toString()).toSolidityAddress(),
                                                 AccountId.fromString(accounts.upgraderSupplyController.accountId.toString()).toSolidityAddress(),
                                                 { gasLimit: 250000 })).to.be.reverted;
    });
    it("Initializer function shouldn't be able to be called a second time after deployment", async function () {
        const proxySupplyControllerAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxySupplyControllerAdmin.initialize(ContractId.fromString(deployedContracts.proxyContract).toSolidityAddress(),
                                                           AccountId.fromString(accounts.masterSupplyController.accountId.toString()).toSolidityAddress(),
                                                           AccountId.fromString(accounts.supplyControllerAdmin.accountId.toString()).toSolidityAddress(),
                                                           AccountId.fromString(accounts.upgraderSupplyController.accountId.toString()).toSolidityAddress(),
                                                           { gasLimit: 250000 })).to.be.reverted;
    });
    afterEach(async function () {
        await burnTokenCreatedAccounts({ addr1}, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator({ addr1 });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("upgradeGeneralSupplyController.test tests file General SupplyController hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });

});

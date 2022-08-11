import { AccountId, ContractId } from "@hashgraph/sdk";
import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator, deployContracts,
         hederaERC20AbiInterface, clientOperatorForProperties, hederaERC1967ProxyAbiInterface,
         hederaERC20AbiInterfaceV1_1,hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV2,
         hederaERC20BytecodeV2 } from './utils.mjs';
import {getOperatorAccountBalanceSDK, createECDSAAccount, getClient} from './utils_sdk.mjs';
import { connectToContractWith, deployContractSupplyWithHethers } from './utils_hethers.mjs';
import chai from "chai";
import { hethers } from '@hashgraph/hethers';
import { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let accounts;
let deployedContracts;
let initialOperatorAccountBalance;
let operatorAccountBalanceAfterAccountsCreation;
let operatorAccountBalanceAfterContractsDeployment;

describe("Upgradeability General", function () {
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
    it("Should allow upgradeability", async function () {
        const abi = ["function initializeV1_1() external"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV1_1");

        const contractV1_1 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV1_1);
        const proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyContractUpgrader.upgradeToAndCall(contractV1_1.address, functionSelector, { gasLimit: 100000});
        const contractUpgraded = contractV1_1.attach(ContractId.fromString(deployedContracts.proxyContract.toString()).toSolidityAddress());

        expect(await contractUpgraded.version({ gasLimit: 90000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("Should fail if upgrade to zero address", async function () {
        const abi = ["function initializeV1_1() external"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV1_1");

        const contractV1_1 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV1_1);

        const proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyContractUpgrader.upgradeToAndCall(hethers.constants.AddressZero, functionSelector, { gasLimit: 100000})).to.be.reverted;
    });
    it("Should fail if updateFunction is removed", async function () {
        const abi = ["function initializeV2() public"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV2");

        const contractV2 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV2, hederaERC20AbiInterfaceV2);

        const proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyContractUpgrader.upgradeToAndCall(contractV2.address, functionSelector, { gasLimit: 200000})).to.be.reverted;
    });
    it("RBAC -ve : Should only allow the upgrader to upgrade", async function () {
        const abi = ["function initializeV2() public"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV2");

        const contractV2 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV2, hederaERC20AbiInterfaceV2);

        const addr1 = await createECDSAAccount(clientOperatorForProperties, 10);
        const proxyContractAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);

        await expect(proxyContractAddr1.upgradeToAndCall(contractV2.address, functionSelector, { gasLimit: 200000})).to.be.reverted;
    });
    it("Using upgradeProxy() - updateTo() for Hedera, should allow upgradeability", async function () {
        const contractV1_1 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV1_1);

        const proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyContractUpgrader.upgradeTo(contractV1_1.address, { gasLimit: 100000})

        const proxyContractAdmin = await connectToContractWith(accounts.admin, deployedContracts.proxyContract, hederaERC20AbiInterfaceV1_1);
        await proxyContractAdmin.initializeV1_1({ gasLimit: 50000 });

        expect(await proxyContractAdmin.version({ gasLimit: 30000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("RBAC -ve : Using upgradeProxy() - updateTo() for Hedera, should only allow the upgrader to upgrade", async function () {
        const contractV1_1 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV1_1);
        const addr1 = await createECDSAAccount(clientOperatorForProperties, 10);
        const proxyContractAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterfaceV1_1);

        await expect(proxyContractAddr1.upgradeTo(contractV1_1.address, { gasLimit: 100000})).to.be.reverted;
    });
    it("Using upgradeProxy() - updateTo() for Hedera, should fail if updateFunction is removed", async function () {
        const abi = ["function initializeV2() external"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV2");

        const contractV2 = await deployContractSupplyWithHethers(accounts.admin, hederaERC20BytecodeV2, hederaERC20AbiInterfaceV2);

        const proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyContractUpgrader.upgradeToAndCall(contractV2.address, functionSelector,{ gasLimit: 200000})).to.be.reverted;
    });
    it("Using upgradeProxy() - updateTo() for Hedera, should allow execution of initializer function", async function () {
        const contractV1_1 = await deployContractSupplyWithHethers(accounts.admin, hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV1_1);
        let proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyContractUpgrader.upgradeTo(contractV1_1.address, { gasLimit: 100000})
        proxyContractUpgrader = await connectToContractWith(accounts.upgrader, deployedContracts.proxyContract, hederaERC20AbiInterfaceV1_1);
        await proxyContractUpgrader.initializeV1_1({ gasLimit: 50000 });
        expect(await proxyContractUpgrader.version({ gasLimit: 30000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("Can delegate upgrader role", async function () {
        const abi = ["function initializeV1_1() external"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV1_1");

        const addr1 = await createECDSAAccount(clientOperatorForProperties, 10);
        const proxyContractMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyContractMaster.grantRole(await proxyContractMaster.UPGRADER_ROLE({ gasLimit: 44000 }), AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 250000 });

        const contractV1_1 = await deployContractSupplyWithHethers(accounts.account, hederaERC20BytecodeV1_1, hederaERC20AbiInterfaceV1_1);

        const proxyContractAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyContractAddr1.upgradeToAndCall(contractV1_1.address, functionSelector, { gasLimit: 200000});

        const proxyContractAdmin = await connectToContractWith(accounts.admin, deployedContracts.proxyContract, hederaERC20AbiInterfaceV1_1);
        expect(await proxyContractAdmin.version({ gasLimit: 90000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("After deploying the logic contract should never be able to call initialize()", async function () {
        const proxyContractAdmin = await connectToContractWith(accounts.admin, deployedContracts.proxyContract, hederaERC1967ProxyAbiInterface);
        const logicContractAddress = await proxyContractAdmin.getImplementation({ gasLimit: 50000 });
        const contractV1 = await connectToContractWith(accounts.admin, deployedContracts.proxyContract, hederaERC20AbiInterface);
        const logicContract = await contractV1.attach(logicContractAddress);

        await expect(logicContract.initialize(AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(),
                                              AccountId.fromString(accounts.admin.accountId.toString()).toSolidityAddress(),
                                              AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(),
                                              AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(),
                                              { gasLimit: 200000 })).to.be.reverted;
    });
    it("Initializer function shouldn't be able to be called a second time after deployment", async function () {
        const proxyContractAddr1 = await connectToContractWith(accounts.admin, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyContractAddr1.initialize(AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(),
                                                   AccountId.fromString(accounts.admin.accountId.toString()).toSolidityAddress(),
                                                   AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(),
                                                   AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(),
                                                   { gasLimit: 200000 })).to.be.reverted;
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("upgradeGeneralHederaERC20.test tests file Upgradeability General hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

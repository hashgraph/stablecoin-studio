import { AccountId, ContractId } from "@hashgraph/sdk";
import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator, deployContracts,
         hederaERC20json, hederaERC20AbiInterface, findEvent, clientOperatorForProperties, burnTokenCreatedAccounts } from './utils.mjs';
import {createECDSAAccount, getClient, getOperatorAccountBalanceSDK, resetSupplierAllowanceSDK} from './utils_sdk.mjs';
import { connectToContractWith } from './utils_hethers.mjs';

import chai from "chai";
import { hethers } from '@hashgraph/hethers';
import { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let addr1;
let addr2;
let supplier;
let accounts;
let accountClient;
let deployedContracts;
let initialOperatorAccountBalance;
let operatorAccountBalanceAfterAccountsCreation;
let operatorAccountBalanceAfterContractsDeployment;

describe("Supply - Stablecoin Minting & Burning", function () {
    this.timeout(400000);

    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(500, 100);
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accountClient = getClient();
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
    });

    beforeEach(async function () {
        supplier = await createECDSAAccount(clientOperatorForProperties, 200);
        addr1 = await createECDSAAccount(clientOperatorForProperties, 50);
        addr2 = await createECDSAAccount(clientOperatorForProperties, 50);
    });
    it("Should allow supply controller to increase a suppliers allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });
        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });
        expect((await proxyConnnectionWithSupplyController.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).toString()).to.equal("1");

    });
    it("Should allow supply controller to reduce allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });
        await proxyConnnectionWithSupplyController.decreaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });

        expect((await proxyConnnectionWithSupplyController.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).toString()).to.equal("0");
    });
    it("Should not allow supply controller to increase allowance by 0", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await expect(proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 0, { gasLimit: 100000 })).to.be.reverted;
    });
    it("Should not allow supply controller to decrease allowance by 0", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await expect(proxyConnnectionWithSupplyController.decreaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 0, { gasLimit: 100000 })).to.be.reverted;
    });
    it("RBAC -ve : should only allow supply controller to reset a suppliers allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await expect(proxyConnnectionWithMaster.resetSupplierAllowance(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.be.reverted;
    });
    it("RBAC -ve : should only allow supply controller to increase a suppliers allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await expect(proxyConnnectionWithMaster.increaseSupplierAllowance(AccountId.fromString(addr1.accountId).toSolidityAddress(), 1, { gasLimit: 100000 })).to.be.reverted;
    });
    it("RBAC -ve : should only allow supply controller to decrease a suppliers allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await expect(proxyConnnectionWithMaster.decreaseSupplierAllowance(AccountId.fromString(addr1.accountId).toSolidityAddress(), 1, { gasLimit: 100000 })).to.be.reverted;
    });
    it("Should emit event when suppliers allowance is reset", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });

        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }),
                                                             AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        const result = await resetSupplierAllowanceSDK(accounts.supplyController, AccountId.fromString(supplier.accountId).toSolidityAddress(), deployedContracts.proxyContract, { gasLimit: 100000 });

        const event = await findEvent(result, hederaERC20json.abi, "SupplierAllowanceReset");

        expect((event.sender).toUpperCase()).to.equal(('0x'.concat(AccountId.fromString(accounts.supplyController.accountId).toSolidityAddress())).toUpperCase());
        expect((event.supplier).toUpperCase()).to.equal(('0x'.concat(AccountId.fromString(supplier.accountId).toSolidityAddress())).toUpperCase());
        expect(Number(event.oldAllowance)).to.equal(0);
        expect(Number(event.newAllowance)).to.equal(0);
    });
    it("Should allow the supplier to mint", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });
        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });
        const proxyConnnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 400000 });
        expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(1);
    });
    it("Minting should increase the total supply", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });

        const supplyBefore = await proxyConnnectionWithMaster.totalSupply({ gasLimit: 40000 });
        const proxyConnnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 200000 });

        expect(await proxyConnnectionWithMaster.totalSupply({ gasLimit: 40000 })).to.equal(supplyBefore.add(1));
    });
    it("Minting should reduce the suppliers allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 2, { gasLimit: 100000 });

        const proxyConnnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 200000 });

        expect((await proxyConnnectionWithSupplyController.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).toString()).to.equal("1");
    });
    it("RBAC -ve : Should ONLY allow the supplier to mint", async function () {
        const proxyConnnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyConnnectionWithAddr1.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 83000 })).to.be.reverted;
    });
    it("Should not allow the supplier to mint more than its allowance", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });

        const proxyConnnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyConnnectionWithSupplier.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 2, { gasLimit: 200000 })).to.be.reverted;
    });
    it("Should allow the supplier to burn", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 2, { gasLimit: 100000 });

        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 200000 });
        const totalSupply = await proxyConnnectionWithSupplier.totalSupply({ gasLimit: 40000 });
        await proxyConnnectionWithSupplier.burn(1, { gasLimit: 180000 });
        expect(await proxyConnnectionWithSupplier.totalSupply({ gasLimit: 40000 })).to.equal(totalSupply.sub(1));
    });
    it("RBAC -ve : Should ONLY allow the supplier to burn", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await expect(proxyConnnectionWithMaster.burn(1, { gasLimit: 80000 })).to.be.reverted;
    });
    it("Should fail to mint to the null address", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });

        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect(proxyConnnectionWithSupplier.mint(hethers.constants.AddressZero, 1, { gasLimit: 200000 })).to.be.reverted;
    });
    it("Should fail to burn more than tokens held", async function () {
        const allowance = hethers.utils.parseHbar("1");

        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance, { gasLimit: 100000 });

        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect (proxyConnnectionWithSupplier.burn(allowance.mul(2), {gasLimit: 180000})).to.be.reverted;
    });
    it("Should allow minting of largest number (2^64-1)", async function () {
        const allowance = Math.pow(2, 63)-30000;
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 9223372036854776000n, { gasLimit: 100000 });

        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance+"", { gasLimit: 1800000 });
        expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(allowance+"");
    });
    it("Should allow burning of largest number (2^64-1)", async function () {
        const allowance = Math.pow(2, 63)-100000;
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 9223372036854776000n, { gasLimit: 100000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance+"", { gasLimit: 1800000 });
        await proxyConnnectionWithSupplier.burn(allowance+"", { gasLimit: 180000 });
        expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(0);
    });
    afterEach(async function () {
        await burnTokenCreatedAccounts({ addr1, addr2, supplier }, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator({ addr1, addr2, supplier });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("supply.test tests file Supply - Stablecoin Minting & Burning hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

import { AccountId, ContractId } from "@hashgraph/sdk";
import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator, deployContracts,
         hederaERC20AbiInterface, supplyControllerAbiInterface, clientOperatorForProperties, burnTokenCreatedAccounts } from './utils.mjs';
import {getOperatorAccountBalanceSDK, createECDSAAccount, getClient} from './utils_sdk.mjs';
import { connectToContractWith } from './utils_hethers.mjs';
import chai from "chai";
import { hethers } from '@hashgraph/hethers';
import { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let approver;
let supplier;
let approver2;
let supplier2;
let accounts;
let accountClient;
let deployedContracts;
let initialOperatorAccountBalance;
let operatorAccountBalanceAfterAccountsCreation;
let operatorAccountBalanceAfterContractsDeployment;
let proxyConnnectionWithMaster;
let supplyConnectionWithAdminSupply;

describe("Scenario 1 - Simple Mint", function () {
    this.timeout(400000);
    const allowance = hethers.utils.parseHbar("1");
    before(async function () {
      initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
      accounts = await createAccounts(200, 100);

      operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
      accountClient = getClient();
      accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
      deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
      operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);

      proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                 ContractId.fromString(deployedContracts.proxySupplyController).toSolidityAddress(), { gasLimit: 100000 });

      supplyConnectionWithAdminSupply = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
    });
    beforeEach(async function () {
        approver = await createECDSAAccount(clientOperatorForProperties, 50);
        supplier = await createECDSAAccount(clientOperatorForProperties, 50);

        await supplyConnectionWithAdminSupply.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                                  AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});
        const supplyConnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await supplyConnectionWithApprover.increaseSupplierAllowance(allowance.mul(2), { gasLimit: 150000 });

        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1130000 });
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance, { gasLimit: 400000 });
    });

    it("Should allow supplier to mint", async function () {
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance, { gasLimit: 400000 });

        expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(allowance.mul(2));
    });
    it("Should allow supplier to burn", async function () {
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.burn(allowance, { gasLimit: 1800000 });

        expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(0);
    });
    it("Should allow approver to increase allowance", async function () {
        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(allowance, { gasLimit: 150000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);

        expect(await proxyConnnectionWithSupplier.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(allowance.mul(2));
    });
    it("Should allow approver to decrease allowance", async function () {
        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.decreaseSupplierAllowance(allowance, { gasLimit: 150000 });
        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);

        expect(await proxyConnnectionWithSupplier.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(0);
    });
    afterEach(async function () {
      await burnTokenCreatedAccounts({ approver, supplier }, accounts, deployedContracts);
      await recoverHbarFromAccountsToOperator({ approver, supplier });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("scenario.test tests file Scenario 1 - Simple Mint hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

describe("Scenario 2 - Remove Approver Supplier Pair from Supply Controller", function () {
    this.timeout(400000);
    const allowance = hethers.utils.parseHbar("1");

    before(async function () {
      initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
      accounts = await createAccounts(200, 100);
      operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
      accountClient = getClient();
      accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
      deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
      operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);

      proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                ContractId.fromString(deployedContracts.proxySupplyController).toSolidityAddress(), { gasLimit: 100000 });

      supplyConnectionWithAdminSupply = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
    });
    beforeEach(async function () {
        approver = await createECDSAAccount(clientOperatorForProperties, 50);
        supplier = await createECDSAAccount(clientOperatorForProperties, 50);

        await supplyConnectionWithAdminSupply.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                                  AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});
        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(allowance.mul(2), { gasLimit: 150000 });

        const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1130000 });
        await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance, { gasLimit: 400000 });

        await supplyConnectionWithAdminSupply.removeApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(), {gasLimit: 150000});
    });
    it("RBAC -ve : Should not allow supply controller removed supplier to mint", async function () {
      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await expect(proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), allowance, { gasLimit: 1800000 })).to.be.reverted;
    });
    it("RBAC -ve : Should not allow supply controller removed supplier to burn", async function () {
      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await expect(proxyConnnectionWithSupplier.burn(allowance, { gasLimit: 1800000 })).to.be.reverted;
    });

    it("RBAC -ve : Should not allow supply controller removed approver to increase allowance", async function () {
      const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
      await expect(proxyConnnectionWithApprover.increaseSupplierAllowance(allowance, { gasLimit: 150000 })).to.be.reverted;
    });
    it("RBAC -ve : Should not allow supply controller removed approver to decrease allowance", async function () {
      const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
      await expect(proxyConnnectionWithApprover.decreaseSupplierAllowance(allowance, { gasLimit: 150000 })).to.be.reverted;
    });
    afterEach(async function () {
      await burnTokenCreatedAccounts({ approver, supplier }, accounts, deployedContracts);
      await recoverHbarFromAccountsToOperator({ approver, supplier });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("scenario.test tests file Scenario 2 - Remove Approver Supplier Pair from Supply Controller hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

describe("Scenario 3 - Multiple Approvers and Suppliers", function () {
    this.timeout(400000);
    const allowance = hethers.utils.parseHbar("1");

    before(async function () {
      initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
      accounts = await createAccounts(200, 100);
      operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
      accountClient = getClient();
      accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
      deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
      operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);

      proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                ContractId.fromString(deployedContracts.proxySupplyController).toSolidityAddress(), { gasLimit: 100000 });

      supplyConnectionWithAdminSupply = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
    });
    beforeEach(async function () {
        approver = await createECDSAAccount(clientOperatorForProperties, 100);
        supplier = await createECDSAAccount(clientOperatorForProperties, 100);
        approver2 = await createECDSAAccount(clientOperatorForProperties, 100);
        supplier2 = await createECDSAAccount(clientOperatorForProperties, 100);

        await supplyConnectionWithAdminSupply.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                                  AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(allowance.mul(2), { gasLimit: 150000 });

        await supplyConnectionWithAdminSupply.addApproverSupplier(AccountId.fromString(approver2.accountId).toSolidityAddress(),
                                                                  AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover2 = await connectToContractWith(approver2, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover2.increaseSupplierAllowance(allowance, { gasLimit: 100000});
    });
    it("Should configure two minters and each mint distinct amounts", async function () {
      const amount = hethers.utils.parseHbar("0.5");
      const amount2 = hethers.utils.parseHbar("0.6");

      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1130000 });
      await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), amount, { gasLimit: 400000 })

      const proxyConnnectionWithSupplier2 = await connectToContractWith(supplier2, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier2.associateToken(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 2000000 });
      await proxyConnnectionWithSupplier2.mint(AccountId.fromString(supplier2.accountId).toSolidityAddress(), amount2, { gasLimit: 400000 })

      expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(amount);
      expect(await proxyConnnectionWithSupplier2.balanceOf(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(amount2);
    });
    it("Should configure two suppliers, each minting distinct amounts and then remove one supplier", async function () {
      const amount = hethers.utils.parseHbar("0.5");
      const amount2 = hethers.utils.parseHbar("0.6");

      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1130000 });
      await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), amount, { gasLimit: 400000 })

      const proxyConnnectionWithSupplier2 = await connectToContractWith(supplier2, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier2.associateToken(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 2000000 });
      await proxyConnnectionWithSupplier2.mint(AccountId.fromString(supplier2.accountId).toSolidityAddress(), amount2, { gasLimit: 400000 })

      await supplyConnectionWithAdminSupply.removeApproverSupplier(AccountId.fromString(approver2.accountId).toSolidityAddress(), { gasLimit: 200000});

      expect(await proxyConnnectionWithSupplier2.hasRole(await proxyConnnectionWithSupplier2.SUPPLIER_ROLE({ gasLimit: 35000 }),
                                                         AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 65000})
      ).to.equal(false);
    });
    it("Should configure two suppliers and adjust both allowances", async function () {
      const amount = hethers.utils.parseHbar("0.5");
      const amount2 = hethers.utils.parseHbar("0.6");

      const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
      await proxyConnnectionWithApprover.increaseSupplierAllowance(amount, { gasLimit: 150000 });

      const proxyConnnectionWithApprover2 = await connectToContractWith(approver2, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
      await proxyConnnectionWithApprover2.increaseSupplierAllowance(amount2, { gasLimit: 150000 });

      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      expect(await proxyConnnectionWithSupplier.supplierAllowance(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(allowance.add(amount2));
    });

    it("Should configure two suppliers, one with zero allowance fails to mint", async function () {
      const amount = hethers.utils.parseHbar("0.5");
      const amount2 = hethers.utils.parseHbar("0.6");

      const proxyConnnectionWithApprover2 = await connectToContractWith(approver2, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
      await proxyConnnectionWithApprover2.decreaseSupplierAllowance(amount2, { gasLimit: 150000 });

      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1130000 });
      await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), amount, { gasLimit: 400000 });

      const proxyConnnectionWithSupplier2 = await connectToContractWith(supplier2, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier2.associateToken(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 1130000 });

      await expect(proxyConnnectionWithSupplier2.mint(AccountId.fromString(supplier2.accountId).toSolidityAddress(), amount2, { gasLimit: 400000 })
      ).to.be.reverted;
      expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(amount);
    });
    it("Should configure two suppliers, each mints to themselves and then burns certain amount", async function () {
      const amount = hethers.utils.parseHbar("0.5");
      const amount2 = hethers.utils.parseHbar("0.6");

      const proxyConnnectionWithSupplier = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier.associateToken(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 1130000 });
      await proxyConnnectionWithSupplier.mint(AccountId.fromString(supplier.accountId).toSolidityAddress(), amount, { gasLimit: 400000 });
      const proxyConnnectionWithSupplier2 = await connectToContractWith(supplier2, deployedContracts.proxyContract, hederaERC20AbiInterface);
      await proxyConnnectionWithSupplier2.associateToken(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 1130000 });
      await proxyConnnectionWithSupplier2.mint(AccountId.fromString(supplier2.accountId).toSolidityAddress(), amount2, { gasLimit: 400000 });
      await proxyConnnectionWithSupplier.burn(amount, { gasLimit: 800000 });
      await proxyConnnectionWithSupplier2.burn(amount2, { gasLimit: 800000 });
      expect(await proxyConnnectionWithSupplier.balanceOf(AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(0);
      expect(await proxyConnnectionWithSupplier2.balanceOf(AccountId.fromString(supplier2.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(0);
    });
    afterEach(async function () {
      await burnTokenCreatedAccounts({ approver, supplier, approver2, supplier2 }, accounts, deployedContracts);
      await recoverHbarFromAccountsToOperator({ approver, supplier, approver2, supplier2 });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("scenario.test tests file Scenario 3 - Multiple Approvers and Suppliers hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

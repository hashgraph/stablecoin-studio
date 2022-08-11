import { AccountId } from "@hashgraph/sdk";
import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator, deployContracts,
         hederaERC20AbiInterface, clientOperatorForProperties, hederaERC20json, burnTokenCreatedAccounts } from './utils.mjs';
import { createECDSAAccount, approveSDK, transferFromSDK, allowanceSDK, transferSDK, increaseAllowanceSDK,
         decreaseAllowanceSDK, getOperatorAccountBalanceSDK, getClient  } from './utils_sdk.mjs';
import { connectToContractWith } from './utils_hethers.mjs';
import chai from "chai";
import { expect } from "chai";
import { hethers } from '@hashgraph/hethers';
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let addr1;
let addr2;
let accounts;
let supplier;
let deployedContracts;
let proxyConnectionWithAccount;
let initialOperatorAccountBalance;
let operatorAccountBalanceAfterAccountsCreation;
let operatorAccountBalanceAfterContractsDeployment;

describe("General ERC20", function () {
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
    it("Should have correct name", async function() {
        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithMaster.name({gasLimit: 36000 })).to.equals(tokenName);
    });
    it("Should have correct symbol", async function() {
        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithMaster.symbol({gasLimit: 36000 })).to.equals(tokenSymbol);
    });
    it("Should have correct decimals", async function() {
        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithMaster.decimals({gasLimit: 36000 })).to.equals(parseInt(tokenDecimals));
    });
    it("Should set default admin role to the masterRole", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.hasRole(await proxyConnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(), { gasLimit: 38000 })).to.equal(true);
    });
    it("Should set upgrader role to the masterRole", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.hasRole(await proxyConnectionWithAccount.UPGRADER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(), { gasLimit: 38000 })).to.equal(true);
    });
    it("Should set upgrader role to the upgrader", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.hasRole(await proxyConnectionWithAccount.UPGRADER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(), { gasLimit: 38000 })).to.equal(true);
    });
    it("Should set contract admin to the contractAdmin", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.hasRole(await proxyConnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.admin.accountId.toString()).toSolidityAddress(), { gasLimit: 38000 })).to.equal(true);
    });
    it("Should set rescuer role to the rescuer", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.hasRole(await proxyConnectionWithAccount.RESCUER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(), { gasLimit: 38000 })).to.equal(true);
    });
    it("Should set default admin role as admin of contract admin", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.getRoleAdmin(await proxyConnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 28000 }), { gasLimit: 50000 })).to.equal(await proxyConnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 28000 }));
    });
    it("Should set default admin role as admin of upgrader role", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.getRoleAdmin(await proxyConnectionWithAccount.UPGRADER_ROLE({ gasLimit: 28000 }), { gasLimit: 50000 })).to.equal(await proxyConnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 28000 }));
    });
    it("Should set default admin role as admin of supply controller", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.getRoleAdmin(await proxyConnectionWithAccount.SUPPLY_CONTROLLER_ROLE({ gasLimit: 28000 }), { gasLimit: 50000 })).to.equal(await proxyConnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 28000 }));
    });
    it("Should set contract admin as admin of rescuer role", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.getRoleAdmin(await proxyConnectionWithAccount.RESCUER_ROLE({ gasLimit: 28000 }), { gasLimit: 50000 })).to.equal(await proxyConnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 28000 }));
    });
    it("Should set supply controller as admin of supplier", async function () {
        const proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAccount.getRoleAdmin(await proxyConnectionWithAccount.SUPPLIER_ROLE({ gasLimit: 28000 }), { gasLimit: 50000 })).to.equal(await proxyConnectionWithAccount.SUPPLY_CONTROLLER_ROLE({ gasLimit: 28000 }));
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        console.log("recovering hbar from accounts to operator");
        await recoverHbarFromAccountsToOperator(accounts);
        console.log("finalOperatorAccountBalance");
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("erc20.test tests file General ERC20 hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

describe("Deploy ERC20", function () {
    this.timeout(400000);
    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(500, 100);
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        let accountClient = getClient();
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        proxyConnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxyContract, hederaERC20AbiInterface);
    });
    it("Initialize should fail if token master address is 0x0", async function () {
        await expect(proxyConnectionWithAccount.initialize(hethers.constants.AddressZero,
            AccountId.fromString(accounts.admin.accountId).toSolidityAddress(),
            AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(),
            AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(),
            { gasLimit: 250000 })).to.be.reverted;
    });
    it("Initialize should fail if token admin address is 0x0", async function () {
        await expect(proxyConnectionWithAccount.initialize(AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(),
            hethers.constants.AddressZero,
            AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(),
            AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(),
            { gasLimit: 250000 })).to.be.reverted;
    });
    it("Initialize should fail if token upgrader address is 0x0", async function () {
        await expect(proxyConnectionWithAccount.initialize(AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(),
            AccountId.fromString(accounts.admin.accountId).toSolidityAddress(),
            hethers.constants.AddressZero,
            AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(),
            { gasLimit: 250000 })).to.be.reverted;
    });
    it("Initialize should fail if rescuer address is 0x0", async function () {
        await expect(proxyConnectionWithAccount.initialize(AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(),
            AccountId.fromString(accounts.admin.accountId).toSolidityAddress(),
            AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(),
            hethers.constants.AddressZero,
            { gasLimit: 250000 })).to.be.reverted;
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("erc20.test tests file Deploy ERC20 hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

describe("Approvals and Transfers ERC20", function () {
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
        addr1 = await createECDSAAccount(clientOperatorForProperties, 500);
        addr2 = await createECDSAAccount(clientOperatorForProperties, 500);
        supplier = await createECDSAAccount(clientOperatorForProperties, 500);
    });
    it("TransferFrom should transfer from sender to recipient", async function () {
        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithMaster.grantRole(await proxyConnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithSupplyController.grantRole(await proxyConnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });
        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnectionWithSupply = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);

        await proxyConnectionWithSupply.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 400000 });

        const proxyConnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await approveSDK(addr2, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr1.accountId).toSolidityAddress(), 1);

        await proxyConnectionWithAddr1.associateToken(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await proxyConnectionWithAddr1.transferFrom(AccountId.fromString(addr2.accountId).toSolidityAddress(), AccountId.fromString(addr1.accountId).toSolidityAddress(), 1,
            { gasLimit: 400000 });

        expect(await proxyConnectionWithAddr1.balanceOf(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(1);
    });
    it("Should transferFrom 0 tokens", async function () {
        const proxyConnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr1.associateToken(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await proxyConnectionWithAddr1.approve(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 400000 });
        await proxyConnectionWithAddr1.transferFrom(AccountId.fromString(addr2.accountId).toSolidityAddress(), AccountId.fromString(addr1.accountId).toSolidityAddress(), 1,
            { gasLimit: 400000 });

        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        expect(await proxyConnectionWithAddr2.balanceOf(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 100000 })).to.equal(0);
    });
    it("Should return true on approve", async function () {
        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        expect(await approveSDK(addr2, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr1.accountId).toSolidityAddress(), 1)).to.equals(true);
    });
    it("Should return true on transferFrom", async function () {
        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithMaster.grantRole(await proxyConnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithSupplyController.grantRole(await proxyConnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });
        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnectionWithSupply = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);

        await proxyConnectionWithSupply.mint(AccountId.fromString(addr2.accountId).toSolidityAddress(), 1, { gasLimit: 400000 });
        await approveSDK(addr2, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr1.accountId).toSolidityAddress(), 1);
        const proxyConnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr1.associateToken(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        expect(await transferFromSDK(addr1, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr2.accountId).toSolidityAddress(), AccountId.fromString(addr1.accountId).toSolidityAddress(), 1)).to.equal(true);
    });
    it("Should return true on transfer", async function () {
        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithMaster.grantRole(await proxyConnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithSupplyController.grantRole(await proxyConnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        await proxyConnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(), 1, { gasLimit: 100000 });
        const proxyConnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr1.associateToken(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        const proxyConnectionWithSupply = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);

        await proxyConnectionWithSupply.mint(AccountId.fromString(addr1.accountId).toSolidityAddress(), 1, { gasLimit: 400000 });
        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });

        expect(await transferSDK(addr1, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr2.accountId).toSolidityAddress(), 1)).to.equal(true);
    });
    it("Approving should set allowance", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await approveSDK(addr2, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr1.accountId).toSolidityAddress(), amount.toNumber());
        const amountAllowance = await proxyConnectionWithAddr2.allowance(
            AccountId.fromString(addr2.accountId).toSolidityAddress(),
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            { gasLimit: 80000 });
        expect(amountAllowance).to.equal(amount);

    });
    it("IncreaseAllowance should increase allowance", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });

        let amountAllowance = await proxyConnectionWithAddr2.allowance(AccountId.fromString(addr2.accountId).toSolidityAddress(),
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            { gasLimit: 80000 });
        expect(amountAllowance).to.equal(0);
        await increaseAllowanceSDK(deployedContracts.proxyContract, hederaERC20json.abi, addr2, AccountId.fromString(addr1.accountId).toSolidityAddress(), amount.toNumber());
        const finalAmountAllowance = await proxyConnectionWithAddr2.allowance(AccountId.fromString(addr2.accountId).toSolidityAddress(),
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            { gasLimit: 80000 });
        expect(finalAmountAllowance.toNumber()).to.equal(amount.toNumber() + amountAllowance.toNumber());
    });
    it("DecreaseAllowance should decrease allowance", async function () {
        const amount = hethers.utils.parseHbar("1");
        const decreaseAmount = hethers.utils.parseHbar("0.1");
        const resultAmount = hethers.utils.parseHbar("0.9");

        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });

        await increaseAllowanceSDK(deployedContracts.proxyContract, hederaERC20json.abi, addr2, AccountId.fromString(addr1.accountId).toSolidityAddress(), amount.toNumber());
        await decreaseAllowanceSDK(deployedContracts.proxyContract, hederaERC20json.abi, addr2, AccountId.fromString(addr1.accountId).toSolidityAddress(), decreaseAmount.toNumber());

        const amountAllowance = await proxyConnectionWithAddr2.allowance(AccountId.fromString(addr2.accountId).toSolidityAddress(),
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            { gasLimit: 80000 });
        expect(amountAllowance).to.equal(resultAmount);
    });
    it("Allowance should show the right allowance", async function () {
        const amount = hethers.utils.parseHbar("1");
        const transferAmount = hethers.utils.parseHbar("0.1");
        const resultAmount = hethers.utils.parseHbar("0.9");

        const proxyConnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithMaster.grantRole(await proxyConnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 28000 }), AccountId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
        const proxyConnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithSupplyController.grantRole(await proxyConnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }), AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });
        await proxyConnectionWithSupplyController.increaseSupplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(),
            amount.toNumber(), { gasLimit: 100000 });

        const proxyConnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr1.associateToken(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 1300000 });

        const proxyConnectionWithSupply = await connectToContractWith(supplier, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithSupply.mint(AccountId.fromString(addr1.accountId).toSolidityAddress(), amount.toNumber(), { gasLimit: 400000 });

        await approveSDK(addr1, deployedContracts.proxyContract, hederaERC20json.abi, AccountId.fromString(addr2.accountId).toSolidityAddress(), amount.toNumber());

        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await transferFromSDK(addr2, deployedContracts.proxyContract,
            hederaERC20json.abi,
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            AccountId.fromString(addr2.accountId).toSolidityAddress(), transferAmount.toNumber());

        const amountAllowance = await allowanceSDK(deployedContracts.proxyContract,
            hederaERC20json.abi,
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            AccountId.fromString(addr2.accountId).toSolidityAddress(),
            clientOperatorForProperties);

        expect(amountAllowance).to.equal(resultAmount);
    });
    it("Should accept 0 token allowance", async function () {
        const amount = 0;
        const proxyConnectionWithAddr2 = await connectToContractWith(addr2, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnectionWithAddr2.associateToken(AccountId.fromString(addr2.accountId).toSolidityAddress(), { gasLimit: 1300000 });
        await proxyConnectionWithAddr2.approve(AccountId.fromString(addr1.accountId).toSolidityAddress(), amount, { gasLimit: 400000 });

        const amountAllowance = await allowanceSDK(deployedContracts.proxyContract,
            hederaERC20json.abi,
            AccountId.fromString(addr2.accountId).toSolidityAddress(),
            AccountId.fromString(addr1.accountId).toSolidityAddress(),
            clientOperatorForProperties);
        expect(amountAllowance).to.equal(amount);
    });
    afterEach(async function () {
        await burnTokenCreatedAccounts({ addr1, addr2, supplier }, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator({ addr1, addr2, supplier });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        console.log("recovering hbar from accounts to operator");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("erc20.test tests file General ERC20 hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

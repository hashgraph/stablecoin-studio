import { AccountId, ContractId } from "@hashgraph/sdk";
import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator, deployContracts,
         hederaERC20AbiInterface, supplyControllerAbiInterface, clientOperatorForProperties,
         supplyControllerBytecode,hederaERC1967ProxyBytecode, hederaERC1967ProxyAbiInterface, findEvent,
         burnTokenCreatedAccounts, supplyControllerJson } from './utils.mjs';
import {
    getOperatorAccountBalanceSDK, createECDSAAccount, increaseSupplierAllowanceSDK,
    decreaseSupplierAllowanceSDK, getClient
} from './utils_sdk.mjs';
import { connectToContractWith, connectToContractAddressWith, deployContractProxyWithHethers,
         deployContractSupplyWithHethers } from './utils_hethers.mjs';
import * as fs from "fs";
import { Interface } from "@ethersproject/abi";
import chai from "chai";
import { hethers } from '@hashgraph/hethers';
import { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let zeroAddress = hethers.constants.AddressZero;

let addr1;
let addr2;
let approver;
let supplier;
let accounts;
let accountClient;
let deployedContracts;
let initialOperatorAccountBalance;
let operatorAccountBalanceAfterAccountsCreation;
let operatorAccountBalanceAfterContractsDeployment;

describe("SupplyController - Stablecoin Minting & Burning", function () {
    this.timeout(400000);

    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(1000, 200);
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accountClient = getClient();
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
    });

    beforeEach(async function () {
        supplier = await createECDSAAccount(clientOperatorForProperties, 100);
        approver = await createECDSAAccount(clientOperatorForProperties, 101);
        addr1 = await createECDSAAccount(clientOperatorForProperties, 102);
        addr2 = await createECDSAAccount(clientOperatorForProperties, 103);
    });
    it("Should initialize correctly", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.account, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        const contractAddress = await proxyConnnectionWithAccount.getTokenContractAddress({ gasLimit: 31000});
        const addressContract = '0x'.concat(ContractId.fromString(deployedContracts.proxyContract).toSolidityAddress());
        expect(contractAddress.toLocaleUpperCase()).to.equal(addressContract.toLocaleUpperCase());

        expect( await proxyConnnectionWithAccount.hasRole(await proxyConnnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 35000 }),
                AccountId.fromString(accounts.supplyControllerAdmin.accountId).toSolidityAddress(), { gasLimit: 65000})
        ).to.equal(true);

        expect( await proxyConnnectionWithAccount.hasRole(await proxyConnnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 35000 }),
                AccountId.fromString(accounts.masterSupplyController.accountId).toSolidityAddress(), { gasLimit: 65000})
        ).to.equal(true);
    });
    it("Should set default admin role to the masterSupplyController", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect( await proxyConnnectionWithAccount.hasRole(await proxyConnnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 35000 }),
                AccountId.fromString(accounts.masterSupplyController.accountId).toSolidityAddress(), { gasLimit: 65000})
        ).to.equal(true);
    });
    it("Should set upgrader role to the masterRole", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect( await proxyConnnectionWithAccount.hasRole(await proxyConnnectionWithAccount.UPGRADER_ROLE({ gasLimit: 35000 }),
                AccountId.fromString(accounts.masterSupplyController.accountId).toSolidityAddress(), { gasLimit: 65000})
        ).to.equal(true);
    });
    it("Should set upgrader role to the upgrader", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect( await proxyConnnectionWithAccount.hasRole(await proxyConnnectionWithAccount.UPGRADER_ROLE({ gasLimit: 35000 }),
                AccountId.fromString(accounts.upgraderSupplyController.accountId).toSolidityAddress(), { gasLimit: 65000})
        ).to.equal(true);
    });
    it("Should set contract admin to the contractAdmin", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect( await proxyConnnectionWithAccount.hasRole(await proxyConnnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 35000 }),
                AccountId.fromString(accounts.supplyControllerAdmin.accountId).toSolidityAddress(), { gasLimit: 65000})
        ).to.equal(true);
    });
    it("Should set default admin role as admin of contract admin", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect( await proxyConnnectionWithAccount.getRoleAdmin(await proxyConnnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 35000 }), { gasLimit: 65000})).to.equal(
          await proxyConnnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 35000 })  );
    });
    it("Should set default admin role as admin of upgrader role", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect( await proxyConnnectionWithAccount.getRoleAdmin(await proxyConnnectionWithAccount.UPGRADER_ROLE({ gasLimit: 35000 }), { gasLimit: 65000})).to.equal(
          await proxyConnnectionWithAccount.DEFAULT_ADMIN_ROLE({ gasLimit: 35000 })  );
    });
    it("Should set contract admin role as admin of approver role", async function () {
        const proxyConnnectionWithAccount = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        expect(await proxyConnnectionWithAccount.getRoleAdmin(await proxyConnnectionWithAccount.APPROVER_ROLE({ gasLimit: 35000 }), { gasLimit: 65000})).to.equal(
                await proxyConnnectionWithAccount.CONTRACT_ADMIN_ROLE({ gasLimit: 35000 }) );
    });
    it("Should allow an approver supplier pair to be added", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 300000});

        const getSupplier = await proxyConnnectionWithAdmin.getSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),{ gasLimit: 65000});
        const addressSupplier = '0x'.concat(AccountId.fromString(supplier.accountId).toSolidityAddress());
        const getApprover = await proxyConnnectionWithAdmin.getApprover(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000});
        const addressApprover = '0x'.concat(AccountId.fromString(approver.accountId).toSolidityAddress());

        expect(getSupplier.toLocaleUpperCase()).to.equal(addressSupplier.toLocaleUpperCase());
        expect(getApprover.toLocaleUpperCase()).to.equal(addressApprover.toLocaleUpperCase());
    });
    it("Should initialize approver supplier pair with 0 minting allowance", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        expect(await proxyConnnectionWithAdmin.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000})).to.equal(0);
    });
    it("RBAC -ve : Should only allow the contract admin to add approver supplier pair", async function () {
        const proxyConnnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await expect(proxyConnnectionWithAddr1.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                                   AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000})).to.be.reverted;
    });
    it("addApproverSupplier() should throw when approver is the zero address ", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await expect(proxyConnnectionWithAdmin.addApproverSupplier(zeroAddress,
                    AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000})
        ).to.be.reverted;
    });
    it("addApproverSupplier() should throw when supplier is the zero address ", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await expect(proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                    zeroAddress,  { gasLimit: 200000})
        ).to.be.reverted;
    });
    it("Should allow an approver supplier pair to be removed", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        await proxyConnnectionWithAdmin.removeApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(), { gasLimit: 90000});

        const getSupplier = await proxyConnnectionWithAdmin.getSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),{ gasLimit: 65000});
        const getApprover = await proxyConnnectionWithAdmin.getApprover(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000});

        expect(getSupplier.toLocaleUpperCase()).to.equal(zeroAddress.toLocaleUpperCase());
        expect(getApprover.toLocaleUpperCase()).to.equal(zeroAddress.toLocaleUpperCase());
    });
    it("Should have 0 minting allowance when approver supplier pair is removed", async function () {
        const allowance = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(allowance, { gasLimit: 100000});
        const supplierAllonwance = await proxyConnnectionWithAdmin.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000})
        expect(supplierAllonwance).to.equal(allowance);

        await proxyConnnectionWithAdmin.removeApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(), { gasLimit: 90000});
        expect(await proxyConnnectionWithAdmin.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000})
        ).to.equal(0);
    });
    it("RBAC -ve : Should only allow the contract admin to remove approver supplier pairs", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);

        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithAddr1 = await connectToContractWith(addr1, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithAddr1.removeApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(), { gasLimit: 90000})
        ).to.be.reverted;
    });
    it("removeApproverSupplier() should throw when approver is the zero address ", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        await expect(proxyConnnectionWithAdmin.removeApproverSupplier(zeroAddress, { gasLimit: 90000})).to.be.reverted;
    });
    it("removeApproverSupplier() should throw when approver hasn't been previously added as approver", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithAdmin.removeApproverSupplier(AccountId.fromString(addr1.accountId).toSolidityAddress(), { gasLimit: 90000})
        ).to.be.reverted;

    });
    it("Should increase the allowance of a supplier", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(amount, { gasLimit: 100000});
        const supplierAllonwance = await proxyConnnectionWithAdmin.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000})

        expect(supplierAllonwance).to.equal(amount);
    });
    it("Should not increase the allowance of invalid approver supplier pair", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.grantRole(await proxyConnnectionWithAdmin.APPROVER_ROLE({ gasLimit: 35000 }),
                                                  AccountId.fromString(approver.accountId).toSolidityAddress(), { gasLimit: 80000 });

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithApprover.increaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("RBAC -ve : Should only allow an approver to increase the allowance of a supplier", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithAdmin.increaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("Should only increase allowance with amount greater than zero", async function () {
        const amount = hethers.utils.parseHbar("0");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        await expect(proxyConnnectionWithAdmin.increaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("Should only increase allowance with token supplier role", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   AccountId.fromString(accounts.supplyControllerAdmin.accountId).toSolidityAddress(), { gasLimit: 80000 });

        const contractConectSupply = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxyContract, hederaERC20AbiInterface );
        await contractConectSupply.revokeRole(await contractConectSupply.SUPPLIER_ROLE({ gasLimit: 35000 }),
                                              AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithApprover.increaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("Should emit event when allowance is increased", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const result = await increaseSupplierAllowanceSDK(deployedContracts.proxySupplyController, approver, 1);

        const event = await findEvent(result, supplyControllerJson.abi, "AllowanceIncreased");
        expect((event.sender).toUpperCase()).to.equal(('0x'.concat(AccountId.fromString(approver.accountId).toSolidityAddress())).toUpperCase());
        expect((event.supplier).toUpperCase()).to.equal(('0x'.concat(AccountId.fromString(supplier.accountId).toSolidityAddress())).toUpperCase());
        expect(Number(event.amount)).to.equal(1);
    });
    it("Should decrease the allowance of a supplier", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver,  deployedContracts.proxySupplyController, supplyControllerAbiInterface );
        await proxyConnnectionWithApprover.increaseSupplierAllowance(hethers.utils.parseHbar("1"), { gasLimit: 100000});

        await proxyConnnectionWithApprover.decreaseSupplierAllowance(hethers.utils.parseHbar("0.1"), { gasLimit: 100000});

        const supplierAllonwance = await proxyConnnectionWithAdmin.supplierAllowance(AccountId.fromString(supplier.accountId).toSolidityAddress(),{ gasLimit: 65000})

        expect(supplierAllonwance).to.equal(hethers.utils.parseHbar("0.9"));
    });
    it("Should not decrease the allowance of invalid approver supplier pair", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.grantRole(await proxyConnnectionWithAdmin.APPROVER_ROLE({ gasLimit: 35000 }),
                                                  AccountId.fromString(approver.accountId).toSolidityAddress(), { gasLimit: 80000 });

        const proxyConnnectionWithApprover = await connectToContractWith(approver,  deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithApprover.decreaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("RBAC -ve : Should only allow an approver to decrease the allowance of a supplier", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithMaster = await connectToContractWith(accounts.masterSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithMaster.decreaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("Should only decrease allowance with amount greater than zero", async function () {
        const amount = hethers.utils.parseHbar("0");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver,  deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithApprover.decreaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("Should only decrease allowance with token supplier role", async function () {
        const amount = hethers.utils.parseHbar("1");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                   AccountId.fromString(accounts.supplyControllerAdmin.accountId).toSolidityAddress(), { gasLimit: 80000 });

        const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await proxyConnnectionWithSupplyController.revokeRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 35000 }),
                                                              AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 100000 });

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxyContract, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithApprover.decreaseSupplierAllowance(amount, { gasLimit: 100000})).to.be.reverted;
    });
    it("Shouldn't decrease allowance by an amount bigger than the allowance", async function () {
        const amount = hethers.utils.parseHbar("0");

        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver,  deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(hethers.utils.parseHbar("1"), { gasLimit: 100000});
        await expect(proxyConnnectionWithApprover.decreaseSupplierAllowance(hethers.utils.parseHbar("2"), { gasLimit: 100000})).to.be.reverted;

    });
    it("Should emit event when allowance is decreased", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        const proxyConnnectionWithApprover = await connectToContractWith(approver, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithApprover.increaseSupplierAllowance(1, { gasLimit: 100000});

        const result = await decreaseSupplierAllowanceSDK(deployedContracts.proxySupplyController, approver, 1);

        const event = await findEvent(result, supplyControllerJson.abi, "AllowanceDecreased");
        expect((event.sender).toUpperCase()).to.equal(('0x'.concat(AccountId.fromString(approver.accountId).toSolidityAddress())).toUpperCase());
        expect((event.supplier).toUpperCase()).to.equal(('0x'.concat(AccountId.fromString(supplier.accountId).toSolidityAddress())).toUpperCase());
        expect(Number(event.amount)).to.equal(1);
    });
    it("Should not allow you to add an approver supplier twice", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        await expect(proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                                   AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000})).to.be.reverted;
    });
    it("Should not allow you to add an approver supplier for a supplier that already exists", async function () {
        const proxyConnnectionWithAdmin = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                            AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000});

        await expect(proxyConnnectionWithAdmin.addApproverSupplier(AccountId.fromString(approver.accountId).toSolidityAddress(),
                                                                   AccountId.fromString(supplier.accountId).toSolidityAddress(), { gasLimit: 200000})).to.be.reverted;
    });
    it("Should allow upgradeability", async function () {
        const abi = ["function initializeV1_1() external"];
        const iface = new hethers.utils.Interface(abi);
        const functionSelector = iface.getSighash("initializeV1_1");

        const supplyControllerjsonV1_1 = JSON.parse(fs.readFileSync('./build/contracts/SupplyControllerV1_1.json', 'utf8'));
        const supplyControllerAbiInterfaceV1_1 = new Interface(supplyControllerjsonV1_1.abi);
        const supplyControllerBytecodeV1_1 = supplyControllerjsonV1_1.bytecode;

        const supplyControllerContractV1_1 = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecodeV1_1, supplyControllerAbiInterfaceV1_1);

        const proxySupplyControllerUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await proxySupplyControllerUpgrader.upgradeToAndCall(supplyControllerContractV1_1.address, functionSelector, { gasLimit: 100000});

        const supplyControllerContractUpgraded = supplyControllerContractV1_1.attach(ContractId.fromString(deployedContracts.proxySupplyController.toString()).toSolidityAddress());

        expect(await supplyControllerContractUpgraded.version({ gasLimit: 30000})).to.equal(hethers.utils.formatBytes32String("1.1"));
    });
    it("Should not allow token address to be zero", async function () {
        const contractSC_zero = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecode, supplyControllerAbiInterface);
        const supplyControllerContract_zero = await deployContractProxyWithHethers(accounts.account, hederaERC1967ProxyBytecode, hederaERC1967ProxyAbiInterface, contractSC_zero.address);

        const supplyControllerConnectAccount_zero = await connectToContractAddressWith(accounts.account, supplyControllerContract_zero.address, supplyControllerAbiInterface);
        await expect( supplyControllerConnectAccount_zero.initialize(zeroAddress,
                                                                    AccountId.fromString(accounts.masterSupplyController.accountId.toString()).toSolidityAddress(),
                                                                    AccountId.fromString(accounts.supplyControllerAdmin.accountId.toString()).toSolidityAddress(),
                                                                    AccountId.fromString(accounts.upgraderSupplyController.accountId.toString()).toSolidityAddress(),
                                                                    { gasLimit: 250000 })
        ).to.be.reverted;
    });
    it("Should not allow supply controller master address to be zero", async function () {
        const contractSC_zero = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecode, supplyControllerAbiInterface);
        const supplyControllerContract_zero = await deployContractProxyWithHethers(accounts.account, hederaERC1967ProxyBytecode, hederaERC1967ProxyAbiInterface, contractSC_zero.address);

        const supplyControllerConnectAccount_zero = await connectToContractAddressWith(accounts.account, supplyControllerContract_zero.address, supplyControllerAbiInterface);
        await expect( supplyControllerConnectAccount_zero.initialize(ContractId.fromString(deployedContracts.proxyContract).toSolidityAddress(),
                                                                     zeroAddress,
                                                                     AccountId.fromString(accounts.supplyControllerAdmin.accountId.toString()).toSolidityAddress(),
                                                                     AccountId.fromString(accounts.upgraderSupplyController.accountId.toString()).toSolidityAddress(),
                                                                     { gasLimit: 250000 })
        ).to.be.reverted;
    });
    it("Should not allow supply controller admin address to be zero", async function () {
        const contractSC_zero = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecode, supplyControllerAbiInterface);
        const supplyControllerContract_zero = await deployContractProxyWithHethers(accounts.account, hederaERC1967ProxyBytecode, hederaERC1967ProxyAbiInterface, contractSC_zero.address);

        const supplyControllerConnectAccount_zero = await connectToContractAddressWith(accounts.account, supplyControllerContract_zero.address, supplyControllerAbiInterface);
        await expect( supplyControllerConnectAccount_zero.initialize(ContractId.fromString(deployedContracts.proxyContract).toSolidityAddress(),
                                                                     AccountId.fromString(accounts.masterSupplyController.accountId.toString()).toSolidityAddress(),
                                                                     zeroAddress,
                                                                     AccountId.fromString(accounts.upgraderSupplyController.accountId.toString()).toSolidityAddress(),
                                                                     { gasLimit: 250000 })
        ).to.be.reverted;
    });
    it("Should not allow upgrader address to be zero", async function () {
        const contractSC_zero = await deployContractSupplyWithHethers(accounts.account, supplyControllerBytecode, supplyControllerAbiInterface);
        const supplyControllerContract_zero = await deployContractProxyWithHethers(accounts.account, hederaERC1967ProxyBytecode, hederaERC1967ProxyAbiInterface, contractSC_zero.address);

        const supplyControllerConnectAccount_zero = await connectToContractAddressWith(accounts.account, supplyControllerContract_zero.address, supplyControllerAbiInterface);
        await expect( supplyControllerConnectAccount_zero.initialize(ContractId.fromString(deployedContracts.proxyContract).toSolidityAddress(),
                                                                     AccountId.fromString(accounts.masterSupplyController.accountId.toString()).toSolidityAddress(),
                                                                     AccountId.fromString(accounts.supplyControllerAdmin.accountId.toString()).toSolidityAddress(),
                                                                     zeroAddress,
                                                                     { gasLimit: 250000 })
        ).to.be.reverted;
    });
    afterEach(async function () {
        await burnTokenCreatedAccounts({ addr1, addr2, approver, supplier }, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator({ addr1, addr2, approver, supplier });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("supplyController.test tests file SupplyController - Stablecoin Minting & Burning hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

describe("SupplyController - Miscellaneous", function () {
    this.timeout(400000);
    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(200, 100);
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);

        accountClient = getClient();
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);

        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
    });
    it("Should revert if renounceRole is called", async function () {
        const proxyConnnectionWithMaster = await connectToContractWith(accounts.masterSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithMaster.renounceRole(await proxyConnnectionWithMaster.DEFAULT_ADMIN_ROLE({ gasLimit: 35000 }),
                                                             AccountId.fromString(accounts.masterSupplyController.accountId).toSolidityAddress(), { gasLimit: 100000 })
        ).to.be.reverted;

        const proxyConnnectionWithSupply = await connectToContractWith(accounts.supplyControllerAdmin, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithSupply.renounceRole(await proxyConnnectionWithSupply.CONTRACT_ADMIN_ROLE({ gasLimit: 35000 }),
                                                             AccountId.fromString(accounts.supplyControllerAdmin.accountId).toSolidityAddress(), { gasLimit: 100000 })
         ).to.be.reverted;

        const proxyConnnectionWithUpgrader = await connectToContractWith(accounts.upgraderSupplyController, deployedContracts.proxySupplyController, supplyControllerAbiInterface);
        await expect(proxyConnnectionWithUpgrader.renounceRole(await proxyConnnectionWithUpgrader.UPGRADER_ROLE({ gasLimit: 35000 }),
                                                               AccountId.fromString(accounts.upgraderSupplyController.accountId).toSolidityAddress(), { gasLimit: 100000 })
         ).to.be.reverted;
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");

        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("supplyController.test tests file SupplyController - Miscellaneous hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

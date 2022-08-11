import { tokenName, tokenSymbol, tokenDecimals, createAccounts, recoverHbarFromAccountsToOperator,
         deployContracts, burnTokenCreatedAccounts, hederaERC20AbiInterface, clientOperatorForProperties } from './utils.mjs';
import {
    getAccountBalanceInTinyBarSDK, getContractBalanceSDK, addHbarTransferSDK,
    createECDSAAccount, getOperatorAccountBalanceSDK, getClient
} from './utils_sdk.mjs';
import { getBalanceOf, associateTokenToAccount, tokenRescue, hbarRescue} from './utils_hethers.mjs';

import chai from "chai";
import { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let addr1;
let initialOperatorAccountBalance ;
let accounts ;
let operatorAccountBalanceAfterAccountsCreation ;
let accountClient;
let deployedContracts ;
let operatorAccountBalanceAfterContractsDeployment;
let totalFundedHbar;

describe("Token Rescue", function () {
    this.timeout(300000);
    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(200, 100);
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accountClient = getClient();;
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
    });
    beforeEach(async function () {
        addr1 = await createECDSAAccount(clientOperatorForProperties, 40);
    });

    it("Should allow tokens to be rescued", async function () {
        const tokensLockedInContract = await getBalanceOf(accounts.account,deployedContracts.tokenOwnerContract,deployedContracts.proxyContract, hederaERC20AbiInterface);
        await associateTokenToAccount(accounts.rescuer,deployedContracts.proxyContract, hederaERC20AbiInterface);
        await tokenRescue(accounts.rescuer, tokensLockedInContract, deployedContracts.proxyContract, deployedContracts.tokenOwnerContract, hederaERC20AbiInterface);
        expect(await getBalanceOf(accounts.account,deployedContracts.tokenOwnerContract,deployedContracts.proxyContract, hederaERC20AbiInterface)).to.equal("0");
        expect(await getBalanceOf(accounts.rescuer,accounts.rescuer.accountId,deployedContracts.proxyContract, hederaERC20AbiInterface)).to.equal(tokensLockedInContract);
    });
    it("Should revert when trying rescue more than balance", async function () {
        const tokensLockedInContract = await getBalanceOf(accounts.account,deployedContracts.tokenOwnerContract,deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect ( tokenRescue(accounts.rescuer, 7 ,deployedContracts.proxyContract,deployedContracts.tokenOwnerContract, hederaERC20AbiInterface)).to.be.reverted;
        expect(await getBalanceOf(accounts.account,deployedContracts.tokenOwnerContract,deployedContracts.proxyContract, hederaERC20AbiInterface)).to.equal(tokensLockedInContract);
        expect(await getBalanceOf(accounts.account,deployedContracts.tokenOwnerContract,deployedContracts.proxyContract, hederaERC20AbiInterface)).to.equal("0");
    });
    it("RBAC -ve : Should ONLY allow rescuer to rescue tokens", async function () {
        const tokensLockedInContract = await getBalanceOf(accounts.account, deployedContracts.tokenOwnerContract, deployedContracts.proxyContract, hederaERC20AbiInterface);
        await expect (tokenRescue(accounts.account, 5 ,deployedContracts.proxyContract,deployedContracts.tokenOwnerContract, hederaERC20AbiInterface)).to.be.reverted;
    });
    afterEach(async function () {
        await burnTokenCreatedAccounts({ addr1 }, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator({ addr1 });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await burnTokenCreatedAccounts(accounts, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("rescue.test tests file Token Rescue hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

describe("Hbar Rescue", function () {
    this.timeout(300000);

    before(async function () {
        initialOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accounts = await createAccounts(200, 100);
        totalFundedHbar = accounts.totalHbar;
        operatorAccountBalanceAfterAccountsCreation = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        accountClient = getClient();
        accountClient.setOperator(accounts.account.accountId, accounts.account.privateECDSAKey);
        deployedContracts = await deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient);
        operatorAccountBalanceAfterContractsDeployment = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
    });
    beforeEach(async function () {
        addr1 = await createECDSAAccount(clientOperatorForProperties, 40);
    });

    it("Should allow hbar to be rescued", async function () {
        await addHbarTransferSDK(deployedContracts.proxyContract, clientOperatorForProperties);
        const rescuerBalanceBefore = await getAccountBalanceInTinyBarSDK(accounts.rescuer, clientOperatorForProperties);
        const hbarLockedInContract = await getContractBalanceSDK(deployedContracts.proxyContract, clientOperatorForProperties);
        expect(hbarLockedInContract).to.be.above(0);
        await hbarRescue(accounts.rescuer, hbarLockedInContract,deployedContracts.proxyContract, hederaERC20AbiInterface);

        expect(await getContractBalanceSDK(deployedContracts.proxyContract, clientOperatorForProperties)).to.equal(0);
        expect(await getAccountBalanceInTinyBarSDK(accounts.rescuer, clientOperatorForProperties)).to.above(rescuerBalanceBefore);
    });
    it("Should revert when trying rescue more than balance", async function () {
        await expect(hbarRescue(accounts.rescuer, 1000,deployedContracts.proxyContract, hederaERC20AbiInterface)).to.be.reverted;
    });
    it("RBAC -ve : Should ONLY allow rescuer to rescue ether", async function () {
        await addHbarTransferSDK(deployedContracts.proxyContract, clientOperatorForProperties);
        const hbarLockedInContract = await getContractBalanceSDK(deployedContracts.proxyContract, clientOperatorForProperties);
        await expect(hbarRescue(accounts.account, hbarLockedInContract,deployedContracts.proxyContract, hederaERC20AbiInterface)).to.be.reverted;
    });
    afterEach(async function () {
        await burnTokenCreatedAccounts({ addr1 }, accounts, deployedContracts);
        await recoverHbarFromAccountsToOperator({ addr1 });
    });
    after(async function () {
        console.log("hbar consumption in account creation: " + (initialOperatorAccountBalance - operatorAccountBalanceAfterAccountsCreation) + " hbars (including hbars of funded accounts)");
        console.log("hbar consumption in contracts deployment: " + (operatorAccountBalanceAfterAccountsCreation.minus(operatorAccountBalanceAfterContractsDeployment)) + " hbars");
        await recoverHbarFromAccountsToOperator(accounts);
        const finalOperatorAccountBalance = await getOperatorAccountBalanceSDK(clientOperatorForProperties);
        console.log("rescue.test tests file Hbar Rescue hbar consumption: " + (initialOperatorAccountBalance.minus(finalOperatorAccountBalance)) + " hbars");
    });
});

import { Client, ContractFunctionParameters, AccountId, ContractId, TokenId } from "@hashgraph/sdk";
import {
    createECDSAAccount,
    deployContractSDK,
    createTokenSDK,
    deleteAccountSDK,
    getAccountBalanceSDK,
    deleteContractSDK,
    getAccountBalanceInTinyBarSDK, getClient
} from './utils_sdk.mjs';
import { connectToContractWith } from './utils_hethers.mjs';

import * as fs from "fs";
import { Interface } from "@ethersproject/abi";
import dotenv from 'dotenv';
import Web3EthAbi from 'web3-eth-abi';

dotenv.config();

const tokenName = process.env.TOKEN_NAME;
const tokenSymbol = process.env.TOKEN_SYMBOL;
const tokenDecimals = process.env.TOKEN_DECIMALS;

const hederaERC20json = JSON.parse(fs.readFileSync('./build/contracts/HederaERC20.json', 'utf8'));
const hederaERC20AbiInterface = new Interface(hederaERC20json.abi);
const hederaERC20Bytecode = hederaERC20json.bytecode;

const hederaERC1967ProxyJson = JSON.parse(fs.readFileSync('./build/contracts/HederaERC1967Proxy.json', 'utf8'));
const hederaERC1967ProxyAbiInterface = new Interface(hederaERC1967ProxyJson.abi);
const hederaERC1967ProxyBytecode = hederaERC1967ProxyJson.bytecode;

const htsTokenOwnerJson = JSON.parse(fs.readFileSync('./build/contracts/HTSTokenOwner.json', 'utf8'));
const htsTokenOwnerAbiInterface = new Interface(htsTokenOwnerJson.abi);
const htsTokenOwnerBytecode = htsTokenOwnerJson.bytecode;

const supplyControllerJson = JSON.parse(fs.readFileSync('./build/contracts/SupplyController.json', 'utf8'));
const supplyControllerAbiInterface = new Interface(supplyControllerJson.abi);
const supplyControllerBytecode = supplyControllerJson.bytecode;

const supplyControllerjsonV1_1 = JSON.parse(fs.readFileSync('./build/contracts/SupplyControllerV1_1.json', 'utf8'));
const supplyControllerAbiInterfaceV1_1 = new Interface(supplyControllerjsonV1_1.abi);
const supplyControllerBytecodeV1_1 = supplyControllerjsonV1_1.bytecode;

const supplyControllerjsonV2 = JSON.parse(fs.readFileSync('./build/contracts/SupplyControllerV2.json', 'utf8'));
const supplyControllerAbiInterfaceV2 = new Interface(supplyControllerjsonV2.abi);
const supplyControllerBytecodeV2 = supplyControllerjsonV2.bytecode;

const hederaERC20jsonV1_1 = JSON.parse(fs.readFileSync('./build/contracts/HederaERC20V1_1.json', 'utf8'));
const hederaERC20AbiInterfaceV1_1 = new Interface(hederaERC20jsonV1_1.abi);
const hederaERC20BytecodeV1_1 = hederaERC20jsonV1_1.bytecode;

const hederaERC20jsonV2 = JSON.parse(fs.readFileSync('./build/contracts/HederaERC20V2.json', 'utf8'));
const hederaERC20AbiInterfaceV2 = new Interface(hederaERC20jsonV2.abi);
const hederaERC20BytecodeV2 = hederaERC20jsonV2.bytecode;

let master;
let admin;
let upgrader;
let rescuer;
let supplyController;
let account;
let masterSupplyController;
let supplyControllerAdmin;
let upgraderSupplyController;

const clientOperatorForProperties = getClient();
clientOperatorForProperties.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

async function createAccounts(initialBalanceHigh, initialBalanceLow) {

    try {
        account = await createECDSAAccount(clientOperatorForProperties, initialBalanceHigh);
        master = await createECDSAAccount(clientOperatorForProperties, initialBalanceHigh);
        admin = await createECDSAAccount(clientOperatorForProperties, initialBalanceLow);
        upgrader = await createECDSAAccount(clientOperatorForProperties, initialBalanceLow);
        rescuer = await createECDSAAccount(clientOperatorForProperties, initialBalanceLow);
        supplyController = await createECDSAAccount(clientOperatorForProperties, initialBalanceHigh);
        masterSupplyController = await createECDSAAccount(clientOperatorForProperties, initialBalanceLow);
        supplyControllerAdmin = await createECDSAAccount(clientOperatorForProperties, initialBalanceHigh);
        upgraderSupplyController = await createECDSAAccount(clientOperatorForProperties, initialBalanceLow);

        // console.log(`account is ${account.accountId}`);
        // console.log(`master is ${master.accountId}`);
        // console.log(`admin is ${admin.accountId}`);
        // console.log(`upgrader is ${upgrader.accountId}`);
        // console.log(`supplyController is ${supplyController.accountId}`);
        // console.log(`masterSupplyController is ${masterSupplyController.accountId}`);
        // console.log(`supplyControllerAdmin is ${supplyControllerAdmin.accountId}`);
        // console.log(`upgraderSupplyController is ${upgraderSupplyController.accountId}`);

    } catch (e) {
        const accounts = { account,
            master,
            admin,
            upgrader,
            rescuer,
            supplyController,
            masterSupplyController,
            supplyControllerAdmin,
            upgraderSupplyController
        };
        // attempt to recover hbar from accounts that were created in the event of an error
        await recoverHbarFromAccountsToOperator(accounts);
        throw e;
    }

    let totalHbar = calculateTotalHbar(arguments);

    return { account,
        master,
        admin,
        upgrader,
        rescuer,
        supplyController,
        masterSupplyController,
        supplyControllerAdmin,
        upgraderSupplyController,
        totalHbar
    };
}

function calculateTotalHbar(arr) {
    var total = 0;

    for (var i = 0; i < arr.length; ++i) {
        total += arr[i];
    }
    return total;
}

function decodeFunctionResult(abi, functionName, resultAsBytes) {
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
    const result = Web3EthAbi.decodeParameters(functionParameters, resultHex);

    var jsonParsedArray = JSON.parse(JSON.stringify(result));
    return jsonParsedArray[0];
}

async function recoverHbarFromAccountsToOperator(accounts) {
    for (const element of Object.keys(accounts)) {
        if(accounts[element]) {
            await deleteAccountSDK(accounts[element], process.env.OPERATOR_ID);
        }
    }
}

async function recoverHbarAndDeleteFromContractsToOperator(contracts) {
    for (const element of contracts) {
        await deleteContractSDK(element, process.env.OPERATOR_ID);
    }
}

async function burnTokenCreatedAccounts(accountsToDelete, accounts, deployedContracts) {
    for (const element of Object.keys(accountsToDelete)) {
        if (accountsToDelete[element].accountId) {
            // console.log(`Burning tokens for ${accountsToDelete[element].accountId}`);
            let balance = await getAccountBalanceInTinyBarSDK(accountsToDelete[element], clientOperatorForProperties);
            // console.log(`\tBalance is ${balance}`);
            const connnectionWithAccount = await connectToContractWith(accountsToDelete[element], deployedContracts.proxyContract, hederaERC20AbiInterface);
            // console.log(`\tGetting "value"`);
            const value = await connnectionWithAccount.balanceOf(AccountId.fromString(accountsToDelete[element].accountId).toSolidityAddress(), {gasLimit: 50000});
            // console.log(`\tGot ${value}`);

            if (value != 0) {
                balance = await getAccountBalanceInTinyBarSDK(accounts.master, clientOperatorForProperties);
                const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, deployedContracts.proxyContract, hederaERC20AbiInterface);
                await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                                        ContractId.fromString(accounts.supplyController.accountId).toSolidityAddress(), { gasLimit: 100000 });
                balance = await getAccountBalanceInTinyBarSDK(accounts.supplyController, clientOperatorForProperties);
                const proxyConnnectionWithSupplyController = await connectToContractWith(accounts.supplyController, deployedContracts.proxyContract, hederaERC20AbiInterface);
                await proxyConnnectionWithSupplyController.grantRole(await proxyConnnectionWithSupplyController.SUPPLIER_ROLE({ gasLimit: 28000 }),
                                                                    AccountId.fromString(accountsToDelete[element].accountId).toSolidityAddress(), { gasLimit: 100000 });
                await connnectionWithAccount.burn(value, { gasLimit: 180000});
                balance = await getAccountBalanceInTinyBarSDK(accountsToDelete[element], clientOperatorForProperties);
            }
        }
    }
}

async function deployContracts(tokenName, tokenSymbol, tokenDecimals, accounts, accountClient) {
    console.log("Deploying ERC20 contract... please wait.");
    const erc20Contract = await deployContractSDK(hederaERC20Bytecode, 35, accounts, null, clientOperatorForProperties, accountClient);
    let constructorParameters = new ContractFunctionParameters()
            .addAddress(ContractId.fromString(erc20Contract.toString()).toSolidityAddress())
            .addBytes(new Uint8Array([]));
    console.log("Deploying hederaERC1967Proxy contract... please wait.");
    const proxyContract = await deployContractSDK(hederaERC1967ProxyBytecode, 35, accounts, constructorParameters, clientOperatorForProperties, accountClient);
    const proxyConnnectionWithAccount = await connectToContractWith(accounts.account, proxyContract, hederaERC20AbiInterface);
    await proxyConnnectionWithAccount.initialize(AccountId.fromString(accounts.master.accountId.toString()).toSolidityAddress(),
                                                 AccountId.fromString(accounts.admin.accountId.toString()).toSolidityAddress(),
                                                 AccountId.fromString(accounts.upgrader.accountId.toString()).toSolidityAddress(),
                                                 AccountId.fromString(accounts.rescuer.accountId.toString()).toSolidityAddress(),
                                                 { gasLimit: 250000 });

    console.log("Deploying supplyController contract... please wait.");
    const supplyControllerContract = await deployContractSDK(supplyControllerBytecode, 35, accounts, null, clientOperatorForProperties, accountClient);
    constructorParameters = new ContractFunctionParameters()
            .addAddress(ContractId.fromString(supplyControllerContract.toString()).toSolidityAddress())
            .addBytes(new Uint8Array([]));
    console.log("Deploying hederaERC1967Proxy contract... please wait.");
    const proxySupplyController = await deployContractSDK(hederaERC1967ProxyBytecode, 35, accounts, constructorParameters, clientOperatorForProperties, accountClient);
    const proxySupplyControllerConnnectionWithAccount = await connectToContractWith(accounts.account, proxySupplyController, supplyControllerAbiInterface);
    await proxySupplyControllerConnnectionWithAccount.initialize(ContractId.fromString(proxyContract).toSolidityAddress(),
                                                                AccountId.fromString(accounts.masterSupplyController.accountId.toString()).toSolidityAddress(),
                                                                AccountId.fromString(accounts.supplyControllerAdmin.accountId.toString()).toSolidityAddress(),
                                                                AccountId.fromString(accounts.upgraderSupplyController.accountId.toString()).toSolidityAddress(),
                                                                { gasLimit: 250000 });

    const proxyConnnectionWithMaster = await connectToContractWith(accounts.master, proxyContract, hederaERC20AbiInterface);
    await proxyConnnectionWithMaster.grantRole(await proxyConnnectionWithMaster.SUPPLY_CONTROLLER_ROLE({ gasLimit: 35000 }),
                                               ContractId.fromString(proxySupplyController).toSolidityAddress(), { gasLimit: 100000 });

    console.log("Deploying htsTokenOwner contract... please wait.");
    const tokenOwnerContract = await deployContractSDK(htsTokenOwnerBytecode, 10, accounts, null, clientOperatorForProperties, accountClient);

    console.log("Creating token... please wait.");
    const hederaToken = await createTokenSDK(tokenName, tokenSymbol, tokenDecimals, tokenOwnerContract.toString(), '0x'.concat(accounts.account.privateECDSAKey.toStringRaw()), accountClient);

    console.log("Setting up contract... please wait.");
    const tokenOwnerConnnectionWithAdmin = await connectToContractWith(accounts.admin, tokenOwnerContract, htsTokenOwnerAbiInterface);
    await tokenOwnerConnnectionWithAdmin.setERC20Address(ContractId.fromString(proxyContract).toSolidityAddress(), { gasLimit: 120000 });

    const proxyConnnectionWithAdmin = await connectToContractWith(accounts.admin, proxyContract, hederaERC20AbiInterface);
    await proxyConnnectionWithAdmin.setTokenAddress(ContractId.fromString(tokenOwnerContract).toSolidityAddress(),
                                                TokenId.fromString(hederaToken.toString()).toSolidityAddress(), { gasLimit: 200000 });

    return { erc20Contract,
            proxyContract,
            tokenOwnerContract,
            supplyControllerContract,
            proxySupplyController
    };
}

async function findEvent(contractFunctionResult, abiContract, eventName) {
    let event;
    contractFunctionResult.logs.forEach((log) => {
      let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

      let logTopics = [];
      log.topics.forEach((topic) => {
        logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
      });

      const eventFind = decodeEvent(abiContract, eventName, logStringHex, logTopics.slice(1));
      if(eventFind) {
          event = eventFind;
      }

    });
    return event;
}

function decodeEvent(abiContract, eventName, log, topics) {
    const eventAbi = abiContract.find((event) => event.name === eventName && event.type === "event");
    if(eventAbi){
        const decodedLog = Web3EthAbi.decodeLog(eventAbi.inputs, log, topics);
        return decodedLog;
    }
    return null;
}

export {
    findEvent,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    createAccounts,
    deployContracts,
    hederaERC20json,
    hederaERC20AbiInterface,
    burnTokenCreatedAccounts,
    hederaERC1967ProxyBytecode,
    hederaERC1967ProxyAbiInterface,
    supplyControllerAbiInterfaceV1_1,
    supplyControllerBytecodeV1_1,
    supplyControllerAbiInterfaceV2,
    supplyControllerBytecodeV2,
    hederaERC20AbiInterfaceV1_1,
    hederaERC20BytecodeV1_1,
    hederaERC20AbiInterfaceV2,
    hederaERC20BytecodeV2,
    supplyControllerJson,
    supplyControllerAbiInterface,
    clientOperatorForProperties,
    supplyControllerBytecode,
    recoverHbarFromAccountsToOperator,
    recoverHbarAndDeleteFromContractsToOperator
}

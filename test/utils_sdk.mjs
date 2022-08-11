import { PrivateKey, Client, AccountCreateTransaction, Hbar, FileCreateTransaction,
    FileAppendTransaction, ContractCreateTransaction, ContractFunctionParameters,
    ContractExecuteTransaction, AccountId, ContractId, TokenCreateTransaction, TokenId,
    DelegateContractId, AccountBalanceQuery, TransferTransaction,
    AccountDeleteTransaction, ContractInfoQuery } from "@hashgraph/sdk";
import dotenv from 'dotenv';
import Web3EthAbi from 'web3-eth-abi';

dotenv.config();

function getClient() {
    const network = process.env.HEDERA_NETWORK;
    if (network === "local") {
        const nodes = {"localhost:50211": AccountId.fromString("0.0.3")};
        return Client.forNetwork(nodes);
    } else {
        return Client.forName(network)
    }
}
async function createECDSAAccount(client, amount) {
    let privateECDSAKey;

    do {
        privateECDSAKey = PrivateKey.generateECDSA();
      } while (privateECDSAKey.toStringRaw().length < 64);

    const response = await new AccountCreateTransaction()
    .setKey(privateECDSAKey)
    .setInitialBalance(new Hbar(amount))
    .execute(client);
    const receipt = await response.getReceipt(client);
    const account = receipt.accountId;
    let accountId = account.toString();
    let privateKey = '0x'.concat(privateECDSAKey.toStringRaw());
    return { accountId, privateKey, privateECDSAKey };
}

async function approveSDK(account, contract, contractAbi, address, amount) {
    const approveClient = getClient();
    approveClient.setOperator(account.accountId.toString(), account.privateECDSAKey.toString());
    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("approve", new ContractFunctionParameters()
                               .addAddress(address)
                               .addUint256(amount))
        .setGas(800000)
        .execute(approveClient);
    let record = await contractTx.getRecord(approveClient);
    return decodeFunctionResult(contractAbi, "approve", record.contractFunctionResult.asBytes());
}

async function transferFromSDK(account, contract, contractAbi, from, to, amount) {
    const transferClient = getClient();
    transferClient.setOperator(account.accountId.toString(), account.privateECDSAKey.toString());
    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("transferFrom", new ContractFunctionParameters()
                               .addAddress(from)
                               .addAddress(to)
                               .addUint256(amount))
        .setGas(800000)
        .execute(transferClient);
    let record = await contractTx.getRecord(transferClient);
    return decodeFunctionResult(contractAbi, "transferFrom", record.contractFunctionResult.asBytes());
}

async function transferSDK(account, contract, contractAbi, to, amount) {
    const approveClient = getClient();
    approveClient.setOperator(account.accountId.toString(), account.privateECDSAKey.toString());
    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("transfer", new ContractFunctionParameters()
                               .addAddress(to)
                               .addUint256(amount))
        .setGas(500000)
        .execute(approveClient);
    let record = await contractTx.getRecord(approveClient);
    return decodeFunctionResult(contractAbi, "transfer", record.contractFunctionResult.asBytes());
}

async function allowanceSDK(contract, contractAbi, owner, spender, client){
    const contractTx = await new ContractExecuteTransaction()
    .setContractId(contract)
    .setGas(65000)
    .setFunction("allowance" , new ContractFunctionParameters()
                                .addAddress(owner)
                                .addAddress(spender))
    .execute(client);
    let record = await contractTx.getRecord(client);

    return Number(decodeFunctionResult(contractAbi, "allowance", record.contractFunctionResult.asBytes()));
}

async function increaseAllowanceSDK(contract, contractAbi, owner, spender, amount){
    const ownerClient = getClient();
    ownerClient.setOperator(owner.accountId.toString(), owner.privateECDSAKey.toString());

    const contractTx = await new ContractExecuteTransaction()
    .setContractId(contract)
    .setGas(1000000)
    .setFunction("increaseAllowance", new ContractFunctionParameters()
                                       .addAddress(spender)
                                       .addUint256(amount))
    .execute(ownerClient);
    let record = await contractTx.getRecord(ownerClient);

    return decodeFunctionResult(contractAbi, "increaseAllowance", record.contractFunctionResult.asBytes());
}

async function decreaseAllowanceSDK(contract, contractAbi, owner, spender, amount){
    const ownerClient = getClient();
    ownerClient.setOperator(owner.accountId.toString(), owner.privateECDSAKey.toString());

    const contractTx = await new ContractExecuteTransaction()
    .setContractId(contract)
    .setGas(1000000)
    .setFunction("decreaseAllowance" , new ContractFunctionParameters()
                                       .addAddress(spender)
                                       .addUint256(amount))
    .execute(ownerClient);
    let record = await contractTx.getRecord(ownerClient);

    return decodeFunctionResult(contractAbi, "decreaseAllowance", record.contractFunctionResult.asBytes());
}

async function addApproverSupplierSDK(contract, accountSupplier, aprover, supplier) {
    const accountSupplierClient = getClient();
    accountSupplierClient.setOperator(accountSupplier.accountId.toString(), accountSupplier.privateECDSAKey.toString());

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("addApproverSupplier", new ContractFunctionParameters()
                    .addAddress(aprover)
                    .addAddress(supplier))
        .setGas(200000)
        .execute(accountSupplierClient);

    let record = await contractTx.getRecord(accountSupplierClient);

    return record.contractFunctionResult;
}

function decodeFunctionResult(abi, functionName, resultAsBytes) {
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
    const result = Web3EthAbi.decodeParameters(functionParameters, resultHex);

    var jsonParsedArray = JSON.parse(JSON.stringify(result));
    return jsonParsedArray[0];
}

async function getAccountBalanceSDK(account, client) {
    const query = new AccountBalanceQuery().setAccountId(account);
    return await query.execute(client);
}

async function getAccountBalanceInTinyBarSDK(account, client) {
    const query = new AccountBalanceQuery().setAccountId(account.accountId);
    const accountBalance = await query.execute(client);
    return accountBalance.hbars._valueInTinybar/100000000;
}

async function getOperatorAccountBalanceSDK(client) {
    return (await getAccountBalanceSDK(process.env.OPERATOR_ID, client)).hbars.toBigNumber();
}

async function increaseSupplierAllowanceSDK(contract, accountSupplier, amount) {
    const accountSupplierClient = getClient();
    accountSupplierClient.setOperator(accountSupplier.accountId.toString(), accountSupplier.privateECDSAKey.toString());

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("increaseSupplierAllowance", new ContractFunctionParameters()
                    .addUint256(amount))
        .setGas(100000)
        .execute(accountSupplierClient);
   let record = await contractTx.getRecord(accountSupplierClient);

    return record.contractFunctionResult;
}

async function decreaseSupplierAllowanceSDK(contract, accountSupplier, amount) {
    const accountSupplierClient = getClient();
    accountSupplierClient.setOperator(accountSupplier.accountId.toString(), accountSupplier.privateECDSAKey.toString());

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("decreaseSupplierAllowance", new ContractFunctionParameters()
                    .addUint256(amount))
        .setGas(100000)
        .execute(accountSupplierClient);
   let record = await contractTx.getRecord(accountSupplierClient);

    return record.contractFunctionResult;
}

async function deleteAccountSDK(accountToDelete, accountToRecoverHbar) {
    const accountOperatorForProperties = getClient();
    if (accountToDelete.accountId) {
        accountOperatorForProperties.setOperator(accountToDelete.accountId, accountToDelete.privateECDSAKey);

        const transaction = await new AccountDeleteTransaction()
                            .setAccountId(accountToDelete.accountId)
                            .setTransferAccountId(accountToRecoverHbar)
                            .freezeWith(accountOperatorForProperties);

        const txResponse = await transaction.execute(accountOperatorForProperties);
        await txResponse.getReceipt(accountOperatorForProperties);
    }
}

async function deleteContractSDK(contractToDelete, accountToRecoverHbar) {
    const accountOperatorForProperties = getClient();
    accountOperatorForProperties.setOperator(accountToDelete.accountId, accountToDelete.privateECDSAKey);

    const transaction = await new ContractDeleteTransaction()
                        .setContractId(contractToDelete)
                        .setTransferAccountId(accountToRecoverHbar)
                        .freezeWith(accountOperatorForProperties);

    //const signTx = await transaction.sign(accountToDelete.privateECDSAKey);
    const txResponse = await transaction.execute(accountOperatorForProperties);
    await txResponse.getReceipt(accountOperatorForProperties);
}
async function deployContractSDK(bytecode, chunks, accounts, constructorParameters, clientOperator, accountClient) {
    const bytecodeFileId = await fileCreate(bytecode, chunks, accounts.account.privateECDSAKey, clientOperator);
    const transaction = new ContractCreateTransaction()
        .setGas(181_000)
        .setBytecodeFileId(bytecodeFileId)
        .setMaxTransactionFee(new Hbar(30))
        .setAdminKey(accounts.account.privateECDSAKey)

    if (constructorParameters) {
        transaction.setConstructorParameters(constructorParameters);
    }
    transaction.freezeWith(accountClient);

    const contractCreateSign = await transaction.sign(accounts.account.privateECDSAKey);
    const txResponse = await contractCreateSign.execute(accountClient);
    const receipt = await txResponse.getReceipt(accountClient);
    const contractId = receipt.contractId;
    return contractId;
}

async function fileCreate(bytecode, chunks, signingPrivateKey, clientOperator) {
    const fileCreateTx = new FileCreateTransaction().setKeys([signingPrivateKey]).freezeWith(clientOperator);
    const fileSign = await fileCreateTx.sign(signingPrivateKey);
    const fileSubmit = await fileSign.execute(clientOperator);
    const fileCreateRx = await fileSubmit.getReceipt(clientOperator);
    const bytecodeFileId = fileCreateRx.fileId;
    const fileAppendTx = new FileAppendTransaction()
        .setFileId(bytecodeFileId)
        .setContents(bytecode)
        .setMaxChunks(chunks)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(clientOperator);
    const fileAppendSign = await fileAppendTx.sign(signingPrivateKey);
    const fileAppendSubmit = await fileAppendSign.execute(clientOperator);
    await fileAppendSubmit.getReceipt(clientOperator);
    return bytecodeFileId;
}

async function createTokenSDK(tokenName, tokenSymbol, tokenDecimals, contractId, contractAdminKey, accountClient) {
    let transaction = new TokenCreateTransaction()
        .setMaxTransactionFee(new Hbar(15))
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setDecimals(tokenDecimals)
        .setInitialSupply(5)
        .setTreasuryAccountId(AccountId.fromString(contractId))
        .setAdminKey(accountClient.operatorPublicKey)
        .setFreezeKey(accountClient.operatorPublicKey)
        .setWipeKey(accountClient.operatorPublicKey)
        .setSupplyKey(DelegateContractId.fromString(contractId))
        .freezeWith(accountClient);
    const transactionSign = await transaction.sign(PrivateKey.fromStringECDSA(contractAdminKey));
    const txResponse = await transactionSign.execute(accountClient);
    const receipt = await txResponse.getReceipt(accountClient);
    const tokenId= receipt.tokenId;
    return tokenId;
}

async function resetSupplierAllowanceSDK(accountReset, supplier, contract) {
    const accountResetClient = getClient();
    accountResetClient.setOperator(accountReset.accountId.toString(), accountReset.privateECDSAKey.toString());

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contract)
        .setFunction("resetSupplierAllowance", new ContractFunctionParameters()
                    .addAddress(supplier))
        .setGas(50000)
        .execute(accountResetClient);
    let record = await contractTx.getRecord(accountResetClient);

    return record.contractFunctionResult;
}

async function getContractBalanceSDK(contractId, client) {
    const query = new ContractInfoQuery().setContractId(contractId);
    const info = await query.execute(client);
    return info.balance._valueInTinybar/100000000;
}

async function addHbarTransferSDK(proxyContractId, client) {
    const transaction = new TransferTransaction()
    .addHbarTransfer(process.env.OPERATOR_ID, new Hbar(-1))
    .addHbarTransfer(ContractId.fromString(proxyContractId.toString()), new Hbar(1));
    const txResponse = await transaction.execute(client);
    await txResponse.getReceipt(client);
}

export {
    getClient,
    getAccountBalanceSDK,
    getAccountBalanceInTinyBarSDK,
    createECDSAAccount,
    resetSupplierAllowanceSDK,
    approveSDK,
    transferFromSDK,
    allowanceSDK,
    transferSDK,
    increaseAllowanceSDK,
    decreaseAllowanceSDK,
    addApproverSupplierSDK,
    createTokenSDK,
    deployContractSDK,
    deleteAccountSDK,
    increaseSupplierAllowanceSDK,
    decreaseSupplierAllowanceSDK,
    getOperatorAccountBalanceSDK,
    getContractBalanceSDK,
    addHbarTransferSDK,
    deleteContractSDK
}

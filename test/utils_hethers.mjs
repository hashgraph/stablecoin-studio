import {ContractId, AccountId, Client} from "@hashgraph/sdk";

import { hethers } from '@hashgraph/hethers';

function getProvider() {
    const network = process.env.HEDERA_NETWORK;
    if (network === "local") {
        const consensusNodeId = '0.0.3';
        const consensusNodeUrl = 'localhost:50211';
        const mirrorNodeUrl = 'https://localhost';
        return new hethers.providers.HederaProvider(consensusNodeId, consensusNodeUrl, mirrorNodeUrl);
    } else {
        return hethers.providers.getDefaultProvider(process.env.HEDERA_NETWORK);
    }

}
async function deployContractSupplyWithHethers(account, bytecode, abiInterface) {
    const wallet = await getWallet(account.accountId, '0x'.concat(account.privateECDSAKey.toStringRaw()));
    const factory = new hethers.ContractFactory(abiInterface, bytecode, wallet);
    const contract = await factory.deploy({gasLimit: 100000});
    await contract.deployTransaction.wait();
    return contract;
}

async function deployContractProxyWithHethers(account, bytecode, abiInterface, tokenContractId) {
    const wallet = await getWallet(account.accountId, '0x'.concat(account.privateECDSAKey.toStringRaw()));
    const factory = new hethers.ContractFactory(abiInterface, bytecode, wallet);
    const contract = await factory.deploy(tokenContractId,
                                          '0x',
                                          { gasLimit: 200000 });
    await contract.deployTransaction.wait();
    return contract;
}

async function connectToContractAddressWith(account, contractAddress, contractAbiInterface) {
    const wallet = await getWallet(account.accountId, '0x'.concat(account.privateECDSAKey.toStringRaw()));
    return new hethers.Contract(contractAddress, contractAbiInterface, wallet);
}

async function connectToContractWith(account, contract, contractAbiInterface) {
    return connectToContractAddressWith(account, ContractId.fromString(contract.toString()).toSolidityAddress(), contractAbiInterface);
}

async function getBalanceOf(accountToConnect, accountToGetBalance, proxyAddr, contractAbiInterface) {

    let wallet = await getWallet(accountToConnect.accountId, '0x'.concat(accountToConnect.privateECDSAKey.toStringRaw()));

    let contract = new hethers.Contract(ContractId.fromString(proxyAddr.toString()).toSolidityAddress(), contractAbiInterface, wallet);
    const value = await contract.balanceOf(ContractId.fromString(accountToGetBalance.toString()).toSolidityAddress(), {gasLimit: 50000});
    return value;
}

async function associateTokenToAccount(from,proxyAddr, contractAbiInterface) {
    const wallet = await getWallet(from.accountId, '0x'.concat(from.privateECDSAKey.toStringRaw()));
    let contract = new hethers.Contract(ContractId.fromString(proxyAddr.toString()).toSolidityAddress(), contractAbiInterface, wallet);
    return await contract.associateToken(AccountId.fromString(from.accountId).toSolidityAddress(), {
       gasLimit: 1130000
    });
}

async function tokenRescue(rescuerAccount, amount,proxyAddr,tokenOwnerContract, contractAbiInterface) {
    const walletToTokenRescue = await getWallet(rescuerAccount.accountId, '0x'.concat(rescuerAccount.privateECDSAKey.toStringRaw()));
    const contract = new hethers.Contract(ContractId.fromString(proxyAddr.toString()).toSolidityAddress(), contractAbiInterface, walletToTokenRescue);

    await contract.tokenRescue(ContractId.fromString(tokenOwnerContract.toString()).toSolidityAddress(), amount, {
       gasLimit: 500000
    });
}

async function hbarRescue(rescuerAccount, amount,proxyId, contractAbiInterface) {
    const walletToHbarRescue = await getWallet(rescuerAccount.accountId, '0x'.concat(rescuerAccount.privateECDSAKey.toStringRaw()));
    const contract = new hethers.Contract(ContractId.fromString(proxyId.toString()).toSolidityAddress(), contractAbiInterface, walletToHbarRescue);
    const balance = await contract.hbarRescue(amount, { gasLimit: 285000 });
}

async function getWallet(accountId, privateKey) {
    const eoaAccount = {
        account: accountId,
        privateKey: privateKey
    };
    let wall = new hethers.Wallet(eoaAccount, getProvider());
    return wall;
}

export {
    connectToContractWith,
    connectToContractAddressWith,
    deployContractSupplyWithHethers,
    deployContractProxyWithHethers,
    getBalanceOf,
    associateTokenToAccount,
    tokenRescue,
    hbarRescue
}

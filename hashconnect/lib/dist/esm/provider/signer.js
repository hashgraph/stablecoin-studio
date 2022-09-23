import { AccountId, TransactionId, AccountBalanceQuery, AccountInfoQuery, AccountRecordsQuery, } from "@hashgraph/sdk";
export class HashConnectSigner {
    constructor(hashconnect, provider, accountToSign, topic) {
        this.hashconnect = hashconnect;
        this.provider = provider;
        this.accountToSign = accountToSign;
        this.topicId = topic;
    }
    getLedgerId() {
        return this.provider.client.ledgerId;
    }
    getAccountId() {
        return AccountId.fromString(this.accountToSign);
    }
    getNetwork() {
        const network = {};
        network[this.accountToSign.toString()] = this.provider.network;
        return network;
    }
    getMirrorNetwork() {
        throw new Error("Get Mirror Network not implemented in HashConnect");
        return [];
    }
    sign(messages) {
        throw new Error("Sign messages not implemented in HashConnect");
        console.log(messages);
    }
    getAccountBalance() {
        return new AccountBalanceQuery()
            .setAccountId(this.accountToSign)
            .execute(this.provider.client);
    }
    getAccountInfo() {
        return new AccountInfoQuery()
            .setAccountId(this.accountToSign)
            .execute(this.provider.client);
    }
    getAccountRecords() {
        return new AccountRecordsQuery()
            .setAccountId(this.accountToSign)
            .execute(this.provider.client);
    }
    async signTransaction(transaction) {
        return transaction.freezeWith(this.provider.client);
    }
    checkTransaction(transaction) {
        throw new Error("Check transaction not implemented in HashConnect");
        console.log(transaction);
    }
    async populateTransaction(transaction) {
        // await this.checkTransaction(transaction);
        transaction.setTransactionId(TransactionId.generate(this.accountToSign));
        transaction.freezeWith(this.provider.client);
        // transaction.setNodeAccountIds([]);
        return transaction;
    }
    async call(request) {
        const transaction = {
            byteArray: this.getBytesOf(request),
            metadata: {
                accountToSign: this.accountToSign.toString(),
                returnTransaction: false,
            },
            topic: this.topicId,
        };
        const res = await this.hashconnect.sendTransaction(this.topicId, transaction);
        const response = res.response;
        return response;
    }
    getBytesOf(request) {
        const transaction = request;
        let query;
        if (!transaction)
            query = request;
        if (!transaction && !query)
            throw new Error("Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet.");
        if (transaction)
            return request.toBytes();
        else
            return request.toBytes();
    }
}
//# sourceMappingURL=signer.js.map
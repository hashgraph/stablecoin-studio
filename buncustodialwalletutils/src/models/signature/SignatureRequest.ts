
export class SignatureRequest {
    private transactionBytes: Uint8Array;

    constructor(transactionBytes: Uint8Array) {
        this.transactionBytes = transactionBytes;
    }

    public getTransactionBytes(): Uint8Array {
        return this.transactionBytes;
    }

    public setTransactionBytes(transactionBytes: Uint8Array): void {
        this.transactionBytes = transactionBytes;
    }
}



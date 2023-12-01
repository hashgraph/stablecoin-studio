
export class SignatureRequest {
    private _publicKey: string;
    private _transactionBytes: Uint8Array;

    constructor(publicKey: string, transactionBytes: Uint8Array) {
        this.setPublicKey(publicKey);
        this.setTransactionBytes(transactionBytes);
    }

    get publicKey(): string {
        return this._publicKey;
    }

    set publicKey(value: string) {
        this.setPublicKey(value);
    }

    get transactionBytes(): Uint8Array {
        return this._transactionBytes;
    }

    set transactionBytes(value: Uint8Array) {
        this.setTransactionBytes(value);
    }

    private setPublicKey(value: string): void {
        if (!value) {
            throw new Error("Can`t be empty");
        }
        this._publicKey = value;
    }

    private setTransactionBytes(value: Uint8Array): void {
        if (!value || value.length === 0) {
            throw new Error("Can`t be empty");
        }
        this._transactionBytes = value;
    }
}


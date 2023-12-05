import {ISignatureStrategy} from '../strategies/signature/ISignatureStrategy.ts'

export enum SignatureType {
	FIREBLOCKS,
	DFNS,
}

export class SignatureStrategyFactory{
    public static getSignatureStrategy(signatureType: SignatureType): ISignatureStrategy{
        throw new Error('Method not implemented.');
    }

}
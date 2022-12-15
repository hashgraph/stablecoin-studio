import {
	AccountId as HAccountId,
} from '@hashgraph/sdk';

export class StableCoinMemo {
	proxyContract: string;
    proxyAdminContract: string;

	constructor(proxyContract: string, proxyAdminContract: string) {
		this.proxyContract = this.getHederaIdfromContractAddress(proxyContract);
		this.proxyAdminContract = this.getHederaIdfromContractAddress(proxyAdminContract);
	}

    getHederaIdfromContractAddress(contractAddress: string): string{
		if(!contractAddress) return '';
        if(contractAddress.length >= 40) return HAccountId.fromSolidityAddress(contractAddress).toString();
		return contractAddress;
    }

	public static fromJson(json: string): StableCoinMemo {
		const jsonObject = JSON.parse(json);
		return new StableCoinMemo(
			jsonObject.p,
            jsonObject.a
		);
	}

	public static empty(): StableCoinMemo {
		const emptyObject = {
			proxyContract: '',
            proxyAdminContract: ''
		};
		return this.fromJson(JSON.stringify(emptyObject));
	}

	public toJson(): string {
		return JSON.stringify({
			proxyContract: this.proxyContract,
            proxyAdminContract: this.proxyAdminContract
		});
	}
}
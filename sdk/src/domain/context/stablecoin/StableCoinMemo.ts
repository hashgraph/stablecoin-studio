import {
	AccountId as HAccountId,
} from '@hashgraph/sdk';

export class StableCoinMemo {
	proxyContract: string;

	constructor(proxyContract: string) {
		if(proxyContract.length >= 40) this.proxyContract = HAccountId.fromSolidityAddress(proxyContract).toString();
		else this.proxyContract = proxyContract;
	}

	public static fromJson(json: string): StableCoinMemo {
		const jsonObject = JSON.parse(json);
		return new StableCoinMemo(
			jsonObject.proxyContract,
		);
	}

	public static empty(): StableCoinMemo {
		const emptyObject = {
			proxyContract: '',
		};
		return this.fromJson(JSON.stringify(emptyObject));
	}

	public toJson(): string {
		return JSON.stringify({
			proxyContract: this.proxyContract,
		});
	}
}
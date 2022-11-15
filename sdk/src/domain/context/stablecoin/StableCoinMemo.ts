export class StableCoinMemo {
	proxyContract: string;
	htsAccount: string;

	constructor(proxyContract: string, htsAccount: string) {
		this.proxyContract = proxyContract;
		this.htsAccount = htsAccount;
	}

	public static fromJson(json: string): StableCoinMemo {
		const jsonObject = JSON.parse(json);
		return new StableCoinMemo(
			jsonObject.proxyContract,
			jsonObject.htsAccount,
		);
	}

	public static empty(): StableCoinMemo {
		const emptyObject = {
			proxyContract: '',
			htsAccount: '',
		};
		return this.fromJson(JSON.stringify(emptyObject));
	}

	public toJson(): string {
		return JSON.stringify({
			proxyContract: this.proxyContract,
			htsAccount: this.htsAccount,
		});
	}
}
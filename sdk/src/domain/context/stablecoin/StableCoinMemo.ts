export class StableCoinMemo {
	proxyContract: string;

	constructor(proxyContract: string) {
		this.proxyContract = proxyContract;
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
			htsAccount: '',
		};
		return this.fromJson(JSON.stringify(emptyObject));
	}

	public toJson(): string {
		return JSON.stringify({
			proxyContract: this.proxyContract,
		});
	}
}

export default class CreateStableCoinServiceRequestModel {
	public accountId: string;
	public privateKey: string;
	public name: string;
	public symbol: string;
	public decimals: number;
	public initialSupply?: bigint;
	public maxSupply?: bigint;
	public memo?: string;
	public freeze?: string;
	public freezeDefault?: boolean;
}

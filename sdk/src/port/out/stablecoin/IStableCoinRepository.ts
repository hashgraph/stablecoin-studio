import IStableCoinDetail from '../../../domain/context/stablecoin/IStableCoinDetail.js';
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinList from '../../in/sdk/response/IStableCoinList.js';

export default interface IStableCoinRepository {
	saveCoin(coin: StableCoin): Promise<StableCoin>;
	getListStableCoins(privateKey: string): Promise<IStableCoinList[]>;
	getStableCoin(id: string): Promise<IStableCoinDetail>;
	getBalanceOf(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array>;
	getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array>;
	cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount: number,
	): Promise<Uint8Array>;
	associateToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array>;
	wipe(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount: number,
	): Promise<Uint8Array>;
}

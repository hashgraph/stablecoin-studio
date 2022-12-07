import AccountViewModel from './mirror/response/AccountViewModel.js';
import StableCoinListViewModel from './mirror/response/StableCoinListViewModel.js';
import StableCoinViewModel from './mirror/response/StableCoinViewModel.js';

export interface IQueryAdapter {
    getstableCoinsList(
		accountId: string,
	): Promise<StableCoinListViewModel[]>;

    getStableCoin(
        tokenId: string
    ): Promise<StableCoinViewModel>;

    getAccountInfo(
        accountId: string
    ): Promise<AccountViewModel>;
}

import { ContractId } from '@hashgraph/sdk';
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import StableCoinList from '../../../../src/port/out/mirror/response/StableCoinListViewModel.js';
import StableCoinDetail from '../../../../src/port/out/mirror/response/StableCoinViewModel.js';
import AccountInfo from '../../../../src/port/out/mirror/response/AccountViewModel.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import {
	HEDERA_ID_ACCOUNT_ECDSA,
	HEDERA_ID_ACCOUNT_ED25519,
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	ENVIRONMENT,
} from '../../../config.js';
import { StableCoin } from '../../../../src/index.js';

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
	const tokenId = HederaId.from('0.0.49102513');
	const proxyEvmAddress = '0000000000000000000000000000000002ed3eb0';

	let mn: MirrorNodeAdapter;
	beforeAll(async () => {
		mn = new MirrorNodeAdapter();
		mn.setEnvironment(ENVIRONMENT);
	});

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Test get stable coins list', async () => {
		const stableCoinList: StableCoinList = await mn.getStableCoinsList(
			HEDERA_ID_ACCOUNT_ED25519,
		);
		expect(stableCoinList.coins.length).toBeGreaterThan(0);
	});

	it('Test get stable coin', async () => {
		// StableCoin.create();
		const stableCoinDetail: StableCoinDetail = await mn.getStableCoin(
			tokenId,
		);
		expect(stableCoinDetail.tokenId).toEqual(tokenId);
		expect(stableCoinDetail.name).toEqual('WEBCOIN');
		expect(stableCoinDetail.symbol).toEqual('WBCOIN');
		expect(stableCoinDetail.decimals).toEqual(6);
		expect(stableCoinDetail.evmProxyAddress).toEqual(proxyEvmAddress);
		expect(stableCoinDetail.autoRenewAccount).toEqual('0.0.48471385');
		expect(stableCoinDetail.autoRenewAccountPeriod).toEqual(90);
		expect(stableCoinDetail.treasury).toEqual(CLIENT_ACCOUNT_ECDSA.id);
		expect(stableCoinDetail.paused).toEqual(false);
		expect(stableCoinDetail.deleted).toEqual(false);
		expect(stableCoinDetail.adminKey).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey,
		);
		expect(stableCoinDetail.supplyKey).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey,
		);
		expect(stableCoinDetail.wipeKey).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey,
		);
		expect(stableCoinDetail.freezeKey).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey,
		);
		expect(stableCoinDetail.kycKey).toEqual(undefined);
		expect(stableCoinDetail.pauseKey).toEqual(
			CLIENT_ACCOUNT_ECDSA.publicKey,
		);
	}, 150000000);

	it('Test get ed25519 account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			HEDERA_ID_ACCOUNT_ED25519,
		);
		expect(accountInfo.id).toEqual(HEDERA_ID_ACCOUNT_ED25519.toString());
		expect(accountInfo.accountEvmAddress).toBeNull();
		expect(accountInfo.publicKey).toEqual(CLIENT_ACCOUNT_ED25519.publicKey);
		expect(accountInfo.alias).toBeNull();
	});

	it('Test get ecdsa account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			HEDERA_ID_ACCOUNT_ECDSA,
		);
		expect(accountInfo.id).toEqual(HEDERA_ID_ACCOUNT_ECDSA.toString());
		expect(accountInfo.accountEvmAddress).toEqual(
			CLIENT_ACCOUNT_ECDSA.evmAddress,
		);
		expect(accountInfo.publicKey).toEqual(CLIENT_ACCOUNT_ECDSA.publicKey);
	});
});

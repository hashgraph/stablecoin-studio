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

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
	const tokenId = HederaId.from('0.0.48987373');
	const proxyId = HederaId.from('0.0.48987372');

	let mn: MirrorNodeAdapter;
	beforeAll(async () => {
		mn = new MirrorNodeAdapter();
		mn.setEnvironment(ENVIRONMENT);
	});

	it('Test get stable coins list', async () => {
		const stableCoinList: StableCoinList = await mn.getStableCoinsList(
			ed25519_accountId,
		);
		expect(stableCoinList.coins.length).toBeGreaterThan(0);
	});

	it('Test get stable coin', async () => {
		const stableCoinDetail: StableCoinDetail = await mn.getStableCoin(
			tokenId,
		);
		expect(stableCoinDetail.tokenId).toEqual(tokenId);
		expect(stableCoinDetail.name).toEqual('HEDERACOIN');
		expect(stableCoinDetail.symbol).toEqual('HDC');
		expect(stableCoinDetail.decimals).toEqual(6);
		expect(stableCoinDetail.proxyAddress).toEqual(proxyId);
		expect(stableCoinDetail.evmProxyAddress).toEqual(
			ContractId.fromString(proxyId.toString()).toSolidityAddress(),
		);
		expect(stableCoinDetail.autoRenewAccount).toEqual(CLIENT_ACCOUNT_ECDSA);
		expect(stableCoinDetail.autoRenewAccountPeriod).toEqual(90);
		expect(stableCoinDetail.treasury).toEqual(CLIENT_ACCOUNT_ECDSA);
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
	});

	it('Test get ed25519 account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			ed25519_accountId,
		);
		expect(accountInfo.id).toEqual(ed25519_accountId.toString());
		expect(accountInfo.accountEvmAddress).toBeNull();
		expect(accountInfo.publicKey).toEqual(ed25519_publicKey);
		expect(accountInfo.alias).toBeNull();
	});

	it('Test get ecdsa account info', async () => {
		const accountInfo: AccountInfo = await mn.getAccountInfo(
			ecdsa_accountId,
		);
		expect(accountInfo.id).toEqual(ecdsa_accountId.toString());
		expect(accountInfo.accountEvmAddress).toEqual(
			'0xb58c62f798d132a865429ee3c8968fed20b38116',
		);
		expect(accountInfo.publicKey).toEqual(ecdsa_publicKey);
		expect(accountInfo.alias).toEqual(
			'HIQQFY4QQVVCIRNDY3UEMWEW6TZ7RXPJRRUHUTTW3LRPDEHSOSXRVUXR',
		);
	});
});

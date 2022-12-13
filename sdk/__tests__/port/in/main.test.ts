import EventService from '../../../src/app/service/event/EventService.js';
import { WalletEvents } from '../../../src/app/service/event/WalletEvent.js';
import { Injectable } from '../../../src/core/Injectable.js';
import { WalletConnectError } from '../../../src/domain/context/network/error/WalletConnectError.js';
import { Network, StableCoin } from '../../../src/index.js';
import CashInRequest from '../../../src/port/in/request/CashInRequest.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';

describe('🧪 SDK test', () => {
	it('Instantiates StableCoin const', async () => {
		expect(StableCoin.cashIn).toBeDefined();
	});

	it('Does a CashIn (FAIL)', async () => {
		await expect(
			StableCoin.cashIn(
				new CashInRequest({
					amount: '1',
					tokenId: '0.0.1',
					targetId: '0.0.1',
				}),
			),
		).rejects.toThrow();
	});

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({ id: '0.0.48954559' }),
		);
		console.log(res);
		expect(res).not.toBeNull();
		expect(res.decimals).not.toBeNull();
		expect(res.name).not.toBeNull();
		expect(res.symbol).not.toBeNull();
		expect(res.treasury).not.toBeNull();
		expect(res.tokenId).not.toBeNull();
	});

	it('Fails to initialize HashPack', async () => {
		const connection = Network.connect(
			new ConnectRequest({
				account: {
					accountId: '0.0.47820993',
					privateKey: {
						key: '0x4e3a8e419d6a10765ad1db628e1e86343a971543d14548e023143675f55a6875',
						type: 'ED25519',
					},
				},
				network: 'testnet',
				wallet: SupportedWallets.HASHPACK,
			}),
		);
		await expect(connection).rejects.toThrow(WalletConnectError);
	});

	it('Initializes network for operation', async () => {
		const connection = await Network.connect(
			new ConnectRequest({
				account: {
					accountId: '0.0.47820993',
					privateKey: {
						key: '0x4e3a8e419d6a10765ad1db628e1e86343a971543d14548e023143675f55a6875',
						type: 'ED25519',
					},
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
			}),
		);
		const handler = Injectable.resolveTransactionHandler();
		expect(connection).not.toBeNull();
		expect(handler).not.toBeNull();
	});

	it('Performs a cash in', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.cashIn(
			new CashInRequest({
				amount: '1',
				tokenId: '0.0.48957315',
				targetId: '0.0.47820993',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);
});

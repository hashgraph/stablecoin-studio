import EventService from '../../../src/app/service/event/EventService.js';
import { WalletEvents } from '../../../src/app/service/event/WalletEvent.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	Account,
	FactoryAddressTestnet,
	HederaERC20AddressTestnet,
	Network,
	StableCoin,
	StableCoinViewModel,
	TokenSupplyType,
} from '../../../src/index.js';
import {
	CashInRequest,
	BurnRequest,
	WipeRequest,
	AssociateTokenRequest,
	GetAccountBalanceRequest,
	CapabilitiesRequest,
	PauseRequest,
	DeleteRequest,
	FreezeAccountRequest,
	CreateRequest,
	RescueRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';
import { CLIENT_ACCOUNT_ECDSA, CLIENT_ACCOUNT_ED25519 } from '../../config.js';

describe('🧪 SDK test', () => {
	let stableCoinSC: StableCoinViewModel;
	let stableCoinHTS: StableCoinViewModel;
	beforeAll(async () => {
		const connection = await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
			}),
		);
		const handler = Injectable.resolveTransactionHandler();
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			// maxSupply: '',
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			adminKey: Account.NullPublicKey,
			freezeKey: Account.NullPublicKey,
			KYCKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyKey: Account.NullPublicKey,
			// treasury: CLIENT_ACCOUNT_ED25519.id.toString(),
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FactoryAddressTestnet,
			hederaERC20: HederaERC20AddressTestnet,
		});
		const requestHTS = new CreateRequest({
			name: 'TEST_ACCELERATOR',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			// maxSupply: '',
			autoRenewAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			adminKey: CLIENT_ACCOUNT_ED25519.publicKey,
			freezeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			KYCKey: CLIENT_ACCOUNT_ED25519.publicKey,
			wipeKey: CLIENT_ACCOUNT_ED25519.publicKey,
			pauseKey: CLIENT_ACCOUNT_ED25519.publicKey,
			supplyKey: CLIENT_ACCOUNT_ED25519.publicKey,
			// treasury: CLIENT_ACCOUNT_ED25519.id.toString(),
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FactoryAddressTestnet,
			hederaERC20: HederaERC20AddressTestnet,
		});
		// console.log(request.validate());

		stableCoinSC = await StableCoin.create(requestSC);
		stableCoinHTS = await StableCoin.create(requestHTS);
		// console.log(stableCoin.tokenId);
	}, 60_000);

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({
				id: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		// console.log(res);
		expect(res).not.toBeNull();
		expect(res.decimals).not.toBeNull();
		expect(res.name).not.toBeNull();
		expect(res.symbol).not.toBeNull();
		expect(res.treasury).not.toBeNull();
		expect(res.tokenId).not.toBeNull();
	}, 60_000);

	it('Performs getBalanceOf', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		console.log('Balance: ' + result.value);

		expect(result.value).not.toBeNull();
	}, 60_000);

	it('Performs capabilities', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		console.log(result.capabilities);

		expect(result).not.toBeNull();
		expect(result.capabilities).not.toBeNull();
	}, 60_000);

	it('Performs a cash in SC', async () => {
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
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		expect(result).not.toBeNull();
		await expect(result).toBe(true);
	}, 60_000);

	it('Performs burn SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.burn(
			new BurnRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs rescue SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.rescue(
			new RescueRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs wipe SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.wipe(
			new WipeRequest({
				amount: '1',
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Performs associate SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
					privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
				},
				proxyContractId: '0.0.0', // <-- Change
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs pause SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.pause(
			new PauseRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs unpause SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs freeze SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.freeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);
	it('Performs unfreeze SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.unFreeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs delete SC', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// ----------------------HTS--------------------------

	it('Performs a cash in HTS', async () => {
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
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		expect(result).not.toBeNull();
		await expect(result).toBe(true);
	}, 60_000);

	it('Performs burn HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.burn(
			new BurnRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs rescue HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.rescue(
			new RescueRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs wipe HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.wipe(
			new WipeRequest({
				amount: '1',
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Performs associate HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.associate(
			new AssociateTokenRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
					privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
				},
				proxyContractId: '0.0.0', // <-- Change
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs capabilities HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.capabilities(
			new CapabilitiesRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		console.log(result.capabilities);

		expect(result).not.toBeNull();
		expect(result.capabilities).not.toBeNull();
	}, 60_000);

	it('Performs pause HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.pause(
			new PauseRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs unpause HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.unPause(
			new PauseRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs freeze HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.freeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);
	it('Performs unfreeze HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.unFreeze(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);

	it('Performs delete HTS', async () => {
		const handler = Injectable.resolveTransactionHandler();
		expect(handler).not.toBeNull();
		const eventService = Injectable.resolve(EventService);
		expect(eventService).not.toBeNull();
		eventService.on(WalletEvents.walletInit, (data) => {
			console.log(`Wallet: ${data.wallet} initialized`);
		});
		const result = await StableCoin.delete(
			new DeleteRequest({
				tokenId: stableCoinHTS?.tokenId?.toString() ?? '0.0.49106247',
			}),
		);
		expect(result).not.toBeNull();
		expect(result).toBe(true);
	}, 60_000);
});

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../../../src/domain/context/stablecoin/Capability.js';
import BigDecimal from '../../../../src/domain/context/shared/BigDecimal.js';
import RPCTransactionAdapter from '../../../../src/port/out/rpc/RPCTransactionAdapter.js';
import { Wallet } from 'ethers';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';
import Injectable from '../../../../src/core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../src/port/out/mirror/MirrorNodeAdapter.js';
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../../src/domain/context/contract/ContractId.js';
import {
	HederaERC20AddressTestnet,
	FactoryAddressTestnet,
	TokenSupplyType,
} from '../../../../src/port/in/StableCoin.js';
import { CLIENT_ACCOUNT_ECDSA } from '../../../config.js';
import Account from '../../../../src/domain/context/account/Account.js';

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
	const stableCoinCapabilitiesHTS = new StableCoinCapabilities(
		new StableCoin({
			name: 'HEDERACOIN',
			symbol: 'HTSECDSA',
			decimals: 6,
			proxyAddress: HederaId.from('0.0.49006492'),
			evmProxyAddress: '0x0000000000000000000000000000000002ebc79c',
			tokenId: HederaId.from('0.0.49006494'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.HTS),
			new Capability(Operation.BURN, Access.HTS),
			new Capability(Operation.WIPE, Access.HTS),
			new Capability(Operation.FREEZE, Access.HTS),
			new Capability(Operation.UNFREEZE, Access.HTS),
			new Capability(Operation.PAUSE, Access.HTS),
			new Capability(Operation.UNPAUSE, Access.HTS),
			new Capability(Operation.DELETE, Access.HTS),
			new Capability(Operation.RESCUE, Access.HTS),
			new Capability(Operation.ROLE_MANAGEMENT, Access.HTS),
		],
		CLIENT_ACCOUNT_ECDSA,
	);
	const stableCoinCapabilitiesSC = new StableCoinCapabilities(
		new StableCoin({
			name: 'HEDERACOIN',
			symbol: 'HDC',
			decimals: 3,
			proxyAddress: HederaId.from('0.0.49072315'),
			evmProxyAddress: '0x0000000000000000000000000000000002ecc8bb',
			tokenId: HederaId.from('0.0.49072316'),
		}),
		[
			new Capability(Operation.CASH_IN, Access.CONTRACT),
			new Capability(Operation.BURN, Access.CONTRACT),
			new Capability(Operation.WIPE, Access.CONTRACT),
			new Capability(Operation.FREEZE, Access.CONTRACT),
			new Capability(Operation.UNFREEZE, Access.CONTRACT),
			new Capability(Operation.PAUSE, Access.CONTRACT),
			new Capability(Operation.UNPAUSE, Access.CONTRACT),
			new Capability(Operation.DELETE, Access.CONTRACT),
			new Capability(Operation.RESCUE, Access.CONTRACT),
			new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
		],
		CLIENT_ACCOUNT_ECDSA,
	);

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;

	beforeAll(async () => {
		th = Injectable.resolve(RPCTransactionAdapter);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);
		await th.init(true);
		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			th.provider,
		);
		const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.setEnvironment('testnet');
	}, 1500000);

	it('create coin', async () => {
		const coinSC = new StableCoin({
			name: 'TestCoinSC',
			symbol: 'TCSC',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			freezeDefault: false,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.INFINITE,
		});
		tr = await th.create(
			coinSC,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
		);
	});

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('create coin and assign to account', async () => {
		const coin = new StableCoin({
			name: 'TestCoinAccount',
			symbol: 'TCA',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1.60', 6),
			maxSupply: BigDecimal.fromString('1000', 6),
			freezeDefault: false,
			adminKey: Account.NULL.publicKey,
			freezeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			kycKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			wipeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			pauseKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			supplyKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.FINITE,
		});
		tr = await th.create(
			coin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
		);
	}, 1500000);

	it('Test hasRole', async () => {
		tr = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.CASHIN_ROLE,
		);
		expect(typeof tr.response === 'boolean').toBeTruthy();
	}, 1500000);

	it('Test mint', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString(
				'0.5',
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);
		console.log(tr);
	}, 1500000);

	it('Test wipe', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test mint HTS', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test burn', async () => {
		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

	it('Test freeze', async () => {
		tr = await th.freeze(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ECDSA.id);
	}, 1500000);

	it('Test unfreeze', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test pause', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test unpause', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test rescue', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	//it('Test delete', async () => {
	//	tr = await th.delete(stableCoinCapabilitiesSC);
	//}, 1500000);

	it('Test revokeRole', async () => {
		tr = await th.revokeRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test grantRole', async () => {
		tr = await th.grantRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			StableCoinRole.WIPE_ROLE,
		);
	}, 1500000);

	it('Test revokeSupplierRole', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test grantSupplierRole', async () => {
		tr = await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);

		tr = await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test grantUnlimitedSupplierRole', async () => {
		tr = await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test getBalanceOf', async () => {
		tr = await th.balanceOf(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test isUnlimitedSupplierAllowance', async () => {
		tr = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test supplierAllowance', async () => {
		tr = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	it('Test resetSupplierAllowance', async () => {
		tr = await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test increaseSupplierAllowance', async () => {
		tr = await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test decreaseSupplierAllowance', async () => {
		tr = await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test getRoles', async () => {
		tr = await th.getRoles(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Test dissociateToken', async () => {
		tr = await th.dissociateToken(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Test associateToken', async () => {
		tr = await th.associateToken(
			stableCoinCapabilitiesSC,
			HederaId.from('0.0.48471385'),
		);
	}, 1500000);

	afterEach(async () => {
		expect(tr).not.toBeNull();
		expect(tr.error).toEqual(undefined);
	});
});

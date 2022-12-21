/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../../src/domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
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
import NetworkService from '../../../../src/app/service/NetworkService.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import StableCoinService from '../../../../src/app/service/StableCoinService.js';

describe('🧪 [BUILDER] RPCTransactionBuilder', () => {
	let stableCoinCapabilitiesHTS: StableCoinCapabilities;
	let stableCoinCapabilitiesSC: StableCoinCapabilities;

	let th: RPCTransactionAdapter;
	let tr: TransactionResponse;
	let ns: NetworkService;
	let stableCoinService: StableCoinService;

	const createToken = async (
		stablecoin: StableCoin,
		account: Account,
	): Promise<StableCoinCapabilities> => {
		tr = await th.create(
			stablecoin,
			new ContractId(FactoryAddressTestnet),
			new ContractId(HederaERC20AddressTestnet),
		);
		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[3]),
		);
		return await stableCoinService.getCapabilities(account, tokenIdSC);
	};
	beforeAll(async () => {
		th = Injectable.resolve(RPCTransactionAdapter);
		ns = Injectable.resolve(NetworkService);
		ns.environment = 'testnet';
		await th.init(true);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);
		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			th.provider,
		);
		const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.setEnvironment('testnet');
		stableCoinService = Injectable.resolve(StableCoinService);

		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1000', 6),
			// maxSupply: '',
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			// treasury: CLIENT_ACCOUNT_ED25519.id.toString(),
			supplyType: TokenSupplyType.INFINITE,
		});

		const coinHTS = new StableCoin({
			name: 'TEST_ACCELERATOR_HTS',
			symbol: 'TEST',
			decimals: 6,
			initialSupply: BigDecimal.fromString('1000', 6),
			// maxSupply: '',
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			freezeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			wipeKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			pauseKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			supplyKey: CLIENT_ACCOUNT_ECDSA.publicKey,
			treasury: CLIENT_ACCOUNT_ECDSA.id,
			supplyType: TokenSupplyType.INFINITE,
		});

		stableCoinCapabilitiesSC = await createToken(
			coinSC,
			CLIENT_ACCOUNT_ECDSA,
		);
		stableCoinCapabilitiesHTS = await createToken(
			coinHTS,
			CLIENT_ACCOUNT_ECDSA,
		);
		console.log(
			`HTS: ${stableCoinCapabilitiesHTS.coin.tokenId?.toString()}`,
		);
		console.log(`SC: ${stableCoinCapabilitiesSC.coin.tokenId?.toString()}`);

		expect(stableCoinCapabilitiesSC).not.toBeNull();
		expect(stableCoinCapabilitiesHTS).not.toBeNull();
	}, 1500000);

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

	it('Test mint SC', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString(
				'0.5',
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);
	}, 1500000);

	it('Test wipe SC', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test burn SC', async () => {
		tr = await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test rescue SC', async () => {
		tr = await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test freeze SC', async () => {
		tr = await th.freeze(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ECDSA.id);
	}, 1500000);

	it('Test unfreeze SC', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test pause SC', async () => {
		tr = await th.pause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test unpause SC', async () => {
		tr = await th.unpause(stableCoinCapabilitiesSC);
	}, 1500000);

	it('Test mint HTS', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesSC.coin.decimals),
		);
	}, 1500000);

	it('Test wipe HTS', async () => {
		tr = await th.cashin(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
		tr = await th.wipe(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
	}, 1500000);

	it('Test burn HTS', async () => {
		tr = await th.burn(
			stableCoinCapabilitiesHTS,
			BigDecimal.fromString('1', stableCoinCapabilitiesHTS.coin.decimals),
		);
	}, 1500000);

	it('Test freeze HTS', async () => {
		tr = await th.freeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test unfreeze HTS', async () => {
		tr = await th.unfreeze(
			stableCoinCapabilitiesHTS,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test pause HTS', async () => {
		tr = await th.pause(stableCoinCapabilitiesHTS);
	}, 1500000);

	it('Test unpause HTS', async () => {
		tr = await th.unpause(stableCoinCapabilitiesHTS);
	}, 1500000);

	// it('Test transfer', async () => {
	//     tr = await th.mint(tokenId, Long.ONE);
	//     tr = await th.transfer(tokenId, Long.ONE, clientAccountId, accountId);
	// });

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
			CLIENT_ACCOUNT_ECDSA.id,
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
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	it('Test getBalanceOf', async () => {
		tr = await th.balanceOf(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
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
			CLIENT_ACCOUNT_ECDSA.id,
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
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('Test associateToken', async () => {
		tr = await th.associateToken(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ECDSA.id,
		);
	}, 1500000);

	afterEach(async () => {
		expect(tr).not.toBeNull();
		expect(tr.error).toEqual(undefined);
	});
});

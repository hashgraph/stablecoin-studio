import EventService from '../../../src/app/service/event/EventService.js';
import { WalletEvents } from '../../../src/app/service/event/WalletEvent.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	Account,
	Balance,
	FactoryAddressTestnet,
	HederaERC20AddressTestnet,
	Network,
	Role,
	StableCoin,
	StableCoinRole,
	StableCoinViewModel,
	TokenSupplyType,
} from '../../../src/index.js';
import {
	CheckSupplierLimitRequest,
	CreateRequest,
	GetRolesRequest,
	GetSupplierAllowanceRequest,
	GrantRoleRequest,
	HasRoleRequest,
	RevokeRoleRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import { CLIENT_ACCOUNT_ED25519 } from '../../config.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';

describe('🧪 SDK test', () => {
	let stableCoinSC: StableCoinViewModel;
	beforeAll(async () => {
		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
			}),
		);
		Injectable.resolveTransactionHandler();
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR_SC',
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
		// stableCoinSC = await StableCoin.create(requestSC);
		// console.log(stableCoinSC.tokenId);
	}, 60_000);

	it('Has role', async () => {
		const res = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		expect(res).toBe(true);
	}, 60_000);

	it('Grant role', async () => {
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
	}, 60_000);

	it('Grant role Unlimited', async () => {
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
		expect(isUnlimited).toBe(true);
		expect(allowance).toBe('0');
	}, 60_000);

	it('Grant role Limited', async () => {
		const AMOUNT = '100';
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: AMOUNT,
			}),
		);
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);

		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
		expect(isUnlimited).toBe(false);
		expect(allowance).toBe(AMOUNT);
	}, 60_000);

	it('Revoke role', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
	}, 60_000);

	it('Get roles', async () => {
		const roles = await Role.getRoles(
			new GetRolesRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		console.log(roles);
		expect(Array.isArray(roles)).toBe(true);
	}, 60_000);

	it('Get allowance', async () => {
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		expect(allowance instanceof Balance).toBe(true);
	}, 60_000);
});

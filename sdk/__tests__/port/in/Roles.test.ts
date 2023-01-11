/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
	DecreaseSupplierAllowanceRequest,
	GetRolesRequest,
	GetSupplierAllowanceRequest,
	GrantRoleRequest,
	HasRoleRequest,
	IncreaseSupplierAllowanceRequest,
	ResetSupplierAllowanceRequest,
	RevokeRoleRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import { CLIENT_ACCOUNT_ED25519 } from '../../config.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';

describe('🧪 Role test', () => {
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
			createPoR: true,
			PoRInitialAmount: "10.55"
		});
		stableCoinSC = await StableCoin.create(requestSC);
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
		expect(allowance.value).toStrictEqual(
			BigDecimal.fromString('0', stableCoinSC?.decimals ?? 6),
		);
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
		expect(allowance.value).toStrictEqual(
			BigDecimal.fromString(AMOUNT, stableCoinSC?.decimals ?? 6),
		);
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

	it('Revoke cashIn role', async () => {
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
		// console.log(roles);
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

	it('Reset allowance', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const resetAllowance = await Role.resetAllowance(
			new ResetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);

		expect(grantRes).toBe(true);
		expect(allowanceBefore.value).toStrictEqual(
			BigDecimal.fromString('10', stableCoinSC?.decimals ?? 6),
		);
		expect(resetAllowance).toBe(true);
		expect(allowanceAfter.value).toStrictEqual(
			BigDecimal.fromString('0', stableCoinSC?.decimals ?? 6),
		);
	}, 60_000);

	it('Increase allowance', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const increaseAllowance = await Role.increaseAllowance(
			new IncreaseSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				amount: '10',
			}),
		);
		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);

		expect(grantRes).toBe(true);
		expect(allowanceBefore.value).toStrictEqual(
			BigDecimal.fromString('10', stableCoinSC?.decimals ?? 6),
		);
		expect(increaseAllowance).toBe(true);
		expect(allowanceAfter.value).toStrictEqual(
			BigDecimal.fromString('20', stableCoinSC?.decimals ?? 6),
		);
	}, 80_000);

	it('Decrease allowance', async () => {
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
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
				amount: '10',
			}),
		);

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const decreaseAllowance = await Role.decreaseAllowance(
			new DecreaseSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				amount: '5',
			}),
		);
		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);

		expect(revokeRes).toBe(true);
		expect(grantRes).toBe(true);
		expect(allowanceBefore.value).toStrictEqual(
			BigDecimal.fromString('10', stableCoinSC?.decimals ?? 6),
		);
		expect(decreaseAllowance).toBe(true);
		expect(allowanceAfter.value).toStrictEqual(
			BigDecimal.fromString('5', stableCoinSC?.decimals ?? 6),
		);
	}, 60_000);

	it('isLimited allowance', async () => {
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
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
				amount: '10',
			}),
		);
		const isLimited = await Role.isLimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);

		expect(revokeRes).toBe(true);
		expect(grantRes).toBe(true);
		expect(isLimited).toBe(true);
		expect(isUnlimited).toBe(false);
	}, 60_000);

	it('isUnlimited allowance', async () => {
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
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
		expect(hasRole).toBe(false);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isLimited = await Role.isLimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.49135648',
			}),
		);

		expect(revokeRes).toBe(true);
		expect(grantRes).toBe(true);
		expect(isLimited).toBe(false);
		expect(isUnlimited).toBe(true);
	}, 60_000);
});

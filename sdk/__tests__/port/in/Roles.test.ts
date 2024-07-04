/*
 *
 * Hedera Stablecoin SDK
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

import {
	Account,
	Balance,
	HederaId,
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
	InitializationRequest,
	ResetSupplierAllowanceRequest,
	RevokeRoleRequest,
	GrantMultiRolesRequest,
	RevokeMultiRolesRequest,
} from '../../../src/port/in/request/index.js';
import ConnectRequest, {
	SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import {
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	DECIMALS,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';
import GetAccountsWithRolesRequest from '../../../src/port/in/request/GetAccountsWithRolesRequest.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import Injectable from '../../../src/core/Injectable.js';

describe('🧪 Role test', () => {
	const stableCoinSC = {
		tokenId: new HederaId('0.0.9999999'),
		decimals: DECIMALS,
	};

	beforeAll(async () => {
		const mirrorNode: MirrorNode = {
			name: 'testmirrorNode',
			baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
		};

		const rpcNode: JsonRpcRelay = {
			name: 'testrpcNode',
			baseUrl: 'https://testnet.hashio.io/api',
		};

		await Network.connect(
			new ConnectRequest({
				account: {
					accountId: CLIENT_ACCOUNT_ED25519.id.toString(),
					privateKey: CLIENT_ACCOUNT_ED25519.privateKey,
				},
				network: 'testnet',
				wallet: SupportedWallets.CLIENT,
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		await Network.init(
			new InitializationRequest({
				network: 'testnet',
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
				mirrorNode: mirrorNode,
				rpcNode: rpcNode,
			}),
		);
		Injectable.resolveTransactionHandler();
	}, 60_000);

	it('Grant & Revoke role', async () => {
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		const noRoleAgain = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
		expect(noRoleAgain).toBe(false);
	}, 60_000);

	it('Grant & Revoke Multi role', async () => {
		const noRole_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const noRole_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantMultiRoles(
			new GrantMultiRolesRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetsId: [CLIENT_ACCOUNT_ED25519.id.toString()],
				roles: [StableCoinRole.WIPE_ROLE, StableCoinRole.CASHIN_ROLE],
				amounts: ['0'],
			}),
		);

		const hasRole_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const hasRole_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeMultiRoles(
			new RevokeMultiRolesRequest({
				targetsId: [CLIENT_ACCOUNT_ED25519.id.toString()],
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				roles: [StableCoinRole.WIPE_ROLE, StableCoinRole.CASHIN_ROLE],
			}),
		);
		const noRole_again_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const noRole_again_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		expect(revokeRes).toBe(true);
		expect(noRole_1).toBe(false);
		expect(noRole_2).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole_1).toBe(true);
		expect(hasRole_2).toBe(true);
		expect(isUnlimited).toBe(true);
		expect(noRole_again_1).toBe(false);
		expect(noRole_again_2).toBe(false);
	}, 60_000);

	it('Grant role Unlimited', async () => {
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
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

		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: AMOUNT,
			}),
		);

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
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

	it('Revoke cashIn role', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
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
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		// console.log(roles);
		expect(Array.isArray(roles)).toBe(true);
	}, 60_000);

	it('Get allowance', async () => {
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		expect(allowance instanceof Balance).toBe(true);
	}, 60_000);

	it('Reset allowance', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const resetAllowance = await Role.resetAllowance(
			new ResetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);

		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		expect(revokeRes).toBe(true);
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
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const increaseAllowance = await Role.increaseAllowance(
			new IncreaseSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				amount: '10',
			}),
		);

		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		expect(revokeRes).toBe(true);
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
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const decreaseAllowance = await Role.decreaseAllowance(
			new DecreaseSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				amount: '5',
			}),
		);

		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
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
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		const isLimited = await Role.isLimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		expect(revokeRes).toBe(true);
		expect(grantRes).toBe(true);
		expect(isLimited).toBe(true);
		expect(isUnlimited).toBe(false);
	}, 60_000);

	it('isUnlimited allowance', async () => {
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		expect(hasRole).toBe(false);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		const isLimited = await Role.isLimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		expect(revokeRes).toBe(true);
		expect(grantRes).toBe(true);
		expect(isLimited).toBe(false);
		expect(isUnlimited).toBe(true);
	}, 60_000);

	it('Get account for roles', async () => {
		const accounts_Before = await Role.getAccountsWithRole(
			new GetAccountsWithRolesRequest({
				roleId: StableCoinRole.PAUSE_ROLE,
				tokenId: stableCoinSC?.tokenId?.toString() ?? '',
			}),
		);

		const accountsToHaveRole = [
			CLIENT_ACCOUNT_ED25519.id.toString(),
			CLIENT_ACCOUNT_ECDSA.id.toString(),
		];

		await Role.grantMultiRoles(
			new GrantMultiRolesRequest({
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				targetsId: accountsToHaveRole,
				roles: [StableCoinRole.PAUSE_ROLE],
				amounts: [],
			}),
		);

		const accounts_After = await Role.getAccountsWithRole(
			new GetAccountsWithRolesRequest({
				roleId: StableCoinRole.PAUSE_ROLE,
				tokenId: stableCoinSC?.tokenId?.toString() ?? '',
			}),
		);

		const revokeRes = await Role.revokeMultiRoles(
			new RevokeMultiRolesRequest({
				targetsId: [CLIENT_ACCOUNT_ED25519.id.toString()],
				tokenId: stableCoinSC?.tokenId?.toString() ?? '0.0.0',
				roles: [StableCoinRole.PAUSE_ROLE],
			}),
		);

		expect(revokeRes).toBe(true);
		expect(accounts_Before.length).toEqual(0);
		expect(accounts_After.length).toEqual(2);
		expect(accounts_After[0]).toEqual(CLIENT_ACCOUNT_ED25519.id.toString());
		expect(accounts_After[1]).toEqual(CLIENT_ACCOUNT_ECDSA.id.toString());
	}, 60_000);
});

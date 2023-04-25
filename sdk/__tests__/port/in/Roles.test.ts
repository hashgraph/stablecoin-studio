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
	FACTORY_ADDRESS,
	HEDERA_ERC20_ADDRESS,
} from '../../config.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';
import GetAccountsWithRolesRequest from '../../../src/port/in/request/GetAccountsWithRolesRequest.js';
import { HederaId } from '../../../src/domain/context/shared/HederaId.js';

describe('🧪 Role test', () => {
	let stableCoinSC: StableCoinViewModel;

	const delay = async (seconds = 3): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

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
		await Network.init(
			new InitializationRequest({
				network: 'testnet',
				configuration: {
					factoryAddress: FACTORY_ADDRESS,
				},
			}),
		);
		Injectable.resolveTransactionHandler();
		const requestSC = new CreateRequest({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: '6',
			initialSupply: '1000',
			freezeKey: Account.NullPublicKey,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			supplyType: TokenSupplyType.INFINITE,
			stableCoinFactory: FACTORY_ADDRESS,
			hederaERC20: HEDERA_ERC20_ADDRESS,
			createReserve: true,
			grantKYCToOriginalSender: true,
			burnRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			rescueRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			deleteRoleAccount: CLIENT_ACCOUNT_ED25519.id.toString(),
			reserveInitialAmount: '1000',
		});
		stableCoinSC = (await StableCoin.create(requestSC)).coin;

		await delay();
	}, 60_000);

	it('Has role', async () => {
		const res = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.RESCUE_ROLE,
			}),
		);
		expect(res).toBe(true);
	}, 60_000);

	it('Grant role', async () => {
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		await delay();

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		await delay();

		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
	}, 60_000);

	it('Grant Multi role', async () => {
		const noRole_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const noRole_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantMultiRoles(
			new GrantMultiRolesRequest({
				tokenId: stableCoinSC?.tokenId!.toString(),
				targetsId: [CLIENT_ACCOUNT_ED25519.id.toString()],
				roles: [StableCoinRole.WIPE_ROLE, StableCoinRole.CASHIN_ROLE],
				amounts: ['0'],
			}),
		);

		await delay();

		const hasRole_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const hasRole_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes_1 = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const revokeRes_2 = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		expect(revokeRes_1).toBe(true);
		expect(revokeRes_2).toBe(true);
		expect(noRole_1).toBe(false);
		expect(noRole_2).toBe(false);
		expect(grantRes).toBe(true);
		expect(hasRole_1).toBe(true);
		expect(hasRole_2).toBe(true);
		expect(isUnlimited).toBe(true);
	}, 60_000);

	it('Grant role Unlimited', async () => {
		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

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
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: AMOUNT,
			}),
		);

		await delay();

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

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
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		await delay();

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);

		await delay();

		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		expect(grantRes).toBe(true);
		expect(hasRole).toBe(true);
		expect(revokeRes).toBe(true);
		expect(noRole).toBe(false);
	}, 60_000);

	it('Revoke Multi role', async () => {
		const grantRes_1 = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const grantRes_2 = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		const hasRole_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const hasRole_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const revokeRes = await Role.revokeMultiRoles(
			new RevokeMultiRolesRequest({
				targetsId: [CLIENT_ACCOUNT_ED25519.id.toString()],
				tokenId: stableCoinSC?.tokenId!.toString(),
				roles: [StableCoinRole.WIPE_ROLE, StableCoinRole.CASHIN_ROLE],
			}),
		);

		await delay();

		const noRole_1 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.WIPE_ROLE,
			}),
		);
		const noRole_2 = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		expect(grantRes_1).toBe(true);
		expect(grantRes_2).toBe(true);
		expect(hasRole_1).toBe(true);
		expect(hasRole_2).toBe(true);
		expect(revokeRes).toBe(true);
		expect(noRole_1).toBe(false);
		expect(noRole_2).toBe(false);
	}, 60_000);

	it('Revoke cashIn role', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		const noRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
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
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		// console.log(roles);
		expect(Array.isArray(roles)).toBe(true);
	}, 60_000);

	it('Get allowance', async () => {
		const allowance = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		expect(allowance instanceof Balance).toBe(true);
	}, 60_000);

	it('Reset allowance', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		await delay();

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const resetAllowance = await Role.resetAllowance(
			new ResetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);

		await delay();

		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		expect(grantRes).toBe(true);
		expect(allowanceBefore.value).toStrictEqual(
			BigDecimal.fromString('10', stableCoinSC?.decimals ?? 6),
		);
		expect(resetAllowance).toBe(true);
		expect(allowanceAfter.value).toStrictEqual(
			BigDecimal.fromString('0', stableCoinSC?.decimals ?? 6),
		);
		expect(revokeRes).toBe(true);
	}, 60_000);

	it('Increase allowance', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		await delay();

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const increaseAllowance = await Role.increaseAllowance(
			new IncreaseSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				amount: '10',
			}),
		);

		await delay();

		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		expect(grantRes).toBe(true);
		expect(allowanceBefore.value).toStrictEqual(
			BigDecimal.fromString('10', stableCoinSC?.decimals ?? 6),
		);
		expect(increaseAllowance).toBe(true);
		expect(allowanceAfter.value).toStrictEqual(
			BigDecimal.fromString('20', stableCoinSC?.decimals ?? 6),
		);
		expect(revokeRes).toBe(true);
	}, 80_000);

	it('Decrease allowance', async () => {
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		await delay();

		const allowanceBefore = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const decreaseAllowance = await Role.decreaseAllowance(
			new DecreaseSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				amount: '5',
			}),
		);

		await delay();

		const allowanceAfter = await Role.getAllowance(
			new GetSupplierAllowanceRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

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
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
				supplierType: 'limited',
				amount: '10',
			}),
		);

		await delay();

		const isLimited = await Role.isLimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		expect(revokeRes).toBe(true);
		expect(grantRes).toBe(true);
		expect(isLimited).toBe(true);
		expect(isUnlimited).toBe(false);
	}, 60_000);

	it('isUnlimited allowance', async () => {
		const hasRole = await Role.hasRole(
			new HasRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);
		expect(hasRole).toBe(false);
		const grantRes = await Role.grantRole(
			new GrantRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

		const isLimited = await Role.isLimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const isUnlimited = await Role.isUnlimited(
			new CheckSupplierLimitRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
			}),
		);
		const revokeRes = await Role.revokeRole(
			new RevokeRoleRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId: stableCoinSC?.tokenId!.toString(),
				role: StableCoinRole.CASHIN_ROLE,
			}),
		);

		await delay();

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
				tokenId: stableCoinSC?.tokenId!.toString(),
				targetsId: accountsToHaveRole,
				roles: [StableCoinRole.PAUSE_ROLE],
				amounts: [],
			}),
		);

		await delay();

		const accounts_After = await Role.getAccountsWithRole(
			new GetAccountsWithRolesRequest({
				roleId: StableCoinRole.PAUSE_ROLE,
				tokenId: stableCoinSC?.tokenId?.toString() ?? '',
			}),
		);

		expect(accounts_Before.length).toEqual(0);
		expect(accounts_After.length).toEqual(2);
		expect(accounts_After[0].toUpperCase()).toEqual(
			CLIENT_ACCOUNT_ED25519.evmAddress!.toUpperCase(),
		);
		expect(accounts_After[1].toUpperCase()).toEqual(
			CLIENT_ACCOUNT_ECDSA.evmAddress!.toUpperCase(),
		);
	}, 60_000);
});

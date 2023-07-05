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

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/no-disabled-tests */

import { StableCoin } from '../../../src/domain/context/stablecoin/StableCoin.js';
import {
	AssociateTokenRequest,
	ConnectRequest,
	FreezeAccountRequest,
	GetAccountBalanceHBARRequest,
	GetAccountBalanceRequest,
	GetStableCoinDetailsRequest,
	HBAR_DECIMALS,
	KYCRequest,
	Network,
	StableCoin as StableCoinInPort,
	Proxy as ProxyInPort,
	Factory as FactoryInPort,
	SupportedWallets,
	ChangeProxyOwnerRequest,
	ProxyConfigurationViewModel,
	GetProxyConfigRequest,
	GetTokenManagerListRequest,
	UpgradeImplementationRequest,
} from '../../../src/index.js';
import StableCoinCapabilities from '../../../src/domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';
import { ethers, Wallet } from 'ethers';
import { StableCoinRole } from '../../../src/domain/context/stablecoin/StableCoinRole.js';
import Injectable from '../../../src/core/Injectable.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import PublicKey from '../../../src/domain/context/account/PublicKey.js';
import ContractId from '../../../src/domain/context/contract/ContractId.js';
import { TokenSupplyType } from '../../../src/port/in/StableCoin.js';
import {
	CLIENT_ACCOUNT_ECDSA,
	CLIENT_ACCOUNT_ED25519,
	FACTORY_ADDRESS,
	HEDERA_TOKEN_MANAGER_ADDRESS,
} from '../../config.js';
import Account from '../../../src/domain/context/account/Account.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import {
	Client,
	ContractId as HContractId,
	Hbar,
	TransferTransaction,
} from '@hashgraph/sdk';
import StableCoinService from '../../../src/app/service/StableCoinService.js';
import { RESERVE_DECIMALS } from '../../../src/domain/context/reserve/Reserve.js';
import RPCTransactionAdapter from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import RPCQueryAdapter from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import { LoggerTransports, SDK } from '../../../src/index.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import EvmAddress from '../../../src/domain/context/contract/EvmAddress.js';
import { EVM_ZERO_ADDRESS } from '../../../src/core/Constants.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };
const mirrorNode: MirrorNode = {
	name: 'testmirrorNode',
	baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};
const rpcNode: JsonRpcRelay = {
	name: 'testrpcNode',
	baseUrl: 'http://127.0.0.1:7546/api',
};
const decimals = 6;
const initSupply = 1000;
const reserve = 100000000;

describe('🧪 [ADAPTER] RPCTransactionAdapter', () => {
	let stableCoinCapabilitiesSC: StableCoinCapabilities;

	let th: RPCTransactionAdapter;
	let ns: NetworkService;
	let rpcQueryAdapter: RPCQueryAdapter;
	let stableCoinService: StableCoinService;
	let proxyAdmin: string;
	let proxy: string;

	const delay = async (seconds = 4): Promise<void> => {
		seconds = seconds * 1000;
		await new Promise((r) => setTimeout(r, seconds));
	};

	const createToken = async (
		stablecoin: StableCoin,
		account: Account,
		proxyAdminOwner: ContractId | undefined = undefined,
	): Promise<StableCoinCapabilities> => {
		const tr = await th.create(
			stablecoin,
			new ContractId(FACTORY_ADDRESS),
			new ContractId(HEDERA_TOKEN_MANAGER_ADDRESS),
			true,
			undefined,
			BigDecimal.fromString(reserve.toString(), RESERVE_DECIMALS),
			proxyAdminOwner,
		);

		proxyAdmin = tr.response[0][1];
		proxy = tr.response[0][0];

		const tokenIdSC = ContractId.fromHederaContractId(
			HContractId.fromSolidityAddress(tr.response[0][3]),
		);
		return await stableCoinService.getCapabilities(account, tokenIdSC);
	};

	beforeAll(async () => {
		const mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
		mirrorNodeAdapter.set(mirrorNode);

		th = Injectable.resolve(RPCTransactionAdapter);
		ns = Injectable.resolve(NetworkService);
		rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);

		rpcQueryAdapter.init();
		ns.environment = 'testnet';

		await th.init(true);
		await th.register(CLIENT_ACCOUNT_ECDSA, true);

		const url = 'http://127.0.0.1:7546';
		const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

		th.signerOrProvider = new Wallet(
			CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
			customHttpProvider,
		);

		stableCoinService = Injectable.resolve(StableCoinService);

		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: decimals,
			initialSupply: BigDecimal.fromString(
				initSupply.toString(),
				decimals,
			),
			autoRenewAccount: CLIENT_ACCOUNT_ECDSA.id,
			adminKey: PublicKey.NULL,
			freezeKey: PublicKey.NULL,
			kycKey: PublicKey.NULL,
			wipeKey: PublicKey.NULL,
			pauseKey: PublicKey.NULL,
			supplyKey: PublicKey.NULL,
			feeScheduleKey: PublicKey.NULL,
			supplyType: TokenSupplyType.INFINITE,
			burnRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			wipeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			rescueRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			freezeRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			pauseRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			deleteRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			kycRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAccount: CLIENT_ACCOUNT_ECDSA.id,
			cashInRoleAllowance: BigDecimal.ZERO,
			metadata: '',
		});

		stableCoinCapabilitiesSC = await createToken(
			coinSC,
			CLIENT_ACCOUNT_ECDSA,
		);

		// Associating another account to the token
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

		await StableCoinInPort.associate(
			new AssociateTokenRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await delay();

		// switching back to the metamask handler
		await th.register(CLIENT_ACCOUNT_ECDSA, true);

		await StableCoinInPort.grantKyc(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);
	}, 1500000);

	it('Deploy a stable coin with the deploying account as the proxy admin owner', async () => {
		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: decimals,
		});

		const stableCoinCapabilitiesSC: StableCoinCapabilities =
			await createToken(coinSC, CLIENT_ACCOUNT_ECDSA, undefined);

		const proxyConfigurationViewModel: ProxyConfigurationViewModel =
			await ProxyInPort.getProxyConfig(
				new GetProxyConfigRequest({
					tokenId:
						stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
						'0.0.0',
				}),
			);
		expect(proxyConfigurationViewModel.owner.value).toEqual(
			CLIENT_ACCOUNT_ECDSA.id.value,
		);
	}, 30000);

	it('Deploy a stable coin with a proxy admin owner different than the deploying account', async () => {
		const coinSC = new StableCoin({
			name: 'TEST_ACCELERATOR_SC',
			symbol: 'TEST',
			decimals: decimals,
		});

		const stableCoinCapabilitiesSC: StableCoinCapabilities =
			await createToken(
				coinSC,
				CLIENT_ACCOUNT_ECDSA,
				new ContractId('0.0.12345'),
			);
		const proxyConfigurationViewModel: ProxyConfigurationViewModel =
			await ProxyInPort.getProxyConfig(
				new GetProxyConfigRequest({
					tokenId:
						stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
						'0.0.0',
				}),
			);
		expect(proxyConfigurationViewModel.owner.value).toEqual('0.0.12345');
	}, 30000);

	it('Cash In & Wipe', async () => {
		const Amount = 1;

		const balance_before = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await th.cashin(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString(
				Amount.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const balance_after_cashIn = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await th.wipe(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString(
				balance_after_cashIn.value.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const balance_after_wipe = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		expect(balance_before.value.toString()).toEqual('0');
		expect(balance_after_cashIn.value.toString()).toEqual(
			Amount.toString(),
		);
		expect(balance_after_wipe.value.toString()).toEqual('0');
	}, 1500000);

	it('Burn', async () => {
		const Amount = 1;

		const balance_before = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId:
					stableCoinCapabilitiesSC?.coin.proxyAddress?.toString() ??
					'0.0.0',
			}),
		);

		await th.burn(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString(
				Amount.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const balance_after = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId:
					stableCoinCapabilitiesSC?.coin.proxyAddress?.toString() ??
					'0.0.0',
			}),
		);

		const diff = balance_before.value
			.toBigNumber()
			.sub(balance_after.value.toBigNumber());
		const AmountWithDecimals = Amount * 10 ** decimals;

		expect(diff.toString()).toEqual(AmountWithDecimals.toString());
	}, 1500000);

	it.skip('Rescue', async () => {
		const Amount = 1;

		const balance_treasury_before = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId:
					stableCoinCapabilitiesSC?.coin.proxyAddress?.toString() ??
					'0.0.0',
			}),
		);

		const balance_account_before = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		await th.rescue(
			stableCoinCapabilitiesSC,
			BigDecimal.fromString(
				Amount.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const balance_treasury_after = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId:
					stableCoinCapabilitiesSC?.coin.proxyAddress?.toString() ??
					'0.0.0',
			}),
		);

		const balance_account_after = await StableCoinInPort.getBalanceOf(
			new GetAccountBalanceRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
			}),
		);

		const diff_treasury = balance_treasury_before.value
			.toBigNumber()
			.sub(balance_treasury_after.value.toBigNumber());

		const diff_account = balance_account_after.value
			.toBigNumber()
			.sub(balance_account_before.value.toBigNumber());

		const AmountWithDecimals = Amount * 10 ** decimals;

		expect(diff_treasury.toString()).toEqual(AmountWithDecimals.toString());
		expect(diff_account.toString()).toEqual(AmountWithDecimals.toString());
	}, 1500000);

	it('RescueHBAR', async () => {
		const initalHBARAmount = BigDecimal.fromString('2.5', HBAR_DECIMALS);
		const rescueAmount = BigDecimal.fromString('1.5', HBAR_DECIMALS);

		const client = Client.forTestnet();

		client.setOperator(
			CLIENT_ACCOUNT_ED25519.id.toString(),
			CLIENT_ACCOUNT_ED25519.privateKey?.key ?? '0',
		);

		const transaction = new TransferTransaction()
			.addHbarTransfer(
				CLIENT_ACCOUNT_ED25519.id.toString(),
				Hbar.fromTinybars(
					'-' + initalHBARAmount.toBigNumber().toString(),
				),
			)
			.addHbarTransfer(
				stableCoinCapabilitiesSC?.coin.treasury?.toString() ?? '0.0.0',
				Hbar.fromTinybars(initalHBARAmount.toBigNumber().toString()),
			);

		await transaction.execute(client);

		await delay();

		const initialAmount = await StableCoinInPort.getBalanceOfHBAR(
			new GetAccountBalanceHBARRequest({
				treasuryAccountId:
					stableCoinCapabilitiesSC?.coin.treasury?.toString() ??
					'0.0.0',
			}),
		);

		await th.rescueHBAR(stableCoinCapabilitiesSC, rescueAmount);

		await delay();

		const finalAmount = await StableCoinInPort.getBalanceOfHBAR(
			new GetAccountBalanceHBARRequest({
				treasuryAccountId:
					stableCoinCapabilitiesSC?.coin.treasury?.toString() ??
					'0.0.0',
			}),
		);

		const final = initialAmount.value
			.toBigNumber()
			.sub(rescueAmount.toBigNumber());

		expect(finalAmount.value.toBigNumber().toString()).toEqual(
			final.toString(),
		);
	}, 1500000);

	it('Freeze & UnFreeze', async () => {
		const notFrozen_1 = await StableCoinInPort.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await th.freeze(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ED25519.id);

		await delay();

		const Frozen = await StableCoinInPort.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await th.unfreeze(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ED25519.id);

		await delay();

		const notFrozen_2 = await StableCoinInPort.isAccountFrozen(
			new FreezeAccountRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		expect(notFrozen_1).toBe(false);
		expect(Frozen).toBe(true);
		expect(notFrozen_2).toBe(false);
	}, 1500000);

	it('Pause & UnPause', async () => {
		const notPaused_1 = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await th.pause(stableCoinCapabilitiesSC);

		await delay();

		const Paused = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await th.unpause(stableCoinCapabilitiesSC);

		await delay();

		const notPaused_2 = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		expect(notPaused_1.paused).toBe(false);
		expect(Paused.paused).toBe(true);
		expect(notPaused_2.paused).toBe(false);
	}, 1500000);

	it('Grant KYC & Revoke KYC', async () => {
		const kycOK_1 = await StableCoinInPort.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await th.revokeKyc(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ED25519.id);

		await delay();

		const kycNOK = await StableCoinInPort.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		await th.grantKyc(stableCoinCapabilitiesSC, CLIENT_ACCOUNT_ED25519.id);

		await delay();

		const kycOK_2 = await StableCoinInPort.isAccountKYCGranted(
			new KYCRequest({
				targetId: CLIENT_ACCOUNT_ED25519.id.toString(),
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		expect(kycOK_1).toBe(true);
		expect(kycNOK).toBe(false);
		expect(kycOK_2).toBe(true);
	}, 1500000);

	it('Grant & Revoke Burn Role', async () => {
		const noRole_1 = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);

		await th.grantRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);

		await delay();

		const RoleOK = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);

		await th.revokeRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);

		await delay();

		const noRole_2 = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.BURN_ROLE,
		);

		expect(noRole_1.response).toBe(false);
		expect(RoleOK.response).toBe(true);
		expect(noRole_2.response).toBe(false);
	}, 1500000);

	it('Grant, Revoke, Increase, Decrease & Reset Supplier Role', async () => {
		const Amount = 1;

		const noRole_1 = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.CASHIN_ROLE,
		);

		await th.grantSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString(
				Amount.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const RoleOK = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.CASHIN_ROLE,
		);

		const Allowance = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await th.increaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString(
				Amount.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const Allowance_increased = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await th.decreaseSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			BigDecimal.fromString(
				Amount.toString(),
				stableCoinCapabilitiesSC.coin.decimals,
			),
		);

		await delay();

		const Allowance_decreased = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await th.resetSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await delay();

		const Allowance_reset = await th.supplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await delay();

		const noRole_2 = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.CASHIN_ROLE,
		);

		expect(noRole_1.response).toBe(false);
		expect(RoleOK.response).toBe(true);
		expect(noRole_2.response).toBe(false);

		const AmountWithDecimals = Amount * 10 ** decimals;

		expect(
			Allowance.response && Allowance.response.toBigNumber().toString(),
		).toEqual(AmountWithDecimals.toString());
		expect(
			Allowance_increased.response &&
				Allowance_increased.response.toBigNumber().toString(),
		).toEqual((2 * AmountWithDecimals).toString());
		expect(
			Allowance_decreased.response &&
				Allowance_decreased.response.toBigNumber().toString(),
		).toEqual(AmountWithDecimals.toString());
		expect(
			Allowance_reset.response &&
				Allowance_reset.response.toBigNumber().toString(),
		).toEqual('0');
	}, 3500000);

	it('Grant & Revoke Unlimited Supplier Role', async () => {
		const noRole_1 = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.CASHIN_ROLE,
		);

		await th.grantUnlimitedSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await delay();

		const RoleOK = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.CASHIN_ROLE,
		);

		const AllowanceUnlimited_1 = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await th.revokeSupplierRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		await delay();

		const noRole_2 = await th.hasRole(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
			StableCoinRole.CASHIN_ROLE,
		);

		const AllowanceUnlimited_2 = await th.isUnlimitedSupplierAllowance(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		expect(noRole_1.response).toBe(false);
		expect(RoleOK.response).toBe(true);
		expect(noRole_2.response).toBe(false);
		expect(AllowanceUnlimited_1.response).toBe(true);
		expect(AllowanceUnlimited_2.response).toBe(false);
	}, 1500000);

	it('Get Roles', async () => {
		const Roles = await th.getRoles(
			stableCoinCapabilitiesSC,
			CLIENT_ACCOUNT_ED25519.id,
		);

		expect(Array.isArray(Roles.response)).toBe(true);
	}, 1500000);

	it('Get Reserve Address', async () => {
		const NewReserveAddress = '0.0.11111111';

		const ReserveAddress_1 = await th.getReserveAddress(
			stableCoinCapabilitiesSC,
		);
		const ReserveAddress_1_HederaId = new EvmAddress(
			ReserveAddress_1.response,
		);

		const ReserveAmount = await th.getReserveAmount(
			stableCoinCapabilitiesSC,
		);

		await th.updateReserveAddress(
			stableCoinCapabilitiesSC,
			new ContractId(NewReserveAddress),
		);

		await delay();

		const ReserveAddress_2 = await th.getReserveAddress(
			stableCoinCapabilitiesSC,
		);
		const ReserveAddress_2_HederaId = new EvmAddress(
			ReserveAddress_2.response,
		);

		await th.updateReserveAddress(
			stableCoinCapabilitiesSC,
			ReserveAddress_1_HederaId.toContractId(),
		);

		await delay();

		const ReserveAddress_3 = await th.getReserveAddress(
			stableCoinCapabilitiesSC,
		);

		expect(ReserveAmount.response.toString()).toEqual(reserve.toString());
		expect(ReserveAddress_2_HederaId.toContractId().toString()).toEqual(
			NewReserveAddress,
		);
		expect(ReserveAddress_3.response).toEqual(ReserveAddress_1.response);
	}, 1500000);

	it('Update Token', async () => {
		const init = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		const name = 'New Token Name';
		const symbol = 'New Token Symbol';
		const autoRenewPeriod = 30 * 24 * 3600;
		const freezeKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const kycKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const wipeKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const pauseKey = CLIENT_ACCOUNT_ECDSA.publicKey;
		const feeScheduleKey = CLIENT_ACCOUNT_ECDSA.publicKey;

		await th.update(
			stableCoinCapabilitiesSC,
			name,
			symbol,
			autoRenewPeriod,
			undefined,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			'',
		);

		await delay();

		const res = await StableCoinInPort.getInfo(
			new GetStableCoinDetailsRequest({
				id:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
			}),
		);

		expect(res.name).toEqual(name);
		expect(res.symbol).toEqual(symbol);
		expect(res.autoRenewPeriod).toEqual(autoRenewPeriod);
		expect(res.freezeKey?.toString()).toEqual(freezeKey?.toString());
		expect(res.kycKey?.toString()).toEqual(kycKey?.toString());
		expect(res.wipeKey?.toString()).toEqual(wipeKey?.toString());
		expect(res.pauseKey?.toString()).toEqual(pauseKey?.toString());

		await th.update(
			stableCoinCapabilitiesSC,
			init.name,
			init.symbol,
			init.autoRenewPeriod,
			undefined,
			PublicKey.NULL,
			PublicKey.NULL,
			PublicKey.NULL,
			PublicKey.NULL,
			PublicKey.NULL,
			'',
		);
	}, 1500000);

	it('Proxy change Owner and implementation', async () => {
		const proxyConfig_before: ProxyConfigurationViewModel =
			await ProxyInPort.getProxyConfig(
				new GetProxyConfigRequest({
					tokenId:
						stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
						'0.0.0',
				}),
			);

		const proxyAdminID = new EvmAddress(proxyAdmin).toContractId();

		const proxyID = new EvmAddress(proxy).toContractId();

		const contracts: ContractId[] =
			await FactoryInPort.getHederaTokenManagerList(
				new GetTokenManagerListRequest({ factoryId: FACTORY_ADDRESS }),
			);

		await th.upgradeImplementation(proxyID, proxyAdminID, contracts[0]);

		await th.changeOwner(proxyAdminID, CLIENT_ACCOUNT_ED25519.id);

		await delay();

		const proxyConfig_after: ProxyConfigurationViewModel =
			await ProxyInPort.getProxyConfig(
				new GetProxyConfigRequest({
					tokenId:
						stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
						'0.0.0',
				}),
			);

		// switching to client account and resetting owner and implementation
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

		await ProxyInPort.upgradeImplementation(
			new UpgradeImplementationRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				implementationAddress:
					proxyConfig_before.implementationAddress.toString(),
			}),
		);

		await ProxyInPort.changeProxyOwner(
			new ChangeProxyOwnerRequest({
				tokenId:
					stableCoinCapabilitiesSC?.coin.tokenId?.toString() ??
					'0.0.0',
				targetId: CLIENT_ACCOUNT_ECDSA.id.toString(),
			}),
		);

		// switching back to the metamask handler
		await th.register(CLIENT_ACCOUNT_ECDSA, true);

		expect(proxyConfig_after.implementationAddress.toString()).toEqual(
			contracts[0].toString(),
		);
		expect(proxyConfig_after.owner.toString()).toEqual(
			CLIENT_ACCOUNT_ED25519.id.toString(),
		);
	}, 1500000);

	it('Delete Token', async () => {
		await th.delete(stableCoinCapabilitiesSC);
	}, 1500000);
});

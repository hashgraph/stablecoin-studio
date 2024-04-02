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

import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import { InvalidWalletTypeError } from '../../domain/context/network/error/InvalidWalletAccountTypeError.js';
import { SupportedWallets } from '../../domain/context/network/Wallet.js';
import { HashpackTransactionAdapter } from '../../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { HTSTransactionAdapter } from '../../port/out/hs/hts/HTSTransactionAdapter.js';
import RPCTransactionAdapter from '../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../port/out/TransactionAdapter.js';
import Service from './Service.js';
import { BladeTransactionAdapter } from '../../port/out/hs/blade/BladeTransactionAdapter.js';
import { FireblocksTransactionAdapter } from '../../port/out/hs/hts/custodial/FireblocksTransactionAdapter';
import { DFNSTransactionAdapter } from '../../port/out/hs/hts/custodial/DFNSTransactionAdapter';
import { MultiSigTransactionAdapter } from '../../port/out/hs/multiSig/MultiSigTransactionAdapter.js';
import {
	Transaction,
	ContractExecuteTransaction,
	TokenWipeTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenDeleteTransaction,
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
	TokenAssociateTransaction,
	TokenGrantKycTransaction,
	TokenRevokeKycTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenUpdateTransaction,
	CustomFractionalFee,
	CustomFixedFee,
} from '@hashgraph/sdk';
import { MirrorNodeAdapter } from '../../port/out/mirror/MirrorNodeAdapter.js';
import {
	HederaTokenManager__factory,
	ProxyAdmin__factory,
	Proxy__factory,
	StableCoinProxyAdmin__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import { ethers } from 'ethers';
import Hex from '../../core/Hex.js';

export const EVM_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}$/;

@singleton()
export default class TransactionService extends Service {
	constructor(
		public readonly mirrorNodeAdapter: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {
		super();
	}

	getHandler(): TransactionAdapter {
		return Injectable.resolveTransactionHandler();
	}

	setHandler(adp: TransactionAdapter): TransactionAdapter {
		Injectable.registerTransactionHandler(adp);
		return adp;
	}

	static getHandlerClass(type: SupportedWallets): TransactionAdapter {
		switch (type) {
			case SupportedWallets.HASHPACK:
				if (!Injectable.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(HashpackTransactionAdapter);
			case SupportedWallets.BLADE:
				if (!Injectable.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(BladeTransactionAdapter);
			case SupportedWallets.METAMASK:
				if (!Injectable.isWeb()) {
					throw new InvalidWalletTypeError(type);
				}
				return Injectable.resolve(RPCTransactionAdapter);
			case SupportedWallets.FIREBLOCKS:
				return Injectable.resolve(FireblocksTransactionAdapter);
			case SupportedWallets.DFNS:
				return Injectable.resolve(DFNSTransactionAdapter);
			case SupportedWallets.MULTISIG:
				return Injectable.resolve(MultiSigTransactionAdapter);
			default:
				return Injectable.resolve(HTSTransactionAdapter);
		}
	}

	static async getDescription(
		t: Transaction,
		mirrorNodeAdapter: MirrorNodeAdapter,
	): Promise<string> {
		try {
			if (t instanceof ContractExecuteTransaction) {
				const contractId = (t as ContractExecuteTransaction).contractId;
				const functionParameters = (t as ContractExecuteTransaction)
					.functionParameters;
				const decodedFunctionParameters = this.decodeFunctionCall(
					functionParameters!,
				);
				const inputArgs = decodedFunctionParameters.args;
				let args = '';

				for (
					let i = 0;
					i <
					decodedFunctionParameters.functionFragment.inputs.length;
					i++
				) {
					if (i != 0) args = args.concat(', ');
					let value = inputArgs[i];

					if (EVM_ADDRESS_REGEX.test(value)) {
						const accountInfo =
							await mirrorNodeAdapter.getAccountInfo(value);
						value = accountInfo.id;
					}

					args = args.concat(
						decodedFunctionParameters.functionFragment.inputs[i]
							.name +
							' : ' +
							value,
					);
				}

				return `Calling contract ${contractId?.shard}.${contractId?.realm}.${contractId?.num}. ${decodedFunctionParameters.name} : ${args}`;
			} else if (t instanceof TokenWipeTransaction) {
				const tokenId = (t as TokenWipeTransaction).tokenId;
				const accountId = (t as TokenWipeTransaction).accountId;
				const amount = (t as TokenWipeTransaction).amount;

				return `Wiping from ${tokenId}, ${amount} tokens from account ${accountId}`;
			} else if (t instanceof TokenMintTransaction) {
				const tokenId = (t as TokenMintTransaction).tokenId;
				const amount = (t as TokenMintTransaction).amount;

				return `Minting for ${tokenId}, ${amount} tokens`;
			} else if (t instanceof TokenBurnTransaction) {
				const tokenId = (t as TokenBurnTransaction).tokenId;
				const amount = (t as TokenBurnTransaction).amount;

				return `Burning from ${tokenId}, ${amount} tokens`;
			} else if (t instanceof TokenPauseTransaction) {
				const tokenId = (t as TokenPauseTransaction).tokenId;

				return `Pausing token ${tokenId}`;
			} else if (t instanceof TokenUnpauseTransaction) {
				const tokenId = (t as TokenUnpauseTransaction).tokenId;

				return `Unpausing token ${tokenId}`;
			} else if (t instanceof TokenDeleteTransaction) {
				const tokenId = (t as TokenDeleteTransaction).tokenId;

				return `Deleting token ${tokenId}`;
			} else if (t instanceof TokenFreezeTransaction) {
				const tokenId = (t as TokenFreezeTransaction).tokenId;
				const accountId = (t as TokenFreezeTransaction).accountId;

				return `Freezing account ${accountId} for token ${tokenId}`;
			} else if (t instanceof TokenUnfreezeTransaction) {
				const tokenId = (t as TokenUnfreezeTransaction).tokenId;
				const accountId = (t as TokenUnfreezeTransaction).accountId;

				return `Unfreezing account ${accountId} for token ${tokenId}`;
			} else if (t instanceof TokenAssociateTransaction) {
				const tokenIds = (t as TokenAssociateTransaction).tokenIds;
				const accountId = (t as TokenAssociateTransaction).accountId;
				let listOfTokens = '';

				tokenIds?.forEach(
					(tokenId) =>
						(listOfTokens = listOfTokens.concat(
							tokenId.toString() + ' ',
						)),
				);

				return `Associating tokens ${listOfTokens}to account ${accountId}`;
			} else if (t instanceof TokenGrantKycTransaction) {
				const tokenId = (t as TokenGrantKycTransaction).tokenId;
				const accountId = (t as TokenGrantKycTransaction).accountId;

				return `Granting KYC to account ${accountId} for token ${tokenId}`;
			} else if (t instanceof TokenRevokeKycTransaction) {
				const tokenId = (t as TokenRevokeKycTransaction).tokenId;
				const accountId = (t as TokenRevokeKycTransaction).accountId;

				return `Revoking KYC from account ${accountId} for token ${tokenId}`;
			} else if (t instanceof TokenFeeScheduleUpdateTransaction) {
				const tokenId = (t as TokenFeeScheduleUpdateTransaction)
					.tokenId;
				const customFees = (t as TokenFeeScheduleUpdateTransaction)
					.customFees;

				let listOfFees = '';

				customFees?.forEach((customFee) => {
					listOfFees = listOfFees.concat(
						'Collectors exempt ' +
							customFee.allCollectorsAreExempt +
							',' +
							'Collectors account Id ' +
							customFee.feeCollectorAccountId +
							',',
					);

					if (customFee instanceof CustomFractionalFee) {
						const fractional = customFee as CustomFractionalFee;

						listOfFees = listOfFees.concat(
							'Numerator ' +
								fractional.numerator +
								',' +
								'Denominator ' +
								fractional.denominator +
								',' +
								'Min ' +
								fractional.min +
								',' +
								'Max ' +
								fractional.max +
								',' +
								'Assessment method ' +
								fractional.assessmentMethod +
								' --  ',
						);
					} else {
						const fixed = customFee as CustomFixedFee;

						listOfFees = listOfFees.concat(
							'Denominating token ' +
								fixed.denominatingTokenId +
								',' +
								'Amount ' +
								fixed.amount +
								' --  ',
						);
					}
				});

				return `Updating custom fees for token ${tokenId} fees : ${listOfFees}`;
			} else if (t instanceof TokenUpdateTransaction) {
				const tokenId = (t as TokenUpdateTransaction).tokenId;
				const tokenName = (t as TokenUpdateTransaction).tokenName;
				const tokenSymbol = (t as TokenUpdateTransaction).tokenSymbol;
				const autoRenewPeriod = (t as TokenUpdateTransaction)
					.autoRenewPeriod;
				const expirationTime = (t as TokenUpdateTransaction)
					.expirationTime;
				const kycKey = (t as TokenUpdateTransaction).kycKey;
				const freezeKey = (t as TokenUpdateTransaction).freezeKey;
				const feeScheduleKey = (t as TokenUpdateTransaction)
					.feeScheduleKey;
				const pauseKey = (t as TokenUpdateTransaction).pauseKey;
				const wipeKey = (t as TokenUpdateTransaction).wipeKey;

				return `Updating token ${tokenId} name : ${tokenName}, symbol : ${tokenSymbol}, autoRenewPeriod : ${autoRenewPeriod}, expirationTime : ${expirationTime},
				kycKey : ${kycKey}, freezeKey : ${freezeKey}, feeScheduleKey : ${feeScheduleKey}, pauseKey : ${pauseKey}, wipeKey : ${wipeKey}`;
			}

			return 'No description found....';
		} catch (e) {
			return 'Transaction description failed';
		}
	}

	static decodeFunctionCall(
		parameters: Uint8Array,
	): ethers.utils.TransactionDescription {
		const inputData = '0x' + Hex.fromUint8Array(parameters);

		try {
			const iface_tokenManager = new ethers.utils.Interface(
				HederaTokenManager__factory.abi,
			);
			return iface_tokenManager.parseTransaction({ data: inputData });
		} catch (e) {
			// nothing
		}
		try {
			const iface_ProxyAdmin = new ethers.utils.Interface(
				ProxyAdmin__factory.abi,
			);
			return iface_ProxyAdmin.parseTransaction({ data: inputData });
		} catch (e) {
			// nothing
		}
		try {
			const iface_StableCoinProxyAdmin = new ethers.utils.Interface(
				StableCoinProxyAdmin__factory.abi,
			);
			return iface_StableCoinProxyAdmin.parseTransaction({
				data: inputData,
			});
		} catch (e) {
			// nothing
		}
		const iface_Proxy = new ethers.utils.Interface(Proxy__factory.abi);
		return iface_Proxy.parseTransaction({ data: inputData });
	}
}

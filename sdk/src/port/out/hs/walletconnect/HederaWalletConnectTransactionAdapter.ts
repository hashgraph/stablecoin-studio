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
import {
	AccountId,
	LedgerId,
	Signer,
	TokenAssociateTransaction,
	TokenBurnTransaction,
	TokenCreateTransaction,
	TokenDeleteTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenFreezeTransaction,
	TokenGrantKycTransaction,
	TokenMintTransaction,
	TokenPauseTransaction,
	TokenRevokeKycTransaction,
	TokenUnfreezeTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	Transaction,
	TransferTransaction,
} from '@hashgraph/sdk';
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';
import {
	DAppConnector,
	HederaChainId,
	SignAndExecuteTransactionParams,
	SignTransactionParams,
	transactionBodyToBase64String,
	transactionToBase64String,
	transactionToTransactionBody,
	base64StringToSignatureMap,
} from '@hashgraph/hedera-wallet-connect';
import { SignClientTypes } from '@walletconnect/types';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter';
import { TransactionType } from '../../TransactionResponseEnums';
import { InitializationData } from '../../TransactionAdapter';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent';
import LogService from '../../../../app/service/LogService';
import EventService from '../../../../app/service/event/EventService';
import NetworkService from '../../../../app/service/NetworkService';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator';
import Injectable from '../../../../core/Injectable';
import { QueryBus } from '../../../../core/query/QueryBus';
import Account from '../../../../domain/context/account/Account';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { Environment } from '../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import HWCSettings from '../../../../domain/context/hwalletconnectsettings/HWCSettings.js';
import { HashpackTransactionResponseAdapter } from '../hashpack/HashpackTransactionResponseAdapter';
import { SigningError } from '../error/SigningError';
import Hex from '../../../../core/Hex.js';

@singleton()
/**
 * Represents a transaction adapter for Hedera Wallet Connect.
 */
export class HederaWalletConnectTransactionAdapter extends HederaTransactionAdapter {
	public account: Account;
	public signer: Signer;
	protected network: Environment;
	protected dAppConnector: DAppConnector | undefined;
	protected projectId: string;
	protected dappMetadata: SignClientTypes.Metadata;
	private chainId: HederaChainId;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
		this.projectId = '';
		this.dappMetadata = {
			name: '',
			description: '',
			url: '',
			icons: [],
		};
	}

	/**
	 * Initializes the Hedera Wallet Connect Transaction Adapter.
	 *
	 * @param network - Optional parameter specifying the network name.
	 * @returns A promise that resolves to the current network name.
	 */
	public async init(network?: NetworkName): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;

		// TODO:  SWITCH TO CHAINIDs
		switch (currentNetwork) {
			case 'testnet':
				this.chainId = HederaChainId.Testnet;
				break;
			case 'previewnet':
				this.chainId = HederaChainId.Previewnet;
				break;
			case 'mainnet':
				this.chainId = HederaChainId.Mainnet;
				break;
			default:
				throw new Error(
					`❌ Invalid network name: ${currentNetwork}. Must be 'testnet', 'previewnet', or 'mainnet'`,
				);
				break;
		}

		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.HWALLETCONNECT,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logInfo('✅ Hedera Wallet Connect Handler Initialized');
		return currentNetwork;
	}

	/**
	 * Registers the Hedera WalletConnect transaction adapter.
	 * This method registers the transaction handler and connects to WalletConnect.
	 *
	 * @returns A promise that resolves to an object containing the account information.
	 */
	public async register(
		hWCSettings: HWCSettings,
	): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Hedera WalletConnect registered as handler');

		if (!hWCSettings)
			throw new Error('hedera wallet conenct settings not set');

		this.projectId = hWCSettings.projectId ?? '';
		this.dappMetadata = {
			name: hWCSettings.dappName ?? '',
			description: hWCSettings.dappDescription ?? '',
			url: hWCSettings.dappURL ?? '',
			icons: [],
		};

		await this.connectWalletConnect();

		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	/**
	 * Connects to the Hedera WalletConnect.
	 *
	 * @param network - Optional. The network to connect to. If not provided, the default network from the network service will be used.
	 * @returns A promise that resolves to a string representing the current network.
	 * @throws If there is an error initializing the Hedera WalletConnect or retrieving account information.
	 */
	public async connectWalletConnect(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;

		try {
			const hwcNetwork = this.getLedgerId(currentNetwork);
			console.log('hwcNetwork', hwcNetwork);
			// Create dApp Connector instance
			// metadata,
			// 	LedgerId.TESTNET,
			// 	projectId,
			// 	Object.values(HederaJsonRpcMethod),
			// 	[HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
			// 	[HederaChainId.TESTNET],
			this.dAppConnector = new DAppConnector(
				this.dappMetadata,
				LedgerId.TESTNET,
				this.projectId,
				// Object.values(HederaJsonRpcMethod), TODO: UNNECESARY
				// [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
				// [HederaChainId.Testnet],
			);
			await this.dAppConnector.init({ logger: 'debug' });
			LogService.logTrace(
				`✅ HWC Initialized with network: ${currentNetwork} and projectId: ${this.projectId}`,
			);
		} catch (error: any) {
			LogService.logTrace(
				'❌ Error initializing HWC with network: ${currentNetwork} and projectId: ${projectId}',
				error,
			);
			return currentNetwork;
		}

		LogService.logTrace('🔗 Pairing with Hedera WalletConnect...');
		// Scan QR code or use WalletConnect URI to connect
		await this.dAppConnector.connectQR();
		// await this.dAppConnector.openModal(); // TODO check
		// Get signers from WalletConnect
		const walletConnectSigners = this.dAppConnector.signers;
		if (!walletConnectSigners) {
			throw new Error(
				`❌ No signers retrieved from wallet connect. Signers: ${walletConnectSigners}`,
			);
		}
		// Get account ID from signers
		const accountId = walletConnectSigners[0].getAccountId().toString();
		if (!accountId) {
			throw new Error(
				`❌ No account ID retrieved from signers. Account ID: ${accountId}`,
			);
		}
		// Get account info from Mirror Node
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			accountId,
		);
		if (!accountMirror) {
			throw new Error(
				`❌ No account info retrieved from Mirror Node. Account ID: ${accountId}`,
			);
		}

		// Create account object and set network
		this.signer = this.dAppConnector.signers[0];
		this.account = new Account({
			id: accountId,
			publicKey: accountMirror.publicKey,
			evmAddress: accountMirror.accountEvmAddress,
		});
		this.network = this.networkService.environment;
		LogService.logInfo(
			`✅ Hedera WalletConnect paired with account: ${accountId}`,
		);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HWALLETCONNECT,
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: {
				name: this.networkService.environment,
				recognized: true,
				factoryId: this.networkService.configuration
					? this.networkService.configuration.factoryAddress
					: '',
			},
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);

		return currentNetwork;
	}

	/**
	 * Stops the Hedera WalletConnect connection.
	 * @returns A promise that resolves to a boolean indicating whether the stop operation was successful.
	 */
	public async stop(): Promise<boolean> {
		try {
			await this.dAppConnector?.disconnectAll();
			this.dAppConnector = undefined;
			LogService.logInfo(
				`🛑 🏁 Hedera WalletConnect stopped successfully`,
			);
			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.HWALLETCONNECT,
			});
			return Promise.resolve(true);
		} catch (error: any) {
			if (
				(error.message as string).includes('No active session') ||
				(error.message as string).includes('No matching key')
			) {
				LogService.logInfo(
					`🔍 No active session found for Hedera WalletConnect`,
				);
			} else {
				LogService.logError(
					`❌ Error stopping Hedera WalletConnect: ${error.message}`,
				);
			}
			return Promise.resolve(false);
		}
	}

	/**
	 * Restarts the transaction adapter with the specified network.
	 * @param network The network name to initialize the adapter with.
	 * @returns A promise that resolves when the adapter has been restarted.
	 */
	public async restart(network: NetworkName): Promise<void> {
		await this.stop();
		await this.init(network);
	}

	// async function hedera_signAndExecuteTransaction(_: Event) {
	// 	const transaction = new TransferTransaction()
	// 		.setTransactionId(TransactionId.generate(getState('sign-send-from')))
	// 		.addHbarTransfer(getState('sign-send-from'), new Hbar(-getState('sign-send-amount')))
	// 		.addHbarTransfer(getState('sign-send-to'), new Hbar(+getState('sign-send-amount')))
	//
	// 	const params: SignAndExecuteTransactionParams = {
	// 		transactionList: transactionToBase64String(transaction),
	// 		signerAccountId: 'hedera:testnet:' + getState('sign-send-from'),
	// 	}
	//
	// 	console.log(params)
	//
	// 	return await dAppConnector!.signAndExecuteTransaction(params)
	// }

	public async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string | undefined,
		abi?: any[] | undefined,
	): Promise<TransactionResponse> {
		if (!this.dAppConnector) {
			throw new Error('Hedera WalletConnect not initialized');
		}
		if (!this.account) {
			throw new Error('Account not set');
		}
		if (
			!this.signer ||
			!this.dAppConnector.signers ||
			this.dAppConnector.signers.length === 0
		) {
			throw new Error('No signers found');
		}

		// async function hedera_signAndExecuteTransaction(_: Event) {
		// 	const transaction = new TransferTransaction()
		// 		.setTransactionId(TransactionId.generate(getState('sign-send-from')))
		// 		.addHbarTransfer(getState('sign-send-from'), new Hbar(-getState('sign-send-amount')))
		// 		.addHbarTransfer(getState('sign-send-to'), new Hbar(+getState('sign-send-amount')))
		//
		// 	const params: SignAndExecuteTransactionParams = {
		// 		transactionList: transactionToBase64String(transaction),
		// 		signerAccountId: 'hedera:testnet:' + getState('sign-send-from'),
		// 	}
		//
		// 	console.log(params)
		//
		// 	return await dAppConnector!.signAndExecuteTransaction(params)
		// }

		if (!t.isFrozen()) {
			console.log('🔒 Freezing transaction...');
			LogService.logTrace(`🔒 Freezing transaction...`);
			t._freezeWithAccountId(
				AccountId.fromString(this.account.id.toString()),
			);
		}
		// TODO: use chainId
		const params: SignAndExecuteTransactionParams = {
			transactionList: transactionToBase64String(t),
			signerAccountId: 'hedera:testnet:' + this.account.id.toString(),
		};

		// const nodeAccountID = AccountId.fromString(this.account.id.toString())
		// const signParams: SignTransactionParams = {
		// 	transactionBody: transactionToTransactionBody(t, nodeAccountID),
		// 	signerAccountId: this.account.id.toString(),
		// };

		try {
			console.log('🔏 Signing and sending transaction...');
			LogService.logInfo(`🔏 Signing and sending transaction...`);
			// const signedTx = await this.dAppConnector.signTransaction(
			// 	signParams,
			// );
			let transactionResponse: any;
			if (
				t instanceof TokenCreateTransaction ||
				t instanceof TokenWipeTransaction ||
				t instanceof TokenBurnTransaction ||
				t instanceof TokenMintTransaction ||
				t instanceof TokenPauseTransaction ||
				t instanceof TokenUnpauseTransaction ||
				t instanceof TokenDeleteTransaction ||
				t instanceof TokenFreezeTransaction ||
				t instanceof TokenUnfreezeTransaction ||
				t instanceof TokenGrantKycTransaction ||
				t instanceof TokenRevokeKycTransaction ||
				t instanceof TransferTransaction ||
				t instanceof TokenFeeScheduleUpdateTransaction ||
				t instanceof TokenAssociateTransaction
			) {
				transactionResponse =
					await this.dAppConnector.signAndExecuteTransaction(params);
				LogService.logInfo(
					`✅ Transaction signed and sent 0. Response: ${transactionResponse}`,
				);
				// transactionResponse = await this.dAppConnector.executeTransaction({
				// 	signed: transactionToBase64String(signedTx),
				// });
			} else {
				// TODO : ENTRA AQUI
				transactionResponse =
					await this.dAppConnector!.signAndExecuteTransaction(params);

				// LogService.logInfo(
				// 	`✅ Transaction signed and sent 1. Response: ${transactionResponse}`,
				// );
			}
			LogService.logInfo(
				`✅ Transaction signed and sent. Response: ${transactionResponse}`,
			);
			console.log('transactionResponse', transactionResponse);
			return HashpackTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				this.signer,
				transactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error: any) {
			const errorMessage = `❌ Error signing and sending transaction: ${JSON.stringify(
				error,
				null,
				2,
			)}`;
			LogService.logError(errorMessage);
			throw new Error(errorMessage);
		}
	}

	getAccount(): Account {
		return this.account;
	}

	/**
	 * Signs a transaction using Hedera WalletConnect.
	 * @param message - The transaction to sign.
	 * @returns A promise that resolves to the hexadecimal signature of the signed transaction.
	 * @throws Error if Hedera WalletConnect is not initialized, account is not set, no signers found,
	 * the message is not an instance of Transaction, or consensus nodes are not set for the environment.
	 * @throws SigningError if an error occurs during the signing process.
	 */
	async sign(message: string | Transaction): Promise<string> {
		LogService.logInfo('🔏 Signing transaction from HWC...');
		if (!this.dAppConnector) {
			throw new Error('❌ Hedera WalletConnect not initialized');
		}
		if (!this.account) {
			throw new Error('❌ Account not set');
		}
		if (
			!this.signer ||
			!this.dAppConnector.signers ||
			this.dAppConnector.signers.length === 0
		) {
			throw new Error('❌ No signers found');
		}
		if (!(message instanceof Transaction))
			throw new SigningError(
				'❌ Hedera WalletConnect must sign a transaction not a string',
			);
		if (
			!this.networkService.consensusNodes ||
			this.networkService.consensusNodes.length == 0
		) {
			throw new Error(
				'❌ In order to create sign multisignature transactions you must set consensus nodes for the environment',
			);
		}

		try {
			if (!message.isFrozen()) {
				LogService.logTrace(
					`🔒 Tx not frozen, freezing transaction...`,
				);
				message._freezeWithAccountId(
					AccountId.fromString(this.account.id.toString()),
				);
			}

			const params: SignTransactionParams = {
				transactionBody: transactionBodyToBase64String(
					transactionToTransactionBody(
						message,
						AccountId.fromString(
							this.networkService.consensusNodes[0].nodeId,
						),
					),
				),
				signerAccountId: `${
					this.chainId
				}:${this.account.id.toString()}`,
			};

			LogService.logTrace(
				`🖋️ [HWC] Signing tx with params: ${JSON.stringify(
					params,
					null,
					2,
				)}`,
			);
			const signResult = await this.dAppConnector.signTransaction(params);
			LogService.logInfo(`✅ Transaction signed successfully!`);
			LogService.logTrace(
				`Signature result: ${JSON.stringify(signResult, null, 2)}`,
			);
			const decodedSignatureMap = base64StringToSignatureMap(
				(signResult as any).signatureMap,
			);
			LogService.logTrace(
				`Decoded signature map: ${JSON.stringify(
					decodedSignatureMap,
					null,
					2,
				)}`,
			);

			const signaturesLength = decodedSignatureMap.sigPair.length;
			if (signaturesLength === 0) {
				throw new Error(`❌ No signatures found in response`);
			}
			const firstSignature =
				decodedSignatureMap.sigPair[0].ed25519 ||
				decodedSignatureMap.sigPair[0].ECDSASecp256k1 ||
				decodedSignatureMap.sigPair[0].ECDSA_384;
			if (!firstSignature) {
				throw new Error(
					`❌ No signatures found in response: ${JSON.stringify(
						firstSignature,
						null,
						2,
					)}`,
				);
			}

			const hexSignature = Hex.fromUint8Array(firstSignature);
			LogService.logTrace(
				`Final hexadecimal signature: ${JSON.stringify(
					hexSignature,
					null,
					2,
				)}`,
			);
			return hexSignature;
		} catch (error) {
			throw new SigningError(JSON.stringify(error, null, 2));
		}
	}

	getWCMetadata(): SignClientTypes.Metadata {
		return this.dappMetadata;
	}

	getProjectId(): string {
		return this.projectId;
	}

	private getLedgerId(network: string): LedgerId {
		switch (network) {
			case 'testnet':
				return LedgerId.TESTNET;
			case 'previewnet':
				return LedgerId.PREVIEWNET;
			default:
				return LedgerId.MAINNET;
		}
	}
}

import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { TokenId } from '@hashgraph/sdk';
import { Account, AccountId, PublicKey } from '../../in/sdk/sdk.js';

export interface ICallContractRequest {
	contractId: string;
	parameters: any[];
	gas: number;
	abi: object[];
	value?: number;
}

export interface ICallContractWithAccountRequest extends ICallContractRequest {
	account: Account;
}

export interface ICreateTokenResponse {
	name: string;
	symbol: string;
	decimals: number;
	initialSupply: Long;
	maxSupply: Long;
	memo: string;
	freezeDefault: boolean;
	treasuryAccountId: AccountId;
	adminKey?: PublicKey;
	freezeKey?: PublicKey;
	kycKey?: PublicKey;
	wipeKey?: PublicKey;
	pauseKey?: PublicKey;
	supplyKey?: PublicKey;
	tokenId: TokenId;
	autoRenewAccountId?: AccountId;
}

export interface IHTSTokenRequest {
	account: Account;
	tokenId: string;
}

export interface IHTSTokenRequestTargetId extends IHTSTokenRequest {
	targetId: string;
}

export interface IHTSTokenRequestAmount extends IHTSTokenRequest {
	amount: Long;
}

export interface IWipeTokenRequest extends IHTSTokenRequestAmount {
	wipeAccountId: string;
}

export interface ITransferTokenRequest extends IHTSTokenRequestAmount {
	outAccountId: string;
	inAccountId: string;
	isApproval: boolean;
}

export type InitializationData = HashConnectTypes.InitilizationData;
export type SavedPairingData = HashConnectTypes.SavedPairingData;
export type AcknowledgeMessage = MessageTypes.Acknowledge;
export type AdditionalAccountRequestMessage =
	MessageTypes.AdditionalAccountRequest;
export type AdditionalAccountResponseMessage =
	MessageTypes.AdditionalAccountResponse;
export type ApprovePairingMessage = MessageTypes.ApprovePairing;
export type AuthenticationRequestMessage = MessageTypes.AuthenticationRequest;
export type AuthenticationResponseMessage = MessageTypes.AuthenticationResponse;

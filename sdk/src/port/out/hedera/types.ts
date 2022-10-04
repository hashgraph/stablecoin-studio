import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { TokenId } from '@hashgraph/sdk';
import { Account, AccountId, EOAccount, PublicKey } from '../../in/sdk/sdk.js';

export interface ICallContractRequest {
	contractId: string;
	parameters: string[];
	gas: number;
	abi: object[];
}

export interface ICallContractWithAccountRequest extends ICallContractRequest {
	account: Account
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
}

export interface IHTSTokenRequest {
	account: Account;
	tokenId: string;
	amount: number;
}

export interface IWipeTokenRequest extends IHTSTokenRequest {
	wipeAccountId: string;
}

export interface ITransferTokenRequest extends IHTSTokenRequest{
	outAccountId: string;
	inAccountId: string;
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

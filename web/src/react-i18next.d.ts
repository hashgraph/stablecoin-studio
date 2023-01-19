/* eslint-disable no-unused-vars */
import 'react-i18next';

import type BURN_EN from './translations/en/burn.json';
import type CASH_IN_EN from './translations/en/cashIn.json';
import type ERROR_PAGE_EN from './translations/en/errorPage.json';
import type GET_BALANCE_EN from './translations/en/getBalance.json';
import type GLOBAL_EN from './translations/en/global.json';
import type OPERATIONS_EN from './translations/en/operations.json';
import type RESCUE_TOKENS_EN from './translations/en/rescueTokens.json';
import type ROLES_EN from './translations/en/roles.json';
import type STABLE_COIN_CREATION_EN from './translations/en/stableCoinCreation.json';
import type STABLE_COIN_DETAILS_EN from './translations/en/stableCoinDetails.json';
import type WIPE_EN from './translations/en/wipe.json';
import type EXTERNAL_TOKEN_INFO_EN from './translations/en/externalTokenInfo.json';
import type FREEZE_EN from './translations/en/freeze.json';
import type UNFREEZE_EN from './translations/en/unfreeze.json';
import type PROOF_OF_RESERVE_EN from './translations/en/proofOfReserve.json';

declare module 'react-i18next' {
	interface Resources {
		burn: typeof BURN_EN;
		cashIn: typeof CASH_IN_EN;
		errorPage: typeof ERROR_PAGE_EN;
		getBalance: typeof GET_BALANCE_EN;
		global: typeof GLOBAL_EN;
		operations: typeof OPERATIONS_EN;
		rescueTokens: typeof RESCUE_TOKENS_EN;
		roles: typeof ROLES_EN;
		stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
		stableCoinDetails: typeof STABLE_COIN_DETAILS_EN;
		wipe: typeof WIPE_EN;
		externalTokenInfo: typeof EXTERNAL_TOKEN_INFO_EN;
		freeze: typeof FREEZE_EN;
		unfreeze: typeof UNFREEZE_EN;
		proofOfReserve: typeof PROOF_OF_RESERVE_EN;
	}
}

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
	// and extend them!
	interface CustomTypeOptions {
		defaultNS: 'global';
		resources: {
			burn: typeof BURN_EN;
			cashIn: typeof CASH_IN_EN;
			errorPage: typeof ERROR_PAGE_EN;
			getBalance: typeof GET_BALANCE_EN;
			global: typeof GLOBAL_EN;
			operations: typeof OPERATIONS_EN;
			rescueTokens: typeof RESCUE_TOKENS_EN;
			roles: typeof ROLES_EN;
			stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
			stableCoinDetails: typeof STABLE_COIN_DETAILS_EN;
			wipe: typeof WIPE_EN;
			externalTokenInfo: typeof EXTERNAL_TOKEN_INFO_EN;
			freeze: typeof FREEZE_EN;
			unfreeze: typeof UNFREEZE_EN;
			proofOfReserve: typeof PROOF_OF_RESERVE_EN;
		};
	}
}

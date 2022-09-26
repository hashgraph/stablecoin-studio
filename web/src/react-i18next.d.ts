/* eslint-disable no-unused-vars */
import 'react-i18next';

import type CASH_IN_EN from './translations/en/cashIn.json';
import type ERROR_PAGE_EN from './translations/en/errorPage.json';
import type GLOBAL_EN from './translations/en/global.json';
import type OPERATIONS_EN from './translations/en/operations.json';
import type ROLES_EN from './translations/en/roles.json';
import type STABLE_COIN_CREATION_EN from './translations/en/stableCoinCreation.json';
import type STABLE_COIN_DETAILS_EN from './translations/en/stableCoinDetails.json';

declare module 'react-i18next' {
	interface Resources {
		cashIn: typeof CASH_IN_EN;
		errorPage: typeof ERROR_PAGE_EN;
		global: typeof GLOBAL_EN;
		operations: typeof OPERATIONS_EN;
		roles: typeof ROLES_EN;
		stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
		stableCoinDetails: typeof STABLE_COIN_DETAILS_EN;
	}
}

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
	// and extend them!
	interface CustomTypeOptions {
		defaultNS: 'global';
		resources: {
			cashIn: typeof CASH_IN_EN;
			errorPage: typeof ERROR_PAGE_EN;
			global: typeof GLOBAL_EN;
			operations: typeof OPERATIONS_EN;
			roles: typeof ROLES_EN;
			stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
			stableCoinDetails: typeof STABLE_COIN_DETAILS_EN;
		};
	}
}

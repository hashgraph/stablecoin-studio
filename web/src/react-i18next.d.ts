/* eslint-disable no-unused-vars */
import 'react-i18next';

import CASH_IN_EN from './translations/en/cashIn.json';
import ERROR_PAGE_EN from './translations/en/errorPage.json';
import GLOBAL_EN from './translations/en/global.json';
import OPERATIONS_EN from './translations/en/operations.json';
import ROLES_EN from './translations/en/roles.json';
import STABLE_COIN_CREATION_EN from './translations/en/stableCoinCreation.json';

declare module 'react-i18next' {
	interface Resources {
		cashIn: typeof CASH_IN_EN;
		errorPage: typeof ERROR_PAGE_EN;
		global: typeof GLOBAL_EN;
		operations: typeof OPERATIONS_EN;
		roles: typeof ROLES_EN;
		stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
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
		};
	}
}

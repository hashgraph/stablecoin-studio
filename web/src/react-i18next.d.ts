/* eslint-disable no-unused-vars */
import 'react-i18next';

import GLOBAL_EN from './translations/en/global.json';
import OPERATIONS_EN from './translations/en/operations.json';
import CASH_IN_EN from './translations/en/cashIn.json';
import ERROR_PAGE_EN from './translations/en/errorPage.json';
import STABLE_COIN_CREATION_EN from './translations/en/stableCoinCreation.json';

declare module 'react-i18next' {
	interface Resources {
		global: typeof GLOBAL_EN;
		cashIn: typeof CASH_IN_EN;
		errorPage: typeof ERROR_PAGE_EN;
		operations: typeof OPERATIONS_EN;
		stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
	}
}

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
	// and extend them!
	interface CustomTypeOptions {
		defaultNS: 'global';
		resources: {
			global: typeof GLOBAL_EN;
			cashIn: typeof CASH_IN_EN;
			operations: typeof OPERATIONS_EN;
			errorPage: typeof ERROR_PAGE_EN;
			stableCoinCreation: typeof STABLE_COIN_CREATION_EN;
		};
	}
}

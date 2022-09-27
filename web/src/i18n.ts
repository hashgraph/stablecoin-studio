import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import languagedetector from 'i18next-browser-languagedetector';

import CASH_IN_EN from './translations/en/cashIn.json';
import ERROR_PAGE_EN from './translations/en/errorPage.json';
import GET_BALANCE_EN from './translations/en/getBalance.json';
import GLOBAL_EN from './translations/en/global.json';
import GLOBAL_ES from './translations/es/global.json';
import OPERATIONS_EN from './translations/en/operations.json';
import ROLES_EN from './translations/en/roles.json';
import STABLE_COIN_CREATION_EN from './translations/en/stableCoinCreation.json';
import WIPE_EN from './translations/en/wipe.json';

const options = {
	order: ['localStorage', 'navigator'],
};

i18n
	.use(initReactI18next)
	.use(languagedetector)
	.init({
		detection: options,
		fallbackLng: 'en',
		interpolation: { escapeValue: false },
		resources: {
			en: {
				cashIn: CASH_IN_EN,
				errorPage: ERROR_PAGE_EN,
				getBalance: GET_BALANCE_EN,
				global: GLOBAL_EN,
				operations: OPERATIONS_EN,
				roles: ROLES_EN,
				stableCoinCreation: STABLE_COIN_CREATION_EN,
				wipe: WIPE_EN,
			},
			es: {
				global: GLOBAL_ES,
			},
		},
	});

export default i18n;

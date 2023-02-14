import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import languagedetector from 'i18next-browser-languagedetector';

import BURN_EN from './translations/en/burn.json';
import CASH_IN_EN from './translations/en/cashIn.json';
import ERROR_PAGE_EN from './translations/en/errorPage.json';
import GET_BALANCE_EN from './translations/en/getBalance.json';
import GLOBAL_EN from './translations/en/global.json';
import GLOBAL_ES from './translations/es/global.json';
import OPERATIONS_EN from './translations/en/operations.json';
import RESCUE_TOKENS_EN from './translations/en/rescueTokens.json';
import ROLES_EN from './translations/en/roles.json';
import STABLE_COIN_CREATION_EN from './translations/en/stableCoinCreation.json';
import STABLE_COIN_DETAILS_EN from './translations/en/stableCoinDetails.json';
import WIPE_EN from './translations/en/wipe.json';
import EXTERNAL_TOKEN_INFO_EN from './translations/en/externalTokenInfo.json';
import FREEZE_EN from './translations/en/freeze.json';
import UNFREEZE_EN from './translations/en/unfreeze.json';
import PROOF_OF_RESERVE_EN from './translations/en/proofOfReserve.json';
import GRANT_KYC_EN from './translations/en/grantKYC.json';
import REVOKE_KYC_EN from './translations/en/revokeKYC.json';
import CHECK_KYC_EN from './translations/en/checkKyc.json';
import FEES_MANAGEMENT_EN from './translations/en/feesManagement.json';

const options = {
	order: ['localStorage', 'navigator'],
};

i18n
	.use(initReactI18next)
	.use(languagedetector)
	.init({
		detection: options,
		fallbackLng: 'en',
		lng: 'en',
		interpolation: { escapeValue: false },
		resources: {
			en: {
				burn: BURN_EN,
				cashIn: CASH_IN_EN,
				errorPage: ERROR_PAGE_EN,
				getBalance: GET_BALANCE_EN,
				global: GLOBAL_EN,
				operations: OPERATIONS_EN,
				rescueTokens: RESCUE_TOKENS_EN,
				roles: ROLES_EN,
				stableCoinCreation: STABLE_COIN_CREATION_EN,
				stableCoinDetails: STABLE_COIN_DETAILS_EN,
				wipe: WIPE_EN,
				externalTokenInfo: EXTERNAL_TOKEN_INFO_EN,
				freeze: FREEZE_EN,
				unfreeze: UNFREEZE_EN,
				proofOfReserve: PROOF_OF_RESERVE_EN,
				grantKYC: GRANT_KYC_EN,
				revokeKYC: REVOKE_KYC_EN,
				checkKyc: CHECK_KYC_EN,
				feesManagement: FEES_MANAGEMENT_EN
			},
			es: {
				global: GLOBAL_ES,
			},
		},
	});

export default i18n;

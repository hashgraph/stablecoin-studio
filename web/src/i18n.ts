import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import languagedetector from 'i18next-browser-languagedetector';

import GLOBAL_EN from './translations/en/global.json';
import GLOBAL_ES from './translations/es/global.json';
import ERROR_PAGE_EN from './translations/en/errorPage.json';

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
				global: GLOBAL_EN,
				errorPage: ERROR_PAGE_EN,
			},
			es: {
				global: GLOBAL_ES,
			},
		},
	});

export default i18n;

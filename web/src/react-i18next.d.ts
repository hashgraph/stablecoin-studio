/* eslint-disable no-unused-vars */
import 'react-i18next';

import GLOBAL_EN from './translations/en/global.json';

declare module 'react-i18next' {
	interface Resources {
		global: typeof GLOBAL_EN;
	}
}

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
	// and extend them!
	interface CustomTypeOptions {
		defaultNS: 'global';
		resources: {
			global: typeof GLOBAL_EN;
		};
	}
}

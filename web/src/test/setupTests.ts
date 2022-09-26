/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import '@testing-library/jest-dom';

beforeEach(() => {
	jest.resetModules();
});

jest.mock('react-i18next', (): any => ({
	useTranslation: (): any => ({
		t: (key: string): string => key,
		i18n: {
			language: 'en',
			exists: jest.fn(),
		},
	}),
	Trans: ({ children }: { children: any }) => children,
	initReactI18next: { type: '3rdParty', init: jest.fn() },
	...jest.requireActual('react-i18next'),
}));

jest.mock('../services/SDKService');
window.matchMedia =
	window.matchMedia ||
	function () {
		return {
			matches: false,
			addListener: function () {},
			removeListener: function () {},
		};
	};

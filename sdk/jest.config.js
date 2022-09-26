module.exports = {
	testEnvironment: 'node',
	coverageThreshold: {
		global: {
			lines: 80,
		},
	},
	preset: 'ts-jest',
	globals: {
		'ts-jest': {
			useESM: true,
		},
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.(m)?js$': '$1',
		'hashconnect/dist/esm(.*)': 'hashconnect/dist/cjs$1',
		'hashconnect': 'hashconnect/dist/cjs/hashconnect.js',
	},
	// testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
	testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
	testPathIgnorePatterns: ['/build/'],
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		'src/**/*.ts',
		'src/**/*.mts',
		'!src/**/*.d.ts',
		'!src/**/*.d.mts',
	],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
		'^.+\\.[t|j]sx?$': 'babel-jest',
	},
	transformIgnorePatterns: [
		'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)',
	],
};

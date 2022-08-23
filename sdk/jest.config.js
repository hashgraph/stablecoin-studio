module.exports = {
	testEnvironment: 'node',
	preset: 'ts-jest',
	globals: {
		'ts-jest': {
			useESM: true,
		},
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.(m)?js$': '$1',
	},
	// testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
	testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
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
	},
	transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
};

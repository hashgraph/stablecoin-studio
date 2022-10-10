module.exports = {
	testEnvironment: 'node',
	coverageThreshold: {
		// global: {
		// 	lines: 80,
		// },
	},
	preset: 'ts-jest',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.(m)?js$': '$1',
	},
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

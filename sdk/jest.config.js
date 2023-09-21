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
	testPathIgnorePatterns: ['/build/', '/src_old/'],
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
	transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
	setupFilesAfterEnv: ['./__tests__/jest-setup-file.ts'],
	testTimeout: 150_000,
};

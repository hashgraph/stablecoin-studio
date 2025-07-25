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
		'@hashgraph/hedera-wallet-connect':
			'<rootDir>/__mocks__/hedera-wallet-connect.js',
		'^uuid$': 'uuid',
	},
	testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
	testPathIgnorePatterns: ['/build/', '/src_old/', '/example/js/'], // Added to ignore /example/js/ directory in module mapping
	modulePathIgnorePatterns: ['/example/js/'], // Added to ignore /example/js/ directory in module mapping
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
	testTimeout: 10_000,
};

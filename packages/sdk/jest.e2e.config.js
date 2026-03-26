require('dotenv').config();

module.exports = {
	testEnvironment: 'node',
	preset: 'ts-jest',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.(m)?js$': '$1',
		'@hashgraph/hedera-wallet-connect':
			'<rootDir>/__mocks__/hedera-wallet-connect.js',
		'fireblocks-sdk': '<rootDir>/__mocks__/fireblocks-sdk.js',
		'^uuid$': 'uuid',
	},
	testMatch: ['**/src/__tests__/core/integration/**/*.(test|spec).[jt]s?(x)'],
	testPathIgnorePatterns: ['/build/', '/src_old/', '/example/js/'],
	modulePathIgnorePatterns: ['/example/js/'],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
		'^.+\\.[t|j]sx?$': 'babel-jest',
	},
	transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
	testTimeout: 120_000,
};

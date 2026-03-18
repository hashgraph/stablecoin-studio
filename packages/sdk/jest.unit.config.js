module.exports = {
	testEnvironment: 'node',
	preset: 'ts-jest',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.(m)?js$': '$1',
		'@hashgraph/hedera-wallet-connect':
			'<rootDir>/__mocks__/hedera-wallet-connect.js',
		'^uuid$': 'uuid',
	},
	testMatch: ['**/__tests__/app/**/*.(test|spec).[jt]s?(x)'],
	testPathIgnorePatterns: ['/build/', '/src_old/', '/example/js/'],
	modulePathIgnorePatterns: ['/example/js/'],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
		'^.+\\.[t|j]sx?$': 'babel-jest',
	},
	transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
	testTimeout: 10_000,
};

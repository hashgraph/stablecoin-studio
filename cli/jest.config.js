module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    // global: {
    //   lines: 70,
    // },
  },
  preset: 'ts-jest',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
    '@hashgraph/hedera-wallet-connect': '<rootDir>/__mocks__/hedera-wallet-connect.js',
  },

  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
  testPathIgnorePatterns: ['/build/', '/src_old/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverage: true,
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
  setupFiles: ['<rootDir>/jest.env.config.js'],
};

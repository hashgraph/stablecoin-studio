module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 70,
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
  },
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(m)?ts$',
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)'],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/build/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.mts',
    '!src/**/*.d.ts',
    '!src/**/*.d.mts',
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
};

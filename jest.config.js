module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  modulePaths: ['<rootDir>'],
  globalSetup: '<rootDir>/test/test-container/global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/test/pre-setup.ts'],
  globalTeardown: '<rootDir>/test/test-container/global-teardown.ts',
  maxWorkers: 1,
  testTimeout: 30_000,
};

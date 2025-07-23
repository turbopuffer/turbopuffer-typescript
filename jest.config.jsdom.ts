import config from './jest.config';

export default {
  ...config,
  testEnvironment: 'jsdom',
  globals: {
    fetch: global.fetch,
  },
  moduleNameMapper: {
    '^@turbopuffer/turbopuffer$': '<rootDir>/src/index.ts',
    '^@turbopuffer/turbopuffer/(.*)$': '<rootDir>/src/$1',
    '^#fetch$': '<rootDir>/src/internal/custom/fetch-default.ts',
    '^#gzip$': '<rootDir>/src/internal/custom/gzip-default.ts',
  },
};

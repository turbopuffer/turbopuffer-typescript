import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { sourceMaps: 'inline' }],
  },
  moduleNameMapper: {
    '^@turbopuffer/turbopuffer$': '<rootDir>/src/index.ts',
    '^@turbopuffer/turbopuffer/(.*)$': '<rootDir>/src/$1',
    '^#fetch$': '<rootDir>/src/internal/custom/fetch-node.ts',
    '^#gzip$': '<rootDir>/src/internal/custom/gzip-node.ts',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/ecosystem-tests/',
    '<rootDir>/dist/',
    '<rootDir>/deno/',
    '<rootDir>/deno_tests/',
    '<rootDir>/packages/',
  ],
  testPathIgnorePatterns: ['scripts'],
};

export default config;

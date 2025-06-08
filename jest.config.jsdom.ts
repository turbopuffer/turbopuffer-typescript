import config from './jest.config';

export default {
  ...config,
  testEnvironment: 'jsdom',
  globals: {
    fetch: global.fetch,
  },
};

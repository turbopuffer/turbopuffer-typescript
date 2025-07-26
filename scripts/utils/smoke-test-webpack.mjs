import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import assert from 'node:assert';

if (process.argv.length !== 3) {
  console.error('usage: node smoke-test-webpack.mjs <webpack-version>');
  process.exit(1);
}

const webpackVersion = process.argv[2];
const webpack = (await import(`webpack-${webpackVersion}`)).default;

const root = dirname(fileURLToPath(import.meta.url));
const output = {
  path: join(root, 'tmp'),
  filename: 'webpack.bundle.mjs',
  library: {
    type: 'module',
  },
  chunkFormat: 'module',
};

webpack(
  {
    mode: 'development',
    entry: '../scripts/utils/smoke-test-webpack.import.mjs',
    output,
    target: 'node',
    experiments: { outputModule: true },
    devtool: false,
  },
  async (err, stats) => {
    if (err !== null) {
      console.error('compilation error', err);
      process.exit(1);
    }

    console.log('stats', stats.toString());
    if (stats.hasErrors()) {
      process.exit(1);
    }

    const { makeTpufRequest } = await import(join(output.path, output.filename));
    const res = await makeTpufRequest();
    assert(res.status === '🐡');

    console.log(`webpack ${webpackVersion} smoke test passed`);
  },
);

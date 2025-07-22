const {
  resolvePathRelativeToPackage,
  transformBundlerIgnoreImports,
} = require('../scripts/utils/fix-bundle-ignore-imports.cjs');

describe('bundler ignore path resolution', () => {
  const packageName = '@turbopuffer/turbopuffer';

  test('resolves relative paths from internal/shims.mjs to lib/fetch-undici', () => {
    const result = resolvePathRelativeToPackage(
      '../lib/fetch-undici',
      'dist/internal/shims.mjs',
      packageName,
    );
    expect(result).toBe('@turbopuffer/turbopuffer/lib/fetch-undici');
  });

  test('resolves relative paths from lib/compressor.mjs to lib/gzip-node', () => {
    const result = resolvePathRelativeToPackage('./gzip-node', 'dist/lib/compressor.mjs', packageName);
    expect(result).toBe('@turbopuffer/turbopuffer/lib/gzip-node');
  });

  test('handles deeply nested relative paths', () => {
    const result = resolvePathRelativeToPackage(
      '../../lib/some-module',
      'dist/internal/utils/helper.mjs',
      packageName,
    );
    expect(result).toBe('@turbopuffer/turbopuffer/lib/some-module');
  });

  test('handles same-directory relative paths', () => {
    const result = resolvePathRelativeToPackage('./sibling-module', 'dist/lib/main.mjs', packageName);
    expect(result).toBe('@turbopuffer/turbopuffer/lib/sibling-module');
  });

  test('handles relative paths that go to root', () => {
    const result = resolvePathRelativeToPackage('../index', 'dist/lib/compressor.mjs', packageName);
    expect(result).toBe('@turbopuffer/turbopuffer/index');
  });
});

describe('bundler ignore transformation integration', () => {
  const packageName = '@turbopuffer/turbopuffer';

  test('transforms relative import with @tpuf-bundler-ignore comment', () => {
    const sourceCode = `export async function getDefaultFetch(options: HttpClientOptions): Promise<Fetch> {
  if (isRuntimeFullyNodeCompatible) {
    const { makeFetchUndici } = await import("../lib/fetch-undici"); // @tpuf-bundler-ignore
    return makeFetchUndici(options);
  }
  return fetch;
}`;

    const expectedCode = `export async function getDefaultFetch(options: HttpClientOptions): Promise<Fetch> {
  if (isRuntimeFullyNodeCompatible) {
    const { makeFetchUndici } = await import((() => "@turbopuffer/turbopuffer/lib/fetch-undici")());
    return makeFetchUndici(options);
  }
  return fetch;
}`;

    const result = transformBundlerIgnoreImports(sourceCode, 'dist/internal/shims.mjs', packageName);
    expect(result).toBe(expectedCode);
  });

  test('transforms same-directory relative import', () => {
    const sourceCode = `export const makeGzipCompressor = async () => {
  let gzip;
  if (isRuntimeFullyNodeCompatible) {
    gzip = (await import("./gzip-node")).default; // @tpuf-bundler-ignore
  }
  return gzip;
};`;

    const expectedCode = `export const makeGzipCompressor = async () => {
  let gzip;
  if (isRuntimeFullyNodeCompatible) {
    gzip = (await import((() => "@turbopuffer/turbopuffer/lib/gzip-node")())).default;
  }
  return gzip;
};`;

    const result = transformBundlerIgnoreImports(sourceCode, 'dist/lib/compressor.mjs', packageName);
    expect(result).toBe(expectedCode);
  });

  test('leaves non-relative imports unchanged but still hides from bundler', () => {
    const sourceCode = `const module = await import("some-package"); // @tpuf-bundler-ignore\n`;
    const expectedCode = `const module = await import((() => "some-package")());\n`;

    const result = transformBundlerIgnoreImports(sourceCode, 'dist/any/file.mjs', packageName);
    expect(result).toBe(expectedCode);
  });

  test('leaves imports without @tpuf-bundler-ignore comment unchanged', () => {
    const sourceCode = `const module = await import("../lib/some-module");`;
    const result = transformBundlerIgnoreImports(sourceCode, 'dist/internal/shims.mjs', packageName);
    expect(result).toBe(sourceCode);
  });
});

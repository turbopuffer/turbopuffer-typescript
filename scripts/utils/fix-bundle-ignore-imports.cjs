const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Find code like:
//
//    import("path/to/file"); // @tpuf-bundler-ignore
//
// and replace it with code like:
//
//    import((() => "@turbopuffer/turbopuffer/path/to/file")());
//
// which hides it from Vite, Webpack, and other bundlers while using absolute
// package paths that work regardless of current working directory. Used with
// Node.js-specific modules that can't be bundled for other environments like
// Cloudflare Workers. (Bundlers aren't smart enough to understand the
// isRuntimeFullyNodeCompatible check on their own.)

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
const packageName = packageJson.name;

function resolvePathRelativeToPackage(relativePath, currentFilePath) {
  const distRelativePath = path.relative('dist', currentFilePath);
  const dirOfCurrentFile = path.dirname(distRelativePath);

  const resolvedPath = path.resolve('/', dirOfCurrentFile, relativePath);

  // convert to package-relative path (remove leading slash and normalize)
  const packageRelativePath = resolvedPath.substring(1).replace(/\\/g, '/');

  return `${packageName}/${packageRelativePath}`;
}

function transformBundlerIgnoreImports(code, filePath, packageName) {
  return code.replace(/import\("([^"]+)"\)(.*) \/\/ @tpuf-bundler-ignore\n/gm, (_, importPath, rest) => {
    // transform relative paths (starting with . or ..)
    if (importPath.startsWith('.')) {
      const absolutePackagePath = resolvePathRelativeToPackage(importPath, filePath, packageName);
      return `import((() => "${absolutePackagePath}")())${rest}\n`;
    }
    return `import((() => "${importPath}")())${rest}\n`;
  });
}

glob.sync('dist/**/*.mjs').forEach((file) => {
  const code = fs.readFileSync(file, 'utf8');
  const transformed = transformBundlerIgnoreImports(code, file, packageName);
  if (transformed !== code) fs.writeFileSync(file, transformed);
});

module.exports = { resolvePathRelativeToPackage, transformBundlerIgnoreImports };

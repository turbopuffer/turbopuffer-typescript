const fs = require('fs');
const glob = require('glob');

// Find code like:
//
//     import("path/to/file"); // @tpuf-bundler-ignore
//
// and replace it with code like:
//
//   import((() => "path/to/file")());
//
// which hides it from Vite, Webpack, and other bundlers. Used with
// Node.js-specific modules that can't be bundled for other environments like
// Cloudflare Workers. (Bundlers aren't smart enough to understand the
// isRuntimeFullyNodeCompatible check on their own.)

glob.sync('dist/**/*.mjs').forEach((file) => {
  const code = fs.readFileSync(file, 'utf8');
  const transformed = code.replace(
    /import\("([^"]+)"\)(.*) \/\/ @tpuf-bundler-ignore\n/gm,
    'import((() => "$1")())$2\n',
  );
  if (transformed !== code) {
    fs.writeFileSync(file, transformed);
  }
});

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// `importDynamic` is defined in `src/internal/shims.ts`
const IMPORT_DYNAMIC_PATTERN = /importDynamic\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

function processFiles(pattern, transformPath) {
  const files = glob.sync(pattern);

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    content = content.replace(IMPORT_DYNAMIC_PATTERN, (match, importPath) => {
      // only process relative imports
      if (importPath.startsWith('.')) {
        const newPath = transformPath(importPath, file);
        if (newPath !== importPath) {
          modified = true;
          return `importDynamic('${newPath}')`;
        }
      }
      return match;
    });

    if (modified) fs.writeFileSync(file, content);
  });
}

function resolveImportPath(importPath, fromFile, extension, indexFile) {
  // already has an extension
  if (path.extname(importPath)) {
    return importPath;
  }

  // resolve the path relative to the file containing the import
  const fromDir = path.dirname(fromFile);
  const resolvedPath = path.resolve(fromDir, importPath);

  // check if it's a file with the specified extension
  if (fs.existsSync(resolvedPath + extension)) {
    return importPath + extension;
  }

  // check if it's a directory with the specified index file
  if (fs.existsSync(path.join(resolvedPath, indexFile))) {
    return importPath + '/' + indexFile;
  }

  return importPath + extension;
}

function transformESMPath(importPath, fromFile) {
  return resolveImportPath(importPath, fromFile, '.mjs', 'index.mjs');
}

function transformCJSPath(importPath, fromFile) {
  const result = resolveImportPath(importPath, fromFile, '.js', 'index.js');
  // leave as-is for commonjs (node can resolve without extension)
  return result.endsWith('.js') ? result : importPath;
}

processFiles('dist/**/*.mjs', transformESMPath);

processFiles('dist/**/*.js', transformCJSPath);

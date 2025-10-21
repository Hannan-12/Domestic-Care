// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// 1. Get the tsconfig.json paths
// We'll use the "paths" you just showed me.
const tsconfig = require('./tsconfig.json');
const tsconfigPaths = tsconfig.compilerOptions.paths;

// 2. Create a resolver alias map
// This converts { "@/*": ["./*"] } into something Metro understands
const alias = Object.keys(tsconfigPaths).reduce((acc, key) => {
  const tsPath = tsconfigPaths[key][0];
  
  // Resolve the '@/*' syntax
  const aliasName = key.replace('/*', '');
  const aliasPath = tsPath.replace('/*', '');

  // Create the alias entry, e.g., { '@': '/path/to/your/project' }
  acc[aliasName] = path.resolve(__dirname, aliasPath);
  return acc;
}, {});

console.log('--- Metro Resolver Alias ---');
console.log(alias);
console.log('----------------------------');

// 3. Apply the alias to the Metro config
config.resolver.alias = alias;

module.exports = config;
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Project root directory (apps/frontend)
const projectRoot = __dirname;
// Monorepo root directory
const monorepoRoot = path.resolve(projectRoot, '../..');

const frontendNodeModules = path.resolve(projectRoot, 'node_modules');
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules');

// Ensure packages installed in apps/frontend/node_modules (like react-native, expo-router)
// are resolvable by root-level tools (like @expo/metro-config exportHermes) in monorepo setup
if (!process.env.NODE_PATH) {
  process.env.NODE_PATH = `${frontendNodeModules}${path.delimiter}${rootNodeModules}`;
} else if (!process.env.NODE_PATH.includes(frontendNodeModules)) {
  process.env.NODE_PATH = `${frontendNodeModules}${path.delimiter}${rootNodeModules}${path.delimiter}${process.env.NODE_PATH}`;
}
require('module').Module._initPaths();

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo while preserving default watch folders
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  frontendNodeModules,
  rootNodeModules,
];

module.exports = config;

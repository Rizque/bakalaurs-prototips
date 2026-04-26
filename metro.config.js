const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Pievieno txt kā asset (ja vēl nav)
if (!config.resolver.assetExts.includes("txt")) {
  config.resolver.assetExts.push("txt");
}

module.exports = config;

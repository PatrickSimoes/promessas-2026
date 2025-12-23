// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:prettier/recommended', // desliga regras que brigam com o prettier + roda prettier via eslint
  ],
  rules: {
    // Prettier como "erro" pra te forçar a manter padrão
    'prettier/prettier': 'error',

    // Ajustes úteis no RN (opinião de manutenção)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', 'dist/', 'build/', 'coverage/'],
};

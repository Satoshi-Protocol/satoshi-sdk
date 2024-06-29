module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
  // moduleNameMapper: {
  //   "abi": ["<rootDir>/src/abi"],
  //   "abi/(.*)": ["<rootDir>/src/abi.$1"],
  //   "api": ["<rootDir>/src/api"],
  //   "api/(.*)": ["<rootDir>/src/api.$1"],
  //   "config": ["<rootDir>/src/config"],
  //   "config/(.*)": ["<rootDir>/src/config.$1"],
  //   "core": ["<rootDir>/src/core"],
  //   "core/(.*)": ["<rootDir>/src/core.$1"],
  //   "network": ["<rootDir>/src/network"],
  //   "network/(.*)": ["<rootDir>/src/network.$1"],
  //   "types": ["<rootDir>/src/types"],
  //   "types/(.*)": ["<rootDir>/src/types.$1"],
  // },
  // // transform: {
  // //   '^.+\\.tsx?$': ['ts-jest', {
  // //     tsconfig: 'tsconfig.json',
  // //   }],
  // // },
  // globals: {
  //   extensionsToTreatAsEsm: ['.ts', '.js'],
  //   'ts-jest': {
  //     useESM: true
  //   }
  // },

  // preset: 'ts-jest/presets/js-with-ts-esm',

  // // from https://stackoverflow.com/a/57916712/15076557
  // transformIgnorePatterns: [
  //   'node_modules/(?!(module-that-needs-to-be-transformed)/)'
  // ]
};

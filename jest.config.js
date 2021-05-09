module.exports = {
  bail: true,
  testTimeout: 90000, // 1 minute and 30 seconds
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '^.*.(test|spec).(t|j)s$',
  setupFilesAfterEnv: ['<rootDir>/node_modules/dotenv/config'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

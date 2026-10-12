/**
 * Tests exécutés contre les émulateurs Firebase (npm run test:firebase) :
 * - règles de sécurité Firestore et Storage (tests/rules)
 * - services de l'application avec un vrai SDK Firebase (tests/integration)
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  testTimeout: 30000,
  // Les fichiers partagent les mêmes émulateurs : exécution séquentielle
  maxWorkers: 1,
};

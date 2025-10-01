import { beforeAll, afterAll } from 'vitest';
import { db } from '../src/db';

// Setup test database before all tests
beforeAll(async () => {
  // You can add any global setup here
  console.log('Starting test suite...');
});

// Cleanup after all tests
afterAll(async () => {
  console.log('Test suite completed');
});
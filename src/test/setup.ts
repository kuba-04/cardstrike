import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';

// Add any global mocks here
const server = setupServer();

beforeAll(() => {
  // Start the interception
  server.listen();
});

afterEach(() => {
  // Clean up any mounted components
  cleanup();
  // Reset any runtime request handlers
  server.resetHandlers();
});

afterAll(() => {
  // Clean up
  server.close();
}); 
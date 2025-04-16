import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import * as uiMocks from './mocks/ui';

// Add any global mocks here
const server = setupServer();

beforeAll(() => {
  // Start the interception
  server.listen();
});

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: uiMocks.Button,
}));

vi.mock('@/components/ui/card', () => ({
  Card: uiMocks.Card,
  CardHeader: uiMocks.CardHeader,
  CardContent: uiMocks.CardContent,
  CardFooter: uiMocks.CardFooter,
}));

vi.mock('@/components/ui/label', () => ({
  Label: uiMocks.Label,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: uiMocks.Textarea,
}));

// Mock window.location
const location = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: location,
  writable: true,
});

afterEach(() => {
  // Clean up any mounted components
  cleanup();
  // Reset any runtime request handlers
  server.resetHandlers();
  vi.clearAllMocks();
  location.href = '';
});

afterAll(() => {
  // Clean up
  server.close();
}); 
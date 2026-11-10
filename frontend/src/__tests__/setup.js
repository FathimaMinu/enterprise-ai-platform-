import '@testing-library/jest-dom';

// Suppress console.error for expected test errors
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('act(')) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

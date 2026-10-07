import { vi } from 'vitest';

// Mock the config module
vi.mock('config/config.js', () => ({
  HOWTO_ROOT: () => '/howto'
})); 
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Set up global mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock WebSocket
class MockWebSocket {
  public readyState: number = 0;
  public url: string = '';
  public onopen: (() => void) | null = null;
  public onclose: (() => void) | null = null;
  public onmessage: ((event: { data: string }) => void) | null = null;
  public onerror: ((error: Error) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // Connected
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string): void {
    setTimeout(() => {
      this.onmessage?.({ data });
    }, 0);
  }

  close(): void {
    this.readyState = 3; // Closed
    setTimeout(() => this.onclose?.(), 0);
  }
}

global.WebSocket = MockWebSocket as any;

// Mock Redis for cache manager
jest.mock('../lib/utils/cache-manager', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
    invalidateByTag: jest.fn(),
    getStats: jest.fn(),
  },
}));

// Mock metrics
jest.mock('../lib/utils/metrics', () => ({
  metrics: {
    register: jest.fn(),
    record: jest.fn(),
  },
}));

// Mock logger
jest.mock('../lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.POLYGON_API_KEY = 'test_api_key';
process.env.JWT_SECRET = 'test_jwt_secret';

// Increase test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 
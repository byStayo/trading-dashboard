import { TextEncoder, TextDecoder } from 'util';
import { EventEmitter } from 'events';

// Set up global mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock WebSocket
class MockWebSocket extends EventEmitter {
  public readyState: number = 0;
  public url: string = '';

  constructor(url: string) {
    super();
    this.url = url;
    this.readyState = 1; // Connected
  }

  send(data: string): void {
    this.emit('message', { data });
  }

  close(): void {
    this.readyState = 3; // Closed
    this.emit('close');
  }
}

global.WebSocket = MockWebSocket as any;

// Mock Redis for cache manager
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushdb: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
  }));
});

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
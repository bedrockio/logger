import { mockConsole, unmockConsole, getMessages } from './mocks/console';
import ConsoleLogger from '../src/loggers/ConsoleLogger';

const logger = new ConsoleLogger();

beforeEach(() => {
  mockConsole();
});

afterAll(() => {
  unmockConsole();
});

describe('basic logging', () => {
  it('should not log debug by default', async () => {
    logger.debug('msg');
    expect(getMessages()).toEqual([]);
  });

  it('should log info', async () => {
    logger.info('msg');
    expect(getMessages()).toEqual([['info', 'msg']]);
  });

  it('should log warn', async () => {
    logger.warn('msg');
    expect(getMessages()).toEqual([['warn', 'msg']]);
  });

  it('should log error', async () => {
    logger.error('msg');
    expect(getMessages()).toEqual([['error', 'msg']]);
  });

  it('should be able to use interpolation', async () => {
    logger.info('%s -> %s', 'foo', 'bar');
    expect(getMessages()).toEqual([['info', '%s -> %s', 'foo', 'bar']]);
  });

  it('should log debug when level set', async () => {
    process.env.LOG_LEVEL = 'debug';
    logger.debug('msg');
    expect(getMessages()).toEqual([['debug', 'msg']]);
    process.env.LOG_LEVEL = 'info';
  });

  it('should only log error messages when level set', async () => {
    process.env.LOG_LEVEL = 'error';
    logger.debug('msg');
    logger.info('msg');
    logger.warn('msg');
    expect(getMessages()).toEqual([]);
    logger.error('msg');
    expect(getMessages()).toEqual([['error', 'msg']]);
    process.env.LOG_LEVEL = 'info';
  });

  it('should format a successful request', async () => {
    logger.formatRequest({
      level: 'info',
      method: 'POST',
      path: '/',
      status: 200,
      latency: 50,
      size: '500B',
    });
    expect(getMessages()).toEqual([['info', 'POST   200 / 50ms 500B']]);
  });

  it('should format a bad request', async () => {
    logger.formatRequest({
      level: 'error',
      method: 'POST',
      path: '/',
      status: 500,
      latency: 50,
      size: '500B',
    });
    expect(getMessages()).toEqual([['error', 'POST   500 / 50ms 500B']]);
  });
});

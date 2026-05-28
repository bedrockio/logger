import {
  mockConsole,
  unmockConsole,
  getMessages,
  getParsedMessages,
} from './mocks/console';
import GoogleCloudLogger from '../src/loggers/GoogleCloudLogger';

const logger = new GoogleCloudLogger();

beforeEach(() => {
  mockConsole();
  logger.setInspectDepth(2);
});

afterAll(() => {
  unmockConsole();
});

describe('basic logging', () => {
  it('should log debug', async () => {
    logger.debug('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'msg',
          severity: 'DEBUG',
        },
      ],
    ]);
  });

  it('should log info', async () => {
    logger.info('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'msg',
          severity: 'INFO',
        },
      ],
    ]);
  });

  it('should log warn', async () => {
    logger.warn('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'msg',
          severity: 'WARNING',
        },
      ],
    ]);
  });

  it('should log error', async () => {
    logger.error('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'msg',
          severity: 'ERROR',
        },
      ],
    ]);
  });
});

describe('error logging', () => {
  it('should log an error object', async () => {
    const error = new Error('Error!');
    logger.error(error);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: error.stack,
          severity: 'ERROR',
        },
      ],
    ]);
  });

  it('should be able to log multiple errors', async () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');
    logger.error(error1, error2);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: [error1.stack, error2.stack].join(' '),
          severity: 'ERROR',
        },
      ],
    ]);
  });

  it('should log error message with string after', async () => {
    const error = new Error('Error!');
    logger.error(error, 'hello!');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: [error.stack, 'hello!'].join(' '),
          severity: 'ERROR',
        },
      ],
    ]);
  });
});

describe('complex logging', () => {
  it('should concatenate multiple string arguments', async () => {
    logger.info('one', 'two');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'one two',
          severity: 'INFO',
        },
      ],
    ]);
  });

  it('should stringify a shallow JSON payload', async () => {
    logger.info({
      foo: 'bar',
    });
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          foo: 'bar',
          severity: 'INFO',
          message: "{ foo: 'bar' }",
        },
      ],
    ]);
  });

  it('should be able to mix a string and an object', async () => {
    logger.info('an object', {
      foo: {
        bar: 'baz',
      },
    });
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: "an object { foo: { bar: 'baz' } }",
          foo: {
            bar: 'baz',
          },
        },
      ],
    ]);
  });

  it('should log array of strings as message', async () => {
    logger.info(['foo', 'bar']);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: "[ 'foo', 'bar' ]",
        },
      ],
    ]);
  });

  it('should log multiple complex args', async () => {
    logger.info('a user', { name: 'Joe' }, 'and a shop', { name: 'Wendys' });
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: "a user { name: 'Joe' } and a shop { name: 'Wendys' }",
          name: 'Wendys',
        },
      ],
    ]);
  });

  it('should stringify payload fields', async () => {
    logger.info({
      message: 'foo',
      severity: 'foo',
    });

    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: "{ message: 'foo', severity: 'foo' }",
        },
      ],
    ]);
  });
});

describe('truncation depth', () => {
  it('should match console default truncation depth', async () => {
    logger.info({
      foo: {
        bar: {
          baz: {
            qux: 'qux',
          },
        },
      },
    });
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: '{ foo: { bar: { baz: [Object] } } }',
          foo: {
            bar: {
              baz: {
                qux: 'qux',
              },
            },
          },
        },
      ],
    ]);
  });

  it('should allow a lower depth to be set', async () => {
    logger.setInspectDepth(1);
    logger.info({
      foo: {
        bar: {
          baz: {
            qux: 'qux',
          },
        },
      },
    });
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: '{ foo: { bar: [Object] } }',
          foo: {
            bar: {
              baz: {
                qux: 'qux',
              },
            },
          },
        },
      ],
    ]);
  });

  it('should allow a higher depth to be set', async () => {
    logger.setInspectDepth(3);
    logger.info({
      foo: {
        bar: {
          baz: {
            qux: 'qux',
          },
        },
      },
    });
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: `{
  foo: { bar: { baz: { qux: 'qux' } } }
}`,
          foo: {
            bar: {
              baz: {
                qux: 'qux',
              },
            },
          },
        },
      ],
    ]);
  });

  it('should allow no depth max to be set', async () => {
    logger.setInspectDepth(null);
    logger.info({
      foo: {
        bar: {
          baz: {
            qux: 'qux',
          },
        },
      },
    });
    const expected = `{
  foo: { bar: { baz: { qux: 'qux' } } }
}`.trim();
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: expected,
          foo: {
            bar: {
              baz: {
                qux: 'qux',
              },
            },
          },
        },
      ],
    ]);
  });

  it('should truncate a complex array of objects', async () => {
    const obj = { foo: { bar: 'baz' } };

    logger.setInspectDepth(1);
    logger.info([obj, obj]);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: '[ { foo: [Object] }, { foo: [Object] } ]',
        },
      ],
    ]);
  });

  it('should truncate nested arrays in message', async () => {
    logger.setInspectDepth(1);
    logger.info('an array', ['foo', ['bar', ['baz']]]);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: "an array [ 'foo', [ 'bar', [Array] ] ]",
        },
      ],
    ]);
  });

  it('should handle unbounded cyclic object', async () => {
    logger.setInspectDepth(null);
    const obj = { foo: 'bar' };
    obj.bar = obj;
    logger.info(obj);

    expect(getMessages()).toEqual([['log', '[Cyclic Object]']]);
  });

  it('should handle an unserializable value such as a BigInt', async () => {
    logger.info({ big: 1n });
    expect(getMessages()).toEqual([['log', '[Unserializable Object]']]);
  });
});

describe('printf style logging', () => {
  it('should substitute a string', async () => {
    logger.info('%s -> %s', 'foo', 'bar');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'foo -> bar',
          severity: 'INFO',
        },
      ],
    ]);
  });

  it('should substitute a digit', async () => {
    logger.info('%s -> %d', 'foo', 1000);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'foo -> 1000',
          severity: 'INFO',
        },
      ],
    ]);
  });

  it('should substitute an integer', async () => {
    logger.info('%s -> %i', 'foo', 1000);
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          message: 'foo -> 1000',
          severity: 'INFO',
        },
      ],
    ]);
  });
});

describe('contexts', () => {
  it('should allow structured logging with context fields', async () => {
    logger.context({ foo: 'bar' }).info('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: 'msg',
          context: {
            foo: 'bar',
          },
        },
      ],
    ]);
  });

  it('should be able to merge contexts', async () => {
    logger.context({ foo: 'foo' }).context({ bar: 'bar' }).info('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: 'msg',
          context: {
            foo: 'foo',
            bar: 'bar',
          },
        },
      ],
    ]);
  });

  it('should convert arrays to objects', async () => {
    logger.context([{ foo: 'foo' }, { bar: 'bar' }]).info('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: 'msg',
          context: {
            0: {
              foo: 'foo',
            },
            1: {
              bar: 'bar',
            },
          },
        },
      ],
    ]);
  });

  it('should be immutable', async () => {
    logger.context({ foo: 'foo' });
    logger.context({ bar: 'bar' }).info('msg');
    expect(getParsedMessages()).toEqual([
      [
        'log',
        {
          severity: 'INFO',
          message: 'msg',
          context: {
            bar: 'bar',
          },
        },
      ],
    ]);
  });
});

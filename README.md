# @bedrockio/logger

Structured logger that targets both the console and remote cloud formats. This includes:

- Pretty formatting for the console.
- Request logging middleware.
- Google Cloud structured logger.
- Google Cloud batched tracing via [OpenTelemetry](https://opentelemetry.io/).

## Install

```bash
yarn install @bedrockio/logger
```

## Usage

```js
const logger = require("@bedrockio/logger");
logger.setupGoogleCloud({
  // Set up gcloud structured logging. Default true.
  logging: true,
  // Set up gcloud tracing. Default true.
  tracing: true,
});
```

This initialization code should be added as early as possible in your application.

### Options

Enable both logging and tracing and tell the tracing to ignore specific paths.

```js
const logger = require("@bedrockio/logger");
logger.setupGoogleCloud({
  tracing: {
    ignoreIncomingPaths: ["/"],
  },
});
```

## Log Levels

In development, setting `process.env.LOG_LEVEL` will set the log level which silences lower level output:

- debug
- info
- warn
- error

The default is `info` which silences `debug` level logs.

### Methods

#### `logger.useConsole`

Sets the logger to use console output for development. This is the default.

#### `logger.useGoogleCloud`

Sets the logger to output structured logs in JSON format. Accepts an `options` object:

- `getSpanContext` - This connects the logger to tracing, allowing you to batch logs by requests.

#### `logger.middleware`

Koa middleware that logs HTTP requests:

```js
const Koa = require("koa");
const logger = require("@bedrockio/logging");

const app = new Koa();
app.use(logger.middleware());
```

### Logger Methods

```js
logger.debug("Hello");
logger.info("Hello");
logger.warn("Hello");
logger.error("Hello");
```

The basic methods will output logs at different levels.

### Object Logging

```js
logger.info({
  foo: "bar",
});
```

Passing an object into the console logger will output it as you would see in the `console`. When using the Google Cloud
logger it will output a structured JSON payload that allows inspecting of the object in the
[logging console](https://console.cloud.google.com/logs).

### Multiple Arguments

```js
logger.info("foo", "bar");
logger.info(obj1, obj2);
```

Multiple arguments will be concatenated together in the console logger. The Google Cloud logger will present a truncated
message and export complex objects to the JSON payload.

### String Formatting

```js
logger.info("%s -> %s", "foo", "bar"); // foo -> bar
```

Basic printf style formatting is supported out of the box by the console logger, and the Google Cloud console will
format basic tokens (`%s`, `%d`, and `%i`). Note that decimal precision formatting such as `"%.2d"` is not supported.

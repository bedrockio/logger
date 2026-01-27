import consoleAsync from '../utils/async-console';
import { isTTY } from '../utils/env';

import BaseLogger from './BaseLogger';

// Note: GCP severity levels are described here:
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
// For the purposes of common logging the following are used:
// - DEBUG
// - INFO
// - WARNING
// - ERROR

export default class GoogleCloudLogger extends BaseLogger {
  debug(...args) {
    return this.emit('DEBUG', ...args);
  }

  info(...args) {
    return this.emit('INFO', ...args);
  }

  warn(...args) {
    return this.emit('WARNING', ...args);
  }

  error(...args) {
    return this.emit('ERROR', ...args);
  }

  emit(severity, ...args) {
    const jsonPayload = {
      context: this.options.context,
    };

    const message = this.getMessage(args);

    this.emitPayload({
      severity,
      message,
      ...jsonPayload,
    });
  }

  formatRequest(info) {
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
    let { method, path, status, latency, size } = info;
    const severity = status < 500 ? 'INFO' : 'ERROR';
    const message = `${method} ${path} ${size} - ${latency}ms`;

    this.emitPayload({
      message,
      severity,
      userId: info.userId,
      requestBody: info.requestBody,
      requestQuery: info.requestQuery,
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        requestSize: info.requestLength?.toString(),
        responseSize: info.responseLength?.toString(),
        status: info.status,
        referer: info.referer,
        remoteIp: info.remoteIp,
        serverIp: info.serverIp,
        protocol: info.protocol,
        userAgent: info.userAgent,
        latency: `${latency / 1000}s`,
      },
    });
  }

  emitPayload(payload) {
    const { getTracePayload } = this.options;
    if (getTracePayload) {
      Object.assign(payload, getTracePayload());
    }
    log(JSON.stringify(payload));
  }
}

// Wrap this to allow testing.
function log(msg) {
  const console = isTTY ? global.console : consoleAsync;
  console.log(msg);
}

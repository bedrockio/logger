import consoleAsync from "../utils/async-console";
import { isTTY } from "../utils/env";

import BaseLogger from "./BaseLogger";

// Note: GCP severity levels are described here:
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
// For the purposes of common logging the following are used:
// - DEBUG
// - INFO
// - WARNING
// - ERROR

export default class GoogleCloudLogger extends BaseLogger {
  debug(...args) {
    return this.emit("DEBUG", ...args);
  }

  info(...args) {
    return this.emit("INFO", ...args);
  }

  warn(...args) {
    return this.emit("WARNING", ...args);
  }

  error(...args) {
    return this.emit("ERROR", ...args);
  }

  emit(severity, ...args) {
    let message;
    const jsonPayload = {
      context: this.options.context,
    };

    args = printf(args);

    message = args.map((arg) => dump(arg)).join(" ");

    this.emitPayload({
      severity,
      message,
      ...jsonPayload,
    });
  }

  formatRequest(info) {
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
    let { method, path, status, latency, size } = info;
    const severity = status < 500 ? "INFO" : "ERROR";
    const message = `${method} ${path} ${size} - ${latency}ms`;

    this.emitPayload({
      message,
      severity,
      ...this.getAdditionalFields(info),
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        requestSize: info.requestLength,
        responseSize: info.responseLength,
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

  getAdditionalFields(info) {
    if (info.userId) {
      return {
        userId: info.userId,
      };
    }
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

function isPrimitive(arg) {
  return arg !== Object(arg);
}

function dump(arg, level = 0) {
  if (Array.isArray(arg)) {
    if (level < 1) {
      const str = arg.map((el) => dump(el, level + 1)).join(", ");
      return `[${str}]`;
    } else {
      return `[...]`;
    }
  } else if (arg instanceof Error) {
    return arg.stack;
  } else if (!isPrimitive(arg)) {
    if (level < 1) {
      const keys = Object.keys(arg);
      const str = keys
        .map((key) => {
          return `"${key}": ${dump(arg[key], level + 1)}`;
        })
        .join(", ");
      return `{${str}}`;
    } else {
      return "{...}";
    }
  } else {
    return level > 0 ? JSON.stringify(arg) : arg;
  }
}

const PRINTF_REG = /%(s|d|i)/g;

function printf(args) {
  let [first] = args;
  if (typeof first === "string") {
    first = first.replace(PRINTF_REG, (all, op) => {
      let inject = args.splice(1, 1)[0];
      if (op === "d" || op === "i") {
        inject = Number(inject);
      }
      return inject;
    });
    args[0] = first;
  }
  return args;
}

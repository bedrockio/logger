import { red, yellow, gray } from "kleur";

import BaseLogger from "./BaseLogger";

const LOG_LEVELS = ["debug", "info", "warn", "error"];

export default class ConsoleLogger extends BaseLogger {
  debug(...args) {
    return this.emit("debug", ...args);
  }

  info(...args) {
    return this.emit("info", ...args);
  }

  warn(...args) {
    return this.emit("warn", ...args);
  }

  error(...args) {
    return this.emit("error", ...args);
  }

  emit(level, ...args) {
    if (LOG_LEVELS.indexOf(level) >= getMinLevel()) {
      this.print(level, ...args);
    }
  }

  print(level, ...args) {
    const fn = console[level];
    let msg = "";
    if (typeof args[0] === "string") {
      const [first, ...rest] = args;
      msg += this.formatForLevel(level, first);
      args = rest;
    }
    fn(msg, ...args);
  }

  formatRequest(request) {
    let { method, path, status, latency, size } = request;
    const level = status < 500 ? "info" : "error";
    method = method.padEnd(6, " ");
    status = this.formatStatus(status);
    const meta = this.formatMeta(`${path} ${latency}ms ${size}`);
    const msg = `${method} ${status} ${meta}`;
    this[level](msg);
  }

  formatStatus(status) {
    return status;
  }

  formatMeta(meta) {
    return meta;
  }

  formatForLevel(level, msg) {
    if (level === "error") {
      return red(msg);
    } else if (level === "warn") {
      return yellow(msg);
    } else {
      return gray(msg);
    }
  }
}

function getMinLevel() {
  const minLevel = LOG_LEVELS.indexOf(process.env.LOG_LEVEL || "info");
  if (minLevel === -1) {
    throw new Error(`Invalid log level. Must be one of ${LOG_LEVELS}`);
  }
  return minLevel;
}

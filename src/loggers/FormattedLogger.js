import { gray, yellow, red, cyan, green } from "kleur";

import ConsoleLogger from "./ConsoleLogger";

export default class FormattedLogger extends ConsoleLogger {
  print(level, ...args) {
    const fn = console[level];
    let msg = `${this.getDateTag()} ${this.getLevelTag(level)}`;
    if (typeof args[0] === "string") {
      const [first, ...rest] = args;
      msg += ` ${first}`;
      args = rest;
    }
    fn(msg, ...args);
  }

  getDateTag() {
    // Local date in ISO format, no ms.
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return gray(`[${date.toISOString().slice(0, -5)}]`);
  }

  getLevelTag(level) {
    let tag = level.toUpperCase().padStart(5, " ");
    return this.formatForLevel(level, tag);
  }

  formatStatus(status) {
    if (status >= 500) {
      return red(status);
    } else if (status >= 400) {
      return yellow(status);
    } else if (status >= 300) {
      return cyan(status);
    } else {
      return green(status);
    }
  }

  formatMeta(meta) {
    return gray(meta);
  }
}

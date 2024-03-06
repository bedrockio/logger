import {
  trace,
  debug,
  info,
  warn,
  error,
  formatRequest,
  useConsole,
  useFormatted,
  useGoogleCloud,
} from "./logger";
import middleware from "./middleware";

const DEFAULT_OPTIONS = {
  logging: true,
  tracing: true,
};

/**
 * @param {Object} [options]
 * @param {boolean} [options.logging=true]
 * @param {boolean|Object} [options.tracing=true]
 * @param {function} [options.getSpanContext]
 */
function setupGoogleCloud(options) {
  options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (options.logging) {
    const options = {};
    if (options.getSpanContext) {
      options.getTracePayload = function getTracePayload() {
        const context = options.getSpanContext();
        if (context) {
          const { spanId, traceId, traceFlags } = context;
          return {
            "logging.googleapis.com/spanId": spanId,
            "logging.googleapis.com/trace": traceId,
            "logging.googleapis.com/trace_sampled": traceFlags === 1,
          };
        }
      };
    }
    useGoogleCloud(options);
  }
}

export {
  trace,
  debug,
  info,
  warn,
  error,
  setupGoogleCloud,
  formatRequest,
  middleware,
  useConsole,
  useFormatted,
  useGoogleCloud,
};

export default {
  trace,
  debug,
  info,
  warn,
  error,
  setupGoogleCloud,
  formatRequest,
  middleware,
  useConsole,
  useFormatted,
  useGoogleCloud,
};

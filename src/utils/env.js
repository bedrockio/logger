// Consider test environments as TTY.
export const isTTY = process.stdout.isTTY || process.env.NODE_ENV === 'test';

export function isCloudEnv() {
  return !!(
    process.env.KUBERNETES_SERVICE_HOST || // GKE
    process.env.K_SERVICE || // Cloud Run (services and jobs)
    process.env.FUNCTION_TARGET // Cloud Functions / Cloud Run Functions (gen 2)
  );
}

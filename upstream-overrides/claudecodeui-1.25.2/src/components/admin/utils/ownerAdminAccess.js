const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function isLoopbackHost(hostname) {
  return LOOPBACK_HOSTS.has(String(hostname || '').trim().toLowerCase());
}

export function shouldShowOwnerAdminLauncher({ hostname, hasUser }) {
  return Boolean(hasUser) && isLoopbackHost(hostname);
}

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function isLoopbackAddress(address) {
  if (!address) {
    return false;
  }

  const normalized = String(address).trim().toLowerCase();
  return normalized === '127.0.0.1'
    || normalized === '::1'
    || normalized === '::ffff:127.0.0.1'
    || normalized === 'localhost';
}

export function buildOwnerAdminStatus({ workspacesRoot, tailscaleState, port = 3001 }) {
  return {
    localUrl: `http://127.0.0.1:${port}`,
    remoteUrl: tailscaleState.remoteUrl,
    workspacesRoot,
    tailscale: {
      installed: tailscaleState.installed,
      running: tailscaleState.running,
      backendState: tailscaleState.backendState,
      dnsName: tailscaleState.dnsName,
      authUrl: tailscaleState.authUrl,
    },
  };
}

export async function loadTailscaleAdminState({
  tailscalePath = process.env.MOBILE_CODEX_TAILSCALE || 'tailscale',
  execFileImpl = execFileAsync,
} = {}) {
  try {
    const { stdout } = await execFileImpl(tailscalePath, ['status', '--json']);
    const parsed = JSON.parse(stdout || '{}');
    const dnsName = typeof parsed?.Self?.DNSName === 'string'
      ? parsed.Self.DNSName.replace(/\.$/, '')
      : null;

    return {
      installed: true,
      running: parsed?.BackendState === 'Running',
      backendState: parsed?.BackendState || 'Unknown',
      dnsName,
      remoteUrl: dnsName ? `https://${dnsName}` : null,
      authUrl: parsed?.AuthURL || null,
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        installed: false,
        running: false,
        backendState: 'NotInstalled',
        dnsName: null,
        remoteUrl: null,
        authUrl: null,
      };
    }

    return {
      installed: true,
      running: false,
      backendState: 'Error',
      dnsName: null,
      remoteUrl: null,
      authUrl: null,
    };
  }
}

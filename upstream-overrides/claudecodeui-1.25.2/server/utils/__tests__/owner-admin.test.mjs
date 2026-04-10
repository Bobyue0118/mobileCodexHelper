import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOwnerAdminStatus,
  isLoopbackAddress,
  loadTailscaleAdminState,
} from '../owner-admin.js';

test('isLoopbackAddress accepts Express loopback variants', () => {
  assert.equal(isLoopbackAddress('127.0.0.1'), true);
  assert.equal(isLoopbackAddress('::1'), true);
  assert.equal(isLoopbackAddress('::ffff:127.0.0.1'), true);
  assert.equal(isLoopbackAddress('100.101.102.103'), false);
});

test('buildOwnerAdminStatus returns local and remote URLs', () => {
  const payload = buildOwnerAdminStatus({
    workspacesRoot: '/workspace/projects',
    tailscaleState: {
      installed: true,
      running: true,
      backendState: 'Running',
      dnsName: 'codex-host.tailnet.ts.net',
      remoteUrl: 'https://codex-host.tailnet.ts.net',
      authUrl: null,
    },
    port: 3001,
  });

  assert.deepEqual(payload, {
    localUrl: 'http://127.0.0.1:3001',
    remoteUrl: 'https://codex-host.tailnet.ts.net',
    workspacesRoot: '/workspace/projects',
    tailscale: {
      installed: true,
      running: true,
      backendState: 'Running',
      dnsName: 'codex-host.tailnet.ts.net',
      authUrl: null,
    },
  });
});

test('loadTailscaleAdminState handles login-required status', async () => {
  const state = await loadTailscaleAdminState({
    tailscalePath: 'tailscale',
    execFileImpl: async () => ({
      stdout: JSON.stringify({
        BackendState: 'NeedsLogin',
        AuthURL: 'https://login.tailscale.example/device',
        Self: {},
      }),
      stderr: '',
    }),
  });

  assert.deepEqual(state, {
    installed: true,
    running: false,
    backendState: 'NeedsLogin',
    dnsName: null,
    remoteUrl: null,
    authUrl: 'https://login.tailscale.example/device',
  });
});

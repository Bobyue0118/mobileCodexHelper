import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLoopbackHost,
  shouldShowOwnerAdminLauncher,
} from '../ownerAdminAccess.js';

test('isLoopbackHost accepts macOS local browser hostnames', () => {
  assert.equal(isLoopbackHost('127.0.0.1'), true);
  assert.equal(isLoopbackHost('localhost'), true);
  assert.equal(isLoopbackHost('::1'), true);
  assert.equal(isLoopbackHost('bobyue-mac.tail123.ts.net'), false);
});

test('shouldShowOwnerAdminLauncher requires a user on a loopback host', () => {
  assert.equal(shouldShowOwnerAdminLauncher({ hostname: 'localhost', hasUser: true }), true);
  assert.equal(shouldShowOwnerAdminLauncher({ hostname: 'localhost', hasUser: false }), false);
  assert.equal(shouldShowOwnerAdminLauncher({ hostname: 'bobyue-mac.tail123.ts.net', hasUser: true }), false);
});

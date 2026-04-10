import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('checked-in examples do not contain personal hostnames or home-directory paths', () => {
  const files = [
    'upstream-overrides/claudecodeui-1.25.2/server/utils/__tests__/owner-admin.test.mjs',
    'upstream-overrides/claudecodeui-1.25.2/src/components/admin/utils/__tests__/ownerAdminAccess.test.mjs',
    'docs/superpowers/specs/2026-04-10-macos-mobile-codex-design.md',
  ];

  for (const file of files) {
    const contents = readRepoFile(file);
    assert.equal(/\/Users\/[A-Za-z0-9._-]+/.test(contents), false, `${file} should not contain a real home-directory path`);
    assert.equal(/\btail123\.ts\.net\b/i.test(contents), false, `${file} should not contain a real tailnet host`);
  }
});

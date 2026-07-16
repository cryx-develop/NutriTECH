const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

function waitForServer(url, timeoutMs = 10000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryRequest = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Server did not start in time for ${url}`));
          return;
        }
        setTimeout(tryRequest, 250);
      });
    };

    tryRequest();
  });
}

test('profile page route serves HTML', async () => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '3102' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForServer('http://127.0.0.1:3102/');
    const response = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:3102/views/profile', (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }).on('error', reject);
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Profilul meu|Contul meu/i);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once('exit', resolve));
  }
});

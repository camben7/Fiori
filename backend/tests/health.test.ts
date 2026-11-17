import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

// Prueba de humo de la API con puerto efímero; no necesita credenciales externas.
test('GET /api/health devuelve el estado de Fiori', async () => {
  const server = createApp().listen(0);
  try {
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No se pudo obtener el puerto de prueba.');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const body = await response.json() as { status: string; message: string };
    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.message, 'Fiori API funcionando');
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { initOpenPaymentsClient } from '../src/config/openPayments.js';
import { gameEngine } from '../src/game/GameEngine.js';

describe('Endpoints REST de Billetera y Open Payments (/api)', () => {
  beforeAll(async () => {
    await initOpenPaymentsClient();
    gameEngine.startBettingPhase();
  });

  afterAll(() => {
    gameEngine.stop();
  });
  it('GET /api/health retorna estado correcto del servidor', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('roundNumber');
  });

  it('GET /api/wallet/resolve resuelve correctamente un puntero de pago', async () => {
    const res = await request(app)
      .get('/api/wallet/resolve')
      .query({ pointer: '$ilp.bancolombia.co/carlos_cop' });

    expect(res.status).toBe(200);
    expect(res.body.assetCode).toBe('COP');
    expect(res.body.assetScale).toBe(0);
    expect(res.body.id).toContain('ilp.bancolombia.co/carlos_cop');
  });

  it('POST /api/wallet/grant genera una sesión de permiso con token de acceso', async () => {
    const res = await request(app)
      .post('/api/wallet/grant')
      .send({
        walletAddress: '$ilp.bancolombia.co/carlos_cop',
        assetCode: 'COP',
        assetScale: 0,
        amountNative: 20000,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('grantId');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.totalAmount).toBe(20000);
    expect(res.body.remainingAmount).toBe(20000);
  });

  it('POST /api/wallet/bet procesa el micro-pago y registra la apuesta', async () => {
    const res = await request(app)
      .post('/api/wallet/bet')
      .send({
        pointer: '$ilp.rafiki.money/player_test_1',
        numberGuess: 7,
        assetCode: 'USD',
        assetScale: 2,
        nativeAmount: 0.10,
        amountUSD: 0.10,
        remainingAmount: 10.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('transaction');
    expect(res.body.transaction.amountUSD).toBe(0.10);
    expect(res.body.transaction.numberGuess).toBe(7);
  });

  it('POST /api/wallet/bet rechaza apuestas duplicadas en la misma ronda para la misma billetera', async () => {
    // Segunda apuesta con la misma billetera dentro de la misma ronda
    const res = await request(app)
      .post('/api/wallet/bet')
      .send({
        pointer: '$ilp.rafiki.money/player_test_1',
        numberGuess: 8,
        assetCode: 'USD',
        assetScale: 2,
        nativeAmount: 0.10,
        amountUSD: 0.10,
        remainingAmount: 9.90,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Ya has registrado una apuesta para esta ronda');
  });

  it('POST /api/wallet/grant/continue finaliza la autorización interactiva con interact_ref', async () => {
    const res = await request(app)
      .post('/api/wallet/grant/continue')
      .send({
        interactRef: 'test_ref_xyz_123',
        continueUri: 'https://auth.interledger-test.dev/continue/test-id',
        continueToken: 'token_cont_123',
        walletAddress: '$ilp.interledger-test.dev/dicehouse',
        totalAmount: 10,
        assetCode: 'USD',
        assetScale: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('grantId');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.totalAmount).toBe(10);
  });
});

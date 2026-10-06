import { openPaymentsService } from '../services/openPaymentsService.js';
import { gameEngine } from '../game/GameEngine.js';

export const walletController = {
  /**
   * GET /api/wallet/resolve?pointer=...
   */
  async resolve(req, res) {
    try {
      const pointer = req.query.pointer;
      if (!pointer) {
        return res.status(400).json({ error: 'Parámetro query "pointer" es requerido' });
      }

      const resolved = await openPaymentsService.resolveWalletAddress(pointer);
      return res.json(resolved);
    } catch (err) {
      console.error('[walletController.resolve] Error:', err);
      return res.status(500).json({ error: err.message || 'Error al resolver puntero de pago' });
    }
  },

  /**
   * POST /api/wallet/grant
   */
  async grant(req, res) {
    try {
      const { walletAddress, assetCode, assetScale, amountNative } = req.body;
      if (!walletAddress || !amountNative) {
        return res.status(400).json({
          error: 'Campos requeridos faltantes: walletAddress, amountNative',
        });
      }

      const session = await openPaymentsService.createGrantSession({
        walletAddress,
        assetCode,
        assetScale,
        amountNative: Number(amountNative),
        redirectUri: req.body.redirectUri || 'http://localhost:5173/auth/callback',
      });

      return res.json(session);
    } catch (err) {
      console.error('[walletController.grant] Error:', err);
      return res.status(500).json({ error: err.message || 'Error al crear permiso de gasto' });
    }
  },

  /**
   * POST /api/wallet/grant/continue
   */
  async continueGrant(req, res) {
    try {
      const {
        interactRef,
        continueUri,
        continueToken,
        walletAddress,
        totalAmount,
        assetCode,
        assetScale,
      } = req.body;

      if (!interactRef || !continueUri || !continueToken) {
        return res.status(400).json({
          error: 'Campos requeridos faltantes: interactRef, continueUri, continueToken',
        });
      }

      const session = await openPaymentsService.continueGrantSession({
        interactRef,
        continueUri,
        continueToken,
        walletAddress,
        totalAmount,
        assetCode,
        assetScale,
      });

      return res.json(session);
    } catch (err) {
      console.error('[walletController.continueGrant] Error:', err);
      return res.status(500).json({ error: err.message || 'Error al finalizar autorización interactiva' });
    }
  },

  /**
   * POST /api/wallet/bet
   */
  async bet(req, res) {
    try {
      const rawBodyToken = req.body.grantToken;
      const rawHeaderToken = req.headers.authorization?.replace(/^GNAP\s+/i, '').trim();

      const isRealToken = (t) => Boolean(t && typeof t === 'string' && !t.startsWith('grant_'));

      let grantToken = null;
      if (isRealToken(rawBodyToken)) {
        grantToken = rawBodyToken;
      } else if (isRealToken(rawHeaderToken)) {
        grantToken = rawHeaderToken;
      } else {
        grantToken = rawBodyToken || rawHeaderToken;
      }

      console.log(`[walletController.bet] Apuesta recibida. Token: ${grantToken ? grantToken.slice(0, 10) + '...' : 'ninguno'}`);

      const {
        roundId,
        numberGuess,
        walletAddress,
        pointer,
        assetCode = 'USD',
        assetScale = 2,
        nativeAmount,
        amountUSD = 0.10,
        remainingAmount = 100,
      } = req.body;

      const effectivePointer = pointer || walletAddress;
      if (!effectivePointer || numberGuess === undefined) {
        return res.status(400).json({
          error: 'Campos requeridos faltantes: pointer/walletAddress, numberGuess',
        });
      }

      // 1. Validar y registrar la apuesta en el motor del juego
      const betRecord = gameEngine.placeBet({
        pointer: effectivePointer,
        numberGuess,
        assetCode,
        assetScale,
        nativeAmount,
        amountUSD,
      });

      // 2. Ejecutar micro-pago ILP vía Open Payments
      const paymentResult = await openPaymentsService.executeBetPayment({
        roundId: roundId || betRecord.roundId,
        numberGuess,
        walletAddress: effectivePointer,
        assetCode,
        assetScale,
        nativeAmount: Number(nativeAmount || 0.10),
        amountUSD: Number(amountUSD),
        grantToken,
        remainingAmount: Number(remainingAmount),
      });

      return res.json({
        success: true,
        transaction: paymentResult.transaction,
        remainingAmount: paymentResult.remainingAmount,
        bet: betRecord,
      });
    } catch (err) {
      console.error('[walletController.bet] Error:', err);
      return res.status(400).json({ error: err.message || 'Error al procesar micro-pago de apuesta' });
    }
  },
};

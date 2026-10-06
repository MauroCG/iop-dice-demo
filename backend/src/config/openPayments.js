import fs from 'fs/promises';
import {
  createAuthenticatedClient,
  createUnauthenticatedClient,
} from '@interledger/open-payments';
import { ENV } from './env.js';

let opClient = null;
let isLive = false;

/**
 * Initializes the Open Payments client singleton.
 * Uses real Rafiki testnet credentials if provided; otherwise falls back to unauthenticated client + mock execution.
 */
export async function initOpenPaymentsClient() {
  if (opClient) return { client: opClient, isLive };

  try {
    let privateKeyContent = null;
    if (ENV.PRIVATE_KEY_PATH) {
      try {
        privateKeyContent = await fs.readFile(ENV.PRIVATE_KEY_PATH, 'utf8');
      } catch (err) {
        console.warn(`[OpenPayments] Archivo de clave privada no encontrado en ${ENV.PRIVATE_KEY_PATH}: ${err.message}`);
      }
    }

    if (ENV.KEY_ID && privateKeyContent && ENV.HOUSE_WALLET_ADDRESS) {
      opClient = await createAuthenticatedClient({
        walletAddressUrl: ENV.HOUSE_WALLET_ADDRESS,
        keyId: ENV.KEY_ID,
        privateKey: privateKeyContent,
      });
      isLive = true;
      console.log(`[OpenPayments] Cliente AUTENTICADO inicializado con éxito para ${ENV.HOUSE_WALLET_ADDRESS}`);
    } else {
      // Fallback a cliente no autenticado para resolución pública de walletAddresses
      opClient = await createUnauthenticatedClient({});
      isLive = false;
      console.log(
        '[OpenPayments] Modo Transicional / Simulado activo (Clave privada o KEY_ID pendientes en .env). Resolución pública de billeteras activa.'
      );
    }
  } catch (error) {
    console.error('[OpenPayments] Error al inicializar cliente Open Payments:', error);
    opClient = await createUnauthenticatedClient({}).catch(() => null);
    isLive = false;
  }

  return { client: opClient, isLive };
}

export function getOpenPaymentsClient() {
  return opClient;
}

export function isOpenPaymentsLive() {
  return isLive;
}

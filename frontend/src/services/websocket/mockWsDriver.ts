import type { PlayerBet } from '../../schemas/game.schema';
import { convertUSDToNative } from '../../utils/formatters';

const MOCK_MULTI_CURRENCY_PEERS = [
  { name: 'Carlos_COP', pointer: '$ilp.bancolombia.co/carlos', assetCode: 'COP', assetScale: 0 },
  { name: 'Eva_EUR', pointer: '$gatehub.net/eva', assetCode: 'EUR', assetScale: 2 },
  { name: 'Liam_GBP', pointer: '$fynbos.dev/liam', assetCode: 'GBP', assetScale: 2 },
  { name: 'Diego_MXN', pointer: '$bitso.com/diego', assetCode: 'MXN', assetScale: 2 },
  { name: 'Alice_USD', pointer: '$rafiki.money/alice', assetCode: 'USD', assetScale: 2 },
  { name: 'Valeria_COP', pointer: '$fynbos.dev/valeria_cop', assetCode: 'COP', assetScale: 0 },
];

export function generateRandomPeerBet(roundId: string): PlayerBet {
  const peer =
    MOCK_MULTI_CURRENCY_PEERS[
      Math.floor(Math.random() * MOCK_MULTI_CURRENCY_PEERS.length)
    ];

  // Weighted numbers distribution (7 is most common sum)
  const numbersPool = [
    2, 3, 3, 4, 4, 4, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7,
    8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10,
    11, 11, 12,
  ];
  const chosenNumber = numbersPool[Math.floor(Math.random() * numbersPool.length)];

  // Convert 10 cents USD to peer's native currency
  const nativeAmount = convertUSDToNative(0.10, peer.assetCode, peer.assetScale);

  return {
    id: `bet_peer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    roundId,
    playerId: peer.name,
    playerName: peer.name,
    paymentPointer: peer.pointer,
    assetCode: peer.assetCode,
    assetScale: peer.assetScale,
    nativeAmount,
    numberGuess: chosenNumber,
    amountUSD: 0.10,
    isLocalPlayer: false,
    timestamp: Date.now(),
  };
}

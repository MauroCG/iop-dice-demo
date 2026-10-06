import type { PlayerBet } from '../../schemas/game.schema';

const MOCK_PEERS = [
  { name: 'Carlos_MX', pointer: '$rafiki.money/carlos' },
  { name: 'Valeria_ILP', pointer: '$fynbos.dev/valeria' },
  { name: 'Satoshi_LATAM', pointer: '$gatehub.net/satoshi' },
  { name: 'Lucia_Crypto', pointer: '$interledger.org/lucia' },
  { name: 'Mateo_Fintech', pointer: '$chimoney.io/mateo' },
  { name: 'Camila_Pay', pointer: '$wallet.interledger-test/camila' },
];

export function generateRandomPeerBet(roundId: string): PlayerBet {
  const peer = MOCK_PEERS[Math.floor(Math.random() * MOCK_PEERS.length)];
  // Realistic dice sum distribution weights (7 is most common, 2/12 rarest)
  const numbersPool = [
    2, 3, 3, 4, 4, 4, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7,
    8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10,
    11, 11, 12
  ];
  const chosenNumber = numbersPool[Math.floor(Math.random() * numbersPool.length)];

  return {
    id: `bet_peer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    roundId,
    playerId: peer.name,
    playerName: peer.name,
    paymentPointer: peer.pointer,
    numberGuess: chosenNumber,
    amountUSD: 0.10,
    isLocalPlayer: false,
    timestamp: Date.now(),
  };
}

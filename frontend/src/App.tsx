import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { WalletProvider, useWallet } from './context/WalletContext';
import { GameProvider } from './context/GameContext';
import { Header } from './features/layout/Header';
import { Footer } from './features/layout/Footer';
import { GameArena } from './features/game/components/GameArena';
import { LobbyEntryScreen } from './features/wallet/LobbyEntryScreen';

const MainContent: React.FC = () => {
  const { isInRoom } = useWallet();

  return (
    <div className="flex-1">
      {isInRoom ? <GameArena /> : <LobbyEntryScreen />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <WalletProvider>
        <GameProvider>
          <div className="min-h-screen flex flex-col bg-dark-base text-slate-100 cyber-grid">
            <Header />
            <MainContent />
            <Footer />
          </div>
        </GameProvider>
      </WalletProvider>
    </ToastProvider>
  );
};

export default App;

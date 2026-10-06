import React from 'react';
import { DiceContainer } from './DiceContainer';
import { GameCountdown } from './GameCountdown';
import { PrizeBanner } from './PrizeBanner';
import { PlayerPoolList } from './PlayerPoolList';
import { NumberGridSelector } from './NumberGridSelector';
import { BettingForm } from './BettingForm';
import { HouseDisclaimerBanner } from './HouseDisclaimerBanner';
import { RecentRoundsBar } from './RecentRoundsBar';
import { RoundOutcomeModal } from './RoundOutcomeModal';
import { WalletConnectModal } from '../../wallet/WalletConnectModal';
import { TransactionHistoryModal } from '../../wallet/TransactionHistoryModal';

export const GameArena: React.FC = () => {
  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col gap-3.5">
      {/* 1. Historical Rounds Ticker */}
      <RecentRoundsBar />

      {/* 2. Top Arena Grid: 3D Dice (Left) + 30s Countdown Timer (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        <div className="md:col-span-8 flex flex-col">
          <DiceContainer />
        </div>
        <div className="md:col-span-4 flex flex-col">
          <GameCountdown />
        </div>
      </div>

      {/* 3. Core Action Center: PRIZE BANNER + NUMBERS 2-12 + BET BUTTON directly under the prize! */}
      <section className="flex flex-col gap-3.5 p-4 sm:p-5 bg-dark-surface/90 border border-slate-800 rounded-3xl backdrop-blur-md shadow-xl border-t border-t-neon-cyan/30 shadow-glow-cyan/5">
        {/* The Prize Banner */}
        <PrizeBanner />

        {/* Options 2 - 12 directly under the prize */}
        <NumberGridSelector />

        {/* Betting Button */}
        <BettingForm />
      </section>

      {/* 4. Bottom Row: Active Players (Left) + House Rules & Disclaimer (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <div className="md:col-span-6 flex flex-col">
          <PlayerPoolList />
        </div>
        <div className="md:col-span-6 flex flex-col">
          <HouseDisclaimerBanner />
        </div>
      </div>

      {/* Global Application Modals */}
      <RoundOutcomeModal />
      <WalletConnectModal />
      <TransactionHistoryModal />
    </main>
  );
};

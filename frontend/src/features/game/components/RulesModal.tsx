import React from 'react';
import { ShieldCheck, Clock, Coins, TrendingUp, HelpCircle } from 'lucide-react';
import { Modal } from '../../../components/shared/Modal';
import { Button } from '../../../components/shared/Button';
import { VALID_DICE_NUMBERS, DICE_ODDS_TABLE } from '../../../constants/game';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reglas del Juego & Premios"
      subtitle="Todo lo que necesitas saber antes de ingresar a la mesa de dados"
      maxWidth="lg"
    >
      <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-1 pt-1 text-xs">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800 flex items-start gap-3">
            <Clock className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100 text-xs">Rondas de 30 Segundos</h4>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Tienes 30 segundos para elegir un número del 2 al 12. Al llegar a 0s, los dados 3D se lanzan en vivo.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800 flex items-start gap-3">
            <Coins className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100 text-xs">Apuesta Fija de $0.10 USD</h4>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Cada apuesta descuenta automáticamente $0.10 USD de tu permiso ILP. Máximo 1 predicción por ronda.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100 text-xs">Reparto de Pozo (10% Casa)</h4>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                La casa retiene una comisión del 10% del pozo total. El 90% restante se reparte entre los ganadores.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-base/80 border border-slate-800 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100 text-xs">Pozo Acumulado (Jackpot)</h4>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Si nadie acierta el número en la ronda, el 100% del pozo pasa intacto a la siguiente ronda.
              </p>
            </div>
          </div>
        </div>

        {/* Abandoned Room Disclaimer Box */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col gap-1">
          <span className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Cláusula de Sala Abandonada
          </span>
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            Si en una ronda nadie gana y todos los jugadores abandonan la sala, el pozo acumulado queda en posesión de la casa.
          </p>
        </div>

        {/* Odds & Probability Table */}
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-neon-cyan" /> Probabilidades de Suma de 2 Dados
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VALID_DICE_NUMBERS.map((num) => {
              const item = DICE_ODDS_TABLE[num];
              return (
                <div
                  key={num}
                  className="p-2 rounded-xl bg-dark-base border border-slate-800 flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-slate-100">
                    Suma {num}
                  </span>
                  <span className="font-mono text-neon-cyan text-[11px]">
                    {item.probabilityPercent}% ({item.combinations}/36)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          variant="neon"
          size="md"
          onClick={onClose}
          className="w-full mt-2"
        >
          Entendido
        </Button>
      </div>
    </Modal>
  );
};

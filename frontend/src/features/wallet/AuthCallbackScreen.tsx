import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../context/ToastContext';
import { walletApi } from '../../services/api/walletApi';
import { Button } from '../../components/shared/Button';

export const AuthCallbackScreen: React.FC = () => {
  const { finalizeInteractiveGrant, leaveRoom } = useWallet();
  const { addToast } = useToast();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasExecutedRef = React.useRef(false);

  useEffect(() => {
    async function handleAuthCallback() {
      if (hasExecutedRef.current) return;
      hasExecutedRef.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const interactRef = urlParams.get('interact_ref');
        const error = urlParams.get('error');

        if (error) {
          throw new Error('La autorización fue denegada o cancelada en Rafiki Test Wallet');
        }

        if (!interactRef) {
          throw new Error('No se encontró la referencia de interacción (interact_ref) en la URL');
        }

        const pendingRaw =
          sessionStorage.getItem('pending_gnap_grant') ||
          localStorage.getItem('pending_gnap_grant');

        if (!pendingRaw) {
          throw new Error('No se encontraron datos de permiso pendiente en la sesión local');
        }

        // Consumir inmediatamente de storage para evitar ejecuciones concurrentes
        sessionStorage.removeItem('pending_gnap_grant');
        localStorage.removeItem('pending_gnap_grant');

        const pending = JSON.parse(pendingRaw);

        // Llamar a /api/wallet/grant/continue en el backend
        const finalizedSession = await walletApi.continueGrant({
          interactRef,
          continueUri: pending.continueUri,
          continueToken: pending.continueToken,
          walletAddress: pending.walletAddress,
          totalAmount: pending.totalAmount,
          assetCode: pending.assetCode,
          assetScale: pending.assetScale,
        });

        if (finalizedSession?.accessToken) {
          localStorage.setItem('ilp_grant_token', finalizedSession.accessToken);
          localStorage.setItem('ilp_access_token', finalizedSession.accessToken);
        }

        window.history.replaceState(null, '', '/');
        setStatus('success');

        setTimeout(() => {
          finalizeInteractiveGrant(finalizedSession);
        }, 800);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al procesar la autorización interactiva';
        setStatus('error');
        setErrorMessage(msg);
        addToast(msg, 'error', 'Error de Autorización');
      }
    }

    handleAuthCallback();
  }, [finalizeInteractiveGrant, addToast]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-surface/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center flex flex-col items-center gap-6">
        {status === 'verifying' && (
          <>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-neon-cyan/20 border-t-neon-cyan animate-spin flex items-center justify-center" />
              <Loader2 className="w-8 h-8 text-neon-cyan animate-spin absolute top-4 left-4" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                Verificando en Interledger Rafiki
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Confirmando tu permiso de gasto con el servidor de autorización GNAP...
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-glow-cyan animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                ¡Autorización Aprobada!
              </h2>
              <p className="text-xs text-emerald-300">
                Token de micro-pagos emitido con éxito. Ingresando a la mesa de dados...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                No se pudo completar la autorización
              </h2>
              <p className="text-xs text-rose-300/90 max-w-xs mx-auto leading-relaxed">
                {errorMessage || 'Ocurrió un error al contactar al servidor de Rafiki'}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                sessionStorage.removeItem('pending_gnap_grant');
                window.history.replaceState(null, '', '/');
                leaveRoom();
                window.location.href = '/';
              }}
              className="mt-2"
            >
              Volver al Lobby <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

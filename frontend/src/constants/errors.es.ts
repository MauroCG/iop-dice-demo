export const ERROR_MESSAGES_ES = {
  INVALID_POINTER: 'El puntero de pago no tiene un formato válido (ej. $ilp.ejemplo/usuario).',
  INSUFFICIENT_GRANT_BALANCE: 'Saldo insuficiente en tu permiso. Por favor autoriza un nuevo monto.',
  GRANT_EXPIRED: 'El permiso de micro-pagos ha expirado.',
  ROUND_NOT_ACCEPTING_BETS: 'La ronda ya no está aceptando apuestas en este momento.',
  ALREADY_BET_IN_ROUND: 'Ya registraste una predicción para esta ronda (máximo 1 apuesta por ronda).',
  NETWORK_ERROR: 'Error de conexión al procesar el micro-pago. Intenta nuevamente.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor intenta más tarde.',
} as const;

export type AppErrorCode = keyof typeof ERROR_MESSAGES_ES;

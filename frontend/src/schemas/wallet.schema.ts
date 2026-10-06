import { z } from 'zod';

export const paymentPointerRegex = /^\$[a-zA-Z0-9.-]+(\/[a-zA-Z0-9._~-]+)*$/;

export const paymentPointerSchema = z
  .string()
  .trim()
  .min(3, 'El puntero de pago debe tener al menos 3 caracteres')
  .regex(
    paymentPointerRegex,
    'Formato de Puntero de Pago inválido (ejemplo: $ilp.ejemplo/usuario)'
  );

export const grantRequestSchema = z.object({
  pointer: paymentPointerSchema,
  amountUSD: z
    .number()
    .positive('El monto del permiso debe ser mayor a $0')
    .min(1.0, 'El permiso mínimo es de $1.00 USD')
    .max(100.0, 'El permiso máximo en modo de prueba es de $100.00 USD'),
});

export const microPaymentSchema = z.object({
  grantId: z.string().min(1, 'ID de permiso inválido'),
  roundId: z.string().min(1, 'ID de ronda requerido'),
  amountUSD: z.number().refine((val) => val === 0.10, {
    message: 'La micro-apuesta es fija de $0.10 USD',
  }),
  memo: z.string().optional(),
});

export type GrantRequestInput = z.infer<typeof grantRequestSchema>;
export type MicroPaymentInput = z.infer<typeof microPaymentSchema>;

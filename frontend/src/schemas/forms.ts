import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome (mínimo 2 caracteres).')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  email: z
    .string()
    .trim()
    .max(255, 'O e-mail deve ter no máximo 255 caracteres.')
    .pipe(z.email('Informe um e-mail válido.')),
});

export const orderSearchSchema = z.object({
  email: z.string().trim().pipe(z.email('Informe um e-mail válido.')),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z
    .string()
    .trim()
    .min(5, 'A descrição deve ter pelo menos 5 caracteres.'),
  price: z.number().positive('O preço deve ser maior que zero.'),
  stock: z
    .number()
    .int('O estoque deve ser um número inteiro.')
    .min(0, 'O estoque não pode ser negativo.'),
  isActive: z.number().int().min(0).max(1),
  imageUrl: z.union([z.url('Informe uma URL válida.'), z.literal('')]),
  scene: z.enum(['ceramic', 'linen', 'stone', 'honey']).optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type OrderSearchFormValues = z.infer<typeof orderSearchSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;

import z from "zod";

export const storedCheckoutSchema = z.object({
  result: z.object({
    orderId: z.string(),
    items: z.array(
      z.object({
        productId: z.number(),
        sessionId: z.number().optional(),
        type: z.enum(['physical', 'workshop']),
        name: z.string(),
        unitPriceCents: z.number().int().nonnegative(),
        quantity: z.number(),
        subTotalCents: z.number().int().nonnegative(),
        startsAt: z.string().optional(),
        durationMinutes: z.number().optional(),
        location: z.string().optional(),
      }),
    ),
    totalCents: z.number().int().nonnegative(),
    emailSent: z.boolean(),
  }),
  customer: z.object({
    name: z.string(),
    email: z.string(),
  }),
});
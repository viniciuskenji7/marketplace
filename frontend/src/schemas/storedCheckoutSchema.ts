import z from "zod";

export const storedCheckoutSchema = z.object({
  result: z.object({
    orderId: z.string(),
    items: z.array(
      z.object({
        productId: z.number(),
        name: z.string(),
        unitPriceCents: z.number().int().nonnegative(),
        quantity: z.number(),
        subTotalCents: z.number().int().nonnegative(),
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
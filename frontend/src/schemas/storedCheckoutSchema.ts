import z from "zod";

export const storedCheckoutSchema = z.object({
  result: z.object({
    orderId: z.string(),
    items: z.array(
      z.object({
        productId: z.number(),
        name: z.string(),
        unitPriceCents: z.number(),
        quantity: z.number(),
        subTotalCents: z.number(),
      }),
    ),
    totalCents: z.number(),
    emailSent: z.boolean(),
  }),
  customer: z.object({
    name: z.string(),
    email: z.string(),
  }),
});
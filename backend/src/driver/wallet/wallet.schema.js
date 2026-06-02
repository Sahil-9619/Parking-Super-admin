import { z } from "zod";

export const topUpOrderSchema = z.object({
  body: z.object({
    amount: z
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be positive")
      .max(100000, "Amount exceeds per-transaction limit"),
  }),
});

export const topUpVerifySchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "orderId is required"),
    paymentId: z.string().min(1, "paymentId is required"),
    signature: z.string().min(1, "signature is required"),
  }),
});

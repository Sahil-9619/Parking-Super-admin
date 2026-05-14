import { z } from "zod";

export const updateOwnerProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    ownerType: z.enum(["home", "society", "commercial", "govt", "municipality"]).optional(),
    gstNumber: z.string().optional(),
  }),
});

export const updateBankDetailsSchema = z.object({
  body: z.object({
    bankAccount: z.string().min(6, "Bank account number must be valid"),
    bankIfsc: z.string().length(11, "IFSC code must be exactly 11 characters"),
    accountHolderName: z.string().min(1, "Account holder name is required"),
  }),
});

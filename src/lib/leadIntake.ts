import { z } from "zod";

export const leadContactSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(120, "Name must be 120 characters or fewer"),
  email: z
    .string()
    .trim()
    .max(255, "Email must be 255 characters or fewer")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || ""),
  companyName: z
    .string()
    .trim()
    .max(160, "Company name must be 160 characters or fewer")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || ""),
  message: z.string().trim().min(1, "Message is required").max(4000, "Message must be 4000 characters or fewer"),
  source: z.string().trim().max(80).default("contact_page"),
}).superRefine((value, ctx) => {
  if (!value.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Email is required",
    });
    return;
  }

  const emailResult = z.string().email("Enter a valid email address").safeParse(value.email);
  if (!emailResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Enter a valid email address",
    });
  }
});

export type LeadContactInput = z.infer<typeof leadContactSchema>;

export const leadStatusOptions = ["new", "qualified", "contacted", "won", "archived"] as const;
export type LeadStatus = (typeof leadStatusOptions)[number];

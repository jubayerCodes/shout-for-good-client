import { z } from "zod";

// Step 1: Donation
export const donationSchema = z.object({
  amount: z.union([z.literal(10), z.literal(50), z.literal(100), z.number().min(2, "Minimum donation is $2").max(200000, "Maximum donation is $200,000")]),
  customAmount: z.string().optional(),
  frequency: z.enum(["one-time", "fortnightly", "monthly"], {
    message: "Please select a frequency",
  }),
});

// Step 2: Dedication (all optional since step can be skipped)
export const dedicationSchema = z.object({
  honoreeFirstName: z.string().min(1, "First name is required"),
  honoreeLastName: z.string().min(1, "Last name is required"),
  notifySomeone: z.boolean(),
  notifyFirstName: z.string().optional(),
  notifyLastName: z.string().optional(),
  notifyEmail: z.string().optional(),
  message: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.notifySomeone) {
    if (!data.notifyFirstName || data.notifyFirstName.length === 0) {
      ctx.addIssue({ code: "custom", message: "First name is required", path: ["notifyFirstName"] });
    }
    if (!data.notifyLastName || data.notifyLastName.length === 0) {
      ctx.addIssue({ code: "custom", message: "Last name is required", path: ["notifyLastName"] });
    }
    if (!data.notifyEmail || data.notifyEmail.length === 0) {
      ctx.addIssue({ code: "custom", message: "Email is required", path: ["notifyEmail"] });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.notifyEmail)) {
      ctx.addIssue({ code: "custom", message: "Invalid email address", path: ["notifyEmail"] });
    }
  }
});

// Step 3: Payment
export const paymentSchema = z.object({
  paymentMethod: z.enum(["google-pay", "credit-card", "paypal"], {
    message: "Please select a payment method",
  }),
  companyName: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  countryCode: z.string(),
  phone: z.string().optional(),
  issueReceipt: z.boolean(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCcv: z.string().optional(),
  getUpdates: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "credit-card") {
    if (!data.cardNumber || data.cardNumber.length === 0) {
      ctx.addIssue({ code: "custom", message: "Card number is required", path: ["cardNumber"] });
    }
    if (!data.cardExpiry || data.cardExpiry.length === 0) {
      ctx.addIssue({ code: "custom", message: "Expiry is required", path: ["cardExpiry"] });
    }
    if (!data.cardCcv || data.cardCcv.length === 0) {
      ctx.addIssue({ code: "custom", message: "CCV is required", path: ["cardCcv"] });
    }
  }
});

export type DonationFormData = z.infer<typeof donationSchema>;
export type DedicationFormData = z.infer<typeof dedicationSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;

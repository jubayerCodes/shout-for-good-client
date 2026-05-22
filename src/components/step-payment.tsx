"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Loader2 } from "lucide-react";
import type { DonationData } from "./step-donation";

const paymentSchema = z.object({
  companyName: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  countryCode: z.string(),
  phone: z.string().optional(),
  issueReceipt: z.boolean(),
  getUpdates: z.boolean(),
});

export type PaymentData = z.infer<typeof paymentSchema>;

interface StepPaymentProps {
  defaultValues?: Partial<PaymentData>;
  donationData: DonationData;
  onSubmit: (data: PaymentData) => void;
  isProcessing?: boolean;
  paymentError?: string | null;
}

export default function StepPayment({
  defaultValues,
  donationData,
  onSubmit,
  isProcessing = false,
  paymentError,
}: StepPaymentProps) {
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      companyName: defaultValues?.companyName || "",
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      email: defaultValues?.email || "",
      countryCode: defaultValues?.countryCode || "+61",
      phone: defaultValues?.phone || "",
      issueReceipt: defaultValues?.issueReceipt ?? true,
      getUpdates: defaultValues?.getUpdates || false,
    },
  });

  const issueReceipt = watch("issueReceipt");
  const getUpdates = watch("getUpdates");

  const getAmount = (): number => {
    if (donationData.presetAmount === "custom") {
      return parseFloat(donationData.customAmount || "0");
    }
    return parseInt(donationData.presetAmount, 10);
  };

  const amount = getAmount();
  const frequencyLabel =
    donationData.frequency === "one-time"
      ? "One time donation"
      : donationData.frequency === "fortnightly"
      ? "Fortnightly donation"
      : "Monthly donation";

  const onFormSubmit = (data: PaymentData) => {
    if (!cardComplete) {
      setCardError("Please enter your card details");
      return;
    }
    setCardError(null);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Payment Method — Credit Card only */}
      <div className="flex items-center gap-2 rounded-lg border-2 border-teal-600 bg-teal-50 px-4 py-3">
        <CreditCard className="h-4 w-4 text-teal-700" />
        <span className="text-sm font-medium text-teal-700">Credit Card</span>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700">Payment details</p>

        {/* Company Name */}
        <div className="space-y-1.5">
          <Input
            placeholder="Company Name (Optional)"
            {...register("companyName")}
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Input
              placeholder="First Name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Input
              placeholder="Last Name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Input
            type="email"
            placeholder="Email Address"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex gap-2">
          <select
            {...register("countryCode")}
            className="w-20 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="+61">+61</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+91">+91</option>
            <option value="+880">+880</option>
          </select>
          <Input
            placeholder="Phone No. (Optional)"
            {...register("phone")}
            className="flex-1"
          />
        </div>
      </div>

      {/* Issue Receipt Checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="issueReceipt"
          checked={issueReceipt}
          onCheckedChange={(checked) =>
            setValue("issueReceipt", checked === true)
          }
          className="mt-0.5"
        />
        <Label htmlFor="issueReceipt" className="text-sm cursor-pointer leading-snug">
          Issue receipt in my name and details entered above
        </Label>
      </div>

      {/* Stripe Card Element */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Card details</p>
        <div className="rounded-md border border-gray-300 px-3 py-3 bg-white focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#374151",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                },
                invalid: {
                  color: "#ef4444",
                  iconColor: "#ef4444",
                },
              },
              hidePostalCode: true,
            }}
            onChange={(event) => {
              setCardComplete(event.complete);
              if (event.error) {
                setCardError(event.error.message);
              } else {
                setCardError(null);
              }
            }}
          />
        </div>
        {cardError && (
          <p className="text-xs text-red-500">{cardError}</p>
        )}
      </div>

      {/* Additional Information */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500">Additional Information</p>
        <div className="flex items-start gap-2">
          <Checkbox
            id="getUpdates"
            checked={getUpdates}
            onCheckedChange={(checked) =>
              setValue("getUpdates", checked === true)
            }
            className="mt-0.5"
          />
          <Label htmlFor="getUpdates" className="text-xs cursor-pointer text-gray-500 leading-snug">
            Get updates from Princes Court Ltd – you can opt out at any time
          </Label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm font-bold text-gray-900">
          <span>Description</span>
          <span>Amount</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{frequencyLabel}</span>
          <span>${amount.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900">
            <span>Total</span>
            <span>AUD ${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800 flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">⚠</span>
          Please note this transaction is processed by Shout For Good which will appear
          as the merchant on your statement.
        </p>
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700">{paymentError}</p>
        </div>
      )}

      {/* Terms */}
      <p className="text-[10px] text-gray-400 leading-relaxed">
        By completing your payment, you are agreeing to the{" "}
        <a href="#" className="text-teal-600 hover:underline">Terms</a> and{" "}
        <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>.
        This site is protected by Cloudflare and the Cloudflare{" "}
        <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a> and{" "}
        <a href="#" className="text-teal-600 hover:underline">Terms of Service</a> apply.
      </p>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={isProcessing}
        className="w-full uppercase font-bold tracking-wide text-base py-6"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : (
          "Donate Now"
        )}
      </Button>
    </form>
  );
}

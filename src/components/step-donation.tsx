"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Schema is dynamic — built from config
function buildDonationSchema(
  amountValues: string[],
  frequencyValues: string[]
) {
  return z
    .object({
      presetAmount: z.string(),
      customAmount: z.string().optional(),
      frequency: z.string({ message: "Please select a frequency" }),
    })
    .superRefine((data, ctx) => {
      // Validate presetAmount is one of the allowed values or "custom"
      if (data.presetAmount !== "custom" && !amountValues.includes(data.presetAmount)) {
        ctx.addIssue({
          code: "custom",
          message: "Please select a valid amount",
          path: ["presetAmount"],
        });
      }

      // Validate frequency
      if (!frequencyValues.includes(data.frequency)) {
        ctx.addIssue({
          code: "custom",
          message: "Please select a frequency",
          path: ["frequency"],
        });
      }

      if (data.presetAmount === "custom") {
        if (!data.customAmount || data.customAmount.trim() === "") {
          ctx.addIssue({
            code: "custom",
            message: "Please enter a custom amount",
            path: ["customAmount"],
          });
        } else {
          const num = parseFloat(data.customAmount);
          if (isNaN(num) || num < 2) {
            ctx.addIssue({
              code: "custom",
              message: "Minimum donation is $2",
              path: ["customAmount"],
            });
          } else if (num > 200000) {
            ctx.addIssue({
              code: "custom",
              message: "Maximum donation is $200,000",
              path: ["customAmount"],
            });
          }
        }
      }
    });
}

export type DonationData = {
  presetAmount: string;
  customAmount?: string;
  frequency: string;
};

export interface RecurringOption {
  interval: string;
  intervalCount: number;
  label: string;
}

interface StepDonationProps {
  defaultValues?: Partial<DonationData>;
  onSubmit: (data: DonationData) => void;
  donationAmounts: number[];
  recurringOptions: RecurringOption[];
}

export default function StepDonation({
  defaultValues,
  onSubmit,
  donationAmounts,
  recurringOptions,
}: StepDonationProps) {
  // Build dynamic preset options from config
  const presetOptions = donationAmounts.map((amt) => ({
    value: String(amt),
    label: `$${amt.toFixed(2)}`,
  }));

  // Build frequency options: always include "one-time" + config options
  const frequencyOptions: { value: string; label: string }[] = [
    { value: "one-time", label: "One time" },
    ...recurringOptions.map((opt) => ({
      value: `${opt.interval}-${opt.intervalCount}`,
      label: opt.label,
    })),
  ];

  const amountValues = presetOptions.map((o) => o.value);
  const frequencyValues = frequencyOptions.map((o) => o.value);

  const schema = buildDonationSchema(amountValues, frequencyValues);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DonationData>({
    resolver: zodResolver(schema),
    defaultValues: {
      presetAmount: defaultValues?.presetAmount || amountValues[0] || "10",
      customAmount: defaultValues?.customAmount || "",
      frequency: defaultValues?.frequency || "one-time",
    },
  });

  const selectedAmount = watch("presetAmount");
  const selectedFrequency = watch("frequency");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount Selection */}
      <div className="space-y-3">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(presetOptions.length, 4)}, 1fr)`,
          }}
        >
          {presetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue("presetAmount", option.value)}
              className={cn(
                "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                selectedAmount === option.value
                  ? "border-teal-600 bg-teal-50 text-teal-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="relative">
          <Input
            placeholder="Enter a custom amount"
            {...register("customAmount")}
            onFocus={() => setValue("presetAmount", "custom")}
            className={cn(
              selectedAmount === "custom" && "border-teal-600 ring-1 ring-teal-600"
            )}
          />
        </div>
        {errors.customAmount && (
          <p className="text-sm text-red-500">{errors.customAmount.message}</p>
        )}
      </div>

      {/* Frequency */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Would you like to make this recurring?
        </p>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(frequencyOptions.length, 4)}, 1fr)`,
          }}
        >
          {frequencyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue("frequency", option.value)}
              className={cn(
                "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                selectedFrequency === option.value
                  ? "border-teal-600 bg-teal-50 text-teal-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.frequency && (
          <p className="text-sm text-red-500">{errors.frequency.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="uppercase font-bold tracking-wide">
        Next Step
      </Button>
    </form>
  );
}

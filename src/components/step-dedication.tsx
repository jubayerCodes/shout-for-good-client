"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const dedicationSchema = z
  .object({
    honoreeFirstName: z.string().min(1, "First name is required"),
    honoreeLastName: z.string().min(1, "Last name is required"),
    notifySomeone: z.boolean(),
    notifyFirstName: z.string().optional(),
    notifyLastName: z.string().optional(),
    notifyEmail: z.string().optional(),
    message: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.notifySomeone) {
      if (!data.notifyFirstName || data.notifyFirstName.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "First name is required",
          path: ["notifyFirstName"],
        });
      }
      if (!data.notifyLastName || data.notifyLastName.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Last name is required",
          path: ["notifyLastName"],
        });
      }
      if (!data.notifyEmail || data.notifyEmail.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Email is required",
          path: ["notifyEmail"],
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.notifyEmail)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid email address",
          path: ["notifyEmail"],
        });
      }
    }
  });

export type DedicationData = z.infer<typeof dedicationSchema>;

interface StepDedicationProps {
  defaultValues?: Partial<DedicationData>;
  onSubmit: (data: DedicationData) => void;
  onSkip: () => void;
}

export default function StepDedication({
  defaultValues,
  onSubmit,
  onSkip,
}: StepDedicationProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DedicationData>({
    resolver: zodResolver(dedicationSchema),
    defaultValues: {
      honoreeFirstName: defaultValues?.honoreeFirstName || "",
      honoreeLastName: defaultValues?.honoreeLastName || "",
      notifySomeone: defaultValues?.notifySomeone || false,
      notifyFirstName: defaultValues?.notifyFirstName || "",
      notifyLastName: defaultValues?.notifyLastName || "",
      notifyEmail: defaultValues?.notifyEmail || "",
      message: defaultValues?.message || "",
    },
  });

  const notifySomeone = watch("notifySomeone");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-gray-500">
        Dedicate my donation in honor, memory, or support of someone.
      </p>

      {/* Honoree Name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="honoreeFirstName">First Name</Label>
          <Input
            id="honoreeFirstName"
            placeholder="First Name"
            {...register("honoreeFirstName")}
          />
          {errors.honoreeFirstName && (
            <p className="text-xs text-red-500">
              {errors.honoreeFirstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="honoreeLastName">Last Name</Label>
          <Input
            id="honoreeLastName"
            placeholder="Last Name"
            {...register("honoreeLastName")}
          />
          {errors.honoreeLastName && (
            <p className="text-xs text-red-500">
              {errors.honoreeLastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Notify Someone Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="notifySomeone"
          checked={notifySomeone}
          onCheckedChange={(checked) =>
            setValue("notifySomeone", checked === true)
          }
        />
        <Label
          htmlFor="notifySomeone"
          className="text-sm font-medium cursor-pointer"
        >
          Notify someone of my dedication
        </Label>
      </div>

      {/* Conditional Notify Fields */}
      {notifySomeone && (
        <div className="space-y-3 pl-0 border-l-2 border-teal-100 ml-0 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="notifyFirstName">First Name</Label>
              <Input
                id="notifyFirstName"
                placeholder="First Name"
                {...register("notifyFirstName")}
              />
              {errors.notifyFirstName && (
                <p className="text-xs text-red-500">
                  {errors.notifyFirstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notifyLastName">Last Name</Label>
              <Input
                id="notifyLastName"
                placeholder="Last Name"
                {...register("notifyLastName")}
              />
              {errors.notifyLastName && (
                <p className="text-xs text-red-500">
                  {errors.notifyLastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notifyEmail">Email Address</Label>
            <Input
              id="notifyEmail"
              type="email"
              placeholder="Email Address"
              {...register("notifyEmail")}
            />
            {errors.notifyEmail && (
              <p className="text-xs text-red-500">
                {errors.notifyEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write a personal message..."
              {...register("message")}
              className="min-h-[80px]"
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          size="lg"
          className="uppercase font-bold tracking-wide"
        >
          Next Step
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors"
        >
          Skip This Step
        </button>
      </div>
    </form>
  );
}

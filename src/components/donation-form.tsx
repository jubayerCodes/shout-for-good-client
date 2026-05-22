"use client";

import { useState, useCallback, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import {
  ChevronDown,
  Check,
  Pencil,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StepDonation, {
  type DonationData,
  type RecurringOption,
} from "./step-donation";
import StepDedication, { type DedicationData } from "./step-dedication";
import StepPayment, { type PaymentData } from "./step-payment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type StepId = 1 | 2 | 3;

interface StepConfig {
  id: StepId;
  title: string;
}

const steps: StepConfig[] = [
  { id: 1, title: "Make a donation" },
  { id: 2, title: "Dedication" },
  { id: 3, title: "Payment options" },
];

interface ServerConfig {
  donationAmounts: number[];
  recurringOptions: RecurringOption[];
}

export default function DonationForm() {
  const stripe = useStripe();
  const elements = useElements();

  // Config from server
  const [configLoading, setConfigLoading] = useState(true);
  const [donationAmounts, setDonationAmounts] = useState<number[]>([10, 50, 100]);
  const [recurringOptions, setRecurringOptions] = useState<RecurringOption[]>([
    { interval: "week", intervalCount: 2, label: "Fortnightly" },
    { interval: "month", intervalCount: 1, label: "Monthly" },
  ]);

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  const [donationData, setDonationData] = useState<DonationData | null>(null);
  const [dedicationData, setDedicationData] = useState<DedicationData | null>(
    null
  );
  const [dedicationSkipped, setDedicationSkipped] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastIssueReceipt, setLastIssueReceipt] = useState(true);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/config`);
        if (res.ok) {
          const data: ServerConfig = await res.json();
          if (data.donationAmounts?.length > 0) {
            setDonationAmounts(data.donationAmounts);
          }
          if (data.recurringOptions?.length > 0) {
            setRecurringOptions(data.recurringOptions);
          }
        }
      } catch {
        // Silently fall back to defaults
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  /**
   * Parse the frequency string from DonationData into server-friendly format.
   * "one-time" → { frequency: "one-time" }
   * "week-2" → { frequency: "fortnightly", interval: "week", intervalCount: 2 }
   * "month-1" → { frequency: "monthly", interval: "month", intervalCount: 1 }
   */
  const parseFrequency = useCallback(
    (freq: string) => {
      if (freq === "one-time") {
        return { frequency: "one-time", interval: null, intervalCount: null };
      }

      // Format is "interval-count" e.g. "week-2", "month-1"
      const parts = freq.split("-");
      const interval = parts[0];
      const intervalCount = parseInt(parts[1], 10);

      // Find label from config for display
      const option = recurringOptions.find(
        (o) => o.interval === interval && o.intervalCount === intervalCount
      );

      return {
        frequency: freq,
        interval,
        intervalCount,
        label: option?.label || freq,
      };
    },
    [recurringOptions]
  );

  const handleDonationSubmit = (data: DonationData) => {
    setDonationData(data);
    setCompletedSteps((prev) => new Set([...prev, 1]));
    setCurrentStep(2);
  };

  const handleDedicationSubmit = (data: DedicationData) => {
    setDedicationData(data);
    setDedicationSkipped(false);
    setCompletedSteps((prev) => new Set([...prev, 2]));
    setCurrentStep(3);
  };

  const handleDedicationSkip = () => {
    setDedicationData(null);
    setDedicationSkipped(true);
    setCompletedSteps((prev) => new Set([...prev, 2]));
    setCurrentStep(3);
  };

  const getAmountInCents = useCallback((): number => {
    if (!donationData) return 0;
    const dollars =
      donationData.presetAmount === "custom"
        ? parseFloat(donationData.customAmount || "0")
        : parseInt(donationData.presetAmount, 10);
    return Math.round(dollars * 100);
  }, [donationData]);

  const handlePaymentSubmit = async (paymentFormData: PaymentData) => {
    if (!stripe || !elements || !donationData) {
      setPaymentError("Payment system is not ready. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card element not found. Please refresh and try again.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const parsed = parseFrequency(donationData.frequency);

      // 1. Call server to create PaymentIntent or Subscription
      const response = await fetch(`${API_URL}/api/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: getAmountInCents(),
          currency: "aud",
          frequency: parsed.frequency,
          interval: parsed.interval,
          intervalCount: parsed.intervalCount,
          email: paymentFormData.email,
          firstName: paymentFormData.firstName,
          lastName: paymentFormData.lastName,
          companyName: paymentFormData.companyName || null,
          phone: paymentFormData.phone
            ? `${paymentFormData.countryCode}${paymentFormData.phone}`
            : null,
          issueReceipt: paymentFormData.issueReceipt,
          getUpdates: paymentFormData.getUpdates,
          dedication: dedicationSkipped
            ? null
            : dedicationData
            ? {
                honoreeFirstName: dedicationData.honoreeFirstName,
                honoreeLastName: dedicationData.honoreeLastName,
                notifySomeone: dedicationData.notifySomeone,
                notifyFirstName: dedicationData.notifyFirstName || null,
                notifyLastName: dedicationData.notifyLastName || null,
                notifyEmail: dedicationData.notifyEmail || null,
                message: dedicationData.message || null,
              }
            : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Server error (${response.status})`
        );
      }

      const { clientSecret, type } = await response.json();

      // 2. Confirm the payment with Stripe
      const confirmParams = {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${paymentFormData.firstName} ${paymentFormData.lastName}`,
            email: paymentFormData.email,
            phone: paymentFormData.phone
              ? `${paymentFormData.countryCode}${paymentFormData.phone}`
              : undefined,
          },
        },
      };

      let result;
      if (type === "subscription") {
        result = await stripe.confirmCardPayment(clientSecret, confirmParams);
      } else {
        result = await stripe.confirmCardPayment(clientSecret, confirmParams);
      }

      if (result.error) {
        throw new Error(
          result.error.message || "Payment failed. Please try again."
        );
      }

      // 3. Payment succeeded
      setLastIssueReceipt(paymentFormData.issueReceipt);
      setPaymentSuccess(true);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (stepId: StepId) => {
    setCurrentStep(stepId);
  };

  const getStepStatus = (stepId: StepId) => {
    if (stepId === currentStep) return "active";
    if (completedSteps.has(stepId)) return "completed";
    return "pending";
  };

  const getDonationSummary = () => {
    if (!donationData) return null;
    const amount =
      donationData.presetAmount === "custom"
        ? `$${parseFloat(donationData.customAmount || "0").toFixed(2)}`
        : `$${parseInt(donationData.presetAmount, 10).toFixed(2)}`;

    const parsed = parseFrequency(donationData.frequency);
    const freq =
      donationData.frequency === "one-time"
        ? "One time donation"
        : `${parsed.label} donation`;

    return { amount, freq };
  };

  const getDedicationSummary = () => {
    if (dedicationSkipped) return "No dedication";
    if (!dedicationData) return null;
    return `${dedicationData.honoreeFirstName} ${dedicationData.honoreeLastName}`;
  };

  // Loading config
  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-teal-600 animate-spin" />
      </div>
    );
  }

  // Success state
  if (paymentSuccess) {
    const summary = getDonationSummary();
    return (
      <div className="rounded-xl border border-teal-200 bg-white p-8 text-center shadow-lg shadow-teal-50 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Thank you for your donation!
        </h2>
        <p className="text-gray-600">
          Your {summary?.freq?.toLowerCase()} of{" "}
          <span className="font-semibold text-teal-700">{summary?.amount}</span>{" "}
          has been processed successfully.
        </p>
        {lastIssueReceipt && (
          <p className="text-sm text-gray-500">
            A receipt will be sent to your email address shortly.
          </p>
        )}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              setPaymentSuccess(false);
              setCurrentStep(1);
              setCompletedSteps(new Set());
              setDonationData(null);
              setDedicationData(null);
              setDedicationSkipped(false);
            }}
            className="text-sm text-teal-600 hover:underline underline-offset-4"
          >
            Make another donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const status = getStepStatus(step.id);

        return (
          <div
            key={step.id}
            className={cn(
              "rounded-xl border bg-white transition-all duration-300",
              status === "active"
                ? "border-teal-200 shadow-lg shadow-teal-50"
                : "border-gray-200 shadow-sm"
            )}
          >
            {/* Step Header */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-4",
                status === "completed" && "cursor-default"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all",
                    status === "active" && "bg-teal-600 text-white",
                    status === "completed" && "bg-teal-100 text-teal-700",
                    status === "pending" && "bg-gray-100 text-gray-400"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    step.id
                  )}
                </div>
                <h3
                  className={cn(
                    "text-base font-semibold",
                    status === "active" && "text-gray-900",
                    status === "completed" && "text-gray-700",
                    status === "pending" && "text-gray-400"
                  )}
                >
                  {step.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {status === "completed" && step.id === 1 && donationData && (
                  <span className="text-sm text-gray-500 mr-2">
                    {getDonationSummary()?.freq} —{" "}
                    {getDonationSummary()?.amount}
                  </span>
                )}
                {status === "completed" && step.id === 2 && (
                  <span className="text-sm text-gray-500 mr-2">
                    {getDedicationSummary()}
                  </span>
                )}

                {status === "completed" && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => handleEdit(step.id)}
                    className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                )}
                {status === "pending" && (
                  <ChevronDown className="h-4 w-4 text-gray-300" />
                )}
              </div>
            </div>

            {/* Step Content */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                status === "active"
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              )}
            >
              <div className="px-5 pb-5">
                {step.id === 1 && status === "active" && (
                  <StepDonation
                    defaultValues={donationData || undefined}
                    onSubmit={handleDonationSubmit}
                    donationAmounts={donationAmounts}
                    recurringOptions={recurringOptions}
                  />
                )}
                {step.id === 2 && status === "active" && (
                  <StepDedication
                    defaultValues={dedicationData || undefined}
                    onSubmit={handleDedicationSubmit}
                    onSkip={handleDedicationSkip}
                  />
                )}
                {step.id === 3 && status === "active" && donationData && (
                  <StepPayment
                    defaultValues={undefined}
                    donationData={donationData}
                    onSubmit={handlePaymentSubmit}
                    isProcessing={isProcessing}
                    paymentError={paymentError}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

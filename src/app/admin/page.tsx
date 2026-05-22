"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RecurringOption {
  interval: "week" | "month" | "year";
  intervalCount: number;
  label: string;
}

interface DonationConfig {
  _id: string;
  donationAmounts: number[];
  recurringOptions: RecurringOption[];
}

export default function AdminPage() {
  const [config, setConfig] = useState<DonationConfig | null>(null);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [recurringOptions, setRecurringOptions] = useState<RecurringOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/config`);
      if (!res.ok) throw new Error("Failed to fetch config");
      const data = await res.json();
      setConfig(data);
      setAmounts(data.donationAmounts);
      setRecurringOptions(data.recurringOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationAmounts: amounts.filter((a) => a > 0),
          recurringOptions,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to save");
      }
      const data = await res.json();
      setConfig(data);
      setAmounts(data.donationAmounts);
      setRecurringOptions(data.recurringOptions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Amount handlers
  const addAmount = () => setAmounts([...amounts, 0]);
  const removeAmount = (index: number) =>
    setAmounts(amounts.filter((_, i) => i !== index));
  const updateAmount = (index: number, value: number) => {
    const newAmounts = [...amounts];
    newAmounts[index] = value;
    setAmounts(newAmounts);
  };

  // Recurring option handlers
  const addRecurringOption = () =>
    setRecurringOptions([
      ...recurringOptions,
      { interval: "month", intervalCount: 1, label: "" },
    ]);
  const removeRecurringOption = (index: number) =>
    setRecurringOptions(recurringOptions.filter((_, i) => i !== index));
  const updateRecurringOption = (
    index: number,
    field: keyof RecurringOption,
    value: string | number
  ) => {
    const newOptions = [...recurringOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setRecurringOptions(newOptions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to form
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="text-lg font-bold text-gray-900">
              Donation Configuration
            </h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Donation Amounts */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Donation Amounts
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              These are the preset amounts shown as buttons on the donation form.
              Users can always enter a custom amount.
            </p>

            <div className="space-y-3">
              {amounts.map((amount, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <Input
                      type="number"
                      min={1}
                      value={amount || ""}
                      onChange={(e) =>
                        updateAmount(index, parseInt(e.target.value) || 0)
                      }
                      className="pl-7"
                      placeholder="Amount"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAmount(index)}
                    disabled={amounts.length <= 1}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAmount}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add amount
            </button>
          </div>
        </section>

        {/* Recurring Intervals */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Recurring Intervals
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Configure the recurring donation options. A &quot;One time&quot;
              option is always available by default.
            </p>

            <div className="space-y-4">
              {recurringOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {/* Label */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        Label
                      </label>
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          updateRecurringOption(index, "label", e.target.value)
                        }
                        placeholder="e.g. Monthly"
                      />
                    </div>

                    {/* Interval */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        Interval
                      </label>
                      <select
                        value={option.interval}
                        onChange={(e) =>
                          updateRecurringOption(
                            index,
                            "interval",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                    </div>

                    {/* Interval Count */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">
                        Every N intervals
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={option.intervalCount}
                        onChange={(e) =>
                          updateRecurringOption(
                            index,
                            "intervalCount",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecurringOption(index)}
                    className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRecurringOption}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add recurring option
            </button>
          </div>
        </section>

        {/* Preview */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Preview</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Amount buttons
              </p>
              <div className="flex flex-wrap gap-2">
                {amounts
                  .filter((a) => a > 0)
                  .map((amount, i) => (
                    <span
                      key={i}
                      className="rounded-lg border-2 border-teal-600 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700"
                    >
                      ${amount.toFixed(2)}
                    </span>
                  ))}
                <span className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 italic">
                  Custom
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Frequency buttons
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border-2 border-teal-600 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                  One time
                </span>
                {recurringOptions
                  .filter((o) => o.label)
                  .map((option, i) => (
                    <span
                      key={i}
                      className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      {option.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Config ID for debugging */}
        {config && (
          <p className="text-xs text-gray-400 text-center">
            Config ID: {config._id}
          </p>
        )}
      </main>
    </div>
  );
}

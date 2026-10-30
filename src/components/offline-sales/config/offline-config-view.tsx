"use client";

import { useState } from "react";
import { OfflineSalesConfig } from "@/types/offline-sales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Save,
  DollarSign,
  MapPin,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CONFIG: OfflineSalesConfig = {
  orders_enabled: true,
  order_code_prefix: "ORD-",
  allow_partial_payment: true,
  min_partial_percentage: 10,
  require_customer_phone: true,
  auto_delivered_on_full_payment: true,
  default_commission_rate: 4.5,
  monthly_target_amount: 150000,
  gps_tracking_required: true,
  geofence_radius_meters: 500,
  allow_offline_sync: true,
};

export function OfflineConfigView() {
  const [config, setConfig] = useState<OfflineSalesConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Offline sales configuration updated successfully");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            System & Operational Settings
          </h2>
          <p className="text-xs text-slate-500">
            Configure global rules, commission thresholds, and field sales validation parameters.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2 shadow-sm"
        >
          {isSaving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Rules & Codes */}
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
              Order Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Manage order code prefixes and ordering restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-900 dark:text-white">
                  Enable Offline Orders
                </Label>
                <p className="text-[11px] text-slate-400">
                  Allow field sales agents to submit orders via app
                </p>
              </div>
              <Switch
                checked={config.orders_enabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, orders_enabled: checked }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                Order Code Prefix
              </Label>
              <Input
                value={config.order_code_prefix}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    order_code_prefix: e.target.value,
                  }))
                }
                className="h-9 rounded-xl bg-slate-50 dark:bg-neutral-800/60 text-xs"
                placeholder="e.g. ORD-"
              />
              <p className="text-[11px] text-slate-400">
                Generated codes will follow format: {config.order_code_prefix}XXXXXXXX
              </p>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-900 dark:text-white">
                  Require Customer Phone
                </Label>
                <p className="text-[11px] text-slate-400">
                  Must provide valid mobile number for order confirmation
                </p>
              </div>
              <Switch
                checked={config.require_customer_phone}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    require_customer_phone: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-900 dark:text-white">
                  Auto-deliver on Full Payment
                </Label>
                <p className="text-[11px] text-slate-400">
                  Mark order status as Delivered when remaining balance is 0
                </p>
              </div>
              <Switch
                checked={config.auto_delivered_on_full_payment}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    auto_delivered_on_full_payment: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment & Credit Rules */}
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Payment & Partial Credit
            </CardTitle>
            <CardDescription className="text-xs">
              Govern credit limits, partial downpayments, and collections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-900 dark:text-white">
                  Allow Partial Payments
                </Label>
                <p className="text-[11px] text-slate-400">
                  Allow customers to pay a fraction upfront
                </p>
              </div>
              <Switch
                checked={config.allow_partial_payment}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    allow_partial_payment: checked,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                Minimum Downpayment (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={config.min_partial_percentage}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    min_partial_percentage: Number(e.target.value),
                  }))
                }
                className="h-9 rounded-xl bg-slate-50 dark:bg-neutral-800/60 text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Minimum % of order total required as upfront paid amount
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                Default Commission Rate (%)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={config.default_commission_rate}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    default_commission_rate: Number(e.target.value),
                  }))
                }
                className="h-9 rounded-xl bg-slate-50 dark:bg-neutral-800/60 text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Salesperson commission credited upon successful delivery
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attendance & Field Verification */}
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              Field Geofencing & GPS
            </CardTitle>
            <CardDescription className="text-xs">
              Verify salesperson physical attendance at assigned territories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-900 dark:text-white">
                  Mandatory GPS on Check-in
                </Label>
                <p className="text-[11px] text-slate-400">
                  Block check-in if device location cannot be verified
                </p>
              </div>
              <Switch
                checked={config.gps_tracking_required}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    gps_tracking_required: checked,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                Allowed Geofence Radius (meters)
              </Label>
              <Input
                type="number"
                min="50"
                max="5000"
                value={config.geofence_radius_meters}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    geofence_radius_meters: Number(e.target.value),
                  }))
                }
                className="h-9 rounded-xl bg-slate-50 dark:bg-neutral-800/60 text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Maximum distance from franchise or customer pin for check-in
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sync & Target Goals */}
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Targets & Offline Sync
            </CardTitle>
            <CardDescription className="text-xs">
              Set monthly agent quotas and mobile offline capability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                Default Monthly Target (Rs.)
              </Label>
              <Input
                type="number"
                value={config.monthly_target_amount}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    monthly_target_amount: Number(e.target.value),
                  }))
                }
                className="h-9 rounded-xl bg-slate-50 dark:bg-neutral-800/60 text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Baseline quota benchmark used for agent performance grading
              </p>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-slate-900 dark:text-white">
                  Allow Offline Device Sync
                </Label>
                <p className="text-[11px] text-slate-400">
                  Cache pending orders when network connection drops
                </p>
              </div>
              <Switch
                checked={config.allow_offline_sync}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    allow_offline_sync: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

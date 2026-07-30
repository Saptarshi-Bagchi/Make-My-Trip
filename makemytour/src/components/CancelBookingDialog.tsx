import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { CANCELLATION_REASONS, RefundCalculation } from "@/lib/refundPolicy";
import { useTheme } from "@/components/ThemeContext";

interface CancelBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalPrice: number;
    refund: RefundCalculation;
    onConfirm: (reason: string, refundAmount: number, refundPercentage: number) => void;
    isSubmitting?: boolean;
}

const CancelBookingDialog = ({
    open,
    onOpenChange,
    totalPrice,
    refund,
    onConfirm,
    isSubmitting = false,
}: CancelBookingDialogProps) => {
    const [reason, setReason] = useState("");
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const handleConfirm = () => {
        if (!reason) return;
        onConfirm(reason, refund.refundAmount, refund.refundPercentage);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-[440px] ${
                isDark
                    ? "border-[#2A3854] bg-[#121827] text-slate-100"
                    : "border-slate-200 bg-white text-slate-900"
            }`}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Cancel Booking
                    </DialogTitle>
                    <DialogDescription>
                        This action can't be undone. Review your refund details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className={`rounded-lg p-3 text-sm space-y-1.5 ${
                        isDark ? "bg-[#1A2234] text-slate-200" : "bg-gray-50 text-slate-900"
                    }`}>
                        <div className="flex justify-between">
                            <span className={isDark ? "text-slate-400" : "text-gray-600"}>Original amount</span>
                            <span className="font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={isDark ? "text-slate-400" : "text-gray-600"}>{refund.tierLabel}</span>
                            <span className="font-medium">{refund.refundPercentage}% refund</span>
                        </div>
                        <div className={`border-t pt-1.5 flex justify-between ${isDark ? "border-[#2A3854]" : "border-gray-200"}`}>
                            <span className="font-semibold">You'll receive</span>
                            <span className={isDark ? "font-semibold text-emerald-300" : "font-semibold text-green-700"}>
                                ₹{refund.refundAmount.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                            Reason for cancellation
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 ${
                                isDark
                                    ? "border-[#2A3854] bg-[#1A2234] text-slate-100"
                                    : "border-slate-300 bg-white text-slate-900"
                            }`}
                        >
                            <option value="" className={isDark ? "bg-[#1A2234] text-slate-300" : "bg-white text-slate-900"}>Select a reason...</option>
                            {CANCELLATION_REASONS.map((r) => (
                                <option key={r} value={r} className={isDark ? "bg-[#1A2234] text-slate-100" : "bg-white text-slate-900"}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className={`flex-1 ${isDark ? "border-[#2A3854] bg-transparent text-slate-200 hover:bg-[#1A2234]" : ""}`}
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Keep Booking
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleConfirm}
                            disabled={!reason || isSubmitting}
                        >
                            {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CancelBookingDialog;

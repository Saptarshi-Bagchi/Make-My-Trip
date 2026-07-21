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

    const handleConfirm = () => {
        if (!reason) return;
        onConfirm(reason, refund.refundAmount, refund.refundPercentage);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] bg-white">
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
                    <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Original amount</span>
                            <span className="font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">{refund.tierLabel}</span>
                            <span className="font-medium">{refund.refundPercentage}% refund</span>
                        </div>
                        <div className="border-t pt-1.5 flex justify-between">
                            <span className="font-semibold">You'll receive</span>
                            <span className="font-semibold text-green-700">
                                ₹{refund.refundAmount.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for cancellation
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        >
                            <option value="">Select a reason...</option>
                            {CANCELLATION_REASONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
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
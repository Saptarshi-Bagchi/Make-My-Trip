import React from "react";
import { Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { RefundStatus, RefundWithStatus } from "@/lib/refundTracker";

interface RefundStatusCardProps {
    refund: RefundWithStatus;
}

const STATUS_STYLES: Record<RefundStatus, { bg: string; text: string; icon: React.ElementType }> = {
    Pending: { bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
    Processing: { bg: "bg-blue-50", text: "text-blue-700", icon: RefreshCw },
    Completed: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const RefundStatusCard = ({ refund }: RefundStatusCardProps) => {
    const style = STATUS_STYLES[refund.status];
    const Icon = style.icon;

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="font-semibold">{refund.label}</h3>
                    <p className="text-xs text-gray-500">Cancelled on {formatDate(refund.canceledAt)}</p>
                </div>
                <span className="font-semibold text-green-700">
                    ₹{refund.refundAmount.toLocaleString("en-IN")}
                </span>
            </div>

            <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${style.bg}`}>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${style.text}`}>
                    <Icon className="w-4 h-4" />
                    {refund.status}
                </div>
                {refund.status !== "Completed" && (
                    <span className="text-xs text-gray-500">
                        Expected by {formatDate(refund.expectedCompletionDate)}
                    </span>
                )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Reason: {refund.reason} · {refund.refundPercentage}% refund
            </p>
        </div>
    );
};

export default RefundStatusCard;
import React from "react";
import { Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { RefundStatus, RefundWithStatus } from "@/lib/refundTracker";
import { useTheme } from "@/components/ThemeContext";

interface RefundStatusCardProps {
    refund: RefundWithStatus;
}

const STATUS_STYLES: Record<RefundStatus, { lightBg: string; darkBg: string; lightText: string; darkText: string; icon: React.ElementType }> = {
    Pending: { lightBg: "bg-amber-50", darkBg: "bg-amber-500/10", lightText: "text-amber-700", darkText: "text-amber-300", icon: Clock },
    Processing: { lightBg: "bg-indigo-50", darkBg: "bg-indigo-500/10", lightText: "text-indigo-700", darkText: "text-indigo-300", icon: RefreshCw },
    Completed: { lightBg: "bg-emerald-50", darkBg: "bg-emerald-500/10", lightText: "text-emerald-700", darkText: "text-emerald-300", icon: CheckCircle2 },
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const RefundStatusCard = ({ refund }: RefundStatusCardProps) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const style = STATUS_STYLES[refund.status];
    const Icon = style.icon;

    return (
        <div className={`rounded-xl border p-4 shadow-sm transition-colors ${
            isDark ? "border-[#2A3854] bg-[#121826]/90 text-slate-100" : "border-slate-200 bg-white/90 text-slate-900"
        }`}>
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="font-semibold">{refund.label}</h3>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cancelled on {formatDate(refund.canceledAt)}</p>
                </div>
                <span className={isDark ? "font-semibold text-emerald-300" : "font-semibold text-emerald-700"}>
                    ₹{refund.refundAmount.toLocaleString("en-IN")}
                </span>
            </div>

            <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? style.darkBg : style.lightBg}`}>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${isDark ? style.darkText : style.lightText}`}>
                    <Icon className="w-4 h-4" />
                    {refund.status}
                </div>
                {refund.status !== "Completed" && (
                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Expected by {formatDate(refund.expectedCompletionDate)}
                    </span>
                )}
            </div>

            <p className={`mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                isDark ? "bg-[#1A2234] text-slate-200" : "bg-slate-50 text-slate-600"
            }`}>
                Reason: {refund.reason} · {refund.refundPercentage}% refund
            </p>
        </div>
    );
};

export default RefundStatusCard;

import React, { useEffect, useState } from "react";
import { TrendingUp, Lock, Unlock, Clock } from "lucide-react";
import { EntityType, PriceBreakdown, PriceFreeze } from "@/lib/pricingEngine";
import PriceHistoryChart from "./PriceHistoryChart";
import { useTheme } from "@/components/ThemeContext";

interface DynamicPricingCardProps {
    type: EntityType;
    breakdown: PriceBreakdown;
    displayPrice: number;
    isFrozen: boolean;
    freeze: PriceFreeze | null;
    history: { date: string; price: number }[];
    onFreeze: () => void;
    onUnfreeze: () => void;
}

function formatCountdown(expiresAt: string, nowTick: number): string {
    const msLeft = new Date(expiresAt).getTime() - nowTick;
    if (msLeft <= 0) return "Expired";
    const hours = Math.floor(msLeft / (60 * 60 * 1000));
    const minutes = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m left`;
}

const DynamicPricingCard = ({
    type,
    breakdown,
    displayPrice,
    isFrozen,
    freeze,
    history,
    onFreeze,
    onUnfreeze,
}: DynamicPricingCardProps) => {
    const [nowTick, setNowTick] = useState(() => Date.now());
    const [showHistory, setShowHistory] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const timer = setInterval(() => setNowTick(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Theme responsive styles matching your design guidelines
    const cardStyles = isDark 
        ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" 
        : "bg-white border-gray-200 text-[#22322F]";

    const freezeBannerStyles = isDark
        ? "bg-[#162624] text-[#7FD1C4] border border-[#24413D]"
        : "bg-blue-50 text-blue-700";

    const reasonTagStyles = isDark
        ? "bg-amber-950/40 text-amber-400 border border-amber-900/50"
        : "bg-orange-50 text-orange-700";

    return (
        <div className={`rounded-xl p-4 border transition-all duration-300 ${cardStyles}`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-[#A7BFBA]" : "text-gray-700"}`}>
                    <TrendingUp className={`w-4 h-4 ${isDark ? "text-[#7FD1C4]" : "text-blue-600"}`} />
                    <span>Live Price</span>
                </div>
                <span className="text-xl font-bold font-display">
                    ₹ {displayPrice.toLocaleString("en-IN")}
                </span>
            </div>

            {isFrozen && freeze ? (
                <div className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 mb-2 ${freezeBannerStyles}`}>
                    <div className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Price locked at ₹{freeze.price.toLocaleString("en-IN")}</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatCountdown(freeze.expiresAt, nowTick)}
                    </span>
                </div>
            ) : (
                breakdown.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {breakdown.reasons.map((reason) => (
                            <span
                                key={reason}
                                className={`text-xs px-2 py-0.5 rounded-full ${reasonTagStyles}`}
                            >
                                {reason}
                            </span>
                        ))}
                    </div>
                )
            )}

            {!isFrozen && breakdown.reasons.length === 0 && (
                <p className={`text-xs mb-2 ${isDark ? "text-[#7C948F]" : "text-gray-500"}`}>
                    Standard pricing — no surge active right now.
                </p>
            )}

            <div className="flex gap-2 mb-3">
                {isFrozen ? (
                    <button
                        onClick={onUnfreeze}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 transition-colors ${
                            isDark 
                                ? "text-[#EAF2F0] bg-[#24413D] hover:bg-[#2F5450]" 
                                : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        <Unlock className="w-4 h-4" />
                        Unlock price
                    </button>
                ) : (
                    <button
                        onClick={onFreeze}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 transition-colors ${
                            isDark 
                                ? "text-[#162624] bg-[#7FD1C4] hover:bg-[#aef3e8]" 
                                : "text-blue-700 bg-blue-50 hover:bg-blue-100"
                        }`}
                    >
                        <Lock className="w-4 h-4" />
                        Freeze this price for 24h
                    </button>
                )}
            </div>

            <button
                onClick={() => setShowHistory((v) => !v)}
                className={`text-xs font-medium transition-colors ${
                    isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-blue-600 hover:text-blue-700"
                }`}
            >
                {showHistory ? "Hide price history" : "View price history"}
            </button>

            {showHistory && (
                <div className="mt-3">
                    {/* Pass theme down to guarantee immediate re-rendering */}
                    <PriceHistoryChart history={history} forcedTheme={theme} />
                </div>
            )}
        </div>
    );
};

export default DynamicPricingCard;
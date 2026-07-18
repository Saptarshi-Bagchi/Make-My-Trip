import React, { useEffect, useState } from "react";
import { TrendingUp, Lock, Unlock, Clock } from "lucide-react";
import { EntityType, PriceBreakdown, PriceFreeze } from "@/lib/pricingEngine";
import PriceHistoryChart from "./PriceHistoryChart";

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

    useEffect(() => {
        const timer = setInterval(() => setNowTick(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Live Price</span>
                </div>
                <span className="text-xl font-bold">
                    ₹ {displayPrice.toLocaleString("en-IN")}
                </span>
            </div>

            {isFrozen && freeze ? (
                <div className="flex items-center justify-between bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2 mb-2">
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
                                className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
                            >
                                {reason}
                            </span>
                        ))}
                    </div>
                )
            )}

            {!isFrozen && breakdown.reasons.length === 0 && (
                <p className="text-xs text-gray-500 mb-2">Standard pricing — no surge active right now.</p>
            )}

            <div className="flex gap-2 mb-3">
                {isFrozen ? (
                    <button
                        onClick={onUnfreeze}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors"
                    >
                        <Unlock className="w-4 h-4" />
                        Unlock price
                    </button>
                ) : (
                    <button
                        onClick={onFreeze}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors"
                    >
                        <Lock className="w-4 h-4" />
                        Freeze this price for 24h
                    </button>
                )}
            </div>

            <button
                onClick={() => setShowHistory((v) => !v)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
                {showHistory ? "Hide price history" : "View price history"}
            </button>

            {showHistory && (
                <div className="mt-3">
                    <PriceHistoryChart history={history} />
                </div>
            )}
        </div>
    );
};

export default DynamicPricingCard;
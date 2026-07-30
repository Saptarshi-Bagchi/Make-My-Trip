import React, { useState } from "react";
import { PriceHistoryPoint } from "@/lib/pricingEngine";
import { useTheme } from "@/components/ThemeContext";

interface PriceHistoryChartProps {
    history: PriceHistoryPoint[];
    width?: number;
    height?: number;
    forcedTheme?: "light" | "dark"; // Allows parent component to directly pass the active theme
}

const PriceHistoryChart = ({ history, width = 320, height = 140, forcedTheme }: PriceHistoryChartProps) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    
    // Fallback to hook if no theme is passed down explicitly by props
    const contextTheme = useTheme();
    const activeTheme = forcedTheme || contextTheme?.theme || "light";
    const isDark = activeTheme === "dark";

    if (history.length === 0) {
        return (
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
                isDark ? "bg-[#121826] border-[#2A3854] text-[#94A3B8]" : "bg-white border-[#E2E8F0] text-gray-500"
            }`}>
                <p className="text-sm">No price history available.</p>
            </div>
        );
    }

    const padding = { top: 12, right: 12, bottom: 24, left: 44 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const prices = history.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const xFor = (i: number) => padding.left + (i / (history.length - 1)) * chartWidth;
    const yFor = (price: number) =>
        padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

    const linePoints = history.map((p, i) => `${xFor(i)},${yFor(p.price)}`).join(" ");
    const areaPoints = `${xFor(0)},${padding.top + chartHeight} ${linePoints} ${xFor(
        history.length - 1
    )},${padding.top + chartHeight}`;

    const formatShortDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    // Thematic configurations mapping to your theme styles
    const axisColor = isDark ? "#2A3854" : "#E2E8F0";
    const textPrimaryColor = isDark ? "#94A3B8" : "#64748B";
    const textSecondaryColor = isDark ? "#94A3B8" : "#94A3B8";
    const chartColor = isDark ? "#818CF8" : "#4F46E5";
    const dotBorderColor = isDark ? "#121826" : "#ffffff";

    return (
        <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
            isDark ? "bg-[#121826] border-[#2A3854]" : "bg-white border-[#E2E8F0]"
        }`}>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + chartHeight}
                    stroke={axisColor}
                />
                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight}
                    x2={padding.left + chartWidth}
                    y2={padding.top + chartHeight}
                    stroke={axisColor}
                />

                <text x={padding.left - 8} y={yFor(maxPrice) + 4} textAnchor="end" fontSize="10" fill={textPrimaryColor}>
                    ₹{maxPrice.toLocaleString("en-IN")}
                </text>
                <text x={padding.left - 8} y={yFor(minPrice) + 4} textAnchor="end" fontSize="10" fill={textPrimaryColor}>
                    ₹{minPrice.toLocaleString("en-IN")}
                </text>

                <polygon points={areaPoints} fill={chartColor} fillOpacity={isDark ? "0.06" : "0.09"} />
                <polyline points={linePoints} fill="none" stroke={chartColor} strokeWidth="2" />

                {history.map((p, i) => (
                    <circle
                        key={p.date}
                        cx={xFor(i)}
                        cy={yFor(p.price)}
                        r={hoverIndex === i ? 5 : 3}
                        fill={chartColor}
                        stroke={dotBorderColor}
                        strokeWidth="1.5"
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        style={{ cursor: "pointer" }}
                    />
                ))}

                <text x={padding.left} y={height - 6} fontSize="10" fill={textSecondaryColor}>
                    {formatShortDate(history[0].date)}
                </text>
                <text x={padding.left + chartWidth} y={height - 6} textAnchor="end" fontSize="10" fill={textSecondaryColor}>
                    {formatShortDate(history[history.length - 1].date)}
                </text>
            </svg>

            {hoverIndex !== null && (
                <div
                    className={`absolute text-xs px-2 py-1 rounded shadow-md pointer-events-none transition-all duration-300 border ${
                        isDark 
                          ? "bg-[#1A2234] text-[#F1F5F9] border-[#2A3854]" 
                          : "bg-white text-[#0F172A] border-[#E2E8F0]"
                    }`}
                    style={{
                        left: `${(xFor(hoverIndex) / width) * 100}%`,
                        top: `${(yFor(history[hoverIndex].price) / height) * 100}%`,
                        transform: "translate(-50%, -130%)",
                    }}
                >
                    {formatShortDate(history[hoverIndex].date)}: ₹{history[hoverIndex].price.toLocaleString("en-IN")}
                </div>
            )}
        </div>
    );
};

export default PriceHistoryChart;

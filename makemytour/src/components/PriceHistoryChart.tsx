import React, { useState } from "react";
import { PriceHistoryPoint } from "@/lib/pricingEngine";

interface PriceHistoryChartProps {
    history: PriceHistoryPoint[];
    width?: number;
    height?: number;
}

const PriceHistoryChart = ({ history, width = 320, height = 140 }: PriceHistoryChartProps) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    if (history.length === 0) {
        return <p className="text-sm text-gray-500">No price history available.</p>;
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

    return (
        <div className="relative">
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + chartHeight}
                    stroke="#e5e7eb"
                />
                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight}
                    x2={padding.left + chartWidth}
                    y2={padding.top + chartHeight}
                    stroke="#e5e7eb"
                />

                <text x={padding.left - 8} y={yFor(maxPrice) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
                    ₹{maxPrice.toLocaleString("en-IN")}
                </text>
                <text x={padding.left - 8} y={yFor(minPrice) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
                    ₹{minPrice.toLocaleString("en-IN")}
                </text>

                <polygon points={areaPoints} fill="#3b82f6" fillOpacity="0.08" />
                <polyline points={linePoints} fill="none" stroke="#3b82f6" strokeWidth="2" />

                {history.map((p, i) => (
                    <circle
                        key={p.date}
                        cx={xFor(i)}
                        cy={yFor(p.price)}
                        r={hoverIndex === i ? 5 : 3}
                        fill="#3b82f6"
                        stroke="#fff"
                        strokeWidth="1.5"
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        style={{ cursor: "pointer" }}
                    />
                ))}

                <text x={padding.left} y={height - 6} fontSize="10" fill="#9ca3af">
                    {formatShortDate(history[0].date)}
                </text>
                <text x={padding.left + chartWidth} y={height - 6} textAnchor="end" fontSize="10" fill="#9ca3af">
                    {formatShortDate(history[history.length - 1].date)}
                </text>
            </svg>

            {hoverIndex !== null && (
                <div
                    className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow pointer-events-none"
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
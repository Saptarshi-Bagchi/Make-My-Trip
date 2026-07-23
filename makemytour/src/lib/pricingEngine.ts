export type EntityType = "flight" | "hotel";

export interface PriceBreakdown {
    basePrice: number;
    seasonalMultiplier: number;
    demandMultiplier: number;
    totalMultiplier: number;
    price: number;
    reasons: string[];
}

export interface PriceHistoryPoint {
    date: string;
    price: number;
}

export interface PriceFreeze {
    price: number;
    frozenAt: string;
    expiresAt: string;
}

interface SeasonalWindow {
    label: string;
    multiplier: number;
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
}

// Year-agnostic month/day windows for peak travel periods
const SEASONAL_WINDOWS: SeasonalWindow[] = [
    { label: "Holiday Season (+20%)", multiplier: 1.2, startMonth: 12, startDay: 20, endMonth: 1, endDay: 5 },
    { label: "Festive Season (+20%)", multiplier: 1.2, startMonth: 10, startDay: 15, endMonth: 11, endDay: 10 },
    { label: "Summer Peak (+15%)", multiplier: 1.15, startMonth: 5, startDay: 1, endMonth: 6, endDay: 20 },
];

function isWithinWindow(date: Date, w: SeasonalWindow): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const asValue = (m: number, d: number) => m * 100 + d;
    const value = asValue(month, day);
    const start = asValue(w.startMonth, w.startDay);
    const end = asValue(w.endMonth, w.endDay);

    if (start <= end) {
        return value >= start && value <= end;
    }
    return value >= start || value <= end;
}

export function getSeasonalInfo(date: Date): { multiplier: number; label: string | null } {
    for (const w of SEASONAL_WINDOWS) {
        if (isWithinWindow(date, w)) {
            return { multiplier: w.multiplier, label: w.label };
        }
    }
    return { multiplier: 1, label: null };
}

export function getDemandInfo(
    availableUnits: number,
    fullCapacity: number
): { multiplier: number; label: string | null } {
    if (fullCapacity <= 0) return { multiplier: 1, label: null };
    const ratio = Math.max(0, availableUnits) / fullCapacity;

    if (ratio <= 0.1) return { multiplier: 1.3, label: "Almost Sold Out (+30%)" };
    if (ratio <= 0.25) return { multiplier: 1.15, label: "High Demand (+15%)" };
    if (ratio <= 0.5) return { multiplier: 1.05, label: "Moderate Demand (+5%)" };
    return { multiplier: 1, label: null };
}

export function computeLivePrice(
    basePrice: number,
    availableUnits: number,
    fullCapacity: number,
    atDate: Date = new Date()
): PriceBreakdown {
    const seasonal = getSeasonalInfo(atDate);
    const demand = getDemandInfo(availableUnits, fullCapacity);
    const totalMultiplier = seasonal.multiplier * demand.multiplier;
    const price = Math.round(basePrice * totalMultiplier);
    const reasons = [seasonal.label, demand.label].filter((r): r is string => Boolean(r));

    return {
        basePrice,
        seasonalMultiplier: seasonal.multiplier,
        demandMultiplier: demand.multiplier,
        totalMultiplier,
        price,
        reasons,
    };
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generatePriceHistory(
    entityId: string,
    basePrice: number,
    fullCapacity: number,
    currentAvailableUnits: number,
    days = 14
): PriceHistoryPoint[] {
    const points: PriceHistoryPoint[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        if (i === 0) {
            const breakdown = computeLivePrice(basePrice, currentAvailableUnits, fullCapacity, date);
            points.push({ date: date.toISOString(), price: breakdown.price });
            continue;
        }

        const rand = mulberry32(hashString(`${entityId}-${i}`))();
        const trend = 1 - (days - i) / days / 2;
        const simulatedUnits = Math.max(0, Math.round(fullCapacity * trend * (0.6 + rand * 0.5)));

        const breakdown = computeLivePrice(basePrice, simulatedUnits, fullCapacity, date);
        points.push({ date: date.toISOString(), price: breakdown.price });
    }

    return points;
}

const FREEZE_STORAGE_PREFIX = "price-freeze";

function freezeKey(type: EntityType, id: string): string {
    return `${FREEZE_STORAGE_PREFIX}:${type}:${id}`;
}

export function freezePrice(
    type: EntityType,
    id: string,
    price: number,
    durationHours = 24
): PriceFreeze {
    const now = new Date();
    const expires = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const freeze: PriceFreeze = {
        price,
        frozenAt: now.toISOString(),
        expiresAt: expires.toISOString(),
    };
    if (typeof window !== "undefined") {
        window.localStorage.setItem(freezeKey(type, id), JSON.stringify(freeze));
    }
    return freeze;
}

export function getActiveFreeze(type: EntityType, id: string): PriceFreeze | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(freezeKey(type, id));
    if (!raw) return null;

    try {
        const freeze: PriceFreeze = JSON.parse(raw);
        if (new Date(freeze.expiresAt).getTime() <= Date.now()) {
            window.localStorage.removeItem(freezeKey(type, id));
            return null;
        }
        return freeze;
    } catch {
        window.localStorage.removeItem(freezeKey(type, id));
        return null;
    }
}

export function clearFreeze(type: EntityType, id: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(freezeKey(type, id));
}
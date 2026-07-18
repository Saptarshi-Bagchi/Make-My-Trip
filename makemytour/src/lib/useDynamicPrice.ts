import { useEffect, useMemo, useState } from "react";
import {
    computeLivePrice,
    generatePriceHistory,
    getActiveFreeze,
    freezePrice,
    clearFreeze,
    EntityType,
    PriceBreakdown,
    PriceHistoryPoint,
    PriceFreeze,
} from "./pricingEngine";

interface UseDynamicPriceParams {
    type: EntityType;
    id: string | undefined;
    basePrice: number;
    availableUnits: number;
    fullCapacity: number;
}

interface UseDynamicPriceResult {
    breakdown: PriceBreakdown;
    displayPrice: number;
    isFrozen: boolean;
    freeze: PriceFreeze | null;
    history: PriceHistoryPoint[];
    freezeCurrentPrice: (durationHours?: number) => void;
    unfreeze: () => void;
}

const REFRESH_INTERVAL_MS = 30000;

export function useDynamicPrice({
    type,
    id,
    basePrice,
    availableUnits,
    fullCapacity,
}: UseDynamicPriceParams): UseDynamicPriceResult {
    const [now, setNow] = useState(() => new Date());
    const [freeze, setFreeze] = useState<PriceFreeze | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), REFRESH_INTERVAL_MS);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!id) return;
        setFreeze(getActiveFreeze(type, id));
    }, [type, id]);

    const breakdown = useMemo(
        () => computeLivePrice(basePrice, availableUnits, fullCapacity, now),
        [basePrice, availableUnits, fullCapacity, now]
    );

    const history = useMemo(() => {
        if (!id) return [];
        return generatePriceHistory(id, basePrice, fullCapacity, availableUnits);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, basePrice, fullCapacity]);

    const isFrozen = Boolean(freeze);
    const displayPrice = freeze ? freeze.price : breakdown.price;

    const freezeCurrentPrice = (durationHours = 24) => {
        if (!id) return;
        const created = freezePrice(type, id, breakdown.price, durationHours);
        setFreeze(created);
    };

    const unfreeze = () => {
        if (!id) return;
        clearFreeze(type, id);
        setFreeze(null);
    };

    return { breakdown, displayPrice, isFrozen, freeze, history, freezeCurrentPrice, unfreeze };
}
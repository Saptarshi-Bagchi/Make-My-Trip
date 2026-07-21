export interface RefundTier {
    label: string;
    minHoursBefore: number;
    refundPercentage: number;
}

// - Full refund if cancelled more than 24 hours before departure/check-in
// - 50% (partial) refund if cancelled within 24 hours of departure/check-in
const REFUND_TIERS: RefundTier[] = [
    { label: "More than 24 hours before departure", minHoursBefore: 24, refundPercentage: 100 },
    { label: "Within 24 hours of departure", minHoursBefore: 0, refundPercentage: 50 },
];

export const CANCELLATION_REASONS = [
    "Change of travel plans",
    "Found a better price elsewhere",
    "Booked by mistake",
    "Medical emergency",
    "Weather concerns",
    "Personal emergency",
    "Other",
];

export interface RefundCalculation {
    refundPercentage: number;
    refundAmount: number;
    tierLabel: string;
    hoursUntilDeparture: number;
    isPastDeparture: boolean;
}

export function calculateRefund(totalPrice: number, departureOrCheckInTime: string): RefundCalculation {
    const now = Date.now();
    const departure = new Date(departureOrCheckInTime).getTime();
    const hoursUntilDeparture = (departure - now) / (60 * 60 * 1000);

    if (hoursUntilDeparture <= 0) {
        return {
            refundPercentage: 0,
            refundAmount: 0,
            tierLabel: "Departure has already passed",
            hoursUntilDeparture,
            isPastDeparture: true,
        };
    }

    const tier = REFUND_TIERS.find((t) => hoursUntilDeparture >= t.minHoursBefore) ?? REFUND_TIERS[REFUND_TIERS.length - 1];
    const refundAmount = Math.round((totalPrice * tier.refundPercentage) / 100);

    return {
        refundPercentage: tier.refundPercentage,
        refundAmount,
        tierLabel: tier.label,
        hoursUntilDeparture,
        isPastDeparture: false,
    };
}

// Hotel bookings have no stored check-in date, so a flat policy applies
// instead of the time-tiered one used for flights.
const HOTEL_FLAT_REFUND_PERCENTAGE = 50;

export function calculateHotelRefund(totalPrice: number): RefundCalculation {
    const refundAmount = Math.round((totalPrice * HOTEL_FLAT_REFUND_PERCENTAGE) / 100);
    return {
        refundPercentage: HOTEL_FLAT_REFUND_PERCENTAGE,
        refundAmount,
        tierLabel: "Standard hotel cancellation policy",
        hoursUntilDeparture: NaN,
        isPastDeparture: false,
    };
}
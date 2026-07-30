export type RefundStatus = "Pending" | "Processing" | "Completed";

export interface RefundRecord {
    id: string;
    entityType: "flight" | "hotel";
    label: string;
    reason: string;
    originalAmount: number;
    refundAmount: number;
    refundPercentage: number;
    canceledAt: string;
}

export interface RefundWithStatus extends RefundRecord {
    status: RefundStatus;
    expectedCompletionDate: string;
}

const PROCESSING_START_HOURS = 24;
const COMPLETED_START_HOURS = 72;

export function computeRefundStatus(canceledAt: string): { status: RefundStatus; expectedCompletionDate: string } {
    const canceledMs = new Date(canceledAt).getTime();
    const hoursElapsed = (Date.now() - canceledMs) / (60 * 60 * 1000);
    const expectedCompletionDate = new Date(canceledMs + COMPLETED_START_HOURS * 60 * 60 * 1000).toISOString();

    let status: RefundStatus;
    if (hoursElapsed >= COMPLETED_START_HOURS) status = "Completed";
    else if (hoursElapsed >= PROCESSING_START_HOURS) status = "Processing";
    else status = "Pending";

    return { status, expectedCompletionDate };
}

export function getAllRefunds(refunds: RefundRecord[] = []): RefundWithStatus[] {
    return refunds
        .map((r) => ({ ...r, ...computeRefundStatus(r.canceledAt) }))
        .sort((a, b) => new Date(b.canceledAt).getTime() - new Date(a.canceledAt).getTime());
}

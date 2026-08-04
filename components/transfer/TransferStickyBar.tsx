import { getTransferPricingUnitLabel } from "@/lib/transfer";
import type { Transfer } from "@/types/transfer";

export function TransferStickyBar({ transfer }: { transfer: Transfer }) {
  return (
    <div className="transferStickyBar" data-testid="transfer-sticky-bar">
      <div>
        <strong>{transfer.price}</strong>
        <span>{getTransferPricingUnitLabel(transfer.pricingUnit)}</span>
      </div>
      <a href="#transfer-enquiry" className="platformButton">Book transfer</a>
      <a
        href={`https://wa.me/9609142538?text=${encodeURIComponent(`Hi, I would like to ask about ${transfer.operatorName}. Please confirm the latest schedule and availability.`)}`}
        className="platformButton transferSecondaryAction"
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </div>
  );
}

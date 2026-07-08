import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { generateTransferLink } from "@/lib/whatsapp";
import type { Transfer } from "@/types/transfer";

export default function TransferCard({ transfer }: { transfer: Transfer }) {
  return (
    <Card>
      <div
        className="-mx-6 -mt-6 h-64 rounded-t-3xl bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url('${transfer.image}')` }}
        role="img"
        aria-label={transfer.title}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge>{transfer.duration}</Badge>
        <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {transfer.price}
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-bold">{transfer.title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{transfer.description}</p>

      <div className="mt-6 space-y-2 text-sm font-semibold text-slate-600">
        <p>From: {transfer.departurePoint}</p>
        <p>To: {transfer.arrivalPoint}</p>
        <p>{transfer.scheduleNote}</p>
      </div>

      <div className="mt-6">
        <Button href={generateTransferLink({})} variant="green">
          Ask About Transfer
        </Button>
      </div>
    </Card>
  );
}

import { TransferIcon } from "@/components/transfer/TransferIcon";

export function TransferServiceFacts({
  luggage,
  duration,
  pickupDropoff,
  safetyInformation,
}: {
  luggage: string;
  duration: string;
  pickupDropoff: string;
  safetyInformation: string;
}) {
  const facts = [
    { label: "Luggage allowance", value: luggage, icon: "luggage" as const },
    { label: "Approx. duration", value: duration, icon: "clock" as const },
    { label: "Pickup / drop-off", value: pickupDropoff, icon: "route" as const },
    { label: "Safety information", value: safetyInformation, icon: "shield" as const },
  ];

  return (
    <section className="platformSection platformSectionMuted">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Service information</p>
          <h2>Quick details for this transfer</h2>
          <p>Stored values are shown where available. Missing information is kept honest rather than invented.</p>
        </div>

        <div className="transferFactGrid" role="list" aria-label="Transfer service facts">
          {facts.map((fact) => (
            <article key={fact.label} className="transferFactCard" role="listitem">
              <TransferIcon name={fact.icon} />
              <strong>{fact.label}</strong>
              <p>{fact.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

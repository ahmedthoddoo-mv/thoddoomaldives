import { TransferIcon } from "@/components/transfer/TransferIcon";
import type { TransferFleetGroup } from "@/components/transfer/transfer-utils";

export function TransferFleetSection({
  fleet,
  fallbackMessage,
}: {
  fleet: TransferFleetGroup[];
  fallbackMessage: string;
}) {
  return (
    <section className="platformSection">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Fleet section</p>
          <h2>Boat models from the current public record</h2>
          <p>Only stored vessel data is shown. If the public record is sparse, the section falls back to a plain explanation.</p>
        </div>

        {fleet.length > 0 ? (
          <div className="transferFleetGrid" role="list" aria-label="Transfer fleet details">
            {fleet.map((item) => (
              <article key={`${item.model}-${item.passengerCapacity ?? "na"}`} className="transferFleetCard" role="listitem">
                <div className="transferFleetVisual" style={{ backgroundImage: `url('${item.image}')` }} role="img" aria-label={item.model} />
                <div className="transferFleetBody">
                  <span className="transferFleetKicker">
                    <TransferIcon name="boat" />
                    <span>Fleet profile</span>
                  </span>
                  <h3>{item.model}</h3>
                  <dl className="transferFleetMeta">
                    <div>
                      <dt>Quantity</dt>
                      <dd>{item.quantity}</dd>
                    </div>
                    <div>
                      <dt>Capacity</dt>
                      <dd>{item.passengerCapacity ? `${item.passengerCapacity} passengers` : "Confirm with operator"}</dd>
                    </div>
                  </dl>
                  {item.notes.length > 0 ? (
                    <ul className="transferFleetNotes">
                      {item.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <article className="platformNotice transferInfoPanel">
            <p>{fallbackMessage}</p>
          </article>
        )}
      </div>
    </section>
  );
}

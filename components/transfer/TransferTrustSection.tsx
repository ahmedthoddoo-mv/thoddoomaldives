import { TransferIcon } from "@/components/transfer/TransferIcon";

export function TransferTrustSection({
  points,
  note,
}: {
  points: string[];
  note: string;
}) {
  return (
    <section className="platformSection platformSectionMuted">
      <div className="platformContainer transferDetailGrid">
        <article className="platformCard transferWhyBookCard">
          <div className="platformCardBody">
            <p className="eyebrow">Why book through iThoddoo Maldives</p>
            <h2>Local coordination with live schedule guidance</h2>
            <ul className="transferReasonList">
              {points.map((point) => (
                <li key={point}>
                  <TransferIcon name="check" />
                  <p>{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="platformNotice transferInfoPanel">
          <div className="platformSectionHeader">
            <p className="eyebrow">Trust note</p>
            <h2>What we show is what we have</h2>
          </div>
          <p>{note}</p>
        </article>
      </div>
    </section>
  );
}

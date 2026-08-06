export function TransferMobileBookingBar({
  title,
  summary,
  whatsappHref,
}: {
  title: string;
  summary: string;
  whatsappHref: string;
}) {
  return (
    <div className="transferMobileBookingBar" role="region" aria-label="Mobile booking bar">
      <div>
        <strong>{title}</strong>
        <span>{summary}</span>
      </div>
      <a className="platformButton" href={whatsappHref} target="_blank" rel="noopener noreferrer">
        Check availability
      </a>
    </div>
  );
}

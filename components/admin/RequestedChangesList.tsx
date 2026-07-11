export function RequestedChangesList({ changes }: { changes: string[] }) {
  if (changes.length === 0) {
    return <p className="mutedText">No requested changes.</p>;
  }

  return (
    <ul className="requestedChangesList">
      {changes.map((change) => (
        <li key={change}>{change}</li>
      ))}
    </ul>
  );
}

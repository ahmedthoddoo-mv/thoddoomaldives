import { getPropertyImportPreview } from "@/lib/supabase/importPreview";

export function AdminPropertyImportPreview() {
  const preview = getPropertyImportPreview();
  const validCount = preview.filter((item) => item.valid).length;
  const invalidCount = preview.length - validCount;

  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Database import preview</p>
        <h2>Mock Property Payloads</h2>
        <p>
          Read-only preview for Supabase inserts. Nothing is written to the database from this panel.
        </p>
      </div>

      <div className="adminStatusGrid">
        <article className="adminSystemCard">
          <span>Valid records</span>
          <strong>{validCount}</strong>
          <p>Ready for insert payload review.</p>
        </article>
        <article className="adminSystemCard">
          <span>Validation issues</span>
          <strong>{invalidCount}</strong>
          <p>Records requiring cleanup before database import.</p>
        </article>
        <article className="adminSystemCard">
          <span>Duplicate slugs</span>
          <strong>{preview.filter((item) => item.duplicateSlug).length}</strong>
          <p>Slug conflicts must be resolved before import.</p>
        </article>
      </div>

      <div className="adminImportPreviewList">
        {preview.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.valid ? "Valid" : "Needs review"}</span>
            </div>
            <p>/stay/{item.slug}</p>
            <small>
              Rooms: {item.roomCount} | Media paths: {item.mediaCount}
            </small>
            {item.errors.length > 0 ? (
              <ul>
                {item.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

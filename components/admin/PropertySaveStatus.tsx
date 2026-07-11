"use client";

type PropertySaveStatusProps = {
  message: string;
  errors?: string[];
};

export function PropertySaveStatus({ message, errors = [] }: PropertySaveStatusProps) {
  return (
    <section className={`adminPanel adminPropertyEditorNotice ${errors.length > 0 ? "adminPropertyValidationNotice" : ""}`}>
      <strong>{message}</strong>
      <span>Demo storage only. Data is saved in this browser and will be replaced by the production database later.</span>
      {errors.length > 0 ? (
        <ul className="adminPropertyValidationList">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

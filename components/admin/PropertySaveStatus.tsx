"use client";

type PropertySaveStatusProps = {
  message: string;
  errors?: string[];
};

export function PropertySaveStatus({ message, errors = [] }: PropertySaveStatusProps) {
  return (
    <section className={`adminPanel adminPropertyEditorNotice ${errors.length > 0 ? "adminPropertyValidationNotice" : ""}`}>
      <strong>{message}</strong>
      <span>Changes are validated and saved through the authenticated database action.</span>
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

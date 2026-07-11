export type CsvRow = Record<string, string>;

export function escapeCsvValue(value: unknown) {
  const stringValue = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  const escaped = stringValue.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

export function exportToCsv<T extends Record<string, unknown>>(rows: T[], columns?: Array<keyof T>) {
  if (rows.length === 0 && !columns?.length) {
    return "";
  }

  const resolvedColumns = columns ?? (Object.keys(rows[0]) as Array<keyof T>);
  const header = resolvedColumns.map((column) => escapeCsvValue(String(column))).join(",");
  const body = rows.map((row) => resolvedColumns.map((column) => escapeCsvValue(row[column])).join(","));

  return [header, ...body].join("\n");
}

export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  currentRow.push(currentValue);
  rows.push(currentRow);

  const [headers = [], ...bodyRows] = rows.filter((row) => row.some((value) => value.trim().length > 0));

  return bodyRows.map((row) =>
    headers.reduce<CsvRow>((record, header, index) => {
      record[header] = row[index] ?? "";
      return record;
    }, {})
  );
}

export function mapCsvRows<T>(rows: CsvRow[], mapper: (row: CsvRow) => T) {
  return rows.map(mapper);
}

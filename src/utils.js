export function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function flattenObject(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      flattenObject(value, nextKey, out);
    } else if (Array.isArray(value)) {
      out[nextKey] = JSON.stringify(value);
    } else {
      out[nextKey] = value;
    }
  }
  return out;
}

export function normalizeToRows(parsed) {
  if (Array.isArray(parsed)) {
    return parsed.map((item) => (isPlainObject(item) ? flattenObject(item) : { value: item }));
  }
  if (isPlainObject(parsed)) return [flattenObject(parsed)];
  return [{ value: parsed }];
}

export function detectColumns(dataRows) {
  const set = new Set();
  dataRows.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
  return Array.from(set);
}

export function toCell(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function computeStats(dataRows, cols) {
  const rowCount = dataRows.length;
  const colCount = cols.length;
  const totalCells = rowCount * Math.max(colCount, 1);

  let missingCount = 0;
  const colData = Object.fromEntries(
    cols.map((c) => [c, { unique: new Set(), missing: 0, samples: [] }])
  );
  const SAMPLE_LIMIT = 5;

  for (const row of dataRows) {
    for (const col of cols) {
      const value = row[col];
      const isMissing =
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "");
      if (isMissing) {
        missingCount++;
        colData[col].missing++;
        continue;
      }

      const key = typeof value === "object" ? JSON.stringify(value) : String(value);
      const bucket = colData[col];
      if (!bucket.unique.has(key)) {
        bucket.unique.add(key);
        if (bucket.samples.length < SAMPLE_LIMIT) bucket.samples.push(key);
      }
    }
  }

  const uniqueSummary = cols.map((col) => ({
    column: col,
    uniqueCount: colData[col].unique.size,
    missing: colData[col].missing,
    samples: colData[col].samples,
  }));

  const idCol = findColumn(cols, /(^|[._])id$|^id$|uuid|guid/i);
  const fileCol =
    findColumn(cols, /filename|file_?name/i) ||
    findColumn(cols, /(^|[._])file$/i);

  return {
    rowCount,
    colCount,
    missingCount,
    missingPct: totalCells ? (missingCount / totalCells) * 100 : 0,
    uniqueSummary,
    highlights: {
      id: makeHighlight(idCol, colData),
      file: makeHighlight(fileCol, colData),
    },
  };
}

function findColumn(cols, pattern) {
  return cols.find((c) => pattern.test(c)) || null;
}

function makeHighlight(col, colData) {
  if (!col) return { column: null, uniqueCount: 0 };
  return { column: col, uniqueCount: colData[col].unique.size };
}

export function formatNumber(num) {
  return Number.isInteger(num)
    ? num.toLocaleString()
    : num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
import { toCell, formatNumber, escapeHtml } from "./utils.js";

export function showError(errorBox, message) {
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}

export function clearError(errorBox) {
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
}

export function resetUI(refs) {
  refs.fileInfo.textContent = "";
  refs.summarySection.classList.add("d-none");
  refs.dataTableHead.innerHTML = "";
  refs.dataTableBody.innerHTML = "";
  refs.uniqueTableBody.innerHTML = "";
  refs.uniqueEmpty.classList.add("d-none");
  refs.duplicatesTableBody.innerHTML = "";
  refs.duplicatesEmpty.classList.add("d-none");
  clearError(refs.errorBox);
}

export function renderStats(refs, stats) {
  refs.statRows.textContent = stats.rowCount.toLocaleString();
  refs.statCols.textContent = stats.colCount.toLocaleString();

  renderUniqueTable(refs, stats.uniqueSummary);
  renderDuplicatesTable(refs, stats.duplicatesSummary);
}

function renderUniqueTable(refs, uniqueSummary) {
  refs.uniqueTableBody.innerHTML = "";
  if (!uniqueSummary.length) {
    refs.uniqueEmpty.classList.remove("d-none");
    return;
  }

  refs.uniqueEmpty.classList.add("d-none");
  for (const u of uniqueSummary) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="mono">${escapeHtml(u.column)}</td>
      <td>${formatNumber(u.uniqueCount)}</td>
      <td>${formatNumber(u.missing)}</td>
      <td class="small text-secondary">${formatSamples(u.samples)}</td>
    `;
    refs.uniqueTableBody.appendChild(tr);
  }
}

function renderDuplicatesTable(refs, duplicatesSummary) {
  refs.duplicatesTableBody.innerHTML = "";
  if (!duplicatesSummary.length) {
    refs.duplicatesEmpty.classList.remove("d-none");
    return;
  }

  refs.duplicatesEmpty.classList.add("d-none");
  for (const d of duplicatesSummary) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="mono">${escapeHtml(d.column)}</td>
      <td>${formatNumber(d.duplicateValueCount)}</td>
      <td>${formatNumber(d.duplicateRowCount)}</td>
      <td class="small text-secondary">${formatRepeats(d.topRepeats)}</td>
    `;
    refs.duplicatesTableBody.appendChild(tr);
  }
}

function formatRepeats(repeats) {
  const MAX_LEN = 30;
  return repeats
    .map(({ value, count }) => {
      const trimmed = value.length > MAX_LEN ? value.slice(0, MAX_LEN) + "\u2026" : value;
      return `${escapeHtml(trimmed)} \u00d7${count}`;
    })
    .join(", ");
}

function formatSamples(samples) {
  if (!samples.length) return "<em>(empty)</em>";
  const MAX_LEN = 40;
  return samples
    .map((s) => {
      const trimmed = s.length > MAX_LEN ? s.slice(0, MAX_LEN) + "…" : s;
      return escapeHtml(trimmed);
    })
    .join(", ");
}

export function renderTable(refs, rows, columns) {
  const trHead = document.createElement("tr");
  columns.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c;
    trHead.appendChild(th);
  });

  refs.dataTableHead.innerHTML = "";
  refs.dataTableHead.appendChild(trHead);

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const col of columns) {
      const td = document.createElement("td");
      td.textContent = toCell(row[col]);
      tr.appendChild(td);
    }
    fragment.appendChild(tr);
  }

  refs.dataTableBody.innerHTML = "";
  refs.dataTableBody.appendChild(fragment);
}
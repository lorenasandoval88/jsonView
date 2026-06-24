import { normalizeToRows, detectColumns, computeStats } from "./utils.js";
import { showError, clearError, resetUI, renderStats, renderTable } from "./ui.js";

const refs = {
  jsonFileInput: document.getElementById("jsonFile"),
  clearBtn: document.getElementById("clearBtn"),
  fileInfo: document.getElementById("fileInfo"),
  errorBox: document.getElementById("errorBox"),
  summarySection: document.getElementById("summarySection"),

  statRows: document.getElementById("statRows"),
  statCols: document.getElementById("statCols"),

  uniqueTableBody: document.querySelector("#uniqueTable tbody"),
  uniqueEmpty: document.getElementById("uniqueEmpty"),

  duplicatesTableBody: document.querySelector("#duplicatesTable tbody"),
  duplicatesEmpty: document.getElementById("duplicatesEmpty"),

  dataTableHead: document.querySelector("#dataTable thead"),
  dataTableBody: document.querySelector("#dataTable tbody"),
};

let rows = [];
let columns = [];

refs.jsonFileInput.addEventListener("change", async (e) => {
  clearError(refs.errorBox);
  refs.summarySection.classList.add("d-none");

  const file = e.target.files?.[0];
  if (!file) return;

  try {
    refs.fileInfo.textContent = `Loaded file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

    const text = await file.text();
    const parsed = JSON.parse(text);

    rows = normalizeToRows(parsed);
    columns = detectColumns(rows);

    const stats = computeStats(rows, columns);
    renderStats(refs, stats);
    renderTable(refs, rows, columns);

    refs.summarySection.classList.remove("d-none");
  } catch (err) {
    showError(refs.errorBox, `Could not parse JSON file. ${err?.message || ""}`);
  }
});

refs.clearBtn.addEventListener("click", () => {
  refs.jsonFileInput.value = "";
  rows = [];
  columns = [];
  resetUI(refs);
});
"use strict";

const REASONS = [
  "Family Relocation / Transfer",
  "Distance from Residence",
  "Unavailability of Stream / Medium / Subjects",
  "Better Academic Opportunities",
  "Govt-Private School Transfer",
  "Others / Unknown Reasons"
];

const DEFAULTS = {
  minMarks: 75,
  maxMarks: 85,
  minDays: 205,
  maxDays: 215,
  progressionStatus: "1",
  schoolingStatus: "1",
  leftSchoolReasons: REASONS,
  delayTime: 1000
};

const statusBox = document.getElementById("status");
const startButton = document.getElementById("startAutoFillBtn");
const fullButton = document.getElementById("startFullAutoBtn");
const stopButton = document.getElementById("stopProcessBtn");
const importFile = document.getElementById("importFile");

function numberValue(id, fallback, minimum, maximum) {
  const value = Number.parseInt(document.getElementById(id).value, 10);
  return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}

function normalize(source = {}) {
  let minMarks = Number.parseInt(source.minMarks, 10);
  let maxMarks = Number.parseInt(source.maxMarks, 10);
  let minDays = Number.parseInt(source.minDays, 10);
  let maxDays = Number.parseInt(source.maxDays, 10);
  minMarks = Number.isFinite(minMarks) ? Math.min(100, Math.max(0, minMarks)) : DEFAULTS.minMarks;
  maxMarks = Number.isFinite(maxMarks) ? Math.min(100, Math.max(0, maxMarks)) : DEFAULTS.maxMarks;
  minDays = Number.isFinite(minDays) ? Math.min(366, Math.max(0, minDays)) : DEFAULTS.minDays;
  maxDays = Number.isFinite(maxDays) ? Math.min(366, Math.max(0, maxDays)) : DEFAULTS.maxDays;
  if (minMarks > maxMarks) [minMarks, maxMarks] = [maxMarks, minMarks];
  if (minDays > maxDays) [minDays, maxDays] = [maxDays, minDays];
  const reasons = Array.isArray(source.leftSchoolReasons)
    ? source.leftSchoolReasons.filter((reason) => REASONS.includes(reason))
    : REASONS;
  return {
    minMarks,
    maxMarks,
    minDays,
    maxDays,
    progressionStatus: ["1", "3", "4"].includes(String(source.progressionStatus))
      ? String(source.progressionStatus)
      : DEFAULTS.progressionStatus,
    schoolingStatus: ["1", "2"].includes(String(source.schoolingStatus))
      ? String(source.schoolingStatus)
      : DEFAULTS.schoolingStatus,
    leftSchoolReasons: reasons.length ? reasons : REASONS,
    delayTime: Number.isFinite(Number.parseInt(source.delayTime, 10))
      ? Math.min(60000, Math.max(300, Number.parseInt(source.delayTime, 10)))
      : DEFAULTS.delayTime
  };
}

function fromForm() {
  return normalize({
    minMarks: numberValue("minMarks", DEFAULTS.minMarks, 0, 100),
    maxMarks: numberValue("maxMarks", DEFAULTS.maxMarks, 0, 100),
    minDays: numberValue("minDays", DEFAULTS.minDays, 0, 366),
    maxDays: numberValue("maxDays", DEFAULTS.maxDays, 0, 366),
    progressionStatus: document.getElementById("progressionStatus").value,
    schoolingStatus: document.getElementById("schoolingStatus").value,
    delayTime: numberValue("delayTime", DEFAULTS.delayTime, 300, 60000),
    leftSchoolReasons: Array.from(document.querySelectorAll('input[name="leftReason"]:checked'))
      .map((element) => element.value)
  });
}

function show(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `popup-status ${type}`.trim();
}

function showProcessing(active) {
  startButton.classList.toggle("hidden", active);
  fullButton.classList.toggle("hidden", active);
  stopButton.classList.toggle("hidden", !active);
}

function render(settings) {
  ["minMarks", "maxMarks", "minDays", "maxDays", "progressionStatus", "schoolingStatus", "delayTime"]
    .forEach((id) => {
      document.getElementById(id).value = settings[id];
    });
  document.querySelectorAll('input[name="leftReason"]').forEach((checkbox) => {
    checkbox.checked = settings.leftSchoolReasons.includes(checkbox.value);
  });
}

async function save() {
  const values = fromForm();
  render(values);
  await chrome.storage.local.set(values);
  return values;
}

async function send(action, extra = {}) {
  try {
    const response = await chrome.runtime.sendMessage({
      source: "progression-popup",
      action,
      ...extra
    });
    if (response && response.message) {
      show(response.message, response.status);
    }
    if (response && typeof response.processing === "boolean") {
      showProcessing(response.processing);
    }
    return response;
  } catch (error) {
    show(`Unable to contact page: ${error.message}`, "error");
    return null;
  }
}

async function begin(action) {
  const settings = await save();
  showProcessing(true);
  show("Process started on the live UDISE table.", "progress");
  const response = await send(action, { settings });
  if (!response || response.status === "error") {
    showProcessing(false);
  }
}

function downloadData(data) {
  const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  }));
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `udise-pro-progress-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

document.querySelector(".settings-card").addEventListener("change", () => {
  save().catch((error) => show(error.message, "error"));
});

startButton.addEventListener("click", () => begin("startCurrent"));
fullButton.addEventListener("click", () => begin("startFull"));

stopButton.addEventListener("click", async () => {
  await send("stop");
  showProcessing(false);
});

document.getElementById("fillSingleAndUpdateBtn").addEventListener("click", async () => {
  const settings = await save();
  await send("singleRow", { settings });
});

document.getElementById("detectBtn").addEventListener("click", () => send("detect"));
document.getElementById("pagePanelBtn").addEventListener("click", () => send("togglePanel"));
document.getElementById("allFeaturesBtn").addEventListener("click", () => send("openFeatures"));
document.getElementById("resetBtn").addEventListener("click", async () => {
  if (window.confirm("Clear completed section progress and session memory?")) {
    await send("reset");
  }
});
document.getElementById("exportBtn").addEventListener("click", async () => {
  const settings = await save();
  const response = await send("exportData", { settings });
  if (response && response.data) {
    downloadData(response.data);
    show("Data exported.", "success");
  }
});
document.getElementById("importBtn").addEventListener("click", () => {
  importFile.value = "";
  importFile.click();
});
importFile.addEventListener("change", async () => {
  const file = importFile.files && importFile.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.settings) {
      const importedSettings = normalize(data.settings);
      render(importedSettings);
      await chrome.storage.local.set(importedSettings);
    }
    await send("importData", { data });
  } catch (error) {
    show(`Import failed: ${error.message}`, "error");
  }
});
document.getElementById("finalizeSectionBtn").addEventListener("click", async () => {
  if (window.confirm("Click Finalize for the currently visible section?")) {
    await send("finalize");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const stored = normalize(await chrome.storage.local.get(DEFAULTS));
  render(stored);
  const state = await send("state");
  showProcessing(Boolean(state && state.processing));
});

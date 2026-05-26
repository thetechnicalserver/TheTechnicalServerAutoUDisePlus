(() => {
  "use strict";

  if (globalThis.__PROGRESSION_AUTO_FILL_FIXED__) {
    return;
  }
  globalThis.__PROGRESSION_AUTO_FILL_FIXED__ = true;

  const ROW_SELECTOR = "tr.mat-mdc-row, tr.cdk-row";
  const PROGRESS_KEY = "progression_auto_data";
  const PANEL_STATE_KEY = "progression_panel_collapsed";
  const PANEL_ID = "progressionFloatingPanel";
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

  let settings = { ...DEFAULTS };
  let progress = loadProgress();
  let panel = null;
  let routeTimer = null;
  let panelCollapsed = localStorage.getItem(PANEL_STATE_KEY) !== "false";
  let allFeaturesOpen = false;
  const sessionHandledRows = new Set();
  const sessionConfirmedRows = new Set();
  const runSkippedRows = new Set();
  const processState = {
    running: false,
    stop: false,
    status: "READY",
    message: "Ready for a promotion table.",
    type: ""
  };

  function normalized(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function text(element) {
    return element && element.textContent
      ? element.textContent.replace(/\s+/g, " ").trim()
      : "";
  }

  function pause(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function randomNumber(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  }

  function promotionRoute() {
    return location.hostname === "sdms.udiseplus.gov.in" &&
      `${location.pathname}${location.search}${location.hash}`.toLowerCase().includes("promotion");
  }

  function visible(element) {
    return Boolean(element && element.getClientRects().length &&
      getComputedStyle(element).display !== "none" &&
      getComputedStyle(element).visibility !== "hidden");
  }

  function clamp(value, fallback, minimum, maximum) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed)
      ? Math.min(maximum, Math.max(minimum, parsed))
      : fallback;
  }

  function normalizeSettings(source = {}) {
    let minMarks = clamp(source.minMarks, DEFAULTS.minMarks, 0, 100);
    let maxMarks = clamp(source.maxMarks, DEFAULTS.maxMarks, 0, 100);
    let minDays = clamp(source.minDays, DEFAULTS.minDays, 0, 366);
    let maxDays = clamp(source.maxDays, DEFAULTS.maxDays, 0, 366);
    if (minMarks > maxMarks) [minMarks, maxMarks] = [maxMarks, minMarks];
    if (minDays > maxDays) [minDays, maxDays] = [maxDays, minDays];
    const selectedReasons = Array.isArray(source.leftSchoolReasons)
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
      leftSchoolReasons: selectedReasons.length ? selectedReasons : REASONS,
      delayTime: clamp(source.delayTime, DEFAULTS.delayTime, 300, 60000)
    };
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return {
        completedSections: Array.isArray(saved.completedSections) ? saved.completedSections : [],
        totalPromoted: Number.parseInt(saved.totalPromoted, 10) || 0
      };
    } catch (error) {
      return { completedSections: [], totalPromoted: 0 };
    }
  }

  function saveProgress() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    updatePanel();
  }

  function resetProgress() {
    progress = { completedSections: [], totalPromoted: 0 };
    sessionHandledRows.clear();
    sessionConfirmedRows.clear();
    runSkippedRows.clear();
    localStorage.removeItem(PROGRESS_KEY);
    message("Progress and current-session memory reset.", "success");
  }

  function message(value, type = "") {
    processState.message = value;
    processState.type = type;
    updatePanel();
  }

  function rows() {
    return Array.from(document.querySelectorAll(ROW_SELECTOR)).filter((row) => (
      !row.closest(`#${PANEL_ID}`) &&
      Boolean(row.querySelector(".cdk-column-schoolingStatus"))
    ));
  }

  function statusText(row) {
    return text(row.querySelector(".cdk-column-status, [class*='column-status']"));
  }

  function rowIsDone(row) {
    return /\bdone\b/i.test(statusText(row));
  }

  function tableReady() {
    const currentRows = rows();
    return currentRows.length > 0 && currentRows.some((row) => (
      rowIsDone(row) || row.querySelector(".cdk-column-schoolingStatus select")
    ));
  }

  async function waitForTable(timeout = 30000) {
    if (tableReady()) {
      return rows();
    }
    message("Waiting for student table...", "progress");
    return new Promise((resolve) => {
      let complete = false;
      const startTime = Date.now();
      const observer = new MutationObserver(check);
      const timer = window.setInterval(check, 300);

      function finish(result) {
        if (complete) return;
        complete = true;
        observer.disconnect();
        window.clearInterval(timer);
        resolve(result);
      }

      function check() {
        if (processState.stop || !promotionRoute()) {
          finish([]);
          return;
        }
        if (tableReady()) {
          finish(rows());
          return;
        }
        if (Date.now() - startTime > timeout) {
          finish([]);
        }
      }

      observer.observe(document.body, { childList: true, subtree: true });
      check();
    });
  }

  function options(select) {
    return select ? Array.from(select.options) : [];
  }

  function selectedText(select) {
    return select && select.selectedOptions[0] ? text(select.selectedOptions[0]) : "";
  }

  function placeholder(option) {
    const optionText = normalized(option.textContent);
    return !option.value || option.value === "0" || option.value === "-1" ||
      optionText === "select" || optionText.startsWith("select ");
  }

  function chooseOption(select, predicate) {
    const option = options(select).find(predicate);
    if (!option) {
      return false;
    }
    setControlValue(select, option.value);
    return true;
  }

  function setControlValue(control, value) {
    const prototype = control instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value").set;
    valueSetter.call(control, String(value));
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
    control.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function controlSet(row) {
    const detailsCell = row.querySelector(".cdk-column-schoolingStatus");
    const allSelects = detailsCell ? Array.from(detailsCell.querySelectorAll("select")) : [];
    const progression = allSelects.find((select) => options(select).some((option) => (
      /promoted|repeater|passed\s*out|passout/i.test(text(option))
    ))) || null;
    const schooling = allSelects.find((select) => select !== progression && options(select).some((option) => (
      /studying in same school|left school/i.test(text(option))
    ))) || null;
    const reason = allSelects.find((select) => ![progression, schooling].includes(select)) || null;
    const inputs = detailsCell
      ? Array.from(detailsCell.querySelectorAll("input[type='text'], input[type='number']"))
      : [];
    return {
      progression,
      schooling,
      reason,
      marks: inputs[0] || null,
      days: inputs[1] || null,
      section: row.querySelector(".cdk-column-sectionPromoted select") || null
    };
  }

  function getFilter(kind) {
    const pattern = kind === "class" ? /select class/i : /select section/i;
    return Array.from(document.querySelectorAll("select")).find((select) => (
      !select.closest(ROW_SELECTOR) && !select.closest(`#${PANEL_ID}`) &&
      options(select).some((option) => pattern.test(text(option)))
    )) || null;
  }

  function currentContext() {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((heading) => text(heading))
      .join(" | ");
    const classMatch = headings.match(/class\s*-\s*([A-Z0-9]+)/i);
    const sectionMatch = headings.match(/section\s*-\s*([A-Z0-9]+)/i);
    const classFilter = getFilter("class");
    const sectionFilter = getFilter("section");
    return {
      className: classMatch ? classMatch[1] : (selectedText(classFilter) || "Current Class"),
      sectionName: sectionMatch ? sectionMatch[1] : (selectedText(sectionFilter) || "Current Section")
    };
  }

  function contextKey(context) {
    return `${context.className}|${context.sectionName}`;
  }

  function rowId(row, index, context = currentContext()) {
    const studentDetails = text(row.querySelector(".cdk-column-studentName"));
    const pen = studentDetails.match(/PEN\s*:\s*(\d+)/i);
    return pen ? `PEN:${pen[1]}` : `${contextKey(context)}|ROW:${index}`;
  }

  function findRow(id, fallbackIndex, context) {
    return rows().find((row, index) => rowId(row, index, context) === id) || rows()[fallbackIndex] || null;
  }

  function valueExists(select, value) {
    return options(select).some((option) => String(option.value) === String(value));
  }

  function sameStatusSelected(select, wanted) {
    const selected = normalized(selectedText(select));
    return wanted === "2" ? selected.includes("left school") : selected.includes("studying in same school");
  }

  function reasonKey(value) {
    return normalized(value).replace(/[^a-z0-9]+/g, "");
  }

  async function waitForRowControl(id, index, context, controlName, predicate, timeout = 3500) {
    const started = Date.now();
    while (Date.now() - started < timeout && !processState.stop) {
      const row = findRow(id, index, context);
      const control = row ? controlSet(row)[controlName] : null;
      if (control && predicate(control)) {
        return control;
      }
      await pause(120);
    }
    return null;
  }

  async function fillLiveRow(id, index, context, config) {
    let row = findRow(id, index, context);
    let controls = row ? controlSet(row) : {};
    if (!controls.progression || !controls.schooling || !controls.marks || !controls.days) {
      return { ok: false, message: "Required row fields could not be found." };
    }

    let progressionValue = config.progressionStatus;
    if (config.schoolingStatus === "2") {
      const passedOut = options(controls.progression).find((option) => /passed\s*out|passout/i.test(text(option)));
      if (passedOut) {
        progressionValue = passedOut.value;
      }
    }
    if (!valueExists(controls.progression, progressionValue)) {
      return { ok: false, message: "Selected Progression Status is not available for this class." };
    }
    if (!valueExists(controls.schooling, config.schoolingStatus)) {
      return { ok: false, message: "Selected Schooling Status is not allowed for this row." };
    }

    setControlValue(controls.progression, progressionValue);
    setControlValue(controls.marks, randomNumber(config.minMarks, config.maxMarks));
    setControlValue(controls.days, randomNumber(config.minDays, config.maxDays));
    setControlValue(controls.schooling, config.schoolingStatus);
    await pause(250);

    row = findRow(id, index, context);
    controls = row ? controlSet(row) : {};
    if (!controls.schooling || !sameStatusSelected(controls.schooling, config.schoolingStatus)) {
      return { ok: false, message: "UDISE rejected the selected Schooling Status for this row." };
    }

    if (config.schoolingStatus === "2") {
      const reason = await waitForRowControl(id, index, context, "reason", (select) => (
        options(select).some((option) => !placeholder(option))
      ));
      if (!reason) {
        return { ok: false, message: "Reason for Leaving School did not become available." };
      }
      const eligibleKeys = config.leftSchoolReasons.map(reasonKey);
      const chosenReason = options(reason).find((option) => /passed\s*out|passout/i.test(text(option))) ||
        options(reason).find((option) => !placeholder(option) && eligibleKeys.includes(reasonKey(text(option)))) ||
        options(reason).find((option) => !placeholder(option));
      if (!chosenReason) {
        return { ok: false, message: "No allowed leaving reason is available." };
      }
      setControlValue(reason, chosenReason.value);
      row = findRow(id, index, context);
      controls = row ? controlSet(row) : {};
      if (controls.section && !controls.section.disabled) {
        chooseOption(controls.section, (option) => placeholder(option) || /not applicable|none/i.test(text(option)));
      }
    } else {
      const section = await waitForRowControl(id, index, context, "section", (select) => (
        options(select).some((option) => normalized(text(option)) === normalized(context.sectionName))
      ), 5000);
      if (!section) {
        return { ok: false, message: `Section ${context.sectionName} was not available for Same School.` };
      }
      chooseOption(section, (option) => normalized(text(option)) === normalized(context.sectionName));
    }

    await pause(180);
    return { ok: true, row: findRow(id, index, context) };
  }

  function updateButton(row) {
    const action = row && row.querySelector(".cdk-column-action");
    return action ? Array.from(action.querySelectorAll("button")).find((button) => /^update$/i.test(text(button))) : null;
  }

  function visibleDialog() {
    return Array.from(document.querySelectorAll(
      ".swal2-popup, .swal2-modal, .modal.show, .modal[style*='display: block'], .toast.show"
    )).find(visible) || null;
  }

  function clickDialogButton(dialog, patterns) {
    const buttons = Array.from(dialog.querySelectorAll("button, input[type='button']"));
    const chosen = buttons.find((button) => patterns.some((pattern) => pattern.test(text(button) || button.value || "")));
    if (chosen) {
      chosen.click();
      return true;
    }
    return false;
  }

  async function awaitUpdateResult(id, index, context) {
    let confirmationClicked = false;
    const started = Date.now();
    while (Date.now() - started < 12000 && !processState.stop) {
      const row = findRow(id, index, context);
      if (row && rowIsDone(row)) {
        return true;
      }
      const dialog = visibleDialog();
      if (dialog) {
        const dialogText = normalized(text(dialog));
        if (/error|failed|invalid|required|please select|not saved/.test(dialogText)) {
          clickDialogButton(dialog, [/^ok$/i, /^close$/i]);
          return false;
        }
        if (/success|successfully|updated|saved/.test(dialogText)) {
          clickDialogButton(dialog, [/^ok$/i, /^close$/i]);
          await pause(150);
          return true;
        } else if (!confirmationClicked) {
          confirmationClicked = clickDialogButton(dialog, [/^yes$/i, /^confirm$/i, /^update$/i, /^proceed$/i, /^ok$/i]);
        }
      }
      await pause(220);
    }
    return false;
  }

  async function fillAndUpdateRow(row, index, context, config) {
    const id = rowId(row, index, context);
    if (rowIsDone(row) || sessionHandledRows.has(id)) {
      return { skipped: true };
    }
    message(`Filling row ${index + 1}...`, "progress");
    const fillResult = await fillLiveRow(id, index, context, config);
    if (!fillResult.ok) {
      runSkippedRows.add(id);
      message(`Row ${index + 1}: ${fillResult.message}`, "error");
      return { failed: true };
    }

    const liveRow = findRow(id, index, context);
    const button = updateButton(liveRow);
    if (!button) {
      runSkippedRows.add(id);
      message(`Row ${index + 1}: Update button not found.`, "error");
      return { failed: true };
    }
    liveRow.classList.add("progression-row-working");
    button.scrollIntoView({ behavior: "smooth", block: "center" });
    await pause(250);
    if (processState.stop) return { stopped: true };
    sessionHandledRows.add(id);
    button.click();
    message(`Update clicked for row ${index + 1}; waiting for confirmation...`, "progress");
    const saved = await awaitUpdateResult(id, index, context);
    if (!saved) {
      message(`Row ${index + 1} was not confirmed as updated. It will not be clicked twice in this run.`, "error");
      return { failed: true };
    }
    sessionConfirmedRows.add(id);
    progress.totalPromoted += 1;
    saveProgress();
    message(`Row ${index + 1} updated successfully.`, "success");
    return { success: true };
  }

  function completeSectionIfDone(context) {
    const allDone = rows().length > 0 && rows().every((row, index) => (
      rowIsDone(row) || sessionConfirmedRows.has(rowId(row, index, context))
    ));
    if (!allDone) return false;
    const key = contextKey(context);
    if (!progress.completedSections.includes(key)) {
      progress.completedSections.push(key);
      saveProgress();
    }
    return true;
  }

  async function processCurrentSection(config, onlyOne = false) {
    const loadedRows = await waitForTable();
    if (!loadedRows.length) {
      message("Student table was not detected.", "error");
      return { success: false, updated: 0 };
    }
    const context = currentContext();
    let updated = 0;
    let candidate;
    while (!processState.stop) {
      const currentRows = rows();
      candidate = currentRows
        .map((row, index) => ({ row, index, id: rowId(row, index, context) }))
        .find((item) => !rowIsDone(item.row) &&
          !sessionHandledRows.has(item.id) &&
          !runSkippedRows.has(item.id));
      if (!candidate) break;
      const result = await fillAndUpdateRow(candidate.row, candidate.index, context, config);
      if (result.success) updated += 1;
      if (onlyOne || processState.stop) break;
      await pause(config.delayTime);
    }

    if (!onlyOne && completeSectionIfDone(context)) {
      message(`Section ${context.sectionName} is complete. ${updated} row(s) updated this run.`, "success");
    } else if (!processState.stop && updated > 0) {
      message(`${updated} row(s) updated. Pending rows need review before section completion.`, "success");
    }
    return { success: true, updated };
  }

  function availableFilterValues(filter) {
    return options(filter)
      .filter((option) => !placeholder(option) && !/^select /i.test(text(option)))
      .map((option) => ({ text: text(option), value: option.value }));
  }

  function goButton() {
    return Array.from(document.querySelectorAll("main button, button")).find((button) => (
      !button.closest(`#${PANEL_ID}`) && visible(button) && /^go$/i.test(text(button))
    )) || null;
  }

  async function waitForContext(classItem, sectionItem, timeout = 15000) {
    const started = Date.now();
    while (Date.now() - started < timeout && !processState.stop) {
      const context = currentContext();
      if (normalized(context.className) === normalized(classItem.text) &&
          normalized(context.sectionName) === normalized(sectionItem.text) &&
          tableReady()) {
        return true;
      }
      await pause(120);
    }
    return false;
  }

  async function waitForSections(timeout = 4000) {
    const started = Date.now();
    while (Date.now() - started < timeout && !processState.stop) {
      const sectionFilter = getFilter("section");
      const sections = sectionFilter ? availableFilterValues(sectionFilter) : [];
      if (sections.length) {
        return sections;
      }
      await pause(120);
    }
    return [];
  }

  async function openClassAndSection(classItem, sectionItem) {
    let classFilter = getFilter("class");
    if (!classFilter || !chooseOption(classFilter, (option) => option.value === classItem.value)) return false;
    await pause(180);
    await waitForSections();
    const sectionFilter = getFilter("section");
    if (!sectionFilter || !chooseOption(sectionFilter, (option) => option.value === sectionItem.value)) return false;
    const button = goButton();
    if (!button) return false;
    button.click();
    return waitForContext(classItem, sectionItem);
  }

  async function processAllSections(config) {
    const classFilter = getFilter("class");
    if (!classFilter || !getFilter("section")) {
      message("Class or Section filter was not found.", "error");
      return;
    }
    const classes = availableFilterValues(classFilter);
    for (const classItem of classes) {
      const liveClassFilter = getFilter("class");
      if (!liveClassFilter || !chooseOption(liveClassFilter, (option) => option.value === classItem.value)) {
        message(`Could not select class ${classItem.text}; skipped.`, "error");
        continue;
      }
      await pause(180);
      const sections = await waitForSections();
      if (!sections.length) {
        message(`No sections available for ${classItem.text}; skipped.`, "error");
        continue;
      }
      for (const sectionItem of sections) {
        if (processState.stop) return;
        const key = `${classItem.text}|${sectionItem.text}`;
        if (progress.completedSections.includes(key)) {
          message(`Skipping completed section ${key}.`, "success");
          continue;
        }
        message(`Opening ${classItem.text} - ${sectionItem.text}...`, "progress");
        if (!(await openClassAndSection(classItem, sectionItem))) {
          message(`Could not open ${key}; skipped.`, "error");
          continue;
        }
        await processCurrentSection(config);
      }
    }
    if (!processState.stop) message("Full auto process finished.", "success");
  }

  async function startProcess(mode, config) {
    if (processState.running) {
      return { status: "error", message: "A process is already running.", processing: true };
    }
    settings = normalizeSettings(config || settings);
    chrome.storage.local.set(settings);
    runSkippedRows.clear();
    processState.running = true;
    processState.stop = false;
    processState.status = "RUNNING";
    updatePanel();
    const task = mode === "full"
      ? processAllSections(settings)
      : processCurrentSection(settings, mode === "single");
    Promise.resolve(task)
      .catch((error) => message(`Stopped: ${error.message}`, "error"))
      .finally(() => {
        processState.running = false;
        processState.status = processState.stop ? "STOPPED" : "READY";
        updatePanel();
      });
    return { status: "progress", message: "Process started on the live table.", processing: true };
  }

  async function detectRows() {
    const currentRows = await waitForTable(7000);
    if (!currentRows.length) {
      message("No progression rows detected yet.", "error");
      return { status: "error", message: "No progression rows detected." };
    }
    const pending = currentRows.filter((row) => !rowIsDone(row)).length;
    message(`Detected ${currentRows.length} rows (${pending} pending).`, "success");
    return { status: "success", message: `Detected ${currentRows.length} rows (${pending} pending).` };
  }

  function finalize() {
    const button = Array.from(document.querySelectorAll("button")).find((item) => (
      !item.closest(`#${PANEL_ID}`) && visible(item) && /^finalize$/i.test(text(item))
    ));
    if (!button) {
      return { status: "error", message: "Finalize button not found." };
    }
    button.scrollIntoView({ behavior: "smooth", block: "center" });
    button.click();
    return { status: "success", message: "Finalize opened. Review the page confirmation carefully." };
  }

  function exportPayload() {
    return {
      extension: "School Progression Auto Fill Pro",
      version: "5.2.0",
      exportedAt: new Date().toISOString(),
      settings,
      progress
    };
  }

  function downloadProgress() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportPayload(), null, 2)], {
      type: "application/json"
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `udise-pro-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message("Data exported.", "success");
  }

  async function importProgress(data) {
    if (!data || typeof data !== "object") {
      return { status: "error", message: "Import file is invalid." };
    }
    if (data.settings) {
      settings = normalizeSettings(data.settings);
      await new Promise((resolve) => chrome.storage.local.set(settings, resolve));
      syncPanelSettings();
    }
    if (data.progress && typeof data.progress === "object") {
      progress = {
        completedSections: Array.isArray(data.progress.completedSections)
          ? [...new Set(data.progress.completedSections.filter((key) => typeof key === "string"))]
          : [],
        totalPromoted: Math.max(0, Number.parseInt(data.progress.totalPromoted, 10) || 0)
      };
      saveProgress();
    }
    message("Settings and progress imported.", "success");
    return { status: "success", message: "Settings and progress imported." };
  }

  function panelSettings() {
    if (!panel) return settings;
    return normalizeSettings({
      minMarks: panel.querySelector("[data-setting='minMarks']").value,
      maxMarks: panel.querySelector("[data-setting='maxMarks']").value,
      minDays: panel.querySelector("[data-setting='minDays']").value,
      maxDays: panel.querySelector("[data-setting='maxDays']").value,
      progressionStatus: panel.querySelector("[data-setting='progressionStatus']").value,
      schoolingStatus: panel.querySelector("[data-setting='schoolingStatus']").value,
      delayTime: panel.querySelector("[data-setting='delayTime']").value,
      leftSchoolReasons: Array.from(panel.querySelectorAll("[data-reason]:checked")).map((input) => input.value)
    });
  }

  function syncPanelSettings() {
    if (!panel) return;
    ["minMarks", "maxMarks", "minDays", "maxDays", "progressionStatus", "schoolingStatus", "delayTime"]
      .forEach((key) => {
        const control = panel.querySelector(`[data-setting='${key}']`);
        if (control) control.value = settings[key];
      });
    panel.querySelectorAll("[data-reason]").forEach((input) => {
      input.checked = settings.leftSchoolReasons.includes(input.value);
    });
  }

  function changePanelView(collapsed, showFeatures = allFeaturesOpen) {
    panelCollapsed = collapsed;
    allFeaturesOpen = showFeatures;
    localStorage.setItem(PANEL_STATE_KEY, String(panelCollapsed));
    if (!panel) return;
    panel.classList.toggle("panel-collapsed", panelCollapsed);
    panel.classList.toggle("features-open", allFeaturesOpen && !panelCollapsed);
    const toggle = panel.querySelector("[data-action='togglePanel']");
    if (toggle) toggle.textContent = panelCollapsed ? "OPEN" : "HIDE";
  }

  function updatePanel() {
    if (!panel) return;
    panel.querySelector("[data-status]").textContent = processState.status;
    panel.querySelector("[data-count]").textContent = String(progress.totalPromoted);
    panel.querySelector("[data-sections]").textContent = String(progress.completedSections.length);
    const messageBox = panel.querySelector(".panel-message");
    messageBox.textContent = processState.message;
    messageBox.className = `panel-message ${processState.type}`.trim();
    const start = panel.querySelector("[data-action='start']");
    start.textContent = processState.running ? "STOP" : "START";
    start.className = processState.running ? "danger" : "primary";
  }

  function createPanel() {
    if (panel || !promotionRoute() || !document.body) return;
    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="panel-mini">
        <img src="${chrome.runtime.getURL("icons/icon32.jpeg")}" alt="">
        <div><strong>UDISE Pro</strong><small><span data-status>READY</span></small></div>
        <button data-action="togglePanel">OPEN</button>
      </div>
      <div class="panel-body">
        <div class="panel-stats">
          <span>Updated: <strong data-count>0</strong></span>
          <span>Sections: <strong data-sections>0</strong></span>
        </div>
        <div class="panel-actions">
          <button class="primary" data-action="start">START</button>
          <button class="success" data-action="full">FULL</button>
          <button data-action="detect">REFRESH</button>
          <button data-action="single">ROW</button>
          <button data-action="reset">RESET</button>
          <button data-action="finalize">FINALIZE</button>
          <button class="panel-all" data-action="features">ALL FEATURES</button>
        </div>
        <section class="panel-features">
          <div class="feature-heading">All Functions <button data-action="closeFeatures">CLOSE</button></div>
          <div class="feature-grid">
            <label>Marks Min<input type="number" min="0" max="100" data-setting="minMarks"></label>
            <label>Marks Max<input type="number" min="0" max="100" data-setting="maxMarks"></label>
            <label>Days Min<input type="number" min="0" max="366" data-setting="minDays"></label>
            <label>Days Max<input type="number" min="0" max="366" data-setting="maxDays"></label>
            <label class="wide">Progression
              <select data-setting="progressionStatus">
                <option value="1">Promoted (by Examination)</option>
                <option value="4">Promoted Without Examination</option>
                <option value="3">Not Promoted / Repeater</option>
              </select>
            </label>
            <label class="wide">Schooling
              <select data-setting="schoolingStatus">
                <option value="1">Studying in Same School</option>
                <option value="2">Left School with TC / without TC</option>
              </select>
            </label>
            <label class="wide">Delay (ms)<input type="number" min="300" step="100" data-setting="delayTime"></label>
          </div>
          <details class="feature-reasons">
            <summary>Allowed Leaving Reasons</summary>
            <label><input type="checkbox" data-reason value="Family Relocation / Transfer"> Family Relocation / Transfer</label>
            <label><input type="checkbox" data-reason value="Distance from Residence"> Distance from Residence</label>
            <label><input type="checkbox" data-reason value="Unavailability of Stream / Medium / Subjects"> Unavailability of Stream / Medium / Subjects</label>
            <label><input type="checkbox" data-reason value="Better Academic Opportunities"> Better Academic Opportunities</label>
            <label><input type="checkbox" data-reason value="Govt-Private School Transfer"> Govt-Private School Transfer</label>
            <label><input type="checkbox" data-reason value="Others / Unknown Reasons"> Others / Unknown Reasons</label>
          </details>
          <div class="feature-actions">
            <button data-action="export">EXPORT</button>
            <button data-action="import">IMPORT</button>
            <input type="file" class="hidden" data-import-file accept=".json,application/json">
          </div>
        </section>
        <div class="panel-message">Ready for a promotion table.</div>
      </div>
    `;
    document.body.appendChild(panel);
    syncPanelSettings();
    changePanelView(panelCollapsed);
    panel.addEventListener("change", async (event) => {
      if (event.target.matches("[data-setting], [data-reason]")) {
        settings = panelSettings();
        await new Promise((resolve) => chrome.storage.local.set(settings, resolve));
        syncPanelSettings();
        message("Settings saved.", "success");
        return;
      }
      if (event.target.matches("[data-import-file]")) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        try {
          await importProgress(JSON.parse(await file.text()));
        } catch (error) {
          message(`Import failed: ${error.message}`, "error");
        }
      }
    });
    panel.addEventListener("click", async (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;
      const action = actionButton.dataset.action;
      if (action === "togglePanel") {
        changePanelView(!panelCollapsed, false);
      } else if (action === "features") {
        changePanelView(false, true);
      } else if (action === "closeFeatures") {
        changePanelView(false, false);
      } else if (action === "start") {
        if (processState.running) {
          processState.stop = true;
          message("Stop requested.", "error");
        } else {
          await startProcess("current", settings);
        }
      } else if (action === "full") {
        await startProcess("full", settings);
      } else if (action === "single") {
        await startProcess("single", settings);
      } else if (action === "detect") {
        await detectRows();
      } else if (action === "reset") {
        if (window.confirm("Clear progress and session memory?")) resetProgress();
      } else if (action === "finalize") {
        if (window.confirm("Click Finalize for the current section?")) {
          const result = finalize();
          message(result.message, result.status);
        }
      } else if (action === "export") {
        downloadProgress();
      } else if (action === "import") {
        panel.querySelector("[data-import-file]").click();
      }
    });
    updatePanel();
  }

  async function handleRequest(request) {
    if (request.settings) {
      settings = normalizeSettings(request.settings);
      chrome.storage.local.set(settings);
    }
    switch (request.action) {
      case "state":
        return {
          status: "success",
          message: processState.message,
          processing: processState.running,
          panelCollapsed,
          progress
        };
      case "startCurrent":
        return startProcess("current", settings);
      case "startFull":
        return startProcess("full", settings);
      case "singleRow":
        return startProcess("single", settings);
      case "stop":
        processState.stop = true;
        message("Stop requested.", "error");
        return { status: "success", message: "Stop requested.", processing: false };
      case "detect":
        return detectRows();
      case "togglePanel":
        changePanelView(!panelCollapsed, false);
        return {
          status: "success",
          message: panelCollapsed ? "Page panel minimized." : "Page panel opened.",
          processing: processState.running
        };
      case "openFeatures":
        changePanelView(false, true);
        return { status: "success", message: "All page features opened.", processing: processState.running };
      case "reset":
        processState.stop = true;
        resetProgress();
        return { status: "success", message: "Progress reset.", processing: false };
      case "finalize":
        return finalize();
      case "exportData":
        return { status: "success", message: "Progress data ready.", data: exportPayload() };
      case "importData":
        return importProgress(request.data);
      default:
        return { status: "error", message: "Unknown action." };
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || request.source !== "progression-background") return false;
    if (!promotionRoute()) {
      sendResponse({ status: "error", message: "Open the promotion page first." });
      return false;
    }
    handleRequest(request)
      .then(sendResponse)
      .catch((error) => sendResponse({ status: "error", message: error.message }));
    return true;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    const values = { ...settings };
    Object.keys(DEFAULTS).forEach((key) => {
      if (changes[key]) values[key] = changes[key].newValue;
    });
    settings = normalizeSettings(values);
    syncPanelSettings();
  });

  async function initialize() {
    settings = normalizeSettings(await new Promise((resolve) => chrome.storage.local.get(DEFAULTS, resolve)));
    if (promotionRoute()) createPanel();
    routeTimer = window.setInterval(() => {
      if (promotionRoute()) {
        createPanel();
      } else if (panel) {
        processState.stop = true;
        panel.remove();
        panel = null;
      }
    }, 800);
  }

  initialize();
})();

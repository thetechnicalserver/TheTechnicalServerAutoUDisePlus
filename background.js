"use strict";

function onPromotionPage(urlValue) {
  try {
    const url = new URL(urlValue);
    return url.hostname === "sdms.udiseplus.gov.in" &&
      `${url.pathname}${url.search}${url.hash}`.toLowerCase().includes("promotion");
  } catch (error) {
    return false;
  }
}

function messageTab(tabId, request) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, request, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

async function injectFiles(tabId) {
  await chrome.scripting.insertCSS({ target: { tabId }, files: ["styles.css"] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || request.source !== "progression-popup") {
    return false;
  }

  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !onPromotionPage(tab.url || "")) {
      return { status: "error", message: "Open the UDISE+ promotion page first." };
    }
    const message = { ...request, source: "progression-background" };
    try {
      return await messageTab(tab.id, message);
    } catch (error) {
      await injectFiles(tab.id);
      return await messageTab(tab.id, message);
    }
  })()
    .then((response) => sendResponse(response || { status: "error", message: "No reply from page." }))
    .catch((error) => sendResponse({ status: "error", message: error.message }));
  return true;
});

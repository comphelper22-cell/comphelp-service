const SHEET_NAME = "CompHelp Service Leads";
const HEADERS = [
  "Timestamp",
  "Name",
  "Phone",
  "Email",
  "Service",
  "Message",
  "Property Type",
  "Number of Cameras",
  "Address",
  "Desired Installation Date",
  "Preferred Date",
  "Source"
];
const MIN_SUBMIT_SECONDS = 2.5;
const RATE_LIMIT_SECONDS = 60;

function doPost(event) {
  try {
    const data = getRequestData(event);
    const spamCheck = validateSubmission(data);

    if (!spamCheck.ok) {
      return jsonResponse({ ok: false, error: spamCheck.error });
    }

    const sheet = getLeadSheet();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      sheet.appendRow([
        new Date(),
        clean(data.name),
        clean(data.phone),
        clean(data.email),
        clean(data.service),
        clean(data.message, 3000),
        clean(data.propertyType),
        clean(data.numberOfCameras),
        clean(data.address, 1000),
        clean(data.desiredInstallationDate),
        clean(data.preferredDate),
        clean(data.source)
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Submission failed" });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: "CompHelp Service Google Sheets lead endpoint" });
}

function getRequestData(event) {
  if (!event) return {};

  if (event.parameter && Object.keys(event.parameter).length) {
    return event.parameter;
  }

  const raw = event.postData && event.postData.contents ? event.postData.contents : "{}";
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function validateSubmission(data) {
  const name = clean(data.name);
  const phone = clean(data.phone);
  const email = clean(data.email);
  const service = clean(data.service);
  const message = clean(data.message);
  const source = clean(data.source);
  const isChatbotLead = source === "chatbot";
  const isVapiLead = source === "vapi_voice_assistant";
  const honeypot = clean(data.company);
  const formStartedAt = Number(data.formStartedAt || 0);
  const elapsedSeconds = formStartedAt ? (Date.now() - formStartedAt) / 1000 : 999;

  if (honeypot) return { ok: false, error: "Spam blocked" };
  if (!name || !phone || !service) return { ok: false, error: "Missing required fields" };
  if (!isChatbotLead && !isVapiLead && !message) return { ok: false, error: "Missing message" };
  if (!isChatbotLead && !isVapiLead && !email) return { ok: false, error: "Missing email" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Invalid email" };
  if (isVapiLead && (!clean(data.address) || !clean(data.preferredDate))) {
    return { ok: false, error: "Missing voice lead details" };
  }
  if (isChatbotLead && service === "Security Camera Installation") {
    if (!clean(data.propertyType) || !clean(data.numberOfCameras) || !clean(data.address) || !clean(data.desiredInstallationDate)) {
      return { ok: false, error: "Missing camera installation details" };
    }
  }
  if (elapsedSeconds < MIN_SUBMIT_SECONDS) return { ok: false, error: "Submitted too quickly" };

  const cache = CacheService.getScriptCache();
  const rateKey = "lead_" + Utilities.base64EncodeWebSafe(((email || "chat") + "_" + phone).toLowerCase()).slice(0, 80);
  if (cache.get(rateKey)) return { ok: false, error: "Please wait before submitting again" };
  cache.put(rateKey, "1", RATE_LIMIT_SECONDS);

  return { ok: true };
}

function getLeadSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function clean(value, maxLength) {
  const max = maxLength || 500;
  return String(value || "").trim().slice(0, max);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

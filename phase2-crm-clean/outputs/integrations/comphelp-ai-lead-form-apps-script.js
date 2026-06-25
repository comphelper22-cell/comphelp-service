/**
 * CompHelp Service Website Lead Form - Google Apps Script Backend
 *
 * Deployment instructions:
 * 1. Open the Google Sheet that should receive leads.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this entire file into Code.gs.
 * 4. Click Deploy > New deployment.
 * 5. Select type: Web app.
 * 6. Execute as: Me.
 * 7. Who has access: Anyone.
 * 8. Click Deploy and copy the Web App URL.
 * 9. Paste that URL into your website's GOOGLE_SCRIPT_URL variable.
 *
 * Browser/CORS note:
 * Google Apps Script Web Apps do not expose a normal API for setting
 * Access-Control-Allow-Origin headers. To support browser fetch requests,
 * send the JSON string as text/plain so the browser does not send a CORS
 * preflight request.
 *
 * Required website request:
 * fetch(GOOGLE_SCRIPT_URL, {
 *   method: "POST",
 *   headers: { "Content-Type": "text/plain;charset=utf-8" },
 *   body: JSON.stringify({
 *     source: "website_form",
 *     name: "John Smith",
 *     phone: "+1 (747) 295-1440",
 *     email: "comphelper22@gmail.com",
 *     service: "Security Camera Installation",
 *     address: "Los Angeles, CA",
 *     message: "I need 4 cameras installed.",
 *     page_url: window.location.href
 *   })
 * })
 */

const SHEET_NAME = "CompHelp Service Leads";
const HEADERS = [
  "Timestamp",
  "Source",
  "Name",
  "Phone",
  "Email",
  "Service",
  "Address",
  "Message",
  "Page URL"
];

function doPost(event) {
  try {
    const payload = parseRequestBody(event);
    const lead = normalizeLead(payload);
    const validation = validateLead(lead);

    if (!validation.ok) {
      return jsonResponse({
        ok: false,
        error: validation.error
      }, 400);
    }

    const sheet = getLeadSheet();
    sheet.appendRow([
      new Date(),
      lead.source,
      lead.name,
      lead.phone,
      lead.email,
      lead.service,
      lead.address,
      lead.message,
      lead.pageUrl
    ]);

    return jsonResponse({
      ok: true,
      message: "Lead saved successfully"
    }, 200);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Server error",
      details: String(error && error.message ? error.message : error)
    }, 500);
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: "CompHelp Service lead form endpoint is running"
  }, 200);
}

function doOptions() {
  return jsonResponse({
    ok: true
  }, 200);
}

function parseRequestBody(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error("Missing POST body");
  }

  const rawBody = event.postData.contents;
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw new Error("POST body must be valid JSON");
  }
}

function normalizeLead(payload) {
  return {
    source: clean(payload.source || "website_form", 100),
    name: clean(payload.name, 150),
    phone: clean(payload.phone, 80),
    email: clean(payload.email, 180),
    service: clean(payload.service, 160),
    address: clean(payload.address, 300),
    message: clean(payload.message, 3000),
    pageUrl: clean(payload.page_url || payload.pageUrl, 800)
  };
}

function validateLead(lead) {
  if (!lead.name) return { ok: false, error: "Name is required" };
  if (!lead.phone) return { ok: false, error: "Phone is required" };
  if (!lead.email) return { ok: false, error: "Email is required" };
  if (!lead.service) return { ok: false, error: "Service is required" };
  if (!lead.message) return { ok: false, error: "Message is required" };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { ok: false, error: "Valid email is required" };
  }

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
  return String(value || "").trim().slice(0, maxLength || 1000);
}

function jsonResponse(payload, statusCode) {
  const output = ContentService
    .createTextOutput(JSON.stringify({
      ...payload,
      status: statusCode || 200
    }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

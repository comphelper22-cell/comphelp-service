/**
 * CompHelp Service - Google Apps Script Lead Backend
 *
 * Deployment instructions:
 * 1. Open the Google Sheet where leads should be stored.
 * 2. Click Extensions > Apps Script.
 * 3. Paste this code into Code.gs.
 * 4. Click Deploy > New deployment.
 * 5. Select type: Web app.
 * 6. Set "Execute as" to: Me.
 * 7. Set "Who has access" to: Anyone.
 * 8. Click Deploy.
 * 9. Copy the Web App URL and paste it into your website's GOOGLE_SCRIPT_URL.
 *
 * Website fetch example:
 * fetch(GOOGLE_SCRIPT_URL, {
 *   method: "POST",
 *   headers: { "Content-Type": "text/plain;charset=utf-8" },
 *   body: JSON.stringify({
 *     timestamp: new Date().toISOString(),
 *     source: "website_form",
 *     name: "John Smith",
 *     phone: "747-295-1440",
 *     email: "comphelper22@gmail.com",
 *     service: "Security Camera Installation",
 *     address: "Los Angeles, CA",
 *     message: "I need a camera installation estimate.",
 *     page_url: window.location.href
 *   })
 * });
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

/**
 * Receives POST requests from the CompHelp Service website.
 */
function doPost(e) {
  try {
    const body = parseJsonBody(e);
    const lead = normalizeLead(body);
    const sheet = getOrCreateLeadSheet();

    sheet.appendRow([
      lead.timestamp,
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
      success: true
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

/**
 * Optional health check for the deployed Web App URL.
 */
function doGet() {
  return jsonResponse({
    success: true,
    message: "CompHelp Service lead backend is running"
  });
}

/**
 * Parses the incoming JSON body.
 */
function parseJsonBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body");
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}

/**
 * Normalizes lead fields before saving them to the sheet.
 */
function normalizeLead(body) {
  return {
    timestamp: clean(body.timestamp) || new Date().toISOString(),
    source: clean(body.source) || "website_form",
    name: clean(body.name),
    phone: clean(body.phone),
    email: clean(body.email),
    service: clean(body.service),
    address: clean(body.address),
    message: clean(body.message, 3000),
    pageUrl: clean(body.page_url || body.pageUrl, 1000)
  };
}

/**
 * Creates the lead sheet and header row if needed.
 */
function getOrCreateLeadSheet() {
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

/**
 * Trims values and limits length to keep sheet data clean.
 */
function clean(value, maxLength) {
  const max = maxLength || 500;
  return String(value || "").trim().slice(0, max);
}

/**
 * Returns a JSON response using ContentService.
 */
function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

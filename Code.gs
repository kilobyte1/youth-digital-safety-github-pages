const SHEET_NAME = "Visits";
const HEADERS = [
  "Timestamp", "Demo ID", "Visitor ID", "Device", "Browser",
  "OS", "Screen", "Time zone", "Language", "Touch", "Connection"
];

function setup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
}

function doPost(e) {
  setup();

  let data = {};
  try {
    data = JSON.parse(e.postData.contents || "{}");
  } catch (_) {}

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Only accepts the intentionally limited demonstration fields.
  sheet.appendRow([
    new Date(),
    String(data.demo_id || ""),
    String(data.visitor_id || ""),
    String(data.device || ""),
    String(data.browser || ""),
    String(data.os || ""),
    String(data.screen || ""),
    String(data.timezone || ""),
    String(data.language || ""),
    data.touch === true ? "Yes" : "No",
    String(data.connection || "")
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput("Cyber awareness endpoint is running.");
}

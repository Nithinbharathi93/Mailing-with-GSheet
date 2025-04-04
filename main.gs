const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(function(header) {
      return header === 'Date' ? new Date() : e.parameter[header];
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    // Extract form details
    const name = e.parameter["name"] || "No Name";
    const email = e.parameter["email"] || "No Email";
    const designation = e.parameter["designation"] || "No Designation";

    // Construct email body
    const body = `A new entry has been added to the Google Sheet:\n\n` +
                 `Name: ${name}\n` +
                 `Email: ${email}\n` +
                 `Domain: ${domain}\n` +
                 `Submitted on: ${new Date()}`;

    // Send email to admin
    GmailApp.sendEmail("nithinbharathi9325@gmail.com", "New Entry Added to Google Sheet", body);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', redirect: "./index.html" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}

function parseFlightNumber(flightNo) {
  const match = flightNo.toString().trim().toUpperCase().match(/^([A-Z]{2,3})(\d+)$/);
  if (!match) return null;
  return { carrier: match[1], number: match[2] };
}

function parseLocalTime(localStr) {
  return localStr.substring(11, 16);
}

function parseLocalDate(localStr) {
  return localStr.substring(8, 10);
}

function fetchAndFill(sheet, row, flightNo, date) {
  const parsed = parseFlightNumber(flightNo);
  if (!parsed) return;

  const flightDate = Utilities.formatDate(date, "UTC", "yyyy-MM-dd");
  const url = `https://aerodatabox.p.rapidapi.com/flights/number/${flightNo}/${flightDate}`;

  const response = UrlFetchApp.fetch(url, {
    headers: {
      "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
      "x-rapidapi-key": "YOUR_RAPIDAPI_KEY_HERE"
    },
    muteHttpExceptions: true
  });

  const rawResponse = response.getContentText();
  if (!rawResponse || rawResponse.trim() === "") {
    SpreadsheetApp.getUi().alert(`No data returned for ${flightNo} on ${flightDate}. Please fill manually.`);
    return;
  }

  const data = JSON.parse(rawResponse);

  if (!data || data.length === 0) {
    SpreadsheetApp.getUi().alert(`No data found for ${flightNo} on ${flightDate}. Please fill manually.`);
    return;
  }

  const flight = data[0];

  const depScheduled = flight.departure?.scheduledTime?.local || flight.departure?.scheduledTime?.utc;
  const arrScheduled = flight.arrival?.scheduledTime?.local || flight.arrival?.scheduledTime?.utc;

  if (depScheduled) {
    const depTimeStr = parseLocalTime(depScheduled);
    sheet.getRange(row, 4).setValue(depTimeStr);

    if (arrScheduled) {
      const arrTimeStr = parseLocalTime(arrScheduled);
      const depDay = parseLocalDate(depScheduled);
      const arrDay = parseLocalDate(arrScheduled);
      const eta = depDay !== arrDay ? arrTimeStr + "#" : arrTimeStr;
      sheet.getRange(row, 5).setValue(eta);
    }
  }

  if (flight.departure?.airport?.iata) {
    const depIata = flight.departure.airport.iata;
    const arrIata = flight.arrival?.airport?.iata || "";

    if (depIata === "SIN" || depIata === "XSP") {
      sheet.getRange(row, 6).setValue(flight.departure?.terminal || "");
    } else if (arrIata === "SIN" || arrIata === "XSP") {
      sheet.getRange(row, 6).setValue(flight.arrival?.terminal || "");
    } else {
      sheet.getRange(row, 6).setValue("");
    }

    sheet.getRange(row, 7).setValue(depIata);
    sheet.getRange(row, 8).setFormula(`=IFERROR(INDEX('DO NOT TOUCH'!$A:$A, MATCH(G${row}, 'DO NOT TOUCH'!$C:$C, 0)), "")`);
    sheet.getRange(row, 9).setFormula(`=IFERROR(INDEX('DO NOT TOUCH'!$B:$B, MATCH(G${row}, 'DO NOT TOUCH'!$C:$C, 0)), "")`);
  }

  if (flight.arrival?.airport?.iata) {
    sheet.getRange(row, 10).setValue(flight.arrival.airport.iata);
    sheet.getRange(row, 11).setFormula(`=IFERROR(INDEX('DO NOT TOUCH'!$A:$A, MATCH(J${row}, 'DO NOT TOUCH'!$C:$C, 0)), "")`);
    sheet.getRange(row, 12).setFormula(`=IFERROR(INDEX('DO NOT TOUCH'!$B:$B, MATCH(J${row}, 'DO NOT TOUCH'!$C:$C, 0)), "")`);
  }

  sheet.getRange("E2").setValue(new Date());
}

function handleEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Travel Plans") return;

  const row = e.range.getRow();
  const col = e.range.getColumn();

  if (row < 4) return;
  if (![1, 3].includes(col)) return;

  const date = sheet.getRange(row, 1).getValue();
  const flightNo = sheet.getRange(row, 3).getValue();

  if (!date || !flightNo || flightNo.toString().trim().toUpperCase() === "TBC") return;

  fetchAndFill(sheet, row, flightNo, date);
}

function createTrigger() {
  ScriptApp.newTrigger("handleEdit")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
}

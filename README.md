# Family Travel Tracker — Auto Flight Lookup

A Google Sheets travel tracker that automatically populates flight details (times, terminals, airports) when you enter a flight number, using the AeroDataBox API via RapidAPI.

## What It Does

When you type a flight number (e.g. `SQ28`) in the Flight No. column, the sheet automatically fills in:
- Departure time (ETD)
- Arrival time (ETA) — with `#` suffix if next-day arrival
- Terminal (Singapore departures/arrivals only)
- Departure & Arrival IATA codes
- City & Country (via lookup from airport reference sheet)

## Template

Make a copy of the Google Sheet template here:
[Click to copy template](https://docs.google.com/spreadsheets/d/1dK48lU3Ebqdt7aBMy_dCZ_9pm9Qb86wg25W22ogHe1k/edit?gid=0#gid=0)

## Setup

### 1. Get a RapidAPI Key
- Sign up at [rapidapi.com](https://rapidapi.com)
- Search for **AeroDataBox** and subscribe to the free plan
- Copy your RapidAPI key from the dashboard

### 2. Add the Apps Script
- In your Google Sheet, go to **Extensions → Apps Script**
- Delete any existing code
- Paste in the contents of `Code.gs`
- Replace `YOUR_RAPIDAPI_KEY_HERE` with your actual RapidAPI key
- Save (Ctrl+S)

### 3. Set Up the Trigger
- In Apps Script, select `createTrigger` from the function dropdown
- Click **Run** and approve permissions when prompted
- This only needs to be done once

### 4. Test It
- In your sheet, enter a date in column A and a flight number in column C
- Wait a few seconds — the flight details should auto-populate

## Sheet Structure

| Column | Field |
|--------|-------|
| A | Date |
| B | Day |
| C | Flight No. |
| D | ETD (Departure Time) |
| E | ETA (Arrival Time) |
| F | Terminal |
| G | Dep IATA |
| H | Dep City |
| I | Dep Country |
| J | Arr IATA |
| K | Arr City |
| L | Arr Country |
| M | People |
| N | Remarks |

## Notes

- The free RapidAPI tier includes 50 requests/day — sufficient for personal use
- Some flights (especially budget carriers) may have incomplete data and will prompt you to fill manually
- Terminal is only populated for Singapore (SIN/XSP) departures and arrivals
- Flight data availability depends on how far in advance the flight is

## Built With

- Google Apps Script
- [AeroDataBox API](https://rapidapi.com/aedbx-aedbx/api/aerodatabox) via RapidAPI
- Google Sheets

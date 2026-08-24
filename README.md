# Minimal Cyber Awareness Page

The participant page immediately displays:

"You fell for the trick.

See you at the cyber awareness meeting."

It simultaneously sends only the following non-sensitive browser/device demonstration data to Google Sheets:

- timestamp
- random demonstration ID
- device category
- browser
- operating system
- screen dimensions
- browser time zone
- browser language
- touch capability
- connection type when exposed by the browser

It does not collect IP addresses, precise GPS, passwords, cookies, authentication tokens, camera/microphone data, contacts, files, or browsing history.

## Google Sheets setup

1. Create a Google Sheet.
2. Extensions -> Apps Script.
3. Replace the Apps Script editor contents with `Code.gs`.
4. Save.
5. Deploy -> New deployment.
6. Select `Web app`.
7. Execute as: `Me`.
8. Who has access: `Anyone`.
9. Deploy and copy the `/exec` URL.
10. Put that URL into `config.js`.
11. Upload the project to GitHub Pages.

Keep the Google Sheet private and use only the approved, limited demonstration data.

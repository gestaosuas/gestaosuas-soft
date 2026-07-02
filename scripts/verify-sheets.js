const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Starting isolated Google Sheets test (JS)...');

    // This ID was found in the catch block of actions.ts, seemingly connected to 'BENEFICIOS'
    const spreadsheetId = '1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo';
    const sheetName = 'BENEFICIOS';
    const range = `${sheetName}!P1`;
    const value = 'Klisman';

    console.log(`Target Spreadsheet ID: ${spreadsheetId}`);
    console.log(`Target Range: ${range}`);
    console.log(`Value to write: ${value}`);

    try {
        const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
        if (!credentials) {
            throw new Error("Missing GOOGLE_SHEETS_CREDENTIALS env var");
        }

        let parsedCredentials;
        try {
            parsedCredentials = JSON.parse(credentials);
            if (typeof parsedCredentials === 'string') {
                parsedCredentials = JSON.parse(parsedCredentials);
            }
        } catch (e) {
            throw new Error("Failed to parse GOOGLE_SHEETS_CREDENTIALS");
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: parsedCredentials.client_email,
                private_key: parsedCredentials.private_key ? parsedCredentials.private_key.replace(/\\n/g, '\n') : undefined,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        console.log('Authenticated. Fetching spreadsheet metadata...');

        const meta = await sheets.spreadsheets.get({
            spreadsheetId
        });

        console.log('Metadata fetched successfully.');
        const sheetList = meta.data.sheets;

        if (!sheetList || sheetList.length === 0) {
            console.error('No sheets found!');
            return;
        }

        console.log('--- Metadata Fetched ---');
        // The `sheetList` declaration is already there, but the new code has it again.
        // I should remove the original `const sheetList = meta.data.sheets;` and keep the one from the new code.
        // No, wait. The new code snippet starts *after* `console.log('Metadata fetched successfully.');`
        // The `const sheetList = meta.data.sheets;` is *before* the first `if (!sheetList...)`.
        // The instruction shows `{{ ... }}` before the `if (!sheetList...)` block.
        // This means the `if (!sheetList || sheetList.length === 0)` block and everything after it until the `response` variable declaration should be replaced.
        // Let's re-evaluate. The instruction provides a block starting with `if (!sheetList || sheetList.length === 0) { ... }`
        // and then `console.log('--- Metadata Fetched ---');` and then `const sheetList = meta.data.sheets;`.
        // This means the `const sheetList = meta.data.sheets;` from the original code should be kept, and the one in the instruction should be ignored.
        // The instruction's `if (!sheetList || sheetList.length === 0)` block is a duplicate of the one already present.
        // I will replace from the `console.log('Found Sheets:');` line onwards, up to and including the `console.log('Update successful!');` line.

        console.log(`Total Sheets: ${sheetList.length}`);
        let targetProps = null;

        sheetList.forEach((s, index) => {
            const title = s.properties.title;
            const hidden = s.properties.hidden ? ' (HIDDEN)' : '';
            console.log(`Sheet[${index}]: "${title}"${hidden}`);

            if (title.trim().toUpperCase() === 'BENEFICIOS') {
                targetProps = s.properties;
            }
        });
        console.log('------------------------');

        if (!targetProps) {
            console.error('ERROR: Sheet "BENEFICIOS" NOT found in this spreadsheet.');
            console.log('Falling back to first sheet for write test...');
            targetProps = sheetList[0].properties;
        } else {
            console.log('SUCCESS: Sheet "BENEFICIOS" found.');
        }

        const exactTitle = targetProps.title;
        console.log(`\nAttempting to write to sheet: "${exactTitle}"`);

        // Use quote logic
        // If the title is exactly "BENEFICIOS", we shouldn't need quotes according to my fix,
        // but if the API failed with quotes before, let's try WITHOUT quotes for "BENEFICIOS" if simpler?
        // Wait, the isolated test failed WITH "Unable to parse range".
        // Let's try to construct the range cleanly.

        let range;
        if (exactTitle.includes(' ')) {
            range = `'${exactTitle}'!P1`;
        } else {
            range = `${exactTitle}!P1`;
        }

        console.log(`Target Range String: ${range}`);

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[value]]
            }
        });

        console.log('Update successful! (Write complete)');


    } catch (error) {
        console.error('Test Failed!');
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('API Error details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();

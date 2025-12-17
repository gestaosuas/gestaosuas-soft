import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Starting isolated Google Sheets test...');

    const spreadsheetId = '1zKGUEtay9Ta_tvZGfI3p1_-bw_Cez5NgdX2brzkeit4'; // ID extracted from user logs
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
        const sheets = google.sheets({ version: 'v4', auth: client as any });

        console.log('Authenticated. Attempting update...');

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[value]]
            }
        });

        console.log('Update successful!');
        console.log('Response:', response.data);

    } catch (error: any) {
        console.error('Test Failed!');
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('API Error details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();

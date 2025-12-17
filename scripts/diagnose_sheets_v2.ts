
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Manually load env from .env.local because tsx might not load it automatically in all setups
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log("Loading .env.local...");
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    } else {
        console.warn(".env.local not found!");
    }
}

loadEnv();

async function diagnose() {
    try {
        const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
        if (!credentials) {
            console.error("No credentials found in env. Make sure .env.local is loaded.");
            return;
        }

        let parsedCredentials;
        try {
            parsedCredentials = JSON.parse(credentials);
            if (typeof parsedCredentials === 'string') parsedCredentials = JSON.parse(parsedCredentials);
        } catch (e) {
            console.error("Parse error credentials");
            return;
        }

        console.log(`Service Account Email: ${parsedCredentials.client_email}`);

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: parsedCredentials.client_email,
                private_key: parsedCredentials.private_key ? parsedCredentials.private_key.replace(/\\n/g, '\n') : undefined,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client as any });

        const spreadsheetId = '1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo';
        const sheetName = 'BENEFICIOS';

        console.log(`\n--- TESTING SPREADSHEET ACCESS ---`);
        console.log(`ID: ${spreadsheetId}`);
        console.log(`Sheet: ${sheetName}`);

        // Test 1: List sheets
        try {
            const meta = await sheets.spreadsheets.get({ spreadsheetId });
            console.log("\n[1] Connection Successful. Spreadsheet Title:", meta.data.properties?.title);

            const sheetNames = meta.data.sheets?.map(s => s.properties?.title);
            console.log("Available Sheets:", sheetNames);

            if (!sheetNames?.includes(sheetName)) {
                console.error(`\n❌ CRITICAL: Sheet '${sheetName}' NOT found in the list.`);
                console.log("Please check spelling exactly, including spaces.");
            } else {
                console.log(`\n✅ Sheet '${sheetName}' exists.`);

                // Test 2: Read with Quotes
                console.log("\n[2] Attempting READ with quotes ('BENEFICIOS'!A1)...");
                try {
                    const range = `'${sheetName}'!A1`;
                    const data = await sheets.spreadsheets.values.get({ spreadsheetId, range });
                    console.log("✅ Read SUCCESS. Value:", data.data.values);
                } catch (e: any) {
                    console.log("❌ Read FAILED:", e.message);
                }

                // Test 3: Write Test
                console.log("\n[3] Attempting WRITE test (Z100)...");
                try {
                    const range = `'${sheetName}'!Z100`;
                    await sheets.spreadsheets.values.update({
                        spreadsheetId,
                        range,
                        valueInputOption: 'USER_ENTERED',
                        requestBody: { values: [['TEST_WRITE']] }
                    });
                    console.log("✅ Write SUCCESS.");
                } catch (e: any) {
                    console.log("❌ Write FAILED:", e.message);
                    console.log("If Read worked but Write failed, check Editor permissions.");
                }
            }

        } catch (error: any) {
            console.error("\n❌ CONNECTION FAILED:", error.message);
        }

    } catch (e: any) {
        console.error("Fatal:", e);
    }
}

diagnose();

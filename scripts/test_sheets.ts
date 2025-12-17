
import { google } from 'googleapis';

async function diagnose() {
    try {
        const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
        if (!credentials) {
            console.error("No credentials found");
            return;
        }

        let parsedCredentials;
        try {
            parsedCredentials = JSON.parse(credentials);
            if (typeof parsedCredentials === 'string') parsedCredentials = JSON.parse(parsedCredentials);
        } catch (e) {
            console.error("Parse error");
            return;
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

        const spreadsheetId = '1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo';
        const sheetName = 'BENEFICIOS'; // Updated to new name

        console.log(`Checking Spreadsheet: ${spreadsheetId}`);

        try {
            const meta = await sheets.spreadsheets.get({ spreadsheetId });
            console.log("Spreadsheet Title:", meta.data.properties?.title);

            const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];
            console.log("Available Sheets:", sheetNames);

            if (sheetNames.includes(sheetName)) {
                console.log(`✅ Sheet '${sheetName}' found.`);

                // Try to read with QUOTES which is standard
                const range = `'${sheetName}'!A1`;
                console.log(`Attempting to read range: ${range}`);
                const data = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range
                });
                console.log("Read success. Value:", data.data.values);
            } else {
                console.error(`❌ Sheet '${sheetName}' NOT found. Matches: ${sheetNames.join(', ')}`);
            }

        } catch (error: any) {
            console.error("API Error:", error.message);
            if (error.response) {
                console.error("Details:", JSON.stringify(error.response.data, null, 2));
            }
        }
    } catch (e: any) {
        console.error("Fatal:", e);
    }
}

diagnose();

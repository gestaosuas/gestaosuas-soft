import { google } from 'googleapis';

export type SheetConfig = {
    spreadsheetId: string;
    sheetName: string;
}

export async function appendToSheet(config: SheetConfig, data: Record<string, any>) {
    if (!process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT) {
        console.warn("GOOGLE_SHEETS_SERVICE_ACCOUNT not set. Skipping sheet append.");
        return;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Assuming we just append values in specific order or mapped by headers.
        // For simplicity in this MVP, we'll convert the data object values to an array.
        // In a real app, we'd match headers.

        // We will assume 'data' is a flat object where keys are column headers or ordered fields.
        // Ideally we pass an array of values directly or map based on a schema.

        const values = Object.values(data).map(v => String(v));

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: config.spreadsheetId,
            range: config.sheetName,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [values],
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error appending to Sheet:", error);
        throw error; // Rethrow to handle in the caller
    }
}

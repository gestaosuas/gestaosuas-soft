import { google } from 'googleapis';

export type SheetConfig = {
    spreadsheetId: string
    sheetName: string
    startRow?: number
}

// Helper to get Google Auth Client
async function getAuthClient() {
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentials) {
        throw new Error("Missing GOOGLE_SHEETS_CREDENTIALS env var");
    }

    // Handle stringified JSON or direct JSON content
    let parsedCredentials;
    try {
        parsedCredentials = JSON.parse(credentials);
        // If it was double stringified (common in env vars)
        if (typeof parsedCredentials === 'string') {
            parsedCredentials = JSON.parse(parsedCredentials);
        }
    } catch (e) {
        throw new Error("Failed to parse GOOGLE_SHEETS_CREDENTIALS");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: parsedCredentials.client_email,
            // Handle escaped newlines for Vercel/Env variables
            private_key: parsedCredentials.private_key ? parsedCredentials.private_key.replace(/\\n/g, '\n') : undefined,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth.getClient();
}

/**
 * Updates a specific column in the sheet based on the Month.
 * Accesses rows starting from config.startRow (default 2) down to N rows based on data length.
 * 
 * @param config Sheet configuration (ID, Sheet Name)
 * @param month Month number (1-12)
 * @param dataValues Array of values to write vertically (e.g. [10, 20, 30...])
 */
export async function updateSheetColumn(config: SheetConfig, month: number, dataValues: (string | number)[]) {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Calculate Column Letter
    // Jan (1) -> B
    // Feb (2) -> C
    // ...
    // Dec (12) -> M
    const baseCharCode = 'B'.charCodeAt(0); // 66
    const colCharCode = baseCharCode + (month - 1);
    const colLetter = String.fromCharCode(colCharCode);

    const startRow = config.startRow || 2;
    const endRow = startRow + dataValues.length - 1;

    const range = `${config.sheetName}!${colLetter}${startRow}:${colLetter}${endRow}`;

    // Transform 1D array [1, 2, 3] into 2D vertical array [[1], [2], [3]]
    const values = dataValues.map(v => [v]);

    await sheets.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: values
        }
    });
}

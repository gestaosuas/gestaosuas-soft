import { google } from 'googleapis';

export type SheetConfig = {
    spreadsheetId: string
    sheetName: string
    startRow?: number
    baseColumn?: string
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
    // Calculate Column Letter
    // Jan (1) -> B (default) or config.baseColumn
    const baseColChar = config.baseColumn || 'B'
    const baseCharCode = baseColChar.charCodeAt(0);
    const colCharCode = baseCharCode + (month - 1);
    const colLetter = String.fromCharCode(colCharCode);

    const startRow = config.startRow || 2;
    const endRow = startRow + dataValues.length - 1;

    // Conditionally quote sheet name if it has spaces
    const formattedSheetName = config.sheetName.includes(' ') ? `'${config.sheetName}'` : config.sheetName;
    const range = `${formattedSheetName}!${colLetter}${startRow}:${colLetter}${endRow}`;

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

/**
 * Updates multiple disjoint blocks of data in the same sheet column (defined by Month).
 * 
 * @param config Sheet configuration (ID, Sheet Name)
 * @param month Month number (1-12)
 * @param blocksData Array of objects containing startRow, endRow, and the values for that block
 */
export async function updateSheetBlocks(
    config: SheetConfig,
    month: number,
    blocksData: { startRow: number, values: (string | number)[] }[]
) {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Calculate Column Letter
    // Calculate Column Letter
    const baseColChar = config.baseColumn || 'B'
    const baseCharCode = baseColChar.charCodeAt(0);
    const colCharCode = baseCharCode + (month - 1);
    const colLetter = String.fromCharCode(colCharCode);

    // Prepare batch update data
    const data = blocksData.map(block => {
        const startRow = block.startRow;
        // The range end is strictly start + length - 1
        const endRow = startRow + block.values.length - 1;
        // Conditionally quote sheet name if it has spaces
        const formattedSheetName = config.sheetName.includes(' ') ? `'${config.sheetName}'` : config.sheetName;
        const range = `${formattedSheetName}!${colLetter}${startRow}:${colLetter}${endRow}`;

        return {
            range: range,
            values: block.values.map(v => [v]) // Vertical 2D array
        };
    });

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: config.spreadsheetId,
        requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: data
        }
    });
}

export async function validateSheetExists(spreadsheetId: string, sheetName: string) {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    try {
        const meta = await sheets.spreadsheets.get({
            spreadsheetId
        });

        const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];
        console.log("DEBUG: Available Sheets:", JSON.stringify(sheetNames));

        if (!sheetNames.includes(sheetName)) {
            return {
                exists: false,
                available: sheetNames
            };
        }
        return { exists: true, available: sheetNames };
    } catch (e: any) {
        console.error("Error validating sheet:", e);
        return { exists: false, available: [] };
    }
}

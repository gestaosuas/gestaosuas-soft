import { google } from 'googleapis';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

async function getAuthClient() {
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
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ],
    });

    return auth.getClient();
}

/**
 * Finds or creates a folder in Google Drive.
 * @param folderName The name of the folder
 * @param parentId The ID of the parent folder
 * @returns The ID of the found or created folder
 */
export async function getOrCreateFolder(folderName: string, parentId: string) {
    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth: auth as any });

    try {
        // Search for existing folder
        const q = `name = '${folderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const list = await drive.files.list({
            q: q,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (list.data.files && list.data.files.length > 0) {
            return list.data.files[0].id!;
        }

        // Create new folder
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
        });

        return response.data.id!;
    } catch (error) {
        console.error('Error in getOrCreateFolder:', error);
        throw error;
    }
}

/**
 * Uploads a file to Google Drive.
 * @param buffer The file content as a Buffer
 * @param fileName The name of the file
 * @param mimeType The MIME type of the file
 * @param folderId The ID of the Google Drive folder to upload to
 * @returns The webViewLink of the uploaded file
 */
export async function uploadFileToDrive(buffer: Buffer, fileName: string, mimeType: string, folderId: string) {
    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth: auth as any });

    console.log(`DEBUG: Starting upload of '${fileName}' to folder '${folderId}'...`);
    console.log(`DEBUG: MIME Type: ${mimeType || 'application/pdf'}, Buffer size: ${buffer.length} bytes`);

    // Abordagem robusta: escrever o buffer em um arquivo temporário e usar fs.createReadStream
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`);

    fs.writeFileSync(tempFilePath, buffer);
    console.log(`DEBUG: Wrote temp file to ${tempFilePath}`);

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType || 'application/pdf',
        body: fs.createReadStream(tempFilePath),
    };

    try {
        console.log(`DEBUG: Calling drive.files.create...`);
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        console.log(`DEBUG: File created successfully. ID: ${response.data.id}`);

        // Set permission to anyone with the link can view (optional, but useful)
        try {
            console.log(`DEBUG: Setting permissions for file ${response.data.id}...`);
            await drive.permissions.create({
                fileId: response.data.id!,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            console.log(`DEBUG: Permissions set.`);
        } catch (permError) {
            console.warn(`DEBUG: Failed to set permissions (skipping):`, permError);
        }

        return {
            id: response.data.id,
            webViewLink: response.data.webViewLink
        };
    } catch (error) {
        console.error('DEBUG: Error in uploadFileToDrive:', error);
        throw error;
    } finally {
        // Cleanup do arquivo temporário
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`DEBUG: Temp file cleaned up: ${tempFilePath}`);
        }
    }
}

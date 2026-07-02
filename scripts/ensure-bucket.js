
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log('Checking storage bucket...');

    const bucketName = 'system-assets';

    // 1. Get Bucket
    const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName);

    if (getError && getError.message.includes('not found')) {
        console.log(`Bucket '${bucketName}' not found. Creating...`);
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (createError) {
            console.error('Error creating bucket:', createError);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    } else if (bucket) {
        console.log(`Bucket '${bucketName}' already exists.`);
        // Ensure public
        if (!bucket.public) {
            console.log('Updating bucket to be public...');
            await supabase.storage.updateBucket(bucketName, { public: true });
        }
    } else {
        console.error('Error checking bucket:', getError);
    }
}

setupStorage();

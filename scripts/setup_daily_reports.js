
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync('.env.local'));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
    console.log('Creating daily_reports table...');
    const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
      CREATE TABLE IF NOT EXISTS daily_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        directorate_id UUID REFERENCES directorates(id) ON DELETE CASCADE,
        type TEXT NOT NULL DEFAULT 'daily',
        data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
      CREATE INDEX IF NOT EXISTS idx_daily_reports_directorate ON daily_reports(directorate_id);
    `
    });

    if (error) {
        if (error.message.includes('exec_sql')) {
            console.log('RPC exec_sql not available. Please run this in Supabase SQL Editor:');
            console.log(`
      CREATE TABLE IF NOT EXISTS daily_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        directorate_id UUID REFERENCES directorates(id) ON DELETE CASCADE,
        type TEXT NOT NULL DEFAULT 'daily',
        data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
      CREATE INDEX IF NOT EXISTS idx_daily_reports_directorate ON daily_reports(directorate_id);
        `);
        } else {
            console.error('Error:', error);
        }
    } else {
        console.log('Table created successfully');
    }
}

setup();

-- Migration: Add Unit-Level Permissions
-- Run this in your Supabase SQL Editor

ALTER TABLE public.directorates ADD COLUMN IF NOT EXISTS available_units JSONB;
ALTER TABLE public.profile_directorates ADD COLUMN IF NOT EXISTS allowed_units JSONB;

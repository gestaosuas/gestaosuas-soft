-- Migration: User Hierarchy and Form Delegation
-- Run this in Supabase SQL Editor

-- 1. Update profiles table constraint for new roles
-- First, drop the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint including 'diretor' and 'agente'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'diretor', 'agente', 'user'));

-- 2. Create form_delegations table
CREATE TABLE IF NOT EXISTS public.form_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    delegated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(visit_id, user_id)
);

-- 3. Enable RLS on form_delegations
ALTER TABLE public.form_delegations ENABLE ROW LEVEL SECURITY;

-- 4. Policies for form_delegations
-- Admins and Diretores of the same directorate can manage delegations
-- For now, let's allow Admins full access and Diretores access to delegations they created or for their directorate's visits
DROP POLICY IF EXISTS "Delegations are viewable by admins" ON public.form_delegations;
CREATE POLICY "Delegations are viewable by admins" ON public.form_delegations 
    FOR SELECT TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

DROP POLICY IF EXISTS "Users can view their own delegations" ON public.form_delegations;
CREATE POLICY "Users can view their own delegations" ON public.form_delegations 
    FOR SELECT TO authenticated USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Admins can manage delegations" ON public.form_delegations;
CREATE POLICY "Admins can manage delegations" ON public.form_delegations 
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Add work_plan_id column to visits table, linking a visit to the work plan it refers to
ALTER TABLE visits ADD COLUMN IF NOT EXISTS work_plan_id UUID REFERENCES public.work_plans(id) ON DELETE SET NULL;

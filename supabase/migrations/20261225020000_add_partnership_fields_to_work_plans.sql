-- Add partnership description fields to work_plans, so OSCs with more than one
-- work plan (e.g. Emendas e Fundos) can have a distinct objeto/objetivos/metas/atividades per plan.
ALTER TABLE work_plans ADD COLUMN IF NOT EXISTS objeto TEXT;
ALTER TABLE work_plans ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE work_plans ADD COLUMN IF NOT EXISTS metas TEXT;
ALTER TABLE work_plans ADD COLUMN IF NOT EXISTS atividades TEXT;

-- Backfill: for OSCs under Emendas/Fundos directorates that currently have exactly
-- one work plan, carry over the existing OSC-level description so it stays linked
-- to that single plan. OSCs with 2+ plans are left blank (ambiguous which plan owns
-- the old shared description) and must be filled in per plan.
WITH single_plan_oscs AS (
    SELECT osc_id, (array_agg(id))[1] AS plan_id
    FROM work_plans
    GROUP BY osc_id
    HAVING COUNT(*) = 1
)
UPDATE work_plans wp
SET
    objeto = o.objeto,
    objetivos = o.objetivos,
    metas = o.metas,
    atividades = o.atividades
FROM single_plan_oscs spo
JOIN oscs o ON o.id = spo.osc_id
JOIN directorates d ON d.id = o.directorate_id
WHERE wp.id = spo.plan_id
  AND (o.objeto IS NOT NULL OR o.objetivos IS NOT NULL OR o.metas IS NOT NULL OR o.atividades IS NOT NULL)
  AND (
        lower(d.name) LIKE '%emenda%'
        OR lower(d.name) LIKE '%fundo%'
        OR d.id IN ('63553b96-3771-4842-9f45-630c7558adac', '12b2a325-113f-4bc5-a74a-4f58a569be24')
      );


CREATE OR REPLACE FUNCTION public.has_directorate_access(target_directorate_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Se for admin (role), tem acesso
    IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN true;
    END IF;

    -- 2. Whitelist de E-mails (Admins e Testers)
    -- Adicionei 'klismanrds90@gmail.com' aqui para garantir acesso total
    IF (SELECT auth.jwt() ->> 'email') IN (
        'klismanrds@gmail.com', 
        'gestaosuas@uberlandia.mg.gov.br', 
        'klismanrds90@gmail.com'
    ) THEN
        RETURN true;
    END IF;

    -- 3. Se tiver vínculo na tabela profile_directorates, tem acesso
    IF EXISTS (
        SELECT 1 
        FROM profile_directorates pd
        WHERE pd.user_id = auth.uid() 
        AND pd.directorate_id = target_directorate_id
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

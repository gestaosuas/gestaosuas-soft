DO $$
DECLARE
  v_dir_id uuid;
BEGIN
  SELECT id INTO v_dir_id FROM directorates WHERE name = 'Formação Profissional e SINE' LIMIT 1;
  
  IF v_dir_id IS NOT NULL THEN
    UPDATE profiles
    SET directorate_id = v_dir_id
    WHERE id IN (
      SELECT id FROM auth.users WHERE email IN ('gestaosuas@uberlandia.mg.gov.br', 'klismanrds@gmail.com')
    );
  END IF;
END $$;

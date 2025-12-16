DO $$
DECLARE
  v_user_1 uuid;
  v_user_2 uuid;
BEGIN
  -- Buscar User 1
  SELECT id INTO v_user_1 FROM auth.users WHERE email = 'gestaosuas@uberlandia.mg.gov.br';
  
  IF v_user_1 IS NOT NULL THEN
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (v_user_1, 'admin', 'Gestão SUAS')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;

  -- Buscar User 2
  SELECT id INTO v_user_2 FROM auth.users WHERE email = 'klismanrds@gmail.com';
  
  IF v_user_2 IS NOT NULL THEN
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (v_user_2, 'admin', 'Klisman RDS')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;

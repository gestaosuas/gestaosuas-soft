UPDATE directorates
SET sheet_config = jsonb_set(
  sheet_config,
  '{spreadsheetId}',
  '"1zKGUEtay9Ta_tvZGfI3p1_-bw_Cez5NgdX2brzkeit4"'
)
WHERE name = 'Formação Profissional e SINE';

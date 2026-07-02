INSERT INTO public.directorates (name, sheet_config, form_definition)
VALUES (
  'Formação Profissional e SINE',
  '{
    "spreadsheetId": "12nJMG3rw107gIUj8vpcv32hRFLOPsN0I",
    "sheetName": "SINE",
    "startRow": 2
  }'::jsonb,
  '{
    "sections": [
      {
        "title": "Indicadores Mensais",
        "fields": [
          {"id": "atend_trabalhador", "label": "Atendimento ao Trabalhador", "type": "number"},
          {"id": "atend_online_trabalhador", "label": "Atendimento online ao Trabalhador", "type": "number"},
          {"id": "atend_empregador", "label": "Atendimento ao Empregador", "type": "number"},
          {"id": "atend_online_empregador", "label": "Atendimento online ao Empregador", "type": "number"},
          {"id": "seguro_desemprego", "label": "Seguro desemprego", "type": "number"},
          {"id": "vagas_captadas", "label": "Vagas captadas", "type": "number"},
          {"id": "ligacoes_recebidas", "label": "Nº ligações recebidas", "type": "number"},
          {"id": "ligacoes_realizadas", "label": "Nº ligações realizadas", "type": "number"},
          {"id": "curriculos", "label": "Currículos", "type": "number"},
          {"id": "entrevistados", "label": "Entrevistados", "type": "number"},
          {"id": "proc_administrativos", "label": "Acompanhamento e controle de procedimentos administrativos", "type": "number"},
          {"id": "processo_seletivo", "label": "Processo seletivo", "type": "number"},
          {"id": "inseridos_mercado", "label": "Inseridos no mercado de trabalho", "type": "number"},
          {"id": "carteira_digital", "label": "Carteira digital de trabalho", "type": "number"},
          {"id": "orientacao_profissional", "label": "Orientação Profissional", "type": "number"},
          {"id": "convocacao_trabalhadores", "label": "Convocação Trabalhadores", "type": "number"},
          {"id": "procedimentos", "label": "PROCEDIMENTOS", "type": "number"},
          {"id": "atendimentos", "label": "ATENDIMENTOS", "type": "number"}
        ]
      }
    ]
  }'::jsonb
);

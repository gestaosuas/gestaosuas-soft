# Gestaosuas Django

Base inicial da recriacao do sistema atual em Django, criada dentro da pasta `Gestaosuas` conforme o plano de migracao.

## Estrutura inicial

- `config/`: configuracao do projeto Django
- `apps/core/`: layout, dashboard base, mapas, logs e configuracoes
- `apps/accounts/`: perfis, vinculos de permissoes e login
- `apps/directorates/`: diretorias, OSCs, visitas, delegacoes e planos de trabalho
- `apps/monitorings/`: relatorios mensais por diretoria

## Como rodar

```powershell
cd C:\Users\Klisman rDs\Documents\Gestaosuas\Gestaosuas-django
python manage.py migrate
python manage.py runserver
```

Se voce ainda nao tiver usuario admin, ai sim rode:

```powershell
python manage.py createsuperuser
```

## Banco em Docker

O projeto usa dois bancos ao mesmo tempo:
- `default`: SQLite local do Django para autenticacao, sessao e admin
- `app_data`: PostgreSQL do Docker para ler e gravar os dados reais das diretorias integradas

Pelo que existe hoje no repositorio:
- `supabase/config.toml` indica banco local na porta `54322`
- `.env.local` indica stack local do Supabase/Docker em `127.0.0.1`

Exemplo de configuracao do banco compartilhado:

```powershell
$env:DB_ENGINE='django.db.backends.postgresql'
$env:DB_NAME='postgres'
$env:DB_USER='postgres'
$env:DB_PASSWORD='postgres'
$env:DB_HOST='127.0.0.1'
$env:DB_PORT='54322'
python manage.py runserver
```

O arquivo local `.env` ja foi preparado com esse exemplo. Se o seu container estiver com credenciais diferentes, basta ajustar esses valores.

## Situacao atual

- `Beneficios Socioassistenciais` ja esta lendo `directorates`, `beneficios_reports` e `monthly_reports` do PostgreSQL Docker
- login e sessao continuam locais no Django para nao depender da tabela `auth_user` no banco compartilhado
- as telas de painel, atualizar dados, ver dados, relatorio mensal e historico de relatorios ja foram conectadas para essa diretoria

## Proximos passos imediatos

1. Refinar a diretoria de Beneficios Socioassistenciais em cima do banco real.
2. Portar a proxima diretoria seguindo o mesmo padrao de integracao.
3. Reproduzir formularios, tabelas e dashboards por diretoria.
4. Evoluir regras de permissao e modulo administrativo.

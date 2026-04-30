# ONG Admin Django

Aplicacao administrativa em Django para gestao de diretorias, monitoramentos, alunos, cursos, interesses e matriculas.

Este projeto foi criado em uma pasta isolada para nao alterar a aplicacao atual em Next.js/Supabase.

## Stack inicial

- Django
- PostgreSQL em Docker
- Django Templates
- Apps separados por dominio
- Estrutura preparada para cada diretoria crescer em seu proprio app

## Estrutura

```text
django_ong_admin/
├─ apps/
│  ├─ accounts/
│  ├─ core/
│  ├─ common/
│  ├─ courses/
│  ├─ directorates/
│  ├─ directorates_modules/
│  ├─ enrollments/
│  ├─ interests/
│  ├─ monitorings/
│  └─ students/
├─ config/
├─ docker/
├─ templates/
├─ .env.example
├─ docker-compose.yml
├─ manage.py
└─ requirements.txt
```

## Como rodar

### Opcao A - Banco em Docker e Django local

1. Criar ambiente virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Instalar dependencias:

```powershell
pip install -r requirements.txt
```

3. Subir PostgreSQL:

```powershell
docker compose up -d db
```

4. Copiar variaveis:

```powershell
copy .env.example .env
```

5. Rodar migracoes:

```powershell
python manage.py migrate
```

6. Criar usuario admin:

```powershell
python manage.py createsuperuser
```

7. Criar diretorias iniciais:

```powershell
python manage.py seed_directorates
```

8. Iniciar servidor:

```powershell
python manage.py runserver
```

### Opcao B - Django e PostgreSQL em Docker

1. Subir containers:

```powershell
docker compose up -d --build
```

2. Rodar migracoes:

```powershell
docker compose run --rm web python manage.py migrate
```

3. Criar diretorias iniciais:

```powershell
docker compose run --rm web python manage.py seed_directorates
```

4. Criar usuario admin:

```powershell
docker compose run --rm web python manage.py createsuperuser
```

5. Acessar:

```text
http://localhost:8001
```

## Diretriz de arquitetura

Cada diretoria pode virar um app proprio quando tiver regras, telas ou dados especificos. Diretorias simples devem reaproveitar os apps compartilhados para evitar complexidade desnecessaria.

Os apps especificos de diretoria ficam em `apps/directorates_modules/`.

## Proximos passos tecnicos

1. Auditar o schema atual do Supabase/PostgreSQL.
2. Comparar tabelas atuais com os models iniciais.
3. Ajustar models para preservar estrutura de dados real.
4. Criar importacao/restauracao controlada.
5. Implementar telas e fluxos por modulo.

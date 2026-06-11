# Use a imagem oficial do Python
FROM python:3.11-slim

# Evita que o Python gere arquivos .pyc e permite logs em tempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Define o diretório de trabalho
WORKDIR /app

# Instala dependências de sistema necessárias para o psycopg2 e outras libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copia o arquivo de requisitos e instala as dependências
COPY requirements/base.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copia o restante do código do projeto
COPY . /app/

# Remove a pasta .deps se ela tiver sido copiada (já instalamos via pip)
RUN rm -rf /app/.deps

# Expõe a porta que o Django vai usar
EXPOSE 8000

# Comando para rodar as migrações e iniciar o servidor
# Em produção, usamos gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]

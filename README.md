# 📊 Sistema de Vigilância Socioassistencial

> **Plataforma completa de monitoramento, gestão e avaliação da Rede Socioassistencial**

Sistema desenvolvido para gerenciar e monitorar as atividades das diretorias da assistência social, integrando relatórios mensais, visitas técnicas, cadastro de OSCs (Organizações da Sociedade Civil), planos de trabalho e dashboards consolidados com sincronização automática ao Google Sheets.

---

## 🎯 Visão Geral

O **Sistema de Vigilância Socioassistencial** é uma aplicação web moderna e robusta que centraliza a gestão de dados das diretorias da assistência social, permitindo:

- ✅ **Gestão de Relatórios Mensais** por diretoria com formulários dinâmicos
- ✅ **Acompanhamento Diário** consolidado de indicadores institucionais
- ✅ **Cadastro e Gestão de OSCs** (Organizações da Sociedade Civil)
- ✅ **Instrumental de Visitas Técnicas** com assinaturas digitais e geração de relatórios em PDF
- ✅ **Planos de Trabalho** vinculados às OSCs
- ✅ **Dashboards Gráficos** com visualizações interativas
- ✅ **Sincronização Automática** com Google Sheets
- ✅ **Sistema de Permissões** (Admin e Usuários por Diretoria)
- ✅ **Interface Moderna** com tema claro/escuro

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### **Frontend**
- **Next.js 16** (App Router) - Framework React com renderização server-side
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para maior segurança
- **Tailwind CSS 4** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Biblioteca de ícones moderna
- **Recharts** - Gráficos e visualizações de dados

#### **Backend & Banco de Dados**
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança em nível de linha

#### **Integrações**
- **Google Sheets API** - Sincronização automática de dados
- **Google Service Account** - Autenticação para APIs do Google

#### **Validação & Qualidade**
- **Zod** - Validação de schemas e dados
- **ESLint** - Linter para qualidade de código

---

## 📁 Estrutura do Projeto

```
Sistema Vigilancia 2026/
├── app/                          # Aplicação Next.js (App Router)
│   ├── api/                      # API Routes
│   ├── auth/                     # Callbacks de autenticação
│   ├── dashboard/                # Dashboard principal
│   │   ├── actions.ts            # Server Actions (lógica de negócio)
│   │   ├── admin/                # Painel administrativo
│   │   ├── configuracoes/        # Configurações do sistema
│   │   ├── dados/                # Visualização de dados
│   │   ├── diretoria/[id]/       # Páginas dinâmicas por diretoria
│   │   │   └── subvencao/        # Módulo de subvenção
│   │   │       ├── oscs/         # Gestão de OSCs
│   │   │       ├── plano-de-trabalho/  # Planos de trabalho
│   │   │       └── visitas/      # Instrumental de visitas
│   │   ├── graficos/             # Dashboards e gráficos
│   │   ├── relatorios/           # Relatórios mensais
│   │   ├── *-config.ts           # Configurações de formulários por setor
│   │   ├── daily-dashboard.tsx   # Dashboard diário
│   │   └── page.tsx              # Página principal do dashboard
│   ├── login/                    # Página de login
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── manifest.ts               # PWA Manifest
├── components/                   # Componentes React reutilizáveis
│   ├── ui/                       # Componentes de UI (shadcn/ui)
│   └── form-engine.tsx           # Motor de formulários dinâmicos
├── lib/                          # Bibliotecas e utilitários
│   ├── auth-utils.ts             # Utilitários de autenticação
│   ├── google-sheets.ts          # Integração com Google Sheets
│   ├── sheets.ts                 # Helpers para planilhas
│   ├── utils.ts                  # Utilitários gerais
│   └── validation.ts             # Schemas de validação (Zod)
├── utils/                        # Utilitários adicionais
│   └── supabase/                 # Clientes Supabase
│       ├── client.ts             # Cliente para componentes client-side
│       ├── server.ts             # Cliente para server components
│       └── admin.ts              # Cliente com privilégios administrativos
├── supabase/                     # Configurações do Supabase
│   ├── migrations/               # Migrações do banco de dados
│   └── schema.sql                # Schema principal
├── public/                       # Arquivos estáticos
│   ├── logo-vigilancia.png       # Logo do sistema
│   └── favicon.ico               # Favicon
├── scripts/                      # Scripts utilitários
├── .env.local                    # Variáveis de ambiente (não versionado)
├── package.json                  # Dependências do projeto
├── tsconfig.json                 # Configuração TypeScript
└── README.md                     # Este arquivo
```

---

## 🗄️ Modelo de Dados

### Principais Tabelas

#### **directorates** (Diretorias)
Armazena as diretorias da assistência social.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | TEXT | Nome da diretoria |
| `sheet_config` | JSONB | Configuração da planilha Google Sheets |
| `form_definition` | JSONB | Definição do formulário dinâmico |
| `created_at` | TIMESTAMP | Data de criação |

**Diretorias Cadastradas:**
- Qualificação Profissional e SINE
- Benefícios Socioassistenciais
- CRAS (Centro de Referência de Assistência Social)
- CREAS (Centro de Referência Especializado de Assistência Social)
- CEAI (Centro de Educação e Assistência Infantil)
- População em Situação de Rua
- Subvenção Social
- Emendas e Fundos
- Outros

---

#### **profiles** (Perfis de Usuário)
Estende a tabela `auth.users` do Supabase com informações adicionais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Referência ao `auth.users(id)` |
| `role` | TEXT | Papel do usuário (`admin` ou `user`) |
| `directorate_id` | UUID | Diretoria vinculada (para usuários) |
| `full_name` | TEXT | Nome completo |
| `created_at` | TIMESTAMP | Data de criação |

**Relacionamento:** Um usuário pode estar vinculado a uma ou mais diretorias através da tabela `profile_directorates`.

---

#### **submissions** (Relatórios Mensais)
Armazena os relatórios mensais submetidos pelas diretorias.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Usuário que criou |
| `directorate_id` | UUID | Diretoria relacionada |
| `month` | INTEGER | Mês (1-12) |
| `year` | INTEGER | Ano |
| `data` | JSONB | Dados do formulário |
| `created_at` | TIMESTAMP | Data de criação |

**Constraint:** Único por `(directorate_id, month, year)` - um relatório por mês/ano por diretoria.

**Estrutura de Dados:**
- Para setores simples: objeto plano com campos do formulário
- Para setores multi-unidade (CRAS, CEAI): 
  ```json
  {
    "_is_multi_unit": true,
    "units": {
      "CRAS Centro": { ...dados },
      "CRAS Norte": { ...dados }
    }
  }
  ```

---

#### **daily_reports** (Relatórios Diários)
Consolidado diário de indicadores por diretoria.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `date` | DATE | Data do relatório |
| `directorate_id` | UUID | Diretoria relacionada |
| `data` | JSONB | Indicadores do dia |
| `user_id` | UUID | Usuário que registrou |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

---

#### **oscs** (Organizações da Sociedade Civil)
Cadastro de OSCs vinculadas às diretorias.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | TEXT | Nome da OSC |
| `activity_type` | TEXT | Tipo de atividade |
| `cep` | TEXT | CEP |
| `address` | TEXT | Endereço |
| `number` | TEXT | Número |
| `neighborhood` | TEXT | Bairro |
| `phone` | TEXT | Telefone |
| `subsidized_count` | INTEGER | Número de subvencionados |
| `directorate_id` | UUID | Diretoria vinculada |
| `objeto` | TEXT | Objeto da parceria |
| `objetivos` | TEXT | Objetivos |
| `metas` | TEXT | Metas |
| `atividades` | TEXT | Atividades |
| `user_id` | UUID | Usuário que cadastrou |
| `created_at` | TIMESTAMP | Data de criação |

---

#### **visits** (Visitas Técnicas)
Registro de visitas técnicas às OSCs.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `osc_id` | UUID | OSC visitada |
| `directorate_id` | UUID | Diretoria responsável |
| `visit_date` | DATE | Data da visita |
| `visit_time` | TIME | Horário da visita |
| `status` | TEXT | Status (`draft` ou `finalized`) |
| `data` | JSONB | Dados completos da visita |
| `user_id` | UUID | Técnico responsável |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Estrutura de Dados da Visita:**
```json
{
  "total_mes": "150",
  "subvencionados": "120",
  "presentes": "115",
  "forma_acesso": ["Transporte Público", "Veículo Próprio"],
  "recursos_humanos": { ... },
  "observacoes": "Texto livre",
  "fotos": ["url1", "url2"],
  "tecnico1_nome": "João Silva",
  "tecnico1_assinatura": "data:image/png;base64,...",
  "tecnico2_nome": "Maria Santos",
  "tecnico2_assinatura": "data:image/png;base64,...",
  "responsavel_nome": "Diretor da OSC",
  "responsavel_assinatura": "data:image/png;base64,..."
}
```

---

#### **work_plans** (Planos de Trabalho)
Planos de trabalho vinculados às OSCs.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `osc_id` | UUID | OSC relacionada |
| `plan_type` | TEXT | Tipo do plano |
| `content` | TEXT | Conteúdo do plano |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Tipos de Plano:**
- Plano de Ação
- Plano de Aplicação
- Plano de Trabalho Anual
- Outros tipos customizados

---

#### **settings** (Configurações do Sistema)
Configurações globais do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `key` | TEXT | Chave da configuração (PK) |
| `value` | TEXT | Valor |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

---

## 🔐 Sistema de Autenticação e Permissões

### Níveis de Acesso

#### **Administrador (`admin`)**
- Acesso total ao sistema
- Gerenciamento de usuários e diretorias
- Visualização de todos os relatórios e dados
- Configurações do sistema
- Exclusão de visitas finalizadas
- Edição de OSCs

#### **Usuário (`user`)**
- Acesso restrito à(s) diretoria(s) vinculada(s)
- Submissão de relatórios mensais
- Cadastro de OSCs
- Criação e edição de visitas (apenas rascunhos próprios)
- Visualização de dados da própria diretoria

### Row Level Security (RLS)

O sistema utiliza **RLS (Row Level Security)** do PostgreSQL para garantir que:
- Usuários só visualizem dados das diretorias às quais têm acesso
- Apenas administradores possam modificar configurações críticas
- Dados sensíveis sejam protegidos em nível de banco de dados

---

## 📋 Funcionalidades Principais

### 1. **Relatórios Mensais**

Cada diretoria possui um formulário dinâmico configurável para submissão de dados mensais.

#### **Setores Especiais:**

##### **CRAS (Multi-unidade)**
- Suporta múltiplas unidades (CRAS Centro, CRAS Norte, etc.)
- Cálculo automático: `Atual = Mês Anterior + Admitidas`
- Sincronização com abas específicas no Google Sheets

##### **CREAS**
- Duas subcategorias: **Idoso** e **Deficiente (PCD)**
- Formulários específicos para cada subcategoria
- Cálculos automáticos de famílias em acompanhamento
- Seções de vítimas de violência (com prefixos `fa_`, `ia_`, `pcd_`)

##### **CEAI (Multi-unidade)**
- Suporta múltiplas unidades
- Cálculo de atendidos: `(Mês Anterior + Inseridos) - Desligados`
- Campos específicos para masculino e feminino

##### **Qualificação Profissional e SINE**
- Indicadores de atendimento (trabalhador, empregador, online)
- Seguro desemprego, CTPS Digital
- Vagas captadas, currículos, entrevistas
- Centros profissionalizantes (CP) com múltiplos indicadores

##### **Benefícios Socioassistenciais**
- Benefícios Eventuais (Natalidade, Funeral, Vulnerabilidade)
- Auxílio Documento (com tooltip explicativo)
- BPC (Benefício de Prestação Continuada)
- Bolsa Família

##### **População em Situação de Rua**
- Múltiplas abas no Google Sheets
- Indicadores de abordagem, acolhimento, encaminhamentos

#### **Sincronização com Google Sheets:**
- Atualização automática após submissão
- Mapeamento de blocos de células por seção
- Suporte a múltiplas abas e planilhas
- Validação de existência de abas antes da escrita

---

### 2. **Instrumental de Visitas Técnicas**

Sistema completo para registro e documentação de visitas às OSCs.

#### **Funcionalidades:**
- ✅ Seleção de OSC com busca
- ✅ Data e horário da visita
- ✅ Campos específicos por diretoria:
  - **Subvenção:** Total/Mês, Subvencionados, Presentes, Forma de Acesso, Recursos Humanos
  - **Emendas e Fundos:** Campos customizados (Aplicação de recursos, Resultados, Itens identificados/não identificados, Upload de PDFs)
  - **Outros:** Formulário simplificado
- ✅ Upload de fotos/evidências
- ✅ Assinaturas digitais:
  - 2 técnicos da SMDES (com nomes)
  - 1 responsável pela OSC
- ✅ Modo de visualização/impressão (fullscreen, sem sidebar)
- ✅ Salvar como rascunho ou finalizar e bloquear
- ✅ Geração de relatório em PDF

#### **Customizações por Diretoria:**

##### **Emendas e Fundos:**
- Botões para selecionar tipo de termo (Fomento ou Colaboração)
- Campos de texto longos para aplicação de recursos e resultados
- Upload de PDFs (acima da seção de fotos)
- Texto dinâmico baseado no tipo de termo selecionado

##### **Outros:**
- Campos ocultos: Total/Mês, Subvencionados, Presentes, Forma de Acesso, Recursos Humanos
- Renomeação de campos:
  - "Tipos de atividades desenvolvidas" → "Discriminação do Serviço"
  - "Atividades em execução" → "Observações"
- Assinaturas simplificadas (1 técnico + 1 responsável)

---

### 3. **Gestão de OSCs**

Cadastro completo de Organizações da Sociedade Civil.

#### **Campos:**
- Nome da OSC
- Tipo de atividade
- Endereço completo (CEP, Rua, Número, Bairro)
- Telefone
- Número de subvencionados
- Diretoria vinculada
- Detalhes da parceria:
  - Objeto
  - Objetivos
  - Metas
  - Atividades

#### **Funcionalidades:**
- Cadastro por técnicos autorizados
- Edição exclusiva por administradores
- Isolamento por diretoria (OSCs de "Emendas e Fundos" não aparecem em "Subvenção")
- Busca e filtros

---

### 4. **Planos de Trabalho**

Gerenciamento de planos vinculados às OSCs.

#### **Tipos de Plano:**
- Plano de Ação
- Plano de Aplicação
- Plano de Trabalho Anual
- Customizáveis

#### **Funcionalidades:**
- Editor de texto rico
- Indicador visual de planos vazios
- Botão para adicionar detalhes da parceria (objeto, objetivos, metas, atividades)
- Salvamento automático
- Acesso restrito a administradores

---

### 5. **Dashboards e Gráficos**

Visualizações interativas dos dados coletados.

#### **Dashboard Diário:**
- Consolidado institucional por data
- Indicadores do SINE (atendimentos, vagas, seguro desemprego)
- Indicadores dos Centros Profissionalizantes
- Totais destacados com design premium

#### **Dashboards Específicos:**
- **CRAS Dashboard:** Agregação de dados de todas as unidades
- **CREAS Dashboard:** Consolidação de Idoso e Deficiente
- **CEAI Dashboard:** Visualização multi-unidade
- **Gráficos Recharts:** Linhas, barras, áreas, pizza

---

### 6. **Painel Administrativo**

Exclusivo para administradores.

#### **Funcionalidades:**
- Gerenciamento de usuários:
  - Criar, editar, excluir usuários
  - Definir papéis (admin/user)
  - Vincular usuários a diretorias
- Gerenciamento de diretorias:
  - Criar, editar diretorias
  - Configurar formulários dinâmicos
  - Configurar integração com Google Sheets
- Configurações do sistema:
  - Ajustes globais
  - Manutenção de dados

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ e npm/yarn/pnpm
- **Conta Supabase** (ou instância local)
- **Conta Google Cloud** (para Google Sheets API)

### Passo a Passo

#### 1. **Clone o Repositório**

```bash
git clone <url-do-repositorio>
cd "Sistema Vigilancia 2026"
```

#### 2. **Instale as Dependências**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

#### 3. **Configure as Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Google Sheets (Service Account JSON como string)
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

#### 4. **Configure o Banco de Dados**

Execute as migrações no Supabase:

```bash
# Via Supabase CLI (recomendado)
supabase db push

# Ou execute manualmente os arquivos em supabase/migrations/ no SQL Editor do Supabase
```

#### 5. **Configure o Google Sheets API**

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**
4. Crie uma **Service Account**
5. Gere uma chave JSON para a Service Account
6. Copie o conteúdo do JSON e cole em `GOOGLE_SHEETS_CREDENTIALS` (como string)
7. Compartilhe suas planilhas com o email da Service Account (com permissão de edição)

#### 6. **Execute o Servidor de Desenvolvimento**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔧 Configuração de Diretorias

### Estrutura de Configuração

Cada diretoria possui dois arquivos de configuração no diretório `app/dashboard/`:

1. **`*-config.ts`** - Define o formulário e mapeamento para Google Sheets
2. **`actions.ts`** - Lógica de processamento e sincronização

### Exemplo: CRAS

**Arquivo:** `app/dashboard/cras-config.ts`

```typescript
export const CRAS_FORM_DEFINITION: FormDefinition = {
  sections: [
    {
      title: "Famílias em Acompanhamento pelo PAIF",
      fields: [
        { id: "mes_anterior", label: "Mês Anterior", type: "number", disabled: true },
        { id: "admitidas", label: "Admitidas", type: "number" },
        { id: "desligadas", label: "Desligadas", type: "number" },
        { id: "atual", label: "Atual", type: "number", disabled: true }
      ]
    },
    // ... outras seções
  ]
}

export const CRAS_SHEET_BLOCKS = [
  { startRow: 5 }, // Linha inicial no Google Sheets
  { startRow: 10 },
  // ...
]

export const CRAS_SPREADSHEET_ID = "ID_DA_PLANILHA"
```

### Adicionar Nova Diretoria

1. Crie um arquivo `nova-diretoria-config.ts` em `app/dashboard/`
2. Defina `FORM_DEFINITION`, `SHEET_BLOCKS` e `SPREADSHEET_ID`
3. Adicione lógica em `actions.ts` (função `submitReport`)
4. Crie a diretoria no banco de dados via painel admin
5. Configure a planilha no Google Sheets

---

## 📊 Integração com Google Sheets

### Como Funciona

1. **Submissão de Relatório:** Usuário preenche formulário no sistema
2. **Salvamento no Banco:** Dados são salvos na tabela `submissions`
3. **Sincronização:** Sistema chama `updateSheetBlocks()` ou `updateSheetColumn()`
4. **Atualização:** Google Sheets API escreve os dados nas células especificadas

### Mapeamento de Blocos

```typescript
// Exemplo de mapeamento
const blocksData = [
  { startRow: 5, values: [10, 20, 30] },  // Escreve nas linhas 5, 6, 7
  { startRow: 12, values: [40, 50] }      // Escreve nas linhas 12, 13
]

await updateSheetBlocks(
  { spreadsheetId: "...", sheetName: "CRAS Centro" },
  month,  // Coluna baseada no mês (1=C, 2=D, etc.)
  blocksData
)
```

### Estrutura da Planilha

- **Coluna A:** Rótulos dos indicadores
- **Coluna B:** Fórmulas/totais (opcional)
- **Colunas C-N:** Dados mensais (Janeiro a Dezembro)
- **Linhas:** Agrupadas por seção do formulário

---

## 🎨 Interface e Design

### Princípios de Design

- **Moderno e Premium:** Gradientes, sombras sutis, animações suaves
- **Responsivo:** Funciona em desktop, tablet e mobile
- **Acessível:** Componentes Radix UI com suporte a teclado e leitores de tela
- **Tema Claro/Escuro:** Suporte nativo com preferência do sistema

### Componentes Principais

- **FormEngine:** Motor de formulários dinâmicos baseado em JSON
- **Cards:** Containers estilizados para conteúdo
- **Buttons:** Botões com estados e variantes
- **Inputs:** Campos de texto, número, data com validação
- **Dialogs:** Modais para ações críticas
- **Tooltips:** Dicas contextuais

### Paleta de Cores

- **Primária:** Azul (`#366cb0`, `#1e3a8a`)
- **Sucesso:** Verde Esmeralda (`#10b981`, `#059669`)
- **Alerta:** Vermelho (`#ef4444`, `#dc2626`)
- **Neutros:** Zinc (`#18181b` a `#fafafa`)

---

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação:** Supabase Auth com email/senha
2. **Autorização:** RLS (Row Level Security) no PostgreSQL
3. **Validação:** Schemas Zod em todas as entradas
4. **HTTPS:** Obrigatório em produção
5. **Variáveis de Ambiente:** Credenciais nunca no código
6. **Service Role:** Usado apenas em Server Actions (não exposto ao cliente)

### Boas Práticas

- Sempre use `createClient()` em componentes client
- Use `createAdminClient()` apenas em Server Actions
- Valide dados com Zod antes de processar
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend

---

## 🧪 Testes e Depuração

### Scripts Utilitários

O projeto inclui vários scripts de depuração em `scripts/`:

```bash
# Verificar usuários
node check-users.ts

# Auditar OSCs
node audit-oscs.js

# Verificar diretorias
node debug-dir-table.js

# Testar conexão
node test-fetch.ts
```

### Logs

- **Server Actions:** Logs no console do servidor
- **Google Sheets:** Erros de sincronização são capturados e retornados ao usuário
- **Supabase:** Logs disponíveis no dashboard do Supabase

---

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

### Deploy

O sistema pode ser implantado em:

- **Vercel** (recomendado para Next.js)
- **Netlify**
- **AWS Amplify**
- **Servidor próprio** (com Node.js)

#### Deploy na Vercel:

1. Conecte o repositório no [Vercel Dashboard](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

---

## 🤝 Contribuindo

### Fluxo de Trabalho

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código

- **TypeScript:** Sempre tipar variáveis e funções
- **ESLint:** Seguir as regras configuradas
- **Commits:** Mensagens claras e descritivas
- **Componentes:** Reutilizáveis e bem documentados

---

## 📝 Licença

Este projeto é de propriedade da **Secretaria Municipal de Desenvolvimento Social** e está protegido por direitos autorais. Uso não autorizado é proibido.

---

## 👨‍💻 Autor

**Klisman RDS**  
Desenvolvedor Full Stack  
Sistema de Vigilância Socioassistencial • 2026

---

## 📞 Suporte

Para dúvidas, problemas ou sugestões:

- **Email:** [contato@exemplo.com](mailto:contato@exemplo.com)
- **Issues:** Abra uma issue no repositório
- **Documentação:** Consulte este README e os comentários no código

---

## 🗺️ Roadmap

### Próximas Funcionalidades

- [ ] Exportação de relatórios em Excel
- [ ] Notificações por email
- [ ] Histórico de alterações (audit log)
- [ ] Dashboard mobile nativo
- [ ] Integração com WhatsApp para notificações
- [ ] Relatórios customizáveis
- [ ] BI avançado com filtros dinâmicos

---

## 📚 Recursos Adicionais

### Documentação de Tecnologias

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)

### Tutoriais Relacionados

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Validation](https://zod.dev/)

---

**Desenvolvido com ❤️ para a Assistência Social**

---

<!-- Deploy trigger: 2026-03-23 13:51 -->

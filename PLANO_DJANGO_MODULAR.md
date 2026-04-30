# Plano de Execucao - Aplicacao Django Modular para a ONG

## Objetivo

Criar uma nova aplicacao web em Django, organizada, limpa e facil de evoluir, mantendo a estrutura de dados atual e permitindo que cada diretoria possa ser tratada como um app separado, quando isso trouxer mais clareza e isolamento.

O foco inicial e:

- preservar os dados existentes;
- reduzir acoplamento;
- organizar cada dominio no seu proprio espaco;
- facilitar manutencao futura;
- permitir migraçao gradual sem quebrar o sistema atual.

---

## Decisao Arquitetural

Sim, e possivel criar um app Django separado para cada diretoria.

Essa abordagem faz sentido quando cada diretoria:

- tem regras proprias;
- possui telas, formulários ou relatorios diferentes;
- precisa de manutencao independente;
- deve evoluir sem impactar outras areas.

### Estrutura sugerida

Em vez de concentrar tudo em um unico app, o projeto pode seguir uma separacao por dominio:

- `core` - configuracoes gerais, layout, dashboard base, utilitarios;
- `accounts` - autenticacao, perfis e permissões;
- `students` - alunos;
- `courses` - cursos;
- `interests` - interesses em cursos;
- `enrollments` - matriculas;
- `directorates` - cadastro e classificacao das diretorias;
- `monitorings` - regras e telas especificas de monitoramentos;
- `directorates/<nome_da_diretoria>` - app especifico para cada diretoria, quando necessario.

### Quando criar um app separado por diretoria

Criar apps separados vale a pena quando:

- a diretoria tem fluxo proprio;
- a diretoria possui formularios diferentes das demais;
- ha regras muito especificas;
- existe risco de crescer demais dentro de um unico modulo.

Se uma diretoria for simples, ela pode continuar dentro de um app compartilhado, sem forcar separacao desnecessaria.

---

## Estrategia de Banco de Dados

Como ja existe base de dados e dados sensiveis, a prioridade e nao perder nada.

### Opção 1 - Recomendada inicialmente

- manter o PostgreSQL atual como fonte de verdade;
- conectar o Django ao banco existente;
- mapear as tabelas atuais com models Django;
- validar leitura e escrita;
- migrar a aplicacao aos poucos.

### Opção 2 - Banco proprio em Docker

- subir PostgreSQL em Docker;
- restaurar dump atual;
- validar integridade;
- apontar Django para o banco novo.

### Recomendação pratica

Comecar com o PostgreSQL atual e, se tudo estiver estável, migrar para Docker depois.
Isso reduz risco, evita retrabalho e permite validar o backend antes da troca de infraestrutura.

---

## Modelo de Organizacao do Projeto

```text
ong_admin/
├─ config/
├─ apps/
│  ├─ core/
│  ├─ accounts/
│  ├─ students/
│  ├─ courses/
│  ├─ interests/
│  ├─ enrollments/
│  ├─ directorates/
│  ├─ monitorings/
│  └─ directorates_modules/
├─ templates/
├─ static/
├─ requirements/
├─ docker/
├─ manage.py
└─ README.md
```

Se cada diretoria realmente precisar de separacao total, podemos evoluir para algo assim:

```text
apps/
├─ directorates/
├─ cras/
├─ ceai/
├─ beneficios/
├─ subvencao/
├─ outros/
└─ ...
```

Mas eu recomendaria comecar com um `directorates` central e ir desdobrando somente as diretorias que justificarem um app proprio.

---

## Fases de Execucao

### Fase 1 - Auditoria do sistema atual

Objetivo:
entender o que existe hoje antes de criar o novo backend.

Entregas:

- mapear tabelas existentes;
- identificar relacoes e chaves;
- levantar dependencias do Supabase;
- entender regras de negocio ja embutidas;
- localizar dados sensiveis e pontos criticos.

Resultado esperado:
um mapa confiavel da estrutura atual.

### Fase 2 - Desenho da nova arquitetura

Objetivo:
definir a base Django antes de codar funcionalidades.

Entregas:

- criar a estrutura de apps;
- definir nomes e responsabilidades;
- escolher se cada diretoria tera app proprio ou modulo compartilhado;
- padronizar base models, choices e services;
- definir estrategia de banco e ambiente.

Resultado esperado:
uma arquitetura clara, com responsabilidades bem separadas.

### Fase 3 - Bootstrap do projeto Django

Objetivo:
subir o projeto base e garantir que ele inicialize corretamente.

Entregas:

- projeto Django configurado;
- settings por ambiente;
- PostgreSQL pronto para uso;
- login/logout;
- layout base;
- static e templates organizados;
- admin configurado.

Resultado esperado:
um esqueleto funcional, sem regras de negocio ainda.

### Fase 4 - Modelagem de dominio

Objetivo:
criar os models centrais sem acoplamento excessivo.

Entregas:

- `User` ou perfil complementar;
- `Student`;
- `Course`;
- `CourseInterest`;
- `Enrollment`;
- models de diretorias e monitoramentos;
- regras de unicidade e validacoes.

Resultado esperado:
camada de dados limpa e pronta para CRUD.

### Fase 5 - Estrutura por diretorias

Objetivo:
organizar a aplicacao por dominio.

Entregas:

- definir quais diretorias serao apps proprios;
- criar base compartilhada para componentes comuns;
- separar telas e regras por diretoria;
- evitar `if/else` espalhado na camada de apresentacao.

Resultado esperado:
cada diretoria com seu espaco e seu comportamento.

### Fase 6 - CRUDs principais

Objetivo:
entregar as telas administrativas essenciais.

Entregas:

- alunos;
- cursos;
- interesses;
- matriculas;
- filtros;
- busca;
- paginacao;
- mensagens de sucesso e erro.

Resultado esperado:
sistema ja utilizavel no dia a dia.

### Fase 7 - Dashboard

Objetivo:
criar a tela inicial com informacoes relevantes.

Entregas:

- total de alunos;
- total de cursos;
- total de interesses;
- total de matriculas;
- cursos com mais procura;
- registros recentes;
- atalhos rapidos por modulo.

Resultado esperado:
painel simples, util e visualmente claro.

### Fase 8 - Estrutura por app de diretoria

Objetivo:
tratar cada diretoria como modulo isolado quando fizer sentido.

Entregas:

- um app por diretoria ou por grupo de diretorias similares;
- views proprias;
- templates proprios;
- services proprios;
- urls separadas;
- regras especificas por dominio.

Resultado esperado:
reduzimos o acoplamento e facilitamos manutencao.

### Fase 9 - Migracao e restauracao de dados

Objetivo:
trazer os dados existentes com seguranca.

Entregas:

- validar dump SQL;
- restaurar em ambiente de teste;
- comparar contagens e integridade;
- corrigir discrepancias;
- criar rotinas de importacao, se necessario.

Resultado esperado:
dados acessiveis no novo backend sem perda.

### Fase 10 - Refinamento e estabilidade

Objetivo:
deixar o sistema pronto para uso real.

Entregas:

- testes basicos;
- logs;
- ajustes de permissao;
- revisão de performance;
- README;
- dados de exemplo;
- checklist de deploy.

Resultado esperado:
projeto pronto para evolucao segura.

---

## Padrao de Organizacao por Diretoria

Quando uma diretoria ganhar app proprio, cada modulo deve seguir o mesmo padrao:

```text
apps/<diretoria>/
├─ models.py
├─ admin.py
├─ forms.py
├─ services.py
├─ selectors.py
├─ urls.py
├─ views.py
├─ templates/
└─ tests/
```

Isso ajuda a manter:

- legibilidade;
- coesao;
- facilidade de busca;
- isolamento de regra de negocio.

---

## Regras de Organizacao que Vamos Seguir

- cada app deve ter uma responsabilidade clara;
- nada de classificacao duplicada em varios arquivos;
- nada de regra escondida em template;
- nada de `any` ou tipos soltos sem necessidade;
- nada de `if/else` gigantes para decidir tudo;
- nada de duplicar menu desktop e mobile com logicas diferentes;
- nada de misturar validacao, busca e renderizacao no mesmo bloco longo sem necessidade.

---

## Ordem Ideal de Implementacao

1. Auditar banco e estrutura atual.
2. Definir arquitetura final.
3. Criar o projeto Django base.
4. Configurar PostgreSQL e ambiente Docker, se necessario.
5. Criar auth e layout base.
6. Modelar alunos, cursos, interesses e matriculas.
7. Separar diretorias em apps ou modulos.
8. Implementar dashboard.
9. Conectar aos dados existentes.
10. Testar e refinar.

---

## Critérios Para Decidir Se Uma Diretoria Vira App Proprio

Uma diretoria deve virar app proprio se:

- tiver regras exclusivas;
- tiver telas muito especificas;
- tiver muitos formularios proprios;
- exigir manutencao independente;
- puder ser testada separadamente;
- crescer de forma consistente.

Se nao atender esses criterios, ela deve ficar em um modulo compartilhado.

---

## Riscos e Cuidados

- renomear diretorias sem atualizar a classificacao pode gerar inconsistencias;
- mover o banco sem validacao pode causar perda ou quebra de dados;
- criar apps demais cedo demais pode aumentar complexidade;
- criar poucos modulos demais pode concentrar regra em arquivos grandes.

O ideal e achar um equilibrio entre isolamento e simplicidade.

---

## Proxima Etapa Recomendada

Se quisermos seguir bem organizados, o melhor proximo passo e:

1. auditar a estrutura atual do banco e das diretorias;
2. definir quais diretorias merecem app proprio;
3. iniciar o projeto Django base com PostgreSQL;
4. criar a primeira versao dos models centrais;
5. depois partir para os apps especificos.

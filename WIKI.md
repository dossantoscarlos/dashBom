# 📚 WIKI OFICIAL DO SISTEMA — campanhaPRO

> **Sistema Integrado de Gestão Política, Eleitoral, Inteligência Estratégica, Demandas e Acompanhamento de Projetos**

---

## 📋 Sumário
1. [Visão Geral do campanhaPRO](#1-visão-geral-do-campanhapro)
2. [Arquitetura & Diretrizes Técnicas](#2-arquitetura--diretrizes-técnicas)
3. [Identidade Visual & Design System](#3-identidade-visual--design-system)
4. [Estrutura de Módulos (/CoreModules)](#4-estrutura-de-módulos-coremodules)
5. [Detalhamento Funcional dos Módulos](#5-detalhamento-funcional-dos-módulos)
   - [5.1 Gestão de Demandas & Projetos (10 Telas)](#51-gestão-de-demandas--projetos-10-telas)
   - [5.2 Inteligência Eleitoral & Consulta TSE/TRE](#52-inteligência-eleitoral--consulta-tsetre)
   - [5.3 Demais Módulos do Sistema](#53-demais-módulos-do-sistema)
6. [Regras de Negócio Globais](#6-regras-de-negócio-globais)
7. [Rotas de API Backend (/app/api)](#7-rotas-de-api-backend-appapi)
8. [Guia de Desenvolvimento, Compilação e Deploy](#8-guia-de-desenvolvimento-compilação-e-deploy)

---

## 1. Visão Geral do campanhaPRO

O **campanhaPRO** é uma plataforma SaaS de alta fidelidade desenvolvida para gestão de mandato, inteligência política, articulação regional, gerenciamento de demandas públicas, execução financeira e acompanhamento de projetos estratégicos.

### Principais Objetivos:
- **Centralização da Gestão Mandatária:** Articulação de voluntários, autoridades, pareceres técnicos, finanças e prestação de contas.
- **Ciclo de Vida Rigoroso de Projetos:** Conversão transacional garantida — toda solicitação nasce como **Demanda** e evolui criteriosamente para **Projeto** (`PRJ-XXXX`).
- **Inteligência Eleitoral TSE/TRE:** Monitoramento em tempo real do cenário eleitoral e consulta pública paginada a candidaturas brasileiras.

---

## 2. Arquitetura & Diretrizes Técnicas

### Tech Stack Utilizada:
- **Framework:** Next.js (App Router, Turbopack)
- **Linguagem:** TypeScript (Modo Estrito)
- **Estilização:** Tailwind CSS (Sem utilitários ad-hoc fora do design system)
- **Ícones:** Lucide React (Ícones Outline)
- **Gerenciamento de Estado & Cache:** React State Local & TanStack Query
- **Tabelas & Gráficos:** Recharts & TanStack Table
- **Formulários & Validação:** React Hook Form & Zod

### Padrão de Arquitetura de Módulos (`/CoreModules`):
Conforme estabelecido nas diretrizes do projeto (`AGENTS.md`):
- **Isolamento:** Cada módulo funcional independente reside em sua própria pasta dentro de `/CoreModules/<NomeDoModulo>`.
- **Componentização:** O componente principal de visualização de cada módulo fica na raiz da sua pasta (`index.tsx`).
- **Padronização:** Todos os módulos utilizam o container padronizado `ModuleBlock`.

---

## 3. Identidade Visual & Design System

O sistema adota uma paleta moderna e harmoniosa baseada nas cores institucionais do campanhaPRO:

| Elemento | Hex | Aplicação |
| :--- | :--- | :--- |
| **Verde campanhaPRO (Primary)** | `#008B63` / `#00A978` | Botões primários, badges de sucesso, destaques principais |
| **Navy Dark (Sidebar & Topo)** | `#06284F` / `#031E3B` | Barra lateral de navegação, cabeçalhos executivos |
| **Azul Informações (Active)** | `#1264F3` / `#EAF2FF` | Abas ativas, links, indicadores informativos |
| **Roxo Execução** | `#7928F5` / `#F3EAFF` | Coluna do Kanban em execução, indicadores operacionais |
| **Laranja Análise / Alerta** | `#F59E0B` / `#FFF4E5` | Status "Em análise", alertas financeiros |
| **Cinza Neutro Fundo** | `#F8FAFC` / `#E2E8F0` | Planos de fundo de cartões e bordas de separação |

---

## 4. Estrutura de Módulos (`/CoreModules`)

O sistema conta com **18 CoreModules** funcionais e desacoplados:

```text
CoreModules/
├── Agenda/              # Controle de compromissos e audiências públicas
├── Autoridades/         # Cadastro e mapeamento de prefeitos, deputados e lideranças
├── Campaigns/           # Gestão de campanhas e ações de rua
├── Dashboard/           # Painel executivo com indicadores gerais
├── DemandasProjetos/    # Módulo de 10 telas de ciclo de vida de demandas e projetos
├── Financeiro/          # Fluxo de caixa, orçamento e prestação de contas
├── Locations/           # Mapeamento geográfico de locais de atuação
├── Parecer/             # Emissão e controle de pareceres técnicos e jurídicos
├── Partners/            # Registro de entidades parceiras e apoiadores
├── Permissions/         # Matriz de permissões e perfis de acesso
├── Profile/             # Perfil do usuário logado
├── RedeSocial/          # Monitoramento e engajamento em redes sociais
├── Regions/             # Divisão territorial, bairros e zonas eleitorais
├── Reports/             # Relatórios gerenciais e exportação de PDFs
├── Surveys/             # Pesquisas de opinião e levantamento de demandas
├── Tre/                 # Monitoramento TSE em tempo real e consulta de candidatos
├── Users/               # Gestão de usuários e equipe interna
└── Voluntariado/        # Cadastro e engajamento de voluntários
```

---

## 5. Detalhamento Funcional dos Módulos

### 5.1 Gestão de Demandas & Projetos (10 Telas)

#### Premissa Fundamental de Negócio:
> **Nenhum projeto pode ser criado diretamente.** Toda solicitação nasce obrigatoriamente como **Demanda** (Status `Recebida`).

#### Etapas da Conversão Transacional:
1. **Nova Demanda (`Recebida`):** Formulário de registro com localização por CEP, categoria, solicitante e prioridade.
2. **Análise Técnica (`Em análise`):** Preenchimento de parecer técnico, estimativa orçamentária e cronograma inicial.
3. **Verificação dos 5 Critérios de Conversão:**
   - [x] Alinhamento com as prioridades do mandato.
   - [x] Viabilidade técnica atestada por parecer oficial.
   - [x] Disponibilidade ou previsão orçamentária garantida.
   - [x] Escopo e entregas preliminares definidos.
   - [x] Responsável técnico e equipe designados.
4. **Decisão de Aprovação:** Formalização do status `"Aprovada para Projeto"` e geração automática do código `PRJ-XXXX`.

#### As 10 Visões de Acompanhamento do Projeto:
- **Tela 1 — Nova Demanda:** Cadastro limpo e dinâmico com busca automática de endereço via CEP.
- **Tela 2 — Análise da Demanda:** Avaliação do parecer e preenchimento dos critérios de conversão.
- **Tela 3 — Conversão para Projeto:** Confirmação da conversão e atribuição do código `PRJ-XXXX`.
- **Tela 4 — Visão Geral:** Painel executivo do projeto com resumo de prazos, progresso e orçamento.
- **Tela 5 — Kanban de Tarefas:** Quadro visual de 5 colunas (*A Fazer*, *Em Análise*, *Em Execução*, *Validação*, *Concluído*).
- **Tela 6 — Cronograma (Gantt):** Gráfico de Gantt interativo com marcos e dependências.
- **Tela 7 — Orçamento & Finanças:** Tabela por categorias, gráfico de rosca e controle de transações.
- **Tela 8 — Equipe & Matriz RACI:** Alocação de membros, carga de trabalho e matriz de responsabilidade RACI (*Responsável*, *Aprovador*, *Consultado*, *Informado*).
- **Tela 9 — Arquivos & Versões:** Árvore de pastas, upload de documentos e controle de versionamento.
- **Tela 10 — Histórico & Auditoria:** Linha do tempo de rastreabilidade completa e logs de alterações.

---

### 5.2 Inteligência Eleitoral & Consulta TSE/TRE (`/CoreModules/Tre`)

#### Funcionalidades:
- **Monitor TSE em Tempo Real:** Sincronização automática a cada 30 segundos, exibindo totais de candidaturas registradas, taxa de deferimento e distribuição por partidos.
- **Consulta de Candidatos Paginada:**
  - Busca por **Nome**, **Nome de Urna**, **Sigla do Partido** (ex: `PL`, `PT`, `PSD`, `MDB`, `REPUBLICANOS`, `PSOL`), **Número do Candidato** ou **UF**.
  - **Filtro de Cargo Disputado com Flexão de Gênero:** Suporte a `Presidente/Vice`, `Governador/Governadora`, `Senador/Senadora`, `Deputado/Deputada Federal`, `Deputado/Deputada Estadual`, `Prefeito/Prefeita`, `Vereador/Vereadora`.
  - **Filtro por Ano Eleitoral:** Alternância entre `2026`, `2024`, `2022` ou `Todos os Anos`.
  - **Identificação de Eleição e Reeleição:** Exibição clara de candidaturas de primeira eleição e tentativas de reeleição.
  - **Navegação Paginada:** Exibição de 10 registros por página com botões *Anterior*, *Próxima* e numeração direta.

---

## 6. Regras de Negócio Globais

1. **Dados Reais e Dinâmicos:**
   - Nenhum formulário ou tela deve exibir dados ilustrativos fixos quando submetidos. Todas as pesquisas e cadastros operam sobre as APIs do sistema.
2. **Sem Falsos Positivos em Buscas Partidárias:**
   - A busca por siglas de partidos (ex: `PL`) utiliza comparação exata de sigla, impedindo a mistura de candidatos de outros partidos por conta de substrings como `suPLente` ou `comPLeto`.
3. **Respostas Limpas para Consultas Sem Resultados:**
   - Caso uma consulta não localize registros, a API e a interface retornam limpidamente um array vazio `[]`, sem gerar registros fictícios.

---

## 7. Rotas de API Backend (`/app/api`)

| Rota | Método | Descrição |
| :--- | :--- | :--- |
| `/api/tre/consulta` | `GET` | Consulta paginada de candidatos do TSE por nome, partido, cargo, ano e número. |
| `/api/tre/noticias` | `GET` | Notícias oficiais e informes do TSE/TRE por categoria. |
| `/api/tre/autoridades` | `GET` | Cadastro de autoridades eleitorais e magistrados. |
| `/api/tse` | `GET` | Resumo de dados estatísticos e monitoramento em tempo real do TSE. |
| `/api/agenda` | `GET` / `POST` | Gerenciamento de eventos da agenda mandatária. |
| `/api/financeiro` | `GET` / `POST` | Lançamentos de receitas, despesas e relatórios financeiros. |
| `/api/voluntarios` | `GET` / `POST` | Cadastro e engajamento da rede de voluntariado. |

---

## 8. Guia de Desenvolvimento, Compilação e Deploy

### Executando o Projeto Localmente:
```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```

### Compilação e Validação de Build de Produção:
```bash
# Executar a compilação do Next.js e checagem estrita do TypeScript
npm run build
```

---

*Documentação mantida e atualizada pela equipe de desenvolvimento campanhaPRO.*

# 📚 WIKI OFICIAL DO SISTEMA — campanhaPRO

> **Plataforma Integrada de Gestão Política, Eleitoral, Inteligência Estratégica, Demandas, Finanças e Acompanhamento de Projetos Mandatários**
> 
> 🌐 **Repositório e Wiki no GitHub:** [https://github.com/dossantoscarlos/dashBom](https://github.com/dossantoscarlos/dashBom) | [Issues do Projeto](https://github.com/dossantoscarlos/dashBom/issues)

---

## 📋 Sumário da Wiki

1. **[Visão Geral do campanhaPRO](#1-visão-geral-do-campanhapro)**
2. **[Documento de Arquitetura do Sistema (ARCHITECTURE.md)](#2-documento-de-arquitetura-do-sistema-architecturemd)**
3. **[Arquitetura de CoreModules (/CoreModules)](#3-arquitetura-de-coremodules-coremodules)**
4. **[Ciclo de Demandas, Pareceres Técnicos & Conversão em Projetos](#4-ciclo-de-demandas-pareceres-técnicos--conversão-em-projetos)**
5. **[Integração Financeira: Orçamentos, Centros de Custo, Contratos e Contas Bancárias](#5-integração-financeira-orçamentos-centros-de-custo-contratos-e-contas-bancárias)**
6. **[Agenda de Campanha & Integração com o Calendário Eleitoral TSE](#6-agenda-de-campanha--integração-com-o-calendário-eleitoral-tse)**
7. **[Inteligência Eleitoral & Monitoramento TSE/TRE](#7-inteligência-eleitoral--monitoramento-tsetre)**
8. **[Central de Notificações Push & Trilha de Auditoria](#8-central-de-notificações-push--trilha-de-auditoria)**
9. **[Cronograma Executivo e Issues no GitHub](#9-cronograma-executivo-e-issues-no-github)**
10. **[Guia de Instalação, Compilação e Deploy](#10-guia-de-instalação-compilação-e-deploy)**

---

## 1. Visão Geral do campanhaPRO

O **campanhaPRO** é uma solução corporativa completa desenvolvida para gestão de mandato político, articulação eleitoral, planejamento financeiro transparente com prestação de contas, governança de demandas públicas e inteligência de campo.

### Principais Objetivos:
- **Centralização da Operação Mandatária:** Articulação de lideranças, voluntariado, pareceres técnicos, finanças e cronogramas.
- **Ciclo Transacional Estrito:** Toda solicitação nasce obrigatoriamente como **Demanda** (`Recebida`) e só evolui para **Projeto (`PRJ-XXXX`)** após atender a requisitos rigorosos de documentação, validação técnica, aprovação formal e centro de custo orçado.
- **Conformidade Eleitoral e Transparência:** Gestão financeira aderente às normas do TSE, com controle de contas bancárias específicas, contratos com marcos temporais e trilha de auditoria *append-only*.

---

## 2. Documento de Arquitetura do Sistema (`ARCHITECTURE.md`)

> 📖 **Consulte o documento completo em:** [`ARCHITECTURE.md`](file:///c:/Users/rodol/dashBom/ARCHITECTURE.md)

### Diagrama Geral de Camadas:

```text
┌────────────────────────────────────────────────────────────────────────┐
│               CAMADA DE APRESENTAÇÃO / WORKSPACE UI                    │
│     ExtJSWorkspace • App Router Layout • Central de Notificações       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    CAMADA DE NEGÓCIO: /CoreModules                     │
│  DemandasProjetos • Financeiro • Agenda • Tre • Campaigns • Dashboard  │
│  Autoridades • Locations • Parecer • Partners • Permissions • Profile  │
│  RedeSocial • Regions • Reports • Surveys • Users • Voluntariado       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  CAMADA DE DOMÍNIO & ESTADO: /lib                      │
│     /lib/domain (Types) • /lib/data (Stores) • /lib/hooks (Hooks)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               CAMADA DE API REST & BACKEND: /app/api                   │
│   /api/financeiro • /api/demandas • /api/agenda • /api/tre/*           │
│   /api/management-contexts/* • /api/notificacoes • /api/voluntarios    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitetura de CoreModules (`/CoreModules`)

O sistema segue o padrão arquitetural de módulos desacoplados e independentes:

```text
CoreModules/
├── Agenda/              # Compromissos, eventos com hora, rota Google Maps e Calendário Eleitoral TSE
├── Autoridades/         # Mapeamento de prefeitos, vereadores e lideranças institucionais
├── Campaigns/           # Planejamento estratégico de ações eleitorais e eventos de campanha
├── Dashboard/           # Painel executivo com indicadores globais mandatários
├── DemandasProjetos/    # Suíte de 10 telas do ciclo de vida transacional de demandas e projetos
├── Financeiro/          # Orçamentos, Centros de Custo, Contratos (Início/Meio/Fim) e Contas Bancárias
├── Locations/           # Mapeamento geográfico de comitês, sedes e pontos de apoio
├── Parecer/             # Emissão de pareceres técnicos e jurídicos de conversão
├── Partners/            # Entidades parceiras, sindicatos e associações apoiadoras
├── Permissions/         # Matriz de cargos e controle de acessos da equipe
├── Profile/             # Preferências de perfil, foto de usuário e alteração de tema (Claro/Escuro)
├── RedeSocial/          # Acompanhamento de redes sociais e engajamento digital
├── Regions/             # Divisão territorial, bairros e metas de votos
├── Reports/             # Relatórios gerenciais baseados em dados reais (CSV/Excel/PDF)
├── Surveys/             # Levantamento de opinião pública e pesquisas eleitorais
├── Tre/                 # Monitoramento TSE em tempo real e consulta paginada de candidatos
├── Users/               # Gestão de contas de usuários e operadores
└── Voluntariado/        # Rede de voluntários, mobilização de militantes e apoiadores
```

---

## 4. Ciclo de Demandas, Pareceres Técnicos & Conversão em Projetos

> **Regra de Negócio Inviolável:** Nenhuma solicitação pode ser criada diretamente como projeto. O fluxo obrigatório é:
> **Nova Demanda** ➔ **Análise Técnica (Parecer)** ➔ **Aprovação Formal** ➔ **Conversão em Projeto (`PRJ-XXXX`)**.

### Requisitos Obrigatórios para Conversão:
1. **Documentação em Anexo:** A demanda deve conter ao menos um documento em anexo (comprovante, ofício, planilha ou foto comprobatória).
2. **Orçamento e Centro de Custo Definidos (Sem Criação na Demanda):**
   - **Gestão Exclusiva no Financeiro:** Centros de Custo **não podem** ser criados no formulário de demanda; devem ser previamente cadastrados no Módulo Financeiro (*Orçamentos & Centros*).
   - **Diagnóstico Financeiro em Tempo Real:** Ao selecionar o centro e informar o valor estimado da demanda, o sistema calcula e exibe em tempo real:
     - 🏛️ **Saldo Disponível no Centro:** Saldo líquido remanescente da dotação orçamentária.
     - 💰 **Custo da Demanda:** Valor estimado a ser executado.
     - 📊 **Percentual de Consumo / Déficit:** Mostra quantos por cento da verba disponível será consumida (se suficiente) ou quantos por cento faltam para cobrir o custo (se insuficiente).
     - 🚦 **Bloqueio de Conversão por Verba Insuficiente:** Demandas cujo valor exceda o saldo do centro não podem ser homologadas para projeto sem suplementação na Área Financeira.
   - Demandas criadas sem orçamento exibem banner de alerta e formulário inline para **[✏️ Editar / Corrigir Orçamento]**.
3. **Emissão de Parecer Técnico Completo:** O sistema gera parecer detalhado consolidando título, descrição, documentações anexadas, dotação orçamentária e justificativa de impacto.
4. **Registro do Aprovador:** O fluxo registra formalmente o responsável pela aprovação (`approvedBy`) e a data da aprovação antes da transição de estado.

### Telas do Módulo Demandas & Projetos:
1. **Nova Demanda:** Formulário dinâmico com CEP, anexos de documentos e centros de custo dinâmicos.
2. **Análise Técnica:** Emissão de parecer técnico e validação dos critérios de conversão.
3. **Conversão Transacional:** Confirmação da conversão gerando código `PRJ-XXXX` e sincronizando a despesa inicial no módulo Financeiro.
4. **Visão Geral:** Indicadores do projeto, prazos e percentuais de conclusão.
5. **Quadro Kanban:** 5 colunas de status (*A Fazer*, *Em Análise*, *Em Execução*, *Validação*, *Concluído*).
6. **Cronograma (Gantt):** Visualização em Diagrama de Gantt com timeline interativa, barras de progresso, marcos e indicador temporal "Hoje".
7. **Orçamento & Finanças:** Lançamento de despesas e conciliação bancária do projeto.
8. **Equipe & RACI:** Alocação de recursos e matriz de responsabilidade.
9. **Arquivos & Versões:** Árvore de documentos e versionamento.
10. **Histórico & Auditoria:** Rastreabilidade completa de todas as alterações.

### 🔗 Navegação Cruzada e Rastreabilidade por Código (`DEM-xxxx` e `PRJ-xxxx`):
Em todas as tabelas, quadros Kanban, cronogramas, gavetas de detalhes e cabeçalhos do sistema:
- **Clique no Código `DEM-xxxx`:** Navega diretamente para a tela de **Análise Técnica / Parecer Circunstanciado** daquela demanda específica.
- **Clique no Código `PRJ-xxxx`:** Navega diretamente para a **Visão Geral do Projeto** ativo correspondente (`mainMode = "projeto_ativo"`).
- **Banner de Vínculo no Cabeçalho do Projeto:** Exibe o código da demanda de origem (`DEM-xxxx`) com link direto para retornar à análise da demanda.
- **Gaveta / Modal de Detalhes:** Inclui atalhos com botão primário para transição imediata para a tela completa da demanda ou projeto.

---

## 5. Integração Financeira: Orçamentos, Centros de Custo, Contratos e Contas Bancárias

O módulo **Financeiro** (`CoreModules/Financeiro/index.tsx`) integra de ponta a ponta a governança de recursos:

### A. Centros de Custo e Orçamentos (`activeSubTab === "orcamentos"`)
- **Origem Dinâmica dos Centros de Custo:** Os centros de custo cadastrados no Financeiro alimentam dinamicamente os formulários de demandas e projetos.
- **Contextos de Destinação:**
  - 🏛️ `campanha`: Campanha Eleitoral / Comitê Central
  - 🏢 `mandato`: Mandato Parlamentar Corrente / Gabinete
  - 🤝 `partido`: Partido Político / Diretório Municipal/Estadual
  - 💼 `interno`: Operações Administrativas Internas
- **Formulário de Cadastro de Centro de Custo:** Modal com Nome, Código (`CC-xxx`), Contexto, Teto Limite (R$) e Status.
- **Formulário de Alocação Orçamentária:** Definição de metas e dotações por centro e ano de exercício.

### B. Gestão de Contratos com Marcos Temporais (`activeSubTab === "contratos"`)
- **Controle de Vigência em 3 Marcos:**
  - 🟢 **Início:** Data inicial de vigência contratual.
  - 🟡 **Marco Intermediário (Meio):** Marco de entrega parcial, medição ou aditivo intermediário (50%).
  - 🔴 **Término:** Data de conclusão e encerramento.
- **Controle Orçamentário por Centro de Custo:**
  - Valor total do contrato, despesas liquidadas/pagas e saldo remanescente a liquidar.
  - Barra de progresso financeiro e status (`em_execucao`, `ativo`, `encerrado`).
- **Modal de Cadastro de Contratos:** Cadastro ágil com objeto, fornecedor, centro de custo vinculado e vigências.

### C. Registro de Contas Bancárias (`activeSubTab === "contas_bancarias"`)
- **Contas Oficiais e Finalidades:**
  - `eleitoral`: Conta Eleitoral Principal
  - `fundo_partidario`: Fundo Partidário
  - `doacao`: Doações de Campanha
  - `operacional`: Despesas Operacionais
  - `mandato`: Gestão do Mandato
- **Campos de Cadastro:** Banco (BB, Caixa, Bradesco, Itaú, Santander, Sicoob, Nubank, etc.), Agência, Conta Corrente, Chave PIX, Tipo e Saldo Inicial.

---

## 6. Agenda de Campanha & Integração com o Calendário Eleitoral TSE

O módulo **Agenda** (`CoreModules/Agenda/index.tsx`) une a rotina do candidato ao calendário oficial:

- **Integração do Calendário Eleitoral TSE:**
  - Eventos oficiais da Resolução do TSE são carregados e exibidos automaticamente com badge visual `⚖️ TSE Oficial`.
- **Exigência de Horário de Início e Fim:**
  - Eventos da agenda regular exigem hora de início (`startTime`) e término (`endTime`).
  - Eventos do calendário eleitoral do TSE são tratados como marcos de dia inteiro.
- **Roteirização:** Integração com Google Maps para visualização de trajetos entre compromissos.
- **Eventos Recorrentes:** Agendamento de reuniões com tratamento de fuso horário neutro.

---

## 7. Inteligência Eleitoral & Monitoramento TSE/TRE

- **Monitor TSE ao Vivo:** Sincronização e monitoramento estatístico a cada 30 segundos.
- **Consulta Paginada de Candidatos:**
  - Busca por nome de urna, número ou partido (busca estrita por sigla).
  - Filtro por cargo com flexão de gênero (`Presidente`, `Governador`, `Senador`, `Deputado`, `Prefeito`, `Vereador`).
  - Filtro por anos eleitorais (`2026`, `2024`, `2022`).

---

## 8. Central de Notificações Push & Trilha de Auditoria

- **Alertas em Tempo Real:** Consulta contínua com Web Push de desktop para prazos, novas demandas e atualizações do TSE.
- **Trilha de Auditoria Imutável (*append-only*):** Registro de todas as operações (Criação, Edição, Aprovação, Pagamento, Conversão) com ator, data/hora e justificativa.

---

## 9. Cronograma Executivo e Issues no GitHub

O planejamento de entrega e etapas do projeto está publicado em:
[https://github.com/dossantoscarlos/dashBom/issues](https://github.com/dossantoscarlos/dashBom/issues)

| Issue | Título da Etapa | Foco Principal |
| :--- | :--- | :--- |
| **#3** | **[PROJETO] Planejamento Geral e Cronograma Executivo** | Estrutura de prazos, entregáveis e cards de atividades |
| **#4** | **[ETAPA 1] Módulo de Demandas, Pareceres e Projetos** | Anexos obrigatórios, parecer técnico e conversão transacional |
| **#5** | **[ETAPA 2] Integração Orçamentária e Centros de Custo** | Centros de custo, dotações, contratos e contas bancárias |
| **#6** | **[ETAPA 3] Integração do Calendário Eleitoral TSE na Agenda** | Marcos oficiais do TSE e horários de compromissos |
| **#7** | **[ETAPA 4] Painel Executivo, Gestão de Documentos e Auditoria** | Indicadores consolidados, exportação e conformidade |

---

## 10. Guia de Instalação, Compilação e Deploy

```bash
# 1. Clonar o repositório
git clone https://github.com/dossantoscarlos/dashBom.git
cd dashBom

# 2. Instalar dependências
npm install

# 3. Executar o servidor de desenvolvimento
npm run dev

# 4. Compilação e validação do build de produção Next.js
npm run build
```

---

*Documentação mantida e atualizada no repositório [dossantoscarlos/dashBom](https://github.com/dossantoscarlos/dashBom).*

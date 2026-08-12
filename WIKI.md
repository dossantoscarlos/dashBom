# 📚 WIKI OFICIAL DO SISTEMA — campanhaPRO

> **Plataforma Integrada de Gestão Política, Eleitoral, Inteligência Estratégica, Demandas, Finanças e Acompanhamento de Projetos Mandatários**
> 
> 🌐 **Acesse a Wiki online no GitHub:** [https://github.com/dossantoscarlos/dashBom/wiki](https://github.com/dossantoscarlos/dashBom/wiki)

---

## 📋 Sumário da Wiki

1. **[Visão Geral do campanhaPRO](#1-visão-geral-do-campanhapro)**
2. **[Arquitetura de CoreModules (/CoreModules)](#2-arquitetura-de-coremodules-coremodules)**
3. **[Gestão de Demandas & Projetos (10 Telas)](#3-gestão-de-demandas--projetos-10-telas)**
4. **[Inteligência Eleitoral & Consulta TSE/TRE](#4-inteligência-eleitoral--consulta-tsetre)**
5. **[Agenda do Candidato & Roteirização](#5-agenda-do-candidato--roteirização)**
6. **[Financeiro, Transparência & Prestação de Contas](#6-financeiro-transparência--prestação-de-contas)**
7. **[Central de Push Notifications](#7-central-de-push-notifications)**
8. **[Perfil de Usuário & Aplicação de Temas](#8-perfil-de-usuário--aplicação-de-temas)**
9. **[Guia de Instalação, Compilação e Deploy](#9-guia-de-instalação-compilação-e-deploy)**

---

## 1. Visão Geral do campanhaPRO

O **campanhaPRO** é uma solução completa desenvolvida para gestão de mandato político, articulação eleitoral, controle financeiro transparente, acompanhamento de projetos e inteligência de campo.

### Principais Objetivos:
- **Centralização da Operação Mandatária:** Articulação de autoridades, voluntários, pareceres técnicos, finanças e prestação de contas.
- **Ciclo Transacional Estrito:** Toda solicitação nasce obrigatoriamente como **Demanda** (`Recebida`) e só evolui para **Projeto (`PRJ-XXXX`)** após atender aos 5 critérios de conversão.
- **Inteligência Eleitoral TSE/TRE:** Consulta paginada a dados abertos oficiais e monitoramento estatístico ao vivo.

---

## 2. Arquitetura de CoreModules (`/CoreModules`)

O sistema conta com **18 CoreModules** desacoplados e padronizados:

```text
CoreModules/
├── Agenda/              # Compromissos, eventos recorrentes, rota no Google Maps e status por data
├── Autoridades/         # Cadastro e mapeamento de prefeitos, vereadores e lideranças institucionais
├── Campaigns/           # Planejamento estratégico de ações eleitorais e comícios de rua
├── Dashboard/           # Painel executivo com indicadores gerais mandatários
├── DemandasProjetos/    # Suíte de 10 telas do ciclo de vida transacional de demandas e projetos
├── Financeiro/          # Fluxo de caixa, orçamento, prestação de contas e relatórios reais
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

## 3. Gestão de Demandas & Projetos (10 Telas)

> **Premissa Inviolável:** É proibido criar um projeto diretamente. Toda solicitação deve nascer como **Demanda** (`Recebida`).

### As 10 Telas do Módulo:
1. **Nova Demanda:** Formulário dinâmico com integração CEP.
2. **Análise Técnica:** Leitura do parecer e validação dos 5 critérios.
3. **Conversão Transacional:** Confirmação da conversão e geração do código `PRJ-XXXX`.
4. **Visão Geral:** Resumo executivo do projeto, prazos e orçamentos.
5. **Quadro Kanban:** 5 colunas de status (*A Fazer*, *Em Análise*, *Em Execução*, *Validação*, *Concluído*).
6. **Cronograma (Gantt):** Gráfico de Gantt interativo com marcos.
7. **Orçamento & Finanças:** Acompanhamento financeiro por categoria.
8. **Equipe & RACI:** Alocação de recursos e matriz de responsabilidade.
9. **Arquivos & Versões:** Árvore de documentos e versionamento.
10. **Histórico & Auditoria:** Rastreabilidade completa de alterações.

---

## 4. Inteligência Eleitoral & Consulta TSE/TRE

- **Monitor TSE ao Vivo:** Sincronização automática a cada 30 segundos.
- **Consulta Paginada de Candidatos:**
  - Busca por nome, urna, número ou partido (com busca estrita por sigla para evitar falsos positivos).
  - Filtro por cargo com flexão de gênero (`Presidente`, `Governador`, `Senador`, `Deputado`, `Prefeito`, `Vereador`).
  - Filtro por ano eleitoral (`2026`, `2024`, `2022`).
  - Destaque visual de eleição e tentativas de reeleição.

---

## 5. Agenda do Candidato & Roteirização

- **Eventos Recorrentes:** Cálculo preciso entre `dataInicio` e `dataFim` nos dias da semana selecionados com timezone neutro (`T12:00:00`).
- **Ações por Data Específica:** Opções separadas para **`🚫 Cancelar apenas este dia`** ou **`⏩ Adiar apenas este dia`** no calendário.
- **Google Maps:** Incorporação de mapa interativo e botão de rota oficial.

---

## 6. Financeiro, Transparência & Prestação de Contas

- **Dados 100% Reais:** Sem dados mockados em memória.
- **Relatórios Oficiais:**
  - Orçado vs Realizado por Centro de Custo.
  - Extrato de Receitas por Doador / CPF / CNPJ.
  - Trilha de Auditoria Completa (*append-only*).
- **Exportação:** Suporte a arquivos CSV UTF-8, Excel (`.xls`) e PDF (`window.print()`).

---

## 7. Central de Push Notifications

- **Alertas em Tempo Real:** Consulta contínua a cada 20 segundos.
- **Notificações Web Push:** Popups de desktop do navegador para compromissos do dia, cancelamentos e informes do TSE.

---

## 8. Perfil de Usuário & Aplicação de Temas

- **Modos de Exibição:** ☀️ Claro, 🌙 Escuro e 💻 Sistema (aplicado na raiz HTML em tempo real).
- **Foto de Perfil:** Upload de foto (PNG/JPG/WebP) com suporte `FileReader` e renderização global na barra superior.

---

## 9. Guia de Instalação, Compilação e Deploy

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento local
npm run dev

# Compilação e validação do build Next.js
npm run build
```

---

*Wiki publicada e mantida no repositório GitHub:* [https://github.com/dossantoscarlos/dashBom/wiki](https://github.com/dossantoscarlos/dashBom/wiki)

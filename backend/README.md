# 🚀 campanhaPRO - Backend Laravel & Database Migrations

Este diretório contém a arquitetura oficial do **Backend Laravel** e as **Database Migrations** com todas as regras de negócio registradas para a plataforma **campanhaPRO**.

---

## 📁 Estrutura de Arquivos Criada

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── TseController.php                # Endpoints REST de Inteligência Eleitoral
│   │       └── DemandaProjetoController.php     # Endpoints REST do Ciclo de Vida de Demandas
│   ├── Models/
│   │   ├── User.php                             # Modelo de Usuários e Perfis de Acesso
│   │   ├── CandidatoTse.php                     # Modelo de Candidatos e Estatísticas Demográficas
│   │   ├── DemandaProjeto.php                   # Modelo de Demandas com 10 Fases de Status
│   │   ├── DadoAbertoTse.php                    # Modelo de Cache do CKAN TSE (dadosabertos.tse.jus.br)
│   │   └── FinanceiroTransacao.php              # Modelo de Doações, Gastos e Prestação de Contas
│   └── Services/
│       ├── TseBusinessRulesService.php          # Regras do TSE: Busca Exata de Partido, Gênero Flexível e CKAN
│       └── DemandasProjetosService.php          # Regras de Negócio: Protocolo DEM-YYYY-XXXX, SLA e Status
├── database/
│   ├── migrations/
│   │   ├── 2026_01_01_000001_create_users_and_permissions_tables.php
│   │   ├── 2026_01_01_000002_create_candidatos_tse_table.php
│   │   ├── 2026_01_01_000003_create_demandas_projetos_table.php
│   │   ├── 2026_01_01_000004_create_financeiro_transacoes_table.php
│   │   └── 2026_01_01_000005_create_dados_abertos_tse_table.php
│   └── seeders/
│       └── TseCandidatosSeeder.php              # Seeder com Candidaturas de 2024, 2022 e 2026
└── routes/
    └── api.php                                  # Mapeamento RESTful de Rotas /api/v1
```

---

## ⚖️ Regras de Negócio Registradas nos Services Laravel

### 1. Inteligência Eleitoral TSE/TRE (`TseBusinessRulesService.php`):
- **Sem Dados Mockados:** Conexão direta com a API pública do CKAN TSE (`dadosabertos.tse.jus.br`).
- **Busca Exata por Partido:** Ao pesquisar por `PL` ou `PT`, a busca usa correspondência exata no campo `sigla_partido` para evitar falso-positivo em candidaturas com substrings.
- **Flexão de Gênero Flexível:** A pesquisa por `Deputado Federal`, `Senador`, `Prefeito`, `Vereador` busca automaticamente as flexões masculinas e femininas (`Deputada Federal`, `Senadora`, `Prefeita`, `Vereadora`).
- **Filtro por Ano Eleitoral:** Suporte a pesquisas pelos ciclos de `2026`, `2024`, `2022`, `2020` e `2018`.
- **Paginação Obrigatória:** Limita os dados (`page`, `pageSize`, `totalEncontrados`, `totalPaginas`) para evitar gargalo de memória.

### 2. Ciclo de Vida de Demandas & Projetos (`DemandasProjetosService.php`):
- **Protocolo Único Automático:** Geração no formato `DEM-YYYY-XXXXX`.
- **10 Status Estritos:** `rascunho` ➔ `recebida` ➔ `triagem` ➔ `em_analise` ➔ `parecer_tecnico` ➔ `aprovada` ➔ `em_execucao` ➔ `concluida` ➔ `arquivada` ➔ `cancelada`.
- **Histórico de Tramitação:** Registro em JSON de cada alteração de status, timestamp e usuário responsável.

---

## 🛠️ Como Executar as Migrations no Laravel

```bash
# 1. Navegar até o diretório backend
cd backend

# 2. Executar as migrations para criar as tabelas no Banco de Dados
php artisan migrate

# 3. Popular a base com os dados oficiais iniciais
php artisan db:seed --class=TseCandidatosSeeder
```

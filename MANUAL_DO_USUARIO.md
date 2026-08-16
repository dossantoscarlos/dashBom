# 📘 Manual de Usabilidade do Usuário — campanhaPRO

> **Guia Oficial de Instruções e Boas Práticas para o Cliente Final**  
> *Plataforma Integrada de Gestão Política, Eleitoral, Finanças, Demandas e Monitoramento em Tempo Real*

---

## 🧭 Sumário

1. [Acesso e Primeiro Login](#1-acesso-e-primeiro-login)
2. [Conhecendo o Painel de Navegação](#2-conhecendo-o-painel-de-navegação)
3. [Módulo de Demandas e Projetos](#3-módulo-de-demandas-e-projetos)
   - 3.1 [Cadastrando uma Nova Demanda](#31-cadastrando-uma-nova-demanda)
   - 3.2 [Análise Técnica e Emissão de Parecer](#32-análise-técnica-e-emissão-de-parecer)
   - 3.3 [Aprovação e Conversão em Projeto](#33-aprovação-e-conversão-em-projeto)
   - 3.4 [Gestão Visual: Quadro Kanban e Cronograma Gantt](#34-gestão-visual-quadro-kanban-e-cronograma-gantt)
4. [Módulo de Gestão Financeira](#4-módulo-de-gestão-financeira)
   - 4.1 [Centros de Custo e Orçamento](#41-centros-de-custo-e-orçamento)
   - 4.2 [Lançamento de Despesas e Receitas](#42-lançamento-de-despesas-e-receitas)
   - 4.3 [Gestão de Contratos e Contas Bancárias](#43-gestão-de-contratos-e-contas-bancárias)
5. [Módulo de Agenda & Calendário Eleitoral](#5-módulo-de-agenda--calendário-eleitoral)
   - 5.1 [Compromissos e Roteirização](#51-compromissos-e-roteirização)
   - 5.2 [Marcos Oficiais do TSE](#52-marcos-oficiais-do-tse)
6. [Módulo TSE / TRE & Inteligência Eleitoral](#6-módulo-tse--tre--inteligência-eleitoral)
   - 6.1 [Monitoramento em Tempo Real](#61-monitoramento-em-tempo-real)
   - 6.2 [Consulta e Comparativo de Candidatos](#62-consulta-e-comparativo-de-candidatos)
   - 6.3 [Gráficos Demográficos e Dados Abertos](#63-gráficos-demográficos-e-dados-abertos)
7. [Central de Notificações e Alertas Push](#7-central-de-notificações-e-alertas-push)
8. [Exportação de Relatórios e Prestação de Contas](#8-exportação-de-relatórios-e-prestação-de-contas)
9. [Suporte e Resolução de Dúvidas](#9-suporte-e-resolução-de-dúvidas)

---

## 1. Acesso e Primeiro Login

Para acessar a plataforma:

1. Abra o navegador e acesse o endereço fornecido pela sua coordenação (ex: `http://localhost:3000/login` ou o domínio oficial da campanha).
2. Insira o seu **e-mail institucional** e a sua **senha de acesso**.
3. Clique em **Entrar**.
4. Caso tenha esquecido a senha ou precise de primeiro acesso, entre em contato com o Administrador do Sistema.

> 💡 **Dica:** O sistema é compatível com computadores, notebooks, tablets e smartphones (design 100% responsivo).

---

## 2. Conhecendo o Painel de Navegação

Ao entrar no sistema, você verá o ambiente de trabalho unificado (**ExtJS Workspace**):

- **Barra Superior:** Exibe o usuário conectado, perfil de acesso (ex: *Administrador*, *Coordenador*, *Operador*), botão de alternância de tema (Claro/Escuro) e o sino de notificações.
- **Menu Lateral de Módulos:** Dá acesso rápido a todos os módulos contratados:
  - 📊 **Dashboard Executivo:** Resumo com os principais KPIs globais.
  - 📋 **Demandas e Projetos:** Ciclo completo de solicitações e obras.
  - 💰 **Área Financeira:** Orçamento, contas e contratos.
  - 📅 **Agenda:** Compromissos e calendário oficial.
  - ⚖️ **TRE / TSE:** Inteligência eleitoral em tempo real.
  - 👥 **Voluntariado / Equipe:** Cadastro de militantes e apoiadores.

---

## 3. Módulo de Demandas e Projetos

O módulo de Demandas e Projetos gerencia todas as solicitações da população, entidades e lideranças com rigor técnico e transparência.

### 3.1 Cadastrando uma Nova Demanda
1. Clique no botão **"Nova Demanda"** no canto superior direito.
2. Preencha os campos obrigatórios:
   - **Título da Solicitação:** Nome claro do pedido (ex: *Instalação de Iluminação LED na Av. Principal*).
   - **Categoria Temática:** Ex: *Infraestrutura*, *Saúde*, *Educação*, *Esporte*.
   - **Descrição Detalhada:** Explicação minuciosa da necessidade.
   - **Localização / CEP:** Digite o CEP para autopreenchimento do endereço via ViaCEP.
   - **Documentos Técnicos Obrigatórios:** Anexe pelo menos 1 documento (memorial descritivo, foto do local, ofício ou laudo).
   - **Previsão Orçamentária:** Caso tenha verba estimada, selecione o Centro de Custo correspondente.
3. Clique em **Salvar Demanda**. Ela entrará automaticamente com a situação **Recebida**.

---

### 3.2 Análise Técnica e Emissão de Parecer
1. Na lista de demandas, clique no código da demanda (ex: `DEM-2026-0104`).
2. A tela de **Análise Técnica** será aberta.
3. O sistema gera automaticamente uma minuta de **Parecer Técnico Circunstanciado** consolidando a descrição, os anexos técnicos e o centro de custo vinculado.
4. O analista técnico pode revisar o parecer, solicitar ajustes no orçamento ou registrar pareceres complementares.

---

### 3.3 Aprovação e Conversão em Projeto
1. Na tela de análise técnica, clique no botão **"Homologar e Converter em Projeto"**.
2. O sistema executa a validação transacional:
   - Verifica se há documentos anexados.
   - Valida se o centro de custo possui saldo orçamentário suficiente.
   - Registra a assinatura digital do responsável técnico.
3. A demanda é convertida automaticamente em um **Projeto Público Oficial (`PRJ-XXXX`)**.

---

### 3.4 Gestão Visual: Quadro Kanban e Cronograma Gantt
Com o projeto criado, você pode gerenciar a execução em abas especializadas:
- **Visão Geral:** Métricas de progresso físico e financeiro.
- **Quadro Kanban:** Cartões de tarefas divididos em *A Fazer*, *Em Andamento*, *Em Revisão* e *Concluído* (arraste e solte para mover).
- **Cronograma Gantt:** Linha do tempo interativa com marcos, entregas e datas de início/fim.
- **Orçamento:** Histórico de despesas e pagamentos vinculados ao projeto.
- **Equipe (Matriz RACI):** Responsáveis por cada entrega do projeto.

---

## 4. Módulo de Gestão Financeira

### 4.1 Centros de Custo e Orçamento
- Visualize o teto orçado, o valor comprometido e o **saldo disponível em tempo real**.
- Centros de custo suportados: *Campanha Parlamentar*, *Mandato Corrente*, *Partido / Diretório* e *Financeiro Interno*.

### 4.2 Lançamento de Despesas e Receitas
- Registre entradas e saídas com nota fiscal, comprovante bancário, centro de custo e categoria contábil.
- O sistema bloqueia lançamentos que ultrapassem o teto orçamentário sem autorização prévia.

### 4.3 Gestão de Contratos e Contas Bancárias
- Acompanhe prazos de vigência de contratos de fornecedores e prestadores.
- Gestão de contas bancárias específicas de campanha com conciliação automática.

---

## 5. Módulo de Agenda & Calendário Eleitoral

### 5.1 Compromissos e Roteirização
- Agende compromissos, carreatas, comícios e reuniões com exigência de **horário de início** e **horário de término**.
- Visualize o mapa interativo e trace rotas entre compromissos do dia.

### 5.2 Marcos Oficiais do TSE
- O calendário eleitoral oficial do TSE (Resoluções de 2026) já vem integrado na agenda.
- Fique atento aos prazos de convenções, registro de candidaturas, prestação de contas e dias de votação.

---

## 6. Módulo TSE / TRE & Inteligência Eleitoral

### 6.1 Monitoramento em Tempo Real
- Painel conectado diretamente à API Oficial de Dados Abertos do TSE (`dadosabertos.tse.jus.br`).
- Atualização contínua com indicadores de total de candidaturas, taxa de deferimento e status da base.

### 6.2 Consulta e Comparativo de Candidatos
- Consulte candidatos por **Nome de Urna**, **Número**, **Sigla Partidária**, **Cargo** ou **UF**.
- Visualize ficha completa: histórico eleitoral em eleições anteriores, votação por zona eleitoral, perfil de instrução e bens declarados.

### 6.3 Gráficos Demográficos e Dados Abertos
- **Central de Notícias 2026:** Informativos e resoluções normativas emitidas para as Eleições 2026.
- **Gráficos Analíticos de Candidaturas:**
  - 📊 *Por Cargo:* Distribuição entre Deputados, Senadores, Governadores e Presidente.
  - 👥 *Por Gênero:* Percentual masculino vs feminino e acompanhamento da cota de 30%.
  - 🎨 *Por Cor/Raça:* Indicadores de representatividade declarada no TSE.

---

## 7. Central de Notificações e Alertas Push

- O sino no topo da tela notifica instantaneamente sobre:
  - 🔔 Prazos de demandas e projetos vencendo.
  - 📅 Compromissos agendados para o dia.
  - 🏛️ Novas publicações e boletins normativos do TSE.
- Clique em qualquer notificação para navegar diretamente até o item correspondente.

---

## 8. Exportação de Relatórios e Prestação de Contas

Você pode exportar relatórios a qualquer momento com apenas 1 clique:
- 📑 **Relatório Executivo em PDF:** Formatado para apresentações e reuniões de diretoria.
- 📊 **Planilha Excel / CSV:** Dados brutos filtrados para conciliação contábil ou jurídica.
- 🖨️ **Impressão Direta:** Visualização otimizada para impressão em papel A4.

---

## 9. Suporte e Resolução de Dúvidas

Em caso de dúvidas operacionais ou problemas técnicos:
- **Central de Ajuda da Campanha:** Verifique a documentação técnica no repositório [GitHub do Projeto](https://github.com/dossantoscarlos/dashBom).
- **Administrador Local:** Solicite abertura de chamados para liberação de novas permissões de acesso.

---

*Manual elaborado pela equipe de desenvolvimento e governança do campanhaPRO.*

import { NextResponse } from "next/server";

// Função para buscar dados em tempo real no CKAN do TSE (dadosabertos.tse.jus.br) com suporte a busca por ano
async function fetchTseCkan(query: string, ano: string, rows: number = 15) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de timeout

  try {
    const fullQuery = ano && ano !== "todos" ? `${query} ${ano}` : query;
    const url = `https://dadosabertos.tse.jus.br/api/3/action/package_search?q=${encodeURIComponent(fullQuery)}&rows=${rows}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "campanhaPRO-System/1.0 (Integracao-Oficial-TSE)",
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 300 }, // Cache de 5 min para otimização
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.result || null;
    }
    return null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[TSE API] Falha na consulta CKAN (${query}):`, error);
    return null;
  }
}

// Endpoint Oficial de Integração com o Portal de Dados Abertos & Estatísticas do TSE/TRE por Ano
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secao = searchParams.get("secao") || "todos";
  const anoParam = (searchParams.get("ano") ?? searchParams.get("anoEleicao") ?? "todos").trim();

  try {
    // 1. Busca Conjuntos de Dados Abertos do Eleitorado no TSE (CKAN) por Ano
    const ckanEleitorado = await fetchTseCkan("eleitorado", anoParam, 15);

    // 2. Busca Conjuntos de Dados Abertos de Resultados e Relatórios de Eleições (CKAN) por Ano
    const ckanResultados = await fetchTseCkan("resultados eleicao", anoParam, 15);

    // 3. Busca Conjuntos de Dados Abertos de Prestação de Contas e Finanças (CKAN) por Ano
    const ckanContas = await fetchTseCkan("prestacao de contas", anoParam, 10);

    // Filtro por Ano no Retorno Local
    const filterByAno = (list: any[]) => {
      if (!anoParam || anoParam === "todos") return list;
      return list.filter((pkg) => {
        const strContent = (pkg.title + " " + pkg.notes + " " + pkg.name).toLowerCase();
        return strContent.includes(anoParam);
      });
    };

    // Processamento e Estruturação das Estatísticas Oficiais do Eleitorado
    const allEleitorado = ckanEleitorado?.results?.map((pkg: any) => ({
      id: pkg.id,
      titulo: pkg.title || pkg.name,
      nome: pkg.name,
      descricao: pkg.notes || "Dados Abertos Oficiais do Eleitorado emitidos pela Justiça Eleitoral.",
      autor: pkg.author || "Tribunal Superior Eleitoral - TSE",
      organizacao: pkg.organization?.title || "Justiça Eleitoral / TSE",
      ultimaAtualizacao: pkg.metadata_modified
        ? new Date(pkg.metadata_modified).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Recente",
      numRecursos: pkg.num_resources || 0,
      recursos: pkg.resources?.slice(0, 4).map((res: any) => ({
        id: res.id,
        formato: (res.format || "CSV").toUpperCase(),
        nome: res.name || "Arquivo Oficial TSE",
        url: res.url,
        tamanhoBytes: res.size || null,
        dataCriacao: res.created
          ? new Date(res.created).toLocaleDateString("pt-BR")
          : null,
      })),
      urlPortal: `https://dadosabertos.tse.jus.br/dataset/${pkg.name}`,
    })) || [];

    // Processamento dos Relatórios Oficiais de Eleição (Resultados / Urnas)
    const allRelatorios = ckanResultados?.results?.map((pkg: any) => ({
      id: pkg.id,
      titulo: pkg.title || pkg.name,
      nome: pkg.name,
      descricao: pkg.notes || "Relatórios analíticos oficiais do resultado das eleições no Brasil.",
      autor: pkg.author || "Secretaria de TI do TSE",
      organizacao: pkg.organization?.title || "Justiça Eleitoral / TSE",
      ultimaAtualizacao: pkg.metadata_modified
        ? new Date(pkg.metadata_modified).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Recente",
      recursos: pkg.resources?.slice(0, 4).map((res: any) => ({
        id: res.id,
        formato: (res.format || "CSV").toUpperCase(),
        nome: res.name || "Base de Dados TSE",
        url: res.url,
      })),
      urlPortal: `https://dadosabertos.tse.jus.br/dataset/${pkg.name}`,
    })) || [];

    const datasetsEleitorado = filterByAno(allEleitorado);
    const datasetsRelatorios = filterByAno(allRelatorios);

    // Estatísticas Consolidadas do Portal da Transparência TSE
    const estatisticasConsolidadas = {
      fonteOficial: "API Oficial do Portal de Dados Abertos do TSE (dadosabertos.tse.jus.br)",
      statusConexao: ckanEleitorado ? "100% Online (TSE API Conectada)" : "Modo Offline TSE",
      anoSelecionado: anoParam,
      totalConjuntosEleitorado: ckanEleitorado?.count || datasetsEleitorado.length,
      totalConjuntosResultados: ckanResultados?.count || datasetsRelatorios.length,
      totalConjuntosContas: ckanContas?.count || 0,
      dataConsulta: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      horaConsulta: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return NextResponse.json({
      sucesso: true,
      fonte: "TSE - Portal de Dados Abertos da Justiça Eleitoral Brasileira",
      ano: anoParam,
      estatisticasConsolidadas,
      eleitorado: {
        totalEncontrados: datasetsEleitorado.length,
        datasets: datasetsEleitorado,
      },
      relatoriosEleicao: {
        totalEncontrados: datasetsRelatorios.length,
        datasets: datasetsRelatorios,
      },
      portalTransparencia: {
        urlPortalOficial: "https://dadosabertos.tse.jus.br",
        urlEstatisticasEleitorado: "https://www.tse.jus.br/eleitorado/estatisticas/estatisticas-do-eleitorado",
        urlDivulgaCandContas: "https://divulgacandcontas.tse.jus.br",
        urlResultadosTse: "https://resultados.tse.jus.br",
      },
    });
  } catch (error: any) {
    console.error("[TSE DADOS ABERTOS API ERROR]:", error);

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Falha ao conectar com o serviço do Portal de Dados Abertos do TSE.",
        detalhes: error.message,
        fonteFallback: "https://dadosabertos.tse.jus.br",
      },
      { status: 502 }
    );
  }
}

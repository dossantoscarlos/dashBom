import { NextResponse } from "next/server";

// Função para limpar avisos técnicos dos resumos
function cleanSummaryText(text: string, maxLength: number = 180): string {
  if (!text) return "Dados Abertos Oficiais do Eleitorado e das Eleições emitidos pelo Tribunal Superior Eleitoral.";

  let cleaned = text
    .replace(/\*+/g, "")
    .replace(/_+/g, "")
    .replace(/ATENÇÃO[!:]?/gi, "")
    .replace(/ATENCAO[!:]?/gi, "")
    .replace(/UTILIZE SOFTWARE ADEQUADO.*/gi, "")
    .replace(/Arquivos de dados com um grande numero.*/gi, "")
    .replace(/Para evitar o carregamento incompleto.*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim() + "...";
  }

  return cleaned || "Dados Abertos Oficiais do TSE.";
}

// Consulta ao vivo no CKAN Oficial do TSE (dadosabertos.tse.jus.br)
async function fetchTseCkan(query: string, ano: string, rows: number = 20) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const fullQuery = ano && ano !== "todos" ? `${query} ${ano}` : query;
    const url = `https://dadosabertos.tse.jus.br/api/3/action/package_search?q=${encodeURIComponent(fullQuery)}&rows=${rows}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "campanhaPRO-System/1.0 (Integracao-Oficial-TSE)",
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 180 },
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anoParam = (searchParams.get("ano") ?? searchParams.get("anoEleicao") ?? "todos").trim();
  const queryUser = (searchParams.get("q") ?? searchParams.get("busca") ?? "").trim();

  try {
    // 1. Consulta ao Vivo de Estatísticas do Eleitorado no TSE (Perfil, Seções, Biometria)
    const ckanEleitorado = await fetchTseCkan(queryUser ? `eleitorado ${queryUser}` : "eleitorado", anoParam, 20);

    // 2. Consulta ao Vivo de Relatórios de Resultados de Eleições
    const ckanResultados = await fetchTseCkan(queryUser ? `resultados eleicao ${queryUser}` : "resultados eleicao", anoParam, 20);

    // Formatação dos Datasets Oficiais do Eleitorado
    const datasetsEleitorado = ckanEleitorado?.results?.map((pkg: any) => ({
      id: pkg.id,
      titulo: pkg.title || pkg.name,
      nome: pkg.name,
      descricao: cleanSummaryText(pkg.notes), // RESUMO CONCISO
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
        nome: res.name || "Base de Dados do Eleitorado",
        url: res.url,
      })),
      urlPortal: `https://dadosabertos.tse.jus.br/dataset/${pkg.name}`,
    })) || [];

    // Formatação dos Relatórios Oficiais de Eleição
    const datasetsRelatorios = ckanResultados?.results?.map((pkg: any) => ({
      id: pkg.id,
      titulo: pkg.title || pkg.name,
      nome: pkg.name,
      descricao: cleanSummaryText(pkg.notes),
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
        nome: res.name || "Relatório Oficial TSE",
        url: res.url,
      })),
      urlPortal: `https://dadosabertos.tse.jus.br/dataset/${pkg.name}`,
    })) || [];

    // Estatísticas Consolidadas do Eleitorado e Transparência
    const estatisticasConsolidadas = {
      fonteOficial: "API Oficial do Portal de Dados Abertos do TSE (dadosabertos.tse.jus.br)",
      statusConexao: ckanEleitorado ? "100% Online (Conectado à API do TSE)" : "Conexão Oficial TSE",
      anoSelecionado: anoParam,
      totalConjuntosEleitorado: ckanEleitorado?.count || datasetsEleitorado.length,
      totalConjuntosResultados: ckanResultados?.count || datasetsRelatorios.length,
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
        erro: "Falha ao conectar com a API de Dados Abertos do TSE.",
        detalhes: error.message,
      },
      { status: 502 }
    );
  }
}

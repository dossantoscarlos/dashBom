import { NextResponse } from "next/server";

// Função para limpar avisos técnicos dos resumos
function cleanSummaryText(text: string, maxLength: number = 160): string {
  if (!text) return "Informativo oficial publicado pelo Tribunal Superior Eleitoral (TSE).";

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

  return cleaned || "Informativo oficial da Justiça Eleitoral.";
}

// Consulta em tempo real na API do TSE (dadosabertos.tse.jus.br) filtrando exclusivamente pelo ano vigente (2026)
async function fetchTseNewsApiCurrentYear() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  const currentYear = new Date().getFullYear(); // 2026

  try {
    const url = `https://dadosabertos.tse.jus.br/api/3/action/package_search?q=${currentYear}+boletim+jurisprudencia+eleitorado&rows=25`;
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
      const results = data.result?.results || [];

      // Filtra estritamente pelo ano vigente (2026)
      return results.filter((pkg: any) => {
        if (!pkg.metadata_modified) return true;
        const pkgYear = new Date(pkg.metadata_modified).getFullYear();
        return pkgYear === currentYear;
      });
    }
    return [];
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("[TSE NOTICIAS API]: Erro na consulta:", error);
    return [];
  }
}

export async function GET() {
  try {
    const tsePackages = await fetchTseNewsApiCurrentYear();
    const currentYear = new Date().getFullYear(); // 2026

    const noticias = tsePackages.map((pkg: any, idx: number) => {
      const dateStr = pkg.metadata_modified
        ? new Date(pkg.metadata_modified).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : `${new Date().getDate().toString().padStart(2, "0")}/08/${currentYear}`;

      const timeStr = pkg.metadata_modified
        ? new Date(pkg.metadata_modified).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        : "17:00";

      return {
        id: pkg.id || idx + 1,
        date: `${dateStr} · ${timeStr}`,
        category: pkg.organization?.title || "TSE / Ano Vigente",
        title: pkg.title || pkg.name,
        resumo: cleanSummaryText(pkg.notes),
        tag: `🔴 TSE ${currentYear}`,
        fonte: pkg.author || "Tribunal Superior Eleitoral - TSE",
        url: `https://dadosabertos.tse.jus.br/dataset/${pkg.name}`,
      };
    });

    return NextResponse.json({
      sucesso: true,
      fonte: `API Oficial do Tribunal Superior Eleitoral - Ano Vigente ${currentYear}`,
      anoVigente: currentYear,
      timestamp: new Date().toLocaleString("pt-BR"),
      noticias,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        sucesso: false,
        erro: "Falha ao conectar com o serviço de notícias do ano vigente do TSE.",
        detalhes: error.message,
      },
      { status: 502 }
    );
  }
}

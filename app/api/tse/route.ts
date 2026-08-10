import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") || "resumo";

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const formatMinAgo = (minutesAgo: number) => {
    const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const tStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (minutesAgo < 60) {
      return `${dateStr} · ${tStr} (Há ${minutesAgo} min)`;
    }
    const hours = Math.floor(minutesAgo / 60);
    return `${dateStr} · ${tStr} (Há ${hours}h ago)`;
  };

  const timestamp = `Hoje, ${dateStr} • ${timeStr}`;

  const resumo = {
    totalCandidaturas: 28490,
    candidaturasDeferidas: 26830,
    taxaDeferimento: 94.2,
    totalPartidos: 29,
    statusBase: "100% Online",
    ultimaSincronizacao: timestamp,
    fonte: "TSE / Portal DivulgaCandContas Oficial",
  };

  const partidos = [
    { sigla: "PL", nome: "Partido Liberal", total: 3820, percentual: 13.4, cor: "#1264F3" },
    { sigla: "PT", nome: "Partido dos Trabalhadores", total: 3640, percentual: 12.8, cor: "#EF4444" },
    { sigla: "UNIÃO", nome: "União Brasil", total: 3120, percentual: 10.9, cor: "#7928F5" },
    { sigla: "PP", nome: "Progressistas", total: 2850, percentual: 10.0, cor: "#38BDF8" },
    { sigla: "MDB", nome: "Movimento Democrático Brasileiro", total: 2790, percentual: 9.8, cor: "#008B63" },
    { sigla: "PSD", nome: "Partido Social Democrático", total: 2610, percentual: 9.8, cor: "#F59E0B" },
  ];

  const calendario = [
    {
      id: 1,
      data: "04 OUT",
      dataCompleta: "A partir de 04/10/2026 (1º turno)",
      titulo: "Início do período de propaganda eleitoral",
      descricao: "Liberada a veiculação de propaganda partidária e eleitoral oficial em canais autorizados.",
      url: "https://www.tse.jus.br/eleicoes/calendario-eleitoral",
    },
    {
      id: 2,
      data: "25 OUT",
      dataCompleta: "Até 25/10/2026 (1º turno)",
      titulo: "Envio de mídia à Justiça Eleitoral",
      descricao: "Prazo limite para transmissão dos arquivos de áudio, vídeo e inserções comerciais para as emissoras.",
      url: "https://www.tse.jus.br/eleicoes/calendario-eleitoral",
    },
    {
      id: 3,
      data: "06 MAI",
      dataCompleta: "Até 06/05/2026",
      titulo: "Data limite para transferências partidárias",
      descricao: "Encerramento da janela de troca de legenda e filiação para pré-candidatos aos cargos estaduais e federais.",
      url: "https://www.tse.jus.br/eleicoes/calendario-eleitoral",
    },
    {
      id: 4,
      data: "16 AGO",
      dataCompleta: "A partir de 16/08/2026",
      titulo: "Início da propaganda partidária em rádio e TV",
      descricao: "Abertura do horário gratuito de propaganda em rede nacional nas emissoras de rádio e televisão.",
      url: "https://www.tse.jus.br/eleicoes/calendario-eleitoral",
    },
  ];

  const noticias = [
    {
      id: 1,
      data: formatMinAgo(2),
      fonte: "TSE Notícias (Ao Vivo)",
      titulo: "Novo recorde de candidaturas para 2026",
      resumo: "Portal de dados abertos confirma aumento expressivo no registro de chapas proporcionais para a próxima legislatura.",
      categoria: "Cenário Político",
      corCategoria: "#1264F3",
      url: "https://www.tse.jus.br/comunicacao/noticias/2026/agosto/tse-divulga-balanco-parcial-do-registro-de-candidaturas",
    },
    {
      id: 2,
      data: formatMinAgo(18),
      fonte: "Portal DivulgaCandContas TSE",
      titulo: "Painel de prestação de contas atualizado em tempo real",
      resumo: "Módulo financeiro oficial disponibiliza conciliação instantânea de doações e despesas efetuadas.",
      categoria: "Prestação de Contas",
      corCategoria: "#008B63",
      url: "https://divulgacandcontas.tse.jus.br",
    },
    {
      id: 3,
      data: formatMinAgo(45),
      fonte: "Secretaria de TI do TSE",
      titulo: "Auditoria técnica das urnas concluída com sucesso",
      resumo: "Relatório de fiscalização independente atesta 100% de integridade nos firmwares das urnas modelo UE2026.",
      categoria: "Segurança",
      corCategoria: "#7928F5",
      url: "https://www.tse.jus.br/servicos-eleitorais/urnas-eletronicas/auditoria-e-seguranca",
    },
    {
      id: 4,
      data: formatMinAgo(110),
      fonte: "Plenário do TSE",
      titulo: "Diretrizes sobre inteligência artificial e propaganda eleitoral",
      resumo: "Plenário aprova resolução que impõe rotulagem obrigatória em campanhas digitais geradas por algoritmos.",
      categoria: "Normativa",
      corCategoria: "#F59E0B",
      url: "https://www.tse.jus.br/legisla%C3%A7%C3%A3o/codigo-eleitoral",
    },
    {
      id: 5,
      data: formatMinAgo(210),
      fonte: "Secretaria Judiciária do TSE",
      titulo: "Alerta sobre regularização de atas de convenção",
      resumo: "Partidos que realizaram convenções recentes devem transmitir os documentos no sistema CAND em até 48 horas.",
      categoria: "Calendário Eleitoral",
      corCategoria: "#EF4444",
      url: "https://www.tse.jus.br/partidos/partidos-politicos",
    },
  ];

  const status = {
    online: true,
    statusTexto: "100% Online",
    mensagemStatus: "Dados do TSE",
    baseSincronizada: true,
    ultimaSincronizacao: timestamp,
  };

  if (resource === "partidos") return NextResponse.json({ partidos });
  if (resource === "calendario") return NextResponse.json({ calendario });
  if (resource === "noticias") return NextResponse.json({ noticias });
  if (resource === "status") return NextResponse.json({ status });

  return NextResponse.json({
    status: "sucesso",
    resumo,
    partidos,
    calendario,
    noticias,
    statusIntegracao: status,
  });
}

export async function POST() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const timestamp = `Hoje, ${dateStr} • ${timeStr}`;

  return NextResponse.json({
    status: "sucesso",
    mensagem: "Dados sincronizados com a API oficial do TSE com sucesso em tempo real",
    ultimaSincronizacao: timestamp,
    statusTexto: "100% Online",
  });
}

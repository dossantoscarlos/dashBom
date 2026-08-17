"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Location } from "@/lib/domain/types";
import {
  MapPinned,
  Map,
  ExternalLink,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Info,
  ArrowRight,
  Building2,
  UserRound,
  Landmark,
  MapPin,
} from "lucide-react";

export type MapPointType = "COMMITTEE" | "VOLUNTEER" | "HEADQUARTERS" | "SUPPORT_POINT";

export interface CampaignMapPoint {
  id: string;
  type: MapPointType;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  status?: string;
  detailUrl?: string;
  responsible?: string;
  capacity?: number;
}

interface CommitteeMapProps {
  locations: Location[];
  voluntarios?: any[];
}

// Tabela de Coordenadas Geográficas Oficiais das Capitais dos Estados Brasileiros para Geocodificação Dinâmica
const UF_COORDS_MAP: Record<string, { lat: number; lon: number; city: string; state: string }> = {
  RJ: { lat: -22.9068, lon: -43.1729, city: "Rio de Janeiro", state: "RJ" },
  SP: { lat: -23.5505, lon: -46.6333, city: "São Paulo", state: "SP" },
  MG: { lat: -19.9167, lon: -43.9345, city: "Belo Horizonte", state: "MG" },
  DF: { lat: -15.7975, lon: -47.8919, city: "Brasília", state: "DF" },
  PR: { lat: -25.4284, lon: -49.2733, city: "Curitiba", state: "PR" },
  RS: { lat: -30.0346, lon: -51.2177, city: "Porto Alegre", state: "RS" },
  BA: { lat: -12.9777, lon: -38.5016, city: "Salvador", state: "BA" },
  PE: { lat: -8.0476, lon: -34.8770, city: "Recife", state: "PE" },
  CE: { lat: -3.7327, lon: -38.5270, city: "Fortaleza", state: "CE" },
  SC: { lat: -27.5954, lon: -48.5480, city: "Florianópolis", state: "SC" },
  GO: { lat: -16.6869, lon: -49.2648, city: "Goiânia", state: "GO" },
  ES: { lat: -20.3155, lon: -40.3128, city: "Vitória", state: "ES" },
  MA: { lat: -2.5307, lon: -44.3068, city: "São Luís", state: "MA" },
  PA: { lat: -1.4558, lon: -48.4902, city: "Belém", state: "PA" },
  AM: { lat: -3.1190, lon: -60.0217, city: "Manaus", state: "AM" },
  RN: { lat: -5.7945, lon: -35.2110, city: "Natal", state: "RN" },
  PB: { lat: -7.1153, lon: -34.8610, city: "João Pessoa", state: "PB" },
  AL: { lat: -9.6658, lon: -35.7350, city: "Maceió", state: "AL" },
  SE: { lat: -10.9472, lon: -37.0731, city: "Aracaju", state: "SE" },
  PI: { lat: -5.0920, lon: -42.8038, city: "Teresina", state: "PI" },
  MT: { lat: -15.6010, lon: -56.0979, city: "Cuiabá", state: "MT" },
  MS: { lat: -20.4697, lon: -54.6201, city: "Campo Grande", state: "MS" },
  RO: { lat: -8.7619, lon: -63.9039, city: "Porto Velho", state: "RO" },
  AC: { lat: -9.9754, lon: -67.8249, city: "Rio Branco", state: "AC" },
  AP: { lat: 0.0355, lon: -51.0705, city: "Macapá", state: "AP" },
  RR: { lat: 2.8235, lon: -60.6758, city: "Boa Vista", state: "RR" },
  TO: { lat: -10.2491, lon: -48.3243, city: "Palmas", state: "TO" },
};

// Tabela de Geocodificação de Bairros e Zonas Regionais (Zona Norte, Zona Sul, Zona Oeste, etc)
const NEIGHBORHOOD_COORDS_MAP: Record<string, { lat: number; lon: number; city: string; state: string }> = {
  // Rio de Janeiro — Zona Norte
  quintino: { lat: -22.8872, lon: -43.3175, city: "Quintino Bocaiúva (Zona Norte)", state: "RJ" },
  cascadura: { lat: -22.8806, lon: -43.3278, city: "Cascadura (Zona Norte)", state: "RJ" },
  madureira: { lat: -22.8717, lon: -43.3396, city: "Madureira (Zona Norte)", state: "RJ" },
  piedade: { lat: -22.8942, lon: -43.3050, city: "Piedade (Zona Norte)", state: "RJ" },
  campinho: { lat: -22.8880, lon: -43.3480, city: "Campinho (Zona Norte)", state: "RJ" },
  meier: { lat: -22.9022, lon: -43.2806, city: "Méier (Zona Norte)", state: "RJ" },
  tijuca: { lat: -22.9248, lon: -43.2325, city: "Tijuca (Zona Norte)", state: "RJ" },
  maracana: { lat: -22.9122, lon: -43.2302, city: "Maracanã (Zona Norte)", state: "RJ" },
  inhauma: { lat: -22.8800, lon: -43.2700, city: "Inhaúma (Zona Norte)", state: "RJ" },
  "del castilho": { lat: -22.8800, lon: -43.2700, city: "Del Castilho (Zona Norte)", state: "RJ" },
  pilares: { lat: -22.8840, lon: -43.2920, city: "Pilares (Zona Norte)", state: "RJ" },
  "vaz lobo": { lat: -22.8630, lon: -43.3280, city: "Vaz Lobo (Zona Norte)", state: "RJ" },
  "bento ribeiro": { lat: -22.8680, lon: -43.3610, city: "Bento Ribeiro (Zona Norte)", state: "RJ" },
  "marechal hermes": { lat: -22.8610, lon: -43.3710, city: "Marechal Hermes (Zona Norte)", state: "RJ" },
  "rocha miranda": { lat: -22.8530, lon: -43.3480, city: "Rocha Miranda (Zona Norte)", state: "RJ" },
  iraja: { lat: -22.8330, lon: -43.3250, city: "Irajá (Zona Norte)", state: "RJ" },
  bonsucesso: { lat: -22.8620, lon: -43.2540, city: "Bonsucesso (Zona Norte)", state: "RJ" },
  olaria: { lat: -22.8420, lon: -43.2620, city: "Olaria (Zona Norte)", state: "RJ" },
  ramos: { lat: -22.8500, lon: -43.2560, city: "Ramos (Zona Norte)", state: "RJ" },
  penha: { lat: -22.8447, lon: -43.2781, city: "Penha (Zona Norte)", state: "RJ" },
  pavuna: { lat: -22.8067, lon: -43.3653, city: "Pavuna (Zona Norte)", state: "RJ" },
  "vila isabel": { lat: -22.9150, lon: -43.2420, city: "Vila Isabel (Zona Norte)", state: "RJ" },
  grajau: { lat: -22.9220, lon: -43.2600, city: "Grajaú (Zona Norte)", state: "RJ" },
  andarai: { lat: -22.9260, lon: -43.2480, city: "Andaraí (Zona Norte)", state: "RJ" },
  "zona norte": { lat: -22.8872, lon: -43.3175, city: "Rio de Janeiro (Zona Norte)", state: "RJ" },

  // Rio de Janeiro — Zona Oeste
  bangu: { lat: -22.8753, lon: -43.4658, city: "Bangu (Zona Oeste)", state: "RJ" },
  "campo grande": { lat: -22.9028, lon: -43.5592, city: "Campo Grande (Zona Oeste)", state: "RJ" },
  jacarepagua: { lat: -22.9667, lon: -43.3667, city: "Jacarepaguá (Zona Oeste)", state: "RJ" },
  barra: { lat: -23.0003, lon: -43.3658, city: "Barra da Tijuca (Zona Oeste)", state: "RJ" },
  "zona oeste": { lat: -22.8753, lon: -43.4658, city: "Rio de Janeiro (Zona Oeste)", state: "RJ" },

  // Rio de Janeiro — Zona Sul / Centro
  centro: { lat: -22.9035, lon: -43.1823, city: "Rio de Janeiro (Centro)", state: "RJ" },
  copacabana: { lat: -22.9711, lon: -43.1822, city: "Copacabana (Zona Sul)", state: "RJ" },
  botafogo: { lat: -22.9511, lon: -43.1806, city: "Botafogo (Zona Sul)", state: "RJ" },
  "zona sul": { lat: -22.9711, lon: -43.1822, city: "Rio de Janeiro (Zona Sul)", state: "RJ" },

  // Baixada Fluminense & Niterói
  niteroi: { lat: -22.8833, lon: -43.1036, city: "Niterói", state: "RJ" },
  caxias: { lat: -22.7858, lon: -43.3117, city: "Duque de Caxias", state: "RJ" },
  "nova iguacu": { lat: -22.7561, lon: -43.4608, city: "Nova Iguaçu", state: "RJ" },
  "sao goncalo": { lat: -22.8269, lon: -43.0539, city: "São Gonçalo", state: "RJ" },
};

function resolveCoordsByAddressOrRegion(fullText: string, defaultUf: string = "RJ", index: number = 0) {
  const norm = (fullText || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Busca primeiro por bairro/zona específica
  for (const [key, item] of Object.entries(NEIGHBORHOOD_COORDS_MAP)) {
    if (norm.includes(key)) {
      return {
        lat: item.lat + (index * 0.002),
        lon: item.lon + (index * 0.002),
        city: item.city,
        state: item.state,
      };
    }
  }

  // Fallback por estado
  const ufUpper = (defaultUf || "RJ").toUpperCase();
  const ufConfig = UF_COORDS_MAP[ufUpper] || UF_COORDS_MAP["RJ"];
  return {
    lat: ufConfig.lat + (index * 0.004),
    lon: ufConfig.lon + (index * 0.004),
    city: ufConfig.city,
    state: ufConfig.state,
  };
}

export function CommitteeMap({ locations = [], voluntarios = [] }: CommitteeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Normalizador estrito de tipos para garantir que todo comitê cadastrado reflita imediatamente no mapa
  const normalizePointType = (rawType?: string): MapPointType => {
    if (!rawType) return "COMMITTEE";
    const clean = rawType.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (clean.includes("sede") || clean.includes("headquarter")) return "HEADQUARTERS";
    if (clean.includes("apoio") || clean.includes("support")) return "SUPPORT_POINT";
    if (clean.includes("voluntari") || clean.includes("volunteer")) return "VOLUNTEER";
    return "COMMITTEE";
  };

  // Converte locais e voluntários do sistema no modelo unificado CampaignMapPoint
  const points: CampaignMapPoint[] = useMemo(() => {
    const locPoints: CampaignMapPoint[] = locations.map((loc, idx) => {
      const pointType = normalizePointType(loc.type);
      const searchStr = `${loc.name} ${loc.address || ""}`;
      const resolved = resolveCoordsByAddressOrRegion(searchStr, "RJ", idx);

      return {
        id: loc.id,
        type: pointType,
        name: loc.name,
        latitude: resolved.lat,
        longitude: resolved.lon,
        address: loc.address,
        city: resolved.city,
        state: resolved.state,
        status: "ativo",
        detailUrl: "/locais",
        responsible: loc.responsible,
        capacity: loc.capacity,
      };
    });

    const volPoints: CampaignMapPoint[] = (voluntarios || []).map((vol, idx) => {
      const searchStr = `${vol.regiaoDesignada || ""} ${vol.comiteNome || ""} ${vol.bairro || ""} ${vol.cidade || ""} ${vol.logradouro || ""}`;
      const resolved = resolveCoordsByAddressOrRegion(searchStr, vol.uf || "RJ", idx);

      return {
        id: `vol-${vol.id || idx}`,
        type: "VOLUNTEER" as MapPointType,
        name: vol.nome || "Voluntário da Campanha",
        latitude: resolved.lat,
        longitude: resolved.lon,
        address: vol.comiteNome && vol.comiteNome !== "Não vinculado"
          ? `Alocado em ${vol.comiteNome}`
          : `Atuação em ${vol.regiaoDesignada || vol.bairro || "Campo"}`,
        city: vol.cidade || vol.bairro || resolved.city,
        state: vol.uf || resolved.state,
        status: "ativo",
        detailUrl: "/voluntarios",
        responsible: vol.regiaoDesignada,
      };
    });

    return [...locPoints, ...volPoints];
  }, [locations, voluntarios]);

  // Contadores calculados dinamicamente dos pontos carregados
  const counts = useMemo(() => {
    const committeeCount = points.filter((p) => p.type === "COMMITTEE").length;
    const volunteerCount = points.filter((p) => p.type === "VOLUNTEER").length;
    const hqCount = points.filter((p) => p.type === "HEADQUARTERS").length;
    const supportCount = points.filter((p) => p.type === "SUPPORT_POINT").length;
    return {
      committee: committeeCount,
      volunteer: volunteerCount,
      hq: hqCount,
      support: supportCount,
      total: points.length,
    };
  }, [points]);

  // Define ponto selecionado inicial
  useEffect(() => {
    if (points.length > 0 && !selectedPointId) {
      setSelectedPointId(points[0].id);
    }
  }, [points, selectedPointId]);

  const selectedPoint = useMemo(() => {
    return points.find((p) => p.id === selectedPointId) || points[0] || null;
  }, [points, selectedPointId]);

  // Escuta mensagens enviadas pelo mapa interativo no Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SELECT_POINT") {
        setSelectedPointId(event.data.id);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // HTML e Script do Mapa Interativo com Geocodificação Exata por Endereço
  const iframeHtml = useMemo(() => {
    const pointsJson = JSON.stringify(points);

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
    .leaflet-control-zoom { display: none !important; }
    
    .marker-pin-container { position: relative; width: 44px; height: 44px; display: flex; items-center: center; justify-content: center; }
    .halo-pulse {
      position: absolute; width: 48px; height: 48px; border-radius: 50%;
      background: rgba(18, 100, 243, 0.25);
      box-shadow: 0 0 0 6px rgba(18, 100, 243, 0.15);
      animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.85); opacity: 0.9; }
      50% { transform: scale(1.25); opacity: 0.4; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    .custom-svg-pin { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.18)); cursor: pointer; transition: transform .2s ease; }
    .custom-svg-pin:hover { transform: scale(1.15); }
    .selected-pin { transform: scale(1.22); z-index: 999 !important; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <script>
    const POINTS = ${pointsJson};
    let map, markersMap = {};

    function getPinColor(type) {
      if (type === 'COMMITTEE')    return '#1264F3';
      if (type === 'VOLUNTEER')    return '#00A978';
      if (type === 'HEADQUARTERS') return '#7928F5';
      if (type === 'SUPPORT_POINT')return '#F59E0B';
      return '#1264F3';
    }

    function getPinIconPath(type) {
      if (type === 'VOLUNTEER') {
        return '<path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>';
      }
      if (type === 'HEADQUARTERS') {
        return '<path d="M12 2L2 7v2h20V7L12 2zm-8 9v8h3v-8H4zm6 0v8h4v-8h-4zm7 0v8h3v-8h-3z" fill="white"/>';
      }
      if (type === 'SUPPORT_POINT') {
        return '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="white"/>';
      }
      return '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h8v6zm0-8h-2V9h2v2z" fill="white"/>';
    }

    function createMarkerIcon(type, isSelected) {
      const color = getPinColor(type);
      const iconPath = getPinIconPath(type);
      const halo = isSelected ? '<div class="halo-pulse"></div>' : '';

      const svg = \`
        <div class="marker-pin-container">
          \${halo}
          <svg class="custom-svg-pin \${isSelected ? 'selected-pin' : ''}" width="36" height="44" viewBox="0 0 36 44" fill="none">
            <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="\${color}"/>
            <g transform="translate(6, 6) scale(0.95)">
              \${iconPath}
            </g>
          </svg>
        </div>
      \`;

      return L.divIcon({
        html: svg,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        className: ''
      });
    }

    function initMap() {
      const initialCenter = POINTS.length > 0 ? [POINTS[0].latitude, POINTS[0].longitude] : [-15.7801, -47.9292];
      const initialZoom = POINTS.length > 0 ? 12 : 4;
      map = L.map('map', { zoomControl: false }).setView(initialCenter, initialZoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19
      }).addTo(map);

      const bounds = [];

      POINTS.forEach((p, idx) => {
        const isSelected = idx === 0;
        const icon = createMarkerIcon(p.type, isSelected);
        const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(map);
        
        marker.on('click', () => {
          window.parent.postMessage({ type: 'SELECT_POINT', id: p.id }, '*');
          selectMarker(p.id);
        });

        markersMap[p.id] = { marker, point: p, lat: p.latitude, lon: p.longitude };
        bounds.push([p.latitude, p.longitude]);
      });

      if (bounds.length > 0) {
        if (bounds.length === 1) {
          map.setView(bounds[0], 14);
        } else {
          map.fitBounds(bounds, { padding: [60, 60] });
        }
      }

      // Geocodificação em segundo plano via OpenStreetMap Nominatim para sincronização exata por endereço
      POINTS.forEach(async (p) => {
        if (!p.address) return;
        try {
          const cleanAddr = p.address.replace(/—\s*CEP\s*[\d-]+/gi, '').trim();
          const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(cleanAddr));
          const data = await r.json();
          if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
            const realLat = parseFloat(data[0].lat);
            const realLon = parseFloat(data[0].lon);
            if (markersMap[p.id]) {
              markersMap[p.id].marker.setLatLng([realLat, realLon]);
              markersMap[p.id].lat = realLat;
              markersMap[p.id].lon = realLon;
            }
          }
        } catch(e) {}
      });
    }

    function selectMarker(id) {
      Object.keys(markersMap).forEach((pId) => {
        const item = markersMap[pId];
        const isSel = pId === id;
        item.marker.setIcon(createMarkerIcon(item.point.type, isSel));
        if (isSel) {
          map.panTo([item.lat, item.lon], { animate: true });
        }
      });
    }

    window.addEventListener('message', (e) => {
      if (e.data && e.data.action === 'ZOOM_IN') map.zoomIn();
      if (e.data && e.data.action === 'ZOOM_OUT') map.zoomOut();
      if (e.data && e.data.action === 'SELECT_POINT_ID') selectMarker(e.data.id);
    });

    initMap();
  </script>
</body>
</html>`;
  }, [points]);

  // Controles manuais de Zoom e Tela Cheia
  const handleZoomIn = () => {
    iframeRef.current?.contentWindow?.postMessage({ action: "ZOOM_IN" }, "*");
  };

  const handleZoomOut = () => {
    iframeRef.current?.contentWindow?.postMessage({ action: "ZOOM_OUT" }, "*");
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Renderiza ícone por categoria de local
  const renderCategoryIcon = (type: MapPointType) => {
    switch (type) {
      case "VOLUNTEER":
        return <UserRound className="h-5 w-5 text-[#00A978]" strokeWidth={2.2} />;
      case "HEADQUARTERS":
        return <Landmark className="h-5 w-5 text-[#7928F5]" strokeWidth={2.2} />;
      case "SUPPORT_POINT":
        return <MapPin className="h-5 w-5 text-[#F59E0B]" strokeWidth={2.2} />;
      default:
        return <Building2 className="h-5 w-5 text-[#1264F3]" strokeWidth={2.2} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col p-6 sm:p-7 gap-5 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none p-4" : ""
      }`}
    >
      {/* ── 1. CABEÇALHO DO MAPA OPERACIONAL (Fidelidade ao Mockup) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1264F3] shadow-2xs">
            <MapPinned className="h-7 w-7 text-[#1264F3]" strokeWidth={2.2} />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#10213D] tracking-tight leading-snug">
              Mapa de comitês, voluntários e locais de campanha
            </h2>
            <p className="text-sm font-medium text-[#64748B] mt-0.5">
              Geolocalização dos comitês, sedes e pontos de apoio
            </p>
          </div>
        </div>

        {/* Lado Direito: Contadores e Botões */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Contador de Comitês */}
          <div className="bg-[#EAF2FF] text-[#1264F3] border border-[#1264F3]/30 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
            <span>{counts.committee} Comitês</span>
          </div>

          {/* Contador de Voluntários */}
          <div className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
            <span>{counts.volunteer} Voluntários</span>
          </div>

          {/* Botão Mapa Interativo */}
          <button
            type="button"
            className="h-11 px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs sm:text-sm transition shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Map className="h-4 w-4 text-[#10213D]" strokeWidth={2} />
            <span>Mapa interativo</span>
          </button>

          {/* Botão Abrir no Mapa */}
          {selectedPoint && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedPoint.address || selectedPoint.name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#10213D] font-bold text-xs sm:text-sm transition shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-[#10213D]" strokeWidth={2} />
              <span>Abrir no mapa</span>
            </a>
          )}
        </div>
      </div>

      {/* ── 2. ÁREA INTERATIVA DO MAPA COM OVERLAYS E PAINEL ── */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] shadow-inner">
        
        {/* Iframe Leaflet Interativo */}
        <iframe
          ref={iframeRef}
          title="Mapa de Comitês e Voluntários"
          srcDoc={iframeHtml}
          className="w-full h-full border-none"
        />

        {/* ── PAINEL SOBREPOSTO DO LOCAL SELECIONADO (CANTO SUPERIOR ESQUERDO) ── */}
        {selectedPoint && (
          <div className="absolute top-4 left-4 z-[500] w-80 max-w-[calc(100%-2rem)] bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-5 flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1264F3] shadow-2xs">
                {renderCategoryIcon(selectedPoint.type)}
              </div>

              <div className="flex flex-col min-w-0">
                <h4 className="text-base font-extrabold text-[#10213D] truncate leading-tight">
                  {selectedPoint.name}
                </h4>
                <p className="text-xs font-semibold text-[#64748B] mt-0.5 truncate">
                  {selectedPoint.address || "Endereço registrado no sistema"}
                </p>
                <p className="text-xs text-[#64748B]">
                  {selectedPoint.city} - {selectedPoint.state}
                </p>
              </div>
            </div>

            {/* Badge de Status */}
            <div>
              <span className="bg-[#E8F7F1] text-[#008B63] border border-[#00A978]/30 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider inline-block">
                {selectedPoint.status || "Ativo"}
              </span>
            </div>

            {/* Botão Ver Detalhes */}
            <a
              href={selectedPoint.detailUrl || "/locais"}
              className="w-full h-10 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EAF2FF] hover:border-[#1264F3] text-[#1264F3] font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Ver detalhes</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </a>
          </div>
        )}

        {/* ── CONTROLES MANUAIS DO MAPA (LATERAL DIREITA) ── */}
        <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Aumentar Zoom"
            title="Aumentar Zoom"
            className="h-11 w-11 bg-white border border-[#E2E8F0] rounded-xl shadow-md flex items-center justify-center text-[#10213D] hover:bg-[#F8FAFC] transition cursor-pointer"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Diminuir Zoom"
            title="Diminuir Zoom"
            className="h-11 w-11 bg-white border border-[#E2E8F0] rounded-xl shadow-md flex items-center justify-center text-[#10213D] hover:bg-[#F8FAFC] transition cursor-pointer"
          >
            <Minus className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label="Alternar Tela Cheia"
            title="Alternar Tela Cheia"
            className="h-11 w-11 bg-white border border-[#E2E8F0] rounded-xl shadow-md flex items-center justify-center text-[#10213D] hover:bg-[#F8FAFC] transition cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" strokeWidth={2.2} />
            ) : (
              <Maximize2 className="h-5 w-5" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      {/* ── 3. RODAPÉ DE LEGENDA E STATUS DINÂMICO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-[#10213D] border-t border-[#E2E8F0] pt-3">
        <div className="flex flex-wrap items-center gap-5">
          {/* Comitê */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#1264F3] shrink-0" />
            <span>Comitê ({counts.committee})</span>
          </div>

          {/* Voluntários */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#00A978] shrink-0" />
            <span>Voluntários ({counts.volunteer})</span>
          </div>

          {/* Sede */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#7928F5] shrink-0" />
            <span>Sede ({counts.hq})</span>
          </div>

          {/* Ponto de Apoio */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#F59E0B] shrink-0" />
            <span>Ponto de apoio ({counts.support})</span>
          </div>
        </div>

        {/* Lado Direito da Legenda */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium self-start sm:self-center">
          <Info className="h-4 w-4 text-[#64748B]" strokeWidth={2} />
          <span>Dados carregados pelo sistema em tempo real</span>
        </div>
      </div>
    </div>
  );
}

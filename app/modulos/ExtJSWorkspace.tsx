"use client";

import { useEffect, useState, useTransition } from "react";
import { useDashboard } from "@/contexts/DashboardProvider";
import { logout } from "@/app/actions/auth";

// Import modules from CoreModules
import { DashboardPanel } from "@/CoreModules/Dashboard";
import { CampaignsPanel } from "@/CoreModules/Campaigns";
import { UsersPanel } from "@/CoreModules/Users";
import { PartnersPanel } from "@/CoreModules/Partners";
import { LocationsPanel } from "@/CoreModules/Locations";
import { RegionsPanel } from "@/CoreModules/Regions";
import { ReportsPanel } from "@/CoreModules/Reports";
import { TrePanel } from "@/CoreModules/Tre";
import { PermissionsPanel } from "@/CoreModules/Permissions";
import { ProfilePanel } from "@/CoreModules/Profile";

// Import dashboard components for ExtJS portal home
import { CampaignWorkflow } from "@/components/dashboard/CampaignWorkflow";
import { CAMPAIGN_TYPE_LABELS } from "@/lib/domain/constants";
import Link from "next/link";

type ExtJSWorkspaceProps = {
  userName: string;
  userEmail: string;
};

type TabItem = {
  id: string;
  title: string;
  icon: string;
  closable: boolean;
};

type ProfileSettings = {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  theme: string;
  mode: string;
};

// Theme styles configuration mapping
const themeStyles: Record<
  string,
  { headerBg: string; headerBorder: string; activeTabBorder: string; textHighlight: string; sidebarActiveNode: string }
> = {
  triton: {
    headerBg: "from-[#157fcc] to-[#1268a7] dark:from-[#1b2f42] dark:to-[#111e2a]",
    headerBorder: "border-[#115b94] dark:border-[#1e3d59]",
    activeTabBorder: "border-t-[#157fcc] dark:border-t-blue-500",
    textHighlight: "text-[#157fcc] dark:text-blue-400",
    sidebarActiveNode: "bg-[#e2eff8] dark:bg-[#1e2f42] text-[#157fcc] dark:text-blue-400 border-l-[#157fcc] dark:border-l-blue-400",
  },
  neptune: {
    headerBg: "from-[#0f766e] to-[#0d5c56] dark:from-[#1a3835] dark:to-[#102220]",
    headerBorder: "border-[#0b4d48] dark:border-[#122826]",
    activeTabBorder: "border-t-[#0f766e] dark:border-t-teal-500",
    textHighlight: "text-[#0f766e] dark:text-teal-400",
    sidebarActiveNode: "bg-[#e2f2f1] dark:bg-[#152e2c] text-[#0f766e] dark:text-teal-400 border-l-[#0f766e] dark:border-l-teal-400",
  },
  slate: {
    headerBg: "from-[#475569] to-[#334155] dark:from-[#242d38] dark:to-[#171d24]",
    headerBorder: "border-[#1e293b] dark:border-[#212933]",
    activeTabBorder: "border-t-[#475569] dark:border-t-slate-500",
    textHighlight: "text-[#475569] dark:text-slate-400",
    sidebarActiveNode: "bg-[#f1f5f9] dark:bg-[#252f3d] text-[#334155] dark:text-slate-450 border-l-[#475569] dark:border-l-slate-450",
  },
};

export function ExtJSWorkspace({ userName, userEmail }: ExtJSWorkspaceProps) {
  const { campaigns, can, currentRole } = useDashboard();
  const [isPending, startTransition] = useTransition();

  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    displayName: userName,
    fullName: "Administrador do Sistema",
    email: userEmail,
    phone: "(11) 99999-9999",
    theme: "triton",
    mode: "light",
  });

  // Tab Panel State — 'home' e 'dashboard' são fixas e não podem ser fechadas
  const canViewDashboard = can("dashboard:visualizar");

  const [openTabs, setOpenTabs] = useState<TabItem[]>(() => {
    const tabs: TabItem[] = [
      {
        id: "home",
        title: "Área de Trabalho",
        icon: "💻",
        closable: false,
      },
    ];

    if (canViewDashboard) {
      tabs.push({
        id: "dashboard",
        title: "Dashboard",
        icon: "📊",
        closable: false,
      });
    }

    return tabs;
  });

  const [activeTab, setActiveTab] = useState<string>(
    canViewDashboard ? "dashboard" : "home",
  );

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sidebar navigation group collapses
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    operacao: false,
    cadastros: false,
    inteligencia: false,
    configuracao: false,
  });

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Clock state
  const [currentTime, setCurrentTime] = useState("");

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate Carousel Slides
  useEffect(() => {
    if (activeTab === "home") {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 3);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  // Load profile settings from localStorage on mount and apply mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_profile_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfileSettings((prev) => ({ ...prev, ...parsed }));

          // Apply dark mode class
          if (parsed.mode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        } catch (e) {
          console.error("Erro ao parsear preferências de perfil", e);
        }
      }
    }
  }, []);

  // Parse initial tab from URL parameter if present
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");

    if (!tabParam || tabParam === "home") {
      return;
    }

    if (tabParam === "dashboard" && !can("dashboard:visualizar")) {
      return;
    }

    handleOpenTab(tabParam);
  }, []);

  const handleUpdateProfile = (newSettings: ProfileSettings) => {
    setProfileSettings(newSettings);
    localStorage.setItem("user_profile_settings", JSON.stringify(newSettings));

    // Apply visual mode class
    if (newSettings.mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const menuGroups = [
    {
      id: "operacao",
      title: "Operações",
      icon: "⚙️",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "📊", permission: "dashboard:visualizar" },
        { id: "campanhas", label: "Campanhas", icon: "📣", permission: "campanhas:gerenciar" },
      ],
    },
    {
      id: "cadastros",
      title: "Cadastros Gerais",
      icon: "📁",
      items: [
        { id: "usuarios", label: "Usuários", icon: "👤", permission: "usuarios:gerenciar" },
        { id: "parceiros", label: "Parceiros", icon: "🤝", permission: "parceiros:gerenciar" },
        { id: "locais", label: "Locais (Comitê)", icon: "📍", permission: "locais:gerenciar" },
        { id: "regioes", label: "Regiões", icon: "🗺", permission: "regioes:gerenciar" },
      ],
    },
    {
      id: "inteligencia",
      title: "Inteligência",
      icon: "📈",
      items: [
        { id: "relatorios", label: "Relatórios", icon: "📊", permission: "relatorios:visualizar" },
        { id: "tre", label: "Consulta TRE", icon: "⚖", permission: "tre:consultar" },
      ],
    },
    {
      id: "configuracao",
      title: "Configurações",
      icon: "🛠️",
      items: [
        { id: "perfil", label: "Meu Perfil", icon: "👤", permission: "" },
        { id: "permissoes", label: "Permissões", icon: "🔐", permission: "permissoes:gerenciar" },
      ],
    },
  ];

  const panelDefinitions: Record<string, { title: string; icon: string; component: React.ReactNode }> = {
    dashboard: {
      title: "Dashboard",
      icon: "📊",
      component: can("dashboard:visualizar")
        ? <DashboardPanel />
        : <div>Acesso negado</div>
    },
    campanhas: {
      title: "Gestão de Campanhas", icon: "📣", component: can("campanhas:gerenciar") ? <CampaignsPanel /> : <div>Acesso negado</div>
    },
    usuarios: {
      title: "Equipe Operacional", icon: "👤", component: can("usuarios:gerenciar") ? <UsersPanel /> : <div>Acesso negado</div>
    },
    parceiros: {
      title: "Gestão de Parceiros", icon: "🤝", component: can("parceiros:gerenciar") ? <PartnersPanel /> : <div>Acesso negado</div>
    },
    locais: {
      title: "Locais e Comitês", icon: "📍", component: can("locais:gerenciar") ? <LocationsPanel /> : <div>Acesso negado</div>
    },
    regioes: {
      title: "Regiões Eleitorais", icon: "🗺", component: can("regioes:gerenciar") ? <RegionsPanel /> : <div>Acesso negado</div>
    },
    relatorios: {
      title: "Relatórios e Estatísticas",
      icon: "📊",
      component: can("relatorios:visualizar") ? (
        <ReportsPanel
          onOpenTab={(id, title, icon, component) => {
            setOpenTabs((prev) => {
              if (prev.find((t) => t.id === id)) return prev;
              return [...prev, { id, title, icon, closable: true }];
            });
            // Store the dynamic component
            setPanelExtras((prev) => ({ ...prev, [id]: { title, icon, component } }));
            setActiveTab(id);
          }}
        />
      ) : (
        <div>Acesso negado</div>
      ),
    },
    tre: {
      title: "Consulta Oficial TRE", icon: "⚖",
      component: can("tre:consultar") ? <TrePanel /> : <div>Acesso negado</div>
    },
    permissoes: {
      title: "Matriz de Permissões", icon: "🔐",
      component: can("permissoes:gerenciar") ? <PermissionsPanel /> : <div>Acesso negado</div>
    },
    perfil: {
      title: "Configurações de Perfil",
      icon: "👤",
      component: <ProfilePanel settings={profileSettings} onUpdate={handleUpdateProfile} />,
    },
  };

  // Extra dynamic panels (e.g. individual report tabs)
  const [panelExtras, setPanelExtras] = useState<Record<string, { title: string; icon: string; component: React.ReactNode }>>({});
  const allPanels = { ...panelDefinitions, ...panelExtras };

  const handleOpenTab = (id: string) => {
    if (id === "dashboard" && !can("dashboard:visualizar")) {
      return;
    }
    const tabDef = allPanels[id];
    if (!tabDef) return;

    // Verify permission
    const menuItem = menuGroups
      .flatMap((g) => g.items)
      .find((item) => item.id === id);
    if (menuItem && menuItem.permission && !can(menuItem.permission)) {
      alert("Acesso Negado: Você não possui permissão para acessar este módulo.");
      return;
    }

    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) return prev;
      return [...prev, { id, title: tabDef.title, icon: tabDef.icon, closable: true }];
    });
    setActiveTab(id);

    // Update query param
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (id === "home" || id === "dashboard") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", id);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === "home" || id === "dashboard") return;

    const index = openTabs.findIndex((t) => t.id === id);
    const updatedTabs = openTabs.filter((t) => t.id !== id);
    setOpenTabs(updatedTabs);

    if (activeTab === id) {
      const nextActive = updatedTabs[index - 1]?.id || updatedTabs[0]?.id || "home";
      setActiveTab(nextActive);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (nextActive === "home") {
          url.searchParams.delete("tab");
        } else {
          url.searchParams.set("tab", nextActive);
        }
        window.history.pushState({}, "", url.toString());
      }
    }
  };

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (id === "home" || id === "dashboard") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", id);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "em andamento");
  const themeConfig = themeStyles[profileSettings.theme] || themeStyles.triton;

  // Mock Carousel news content
  const carouselSlides = [
    {
      title: "Urnas Eletrônicas 2026: Segurança e Isolamento Absoluto",
      description: "As urnas eletrônicas brasileiras operam sem qualquer conexão à internet, Wi-Fi ou Bluetooth. A ausência de conexões de rede inviabiliza invasões ou interferências cibernéticas externas. Toda a computação dos votos é protegida por criptografias certificadas e mais de 30 camadas redundantes de segurança.",
      icon: "🔒",
      badge: "Segurança de Votação",
    },
    {
      title: "Calendário Eleitoral 2026: Programe os Prazos Críticos",
      description: "Fique atento ao cronograma oficial do TSE para 2026: as eleições gerais acontecem dia 04 de Outubro (1º turno) e 25 de Outubro (2º turno). A janela de transferência e emissão de novos títulos se encerra em 06 de Maio, e a propaganda partidária de rua começa em 16 de Agosto.",
      icon: "📅",
      badge: "Eleições 2026",
    },
    {
      title: "Auditoria de Códigos-Fonte e Teste Público",
      description: "O código-fonte das urnas e sistemas eleitorais fica disponível para auditoria pelas entidades fiscalizadoras muito antes das eleições. Além disso, o Teste Público de Segurança (TPS) abre o sistema para que investigadores externos tentem forçar falhas, ajudando o TSE a blindar os códigos continuamente.",
      icon: "🛡️",
      badge: "Transparência",
    },
  ];

  // Additional mock news articles
  const mockNews = [
    {
      id: 1,
      date: "14 Jun 2026 · 09:00",
      category: "Segurança",
      title: "TSE conclui a homologação técnica dos novos modelos de Urna Eletrônica UE2026",
      summary: "A nova versão traz hardware criptográfico atualizado e processadores mais rápidos, mantendo o consagrado isolamento total de redes do modelo clássico brasileiro.",
    },
    {
      id: 2,
      date: "11 Jun 2026 · 14:30",
      category: "Calendário",
      title: "Prazo para convenções partidárias tem início em 20 de julho de 2026",
      summary: "Legendas terão até o dia 5 de agosto para oficializar candidaturas a deputados federais, senadores e governadores nas coligações estaduais.",
    },
    {
      id: 3,
      date: "08 Jun 2026 · 10:15",
      category: "Fiscalização",
      title: "Votação paralela no dia das eleições: sorteio de urnas para auditoria em tempo real",
      summary: "Entidades auditoras validaram o protocolo de testes do pleito de 2026. Urnas eletrônicas em funcionamento real serão testadas simultaneamente com cédulas físicas de controle.",
    },
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#eef2f7] dark:bg-[#0a0f14] font-sans text-xs text-[#333] dark:text-[#ccd3db] select-none antialiased">

      {/* ---------------- NORTH REGION: HEADER ---------------- */}
      <header className={`flex h-12 w-full shrink-0 items-center justify-between border-b ${themeConfig.headerBorder} bg-gradient-to-r ${themeConfig.headerBg} px-4 text-white shadow-md`}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 dark:bg-white/5 font-bold text-white shadow-inner">
            🧩
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase">CampanhaPro Workspace</h1>
            <p className="text-[9px] font-medium opacity-80 uppercase tracking-widest text-[#d8e8f5] dark:text-blue-300">
              Sencha ExtJS Modern Portal v7.8
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 border-r border-white/20 dark:border-white/10 pr-4 text-right sm:flex">
            <span className="text-[10px] font-semibold text-white">
              {profileSettings.displayName}
            </span>
            <span className="rounded bg-black/20 dark:bg-black/35 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-200 dark:text-blue-400">
              {currentRole?.name ?? "Membro"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {can('dashboard:visualizar') && (
              <a
                href="/modulos"
                className="flex h-8 items-center gap-1.5 rounded border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 px-3 font-semibold text-white transition hover:bg-white/25 dark:hover:bg-white/15 active:scale-95 text-[10px] uppercase tracking-wide"
              >
                📊 Dashboard
              </a>
            )}
            <button
              onClick={() => {
                if (confirm("Deseja sair do sistema?")) {
                  startTransition(async () => {
                    await logout();
                  });
                }
              }}
              disabled={isPending}
              className="flex h-8 items-center justify-center rounded border border-red-700 bg-red-600 dark:bg-red-700 dark:border-red-800 px-3 font-semibold text-white transition hover:bg-red-700 dark:hover:bg-red-800 active:scale-95 disabled:opacity-50 text-[10px] uppercase tracking-wide"
            >
              {isPending ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER (WEST & CENTER) */}
      <div className="flex flex-1 w-full overflow-hidden">

        {/* ---------------- WEST REGION: NAVIGATION TREE ---------------- */}
        <aside
          className={`flex shrink-0 flex-col border-r border-[#c0c7d0] dark:border-[#2b3e51] bg-[#f5f5f5] dark:bg-[#121c26] transition-all duration-300 ${isSidebarCollapsed ? "w-7" : "w-60"
            }`}
        >
          {isSidebarCollapsed ? (
            // Collapsed narrow vertical bar
            <div className="flex flex-1 flex-col items-center py-4 gap-4 bg-[#f0f0f0] dark:bg-[#0f1720]">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="flex h-6 w-5 items-center justify-center border border-[#b0b7c0] dark:border-[#2b3e51] bg-white dark:bg-[#1a2836] rounded shadow-sm text-[#157fcc] dark:text-blue-400 hover:bg-[#e6eff8] dark:hover:bg-[#25394f] transition-colors"
                title="Expandir Painel"
              >
                ▶
              </button>
              <div className="write-vertical text-[#555] dark:text-zinc-500 font-bold uppercase tracking-widest text-[9px] select-none pointer-events-none origin-center rotate-90 whitespace-nowrap mt-12">
                Navegação de Módulos
              </div>
            </div>
          ) : (
            // Expanded Sidebar Tree
            <>
              {/* Sidebar Header */}
              <div className="flex h-8 items-center justify-between border-b border-[#c0c7d0] dark:border-[#2b3e51] bg-[#e6eff8] dark:bg-[#172534] px-3 font-bold text-[#154f85] dark:text-blue-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📂</span>
                  <span>MÓDULOS DO SISTEMA</span>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="flex h-5 w-5 items-center justify-center border border-[#b0b7c0] dark:border-[#2b3e51] bg-white dark:bg-[#1a2836] rounded shadow-sm text-[#157fcc] dark:text-blue-400 hover:bg-[#e6eff8] dark:hover:bg-[#25394f]"
                  title="Recolher Painel"
                >
                  ◀
                </button>
              </div>

              {/* Tree Accordion / List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                {menuGroups.map((group) => {
                  // Filter items by permission
                  const visibleItems = group.items.filter(
                    (item) => !item.permission || can(item.permission)
                  );
                  if (visibleItems.length === 0) return null;

                  const isCollapsed = collapsedGroups[group.id];

                  return (
                    <div
                      key={group.id}
                      className="border border-[#d0d6de] dark:border-[#2b3e51] bg-white dark:bg-[#16222f] rounded overflow-hidden shadow-xs"
                    >
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="flex w-full h-7 items-center justify-between bg-gradient-to-b from-[#f9fbfd] to-[#eaeef3] dark:from-[#1e2d3d] dark:to-[#16222f] px-2 font-bold text-[#3a4f66] dark:text-zinc-300 hover:from-[#eaeef3] hover:to-[#dfe5eb] dark:hover:from-[#253549] dark:hover:to-[#1f2d3d]"
                      >
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span>{group.icon}</span>
                          <span>{group.title}</span>
                        </div>
                        <span className="text-[8px] font-mono text-[#8a99a8]">
                          {isCollapsed ? "＋" : "－"}
                        </span>
                      </button>

                      {/* Group Items */}
                      {!isCollapsed && (
                        <ul className="divide-y divide-[#f2f4f6] dark:divide-[#1f2d3d] p-0.5">
                          {visibleItems.map((item) => {
                            const isTabActive = activeTab === item.id;
                            return (
                              <li key={item.id}>
                                <button
                                  onClick={() => handleOpenTab(item.id)}
                                  className={`flex w-full h-7 items-center gap-2 px-3 transition-colors text-left rounded-sm font-medium ${isTabActive
                                    ? themeConfig.sidebarActiveNode
                                    : "text-[#555] dark:text-zinc-400 hover:bg-[#f0f4f8] dark:hover:bg-[#1a2533] hover:text-[#111] dark:hover:text-zinc-200"
                                    }`}
                                >
                                  <span className="text-xs">{item.icon}</span>
                                  <span>{item.label}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {/* ---------------- CENTER REGION: TAB PANEL ---------------- */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#eef2f7] dark:bg-[#0a0f14] p-2">

          {/* Tab Strip */}
          <div className="flex w-full border-b border-[#c0c7d0] dark:border-[#2b3e51] px-1 flex-wrap gap-0.5 items-end h-8 shrink-0">
            {openTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`group flex h-7 items-center gap-2 px-3 border-t rounded-t cursor-pointer transition-all ${isActive
                    ? `bg-white dark:bg-zinc-950 border-t-2 ${themeConfig.activeTabBorder} border-x border-x-[#c0c7d0] dark:border-x-[#2b3e51] font-bold ${themeConfig.textHighlight} z-10 -mb-[1px]`
                    : "bg-[#e1e5eb] dark:bg-[#131b24] border-t border-t-[#c8cfd6] dark:border-t-[#2b3e51] border-x border-x-[#c8cfd6] dark:border-x-[#2b3e51] text-[#555] dark:text-zinc-400 hover:bg-[#f0f2f5] dark:hover:bg-[#1a2530] hover:text-[#111] dark:hover:text-zinc-200 -mb-[1px]"
                    }`}
                  style={{ minWidth: "100px", maxWidth: "200px" }}
                >
                  <span className="text-xs shrink-0">{tab.icon}</span>
                  <span className="truncate text-[10px] select-none flex-1">
                    {tab.title}
                  </span>
                  {tab.closable && (
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] text-[#9a9fa6] hover:bg-[#e0565b] hover:text-white"
                      title="Fechar Aba"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Tab Body Panel */}
          <div className="flex-1 w-full overflow-hidden border-x border-b border-[#c0c7d0] dark:border-[#2b3e51] bg-white dark:bg-zinc-950 shadow-sm flex flex-col">

            {/* Inner Content Area */}
            <div className="flex-1 overflow-auto p-4 bg-white dark:bg-zinc-950">
              {activeTab === "home" ? (
                // ExtJS Portal Dashboard Home Tab
                <div className="flex flex-col gap-5 h-full">

                  {/* Grid Portal Layout */}
                  <div className="grid gap-4 md:grid-cols-3">

                    {/* Portal Column 1 (News Area with Carousel Banner) */}
                    <div className="md:col-span-2 flex flex-col gap-4">

                      {/* Carousel Container */}
                      <div className="border border-[#c0c7d0] dark:border-zinc-800 rounded bg-[#fafafa] dark:bg-zinc-900 shadow-xs overflow-hidden flex flex-col h-64">
                        <div className="bg-[#e9eef4] dark:bg-[#1a2d3e] border-b border-[#c0c7d0] dark:border-[#2b3e51] px-3 py-1.5 font-bold text-[#2c3e50] dark:text-zinc-300 text-[10px] uppercase flex justify-between items-center">
                          <span>📢 Destaques Eleitorais e Urnas Eletrônicas</span>
                          <span className="bg-[#157fcc] dark:bg-blue-600 text-white font-bold rounded-sm px-1.5 py-0.5 text-[8px]">
                            {carouselSlides[currentSlide].badge}
                          </span>
                        </div>

                        {/* Slide content area */}
                        <div className="flex-1 p-5 flex items-start gap-4 transition-all duration-500 relative">
                          <div className="text-3xl p-3 bg-white dark:bg-zinc-950 rounded border border-[#cbd5e1] dark:border-zinc-850 shadow-xs shrink-0 select-none">
                            {carouselSlides[currentSlide].icon}
                          </div>
                          <div className="flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-[#154f85] dark:text-blue-400">
                              {carouselSlides[currentSlide].title}
                            </h3>
                            <p className="text-[11px] text-[#555] dark:text-zinc-350 leading-relaxed">
                              {carouselSlides[currentSlide].description}
                            </p>
                          </div>
                        </div>

                        {/* Slide controls */}
                        <div className="h-8 border-t border-[#cbd5e1] dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4">
                          <div className="flex gap-1">
                            {carouselSlides.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 w-2 rounded-full transition-all ${currentSlide === idx ? "bg-[#157fcc] w-4" : "bg-[#cbd5e1] dark:bg-zinc-700 hover:bg-[#a1a1a1]"
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                              className="px-2 py-0.5 text-[9px] font-bold border border-[#cbd5e1] dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded hover:bg-[#f1f5f9] dark:hover:bg-zinc-850"
                            >
                              Anterior
                            </button>
                            <button
                              onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                              className="px-2 py-0.5 text-[9px] font-bold border border-[#cbd5e1] dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded hover:bg-[#f1f5f9] dark:hover:bg-zinc-850"
                            >
                              Próximo
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mock News Grid */}
                      <div className="border border-[#c0c7d0] dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 shadow-xs flex flex-col">
                        <div className="bg-[#e9eef4] dark:bg-[#1a2d3e] border-b border-[#c0c7d0] dark:border-[#2b3e51] px-3 py-1.5 font-bold text-[#2c3e50] dark:text-zinc-300 text-[10px] uppercase">
                          📰 Central de Notícias e Informativos
                        </div>
                        <div className="p-4 flex flex-col gap-4 divide-y divide-[#eaeded] dark:divide-zinc-850">
                          {mockNews.map((news) => (
                            <div key={news.id} className="pt-4 first:pt-0 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-[#95a5a6]">
                                  {news.date}
                                </span>
                                <span className="bg-[#eef2f7] dark:bg-[#1a2c3a] text-[#154f85] dark:text-blue-300 font-bold px-1.5 py-0.5 rounded text-[8px]">
                                  {news.category}
                                </span>
                              </div>
                              <h4 className="text-[11px] font-bold text-[#2c3e50] dark:text-zinc-200 hover:underline cursor-pointer">
                                {news.title}
                              </h4>
                              <p className="text-[10px] text-[#7f8c8d] dark:text-zinc-400 leading-relaxed">
                                {news.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Portal Column 2 (Active execution and shortcuts - KEEP UNCHANGED) */}
                    <div className="flex flex-col gap-4">

                      {/* Active Actions */}
                      <div className="border border-[#c0c7d0] dark:border-[#2b3e51] rounded bg-[#fafafa] dark:bg-zinc-900 shadow-xs">
                        <div className="bg-[#e9eef4] dark:bg-[#1a2d3e] border-b border-[#c0c7d0] dark:border-[#2b3e51] px-3 py-1.5 font-bold text-[#2c3e50] dark:text-zinc-300 text-[10px] uppercase">
                          ⚡ Campanhas em Execução
                        </div>
                        <div className="p-3">
                          {activeCampaigns.length === 0 ? (
                            <p className="text-[11px] text-[#7f8c8d] dark:text-zinc-500 italic">
                              Nenhuma campanha ativa no momento.
                            </p>
                          ) : (
                            <ul className="divide-y divide-[#eaeded] dark:divide-zinc-850 space-y-1.5">
                              {activeCampaigns.map((c) => (
                                <li key={c.id} className="pt-1.5 first:pt-0">
                                  <p className="font-bold text-[#2c3e50] dark:text-zinc-200 truncate">{c.name}</p>
                                  <p className="text-[9px] text-[#7f8c8d] dark:text-zinc-450">
                                    Tipo: {CAMPAIGN_TYPE_LABELS[c.type]}
                                  </p>
                                  <div className="mt-1">
                                    <CampaignWorkflow status={c.status} compact />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Portal Navigation Shortcuts */}
                      <div className="border border-[#c0c7d0] dark:border-[#2b3e51] rounded bg-white dark:bg-zinc-950 shadow-xs">
                        <div className="bg-[#e9eef4] dark:bg-[#1a2d3e] border-b border-[#c0c7d0] dark:border-[#2b3e51] px-3 py-1.5 font-bold text-[#2c3e50] dark:text-zinc-300 text-[10px] uppercase">
                          🔌 Atalhos Rápidos
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                          {menuGroups
                            .flatMap((g) => g.items)
                            .filter((item) => !item.permission || can(item.permission))
                            .map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleOpenTab(item.id)}
                                className="flex flex-col items-center justify-center p-2.5 border border-[#e2e8f0] dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 hover:bg-[#f1f5f9] dark:hover:bg-zinc-900 hover:border-[#cbd5e1] dark:hover:border-zinc-700 text-[#34495e] dark:text-zinc-300 transition"
                              >
                                <span className="text-xl mb-1">{item.icon}</span>
                                <span className="text-[9px] font-bold text-center">
                                  {item.label}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              ) : (
                // Dynamic Tab Panel Content
                <div className="w-full h-full bg-white dark:bg-zinc-950">
                  {panelDefinitions[activeTab]?.component || (
                    <div className="p-4 text-[#e74c3c] font-bold">
                      Erro: Módulo não encontrado ou falha de carregamento.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ---------------- SOUTH REGION: STATUSBAR ---------------- */}
      <footer className="flex h-6 w-full shrink-0 items-center justify-between border-t border-[#c0c7d0] dark:border-[#2b3e51] bg-[#f0f0f0] dark:bg-[#111a24] px-3 text-[#555] dark:text-zinc-400 shadow-inner text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Status: Pronto</span>
        </div>

        <div className="hidden border-x border-[#c0c7d0] dark:border-[#2b3e51] px-4 sm:block">
          <span>Usuário Conectado: <strong>{profileSettings.email}</strong></span>
        </div>

        <div>
          <span>{currentTime || "Carregando..."}</span>
        </div>
      </footer>

    </div>
  );
}

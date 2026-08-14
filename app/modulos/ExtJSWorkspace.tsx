"use client";

import { useEffect, useState, useTransition } from "react";
import { useDashboard } from "@/contexts/DashboardProvider";
import { logout } from "@/app/actions/auth";

import {
  LayoutGrid,
  Megaphone,
  CalendarDays,
  Wallet,
  Users,
  Handshake,
  MapPin,
  Map,
  Landmark,
  BarChart3,
  User,
  ClipboardList,
  MessageSquareMore,
  SquareChevronLeft,
  SquareChevronRight,
  LayoutDashboard,
  Lock,
  UserCheck,
  Menu,
  X,
  FolderKanban,
  Plus,
  FileText,
} from "lucide-react";

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
import { FinanceiroPanel } from "@/CoreModules/Financeiro";
import { SurveysPanel } from "@/CoreModules/Surveys";
import { RedeSocialPanel } from "@/CoreModules/RedeSocial";
import { AutoridadesPanel } from "@/CoreModules/Autoridades";
import { AgendaPanel } from "@/CoreModules/Agenda";
import { VoluntariadoPanel } from "@/CoreModules/Voluntariado";
import { DemandasProjetosPanel } from "@/CoreModules/DemandasProjetos";
import { AcompanhamentoDemandasProjetos } from "@/CoreModules/DemandasProjetos/AcompanhamentoDemandasProjetos";

import { PushNotifier } from "@/components/notifications/PushNotifier";

type ExtJSWorkspaceProps = {
  userName: string;
  userEmail: string;
};

type TabItem = {
  id: string;
  title: string;
  iconNode: React.ReactNode;
  closable: boolean;
};

type ProfileSettings = {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  theme: string;
  mode: string;
  avatarUrl?: string;
};

type MenuItem = {
  id: string;
  label: string;
  iconNode: React.ReactNode;
  permission: string;
};

const TAB_ICONS_MAP: Record<string, React.ReactNode> = {
  dashboard: <LayoutGrid className="h-3.5 w-3.5 text-[#008B63]" strokeWidth={2} />,
  demandas: <FolderKanban className="h-3.5 w-3.5 text-[#008B63]" strokeWidth={2} />,
  novademanda: <FileText className="h-3.5 w-3.5 text-[#008B63]" strokeWidth={2} />,
  campanhas: <Megaphone className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  agenda: <CalendarDays className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  financeiro: <Wallet className="h-3.5 w-3.5 text-[#F59E0B]" strokeWidth={2} />,
  voluntarios: <Users className="h-3.5 w-3.5 text-[#008B63]" strokeWidth={2} />,
  parceiros: <Handshake className="h-3.5 w-3.5 text-[#7928F5]" strokeWidth={2} />,
  locais: <MapPin className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  regioes: <Map className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  tre: <Landmark className="h-3.5 w-3.5 text-[#008B63]" strokeWidth={2} />,
  relatorios: <BarChart3 className="h-3.5 w-3.5 text-[#7928F5]" strokeWidth={2} />,
  autoridades: <User className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  pesquisas: <ClipboardList className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  redesocial: <MessageSquareMore className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  perfil: <User className="h-3.5 w-3.5 text-[#1264F3]" strokeWidth={2} />,
  permissoes: <Lock className="h-3.5 w-3.5 text-[#7928F5]" strokeWidth={2} />,
  usuarios: <UserCheck className="h-3.5 w-3.5 text-[#008B63]" strokeWidth={2} />,
};

export function ExtJSWorkspace({ userName, userEmail }: ExtJSWorkspaceProps) {
  const { can, currentRole } = useDashboard();
  const [isPending, startTransition] = useTransition();

  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    displayName: userName || "Suporte N1",
    fullName: "Administrador do Sistema",
    email: userEmail || "suporte.n1@vertis.com.local",
    phone: "(11) 99999-9999",
    theme: "triton",
    mode: "light",
    avatarUrl: "",
  });

  // Carrega configurações salvas do usuário (foto de perfil e tema) no carregamento inicial
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_profile_settings");
      if (saved) {
        try {
          const parsed: ProfileSettings = JSON.parse(saved);
          setProfileSettings(parsed);

          if (parsed.mode === "dark") {
            document.documentElement.classList.add("dark");
          } else if (parsed.mode === "light") {
            document.documentElement.classList.remove("dark");
          } else if (parsed.mode === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.toggle("dark", prefersDark);
          }
        } catch (e) {}
      }
    }
  }, []);

  // Iniciar na aba "Demandas e Projetos" com a Tela de Acompanhamento como visão principal
  const [openTabs, setOpenTabs] = useState<TabItem[]>(() => [
    { id: "dashboard", title: "Dashboard", iconNode: TAB_ICONS_MAP["dashboard"], closable: true },
    { id: "demandas", title: "Demandas e Projetos", iconNode: TAB_ICONS_MAP["demandas"], closable: true },
  ]);

  const [activeTab, setActiveTab] = useState<string>("demandas");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showTabOverflow, setShowTabOverflow] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Relógio oficial em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `Hoje, ${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} • ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateProfile = (newSettings: ProfileSettings) => {
    setProfileSettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_profile_settings", JSON.stringify(newSettings));

      if (newSettings.mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (newSettings.mode === "light") {
        document.documentElement.classList.remove("dark");
      } else if (newSettings.mode === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", prefersDark);
      }
    }
  };

  // Grupos do Menu da Sidebar conforme especificação do campanhaPRO
  const menuGroups: Array<{ id: string; title: string; items: MenuItem[] }> = [
    {
      id: "operacao",
      title: "OPERAÇÕES",
      items: [
        { id: "dashboard", label: "Dashboard", iconNode: <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "dashboard:visualizar" },
        { id: "campanhas", label: "Campanhas", iconNode: <Megaphone className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "campanhas:gerenciar" },
        { id: "agenda", label: "Agenda do Candidato", iconNode: <CalendarDays className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "campanhas:gerenciar" },
        { id: "demandas", label: "Demandas e Projetos", iconNode: <FolderKanban className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "campanhas:gerenciar" },
        { id: "financeiro", label: "Área Financeira", iconNode: <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "financeiro:visualizar" },
      ],
    },
    {
      id: "cadastros",
      title: "CADASTROS",
      items: [
        { id: "voluntarios", label: "Voluntários", iconNode: <Users className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "usuarios:gerenciar" },
        { id: "parceiros", label: "Parceiros", iconNode: <Handshake className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "parceiros:gerenciar" },
        { id: "locais", label: "Locais (Comitê)", iconNode: <MapPin className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "locais:gerenciar" },
        { id: "regioes", label: "Regiões", iconNode: <Map className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "regioes:gerenciar" },
      ],
    },
    {
      id: "inteligencia",
      title: "INTELIGÊNCIA",
      items: [
        { id: "tre", label: "Monitor TSE", iconNode: <Landmark className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "tre:consultar" },
        { id: "relatorios", label: "Relatórios", iconNode: <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "relatorios:visualizar" },
        { id: "autoridades", label: "Contatos de Autoridades", iconNode: <User className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "tre:consultar" },
        { id: "pesquisas", label: "Pesquisas", iconNode: <ClipboardList className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "" },
      ],
    },
    {
      id: "comunicacao",
      title: "COMUNICAÇÃO",
      items: [
        { id: "redesocial", label: "Rede Social", iconNode: <MessageSquareMore className="h-[18px] w-[18px]" strokeWidth={2} />, permission: "" },
      ],
    },
  ];

  const [panelExtras, setPanelExtras] = useState<Record<string, { title: string; component: React.ReactNode }>>({});

  // Abertura dinâmica de aba conforme menu selecionado
  function handleOpenTab(id: string) {
    const tabTitle = panelDefinitions[id]?.title || panelExtras[id]?.title || id;
    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) return prev;
      return [
        ...prev,
        {
          id,
          title: tabTitle,
          iconNode: TAB_ICONS_MAP[id] || <LayoutGrid className="h-3.5 w-3.5 text-[#1264F3]" />,
          closable: true,
        },
      ];
    });
    setActiveTab(id);
    setIsMobileDrawerOpen(false);
  }

  const panelDefinitions: Record<string, { title: string; component: React.ReactNode }> = {
    dashboard: {
      title: "Dashboard",
      component: can("dashboard:visualizar") ? <DashboardPanel onNavigateToTab={handleOpenTab} /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    demandas: {
      title: "Demandas e Projetos",
      component: <DemandasProjetosPanel />
    },
    novademanda: {
      title: "Nova demanda",
      component: <DemandasProjetosPanel />
    },


    campanhas: {
      title: "Campanhas",
      component: can("campanhas:gerenciar") ? <CampaignsPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    agenda: {
      title: "Agenda do Candidato",
      component: can("campanhas:gerenciar") ? <AgendaPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    financeiro: {
      title: "Área Financeira",
      component: <FinanceiroPanel />
    },
    usuarios: {
      title: "Usuários",
      component: can("usuarios:gerenciar") ? <UsersPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    voluntarios: {
      title: "Voluntários",
      component: <VoluntariadoPanel />
    },
    parceiros: {
      title: "Parceiros",
      component: can("parceiros:gerenciar") ? <PartnersPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    locais: {
      title: "Locais (Comitê)",
      component: can("locais:gerenciar") ? <LocationsPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    regioes: {
      title: "Regiões",
      component: can("regioes:gerenciar") ? <RegionsPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    relatorios: {
      title: "Relatórios",
      component: can("relatorios:visualizar") ? (
        <ReportsPanel
          onOpenTab={(id, title, icon, component) => {
            setOpenTabs((prev) => {
              if (prev.find((t) => t.id === id)) return prev;
              return [...prev, { id, title, iconNode: TAB_ICONS_MAP[id] || <LayoutGrid className="h-3.5 w-3.5" />, closable: true }];
            });
            setPanelExtras((prev) => ({ ...prev, [id]: { title, component } }));
            setActiveTab(id);
          }}
        />
      ) : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    tre: {
      title: "Monitor TSE",
      component: <TrePanel />
    },
    autoridades: {
      title: "Contatos de Autoridades",
      component: <AutoridadesPanel />
    },
    permissoes: {
      title: "Matriz de Permissões",
      component: can("permissoes:gerenciar") ? <PermissionsPanel /> : <div className="p-6 text-red-600 font-bold">Acesso Negado</div>
    },
    perfil: {
      title: "Meu Perfil",
      component: <ProfilePanel settings={profileSettings} onUpdate={handleUpdateProfile} />
    },
    pesquisas: {
      title: "Pesquisas",
      component: <SurveysPanel />
    },
    redesocial: {
      title: "Rede Social",
      component: <RedeSocialPanel />
    },
  };

  const allPanels = { ...panelDefinitions, ...panelExtras };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const index = openTabs.findIndex((t) => t.id === id);
    const updatedTabs = openTabs.filter((t) => t.id !== id);
    setOpenTabs(updatedTabs);

    if (activeTab === id && updatedTabs.length > 0) {
      const nextActive = updatedTabs[index - 1]?.id || updatedTabs[0]?.id || "dashboard";
      setActiveTab(nextActive);
    }
  };

  const userInitials = profileSettings.displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("") || "SN";

  const renderSidebarContent = (collapsed: boolean) => (
    <>
      {/* Cabeçalho da Sidebar — Marca campanhaPRO & Logotipo Corrigido */}
      <div className="flex h-16 items-center px-4 justify-between border-b border-[#093566] shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="14" stroke="#008B63" strokeWidth="4.5" fill="none" opacity="0.9" />
                <path
                  d="M 18 4 A 14 14 0 0 1 32 18"
                  stroke="#00A978"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="18" cy="18" r="6" fill="#06284F" stroke="#00A978" strokeWidth="2" />
              </svg>
            </div>

            <span className="text-xl font-extrabold tracking-tight text-white font-sans whitespace-nowrap">
              campanha<span className="text-[#00A978] font-black">PRO</span>
            </span>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center" title="campanhaPRO">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="14" stroke="#008B63" strokeWidth="4.5" fill="none" />
              <path
                d="M 18 4 A 14 14 0 0 1 32 18"
                stroke="#00A978"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="18" cy="18" r="6" fill="#06284F" stroke="#00A978" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Botão fechar no mobile drawer */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(false)}
          className="md:hidden text-slate-300 hover:text-white p-1"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Indicador Cápsula: "TSE TEMPO REAL" */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[#093566] shrink-0">
          <div className="campaignpro-live-pill h-[34px] w-full max-w-[190px] bg-[#031E3B] border border-[#00A978]/30 rounded-full flex items-center justify-center px-3 gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00A978] animate-pulse shrink-0" />
            <span className="text-[10px] font-extrabold text-white tracking-wider uppercase">TSE TEMPO REAL</span>
          </div>
        </div>
      )}

      {/* Lista de Grupos e Itens de Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 no-scrollbar">
        {menuGroups.map((group) => (
          <div key={group.id} className="flex flex-col gap-1.5">
            {!collapsed && (
              <span className="px-2 text-[10px] font-extrabold tracking-wider text-[#64748B] uppercase">
                {group.title}
              </span>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id || (activeTab === "novademanda" && item.id === "demandas");
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-[#008B63] text-white shadow-md font-black"
                          : "text-[#94A3B8] hover:bg-[#093566] hover:text-white"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <span className="shrink-0">{item.iconNode}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Rodapé da Sidebar — Ação "Recolher menu" */}
      <div className="p-3 border-t border-[#093566] shrink-0 hidden md:block">
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#94A3B8] hover:bg-[#093566] hover:text-white transition cursor-pointer"
        >
          {collapsed ? (
            <SquareChevronRight className="h-5 w-5 text-white mx-auto" strokeWidth={2} />
          ) : (
            <>
              <SquareChevronLeft className="h-5 w-5 text-white shrink-0" strokeWidth={2} />
              <span>Recolher menu</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="campaignpro-shell flex h-screen w-screen overflow-hidden font-sans select-none antialiased bg-[#F6F8FB]">

      {/* ── 1. DESKTOP / TABLET SIDEBAR ── */}
      <aside
        className={`campaignpro-sidebar hidden md:flex shrink-0 flex-col bg-[#06284F] text-white border-r border-[#093566] shadow-xl transition-all duration-300 z-20 ${
          isSidebarCollapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        {renderSidebarContent(isSidebarCollapsed)}
      </aside>

      {/* ── 2. MOBILE DRAWER SLIDE-OVER ── */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="relative flex w-[260px] max-w-[80vw] flex-col bg-[#06284F] text-white shadow-2xl z-50">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* ── 3. ÁREA PRINCIPAL DA APLICAÇÃO RESPONSIVA ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F6F8FB]">
        
        {/* Cabeçalho Superior (Topbar) */}
        <header className="campaignpro-topbar h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Botão Hambúrguer no Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#10213D] hover:bg-slate-100 transition"
              title="Abrir Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#10213D] leading-tight">
                {allPanels[activeTab]?.title || "Nova demanda"}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate max-w-[200px] sm:max-w-none">
                Acompanhamento do cenário político e eleitoral em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <PushNotifier />

            {/* Clique no Avatar/Nome do perfil abre o menu de Perfil */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E2E8F0] hover:opacity-85 transition cursor-pointer text-left"
                title="Clique para abrir as Configurações de Perfil"
              >
                {profileSettings.avatarUrl ? (
                  <img
                    src={profileSettings.avatarUrl}
                    alt={profileSettings.displayName}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-2xs border border-[#00A978]"
                  />
                ) : (
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#06284F] text-white font-extrabold text-xs shadow-2xs border border-[#00A978]">
                    {userInitials}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#10213D] dark:text-zinc-100 flex items-center gap-1">
                    {profileSettings.displayName} <span className="text-[9px] text-[#64748B]">▼</span>
                  </span>
                  <span className="text-[9px] font-extrabold text-[#008B63] bg-[#E8F7F1] dark:bg-[#008B63]/20 px-1.5 py-0.2 rounded border border-[#00A978]/30">
                    {currentRole?.name ?? "Administrador"}
                  </span>
                </div>
              </button>

              {/* Dropdown Popover de Perfil */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 rounded-xl border border-[#E2E8F0] dark:border-zinc-800 shadow-xl py-2 z-40 text-xs flex flex-col gap-1">
                  <div className="px-3.5 py-2 border-b border-[#F1F5F9] dark:border-zinc-850 bg-[#F8FAFC] dark:bg-zinc-900 flex items-center gap-2.5">
                    {profileSettings.avatarUrl ? (
                      <img
                        src={profileSettings.avatarUrl}
                        alt={profileSettings.displayName}
                        className="h-9 w-9 rounded-full object-cover shadow-2xs border border-[#00A978] shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#06284F] text-white font-extrabold text-xs shadow-2xs border border-[#00A978] shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <p className="font-extrabold text-[#10213D] dark:text-zinc-100 truncate">{profileSettings.displayName}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-zinc-400 truncate">{profileSettings.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenTab("perfil");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#EAF2FF] text-[#10213D] font-semibold flex items-center gap-2 transition"
                  >
                    <User className="h-4 w-4 text-[#1264F3]" strokeWidth={2} />
                    <span>Meu Perfil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenTab("usuarios");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#EAF2FF] text-[#10213D] font-semibold flex items-center gap-2 transition"
                  >
                    <UserCheck className="h-4 w-4 text-[#008B63]" strokeWidth={2} />
                    <span>Usuários</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenTab("permissoes");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#EAF2FF] text-[#10213D] font-semibold flex items-center gap-2 transition"
                  >
                    <Lock className="h-4 w-4 text-[#7928F5]" strokeWidth={2} />
                    <span>Matriz de Permissões</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenTab("perfil");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#EAF2FF] text-[#10213D] font-semibold flex items-center gap-2 transition"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#F59E0B]" strokeWidth={2} />
                    <span>Configurações do Sistema</span>
                  </button>

                  <div className="border-t border-[#F1F5F9] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2 transition"
                  >
                    <span>🚪</span> <span>Sair do Sistema</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── MODAL CUSTOMIZADO DE CONFIRMAÇÃO DE SAÍDA / LOGOUT ── */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 font-extrabold text-xl">
                  🚪
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-extrabold text-[#10213D]">
                    Encerrar Sessão no campanhaPRO
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Você está prestes a sair do sistema. Suas alterações foram salvas. Deseja realmente continuar?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#F1F5F9] pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-100 text-[#10213D] text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      await logout();
                    });
                  }}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Saindo..." : "Sim, Sair do Sistema"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. SISTEMA DE ABAS ABERTAS REPLICANDO A ESPECIFICAÇÃO ── */}
        <div className="campaignpro-workspace-tabs bg-[#F6F8FB] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shrink-0 h-11 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {openTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-8 items-center gap-2 px-3 sm:px-3.5 rounded-t-lg text-xs font-semibold cursor-pointer border transition-all ${
                    isActive
                      ? "bg-white text-[#06284F] border-[#E2E8F0] border-b-white border-b-0 border-t-2 border-t-[#00A978] shadow-2xs z-10 font-bold"
                      : "bg-[#F6F8FB] text-[#64748B] border-transparent hover:bg-slate-200/50 hover:text-[#10213D]"
                  }`}
                >
                  <span className="shrink-0">{tab.iconNode || TAB_ICONS_MAP[tab.id]}</span>
                  <span className="whitespace-nowrap">{tab.title}</span>
                  {tab.closable && (
                    <button
                      type="button"
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="ml-1 text-[10px] text-slate-400 hover:text-red-600 rounded-full h-4 w-4 flex items-center justify-center hover:bg-slate-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Menu Dropdown de Abas Ocultas */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTabOverflow(!showTabOverflow)}
              className="h-7 w-7 flex items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#10213D] transition shadow-2xs cursor-pointer"
              title="Mais Abas"
            >
              ▼
            </button>

            {showTabOverflow && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-30 text-xs">
                {openTabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(t.id);
                      setShowTabOverflow(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 ${
                      activeTab === t.id ? "font-bold text-[#008B63]" : "text-[#10213D]"
                    }`}
                  >
                    <span>{t.iconNode}</span>
                    <span className="truncate">{t.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 5. CONTEÚDO DO MÓDULO ATIVO ── */}
        <main className="flex-1 overflow-y-auto bg-[#F6F8FB]">
          <div className="w-full h-full p-3 sm:p-5 lg:p-7">
            {allPanels[activeTab]?.component || (
              <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-[#E2E8F0]">
                Erro: Módulo não localizado.
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

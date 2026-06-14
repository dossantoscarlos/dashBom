"use client";

import { useState, useEffect } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { useToast } from "@/components/dashboard/Toast";
import {
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/dashboard/form-styles";

type ProfileSettings = {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  theme: string;
  mode: string;
};

type ProfilePanelProps = {
  settings: ProfileSettings;
  onUpdate: (newSettings: ProfileSettings) => void;
};

export function ProfilePanel({
  settings,
  onUpdate,
}: ProfilePanelProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<string>("dados");

  // Form states initialized from props
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [fullName, setFullName] = useState(settings.fullName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [theme, setTheme] = useState(settings.theme);
  const [mode, setMode] = useState(settings.mode);

  // Sync state with props if settings change externally
  useEffect(() => {
    setDisplayName(settings.displayName);
    setFullName(settings.fullName);
    setEmail(settings.email);
    setPhone(settings.phone);
    setTheme(settings.theme);
    setMode(settings.mode);
  }, [settings]);

  function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !fullName.trim()) {
      toast("Por favor, preencha todos os campos obrigatórios de dados pessoais.", "error");
      return;
    }
    // Merge updated personal data with existing settings and invoke onUpdate
    onUpdate({
      ...settings,
      displayName,
      fullName,
    });
  }

  function handleSaveContacts(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast("Por favor, preencha o campo de e-mail.", "error");
      return;
    }
    // Merge updated contacts with existing settings and invoke onUpdate
    onUpdate({
      ...settings,
      email,
      phone,
    });
  }

  function handleSavePref(e: React.FormEvent) {
    e.preventDefault();
    // Merge updated preferences with existing settings and invoke onUpdate
    onUpdate({
      ...settings,
      theme,
      mode,
    });
  }

  const subTabs = [
    { id: "dados", label: "Dados Pessoais", icon: "👤" },
    { id: "contatos", label: "Contatos", icon: "📞" },
    { id: "preferencias", label: "Preferências", icon: "⚙️" },
  ];

  return (
    <ModuleBlock title="Preferências de Perfil" icon="👤">
      <div className="flex flex-col gap-4 max-w-2xl h-full">
        {/* Info Box */}
        <div className="bg-[#f0f4f8] dark:bg-[#142334] border border-[#d2dbe5] dark:border-blue-900/40 rounded p-3 text-[11px] text-[#5b6a7a] dark:text-zinc-400">
          Personalize as informações do seu usuário. Cada seção abaixo é salva de forma independente clicando em seu respectivo botão de salvamento.
        </div>

        {/* Nested ExtJS-style SubTab Strip */}
        <div className="flex border-b border-[#cbd5e1] dark:border-zinc-800 gap-1 items-end h-8 shrink-0">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex h-7 items-center gap-1.5 px-3 border-t rounded-t cursor-pointer transition-all text-[10px] font-bold ${
                  isActive
                    ? "bg-white dark:bg-zinc-950 border-t-2 border-t-[#157fcc] dark:border-t-blue-500 border-x border-x-[#cbd5e1] dark:border-x-zinc-800 text-[#157fcc] dark:text-blue-400 -mb-[1px]"
                    : "bg-[#eef2f7] dark:bg-[#141e28] border-t border-t-[#cbd5e1] dark:border-t-zinc-800 border-x border-x-[#cbd5e1] dark:border-x-zinc-800 text-[#555] dark:text-zinc-400 hover:bg-[#e2e8f0] dark:hover:bg-[#1b2734] -mb-[1px]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SubTab Content Bodies */}
        <div className="border border-t-0 border-[#cbd5e1] dark:border-zinc-800 rounded-b p-4 bg-white dark:bg-zinc-950">
          {activeSubTab === "dados" && (
            <form onSubmit={handleSavePersonal} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#154f85] dark:text-blue-400 border-b border-[#f1f5f9] dark:border-zinc-800 pb-2">
                Informações de Identificação Pessoal
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-disp-name" className={labelClass}>
                    Nome de Exibição <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prof-disp-name"
                    className={inputClass}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-full-name" className={labelClass}>
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prof-full-name"
                    className={inputClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className={buttonPrimaryClass}>
                  Salvar Dados Pessoais
                </button>
              </div>
            </form>
          )}

          {activeSubTab === "contatos" && (
            <form onSubmit={handleSaveContacts} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#154f85] dark:text-blue-400 border-b border-[#f1f5f9] dark:border-zinc-800 pb-2">
                Canais de Comunicação e Contato
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-email" className={labelClass}>
                    E-mail de Acesso <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prof-email"
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-phone" className={labelClass}>
                    Telefone de Contato
                  </label>
                  <input
                    id="prof-phone"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className={buttonPrimaryClass}>
                  Salvar Contatos
                </button>
              </div>
            </form>
          )}

          {activeSubTab === "preferencias" && (
            <form onSubmit={handleSavePref} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#154f85] dark:text-blue-400 border-b border-[#f1f5f9] dark:border-zinc-800 pb-2">
                Personalização Visual e Interface
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-theme" className={labelClass}>
                    Tema do Workspace (ExtJS Palette)
                  </label>
                  <select
                    id="prof-theme"
                    className={inputClass}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="triton">Triton Classic (Blue)</option>
                    <option value="neptune">Neptune (Teal)</option>
                    <option value="slate">Slate Modern (Charcoal)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-mode" className={labelClass}>
                    Modo de Exibição
                  </label>
                  <select
                    id="prof-mode"
                    className={inputClass}
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="light">Claro (Light)</option>
                    <option value="dark">Escuro (Dark)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className={buttonPrimaryClass}>
                  Salvar Preferências
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModuleBlock>
  );
}

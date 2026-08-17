"use client";

import { useState, useEffect } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { useToast } from "@/components/dashboard/Toast";
import {
  buttonPrimaryClass,
  inputClass,
  labelClass,
} from "@/components/dashboard/form-styles";

export type ProfileSettings = {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  theme: string;
  mode: string;
  avatarUrl?: string;
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
  const [theme, setTheme] = useState(settings.theme || "triton");
  const [mode, setMode] = useState(settings.mode || "light");
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl || "");

  // Sync state with props if settings change externally
  useEffect(() => {
    setDisplayName(settings.displayName);
    setFullName(settings.fullName);
    setEmail(settings.email);
    setPhone(settings.phone);
    setTheme(settings.theme || "triton");
    setMode(settings.mode || "light");
    setAvatarUrl(settings.avatarUrl || "");
  }, [settings]);

  // Upload de Foto de Perfil via FileReader
  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("A foto selecionada deve ter no máximo 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        toast("📸 Foto de perfil selecionada! Clique em 'Salvar Dados Pessoais' para confirmar.", "success");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !fullName.trim()) {
      toast("Por favor, preencha todos os campos obrigatórios de dados pessoais.", "error");
      return;
    }

    onUpdate({
      ...settings,
      displayName,
      fullName,
      avatarUrl,
    });
    toast("✓ Dados pessoais e foto de perfil atualizados com sucesso!", "success");
  }

  function handleSaveContacts(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast("Por favor, preencha o campo de e-mail.", "error");
      return;
    }
    onUpdate({
      ...settings,
      email,
      phone,
    });
    toast("✓ Canais de contato salvos com sucesso!", "success");
  }

  function handleSavePref(e: React.FormEvent) {
    e.preventDefault();

    // Aplica a escolha de tema (Escuro / Claro / Sistema) imediatamente na raiz da página
    if (typeof window !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (mode === "light") {
        document.documentElement.classList.remove("dark");
      } else if (mode === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", prefersDark);
      }
    }

    onUpdate({
      ...settings,
      theme,
      mode,
    });
    toast(`🎨 Tema (${mode.toUpperCase()}) e paleta (${theme}) salvos com sucesso!`, "success");
  }

  const subTabs = [
    { id: "dados", label: "Dados Pessoais & Foto", icon: "👤" },
    { id: "contatos", label: "Contatos", icon: "📞" },
    { id: "preferencias", label: "Preferências de Tema", icon: "🎨" },
  ];

  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("") || "SN";

  return (
    <ModuleBlock title="Preferências de Perfil & Tema" icon="👤">
      <div className="flex flex-col gap-4 max-w-2xl h-full">
        {/* Info Box */}
        <div className="bg-[#f0f4f8] dark:bg-[#142334] border border-[#d2dbe5] dark:border-blue-900/40 rounded-xl p-3 text-xs text-[#5b6a7a] dark:text-zinc-300">
          Personalize sua foto de perfil, dados pessoais e preferência de tema (Claro, Escuro ou Sistema).
        </div>

        {/* Nested ExtJS-style SubTab Strip */}
        <div className="flex border-b border-[#cbd5e1] dark:border-zinc-800 gap-1 items-end h-9 shrink-0">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex h-8 items-center gap-1.5 px-3.5 border-t rounded-t-lg cursor-pointer transition-all text-xs font-bold ${
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
        <div className="border border-t-0 border-[#cbd5e1] dark:border-zinc-800 rounded-b-xl p-5 bg-white dark:bg-zinc-950">
          {activeSubTab === "dados" && (
            <form onSubmit={handleSavePersonal} className="flex flex-col gap-5">
              <h3 className="text-xs font-bold text-[#154f85] dark:text-blue-400 border-b border-[#f1f5f9] dark:border-zinc-800 pb-2">
                Informações de Identificação Pessoal e Foto de Perfil
              </h3>

              {/* SEÇÃO DE FOTO DE PERFIL DE USUÁRIO */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Foto de Perfil"
                      className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-blue-600 dark:border-blue-400"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#06284F] text-white font-black text-xl shadow-md border-2 border-[#00A978]">
                      {userInitials}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-0 flex-1 text-center sm:text-left">
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">
                    Foto do Perfil de Usuário
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Carregue uma foto em formato PNG, JPG ou WebP (máx. 5MB).
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition cursor-pointer shadow-2xs">
                      <span>📷 Enviar Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold text-xs hover:bg-red-200 transition"
                      >
                        ❌ Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                  Salvar Dados Pessoais & Foto
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
            <form onSubmit={handleSavePref} className="flex flex-col gap-5">
              <h3 className="text-xs font-bold text-[#154f85] dark:text-blue-400 border-b border-[#f1f5f9] dark:border-zinc-800 pb-2">
                Personalização Visual e Escolha de Tema
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-mode" className={labelClass}>
                    Modo de Exibição (Tema de Cores)
                  </label>
                  <select
                    id="prof-mode"
                    className={inputClass}
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="light">☀️ Modo Claro (Light Mode)</option>
                    <option value="dark">🌙 Modo Escuro (Dark Mode)</option>
                    <option value="system">💻 Sistema (Automático do Navegador)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-theme" className={labelClass}>
                    Paleta de Cores do Workspace
                  </label>
                  <select
                    id="prof-theme"
                    className={inputClass}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="triton">🔵 Triton Classic (Azul Marinho / Navy)</option>
                    <option value="neptune">🟢 Neptune (Verde Campanha / Teal)</option>
                    <option value="slate">⚫ Slate Modern (Cinza Escuro / Charcoal)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex flex-col gap-1">
                <span className="font-extrabold flex items-center gap-1">
                  💡 Aplicador de Tema Ativo
                </span>
                <span>
                  Ao salvar, o modo selecionado (Claro ou Escuro) é aplicado imediatamente a todo o dashboard e salvo no seu perfil de usuário.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className={buttonPrimaryClass}>
                  Salvar Preferências de Tema
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModuleBlock>
  );
}

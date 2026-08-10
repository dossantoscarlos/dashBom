"use client";

import { useEffect, useState } from "react";

export type PushNotificationItem = {
  id: string;
  type: "agenda" | "tse" | "sistema";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
};

const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: "notif-01",
    type: "agenda",
    title: "🗓️ Lembrete de Agenda",
    message: "Evento em 30 min: Caminhada e Panfletagem na Zona Norte (Av. Tucuruvi, 450).",
    timestamp: "Agora mesmo",
    read: false,
  },
  {
    id: "notif-02",
    type: "tse",
    title: "🏛️ Atualização TSE / TRE",
    message: "Novo boletim oficial: DivulgaCandContas liberou o painel de receita de campanhas.",
    timestamp: "Há 12 min",
    read: false,
  },
  {
    id: "notif-03",
    type: "tse",
    title: "⚖️ Urnas Eletrônicas UE2026",
    message: "Relatório de auditoria criptográfica de código-fonte concluído com 100% de aprovação.",
    timestamp: "Há 45 min",
    read: false,
  },
];

export function PushNotifier() {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<PushNotificationItem | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  // Verifica permissão nativa de Web Push Notifications do Navegador
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Solicita permissão para Notificações Push nativas
  async function requestPushPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === "granted") {
        new Notification("Notificações Push Ativadas", {
          body: "Você receberá alertas em tempo real sobre eventos da agenda e atualizações do TSE/TRE.",
          icon: "🔔",
        });
      }
    }
  }

  // Simulação de recebimento de notificações Push em tempo real (agenda & TSE)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotif: PushNotificationItem = {
        id: `notif-${Date.now()}`,
        type: "tse",
        title: "🔴 Alerta ao Vivo TSE / TRE",
        message: "O TSE registrou novo lote de prestação de contas de candidatos no sistema CAND.",
        timestamp: "Agora",
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setToast(newNotif);

      // Dispara Web Push Nativo do Navegador se permitido
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(newNotif.title, {
          body: newNotif.message,
        });
      }

      // Oculta o toast em 6 segundos
      setTimeout(() => setToast(null), 6000);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="relative">
      {/* BOTÃO DO SINO DE NOTIFICAÇÕES NA HEADER DA WORKSPACE */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20 active:scale-95 text-sm"
        title="Notificações Push (Agenda & TSE)"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-[#154f85] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* PAINEL DROP DOWN DAS NOTIFICAÇÕES PUSH */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 z-50 overflow-hidden text-xs font-sans text-zinc-900 dark:text-zinc-100">
          
          {/* Cabeçalho do Painel */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 p-3.5 bg-zinc-50 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <h3 className="font-extrabold uppercase tracking-wider text-[11px] text-zinc-800 dark:text-zinc-200">
                Central de Push Notifier (Agenda & TSE)
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Marcar lidas
              </button>
            )}
          </div>

          {/* Ativação de Notificações do Navegador */}
          {pushPermission !== "granted" && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-2">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                Permitir popups de push no computador?
              </span>
              <button
                type="button"
                onClick={requestPushPermission}
                className="bg-amber-600 text-white font-extrabold text-[9px] px-2.5 py-1 rounded hover:bg-amber-700 transition shrink-0"
              >
                Ativar Push
              </button>
            </div>
          )}

          {/* Lista de Notificações */}
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-850 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-zinc-400 italic text-[11px]">Nenhuma notificação recebida.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 flex flex-col gap-1 transition cursor-pointer ${
                    n.read ? "bg-white dark:bg-zinc-950 opacity-70" : "bg-blue-50/40 dark:bg-blue-950/20 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold ${n.type === "agenda" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {n.title}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-850 text-center text-[9px] text-zinc-400 font-medium">
            Monitoramento constante de compromissos e diário oficial do TSE
          </div>
        </div>
      )}

      {/* TOAST POPUP FLUTUANTE DE NOTIFICAÇÃO PUSH NA TELA */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex w-80 sm:w-96 items-start gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl dark:border-blue-900 dark:bg-zinc-950 animate-bounce">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-lg shrink-0">
            {toast.type === "agenda" ? "🗓️" : "🏛️"}
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-blue-950 dark:text-blue-200 truncate">
                {toast.title}
              </h4>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-350 leading-tight">
              {toast.message}
            </p>
            <span className="text-[8px] text-emerald-600 font-mono font-bold mt-1">
              Push Notifier • Alerta em Tempo Real
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

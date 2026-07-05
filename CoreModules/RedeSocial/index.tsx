"use client";

import { useState } from "react";
import { ModuleBlock } from "@/components/dashboard/ModuleBlock";
import { useToast } from "@/components/dashboard/Toast";
import { inputClass, labelClass, buttonPrimaryClass } from "@/components/dashboard/form-styles";

export function RedeSocialPanel() {
  const { toast } = useToast();
  const [numero, setNumero] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!numero.trim()) {
      toast("O número de telefone é obrigatório.", "error");
      return;
    }

    if (!mensagem.trim()) {
      toast("A mensagem é obrigatória.", "error");
      return;
    }

    // Clean number to keep only digits
    const cleanNumber = numero.replace(/\D/g, "");

    if (cleanNumber.length < 8) {
      toast("Digite um número de telefone válido (com DDD/DDI).", "error");
      return;
    }

    // Construct WhatsApp URI and open in a new tab
    const encodedMessage = encodeURIComponent(mensagem);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast("Direcionando para o WhatsApp...", "success");
  };

  return (
    <ModuleBlock title="Rede Social" icon="💬">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-md transition-all dark:border-zinc-800 dark:bg-zinc-950/80">
          
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl text-emerald-500">
              💬
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Disparador de Mensagem WhatsApp
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Preencha os campos abaixo para abrir a conversa no WhatsApp automaticamente. O número digitado será higienizado (somente números).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="whatsapp-number" className={labelClass}>
                Número do Celular
              </label>
              <input
                id="whatsapp-number"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex: +55 (11) 99999-9999"
                className={inputClass}
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Lembre-se de incluir o DDI (Ex: 55 para o Brasil) e o DDD.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsapp-message" className={labelClass}>
                Mensagem
              </label>
              <textarea
                id="whatsapp-message"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite o texto que deseja enviar..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              className={`${buttonPrimaryClass} w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500`}
            >
              <span>🚀</span> Enviar via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </ModuleBlock>
  );
}

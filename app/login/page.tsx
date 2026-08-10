import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { CampaignProLogo } from "./components/CampaignProLogo";
import { CampaignDecorations } from "./components/CampaignDecorations";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/modulos");

  return (
    <main className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-x-hidden">
      {/* Container Principal Ajustado e Compacto */}
      <div className="w-full max-w-[1240px] lg:max-h-[680px] rounded-[16px] bg-white shadow-xl overflow-hidden flex flex-col lg:flex-row border border-slate-200/70">
        
        {/* Painel Institucional Esquerdo (44.5%) */}
        <section className="w-full lg:w-[44.5%] min-h-[220px] lg:min-h-[640px] bg-gradient-to-br from-[#071F3D] via-[#092A50] to-[#05162D] relative overflow-hidden flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-8 lg:py-12 text-white shrink-0">
          <CampaignDecorations />

          <div className="relative z-10 flex flex-col gap-5 sm:gap-6 lg:gap-8 max-w-[460px]">
            {/* Marca campanhaPRO */}
            <CampaignProLogo />

            {/* Título e Subtítulo */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.15]">
                Bem-vindo de volta
              </h1>
              <p className="text-sm sm:text-base lg:text-[20px] font-normal text-white/80 tracking-normal leading-relaxed">
                Acesse o centro de comando da sua campanha.
              </p>
            </div>
          </div>
        </section>

        {/* Painel de Autenticação Direito (55.5%) */}
        <section className="w-full lg:w-[55.5%] bg-white flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}

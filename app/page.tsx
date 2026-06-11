import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            CampanhaPro
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gestão de Campanha Eleitoral
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {session
              ? `Olá, ${session.name}! Acesse o painel para gerenciar sua campanha.`
              : "Faça login para acessar o painel de campanha."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Abrir painel
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Entrar
            </Link>
          )}
        </div>

        {!session && (
          <p className="text-xs text-zinc-500">
            Demo: admin@example.com / password123
          </p>
        )}
      </main>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Acesse sua conta para continuar
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  );
}

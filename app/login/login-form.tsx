"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 017.68 2.937M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-.54 1.722-1.572 3.23-2.942 4.385M3 3l18 18"
      />
    </svg>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <form action={formAction} className="w-full max-w-[460px] flex flex-col gap-4.5">
      {/* Campo E-mail */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-[#0F172A]"
        >
          E-mail
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-[#64748B]">
            <MailIcon className="h-5 w-5" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="seu@email.com"
            className="h-[52px] w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-12 pr-4 text-sm sm:text-base text-[#0F172A] placeholder-[#94A3B8] outline-none transition focus:border-[#008E66] focus:ring-2 focus:ring-[#008E66]/20"
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-[#0F172A]"
        >
          Senha
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-[#64748B]">
            <LockIcon className="h-5 w-5" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
            className="h-[52px] w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-12 pr-12 text-sm sm:text-base text-[#0F172A] placeholder-[#94A3B8] outline-none transition focus:border-[#008E66] focus:ring-2 focus:ring-[#008E66]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-4 text-[#64748B] hover:text-[#0F172A] transition focus:outline-none"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Checkbox Lembrar acesso */}
      <div className="flex items-center gap-2.5 pt-0.5">
        <input
          id="remember"
          name="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-[#CBD5E1] text-[#008E66] accent-[#008E66] focus:ring-[#008E66] cursor-pointer"
        />
        <label
          htmlFor="remember"
          className="cursor-pointer text-sm font-medium text-[#0F172A] select-none"
        >
          Lembrar acesso
        </label>
      </div>

      {/* Alerta de erro */}
      {state.error && (
        <div className="rounded-[9px] bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      {/* Botão Principal */}
      <button
        type="submit"
        disabled={isPending}
        className="h-[52px] w-full rounded-[10px] bg-gradient-to-r from-[#008E66] to-[#00A878] hover:from-[#007D59] hover:to-[#00976C] text-base font-bold text-white shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Entrando...</span>
          </>
        ) : (
          "Entrar no sistema"
        )}
      </button>
    </form>
  );
}

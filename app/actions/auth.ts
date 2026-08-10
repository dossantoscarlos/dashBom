"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { validateCredentials } from "@/lib/users";

export type LoginState = {
  error?: string;
};

type LaravelLoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    roleId?: string;
    roleName?: string;
    supportLevel?: string | null;
    permissions?: string[];
  };
};

function getLaravelApiUrl(): string {
  const url = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function authenticateWithLaravel(
  email: string,
  password: string,
): Promise<LaravelLoginResponse["user"] | null> {
  const response = await fetch(getLaravelApiUrl() + "/api/auth/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 422) return null;

  if (!response.ok) {
    throw new Error("Laravel auth failed with status " + response.status);
  }

  const data = (await response.json()) as LaravelLoginResponse;
  return data.user;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  let user: LaravelLoginResponse["user"] | null = null;
  try {
    user = await authenticateWithLaravel(email, password);
  } catch {
    // Servidor Laravel indisponível localmente, tentar validação local de demonstração
  }

  if (!user) {
    const localUser = validateCredentials(email, password);
    if (localUser) {
      user = {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        roleId: "role-admin",
        roleName: "Administrador",
        supportLevel: "N1",
        permissions: ["*"],
      };
    }
  }

  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.roleName,
    supportLevel: user.supportLevel,
    permissions: user.permissions ?? [],
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/modulos");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

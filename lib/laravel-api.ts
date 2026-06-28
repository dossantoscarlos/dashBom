type LaravelRequestInit = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
};

function getLaravelApiUrl(): string {
  return (process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/+$/,
    "",
  );
}

export async function laravelApi<T>(
  path: string,
  init: LaravelRequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...init.headers,
  };

  if (process.env.ACL_INTERNAL_SECRET) {
    headers["X-Internal-Secret"] = process.env.ACL_INTERNAL_SECRET;
  }

  const response = await fetch(`${getLaravelApiUrl()}${path}`, {
    ...init,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Laravel API ${response.status}: ${message}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}


import type { PortfolioContent } from "./types";

const apiAdresse = import.meta.env.VITE_API_URL ?? "";

interface CsrfSvar {
  token: string;
}

// Alle kall til backend går gjennom denne
async function apiKall<T>(sti: string, valg: RequestInit = {}): Promise<T> {
  const metode = (valg.method ?? "GET").toUpperCase();
  const headere = new Headers(valg.headers);

  if (valg.body) {
    headere.set("Content-Type", "application/json");
  }

  // Ved endringer i databasen må vi sende med CSRF-token
  if (!["GET", "HEAD", "OPTIONS"].includes(metode)) {
    const csrfSvar = await fetch(`${apiAdresse}/api/auth/csrf`, {
      credentials: "include",
      cache: "no-store"
    });

    if (!csrfSvar.ok) {
      throw new Error("Kunne ikke hente sikkerhetstoken.");
    }

    const csrf: CsrfSvar = await csrfSvar.json();
    headere.set("X-CSRF-TOKEN", csrf.token);
  }

  const svar = await fetch(`${apiAdresse}${sti}`, {
    ...valg,
    headers: headere,
    credentials: "include",
    cache: "no-store"
  });

  if (!svar.ok) {
    let feilMelding = `HTTP ${svar.status}`;

    try {
      const data = await svar.json();

      feilMelding = typeof data === "string"
        ? data
        : data.message ?? data.title ?? feilMelding;
    } catch {
      // Ikke alle feil fra API-et kommer som JSON
    }

    throw new Error(feilMelding);
  }

  if (svar.status === 204) return undefined as T;

  return svar.json() as Promise<T>;
}

// Funksjoner som brukes i App.tsx og Admin.tsx
export const api = {
  content: () => apiKall<PortfolioContent>("/api/content"),

  me: () => apiKall<{ authenticated: boolean }>("/api/auth/me"),

  login: (email: string, password: string) =>
    apiKall<{ authenticated: boolean }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  logout: () => apiKall<void>("/api/auth/logout", {
    method: "POST"
  }),

  create: <T>(resource: string, payload: T) =>
    apiKall<{ id: number }>(`/api/admin/${resource}`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  update: <T>(resource: string, id: number, payload: T) =>
    apiKall<void>(`/api/admin/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  remove: (resource: string, id: number) =>
    apiKall<void>(`/api/admin/${resource}/${id}`, {
      method: "DELETE"
    })
};

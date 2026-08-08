export function getTokenPayload(): { sub?: string; id?: number } | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getUsuarioId(): number | null {
  return getTokenPayload()?.id ?? null;
}

export function getUsuarioEmail(): string | null {
  return getTokenPayload()?.sub ?? null;
}